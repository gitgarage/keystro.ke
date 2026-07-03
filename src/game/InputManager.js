/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

/**
 * ============================================================================
 * InputManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns browser keyboard input for the typing game.
 *
 * Responsibilities include:
 *
 * - listening for key presses
 * - rejecting unsupported keyboard input
 * - normalizing accepted letters
 * - forwarding typed letters to the game
 *
 * This class intentionally does NOT:
 *
 * - select word targets
 * - validate letters against words
 * - move words
 * - calculate score
 * - render graphics
 *
 * Those responsibilities belong to other game systems.
 * ============================================================================
 */

export class InputManager {
    constructor(onLetterTyped) {
        this.onLetterTyped = onLetterTyped;

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Begins listening for browser keyboard events.
     */
    start() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    /**
     * Stops listening for browser keyboard events.
     *
     * The first demo does not currently stop and restart sessions, but exposing
     * this operation now gives the game a clean lifecycle boundary.
     */
    stop() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    /**
     * Filters a browser key event down to plain English alphabetic input.
     *
     * Modifier combinations are ignored so browser and operating-system
     * shortcuts do not accidentally become gameplay input.
     */
    handleKeyDown(event) {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        if (event.key.length !== 1) {
            return;
        }

        const letter = event.key.toLowerCase();

        if (!/^[a-z]$/.test(letter)) {
            return;
        }

        this.onLetterTyped(letter);
    }
}