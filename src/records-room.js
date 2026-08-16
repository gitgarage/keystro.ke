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
 * Records Room
 * ============================================================================
 *
 * Renders level/XP, streak, lifetime stats, and the badge grid from
 * src/records.js's real persisted data. Every stat here is computed only
 * from data the app already actually records - no metric is fabricated or
 * conflated across session types (e.g. arcade's "words typed" and lesson
 * mode's WPM/accuracy stay separate rather than being combined into a
 * single misleading number).
 * ============================================================================
 */

import { getRecords } from "./records.js";
import { getSettings, setSoundEnabled } from "./settings.js";

function renderProgress(records) {
    const levelEl = document.getElementById("recordsLevel");
    const xpTrackEl = document.getElementById("recordsXpTrack");
    const xpFillEl = document.getElementById("recordsXpFill");
    const xpLabelEl = document.getElementById("recordsXpLabel");
    const streakEl = document.getElementById("recordsStreak");
    const longestStreakEl = document.getElementById("recordsLongestStreak");

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
        xpLabelEl.textContent = `${records.xpIntoLevel}/${records.xpPerLevel} XP`;
    }

    if (streakEl) {
        streakEl.textContent = String(records.streak.current);
    }

    if (longestStreakEl) {
        longestStreakEl.textContent = String(records.streak.longest);
    }
}

function buildStatItems(records) {
    const arcadeWordsTyped = records.arcadeSessions.reduce(
        (total, session) => total + session.completedWords,
        0
    );
    const bestCombo = records.arcadeSessions.reduce(
        (best, session) => Math.max(best, session.highestCombo),
        0
    );
    const bestWpm = records.lessonSessions.reduce(
        (best, session) => Math.max(best, session.wpm),
        0
    );
    const bestAccuracy = records.lessonSessions.reduce(
        (best, session) => Math.max(best, session.accuracy),
        0
    );

    return [
        { label: "Sessions played", value: String(records.arcadeSessions.length + records.lessonSessions.length) },
        { label: "Lessons completed", value: String(records.completedLessonIds.size) },
        { label: "Arcade words typed", value: String(arcadeWordsTyped) },
        { label: "Best combo", value: String(bestCombo) },
        { label: "Best WPM", value: String(bestWpm) },
        { label: "Best accuracy", value: `${bestAccuracy}%` }
    ];
}

function renderStats(records) {
    const statsGridEl = document.getElementById("statsGrid");

    if (!statsGridEl) {
        return;
    }

    statsGridEl.replaceChildren(
        ...buildStatItems(records).map((stat) => {
            const item = document.createElement("div");
            item.className = "stat-item";

            const dt = document.createElement("dt");
            dt.textContent = stat.label;

            const dd = document.createElement("dd");
            dd.textContent = stat.value;

            item.append(dt, dd);

            return item;
        })
    );
}

function renderBadges(records) {
    const badgeGridEl = document.getElementById("badgeGrid");

    if (!badgeGridEl) {
        return;
    }

    badgeGridEl.replaceChildren(
        ...records.badges.map((badge) => {
            const card = document.createElement("li");
            card.className = `badge-card ${badge.earned ? "is-earned" : "is-locked"}`;

            const icon = document.createElement("span");
            icon.className = "badge-card-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = badge.earned ? "✓" : "?";

            const copy = document.createElement("div");
            copy.className = "badge-card-copy";

            const name = document.createElement("p");
            name.className = "badge-card-name";
            name.textContent = badge.earned ? badge.name : `${badge.name} (locked)`;

            const description = document.createElement("p");
            description.className = "badge-card-description";
            description.textContent = badge.description;

            copy.append(name, description);
            card.append(icon, copy);

            return card;
        })
    );
}

// Duplicated per-page rather than shared - matches the same lightweight
// oscillator pattern and per-page precedent established in
// src/menu.js/src/lesson-hall.js.
function createSoundController(toggleButton) {
    let soundOn = getSettings().soundEnabled;
    let audioContext = null;

    toggleButton.textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;

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
        setSoundEnabled(soundOn);

        if (soundOn) {
            blip(500, 70);
        }
    });

    return { blip };
}

function wireRecordsRoom() {
    const records = getRecords();

    renderProgress(records);
    renderStats(records);
    renderBadges(records);

    const toggleButton = document.getElementById("soundToggle");

    if (toggleButton) {
        createSoundController(toggleButton);
    }
}

window.addEventListener("DOMContentLoaded", wireRecordsRoom);
