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
 * Main Menu
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Behavior for the landing/main-menu screen (index.html): the scrolling
 * ticker, PC-speaker-style sound feedback on the room tiles, and populating
 * the HUD strip (level, XP, streak, badges) from src/records.js's real
 * persisted data. Room artwork itself is static image assets
 * (assets/icons/room-*.png), not rendered here.
 *
 * This intentionally does not touch anything under src/game/ - the menu
 * has no gameplay state. It links to the arcade (arcade.html) rather than
 * hosting gameplay itself.
 * ============================================================================
 */

import { getRecords } from "./records.js";

const TICKER_MESSAGES = [
    "TIP: rest your index fingers on F and J -- find the bumps without looking",
    "NEURAL CURRENT STAGE NOW LIVE IN THE ARCADE WING",
    "100% OPEN SOURCE -- AGPL-3.0-OR-LATER",
    "TIP: accuracy first -- speed follows once the reach feels automatic",
    "MICROSCOPIC DRIFT: STAGE ONE",
    "LESSON HALL -- COMING SOON"
];

function renderTicker() {
    const track = document.getElementById("tickerTrack");

    if (!track) {
        return;
    }

    const items = [...TICKER_MESSAGES, ...TICKER_MESSAGES]
        .map((message) => `<span>${message}</span>`)
        .join("");

    track.innerHTML = items;
}

/* ---- PC-speaker-style sound feedback ---- */

function createSoundController(toggleButton) {
    let soundOn = true;
    let audioContext = null;

    function getContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        return audioContext;
    }

    function blip(frequency, durationMs) {
        if (!soundOn) {
            return;
        }

        try {
            const context = getContext();
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "square";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.05, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                context.currentTime + durationMs / 1000
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + durationMs / 1000);
        } catch (error) {
            /* Web Audio unavailable or blocked before a user gesture; fail silently. */
        }
    }

    toggleButton.addEventListener("click", () => {
        soundOn = !soundOn;
        toggleButton.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;

        if (soundOn) {
            blip(500, 70);
        }
    });

    return { blip };
}

function wireRoomSounds(sound) {
    document.querySelectorAll(".room:not(:disabled)").forEach((room) => {
        room.addEventListener("mouseenter", () => sound.blip(660, 60));
        room.addEventListener("click", () => sound.blip(880, 110));
    });
}

/* ---- live terminal prompt ----
   The "> " prompt itself is a separate element from the editable text,
   so the cursor index below is naturally bounded to [0, text.length] -
   it can never reach into the prompt, which is what makes the prompt
   effectively undeletable and unpassable, the same as a real shell.

   The cursor renders as a solid block in reverse video over whatever
   character is at the cursor position, rather than a separate blinking
   bar between two characters - text-mode terminals never displaced the
   character under the cursor, they recolored it in place. At the end
   of the line, where there's no character yet, it falls back to a
   blinking empty cell (a non-breaking space), which is the same thing
   a terminal shows past the last typed column. */

const DAILY_MAX_LENGTH = 140;
const INTERACTIVE_FOCUS_TAGS = new Set(["BUTTON", "A", "INPUT", "TEXTAREA"]);
const ROOM_LOAD_DELAY_MS = 700;
const TYPING_LOCK_MS = 3000;

// Rooms that are real destinations, keyed by the command that opens them.
const ROOM_DESTINATIONS = {
    "ARCADE WING": "arcade.html",
    "LESSON HALL": "lesson-hall.html",
    "RECORDS ROOM": "records-room.html"
};

// Rooms that exist in the nav but aren't real destinations yet - kept
// as a literal list here rather than read from the DOM, since the
// command interpreter's vocabulary is a design decision independent
// of whatever happens to be marked disabled in the markup right now.
const UNAVAILABLE_ROOM_COMMANDS = new Set([
    "OPTIONS TERMINAL"
]);

function isInteractiveElementFocused() {
    const active = document.activeElement;

    return (
        INTERACTIVE_FOCUS_TAGS.has(active.tagName) ||
        active.isContentEditable
    );
}

