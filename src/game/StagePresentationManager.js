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
 * Stage Presentation Manager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Coordinates stage-level presentation lifecycle.
 *
 * Individual visual systems remain responsible for their own presentation.
 * StagePresentationManager coordinates those systems when gameplay reaches
 * major stage moments such as introduction, progression pressure, completion,
 * and results.
 *
 * This keeps presentation timing and DOM transitions out of the top-level
 * gameplay coordinator.
 * ============================================================================
 */

export class StagePresentationManager {
    constructor({
        gameViewport,
        resultsScreen,
        microscopicEnvironment,
        wordManager,
        resultScore,
        resultHighestCombo,
        resultCompletedWords,
        resultPerfectWords,
        resultMistakes
    }) {
        this.gameViewport = gameViewport;
        this.resultsScreen = resultsScreen;
        this.microscopicEnvironment = microscopicEnvironment;
        this.wordManager = wordManager;

        this.resultScore = resultScore;
        this.resultHighestCombo = resultHighestCombo;
        this.resultCompletedWords = resultCompletedWords;
        this.resultPerfectWords = resultPerfectWords;
        this.resultMistakes = resultMistakes;

        this.stageIntro =
            this.gameViewport.querySelector("[data-stage-intro]");

        this.completionTransitionDurationMs = 1100;
        this.isCompleting = false;
    }

    start(stageClassName, initialPhaseIndex) {
        this.isCompleting = false;

        this.resultsScreen.hidden = true;
        this.resultsScreen.classList.remove("is-visible");

        this.gameViewport.classList.add(stageClassName);

        this.showStageIntro();

        this.microscopicEnvironment.start();

        this.applyProgressionPhase(initialPhaseIndex);
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

    applyProgressionPhase(phaseIndex) {
        this.microscopicEnvironment.setProgressionPhase(
            phaseIndex
        );
    }

    complete({
        scoreSummary,
        sessionSummary,
        onTransitionComplete
    }) {
        if (this.isCompleting) {
            return;
        }

        this.isCompleting = true;

        this.populateResults({
            scoreSummary,
            sessionSummary
        });

        this.wordManager.settleWords();

        window.setTimeout(() => {
            this.wordManager.clearWords();
            this.showResults();

            if (onTransitionComplete) {
                onTransitionComplete();
            }
        }, this.completionTransitionDurationMs);
    }

    populateResults({
        scoreSummary,
        sessionSummary
    }) {
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
    }

    showResults() {
        this.resultsScreen.hidden = false;

        window.requestAnimationFrame(() => {
            this.resultsScreen.classList.add("is-visible");
        });
    }
}