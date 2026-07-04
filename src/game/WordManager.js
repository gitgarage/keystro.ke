/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { ERROR_FLASH_DURATION_MS } from "./constants.js";

/**
 * ============================================================================
 * WordManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns the lifecycle of moving word targets.
 *
 * WordManager receives stage configuration instead of owning global word pools
 * directly. This keeps themed vocabulary and stage tuning out of the core word
 * lifecycle code.
 *
 * Each spawned target also receives a small set of stable presentation values.
 * These values allow themed CSS to make a population feel varied without
 * changing gameplay behavior or introducing per-frame visual randomness.
 *
 * Amoeba targets also receive a stable membrane animation duration and phase.
 * CSS owns the deformation itself so the game loop remains focused on gameplay
 * movement rather than decorative animation.
 * ============================================================================
 */

export class WordManager {
    constructor({
        wordLayer,
        stage,
        onWordCompleted,
        onIncorrectLetter,
        onWordEscaped
    }) {
        this.wordLayer = wordLayer;
        this.stage = stage;

        this.onWordCompleted = onWordCompleted;
        this.onIncorrectLetter = onIncorrectLetter;
        this.onWordEscaped = onWordEscaped;

        this.activeWords = [];
        this.activeTarget = null;
    }

    get tuning() {
        return this.stage.tuning;
    }

    getReservedStartingLetters() {
        return new Set(
            this.activeWords
                .filter((word) => word.progress === 0)
                .map((word) => word.text[0])
        );
    }

    chooseWordFromPool(wordPool) {
        const reservedLetters = this.getReservedStartingLetters();

        const availableWords = wordPool.filter((word) => {
            return !reservedLetters.has(word[0]);
        });

        if (availableWords.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * availableWords.length);

        return availableWords[index];
    }

    chooseWordTarget() {
        const shouldTryPowerUp =
            Math.random() < this.tuning.powerUpSpawnChance;

        if (shouldTryPowerUp) {
            const powerUpText = this.chooseWordFromPool(
                this.stage.powerUpWordPool
            );

            if (powerUpText) {
                return {
                    text: powerUpText,
                    type: "power-up"
                };
            }
        }

        const normalText = this.chooseWordFromPool(this.stage.wordPool);

        if (!normalText) {
            return null;
        }

        return {
            text: normalText,
            type: "normal"
        };
    }

    createPresentationProfile() {
        const membraneDurationSeconds = 7 + Math.random() * 7;

        return {
            scaleX: 0.9 + Math.random() * 0.24,
            scaleY: 0.88 + Math.random() * 0.26,
            rotationDegrees: -4 + Math.random() * 8,
            radiusOne: 42 + Math.random() * 16,
            radiusTwo: 42 + Math.random() * 16,
            radiusThree: 42 + Math.random() * 16,
            radiusFour: 42 + Math.random() * 16,
            membraneOpacity: 0.38 + Math.random() * 0.24,
            membraneDurationSeconds,
            membraneDelaySeconds:
                -Math.random() * membraneDurationSeconds
        };
    }

