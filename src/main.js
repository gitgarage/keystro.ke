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
 *     Starts the first visible gameplay loop.
 *
 * Why it exists:
 *     The project should grow from a working loop instead of a pile of detached
 *     systems. This first loop only moves word targets across the screen. Typing,
 *     scoring, power-ups, audio, and particles will be added in later commits.
 *
 * Design goals:
 *     - Keep the loop readable.
 *     - Keep the data model obvious.
 *     - Avoid dependencies.
 *     - Keep every commit playable.
 * -----------------------------------------------------------------------------
 */

const WORD_POOL = [
    "cell",
    "glow",
    "drift",
    "focus",
    "rhythm",
    "signal",
    "current",
    "horizon",
    "cascade",
    "resonance"
];

const MAX_ACTIVE_WORDS = 6;
const SPAWN_INTERVAL_MS = 1400;

/**
 * Active word targets currently visible on the stage.
 *
 * Each target owns:
 * - the text shown to the player
 * - its current x/y position
 * - its horizontal speed
 * - the DOM element that renders it
 */
const activeWords = [];

let lastFrameTime = 0;
let lastSpawnTime = 0;

/**
 * Selects a word from the current demo word pool.
 *
 * This will eventually become a real word-selection system that understands
 * difficulty, theme, stage, keyboard layout, and power-up rules.
 */
function chooseWord() {
    const index = Math.floor(Math.random() * WORD_POOL.length);

    return WORD_POOL[index];
}

/**
 * Creates the DOM element used to render one moving word.
 */
function createWordElement(wordText, speed) {
    const element = document.createElement("span");

    element.className = "word-target";
    element.textContent = wordText;

    if (speed > 120) {
        element.classList.add("is-fast");
    } else if (speed < 85) {
        element.classList.add("is-slow");
    }

    return element;
}

/**
 * Spawns one word just beyond the right side of the viewport.
 *
 * Words begin offscreen so they drift naturally into view instead of popping
 * into existence inside the play area.
 */
function spawnWord(wordLayer) {
    if (activeWords.length >= MAX_ACTIVE_WORDS) {
        return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const wordText = chooseWord();
    const speed = 65 + Math.random() * 85;
    const y = viewportHeight * (0.22 + Math.random() * 0.58);
    const x = viewportWidth + 80;

    const element = createWordElement(wordText, speed);

    wordLayer.appendChild(element);

    activeWords.push({
        text: wordText,
        x,
        y,
        speed,
        element
    });
}

/**
 * Moves all active words and removes words that have crossed offscreen.
 */
function updateWords(deltaSeconds) {
    for (let index = activeWords.length - 1; index >= 0; index -= 1) {
        const word = activeWords[index];

        word.x -= word.speed * deltaSeconds;
        word.element.style.transform = `translate3d(${word.x}px, ${word.y}px, 0)`;

        if (word.x < -220) {
            word.element.remove();
            activeWords.splice(index, 1);
        }
    }
}

/**
 * Runs one animation frame.
 *
 * requestAnimationFrame provides smoother movement than setInterval because it
 * synchronizes the update loop with the browser's rendering cycle.
 */
function runFrame(currentTime) {
    const wordLayer = document.querySelector("#word-layer");

    if (!wordLayer) {
        console.error("Unable to update keystro.ke: word layer was not found.");
        return;
    }

    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
    }

    const deltaSeconds = (currentTime - lastFrameTime) / 1000;

    if (currentTime - lastSpawnTime >= SPAWN_INTERVAL_MS) {
        spawnWord(wordLayer);
        lastSpawnTime = currentTime;
    }

    updateWords(deltaSeconds);

    lastFrameTime = currentTime;

    window.requestAnimationFrame(runFrame);
}

function startApplication() {
    const comboValue = document.querySelector("#combo-value");

    if (!comboValue) {
        console.error("Unable to start keystro.ke: combo value element was not found.");
        return;
    }

    comboValue.textContent = "0";

    console.info("keystro.ke moving word target demo loaded.");

    window.requestAnimationFrame(runFrame);
}

window.addEventListener("DOMContentLoaded", startApplication);