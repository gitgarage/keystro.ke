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
 * NeuralOrganismRenderer
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Creates and updates the DOM presentation of Neural Current word targets,
 * mirroring the role OrganismRenderer plays for Microscopic Drift.
 *
 * Neural Current deliberately does not reuse the amoeba's border-radius blob
 * shape. A single rounded box always reads as an oval no matter how its
 * radii are tuned, and that reads as biological, not electrical. Instead a
 * target here is a small angular crystal node (CSS clip-path, not
 * border-radius) with spark branches strobing off it, attached to a plain
 * chevron-cut text tag.
 *
 * The word label itself is never clip-path'd. Clipping the crystal is safe
 * because it carries no text, but clipping the label on a typing game risks
 * cutting off a letter the player needs to read - the tag stays a simple,
 * always-fully-visible shape instead.
 *
 * It does not choose words, track gameplay state, calculate movement, or
 * determine whether a typed letter is correct.
 * ============================================================================
 */

export class NeuralOrganismRenderer {
    constructor({ tuning }) {
        this.tuning = tuning;
    }

    applyPresentationProfile(element, profile) {
        element.style.setProperty(
            "--tag-glitch-duration",
            `${profile.tagGlitchDurationSeconds.toFixed(2)}s`
        );

        element.style.setProperty(
            "--tag-glitch-delay",
            `${profile.tagGlitchDelaySeconds.toFixed(2)}s`
        );

        element.style.setProperty(
            "--crystal-duration",
            `${profile.crystalDurationSeconds.toFixed(2)}s`
        );

        element.style.setProperty(
            "--crystal-delay",
            `${profile.crystalDelaySeconds.toFixed(2)}s`
        );
    }

    createBranchElement(profile) {
        const branch = document.createElement("span");

        branch.className = "spark-branch";
        branch.setAttribute("aria-hidden", "true");

        branch.style.setProperty(
            "--branch-rotation",
            `${profile.rotationDegrees.toFixed(2)}deg`
        );

        branch.style.setProperty(
            "--branch-length",
            `${profile.lengthRem.toFixed(3)}rem`
        );

        branch.style.setProperty(
            "--branch-duration",
            `${profile.durationSeconds.toFixed(2)}s`
        );

        branch.style.setProperty(
            "--branch-delay",
            `${profile.delaySeconds.toFixed(2)}s`
        );

        return branch;
    }

    createCrystalElement(branchProfiles) {
        const crystal = document.createElement("span");

        crystal.className = "neural-crystal";
        crystal.setAttribute("aria-hidden", "true");

        for (const profile of branchProfiles) {
            crystal.appendChild(
                this.createBranchElement(profile)
            );
        }

        return crystal;
    }

    createTextElement(text) {
        const textElement = document.createElement("span");

        textElement.className = "word-text";
        textElement.textContent = text;

        return textElement;
    }

    createElement({
        wordTarget,
        speed,
        organismProfile
    }) {
        const presentationProfile = organismProfile.presentation;
        const branchProfiles = organismProfile.branches;

        const element = document.createElement("span");

        element.className = "neural-target";

        this.applyPresentationProfile(element, presentationProfile);

        if (wordTarget.type === "power-up") {
            element.classList.add("is-power-up");
        }

        if (speed > this.tuning.fastWordSpeed) {
            element.classList.add("is-fast");
        } else if (speed < this.tuning.slowWordSpeed) {
            element.classList.add("is-slow");
        }

        element.appendChild(
            this.createCrystalElement(branchProfiles)
        );

        const tag = document.createElement("span");

        tag.className = "neural-tag";

        tag.appendChild(
            this.createTextElement(wordTarget.text)
        );

        element.appendChild(tag);

        return element;
    }

    renderProgress(word) {
        const typedText = word.text.slice(0, word.progress);
        const remainingText = word.text.slice(word.progress);

        const textElement = document.createElement("span");
        const typedElement = document.createElement("span");
        const remainingElement = document.createElement("span");

        textElement.className = "word-text";

        typedElement.className = "word-typed";
        typedElement.textContent = typedText;

        remainingElement.className = "word-remaining";
        remainingElement.textContent = remainingText;

        textElement.append(typedElement, remainingElement);

        const tag = word.element.querySelector(".neural-tag");

        tag.replaceChildren(textElement);
    }

    renderPosition(word, renderedY) {
        word.element.style.transform =
            `translate3d(${word.x}px, ${renderedY}px, 0)`;
    }
}
