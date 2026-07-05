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
        "flow",
        "drift",
        "pulse",
        "membrane",
        "nucleus",
        "plasma",
        "divide",
        "absorb",
        "spore",
        "fluid",
        "colony",
        "microbe",
        "vacuole",
        "enzyme",
        "cytoplasm"
    ],

    powerUpWordPool: [
        "mitosis",
        "mutation",
        "symbiosis",
        "evolution"
    ],

    tuning: {
        maxActiveWords: 6,
        spawnIntervalMs: 1450,
        powerUpSpawnChance: 0.08,

        initialSpawnCount: 3,
        initialSpawnMinXRatio: 0.58,
        initialSpawnMaxXRatio: 0.92,

        minWordSpeed: 62,
        maxWordSpeed: 132,

        minPowerUpSpeed: 50,
        maxPowerUpSpeed: 78,

        slowWordSpeed: 82,
        fastWordSpeed: 112,

        wordExitX: -220,
        wordSpawnOffsetX: 80,

        minWordYRatio: 0.18,
        maxWordYRatio: 0.86,

        sessionDurationSeconds: 60
    },

    progression: [
        {
            startProgress: 0,
            spawnIntervalMultiplier: 1,
            speedMultiplier: 1
        },
        {
            startProgress: 0.333,
            spawnIntervalMultiplier: 0.88,
            speedMultiplier: 1.08
        },
        {
            startProgress: 0.667,
            maxActiveWords: 8,
            spawnIntervalMultiplier: 0.7,
            speedMultiplier: 1.4
        }
    ]
};