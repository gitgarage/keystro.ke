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
 * OrganismProfileFactory
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Creates stable visual and movement profiles for organism word targets.
 *
 * These profiles are generated once when a target spawns. They provide
 * variation between organisms without introducing per-frame visual randomness.
 *
 * CSS and rendering systems consume the generated presentation and organelle
 * values. WordManager consumes the movement profile while updating target
 * positions.
 * ============================================================================
 */

export class OrganismProfileFactory {
    createPresentationProfile() {
        const membraneDurationSeconds = 7 + Math.random() * 7;

        return {
            scaleX: 0.9 + Math.random() * 0.24,
            scaleY: 0.88 + Math.random() * 0.26,
            rotationDegrees: -4 + Math.random() * 8,
            radiusOne: 42 + Math.random() * 16,
            radiusTwo: 42 + Math.random() * 16,
            radiusThree: 42 + Math.random() * 16,
            radiusFour: 42 + Math.random() * 16,
            membraneOpacity: 0.38 + Math.random() * 0.24,
            membraneDurationSeconds,
            membraneDelaySeconds:
                -Math.random() * membraneDurationSeconds
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

    createOrganelleProfiles() {
        const organelleCount = 3 + Math.floor(Math.random() * 3);
        const profiles = [];

        for (let index = 0; index < organelleCount; index += 1) {
            const durationSeconds = 7 + Math.random() * 9;

            profiles.push({
                sizeRem: 0.12 + Math.random() * 0.3,
                leftPercent: 16 + Math.random() * 68,
                topPercent: 20 + Math.random() * 58,
                opacity: 0.14 + Math.random() * 0.34,
                driftXRem: -0.45 + Math.random() * 0.9,
                driftYRem: -0.3 + Math.random() * 0.6,
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
            organelles: this.createOrganelleProfiles()
        };
    }
}