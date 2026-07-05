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
 * Microscopic Environment
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Creates and manages the particulate fluid environment behind gameplay.
 *
 * The environment persists for the full stage. Progression pressure changes
 * the behavior of the existing sample rather than replacing particle layers.
 * This preserves visual continuity while allowing the microscopic field to
 * become increasingly unstable as the stage advances.
 *
 * At stage completion, the existing environment settles instead of being
 * replaced. This gives the sample a visual endpoint before results appear.
 * ============================================================================
 */

export class MicroscopicEnvironment {
    constructor({ gameViewport }) {
        this.gameViewport = gameViewport;
        this.element = null;
        this.currentPhaseIndex = null;
    }

    start() {
        if (this.element) {
            return;
        }

        this.element = document.createElement("div");
        this.element.className = "microscopic-environment";
        this.element.setAttribute("aria-hidden", "true");

        this.createParticleLayer("is-far", 34);
        this.createParticleLayer("is-mid", 24);
        this.createParticleLayer("is-near", 14);

        this.gameViewport.prepend(this.element);

        this.setProgressionPhase(0);
    }

    setProgressionPhase(phaseIndex) {
        if (!this.element) {
            return;
        }

        if (this.currentPhaseIndex === phaseIndex) {
            return;
        }

        this.element.classList.remove(
            "is-pressure-calm",
            "is-pressure-agitated",
            "is-pressure-unstable"
        );

        if (phaseIndex >= 2) {
            this.element.classList.add(
                "is-pressure-unstable"
            );
        } else if (phaseIndex === 1) {
            this.element.classList.add(
                "is-pressure-agitated"
            );
        } else {
            this.element.classList.add(
                "is-pressure-calm"
            );
        }

        this.currentPhaseIndex = phaseIndex;
    }

    createParticleLayer(className, count) {
        const layer = document.createElement("div");

        layer.className =
            `environment-particle-layer ${className}`;

        for (let index = 0; index < count; index += 1) {
            layer.appendChild(this.createParticle());
        }

        this.element.appendChild(layer);
    }

    createParticle() {
        const particle = document.createElement("span");

        const size = 0.08 + Math.random() * 0.32;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const opacity = 0.08 + Math.random() * 0.18;
        const duration = 18 + Math.random() * 26;
        const delay = -Math.random() * duration;
        const driftX = -2 + Math.random() * 4;
        const driftY = -1.5 + Math.random() * 3;

        const agitationX =
            -0.75 + Math.random() * 1.5;

        const agitationY =
            -0.6 + Math.random() * 1.2;

        particle.className = "environment-particle";

        particle.style.setProperty(
            "--particle-size",
            `${size.toFixed(3)}rem`
        );

        particle.style.setProperty(
            "--particle-left",
            `${left.toFixed(2)}%`
        );

        particle.style.setProperty(
            "--particle-top",
            `${top.toFixed(2)}%`
        );

        particle.style.setProperty(
            "--particle-opacity",
            opacity.toFixed(3)
        );

        particle.style.setProperty(
            "--particle-duration",
            `${duration.toFixed(2)}s`
        );

        particle.style.setProperty(
            "--particle-delay",
            `${delay.toFixed(2)}s`
        );

        particle.style.setProperty(
            "--particle-drift-x",
            `${driftX.toFixed(3)}rem`
        );

        particle.style.setProperty(
            "--particle-drift-y",
            `${driftY.toFixed(3)}rem`
        );

        particle.style.setProperty(
            "--particle-agitation-x",
            `${agitationX.toFixed(3)}rem`
        );

        particle.style.setProperty(
            "--particle-agitation-y",
            `${agitationY.toFixed(3)}rem`
        );

        return particle;
    }
}