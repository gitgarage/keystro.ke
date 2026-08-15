/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { amoebaStage } from "./stages/amoebaStage.js";
import { neuralStage } from "./stages/neuralStage.js";

/**
 * ============================================================================
 * StageManager
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Owns the currently active stage configuration.
 *
 * Responsibilities include:
 *
 * - storing available stage definitions
 * - resolving requested stage identity
 * - exposing stage identity
 * - exposing stage word pools
 * - exposing stage tuning values
 * - exposing stage order, for results-screen "next stage" progression
 * - providing one stable place for future stage switching
 *
 * This class intentionally does NOT:
 *
 * - spawn words
 * - move words
 * - calculate score
 * - render stage graphics directly
 *
 * StageManager tells other systems what stage is active. Other systems decide
 * how to use that stage data.
 * ============================================================================
 */

export class StageManager {
    constructor(requestedStageId = "amoeba") {
        this.defaultStageId = "amoeba";

        this.stages = new Map([
            [amoebaStage.id, amoebaStage],
            [neuralStage.id, neuralStage]
        ]);

        // Fixed progression order, kept separate from the Map above (whose
        // key order is an implementation detail) since this order is a
        // gameplay decision the results screen depends on.
        this.stageOrder = [amoebaStage.id, neuralStage.id];

        this.currentStage = this.resolveStage(
            requestedStageId
        );
    }

    resolveStage(stageId) {
        const stage = this.stages.get(stageId);

        if (stage) {
            return stage;
        }

        console.warn(
            `Unknown stage id "${stageId}". ` +
            `Falling back to "${this.defaultStageId}".`
        );

        return this.stages.get(this.defaultStageId);
    }

    getStageById(stageId) {
        return this.stages.get(stageId) ?? null;
    }

    /**
     * Returns the id of the stage that follows the given stage in the fixed
     * progression order, or null if it is the last stage (or unrecognized).
     */
    getNextStageId(stageId) {
        const currentIndex = this.stageOrder.indexOf(stageId);

        if (currentIndex === -1 || currentIndex + 1 >= this.stageOrder.length) {
            return null;
        }

        return this.stageOrder[currentIndex + 1];
    }

    /**
     * Returns the active stage configuration.
     */
    getCurrentStage() {
        return this.currentStage;
    }

    /**
     * Returns the CSS class associated with the active stage.
     */
    getStageClassName() {
        return this.currentStage.className;
    }
}