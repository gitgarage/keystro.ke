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
 *
 * This class intentionally does NOT:
 *
 * - interpret raw browser keyboard events
 * - select words
 * - render individual word targets
 * - calculate score
 * - play sounds
 *
 * Game coordinates systems. It should not absorb their responsibilities.
 * ============================================================================
 */

export class Game {
    constructor({ wordLayer, comboValue, scoreValue }) {
        this.scoreManager = new ScoreManager({
            comboValue,
            scoreValue
        });

        this.wordManager = new WordManager({
            wordLayer,

            onWordCompleted: (word) => {
                this.scoreManager.handleWordCompleted(word);
            },

            onIncorrectLetter: () => {
                this.scoreManager.handleIncorrectLetter();
            },

            onWordEscaped: () => {
                this.scoreManager.handleWordEscaped();
            }
        });

        this.inputManager = new InputManager((letter) => {
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
        this.scoreManager.start();
        this.inputManager.start();

        window.requestAnimationFrame(this.runFrame);
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