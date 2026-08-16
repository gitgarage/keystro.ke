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
 * Options Terminal
 * ============================================================================
 *
 * Two real settings, both backed by src/settings.js: sound (shared with
 * every other page's own #soundToggle button) and reduce motion (applies
 * immediately via data-motion on <html>, the same effect settings.js
 * produces automatically on next page load for every other page).
 * ============================================================================
 */

import { getSettings, setReduceMotion, setSoundEnabled } from "./settings.js";

function renderToggle(button, enabled) {
    button.setAttribute("aria-checked", String(enabled));
    button.textContent = enabled ? "ON" : "OFF";
}

// Duplicated per-page rather than shared - matches the same lightweight
// oscillator pattern and per-page precedent established in
// src/menu.js/src/lesson-hall.js/src/records-room.js. Unlike those pages,
// this page has no separate header quick-toggle - the Sound row below is
// the only sound control here, so it plays its own confirmation blip
// directly rather than duplicating a second toggle for the same setting.
let audioContext = null;

function blip(frequency, durationMs) {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.05, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + durationMs / 1000
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + durationMs / 1000);
    } catch (error) {
        /* Web Audio unavailable or blocked before a user gesture; fail silently. */
    }
}

function wireSoundSetting() {
    const button = document.getElementById("soundSettingToggle");

    if (!button) {
        return;
    }

    let enabled = getSettings().soundEnabled;
    renderToggle(button, enabled);

    button.addEventListener("click", () => {
        enabled = !enabled;
        renderToggle(button, enabled);
        setSoundEnabled(enabled);

        if (enabled) {
            blip(500, 70);
        }
    });
}

function wireMotionSetting() {
    const button = document.getElementById("motionSettingToggle");

    if (!button) {
        return;
    }

    let enabled = getSettings().reduceMotion;
    renderToggle(button, enabled);

    button.addEventListener("click", () => {
        enabled = !enabled;
        renderToggle(button, enabled);
        setReduceMotion(enabled);
    });
}

function wireOptionsTerminal() {
    wireSoundSetting();
    wireMotionSetting();
}

window.addEventListener("DOMContentLoaded", wireOptionsTerminal);
