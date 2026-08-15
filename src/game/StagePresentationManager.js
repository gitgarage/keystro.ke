/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { LEVEL_ONE_CLEAR_WORD_COUNT } from "./constants.js";

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

        this.stageIntroKicker = this.stageIntro?.querySelector(
            ".stage-intro-kicker"
        ) ?? null;

        this.stageIntroTitle = this.stageIntro?.querySelector(
            ".stage-intro-title"
        ) ?? null;

        this.stageIntroCopy = this.stageIntro?.querySelector(
            ".stage-intro-copy"
        ) ?? null;

        this.resultsTitle =
            this.resultsScreen.querySelector(".results-title");

        this.resultsStatus = this.resultsScreen.querySelector(
            "[data-result-status]"
        );

        this.resultsControls = this.resultsScreen.querySelector(
            "[data-result-controls]"
        );

        this.completionTransitionDurationMs = 1100;
        this.isCompleting = false;

        this.isLevelCleared = false;
        this.nextStageId = null;

        this.handleResultsKeyDown =
            this.handleResultsKeyDown.bind(this);

        window.addEventListener("keydown", this.handleResultsKeyDown);
    }

    start(stage, stageClassName, initialPhaseIndex) {
        this.isCompleting = false;

        this.resultsScreen.hidden = true;
        this.resultsScreen.classList.remove("is-visible");

        this.gameViewport.classList.add(stageClassName);

        this.showStageIntro(stage.intro);

        if (stage.id === "amoeba") {
            this.microscopicEnvironment.start();
        }

        this.applyProgressionPhase(initialPhaseIndex);
    }

    showStageIntro(intro) {
        if (!this.stageIntro) {
            return;
        }

        if (intro) {
            if (this.stageIntroKicker) {
                this.stageIntroKicker.textContent = intro.kicker;
            }

            if (this.stageIntroTitle) {
                this.stageIntroTitle.textContent = intro.title;
            }

            if (this.stageIntroCopy) {
                this.stageIntroCopy.textContent = intro.copy;
            }
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
        isLevelCleared,
        nextStageId,
        onTransitionComplete
    }) {
        if (this.isCompleting) {
            return;
        }

        this.isCompleting = true;

        this.populateResults({
            scoreSummary,
            sessionSummary,
            isLevelCleared,
            nextStageId
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
        sessionSummary,
        isLevelCleared,
        nextStageId
    }) {
        this.isLevelCleared = isLevelCleared;
        this.nextStageId = nextStageId ?? null;

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

        if (this.resultsTitle) {
            this.resultsTitle.textContent = isLevelCleared
                ? "Level Cleared"
                : "Not Cleared";

            this.resultsTitle.classList.toggle(
                "is-cleared",
                isLevelCleared
            );

            this.resultsTitle.classList.toggle(
                "is-failed",
                !isLevelCleared
            );
        }

        if (this.resultsStatus) {
            this.resultsStatus.textContent =
                `${sessionSummary.completedWords} words completed — ` +
                `${LEVEL_ONE_CLEAR_WORD_COUNT}+ needed to clear.`;
        }

        if (this.resultsControls) {
            this.resultsControls.textContent = this.buildControlsText();
        }
    }

    /**
     * "Next stage" is only ever offered when the level was actually cleared
     * and a stage exists to advance to - otherwise Enter has nothing
     * meaningful to do, so it's left out of the hint entirely rather than
     * shown as a dead option.
     */
    buildControlsText() {
        const controls = ["Esc — menu", "R — replay"];

        if (this.isLevelCleared && this.nextStageId) {
            controls.unshift("Enter — next stage");
        }

        return controls.join("   ·   ");
    }

    showResults() {
        this.resultsScreen.hidden = false;

        window.requestAnimationFrame(() => {
            this.resultsScreen.classList.add("is-visible");
        });
    }

    /**
     * Only acts once the results screen is actually showing - gameplay's
     * own InputManager already stops listening before results appear, so
     * there's no risk of "r" being swallowed as a replay while a word
     * target starting with "r" is still on screen.
     */
    handleResultsKeyDown(event) {
        if (this.resultsScreen.hidden) {
            return;
        }

        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            window.location.href = "index.html";
            return;
        }

        if (event.key === "Enter") {
            if (!this.isLevelCleared || !this.nextStageId) {
                return;
            }

            event.preventDefault();
            window.location.href = `arcade.html?stage=${this.nextStageId}`;
            return;
        }

        if (event.key.toLowerCase() === "r") {
            event.preventDefault();
            window.location.reload();
        }
    }
}
