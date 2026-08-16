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
 * Settings: shared, persisted sound and motion preferences
 * ============================================================================
 *
 * The sole owner of one localStorage key, separate from src/records.js -
 * settings are a user preference, not progress/stats. Before this module,
 * every page's sound toggle (menu.js, lesson.js, lesson-hall.js,
 * records-room.js) was independent and non-persisted: it always started at
 * "on" and forgot your choice the moment you navigated, and arcade.html had
 * no toggle at all despite AudioManager already having an internal
 * isEnabled flag with nothing wired to it.
 *
 * Motion applies itself as an import side effect (see bottom of this file):
 * every page that imports this module for sound persistence gets the
 * reduce-motion preference applied automatically, with no extra per-page
 * wiring beyond the one import.
 *
 * Wrapped in try/catch throughout: a storage failure (private browsing,
 * quota, disabled storage) degrades to an in-memory default rather than
 * breaking the app, matching src/records.js's same fallback approach.
 * ============================================================================
 */

const STORAGE_KEY = "keystroke.settings.v1";

function defaultSettings() {
    return { version: 1, soundEnabled: true, reduceMotion: false };
}

function loadSettings() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return defaultSettings();
        }

        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 1) {
            return parsed;
        }

        return defaultSettings();
    } catch (error) {
        return defaultSettings();
    }
}

function saveSettings(settings) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        /* Storage unavailable or full; the in-memory value for this page
           load is still correct, it just won't survive a reload. */
    }
}

function applyMotionPreference(reduceMotion) {
    if (typeof document === "undefined") {
        return;
    }

    if (reduceMotion) {
        document.documentElement.dataset.motion = "reduce";
    } else {
        delete document.documentElement.dataset.motion;
    }
}

export function getSettings() {
    return loadSettings();
}

export function setSoundEnabled(enabled) {
    const settings = loadSettings();
    settings.soundEnabled = enabled;
    saveSettings(settings);
}

export function setReduceMotion(enabled) {
    const settings = loadSettings();
    settings.reduceMotion = enabled;
    saveSettings(settings);
    applyMotionPreference(enabled);
}

applyMotionPreference(loadSettings().reduceMotion);
