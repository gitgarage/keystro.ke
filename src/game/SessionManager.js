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
 * SessionManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns the lifecycle, statistics, and internal telemetry of one playable
 * typing session.
 *
 * Responsibilities include:
 *
 * - tracking whether a session is active
 * - tracking elapsed session time
 * - calculating normalized session progress
 * - calculating visible remaining time
 * - tracking completed words
 * - tracking perfect words
 * - tracking incorrect typed letters
 * - tracking phase-aware gameplay outcomes
 * - tracking unresolved words remaining when the session ends
 * - requesting session completion when time expires
 *
 * This class intentionally does NOT:
 *
 * - own the animation frame
 * - spawn or move word targets
 * - calculate score
 * - interpret keyboard events
 * - interpret stage progression
 * - render the final results screen
 *
 * Game coordinates the session with the other gameplay systems.
 * ============================================================================
 */

export class SessionManager {
    constructor({
        timerValue,
        durationSeconds,
        progressionPhaseCount,
        onSessionEnded
    }) {
        this.timerValue = timerValue;
        this.durationSeconds = durationSeconds;
        this.progressionPhaseCount = progressionPhaseCount;
        this.onSessionEnded = onSessionEnded;

        this.isActive = false;
        this.elapsedSeconds = 0;
        this.completedWords = 0;
        this.perfectWords = 0;
        this.mistakes = 0;
        this.phaseTelemetry = [];

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
        this.phaseTelemetry = this.createPhaseTelemetry();
        this.lastRenderedSecond = null;

        this.renderTime();
    }

    /**
     * Creates one telemetry record for each configured progression phase.
     */
    createPhaseTelemetry() {
        return Array.from(
            {
                length: this.progressionPhaseCount
            },
            (_, phaseIndex) => {
                return {
                    phaseIndex,
                    completedWords: 0,
                    perfectWords: 0,
                    mistakes: 0,
                    escapedWords: 0,
                    remainingWords: 0
                };
            }
        );
    }

    /**
     * Returns the telemetry record associated with a word's spawn phase.
     */
    getPhaseTelemetry(word) {
        return this.phaseTelemetry[
            word.progressionPhaseIndex
        ] ?? null;
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

        if (this.elapsedSeconds >= this.durationSeconds) {
            this.elapsedSeconds = this.durationSeconds;
            this.isActive = false;

            this.renderTime();
            this.onSessionEnded();

            return;
        }

        this.renderTime();
    }

    /**
     * Returns normalized session progress between zero and one.
     */
    getProgress() {
        if (this.durationSeconds <= 0) {
            return 1;
        }

        return Math.min(
            1,
            this.elapsedSeconds / this.durationSeconds
        );
    }

    /**
     * Records one completed word and whether it was completed perfectly.
     */
    handleWordCompleted(word) {
        if (!this.isActive) {
            return;
        }

        this.completedWords += 1;

        const phaseTelemetry = this.getPhaseTelemetry(word);

        if (phaseTelemetry) {
            phaseTelemetry.completedWords += 1;
        }

        if (word.isPerfect) {
            this.perfectWords += 1;

            if (phaseTelemetry) {
                phaseTelemetry.perfectWords += 1;
            }
        }
    }

    /**
     * Records one incorrect typed letter against the affected word.
     *
     * Multiple incorrect letters inside the same word count as separate
     * mistakes because each represents an individual typing error.
     */
    handleIncorrectLetter(word) {
        if (!this.isActive) {
            return;
        }

        this.mistakes += 1;

        const phaseTelemetry = this.getPhaseTelemetry(word);

        if (phaseTelemetry) {
            phaseTelemetry.mistakes += 1;
        }
    }

    /**
     * Records one escaped word against the phase that spawned it.
     */
    handleWordEscaped(word) {
        if (!this.isActive) {
            return;
        }

        const phaseTelemetry = this.getPhaseTelemetry(word);

        if (phaseTelemetry) {
            phaseTelemetry.escapedWords += 1;
        }
    }

    /**
     * Records unresolved words still active when the session ends.
     *
     * Remaining words are grouped by the progression phase that spawned them.
     * This preserves the same attribution model used by completed, mistaken,
     * and escaped targets.
     */
    handleRemainingWords(words) {
        for (const word of words) {
            const phaseTelemetry = this.getPhaseTelemetry(word);

            if (phaseTelemetry) {
                phaseTelemetry.remainingWords += 1;
            }
        }
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
     * Returns a detached copy of internal progression telemetry.
     */
    getTelemetrySummary() {
        return this.phaseTelemetry.map((phaseTelemetry) => {
            return {
                phaseIndex: phaseTelemetry.phaseIndex,
                completedWords: phaseTelemetry.completedWords,
                perfectWords: phaseTelemetry.perfectWords,
                mistakes: phaseTelemetry.mistakes,
                escapedWords: phaseTelemetry.escapedWords,
                remainingWords: phaseTelemetry.remainingWords
            };
        });
    }

    /**
     * Updates the visible countdown only when its displayed second changes.
     */
    renderTime() {
        const remainingSeconds = Math.max(
            0,
            Math.ceil(
                this.durationSeconds - this.elapsedSeconds
            )
        );

        if (remainingSeconds === this.lastRenderedSecond) {
            return;
        }

        this.lastRenderedSecond = remainingSeconds;
        this.timerValue.textContent = String(remainingSeconds);
    }
}