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
 * Behavior for the landing/main-menu screen (index.html): procedural
 * pixel-art room icons, the scrolling ticker, and PC-speaker-style sound
 * feedback on the room tiles.
 *
 * This intentionally does not touch anything under src/game/ - the menu
 * has no gameplay state. It links to the arcade (arcade.html) rather than
 * hosting gameplay itself.
 * ============================================================================
 */

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

/* ---- procedural pixel-art icons, 16x16, rendered to canvas ----
   0 = transparent, 1 = dark silhouette ink, 3 = white highlight fleck */
const GRID = 16;

function makeGrid() {
    return Array.from({ length: GRID }, () => new Array(GRID).fill(0));
}

function setPixel(grid, x, y, value) {
    if (x >= 0 && x < GRID && y >= 0 && y < GRID) {
        grid[y][x] = value;
    }
}

function fillRect(grid, x0, y0, x1, y1, value) {
    for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
            setPixel(grid, x, y, value);
        }
    }
}

function drawCap() {
    const grid = makeGrid();
    const cx = 7;
    const cy = 5;
    const halfW = 6;
    const halfH = 4;

    for (let r = -halfH; r <= halfH; r += 1) {
        const w = Math.round(halfW * (1 - Math.abs(r) / halfH));
        fillRect(grid, cx - w, cy + r, cx + w, cy + r, 1);
    }

    fillRect(grid, cx - 2, cy + halfH, cx + 2, cy + halfH + 2, 1);

    setPixel(grid, cx + 5, cy - 1, 1);
    setPixel(grid, cx + 6, cy, 1);
    setPixel(grid, cx + 6, cy + 1, 1);
    setPixel(grid, cx + 7, cy + 2, 1);
    fillRect(grid, cx + 6, cy + 3, cx + 7, cy + 4, 3);

    setPixel(grid, cx - 3, cy - 1, 3);

    return grid;
}

function drawStick() {
    const grid = makeGrid();

    fillRect(grid, 2, 10, 13, 12, 1);
    fillRect(grid, 7, 4, 8, 10, 1);

    const bx = 7.5;
    const by = 3;
    const radius = 3;

    for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
            if (Math.hypot(x - bx, y - by) <= radius) {
                setPixel(grid, x, y, 1);
            }
        }
    }

    setPixel(grid, 5, 1, 3);
    setPixel(grid, 6, 1, 3);
    setPixel(grid, 4, 11, 3);

    return grid;
}

function drawStar() {
    const grid = makeGrid();

    fillRect(grid, 7, 2, 8, 13, 1);
    fillRect(grid, 2, 7, 13, 8, 1);
    fillRect(grid, 4, 4, 5, 5, 1);
    fillRect(grid, 10, 4, 11, 5, 1);
    fillRect(grid, 4, 10, 5, 11, 1);
    fillRect(grid, 10, 10, 11, 11, 1);
    fillRect(grid, 7, 7, 8, 8, 3);

    return grid;
}

function drawGear() {
    const grid = makeGrid();
    const cx = 7.5;
    const cy = 7.5;

    for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
            const distance = Math.hypot(x - cx, y - cy);

            if (distance <= 1.4) {
                setPixel(grid, x, y, 1);
            } else if (distance >= 3.6 && distance <= 6.2) {
                setPixel(grid, x, y, 1);
            }
        }
    }

    setPixel(grid, 5, 4, 3);
    setPixel(grid, 6, 4, 3);

    return grid;
}

const ICON_DRAWERS = {
    cap: drawCap,
    stick: drawStick,
    star: drawStar,
    gear: drawGear
};

const INK_COLORS = {
    1: "#0c0b12",
    3: "#ffffff"
};

function renderPixelIcons() {
    document.querySelectorAll(".pixel-icon").forEach((canvas) => {
        const drawer = ICON_DRAWERS[canvas.dataset.icon];

        if (!drawer) {
            return;
        }

        const grid = drawer();
        const context = canvas.getContext("2d");

        context.clearRect(0, 0, GRID, GRID);

        for (let y = 0; y < GRID; y += 1) {
            for (let x = 0; x < GRID; x += 1) {
                const value = grid[y][x];

                if (value && INK_COLORS[value]) {
                    context.fillStyle = INK_COLORS[value];
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
    });
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
    "LESSON HALL": "lesson-hall.html"
};

// Rooms that exist in the nav but aren't real destinations yet - kept
// as a literal list here rather than read from the DOM, since the
// command interpreter's vocabulary is a design decision independent
// of whatever happens to be marked disabled in the markup right now.
const UNAVAILABLE_ROOM_COMMANDS = new Set([
    "RECORDS ROOM",
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

function startMenu() {
    renderTicker();
    renderPixelIcons();
    wireDailyPrompt();

    const toggleButton = document.getElementById("soundToggle");

    if (toggleButton) {
        const sound = createSoundController(toggleButton);
        wireRoomSounds(sound);
    }
}

window.addEventListener("DOMContentLoaded", startMenu);