function wireDailyPrompt() {
    const beforeEl = document.getElementById("dailyBefore");
    const cursorEl = document.getElementById("dailyCursor");
    const afterEl = document.getElementById("dailyAfter");
    const statusEl = document.getElementById("dailyStatus");

    if (!beforeEl || !cursorEl || !afterEl || !statusEl) {
        return;
    }

    let text = beforeEl.textContent + cursorEl.textContent + afterEl.textContent;
    let cursorIndex = text.length;
    let typingLocked = false;

    function render() {
        beforeEl.textContent = text.slice(0, cursorIndex);

        // A lone literal space as an inline-block's only content gets
        // edge-trimmed to zero width by normal whitespace collapsing,
        // which visually welded the two words on either side of it
        // together whenever the cursor landed on a space in the text
        // (not just past the end of the line). A non-breaking space is
        // exempt from that collapsing, same as the past-the-end
        // fallback already relied on.
        const atCursor = text.slice(cursorIndex, cursorIndex + 1);

        cursorEl.textContent = atCursor === "" || atCursor === " " ? " " : atCursor;

        afterEl.textContent = text.slice(cursorIndex + 1);
    }

    render();

    function setStatus(message, isDenied) {
        statusEl.textContent = message;
        statusEl.classList.toggle("is-denied", Boolean(isDenied));
    }

    function clearLine() {
        text = "";
        cursorIndex = 0;
        render();
    }

    function loadRoom(command, href) {
        setStatus(`LOADING ${command}...`, false);
        clearLine();
        typingLocked = true;

        window.setTimeout(() => {
            typingLocked = false;
        }, TYPING_LOCK_MS);

        window.setTimeout(() => {
            window.location.href = href;
        }, ROOM_LOAD_DELAY_MS);
    }

    function submitCommand() {
        const command = text.trim();

        if (command === "") {
            return;
        }

        const destination = ROOM_DESTINATIONS[command];

        if (destination) {
            loadRoom(command, destination);
            return;
        }

        if (UNAVAILABLE_ROOM_COMMANDS.has(command)) {
            setStatus("ACCESS DENIED", true);
        } else {
            setStatus(`UNKNOWN COMMAND: ${command}`, true);
        }

        clearLine();
    }

    window.addEventListener("keydown", (event) => {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        if (isInteractiveElementFocused()) {
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            submitCommand();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            cursorIndex = Math.max(0, cursorIndex - 1);
            render();
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            cursorIndex = Math.min(text.length, cursorIndex + 1);
            render();
            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();

            if (cursorIndex > 0) {
                text = text.slice(0, cursorIndex - 1) + text.slice(cursorIndex);
                cursorIndex -= 1;
                render();
            }

            return;
        }

        if (event.key === "Delete") {
            event.preventDefault();

            if (cursorIndex < text.length) {
                text = text.slice(0, cursorIndex) + text.slice(cursorIndex + 1);
                render();
            }

            return;
        }

        if (typingLocked) {
            return;
        }

        if (event.key.length === 1 && text.length < DAILY_MAX_LENGTH) {
            const upper = event.key.toUpperCase();

            text = text.slice(0, cursorIndex) + upper + text.slice(cursorIndex);
            cursorIndex += 1;
            render();
        }
    });
}

// Populates the HUD strip (level, XP, streak, badges) from real persisted
// data (src/records.js) - these elements used to be hardcoded placeholders
// with no JS writer at all.
function renderHud(records) {
    const levelEl = document.getElementById("menuLevel");
    const xpTrackEl = document.getElementById("menuXpTrack");
    const xpFillEl = document.getElementById("menuXpFill");
    const xpLabelEl = document.getElementById("menuXpLabel");
    const streakEl = document.getElementById("menuStreak");
    const badgesContainerEl = document.querySelector(".badges");
    const badgeEls = document.querySelectorAll(".badges .badge");

    if (levelEl) {
        levelEl.textContent = String(records.level);
    }

    if (xpTrackEl && xpFillEl && xpLabelEl) {
        const percent = Math.round((records.xpIntoLevel / records.xpPerLevel) * 100);

        xpFillEl.style.width = `${percent}%`;
        xpTrackEl.setAttribute("aria-valuemax", String(records.xpPerLevel));
        xpTrackEl.setAttribute("aria-valuenow", String(records.xpIntoLevel));
        xpTrackEl.setAttribute(
            "aria-valuetext",
            `${records.xpIntoLevel} of ${records.xpPerLevel} XP`
        );
        xpLabelEl.textContent = `${records.xpIntoLevel}/${records.xpPerLevel}`;
    }

    if (streakEl) {
        streakEl.textContent = String(records.streak.current);
    }

    badgeEls.forEach((badgeEl, index) => {
        const badge = records.badges[index];

        if (!badge) {
            return;
        }

        badgeEl.classList.toggle("won", badge.earned);
        badgeEl.classList.toggle("locked", !badge.earned);
        badgeEl.textContent = badge.earned ? "✓" : "??";
        badgeEl.removeAttribute("aria-hidden");
        badgeEl.setAttribute(
            "aria-label",
            badge.earned ? `${badge.name}: ${badge.description} (earned)` : `${badge.name}: locked`
        );
        badgeEl.title = badge.earned ? badge.description : "Locked achievement";
    });

    if (badgesContainerEl) {
        const earnedCount = records.badges.filter((badge) => badge.earned).length;

        badgesContainerEl.setAttribute(
            "aria-label",
            earnedCount === 0
                ? "Achievements — none unlocked yet"
                : `Achievements — ${earnedCount} of ${records.badges.length} unlocked`
        );
    }
}

function startMenu() {
    renderTicker();
    wireDailyPrompt();
    renderHud(getRecords());

    const toggleButton = document.getElementById("soundToggle");

    if (toggleButton) {
        const sound = createSoundController(toggleButton);
        wireRoomSounds(sound);
    }
}

window.addEventListener("DOMContentLoaded", startMenu);
