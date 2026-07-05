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
import { MicroscopicEnvironment } from "./MicroscopicEnvironment.js";
import { ScoreManager } from "./ScoreManager.js";
import { SessionManager } from "./SessionManager.js";
import { StageManager } from "./StageManager.js";
import { WordManager } from "./WordManager.js";

/**
 * ============================================================================
 * Game
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Coordinates the top-level keystro.ke gameplay loop.
 *
 * Game receives stage configuration from StageManager and interprets current
 * stage progression. The active progression phase is applied consistently to
 * spawning, organism movement, active target density, environmental pressure,
 * and phase-aware session telemetry.
 *
 * Game also coordinates stage-level presentation moments such as the opening
 * stage introduction.
 * ============================================================================
 */

export class Game {
    constructor({
        gameViewport,
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
        this.gameViewport = gameViewport;
        this.resultsScreen = resultsScreen;
        this.resultScore = resultScore;
        this.resultHighestCombo = resultHighestCombo;
        this.resultCompletedWords = resultCompletedWords;
        this.resultPerfectWords = resultPerfectWords;
        this.resultMistakes = resultMistakes;

        this.stageIntro =
            this.gameViewport.querySelector("[data-stage-intro]");

        this.stageManager = new StageManager();
        this.currentStage = this.stageManager.getCurrentStage();

        this.microscopicEnvironment = new MicroscopicEnvironment({
            gameViewport
        });

        this.scoreManager = new ScoreManager({
            comboValue,
            scoreValue
        });

        this.sessionManager = new SessionManager({
            timerValue,
            durationSeconds:
                this.currentStage.tuning.sessionDurationSeconds,
            progressionPhaseCount:
                this.currentStage.progression?.length ?? 1,

            onSessionEnded: () => {
                this.endSession();
            }
        });

        this.wordManager = new WordManager({
            wordLayer,
            stage: this.currentStage,

            onWordCompleted: (word) => {
                const progressionPhase =
                    this.getCurrentProgressionPhase();

                this.scoreManager.handleWordCompleted(word);

                this.sessionManager.handleWordCompleted(
                    word,
                    progressionPhase.phaseIndex
                );
            },

            onIncorrectLetter: () => {
                const progressionPhase =
                    this.getCurrentProgressionPhase();

                this.scoreManager.handleIncorrectLetter();

                this.sessionManager.handleIncorrectLetter(
                    progressionPhase.phaseIndex
                );
            },

            onWordEscaped: () => {
                const progressionPhase =
                    this.getCurrentProgressionPhase();

                this.scoreManager.handleWordEscaped();

                this.sessionManager.handleWordEscaped(
                    progressionPhase.phaseIndex
                );
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

    getCurrentProgressionPhase() {
        const progression = this.currentStage.progression;

        if (!progression || progression.length === 0) {
            return {
                phaseIndex: 0,
                startProgress: 0,
                spawnIntervalMultiplier: 1,
                speedMultiplier: 1
            };
        }

        const sessionProgress = this.sessionManager.getProgress();
        let currentPhase = progression[0];
        let currentPhaseIndex = 0;

        for (
            let phaseIndex = 0;
            phaseIndex < progression.length;
            phaseIndex += 1
        ) {
            const phase = progression[phaseIndex];

            if (sessionProgress < phase.startProgress) {
                break;
            }

            currentPhase = phase;
            currentPhaseIndex = phaseIndex;
        }

        return {
            ...currentPhase,
            phaseIndex: currentPhaseIndex
        };
    }

    start() {
        this.resultsScreen.hidden = true;

        this.gameViewport.classList.add(
            this.stageManager.getStageClassName()
        );

        this.showStageIntro();

        this.microscopicEnvironment.start();
        this.scoreManager.start();
        this.sessionManager.start();

        const progressionPhase =
            this.getCurrentProgressionPhase();

        this.microscopicEnvironment.setProgressionPhase(
            progressionPhase.phaseIndex
        );

        this.wordManager.seedInitialWords(
            progressionPhase
        );

        this.inputManager.start();

        window.requestAnimationFrame(this.runFrame);
    }

    showStageIntro() {
        if (!this.stageIntro) {
            return;
        }

        this.stageIntro.classList.remove("is-visible");

        window.requestAnimationFrame(() => {
            this.stageIntro.classList.add("is-visible");
        });
    }

    endSession() {
        this.inputManager.stop();

        const progressionPhase =
            this.getCurrentProgressionPhase();

        this.sessionManager.handleRemainingWords(
            this.wordManager.getActiveWords(),
            progressionPhase.phaseIndex
        );

        this.wordManager.clearWords();

        const scoreSummary = this.scoreManager.getSummary();
        const sessionSummary = this.sessionManager.getSummary();

        const telemetrySummary =
            this.sessionManager.getTelemetrySummary();

        this.resultScore.textContent =
            String(scoreSummary.score);

        this.resultHighestCombo.textContent =
            String(scoreSummary.highestCombo);

        this.resultCompletedWords.textContent =
            String(sessionSummary.completedWords);

        this.resultPerfectWords.textContent =
            String(sessionSummary.perfectWords);

        this.resultMistakes.textContent =
            String(sessionSummary.mistakes);

        this.logSessionTelemetry(telemetrySummary);

        this.resultsScreen.hidden = false;
    }

    logSessionTelemetry(telemetrySummary) {
        console.group("Stage One Session Telemetry");

        for (const phaseTelemetry of telemetrySummary) {
            console.group(
                `phase-${phaseTelemetry.phaseIndex + 1}`
            );

            console.log(
                "completed:",
                phaseTelemetry.completedWords
            );

            console.log(
                "perfect:",
                phaseTelemetry.perfectWords
            );

            console.log(
                "mistakes:",
                phaseTelemetry.mistakes
            );

            console.log(
                "escaped:",
                phaseTelemetry.escapedWords
            );

            console.log(
                "remaining:",
                phaseTelemetry.remainingWords
            );

            console.groupEnd();
        }

        console.groupEnd();
    }

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

        const progressionPhase =
            this.getCurrentProgressionPhase();

        this.microscopicEnvironment.setProgressionPhase(
            progressionPhase.phaseIndex
        );

        const spawnIntervalMs =
            this.currentStage.tuning.spawnIntervalMs *
            progressionPhase.spawnIntervalMultiplier;

        if (
            currentTime - this.lastSpawnTime >=
            spawnIntervalMs
        ) {
            this.wordManager.spawnWord(progressionPhase);
            this.lastSpawnTime = currentTime;
        }

        this.wordManager.update(
            deltaSeconds,
            progressionPhase
        );

        this.lastFrameTime = currentTime;

        window.requestAnimationFrame(this.runFrame);
    }
}