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
import { recordLessonSession } from "./records.js";
import { getSettings, setSoundEnabled } from "./settings.js";

/**
 * ============================================================================
 * Lesson Hall
 * ============================================================================
 *
 * Small, plain-data drill sequences rather than a generalized curriculum
 * format - two lessons still doesn't justify that abstraction (see
 * PHILOSOPHY.md and ROADMAP.md's Stage System note, which makes the same
 * call about not overbuilding before multiple examples exist). What *is*
 * justified now that there's a second lesson: a lesson id resolved from
 * the URL (mirroring arcade.html's ?stage= pattern) and a fixed
 * progression order, so the results screen can offer a real "next lesson"
 * the same way the arcade's results screen offers a next stage.
 *
 * Error handling follows the "permissive-but-counted" school the research
 * found to be the more humane default across classic typing tutors: a
 * wrong key still advances the cursor and gets marked incorrect rather
 * than blocking progress. Escape always gives you a way out of the
 * current attempt.
 * ============================================================================
 */

const LESSONS = [
    {
        id: "home-row",
        kicker: "HOME ROW",
        resultsTitle: "Home Row",
        activeKeys: new Set(["a", "s", "d", "f", "j", "k", "l", ";", " "]),
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
    },
    {
        id: "home-row-2",
        kicker: "HOME ROW · PART 2",
        resultsTitle: "Home Row: Part 2",
        // f/j through l/; were the no-stretch home position taught in
        // lesson one; g and h are technically the same row but need a
        // slight inward reach, which is why classic tutors teach them as
        // their own follow-up rather than bundling all ten home keys at
        // once.
        activeKeys: new Set(["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", " "]),
        steps: [
            {
                title: "Reach In: G and H",
                text: "gh gh hg hg ghg hgh gg hh gh hg"
            },
            {
                title: "The Full Row",
                text: "asdfgh jkl; jkl; hgfdsa asdfgh jkl;"
            },
            {
                title: "Real Words",
                text: "half hall dash flash glass shall flags gash"
            }
        ]
    },
    {
        id: "reach-up-ru",
        kicker: "REACH UP: R & U",
        resultsTitle: "Reach Up: R & U",
        // R and U sit directly above F and J - the same two index fingers
        // that already anchor the home row just reach straight up instead
        // of sideways, the classic "top-row reach" taught right after the
        // home row itself is solid.
        activeKeys: new Set(["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "r", "u", " "]),
        steps: [
            {
                title: "Reach Up: R and U",
                text: "ru ru ur ur rur uru rr uu ru ur"
            },
            {
                title: "The Full Row",
                text: "asdfgh jkl; ru ur fr uj asdfgh jkl; ur ru"
            },
            {
                title: "Real Words",
                text: "dark hard surf lush rush dull guard sugar"
            }
        ]
    }
];

const LESSON_ORDER = LESSONS.map((lesson) => lesson.id);
const DEFAULT_LESSON_ID = LESSONS[0].id;

function getRequestedLessonId() {
    const searchParameters = new URLSearchParams(window.location.search);

    return searchParameters.get("lesson") ?? DEFAULT_LESSON_ID;
}

function resolveLesson(lessonId) {
    const lesson = LESSONS.find((candidate) => candidate.id === lessonId);

    if (lesson) {
        return lesson;
    }

    console.warn(
        `Unknown lesson id "${lessonId}". ` +
        `Falling back to "${DEFAULT_LESSON_ID}".`
    );

    return LESSONS.find((candidate) => candidate.id === DEFAULT_LESSON_ID);
}

function getNextLessonId(lessonId) {
    const currentIndex = LESSON_ORDER.indexOf(lessonId);

    if (currentIndex === -1 || currentIndex + 1 >= LESSON_ORDER.length) {
        return null;
    }

    return LESSON_ORDER[currentIndex + 1];
}

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

const TYPABLE_CHARACTER_PATTERN = /^[a-z ;]$/;

// activeKeys is per-lesson (lesson one drills a-s-d-f-j-k-l-; only, lesson
// two adds g/h) - the rest of the keyboard renders dim for context, ready
// for whichever future lesson lights each of them up.
function buildKeyboard(container, activeKeys) {
    const keyElements = new Map();

    function createKey(key) {
        const keyEl = document.createElement("div");
        keyEl.className = "key";
        keyEl.textContent = key === " " ? "" : key.toUpperCase();
        keyEl.dataset.key = key;

        const finger = KEY_FINGER[key];
        keyEl.style.setProperty("--finger-color", `var(${FINGER_COLOR_VAR[finger]})`);

        if (activeKeys.has(key)) {
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
    const resultsTitleEl = document.getElementById("resultsTitle");
    const resultsStatusEl = document.getElementById("resultsStatus");
    const resultWpmEl = document.getElementById("resultWpm");
    const resultAccuracyEl = document.getElementById("resultAccuracy");
    const resultMistakesEl = document.getElementById("resultMistakes");
    const toggleButton = document.getElementById("soundToggle");

    if (
        !kickerEl || !titleEl || !drillEl || !targetEl || !typedEl ||
        !statusEl || !keyboardEl || !statWpmEl || !statAccuracyEl ||
        !statProgressEl || !resultsScreenEl || !resultsTitleEl ||
        !resultsStatusEl || !resultWpmEl || !resultAccuracyEl ||
        !resultMistakesEl
    ) {
        return;
    }

    const currentLesson = resolveLesson(getRequestedLessonId());
    const nextLessonId = getNextLessonId(currentLesson.id);

    resultsTitleEl.textContent = currentLesson.resultsTitle;

    const audio = new AudioManager();
    let soundOn = getSettings().soundEnabled;

    if (toggleButton) {
        toggleButton.textContent = soundOn ? "SOUND: ON" : "SOUND: OFF";
    }

    const keyElements = buildKeyboard(keyboardEl, currentLesson.activeKeys);

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

        const step = currentLesson.steps[stepIndex];

        text = step.text;
        cursorIndex = 0;
        mistakePositions = new Set();

        kickerEl.textContent = `${currentLesson.kicker} · DRILL ${stepIndex + 1} OF ${currentLesson.steps.length}`;
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

        const totalLength = currentLesson.steps.reduce(
            (sum, step) => sum + step.text.length,
            0
        );

        const completedLength = currentLesson.steps
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

    /**
     * "Next lesson" is only offered when one actually exists - mirrors the
     * arcade results screen's "next stage" hint, which is left out
     * entirely rather than shown as a dead option when there's nothing to
     * advance to.
     */
    function buildResultsControlsText() {
        const controls = ["Esc — menu", "R — replay"];

        if (nextLessonId) {
            controls.unshift("Enter — next lesson");
        }

        return controls.join("   ·   ");
    }

    function finishLesson() {
        isComplete = true;
        stopStatsTimer();

        const { wpm, accuracy } = renderStats();

        resultWpmEl.textContent = String(wpm);
        resultAccuracyEl.textContent = `${accuracy}%`;
        resultMistakesEl.textContent = String(totalMistakes);
        resultsStatusEl.textContent = buildResultsControlsText();

        recordLessonSession({
            lessonId: currentLesson.id,
            wpm,
            accuracy,
            mistakes: totalMistakes,
            completed: true
        });

        resultsScreenEl.hidden = false;

        window.requestAnimationFrame(() => {
            resultsScreenEl.classList.add("is-visible");
        });
    }

    function advanceStep() {
        if (stepIndex + 1 < currentLesson.steps.length) {
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
                window.location.href = "lesson-hall.html";
            } else {
                loadStep(stepIndex);
            }

            return;
        }

        if (isComplete) {
            if (event.key === "Enter" && nextLessonId) {
                event.preventDefault();
                window.location.href = `lesson.html?lesson=${nextLessonId}`;
                return;
            }

            if (event.key.toLowerCase() === "r") {
                event.preventDefault();
                restartLesson();
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
            setSoundEnabled(soundOn);
            audio.unlock();
        });
    }
}

window.addEventListener("DOMContentLoaded", wireLesson);
