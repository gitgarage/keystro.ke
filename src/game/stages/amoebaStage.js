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
 * Amoeba Stage
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Defines the first themed stage configuration.
 *
 * This file intentionally contains data rather than behavior. Stage behavior
 * should be interpreted by game systems instead of being hardcoded throughout
 * the application.
 * ============================================================================
 */

export const amoebaStage = {
    id: "amoeba",
    name: "Microscopic Drift",
    className: "stage-amoeba",

    wordPool: [
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
    ],

    powerUpWordPool: [
        "overdrive",
        "radiance",
        "harmony",
        "zenith"
    ],

    tuning: {
        maxActiveWords: 6,
        spawnIntervalMs: 1400,
        powerUpSpawnChance: 0.16,

        minWordSpeed: 65,
        maxWordSpeed: 150,

        minPowerUpSpeed: 52,
        maxPowerUpSpeed: 88,

        slowWordSpeed: 85,
        fastWordSpeed: 120,

        wordExitX: -220,
        wordSpawnOffsetX: 80,

        minWordYRatio: 0.18,
        maxWordYRatio: 0.86
    }
};