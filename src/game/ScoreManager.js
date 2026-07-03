/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { BASE_SCORE_PER_LETTER } from "./constants.js";

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
 * - tracking the current combo
 * - tracking the current score
 * - rewarding completed words
 * - applying combo only to perfect words
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
 * - own the main animation frame
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
        this.score = 0;
    }

    start() {
        this.render();
    }

    handleWordCompleted(word) {
        if (word.isPerfect) {
            this.rewardPerfectWord(word);
        } else {
            this.rewardImperfectWord(word);
        }

        this.render();
    }

    rewardPerfectWord(word) {
        this.combo += 1;

        const wordScore =
            word.text.length *
            BASE_SCORE_PER_LETTER *
            this.combo;

        this.score += wordScore;
    }

    rewardImperfectWord(word) {
        const wordScore =
            word.text.length *
            BASE_SCORE_PER_LETTER;

        this.score += wordScore;
    }

    handleIncorrectLetter() {
        this.resetCombo();
    }

    handleWordEscaped() {
        this.resetCombo();
    }

    resetCombo() {
        if (this.combo === 0) {
            return;
        }

        this.combo = 0;

        this.render();
    }

    render() {
        this.comboValue.textContent = String(this.combo);
        this.scoreValue.textContent = String(this.score);
    }
}