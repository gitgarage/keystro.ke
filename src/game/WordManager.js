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
import { OrganismProfileFactory } from "./OrganismProfileFactory.js";
import { OrganismRenderer } from "./OrganismRenderer.js";

/**
 * ============================================================================
 * WordManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns the lifecycle and gameplay state of moving word targets.
 *
 * WordManager receives stage configuration instead of owning global word pools
 * directly. This keeps themed vocabulary and stage tuning out of the core word
 * lifecycle code.
 *
 * Stable organism presentation, movement, and organelle profiles are created
 * by OrganismProfileFactory when targets spawn.
 *
 * OrganismRenderer owns the DOM structure and presentation updates for organism
 * targets.
 *
 * WordManager remains responsible for target selection, spawning, gameplay
 * state, typed progress, movement calculation, target removal, and stage-end
 * organism settling.
 *
 * Each target stores its natural base speed. The current stage progression
 * phase supplies live pressure values during gameplay so every organism
 * responds to changing stage pressure together.
 * ============================================================================
 */

export class WordManager {
    constructor({
        wordLayer,
        stage,
        onCorrectLetter,
        onWordCompleted,
        onIncorrectLetter,
        onWordEscaped
    }) {
        this.wordLayer = wordLayer;
        this.stage = stage;

        this.onCorrectLetter = onCorrectLetter;
        this.onWordCompleted = onWordCompleted;
        this.onIncorrectLetter = onIncorrectLetter;
        this.onWordEscaped = onWordEscaped;

        this.organismProfileFactory = new OrganismProfileFactory();

        this.organismRenderer = new OrganismRenderer({
            tuning: this.tuning
        });

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

        const normalText = this.chooseWordFromPool(
            this.stage.wordPool
        );

        if (!normalText) {
            return null;
        }

        return {
            text: normalText,
            type: "normal"
        };
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
                (
                    this.tuning.maxWordSpeed -
                    this.tuning.minWordSpeed
                )
        );
    }

    createWord(
        progressionPhase = {},
        initialX = null
    ) {
        const maxActiveWords =
            progressionPhase.maxActiveWords ??
            this.tuning.maxActiveWords;

        if (this.activeWords.length >= maxActiveWords) {
            return null;
        }

        const wordTarget = this.chooseWordTarget();

        if (!wordTarget) {
            return null;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const baseSpeed =
            this.chooseSpeedForTarget(wordTarget);

        const organismProfile =
            this.organismProfileFactory.createProfile();

        const presentationProfile = organismProfile.presentation;
        const movementProfile = organismProfile.movement;
        const organelleProfiles = organismProfile.organelles;

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

        const x =
            initialX ??
            (
                viewportWidth +
                this.tuning.wordSpawnOffsetX
            );

        const element = this.organismRenderer.createElement({
            wordTarget,
            speed: baseSpeed,
            presentationProfile,
            organelleProfiles
        });

        this.wordLayer.appendChild(element);

        const word = {
            text: wordTarget.text,
            type: wordTarget.type,
            progress: 0,
            isPerfect: true,
            x,
            baseY: y,
            baseSpeed,
            presentationProfile,
            movementProfile,
            organelleProfiles,
            element
        };

        this.activeWords.push(word);

        return word;
    }

    spawnWord(progressionPhase = {}) {
        this.createWord(progressionPhase);
    }

    seedInitialWords(progressionPhase = {}) {
        const viewportWidth = window.innerWidth;

        for (
            let index = 0;
            index < this.tuning.initialSpawnCount;
            index += 1
        ) {
            const xRatio =
                this.tuning.initialSpawnMinXRatio +
                Math.random() *
                    (
                        this.tuning.initialSpawnMaxXRatio -
                        this.tuning.initialSpawnMinXRatio
                    );

            const initialX = viewportWidth * xRatio;

            const word = this.createWord(
                progressionPhase,
                initialX
            );

            if (!word) {
                break;
            }

            this.organismRenderer.renderPosition(
                word,
                word.baseY
            );
        }
    }

    setActiveTarget(word) {
        this.activeTarget = word;

        word.element.classList.add("is-active");

        this.organismRenderer.renderProgress(word);

        for (const otherWord of this.activeWords) {
            if (otherWord !== word) {
                otherWord.element.classList.add("is-muted");
            }
        }
    }

    clearActiveTarget() {
        this.activeTarget = null;

        for (const word of this.activeWords) {
            word.element.classList.remove(
                "is-active",
                "is-muted"
            );
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

    getActiveWords() {
        return [...this.activeWords];
    }

    settleWords() {
        this.activeTarget = null;

        for (const word of this.activeWords) {
            word.element.classList.remove(
                "is-active",
                "is-muted",
                "has-error"
            );

            word.element.style.pointerEvents = "none";

            word.element.classList.add("is-settling");
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
            return (
                word.progress === 0 &&
                word.text.startsWith(letter)
            );
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
            this.activeTarget.text[
                this.activeTarget.progress
            ];

        if (letter !== expectedLetter) {
            this.activeTarget.isPerfect = false;
            this.flashWordError(this.activeTarget);
            this.onIncorrectLetter();

            return;
        }

        this.activeTarget.progress += 1;

        this.onCorrectLetter();

        this.organismRenderer.renderProgress(
            this.activeTarget
        );

        if (
            this.activeTarget.progress >=
            this.activeTarget.text.length
        ) {
            const completedWord = this.activeTarget;

            this.onWordCompleted(completedWord);
            this.removeWord(completedWord);
        }
    }

    update(deltaSeconds, progressionPhase = {}) {
        const speedMultiplier =
            progressionPhase.speedMultiplier ?? 1;

        for (
            let index = this.activeWords.length - 1;
            index >= 0;
            index -= 1
        ) {
            const word = this.activeWords[index];
            const movement = word.movementProfile;

            const currentSpeed =
                word.baseSpeed * speedMultiplier;

            word.x -= currentSpeed * deltaSeconds;
            movement.elapsedSeconds += deltaSeconds;

            const verticalOffset =
                Math.sin(
                    movement.verticalPhase +
                    movement.elapsedSeconds *
                        movement.verticalFrequency
                ) *
                movement.verticalAmplitude;

            const renderedY =
                word.baseY + verticalOffset;

            this.organismRenderer.renderPosition(
                word,
                renderedY
            );

            if (word.x < this.tuning.wordExitX) {
                this.onWordEscaped(word);
                this.removeWord(word);
            }
        }
    }
}