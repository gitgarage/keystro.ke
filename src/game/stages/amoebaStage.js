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

        minWordSpeed: 62,
        maxWordSpeed: 132,

        minPowerUpSpeed: 50,
        maxPowerUpSpeed: 78,

        slowWordSpeed: 82,
        fastWordSpeed: 112,

        wordExitX: -220,
        wordSpawnOffsetX: 80,

        minWordYRatio: 0.18,
        maxWordYRatio: 0.86
    }
};