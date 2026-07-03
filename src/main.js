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

/**
 * ============================================================================
 * Application Entry Point
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Creates and starts the keystro.ke game.
 *
 * The entry point intentionally contains almost no application logic. Its job
 * is to connect the browser document to the top-level Game object.
 *
 * This file intentionally does NOT:
 *
 * - select words
 * - move word targets
 * - interpret typing
 * - calculate score
 * - render gameplay state
 *
 * Those responsibilities belong to dedicated game systems.
 * ============================================================================
 */

function startApplication() {
    const wordLayer = document.querySelector("#word-layer");
    const comboValue = document.querySelector("#combo-value");
    const scoreValue = document.querySelector("#score-value");

    if (!wordLayer) {
        console.error(
            "Unable to start keystro.ke: word layer was not found."
        );

        return;
    }

    if (!comboValue) {
        console.error(
            "Unable to start keystro.ke: combo value element was not found."
        );

        return;
    }

    if (!scoreValue) {
        console.error(
            "Unable to start keystro.ke: score value element was not found."
        );

        return;
    }

    const game = new Game({
        wordLayer,
        comboValue,
        scoreValue
    });

    game.start();

    console.info("keystro.ke combo and score demo loaded.");
}

window.addEventListener("DOMContentLoaded", startApplication);