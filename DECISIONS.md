# Decisions

This document records architecture and design decisions that affect the long-term structure of keystro.ke.

---

## 2026-07-03 — Separate stage configuration from reusable typing systems

### Decision

Represent the active game stage as a dedicated stage configuration.

Stage-specific values may include:

- stage identity
- stage name
- word pools
- spawn timing
- power-up probability
- movement speeds
- session duration

Reusable systems such as `WordManager`, `ScoreManager`, and `SessionManager` should not define the thematic content of a stage.

### Reason

The first playable loop proved the core typing mechanic using globally shared configuration.

The planned game progression moves through environments with different vocabulary, pacing, target behavior, and presentation.

Keeping those values inside reusable gameplay systems would gradually couple the typing engine to Stage One.

A stage boundary allows the same typing systems to operate across different environments without requiring a separate game loop for every stage.

The stage abstraction is intentionally configuration-focused.

Additional stage architecture should be introduced only when future stages demonstrate a concrete need for it.

---

## 2026-07-04 — Separate organism profiles, rendering, and gameplay lifecycle

### Decision

Divide organism word target responsibilities between:

- `OrganismProfileFactory`
- `OrganismRenderer`
- `WordManager`

`OrganismProfileFactory` creates stable per-target presentation, movement, and organelle profiles.

`OrganismRenderer` owns organism DOM creation and presentation updates.

`WordManager` owns word selection, target gameplay state, movement calculation, typing progress, and target lifecycle.

### Reason

The Stage One amoeba prototype introduced morphology variation, membrane animation profiles, movement profiles, organelle profiles, CSS variable application, and additional DOM structure.

Keeping all of these responsibilities inside `WordManager` caused the word lifecycle system to grow around Stage One presentation details.

The generated characteristics of an organism are conceptually separate from the DOM used to display it.

Both are also separate from the typing rules and lifecycle of the word target.

Explicit boundaries allow the organism presentation to evolve without turning `WordManager` into a stage renderer.

The split also creates a clearer future replacement point if organism presentation eventually moves from DOM and CSS to another renderer.

---

## 2026-07-04 — Generate stable organism characteristics at spawn time

### Decision

Generate organism presentation, movement, and organelle profiles once when a word target spawns.

Do not continuously randomize organism characteristics inside the animation loop.

### Reason

Per-frame randomness would create visual jitter and make organism movement difficult to tune.

Stable profiles allow individual targets to differ while preserving coherent movement and animation behavior for the lifetime of each organism.

CSS animation may continuously deform membranes and move organelles using the stable values supplied by the generated profile.

The JavaScript animation loop remains responsible for gameplay movement rather than decorative visual noise.

---

## 2026-07-04 — Keep microscopic environmental presentation independent from word gameplay

### Decision

Represent microscopic fluid particulate through a dedicated `MicroscopicEnvironment` presentation system.

Environmental particulate should move independently from word targets and should not participate in typing, scoring, target selection, or session statistics.

### Reason

The Stage One environment needs visual motion that makes the viewport feel like a microscopic fluid sample.

Placing environmental particles inside `WordManager` would incorrectly couple background presentation to the word lifecycle.

A dedicated presentation system keeps environmental atmosphere independent from gameplay state.

The current system remains intentionally small.

A generalized stage environment framework should not be introduced until additional stages demonstrate what that abstraction needs to support.

---

## 2026-07-04 — Split stylesheets by presentation responsibility

### Decision

Use `src/styles/main.css` as a stylesheet entry point that imports smaller stylesheets organized by responsibility.

Current stylesheet responsibilities are:

```text
layout.css
environment.css
hud.css
words.css
results.css
footer.css
```

Reduced-motion and responsive rules should live beside the presentation system they affect.

### Reason

The original stylesheet grew as the playable loop gained HUD, results, public footer, amoeba targets, organelle animation, and microscopic environmental presentation.

A single stylesheet no longer provided a useful view of one presentation system.

Splitting styles by responsibility makes it easier to locate and change one visual system without searching through unrelated rules.

The split is organizational.

It does not introduce a CSS framework, preprocessor, bundler, or build step.

The browser continues to load standard CSS directly.