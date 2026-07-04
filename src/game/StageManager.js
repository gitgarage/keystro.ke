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
 * - exposing stage identity
 * - exposing stage word pools
 * - exposing stage tuning values
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
    constructor() {
        this.currentStage = amoebaStage;
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