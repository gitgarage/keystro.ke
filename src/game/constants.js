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
 * Game Constants
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Stores shared configuration values used by the first playable loop.
 *
 * Configuration belongs here when multiple systems may depend on a value or
 * when a gameplay value is expected to change during balancing.
 * ============================================================================
 */

export const WORD_POOL = [
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
];

export const POWER_UP_WORD_POOL = [
    "overdrive",
    "radiance",
    "harmony",
    "zenith"
];

export const MAX_ACTIVE_WORDS = 6;

export const SPAWN_INTERVAL_MS = 1400;

export const POWER_UP_SPAWN_CHANCE = 0.16;

export const MIN_WORD_SPEED = 65;

export const MAX_WORD_SPEED = 150;

export const MIN_POWER_UP_SPEED = 52;

export const MAX_POWER_UP_SPEED = 88;

export const SLOW_WORD_SPEED = 85;

export const FAST_WORD_SPEED = 120;

export const WORD_EXIT_X = -220;

export const WORD_SPAWN_OFFSET_X = 80;

export const MIN_WORD_Y_RATIO = 0.18;

export const MAX_WORD_Y_RATIO = 0.86;

export const ERROR_FLASH_DURATION_MS = 120;

export const BASE_SCORE_PER_LETTER = 100;

export const POWER_UP_SCORE_MULTIPLIER = 4;

export const SESSION_DURATION_SECONDS = 60;