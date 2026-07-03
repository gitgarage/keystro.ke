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
 * -----------------------------------------------------------------------------
 * keystro.ke application entry point
 *
 * Purpose:
 *     Starts the browser application after the HTML document has loaded.
 *
 * Why it exists:
 *     This file is intentionally small at the beginning of the project. The
 *     early goal is to prove that the static page, CSS, and JavaScript are wired
 *     together correctly before adding game logic.
 *
 * Design goals:
 *     - No framework.
 *     - No build step.
 *     - No external dependency.
 *     - Clear structure that can grow into a real game loop.
 * -----------------------------------------------------------------------------
 */

function startApplication() {
    const comboValue = document.querySelector("#combo-value");

    if (!comboValue) {
        console.error("Unable to start keystro.ke: combo value element was not found.");
        return;
    }

    comboValue.textContent = "0";

    console.info("keystro.ke development shell loaded.");
}

window.addEventListener("DOMContentLoaded", startApplication);