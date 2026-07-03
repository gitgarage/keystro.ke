/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { SESSION_DURATION_SECONDS } from "./constants.js";

/**
 * ============================================================================
 * SessionManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns the lifecycle and statistics of one playable typing session.
 *
 * Responsibilities include:
 *
 * - tracking whether a session is active
 * - tracking elapsed session time
 * - calculating visible remaining time
 * - tracking completed words
 * - tracking perfect words
 * - tracking incorrect typed letters
 * - requesting session completion when time expires
 *
 * This class intentionally does NOT:
 *
 * - own the animation frame
 * - spawn or move word targets
 * - calculate score
 * - interpret keyboard events
 * - render the final results screen
 *
 * Game coordinates the session with the other gameplay systems.
 * ============================================================================
 */

export class SessionManager {
    constructor({ timerValue, onSessionEnded }) {
        this.timerValue = timerValue;
        this.onSessionEnded = onSessionEnded;

        this.isActive = false;
        this.elapsedSeconds = 0;
        this.completedWords = 0;
        this.perfectWords = 0;
        this.mistakes = 0;

        this.lastRenderedSecond = null;
    }

    /**
     * Initializes and activates a new session.
     */
    start() {
        this.isActive = true;
        this.elapsedSeconds = 0;
        this.completedWords = 0;
        this.perfectWords = 0;
        this.mistakes = 0;
        this.lastRenderedSecond = null;

        this.renderTime();
    }

    /**
     * Advances session time according to elapsed animation-frame time.
     *
     * The session manager uses delta time supplied by Game so it does not need
     * to create a separate timer or interval lifecycle.
     */
    update(deltaSeconds) {
        if (!this.isActive) {
            return;
        }

        this.elapsedSeconds += deltaSeconds;

        if (this.elapsedSeconds >= SESSION_DURATION_SECONDS) {
            this.elapsedSeconds = SESSION_DURATION_SECONDS;
            this.isActive = false;

            this.renderTime();
            this.onSessionEnded();

            return;
        }

        this.renderTime();
    }

    /**
     * Records one completed word and whether it was completed perfectly.
     */
    handleWordCompleted(word) {
        if (!this.isActive) {
            return;
        }

        this.completedWords += 1;

        if (word.isPerfect) {
            this.perfectWords += 1;
        }
    }

    /**
     * Records one incorrect typed letter.
     *
     * Multiple incorrect letters inside the same word count as separate
     * mistakes because each represents an individual typing error.
     */
    handleIncorrectLetter() {
        if (!this.isActive) {
            return;
        }

        this.mistakes += 1;
    }

    /**
     * Returns the session statistics needed by the results screen.
     *
     * Score and highest combo belong to ScoreManager and are combined with
     * these values by Game when the session ends.
     */
    getSummary() {
        return {
            completedWords: this.completedWords,
            perfectWords: this.perfectWords,
            mistakes: this.mistakes
        };
    }

    /**
     * Updates the visible countdown only when its displayed second changes.
     */
    renderTime() {
        const remainingSeconds = Math.max(
            0,
            Math.ceil(SESSION_DURATION_SECONDS - this.elapsedSeconds)
        );

        if (remainingSeconds === this.lastRenderedSecond) {
            return;
        }

        this.lastRenderedSecond = remainingSeconds;
        this.timerValue.textContent = String(remainingSeconds);
    }
}