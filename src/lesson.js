/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { AudioManager } from "./game/AudioManager.js";

/**
 * ============================================================================
 * Lesson Hall - Home Row
 * ============================================================================
 *
 * The first real lesson: a small, plain-data drill sequence rather than a
 * generalized curriculum format - one lesson does not justify that
 * abstraction yet (see PHILOSOPHY.md and ROADMAP.md's Stage System note,
 * which makes the same call about not overbuilding before multiple
 * examples exist).
 *
 * Error handling follows the "permissive-but-counted" school the research
 * found to be the more humane default across classic typing tutors: a
 * wrong key still advances the cursor and gets marked incorrect rather
 * than blocking progress. Escape always gives you a way out of the
 * current attempt.
 * ============================================================================
 */

const HOME_ROW_LESSON = {
    steps: [
        {
            title: "Index Fingers: F and J",
            text: "fj fj jf jf fjf jfj ff jj fj jf"
        },
        {
            title: "The Full Row",
            text: "asdf jkl; jkl; asdf fdsa ;lkj asdf jkl;"
        },
        {
            title: "Real Words",
            text: "ask lad sad fall flask salad dads"
        }
    ]
};

const STATS_RENDER_INTERVAL_MS = 250;

const KEYBOARD_ROWS = [
    { keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] },
    { keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"], offset: 1 },
    { keys: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"], offset: 2 }
];

// Standard touch-typing finger chart, mirrored between hands so the same
// finger uses the same color on both sides of the keyboard.
const KEY_FINGER = {
    q: "pinky", a: "pinky", z: "pinky",
    w: "ring", s: "ring", x: "ring",
    e: "middle", d: "middle", c: "middle",
    r: "index", f: "index", v: "index", t: "index", g: "index", b: "index",
    y: "index", h: "index", n: "index", u: "index", j: "index", m: "index",
    i: "middle", k: "middle", ",": "middle",
    o: "ring", l: "ring", ".": "ring",
    p: "pinky", ";": "pinky", "/": "pinky",
    " ": "thumb"
};

const FINGER_COLOR_VAR = {
    pinky: "--violet",
    ring: "--magenta",
    middle: "--amber",
    index: "--cyan",
    thumb: "--gold"
};

// Only these keys are drilled in this lesson - the rest of the keyboard
// renders dim for context, ready for future lessons to light up.
const HOME_ROW_ACTIVE_KEYS = new Set(["a", "s", "d", "f", "j", "k", "l", ";", " "]);

const TYPABLE_CHARACTER_PATTERN = /^[a-z ;]$/;

function buildKeyboard(container) {
    const keyElements = new Map();

    function createKey(key) {
        const keyEl = document.createElement("div");
        keyEl.className = "key";
        keyEl.textContent = key === " " ? "" : key.toUpperCase();
        keyEl.dataset.key = key;

        const finger = KEY_FINGER[key];
        keyEl.style.setProperty("--finger-color", `var(${FINGER_COLOR_VAR[finger]})`);

        if (HOME_ROW_ACTIVE_KEYS.has(key)) {
            keyEl.classList.add("is-active");
        }

        keyElements.set(key, keyEl);

        return keyEl;
    }

    for (const row of KEYBOARD_ROWS) {
        const rowEl = document.createElement("div");
        rowEl.className = row.offset ? `keyboard-row offset-${row.offset}` : "keyboard-row";

        for (const key of row.keys) {
            rowEl.appendChild(createKey(key));
        }

        container.appendChild(rowEl);
    }

    const spaceRowEl = document.createElement("div");
    spaceRowEl.className = "keyboard-row";

    const spaceKeyEl = createKey(" ");
    spaceKeyEl.classList.add("is-space");

    spaceRowEl.appendChild(spaceKeyEl);
    container.appendChild(spaceRowEl);

    return keyElements;
}

function wireLesson() {
    const kickerEl = document.getElementById("lessonKicker");
    const titleEl = document.getElementById("lessonTitle");
    const drillEl = document.getElementById("main-content");
    const targetEl = document.getElementById("drillTarget");
    const typedEl = document.getElementById("drillTyped");
    const statusEl = document.getElementById("drillStatus");
    const keyboardEl = document.getElementById("keyboard");
    const statWpmEl = document.getElementById("statWpm");
    const statAccuracyEl = document.getElementById("statAccuracy");
    const statProgressEl = document.getElementById("statProgress");
    const resultsScreenEl = document.getElementById("resultsScreen");
    const resultWpmEl = document.getElementById("resultWpm");
    const resultAccuracyEl = document.getElementById("resultAccuracy");
    const resultMistakesEl = document.getElementById("resultMistakes");
    const toggleButton = document.getElementById("soundToggle");

    if (
        !kickerEl || !titleEl || !drillEl || !targetEl || !typedEl ||
        !statusEl || !keyboardEl || !statWpmEl || !statAccuracyEl ||
        !statProgressEl || !resultsScreenEl || !resultWpmEl ||
        !resultAccuracyEl || !resultMistakesEl
    ) {
        return;
    }

    const audio = new AudioManager();
    let soundOn = true;

    const keyElements = buildKeyboard(keyboardEl);

    let stepIndex = 0;
    let text = "";
    let cursorIndex = 0;
    let mistakePositions = new Set();

    let totalCorrect = 0;
    let totalMistakes = 0;
    let startTime = null;
    let isComplete = false;
    let statsIntervalId = null;
    let statusClearTimeoutId = null;

    function renderKeyboardHighlight() {
        for (const keyEl of keyElements.values()) {
            keyEl.classList.remove("is-next");
        }

        const nextChar = text[cursorIndex];

        if (nextChar === undefined) {
            return;
        }

        const keyEl = keyElements.get(nextChar.toLowerCase());

        if (keyEl) {
            keyEl.classList.add("is-next");
        }
    }

    function renderDrillText() {
        targetEl.textContent = text;

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < text.length; i += 1) {
            const charEl = document.createElement("span");
            charEl.className = "char";

            if (i < cursorIndex) {
                charEl.textContent = text[i];
                charEl.classList.add(mistakePositions.has(i) ? "is-incorrect" : "is-correct");
            } else if (i === cursorIndex) {
                charEl.textContent = text[i] === " " ? " " : text[i];
                charEl.classList.add("is-cursor");
            } else {
                charEl.textContent = "·";
                charEl.classList.add("is-pending");
            }

            fragment.appendChild(charEl);
        }

        typedEl.replaceChildren(fragment);
        renderKeyboardHighlight();
    }

    function loadStep(index) {
        stepIndex = index;

        const step = HOME_ROW_LESSON.steps[stepIndex];

        text = step.text;
        cursorIndex = 0;
        mistakePositions = new Set();

        kickerEl.textContent = `HOME ROW · DRILL ${stepIndex + 1} OF ${HOME_ROW_LESSON.steps.length}`;
        titleEl.textContent = step.title;

        drillEl.setAttribute("aria-label", `Type: ${text}`);

        renderDrillText();
    }

    function renderStats() {
        const elapsedMinutes = startTime === null
            ? 0
            : (Date.now() - startTime) / 60000;

        const wpm = elapsedMinutes > 0
            ? Math.round((totalCorrect / 5) / elapsedMinutes)
            : 0;

        const totalAttempts = totalCorrect + totalMistakes;

        const accuracy = totalAttempts > 0
            ? Math.round((totalCorrect / totalAttempts) * 100)
            : 100;

        const totalLength = HOME_ROW_LESSON.steps.reduce(
            (sum, step) => sum + step.text.length,
            0
        );

        const completedLength = HOME_ROW_LESSON.steps
            .slice(0, stepIndex)
            .reduce((sum, step) => sum + step.text.length, 0) + cursorIndex;

        const progress = totalLength > 0
            ? Math.round((completedLength / totalLength) * 100)
            : 0;

        statWpmEl.textContent = String(wpm);
        statAccuracyEl.textContent = `${accuracy}%`;
        statProgressEl.textContent = `${progress}%`;

        return { wpm, accuracy };
    }

    function startStatsTimer() {
        if (statsIntervalId !== null) {
            return;
        }

        statsIntervalId = window.setInterval(renderStats, STATS_RENDER_INTERVAL_MS);
    }

    function stopStatsTimer() {
        if (statsIntervalId === null) {
            return;
        }

        window.clearInterval(statsIntervalId);
        statsIntervalId = null;
    }

    function showStepCompleteStatus() {
        statusEl.textContent = "DRILL COMPLETE";

        if (statusClearTimeoutId !== null) {
            window.clearTimeout(statusClearTimeoutId);
        }

        statusClearTimeoutId = window.setTimeout(() => {
            statusEl.textContent = "";
            statusClearTimeoutId = null;
        }, 1200);
    }

    function restartLesson() {
        stopStatsTimer();

        totalCorrect = 0;
        totalMistakes = 0;
        startTime = null;
        isComplete = false;

        resultsScreenEl.hidden = true;
        resultsScreenEl.classList.remove("is-visible");

        statusEl.textContent = "";
        loadStep(0);
        renderStats();
    }

    function finishLesson() {
        isComplete = true;
        stopStatsTimer();

        const { wpm, accuracy } = renderStats();

        resultWpmEl.textContent = String(wpm);
        resultAccuracyEl.textContent = `${accuracy}%`;
        resultMistakesEl.textContent = String(totalMistakes);

        resultsScreenEl.hidden = false;

        window.requestAnimationFrame(() => {
            resultsScreenEl.classList.add("is-visible");
        });
    }

    function advanceStep() {
        if (stepIndex + 1 < HOME_ROW_LESSON.steps.length) {
            loadStep(stepIndex + 1);
            showStepCompleteStatus();
        } else {
            finishLesson();
        }
    }

    function handleCharacter(typedChar) {
        if (startTime === null) {
            startTime = Date.now();
            startStatsTimer();
        }

        const expectedChar = text[cursorIndex];
        const isCorrect = typedChar === expectedChar;

        if (isCorrect) {
            totalCorrect += 1;

            if (soundOn) {
                audio.playCorrectLetter();
            }
        } else {
            totalMistakes += 1;
            mistakePositions.add(cursorIndex);

            if (soundOn) {
                audio.playIncorrectLetter();
            }
        }

        cursorIndex += 1;

        if (cursorIndex >= text.length) {
            renderDrillText();
            renderStats();
            advanceStep();
            return;
        }

        renderDrillText();
        renderStats();
    }

    loadStep(0);
    renderStats();

    window.addEventListener("keydown", (event) => {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        audio.unlock();

        if (event.key === "Escape") {
            event.preventDefault();

            if (isComplete) {
                restartLesson();
            } else {
                loadStep(stepIndex);
            }

            return;
        }

        if (isComplete) {
            if (event.key === "Enter") {
                event.preventDefault();
                window.location.href = "index.html";
            }

            return;
        }

        if (event.key.length !== 1) {
            return;
        }

        const typedChar = event.key.toLowerCase();

        if (!TYPABLE_CHARACTER_PATTERN.test(typedChar)) {
            return;
        }

        event.preventDefault();
        handleCharacter(typedChar);
    });

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            soundOn = !soundOn;
            toggleButton.textContent = soundOn ? "SOUND: ON" : "SOUND: OFF";
            audio.unlock();
        });
    }
}

window.addEventListener("DOMContentLoaded", wireLesson);
