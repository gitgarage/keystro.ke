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
    BASE_SCORE_PER_LETTER,
    POWER_UP_SCORE_MULTIPLIER
} from "./constants.js";

/**
 * ============================================================================
 * ScoreManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns combo and score state for the current typing session.
 *
 * Responsibilities include:
 *
 * - tracking current combo
 * - tracking highest combo
 * - tracking current score
 * - rewarding completed words
 * - applying combo only to perfect words
 * - applying special power-up rewards
 * - resetting combo after mistakes
 * - resetting combo after escaped words
 * - updating score and combo HUD elements
 *
 * This class intentionally does NOT:
 *
 * - listen to keyboard input
 * - select word targets
 * - validate typed letters
 * - move word targets
 * - own session timing
 *
 * Gameplay systems report meaningful events to ScoreManager. ScoreManager
 * decides what those events mean numerically.
 * ============================================================================
 */

export class ScoreManager {
    constructor({ comboValue, scoreValue }) {
        this.comboValue = comboValue;
        this.scoreValue = scoreValue;

        this.combo = 0;
        this.highestCombo = 0;
        this.score = 0;
    }

    /**
     * Initializes score state for a new session.
     */
    start() {
        this.combo = 0;
        this.highestCombo = 0;
        this.score = 0;

        this.render();
    }

    /**
     * Rewards a completed word according to its accuracy state.
     */
    handleWordCompleted(word) {
        if (word.isPerfect) {
            this.rewardPerfectWord(word);
        } else {
            this.rewardImperfectWord(word);
        }

        this.render();
    }

    /**
     * Rewards a perfect word and advances the current combo.
     */
    rewardPerfectWord(word) {
        this.combo += 1;

        if (this.combo > this.highestCombo) {
            this.highestCombo = this.combo;
        }

        const targetMultiplier =
            word.type === "power-up" ? POWER_UP_SCORE_MULTIPLIER : 1;

        const wordScore =
            word.text.length *
            BASE_SCORE_PER_LETTER *
            this.combo *
            targetMultiplier;

        this.score += wordScore;
    }

    /**
     * Rewards an imperfect word with base score only.
     */
    rewardImperfectWord(word) {
        const wordScore =
            word.text.length *
            BASE_SCORE_PER_LETTER;

        this.score += wordScore;
    }

    /**
     * Breaks the current combo after an incorrect typed letter.
     */
    handleIncorrectLetter() {
        this.resetCombo();
    }

    /**
     * Breaks the current combo after an escaped word.
     */
    handleWordEscaped() {
        this.resetCombo();
    }

    /**
     * Resets the active combo without removing earned score.
     */
    resetCombo() {
        if (this.combo === 0) {
            return;
        }

        this.combo = 0;

        this.render();
    }

    /**
     * Returns score statistics needed by the results screen.
     */
    getSummary() {
        return {
            score: this.score,
            highestCombo: this.highestCombo
        };
    }

    /**
     * Synchronizes score state with the HUD.
     */
    render() {
        this.comboValue.textContent = String(this.combo);
        this.scoreValue.textContent = String(this.score);
    }
}