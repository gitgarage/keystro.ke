/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { AudioManager } from "./AudioManager.js";
import { LEVEL_ONE_CLEAR_WORD_COUNT } from "./constants.js";
import { InputManager } from "./InputManager.js";
import { MicroscopicEnvironment } from "./MicroscopicEnvironment.js";
import { ScoreManager } from "./ScoreManager.js";
import { SessionManager } from "./SessionManager.js";
import { StageManager } from "./StageManager.js";
import { StagePresentationManager } from "./StagePresentationManager.js";
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
 * spawning, organism movement, active target density, presentation pressure,
 * and phase-aware session telemetry.
 *
 * Stage-level presentation lifecycle is delegated to
 * StagePresentationManager.
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
        resultMistakes,
        requestedStageId
    }) {
        this.stageManager = new StageManager(requestedStageId);
        this.currentStage = this.stageManager.getCurrentStage();

        this.audioManager = new AudioManager();

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

            onCorrectLetter: () => {
                this.audioManager.playCorrectLetter();
            },

            onWordCompleted: (word) => {
                const progressionPhase =
                    this.getCurrentProgressionPhase();

                this.audioManager.playWordCompleted(word);

                this.scoreManager.handleWordCompleted(word);

                this.sessionManager.handleWordCompleted(
                    word,
                    progressionPhase.phaseIndex
                );
            },

            onIncorrectLetter: () => {
                const progressionPhase =
                    this.getCurrentProgressionPhase();

                this.audioManager.playIncorrectLetter();

                this.scoreManager.handleIncorrectLetter();

                this.sessionManager.handleIncorrectLetter(
                    progressionPhase.phaseIndex
                );
            },

            onWordEscaped: () => {
                const progressionPhase =
                    this.getCurrentProgressionPhase();

                this.audioManager.playComboBreak();

                this.scoreManager.handleWordEscaped();

                this.sessionManager.handleWordEscaped(
                    progressionPhase.phaseIndex
                );
            }
        });

        this.stagePresentationManager =
            new StagePresentationManager({
                gameViewport,
                resultsScreen,
                microscopicEnvironment:
                    this.microscopicEnvironment,
                wordManager: this.wordManager,
                resultScore,
                resultHighestCombo,
                resultCompletedWords,
                resultPerfectWords,
                resultMistakes
            });

        this.inputManager = new InputManager((letter) => {
            if (!this.sessionManager.isActive) {
                return;
            }

            this.audioManager.unlock();
            this.wordManager.handleTypedLetter(letter);
        });

        this.lastFrameTime = 0;
        this.lastSpawnTime = 0;
        this.isEndingSession = false;

        this.runFrame = this.runFrame.bind(this);
    }

    getCurrentStage() {
        return this.currentStage;
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
        this.scoreManager.start();
        this.sessionManager.start();

        const progressionPhase =
            this.getCurrentProgressionPhase();

        this.stagePresentationManager.start(
            this.currentStage,
            this.stageManager.getStageClassName(),
            progressionPhase.phaseIndex
        );

        this.wordManager.seedInitialWords(
            progressionPhase
        );

        this.inputManager.start();

        window.requestAnimationFrame(this.runFrame);
    }

    endSession() {
        if (this.isEndingSession) {
            return;
        }

        this.isEndingSession = true;
        this.inputManager.stop();

        const progressionPhase =
            this.getCurrentProgressionPhase();

        this.sessionManager.handleRemainingWords(
            this.wordManager.getActiveWords(),
            progressionPhase.phaseIndex
        );

        const scoreSummary = this.scoreManager.getSummary();
        const sessionSummary = this.sessionManager.getSummary();

        const isLevelCleared =
            sessionSummary.completedWords >=
            LEVEL_ONE_CLEAR_WORD_COUNT;

        const nextStageId = this.stageManager.getNextStageId(
            this.currentStage.id
        );

        const telemetrySummary =
            this.sessionManager.getTelemetrySummary();

        this.logSessionTelemetry(telemetrySummary);

        this.stagePresentationManager.complete({
            scoreSummary,
            sessionSummary,
            isLevelCleared,
            nextStageId
        });
    }

    logSessionTelemetry(telemetrySummary) {
        console.group(
            `${this.currentStage.name} Session Telemetry`
        );

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

        this.stagePresentationManager.applyProgressionPhase(
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