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
 * Neural Stage
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Defines the second themed stage configuration.
 *
 * This file intentionally contains data rather than behavior. Stage behavior
 * should be interpreted by game systems instead of being hardcoded throughout
 * the application.
 * ============================================================================
 */

export const neuralStage = {
    id: "neural",
    name: "Neural Current",
    className: "stage-neural",

    wordPool: [
        "arc",
        "volt",
        "spark",
        "signal",
        "synapse",
        "current",
        "charge",
        "circuit",
        "impulse",
        "neuron",
        "static",
        "conduct",
        "relay",
        "ion",
        "axon",
        "field"
    ],

    powerUpWordPool: [
        "overload",
        "polarity",
        "resonance",
        "conductor"
    ],

    tuning: {
        maxActiveWords: 6,
        spawnIntervalMs: 1325,
        powerUpSpawnChance: 0.1,

        initialSpawnCount: 3,
        initialSpawnMinXRatio: 0.6,
        initialSpawnMaxXRatio: 0.94,

        minWordSpeed: 72,
        maxWordSpeed: 148,

        minPowerUpSpeed: 58,
        maxPowerUpSpeed: 92,

        slowWordSpeed: 92,
        fastWordSpeed: 124,

        wordExitX: -220,
        wordSpawnOffsetX: 80,

        minWordYRatio: 0.16,
        maxWordYRatio: 0.84,

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
            spawnIntervalMultiplier: 0.82,
            speedMultiplier: 1.12
        },
        {
            startProgress: 0.667,
            maxActiveWords: 8,
            spawnIntervalMultiplier: 0.62,
            speedMultiplier: 1.45
        }
    ]
};