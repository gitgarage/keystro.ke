/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { InputManager } from "./InputManager.js";
import { ScoreManager } from "./ScoreManager.js";
import { SessionManager } from "./SessionManager.js";
import { WordManager } from "./WordManager.js";
import { SPAWN_INTERVAL_MS } from "./constants.js";

/**
 * ============================================================================
 * Game
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Coordinates the top-level keystro.ke gameplay loop.
 *
 * Responsibilities include:
 *
 * - owning the animation frame lifecycle
 * - calculating elapsed frame time
 * - scheduling word spawning
 * - connecting gameplay systems through meaningful events
 * - coordinating session completion
 * - presenting final session results
 *
 * Game coordinates systems. It should not absorb their internal rules.
 * ============================================================================
 */

export class Game {
    constructor({
        wordLayer,
        comboValue,
        scoreValue,
        timerValue,
        resultsScreen,
        resultScore,
        resultHighestCombo,
        resultCompletedWords,
        resultPerfectWords,
        resultMistakes
    }) {
        this.resultsScreen = resultsScreen;
        this.resultScore = resultScore;
        this.resultHighestCombo = resultHighestCombo;
        this.resultCompletedWords = resultCompletedWords;
        this.resultPerfectWords = resultPerfectWords;
        this.resultMistakes = resultMistakes;

        this.scoreManager = new ScoreManager({
            comboValue,
            scoreValue
        });

        this.sessionManager = new SessionManager({
            timerValue,

            onSessionEnded: () => {
                this.endSession();
            }
        });

        this.wordManager = new WordManager({
            wordLayer,

            onWordCompleted: (word) => {
                this.scoreManager.handleWordCompleted(word);
                this.sessionManager.handleWordCompleted(word);
            },

            onIncorrectLetter: () => {
                this.scoreManager.handleIncorrectLetter();
                this.sessionManager.handleIncorrectLetter();
            },

            onWordEscaped: () => {
                this.scoreManager.handleWordEscaped();
            }
        });

        this.inputManager = new InputManager((letter) => {
            if (!this.sessionManager.isActive) {
                return;
            }

            this.wordManager.handleTypedLetter(letter);
        });

        this.lastFrameTime = 0;
        this.lastSpawnTime = 0;

        this.runFrame = this.runFrame.bind(this);
    }

    /**
     * Starts the current game session.
     */
    start() {
        this.resultsScreen.hidden = true;

        this.scoreManager.start();
        this.sessionManager.start();
        this.inputManager.start();

        window.requestAnimationFrame(this.runFrame);
    }

    /**
     * Ends gameplay and renders the final session summary.
     */
    endSession() {
        this.inputManager.stop();
        this.wordManager.clearWords();

        const scoreSummary = this.scoreManager.getSummary();
        const sessionSummary = this.sessionManager.getSummary();

        this.resultScore.textContent = String(scoreSummary.score);
        this.resultHighestCombo.textContent = String(
            scoreSummary.highestCombo
        );
        this.resultCompletedWords.textContent = String(
            sessionSummary.completedWords
        );
        this.resultPerfectWords.textContent = String(
            sessionSummary.perfectWords
        );
        this.resultMistakes.textContent = String(
            sessionSummary.mistakes
        );

        this.resultsScreen.hidden = false;
    }

    /**
     * Runs one frame of the game loop.
     */
    runFrame(currentTime) {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = currentTime;
        }

        const deltaSeconds =
            (currentTime - this.lastFrameTime) / 1000;

        this.sessionManager.update(deltaSeconds);

        if (!this.sessionManager.isActive) {
            return;
        }

        if (
            currentTime - this.lastSpawnTime >= SPAWN_INTERVAL_MS
        ) {
            this.wordManager.spawnWord();
            this.lastSpawnTime = currentTime;
        }

        this.wordManager.update(deltaSeconds);

        this.lastFrameTime = currentTime;

        window.requestAnimationFrame(this.runFrame);
    }
}