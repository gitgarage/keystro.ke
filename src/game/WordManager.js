/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import {
    ERROR_FLASH_DURATION_MS,
    FAST_WORD_SPEED,
    MAX_ACTIVE_WORDS,
    MAX_POWER_UP_SPEED,
    MAX_WORD_SPEED,
    MAX_WORD_Y_RATIO,
    MIN_POWER_UP_SPEED,
    MIN_WORD_SPEED,
    MIN_WORD_Y_RATIO,
    POWER_UP_SPAWN_CHANCE,
    POWER_UP_WORD_POOL,
    SLOW_WORD_SPEED,
    WORD_EXIT_X,
    WORD_POOL,
    WORD_SPAWN_OFFSET_X
} from "./constants.js";

/**
 * ============================================================================
 * WordManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns the lifecycle of moving word targets.
 *
 * Power-up words are still word targets. They use the same typing rules, but
 * carry a different target type so scoring and styling can treat them specially.
 *
 * WordManager also exposes a clear operation for removing all targets when a
 * session ends.
 * ============================================================================
 */

export class WordManager {
    constructor({
        wordLayer,
        onWordCompleted,
        onIncorrectLetter,
        onWordEscaped
    }) {
        this.wordLayer = wordLayer;

        this.onWordCompleted = onWordCompleted;
        this.onIncorrectLetter = onIncorrectLetter;
        this.onWordEscaped = onWordEscaped;

        this.activeWords = [];
        this.activeTarget = null;
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
        const shouldTryPowerUp = Math.random() < POWER_UP_SPAWN_CHANCE;

        if (shouldTryPowerUp) {
            const powerUpText = this.chooseWordFromPool(POWER_UP_WORD_POOL);

            if (powerUpText) {
                return {
                    text: powerUpText,
                    type: "power-up"
                };
            }
        }

        const normalText = this.chooseWordFromPool(WORD_POOL);

        if (!normalText) {
            return null;
        }

        return {
            text: normalText,
            type: "normal"
        };
    }

    createWordElement(wordTarget, speed) {
        const element = document.createElement("span");

        element.className = "word-target";
        element.textContent = wordTarget.text;

        if (wordTarget.type === "power-up") {
            element.classList.add("is-power-up");
        }

        if (speed > FAST_WORD_SPEED) {
            element.classList.add("is-fast");
        } else if (speed < SLOW_WORD_SPEED) {
            element.classList.add("is-slow");
        }

        return element;
    }

    chooseSpeedForTarget(wordTarget) {
        if (wordTarget.type === "power-up") {
            return (
                MIN_POWER_UP_SPEED +
                Math.random() * (MAX_POWER_UP_SPEED - MIN_POWER_UP_SPEED)
            );
        }

        return (
            MIN_WORD_SPEED +
            Math.random() * (MAX_WORD_SPEED - MIN_WORD_SPEED)
        );
    }

    spawnWord() {
        if (this.activeWords.length >= MAX_ACTIVE_WORDS) {
            return;
        }

        const wordTarget = this.chooseWordTarget();

        if (!wordTarget) {
            return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const speed = this.chooseSpeedForTarget(wordTarget);

        const y =
            viewportHeight *
            (
                MIN_WORD_Y_RATIO +
                Math.random() * (MAX_WORD_Y_RATIO - MIN_WORD_Y_RATIO)
            );

        const x = viewportWidth + WORD_SPAWN_OFFSET_X;

        const element = this.createWordElement(wordTarget, speed);

        this.wordLayer.appendChild(element);

        this.activeWords.push({
            text: wordTarget.text,
            type: wordTarget.type,
            progress: 0,
            isPerfect: true,
            x,
            y,
            speed,
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

    /**
     * Removes every active word without reporting escape events.
     *
     * Session cleanup is not gameplay failure. Remaining targets disappear when
     * time expires without breaking combo or altering final statistics.
     */
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
                `translate3d(${word.x}px, ${word.y}px, 0)`;

            if (word.x < WORD_EXIT_X) {
                this.onWordEscaped(word);
                this.removeWord(word);
            }
        }
    }
}