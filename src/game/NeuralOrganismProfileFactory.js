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
 * NeuralOrganismProfileFactory
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Creates stable visual and movement profiles for Neural Current word
 * targets, mirroring the role OrganismProfileFactory plays for Microscopic
 * Drift.
 *
 * Neural Current targets are not blob organisms, so this factory produces a
 * different presentation shape: per-instance timing offsets for the crystal
 * node's flicker and the tag's glitch skew, plus a small set of spark-branch
 * profiles instead of drifting circular organelles.
 *
 * The vertical wander movement profile is intentionally duplicated from
 * OrganismProfileFactory rather than shared. It happens to use the same
 * math today, but the two stages evolve independently and the project's own
 * direction is to avoid a shared abstraction until a third stage actually
 * proves the need for one.
 * ============================================================================
 */

const SPARK_BRANCH_COUNT = 3;
const SPARK_BRANCH_BASE_ANGLES = [-40, 8, 56];

export class NeuralOrganismProfileFactory {
    createPresentationProfile() {
        const crystalDurationSeconds = 0.85 + Math.random() * 0.65;
        const tagGlitchDurationSeconds = 2 + Math.random() * 1.4;

        return {
            crystalDurationSeconds,
            crystalDelaySeconds:
                -Math.random() * crystalDurationSeconds,
            tagGlitchDurationSeconds,
            tagGlitchDelaySeconds:
                -Math.random() * tagGlitchDurationSeconds
        };
    }

    createMovementProfile() {
        return {
            elapsedSeconds: 0,
            verticalAmplitude: 10 + Math.random() * 24,
            verticalFrequency: 0.45 + Math.random() * 0.5,
            verticalPhase: Math.random() * Math.PI * 2
        };
    }

    createBranchProfiles() {
        const profiles = [];

        for (
            let index = 0;
            index < SPARK_BRANCH_COUNT;
            index += 1
        ) {
            const durationSeconds = 0.45 + Math.random() * 0.55;

            profiles.push({
                rotationDegrees:
                    SPARK_BRANCH_BASE_ANGLES[index] +
                    (-8 + Math.random() * 16),
                lengthRem: 0.55 + Math.random() * 0.35,
                durationSeconds,
                delaySeconds: -Math.random() * durationSeconds
            });
        }

        return profiles;
    }

    createProfile() {
        return {
            presentation: this.createPresentationProfile(),
            movement: this.createMovementProfile(),
            branches: this.createBranchProfiles()
        };
    }
}
