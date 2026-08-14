/*
 * keystro.ke
 * Copyright (C) 2026 Mike O'Riley
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { NeuralOrganismProfileFactory } from "./NeuralOrganismProfileFactory.js";
import { NeuralOrganismRenderer } from "./NeuralOrganismRenderer.js";
import { OrganismProfileFactory } from "./OrganismProfileFactory.js";
import { OrganismRenderer } from "./OrganismRenderer.js";

/**
 * ============================================================================
 * organismSystems
 * ============================================================================
 *
 * Responsibility
 * --------------
 * Resolves which organism profile factory and renderer pair a stage uses.
 *
 * Word targets look and animate differently per stage (a border-radius
 * amoeba blob for Microscopic Drift, a clip-path crystal for Neural
 * Current). WordManager owns target lifecycle and gameplay state for any
 * stage; it should not need to know how a specific stage's targets are
 * drawn. This module is the one place that maps a stage id to its matched
 * profile-factory/renderer pair, mirroring the id-keyed lookup StageManager
 * already uses for stage configuration itself.
 * ============================================================================
 */

const ORGANISM_SYSTEMS = new Map([
    [
        "amoeba",
        {
            createProfileFactory: () => new OrganismProfileFactory(),
            createRenderer: (tuning) =>
                new OrganismRenderer({ tuning })
        }
    ],
    [
        "neural",
        {
            createProfileFactory: () =>
                new NeuralOrganismProfileFactory(),
            createRenderer: (tuning) =>
                new NeuralOrganismRenderer({ tuning })
        }
    ]
]);

const DEFAULT_STAGE_ID = "amoeba";

export function createOrganismSystem(stageId, tuning) {
    const system =
        ORGANISM_SYSTEMS.get(stageId) ??
        ORGANISM_SYSTEMS.get(DEFAULT_STAGE_ID);

    return {
        profileFactory: system.createProfileFactory(),
        renderer: system.createRenderer(tuning)
    };
}
