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
 * Lesson Hall curriculum path
 * ============================================================================
 *
 * Renders the motherboard-style trace path: one chip node per lesson,
 * connected by circuit-trace lines drawn from each node's real rendered
 * position (SVG, measured via offsetLeft/offsetTop against the lane's own
 * positioned box, so it stays correct regardless of scroll position or
 * viewport size).
 *
 * Node ids for built lessons must match src/lesson.js's LESSONS ids exactly
 * - that's what drives the ?lesson= link. Locked (not-yet-built) nodes just
 * need a unique key of their own; nothing reads it yet.
 * ============================================================================
 */

const LESSON_NODES = [
    { id: "home-row", title: "Home Row", built: true },
    { id: "home-row-2", title: "Home Row: Part 2", built: true },
    { id: "reach-up-ru", title: "Reach Up: R & U", built: false },
    { id: "reach-up-ei", title: "Reach Up: E & I", built: false },
    { id: "reach-up-woty", title: "Reach Up: W, O, T & Y", built: false },
    { id: "reach-down-cm", title: "Reach Down: C & M", built: false },
    { id: "reach-down-vnx", title: "Reach Down: V, N & X", built: false },
    { id: "outer-keys", title: "Outer Keys: Q, P, Z & /", built: false },
    { id: "capitals-shift", title: "Capitals & Shift", built: false },
    { id: "punctuation", title: "Punctuation", built: false },
    { id: "numbers", title: "Numbers", built: false },
    { id: "real-sentences", title: "Real Sentences", built: false },
    { id: "timed-prose", title: "Timed Prose", built: false }
];

// Plain in-memory placeholder, not persisted anywhere - demonstrates the
// completed-vs-available visual distinction using the lessons that exist
// today. Resets on every load, same as the HUD's LEVEL/XP/STREAK values
// elsewhere on the site. Swap for a real progress source once one exists.
const COMPLETED_LESSON_IDS = new Set(["home-row"]);

function getNodeStatus(lessonNode) {
    if (!lessonNode.built) {
        return "locked";
    }

    return COMPLETED_LESSON_IDS.has(lessonNode.id) ? "completed" : "available";
}

function createNode(lessonNode, index) {
    const status = getNodeStatus(lessonNode);
    const isLocked = status === "locked";

    const node = document.createElement(isLocked ? "div" : "a");
    node.className = [
        "trace-node",
        `is-${status}`,
        index % 2 === 0 ? "is-offset-up" : "is-offset-down"
    ].join(" ");

    if (!isLocked) {
        node.href = `lesson.html?lesson=${lessonNode.id}`;
    }

    const chip = document.createElement("span");
    chip.className = "node-chip";

    const indexEl = document.createElement("span");
    indexEl.className = "node-index";
    indexEl.textContent = String(index + 1).padStart(2, "0");
    chip.appendChild(indexEl);

    node.appendChild(chip);

    if (status === "completed") {
        const badge = document.createElement("span");
        badge.className = "node-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = "✓";
        node.appendChild(badge);
    }

    const label = document.createElement("span");
    label.className = "node-label";
    label.textContent = lessonNode.title;
    node.appendChild(label);

    if (status !== "available") {
        const note = document.createElement("span");
        note.className = "node-status-note";
        note.textContent = status === "locked" ? "Locked" : "Completed";
        node.appendChild(note);
    }

    return node;
}

// Positions come from offsetLeft/offsetTop against the lane's own
// position:relative box, not getBoundingClientRect - that keeps the trace
// correct regardless of the lane's current horizontal scroll position,
// with no scroll-offset math needed.
function renderTraceSvg(laneEl, svgEl, nodeEls) {
    svgEl.setAttribute("width", String(laneEl.scrollWidth));
    svgEl.setAttribute("height", String(laneEl.scrollHeight));
    svgEl.replaceChildren();

    const points = nodeEls.map((nodeEl) => {
        const chip = nodeEl.querySelector(".node-chip");

        return {
            x: chip.offsetLeft + chip.offsetWidth / 2,
            y: chip.offsetTop + chip.offsetHeight / 2
        };
    });

    for (let i = 0; i < points.length - 1; i += 1) {
        const isLit = LESSON_NODES[i] && getNodeStatus(LESSON_NODES[i]) === "completed";

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(points[i].x));
        line.setAttribute("y1", String(points[i].y));
        line.setAttribute("x2", String(points[i + 1].x));
        line.setAttribute("y2", String(points[i + 1].y));
        line.setAttribute("class", `trace-segment ${isLit ? "is-lit" : "is-dim"}`);

        svgEl.appendChild(line);
    }
}

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

function wireNodeSounds(sound, nodeEls) {
    for (const nodeEl of nodeEls) {
        if (nodeEl.classList.contains("is-locked")) {
            continue;
        }

        nodeEl.addEventListener("mouseenter", () => sound.blip(660, 60));
        nodeEl.addEventListener("focus", () => sound.blip(660, 60));
        nodeEl.addEventListener("click", () => sound.blip(880, 110));
    }
}

function wireLessonHall() {
    const laneEl = document.getElementById("traceLane");
    const toggleButton = document.getElementById("soundToggle");

    if (!laneEl) {
        return;
    }

    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.setAttribute("class", "trace-svg");
    svgEl.setAttribute("aria-hidden", "true");
    laneEl.appendChild(svgEl);

    const nodeEls = LESSON_NODES.map((lessonNode, index) => {
        const nodeEl = createNode(lessonNode, index);
        laneEl.appendChild(nodeEl);

        return nodeEl;
    });

    renderTraceSvg(laneEl, svgEl, nodeEls);

    window.addEventListener("resize", () => {
        renderTraceSvg(laneEl, svgEl, nodeEls);
    });

    if (toggleButton) {
        const sound = createSoundController(toggleButton);
        wireNodeSounds(sound, nodeEls);
    }
}

window.addEventListener("DOMContentLoaded", wireLessonHall);
