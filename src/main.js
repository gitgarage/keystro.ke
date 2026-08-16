/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { Game } from "./game/Game.js";
import { getSettings, setSoundEnabled } from "./settings.js";

/**
 * ============================================================================
 * Application Entry Point
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Finds the application shell, resolves application-level launch options,
 * creates the top-level Game, and starts it.
 *
 * Gameplay rules belong to dedicated systems rather than this entry point.
 * ============================================================================
 */

function getRequestedStageId() {
    const searchParameters = new URLSearchParams(
        window.location.search
    );

    return searchParameters.get("stage") ?? "amoeba";
}

// Wires arcade's sound toggle to the shared, persisted setting - the same
// pattern every other page's #soundToggle button already uses, applied here
// for the first time since arcade previously had no way to mute at all
// despite AudioManager already having an internal isEnabled flag.
function wireSoundToggle(audioManager) {
    const toggleButton = document.getElementById("soundToggle");

    if (!toggleButton) {
        return;
    }

    let soundOn = getSettings().soundEnabled;
    audioManager.setEnabled(soundOn);
    toggleButton.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;

    toggleButton.addEventListener("click", () => {
        soundOn = !soundOn;
        audioManager.setEnabled(soundOn);
        toggleButton.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
        setSoundEnabled(soundOn);
    });
}

function startApplication() {
    const elements = {
        gameViewport: document.querySelector(".game-viewport"),
        wordLayer: document.querySelector("#word-layer"),
        comboValue: document.querySelector("#combo-value"),
        scoreValue: document.querySelector("#score-value"),
        timerValue: document.querySelector("#timer-value"),
        resultsScreen: document.querySelector("#results-screen"),
        resultScore: document.querySelector("#result-score"),
        resultHighestCombo: document.querySelector(
            "#result-highest-combo"
        ),
        resultCompletedWords: document.querySelector(
            "#result-completed-words"
        ),
        resultPerfectWords: document.querySelector(
            "#result-perfect-words"
        ),
        resultMistakes: document.querySelector("#result-mistakes")
    };

    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(
                `Unable to start keystro.ke: ${name} element was not found.`
            );

            return;
        }
    }

    const requestedStageId = getRequestedStageId();

    const game = new Game({
        ...elements,
        requestedStageId
    });

    wireSoundToggle(game.audioManager);

    game.start();

    console.info(
        `keystro.ke ${game.getCurrentStage().name} stage loaded.`
    );
}

window.addEventListener("DOMContentLoaded", startApplication);