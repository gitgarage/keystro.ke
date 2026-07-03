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
 *     Starts the first playable typing loop.
 *
 * Why it exists:
 *     This version adds keyboard input, target locking, word completion, and
 *     first-letter reservation so visible targets stay unambiguous.
 *
 * Design goals:
 *     - Keep the loop readable.
 *     - Keep targeting predictable.
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

const activeWords = [];

let activeTarget = null;
let lastFrameTime = 0;
let lastSpawnTime = 0;

function getReservedStartingLetters() {
    return new Set(
        activeWords
            .filter((word) => word.progress === 0)
            .map((word) => word.text[0])
    );
}

function chooseWord() {
    const reservedLetters = getReservedStartingLetters();

    const availableWords = WORD_POOL.filter((word) => {
        return !reservedLetters.has(word[0]);
    });

    if (availableWords.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * availableWords.length);

    return availableWords[index];
}

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

function spawnWord(wordLayer) {
    if (activeWords.length >= MAX_ACTIVE_WORDS) {
        return;
    }

    const wordText = chooseWord();

    if (!wordText) {
        return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const speed = 65 + Math.random() * 85;
    const y = viewportHeight * (0.18 + Math.random() * 0.68);
    const x = viewportWidth + 80;

    const element = createWordElement(wordText, speed);

    wordLayer.appendChild(element);

    activeWords.push({
        text: wordText,
        progress: 0,
        x,
        y,
        speed,
        element
    });
}

function renderWordProgress(word) {
    const typedText = word.text.slice(0, word.progress);
    const remainingText = word.text.slice(word.progress);

    word.element.innerHTML = `
        <span class="word-typed">${typedText}</span><span class="word-remaining">${remainingText}</span>
    `;
}

function setActiveTarget(word) {
    activeTarget = word;
    word.element.classList.add("is-active");
    renderWordProgress(word);

    for (const otherWord of activeWords) {
        if (otherWord !== word) {
            otherWord.element.classList.add("is-muted");
        }
    }
}

function clearActiveTarget() {
    activeTarget = null;

    for (const word of activeWords) {
        word.element.classList.remove("is-active", "is-muted");
    }
}

function removeWord(word) {
    const index = activeWords.indexOf(word);

    if (index !== -1) {
        activeWords.splice(index, 1);
    }

    word.element.remove();

    if (activeTarget === word) {
        clearActiveTarget();
    }
}

function findTargetForLetter(letter) {
    return activeWords.find((word) => {
        return word.progress === 0 && word.text.startsWith(letter);
    });
}

function flashWordError(word) {
    word.element.classList.add("has-error");

    window.setTimeout(() => {
        word.element.classList.remove("has-error");
    }, 120);
}

function handleTypedLetter(letter) {
    if (!activeTarget) {
        const target = findTargetForLetter(letter);

        if (!target) {
            return;
        }

        setActiveTarget(target);
    }

    const expectedLetter = activeTarget.text[activeTarget.progress];

    if (letter !== expectedLetter) {
        flashWordError(activeTarget);
        return;
    }

    activeTarget.progress += 1;
    renderWordProgress(activeTarget);

    if (activeTarget.progress >= activeTarget.text.length) {
        removeWord(activeTarget);
    }
}

function updateWords(deltaSeconds) {
    for (let index = activeWords.length - 1; index >= 0; index -= 1) {
        const word = activeWords[index];

        word.x -= word.speed * deltaSeconds;
        word.element.style.transform = `translate3d(${word.x}px, ${word.y}px, 0)`;

        if (word.x < -220) {
            removeWord(word);
        }
    }
}

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

function handleKeyDown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    if (event.key.length !== 1) {
        return;
    }

    const letter = event.key.toLowerCase();

    if (!letter.match(/^[a-z]$/)) {
        return;
    }

    handleTypedLetter(letter);
}

function startApplication() {
    const comboValue = document.querySelector("#combo-value");

    if (!comboValue) {
        console.error("Unable to start keystro.ke: combo value element was not found.");
        return;
    }

    comboValue.textContent = "0";

    window.addEventListener("keydown", handleKeyDown);

    console.info("keystro.ke typing input demo loaded.");

    window.requestAnimationFrame(runFrame);
}

window.addEventListener("DOMContentLoaded", startApplication);