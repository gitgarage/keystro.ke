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
 * OrganismRenderer
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Creates and updates the DOM presentation of organism word targets.
 *
 * OrganismRenderer owns the HTML structure and presentation-specific CSS
 * variables used by organism targets.
 *
 * It does not choose words, track gameplay state, calculate movement, or
 * determine whether a typed letter is correct.
 *
 * WordManager provides target data and asks OrganismRenderer to create or
 * update the corresponding presentation.
 * ============================================================================
 */

export class OrganismRenderer {
    constructor({ tuning }) {
        this.tuning = tuning;
    }

    applyPresentationProfile(element, profile) {
        element.style.setProperty(
            "--organism-scale-x",
            profile.scaleX.toFixed(3)
        );

        element.style.setProperty(
            "--organism-scale-y",
            profile.scaleY.toFixed(3)
        );

        element.style.setProperty(
            "--organism-rotation",
            `${profile.rotationDegrees.toFixed(2)}deg`
        );

        element.style.setProperty(
            "--organism-radius-one",
            `${profile.radiusOne.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-radius-two",
            `${profile.radiusTwo.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-radius-three",
            `${profile.radiusThree.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-radius-four",
            `${profile.radiusFour.toFixed(2)}%`
        );

        element.style.setProperty(
            "--organism-membrane-opacity",
            profile.membraneOpacity.toFixed(3)
        );

        element.style.setProperty(
            "--organism-membrane-duration",
            `${profile.membraneDurationSeconds.toFixed(2)}s`
        );

        element.style.setProperty(
            "--organism-membrane-delay",
            `${profile.membraneDelaySeconds.toFixed(2)}s`
        );
    }

    createOrganelleElement(profile) {
        const organelle = document.createElement("span");

        organelle.className = "word-organelle";
        organelle.setAttribute("aria-hidden", "true");

        organelle.style.setProperty(
            "--organelle-size",
            `${profile.sizeRem.toFixed(3)}rem`
        );

        organelle.style.setProperty(
            "--organelle-left",
            `${profile.leftPercent.toFixed(2)}%`
        );

        organelle.style.setProperty(
            "--organelle-top",
            `${profile.topPercent.toFixed(2)}%`
        );

        organelle.style.setProperty(
            "--organelle-opacity",
            profile.opacity.toFixed(3)
        );

        organelle.style.setProperty(
            "--organelle-drift-x",
            `${profile.driftXRem.toFixed(3)}rem`
        );

        organelle.style.setProperty(
            "--organelle-drift-y",
            `${profile.driftYRem.toFixed(3)}rem`
        );

        organelle.style.setProperty(
            "--organelle-duration",
            `${profile.durationSeconds.toFixed(2)}s`
        );

        organelle.style.setProperty(
            "--organelle-delay",
            `${profile.delaySeconds.toFixed(2)}s`
        );

        return organelle;
    }

    appendOrganelles(element, organelleProfiles) {
        for (const profile of organelleProfiles) {
            element.appendChild(
                this.createOrganelleElement(profile)
            );
        }
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
        presentationProfile,
        organelleProfiles
    }) {
        const element = document.createElement("span");

        element.className = "word-target";

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
            this.createTextElement(wordTarget.text)
        );

        this.appendOrganelles(element, organelleProfiles);

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

        word.element.replaceChildren(textElement);

        this.appendOrganelles(
            word.element,
            word.organelleProfiles
        );
    }

    renderPosition(word, renderedY) {
        word.element.style.transform =
            `translate3d(${word.x}px, ${renderedY}px, 0) ` +
            `rotate(${word.presentationProfile.rotationDegrees}deg) ` +
            `scaleX(${word.presentationProfile.scaleX}) ` +
            `scaleY(${word.presentationProfile.scaleY})`;
    }
}