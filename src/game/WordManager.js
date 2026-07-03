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
    MAX_WORD_SPEED,
    MAX_WORD_Y_RATIO,
    MIN_WORD_SPEED,
    MIN_WORD_Y_RATIO,
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
 * Responsibilities include:
 *
 * - selecting available words
 * - reserving starting letters
 * - spawning word targets
 * - moving active words
 * - locking onto a selected target
 * - tracking progress through the active target
 * - removing completed and offscreen words
 *
 * This class intentionally does NOT:
 *
 * - listen directly to the keyboard
 * - own the main animation frame
 * - calculate combo or score
 * - play sounds
 * - create particle effects
 *
 * Those responsibilities belong to other game systems.
 * ============================================================================
 */

export class WordManager {
    constructor(wordLayer) {
        this.wordLayer = wordLayer;
        this.activeWords = [];
        this.activeTarget = null;
    }

    /**
     * Returns the first letters currently reserved by untargeted words.
     *
     * A visible word must not compete with another available word for the same
     * starting key. This keeps target selection visually unambiguous.
     */
    getReservedStartingLetters() {
        return new Set(
            this.activeWords
                .filter((word) => word.progress === 0)
                .map((word) => word.text[0])
        );
    }

    /**
     * Selects a random word whose starting letter is currently available.
     *
     * Returning null is valid. It means the current word pool cannot safely
     * produce another target without creating an ambiguous starting letter.
     */
    chooseWord() {
        const reservedLetters = this.getReservedStartingLetters();

        const availableWords = WORD_POOL.filter((word) => {
            return !reservedLetters.has(word[0]);
        });

        if (availableWords.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * availableWords.length);

        return availableWords[index];
    }

    /**
     * Creates the DOM element used to display a word target.
     */
    createWordElement(wordText, speed) {
        const element = document.createElement("span");

        element.className = "word-target";
        element.textContent = wordText;

        if (speed > FAST_WORD_SPEED) {
            element.classList.add("is-fast");
        } else if (speed < SLOW_WORD_SPEED) {
            element.classList.add("is-slow");
        }

        return element;
    }

    /**
     * Creates one new word target just beyond the right edge of the viewport.
     */
    spawnWord() {
        if (this.activeWords.length >= MAX_ACTIVE_WORDS) {
            return;
        }

        const wordText = this.chooseWord();

        if (!wordText) {
            return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const speed =
            MIN_WORD_SPEED +
            Math.random() * (MAX_WORD_SPEED - MIN_WORD_SPEED);

        const y =
            viewportHeight *
            (
                MIN_WORD_Y_RATIO +
                Math.random() * (MAX_WORD_Y_RATIO - MIN_WORD_Y_RATIO)
            );

        const x = viewportWidth + WORD_SPAWN_OFFSET_X;

        const element = this.createWordElement(wordText, speed);

        this.wordLayer.appendChild(element);

        this.activeWords.push({
            text: wordText,
            progress: 0,
            x,
            y,
            speed,
            element
        });
    }

    /**
     * Updates the visual text of a partially typed word.
     */
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

    /**
     * Locks gameplay input onto one word target.
     */
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

    /**
     * Releases the current target and restores normal word visibility.
     */
    clearActiveTarget() {
        this.activeTarget = null;

        for (const word of this.activeWords) {
            word.element.classList.remove("is-active", "is-muted");
        }
    }

    /**
     * Removes a word from both gameplay state and the document.
     */
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
     * Finds an available word whose first letter matches typed input.
     */
    findTargetForLetter(letter) {
        return this.activeWords.find((word) => {
            return word.progress === 0 && word.text.startsWith(letter);
        });
    }

    /**
     * Briefly displays error feedback on a specific word.
     */
    flashWordError(word) {
        word.element.classList.add("has-error");

        window.setTimeout(() => {
            word.element.classList.remove("has-error");
        }, ERROR_FLASH_DURATION_MS);
    }

    /**
     * Applies one accepted keyboard letter to the word targeting system.
     */
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
            this.flashWordError(this.activeTarget);

            return;
        }

        this.activeTarget.progress += 1;

        this.renderWordProgress(this.activeTarget);

        if (this.activeTarget.progress >= this.activeTarget.text.length) {
            this.removeWord(this.activeTarget);
        }
    }

    /**
     * Moves active words according to elapsed frame time.
     */
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
                this.removeWord(word);
            }
        }
    }
}