    applyPresentationProfile(element, profile) {
        element.style.setProperty(
            "--organism-scale-x",
            profile.scaleX.toFixed(3)
        );

        element.style.setProperty(
            "--organism-scale-y",
            profile.scaleY.toFixed(3)
        );

        element.style.setProperty(
            "--organism-rotation",
            `${profile.rotationDegrees.toFixed(2)}deg`
        );

        element.style.setProperty(
            "--organism-radius-one",
            `${profile.radiusOne.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-radius-two",
            `${profile.radiusTwo.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-radius-three",
            `${profile.radiusThree.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-radius-four",
            `${profile.radiusFour.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-membrane-opacity",
            profile.membraneOpacity.toFixed(3)
        );

        element.style.setProperty(
            "--organism-membrane-duration",
            `${profile.membraneDurationSeconds.toFixed(2)}s`
        );

        element.style.setProperty(
            "--organism-membrane-delay",
            `${profile.membraneDelaySeconds.toFixed(2)}s`
        );
    }

    createWordElement(wordTarget, speed, presentationProfile) {
        const element = document.createElement("span");

        element.className = "word-target";
        element.textContent = wordTarget.text;

        this.applyPresentationProfile(element, presentationProfile);

        if (wordTarget.type === "power-up") {
            element.classList.add("is-power-up");
        }

        if (speed > this.tuning.fastWordSpeed) {
            element.classList.add("is-fast");
        } else if (speed < this.tuning.slowWordSpeed) {
            element.classList.add("is-slow");
        }

        return element;
    }

    chooseSpeedForTarget(wordTarget) {
        if (wordTarget.type === "power-up") {
            return (
                this.tuning.minPowerUpSpeed +
                Math.random() *
                    (
                        this.tuning.maxPowerUpSpeed -
                        this.tuning.minPowerUpSpeed
                    )
            );
        }

        return (
            this.tuning.minWordSpeed +
            Math.random() *
                (this.tuning.maxWordSpeed - this.tuning.minWordSpeed)
        );
    }

    spawnWord() {
        if (this.activeWords.length >= this.tuning.maxActiveWords) {
            return;
        }

        const wordTarget = this.chooseWordTarget();

        if (!wordTarget) {
            return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const speed = this.chooseSpeedForTarget(wordTarget);
        const presentationProfile = this.createPresentationProfile();

        const y =
            viewportHeight *
            (
                this.tuning.minWordYRatio +
                Math.random() *
                    (
                        this.tuning.maxWordYRatio -
                        this.tuning.minWordYRatio
                    )
            );

        const x = viewportWidth + this.tuning.wordSpawnOffsetX;

        const element = this.createWordElement(
            wordTarget,
            speed,
            presentationProfile
        );

        this.wordLayer.appendChild(element);

        this.activeWords.push({
            text: wordTarget.text,
            type: wordTarget.type,
            progress: 0,
            isPerfect: true,
            x,
            y,
            speed,
            presentationProfile,
            element
        });
    }

    renderWordProgress(word) {
        const typedText = word.text.slice(0, word.progress);
        const remainingText = word.text.slice(word.progress);

        word.element.replaceChildren();

        const typedElement = document.createElement("span");
        const remainingElement = document.createElement("span");

        typedElement.className = "word-typed";
        typedElement.textContent = typedText;

        remainingElement.className = "word-remaining";
        remainingElement.textContent = remainingText;

        word.element.append(typedElement, remainingElement);
    }

    setActiveTarget(word) {
        this.activeTarget = word;

        word.element.classList.add("is-active");

        this.renderWordProgress(word);

        for (const otherWord of this.activeWords) {
            if (otherWord !== word) {
                otherWord.element.classList.add("is-muted");
            }
        }
    }

    clearActiveTarget() {
        this.activeTarget = null;

        for (const word of this.activeWords) {
            word.element.classList.remove("is-active", "is-muted");
        }
    }

    removeWord(word) {
        const index = this.activeWords.indexOf(word);

        if (index !== -1) {
            this.activeWords.splice(index, 1);
        }

        word.element.remove();

        if (this.activeTarget === word) {
            this.clearActiveTarget();
        }
    }

    clearWords() {
        for (const word of this.activeWords) {
            word.element.remove();
        }

        this.activeWords = [];
        this.activeTarget = null;
    }

    findTargetForLetter(letter) {
        return this.activeWords.find((word) => {
            return word.progress === 0 && word.text.startsWith(letter);
        });
    }

    flashWordError(word) {
        word.element.classList.add("has-error");

        window.setTimeout(() => {
            word.element.classList.remove("has-error");
        }, ERROR_FLASH_DURATION_MS);
    }

    handleTypedLetter(letter) {
        if (!this.activeTarget) {
            const target = this.findTargetForLetter(letter);

            if (!target) {
                return;
            }

            this.setActiveTarget(target);
        }

        const expectedLetter =
            this.activeTarget.text[this.activeTarget.progress];

        if (letter !== expectedLetter) {
            this.activeTarget.isPerfect = false;
            this.flashWordError(this.activeTarget);
            this.onIncorrectLetter();

            return;
        }

        this.activeTarget.progress += 1;

        this.renderWordProgress(this.activeTarget);

        if (this.activeTarget.progress >= this.activeTarget.text.length) {
            const completedWord = this.activeTarget;

            this.onWordCompleted(completedWord);
            this.removeWord(completedWord);
        }
    }

    update(deltaSeconds) {
        for (
            let index = this.activeWords.length - 1;
            index >= 0;
            index -= 1
        ) {
            const word = this.activeWords[index];

            word.x -= word.speed * deltaSeconds;

            word.element.style.transform =
                `translate3d(${word.x}px, ${word.y}px, 0) ` +
                `rotate(${word.presentationProfile.rotationDegrees}deg) ` +
                `scaleX(${word.presentationProfile.scaleX}) ` +
                `scaleY(${word.presentationProfile.scaleY})`;

            if (word.x < this.tuning.wordExitX) {
                this.onWordEscaped(word);
                this.removeWord(word);
            }
        }
    }
}