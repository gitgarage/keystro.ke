/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isEnabled = true;
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    ensureAudioContext() {
        if (this.audioContext) {
            return;
        }

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            this.isEnabled = false;
            return;
        }

        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();

        this.masterGain.gain.value = 1;
        this.masterGain.connect(this.audioContext.destination);
    }

    unlock() {
        this.ensureAudioContext();

        if (!this.audioContext) {
            return;
        }

        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }
    }

    playTone({
        frequency,
        endFrequency = null,
        durationSeconds,
        gain,
        type = "sine",
        detune = 0
    }) {
        if (!this.isEnabled) {
            return;
        }

        if (!this.audioContext || !this.masterGain) {
            return;
        }

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const toneGain = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.detune.setValueAtTime(detune, now);

        if (endFrequency !== null) {
            oscillator.frequency.exponentialRampToValueAtTime(
                endFrequency,
                now + durationSeconds
            );
        }

        toneGain.gain.setValueAtTime(0.0001, now);

        toneGain.gain.exponentialRampToValueAtTime(
            gain,
            now + 0.012
        );

        toneGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + durationSeconds
        );

        oscillator.connect(toneGain);
        toneGain.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + durationSeconds + 0.02);
    }

    playCorrectLetter() {
        this.playTone({
            frequency: 520,
            durationSeconds: 0.045,
            gain: 0.05,
            type: "triangle"
        });
    }

    playIncorrectLetter() {
        this.playTone({
            frequency: 310,
            endFrequency: 260,
            durationSeconds: 0.085,
            gain: 0.055,
            type: "sine"
        });
    }

    playWordCompleted(word) {
        const baseFrequency =
            word.type === "power-up" ? 740 : 660;

        this.playTone({
            frequency: baseFrequency,
            durationSeconds: 0.08,
            gain: 0.07,
            type: "triangle"
        });

        window.setTimeout(() => {
            this.playTone({
                frequency: baseFrequency * 1.5,
                durationSeconds: 0.08,
                gain: 0.045,
                type: "triangle"
            });
        }, 55);
    }

    playComboBreak() {
        this.playTone({
            frequency: 92,
            durationSeconds: 0.14,
            gain: 0.06,
            type: "sine"
        });
    }
}