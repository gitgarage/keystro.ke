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

The generated characteristics of an organism are separate from the DOM used to display it.

Both are also separate from typing rules and word lifecycle.

Explicit boundaries allow the organism presentation to evolve without turning `WordManager` into a stage renderer.

---

## 2026-07-04 — Generate stable organism characteristics at spawn time

### Decision

Generate organism presentation, movement, and organelle profiles once when a word target spawns.

Do not continuously randomize organism characteristics inside the animation loop.

### Reason

Per-frame randomness would create visual jitter and make organism movement difficult to tune.

Stable profiles allow individual targets to differ while preserving coherent movement and animation behavior.

---

## 2026-07-04 — Keep microscopic environmental presentation independent from word gameplay

### Decision

Represent microscopic fluid particulate through a dedicated `MicroscopicEnvironment` presentation system.

Environmental particulate should move independently from word targets and should not participate in typing, scoring, target selection, or session statistics.

### Reason

Placing environmental particles inside `WordManager` would incorrectly couple background presentation to the word lifecycle.

A dedicated presentation system keeps environmental atmosphere independent from gameplay state.

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
stage-intro.css
results.css
footer.css
```

Reduced-motion and responsive rules should live beside the presentation system they affect.

### Reason

A single stylesheet no longer provided a useful view of one presentation system.

Splitting styles by responsibility makes it easier to locate and change one visual system without searching through unrelated rules.

The split does not introduce a CSS framework, preprocessor, bundler, or build step.

---

## 2026-07-04 — Apply progression pressure to active organisms

### Decision

When a stage progression phase changes, apply the current phase pressure to organisms already active in the viewport.

Do not permanently bind organism movement difficulty or telemetry attribution to the phase in which the organism originally spawned.

### Reason

Early Stage One telemetry showed that slow organisms created during an earlier phase remained active after the stage increased difficulty.

Those organisms became stragglers.

The player experiences the current state of the stage, not the historical state in which an organism entered the viewport.

Active organisms should therefore respond to current stage pressure.

Telemetry should attribute gameplay events to the phase in which the event occurs.

---

## 2026-07-04 — Track unresolved targets separately from escaped targets

### Decision

Record organisms still active when session time reaches zero as unresolved targets in phase-aware development telemetry.

Do not report those targets as escaped words.

### Reason

A target remaining in the viewport at the exact end of a timed session did not fail by crossing the gameplay boundary.

Treating it as escaped would change score or combo semantics and misrepresent player behavior.

The unresolved count is useful for tuning spawn pressure and active target limits.

---

## 2026-07-04 — Coordinate stage presentation outside the game loop

### Decision

Use `StagePresentationManager` to coordinate stage-level presentation lifecycle.

The presentation coordinator owns:

- stage introduction reveal
- environment startup
- progression pressure presentation
- completion transition timing
- organism settling coordination
- result value population
- Results reveal

Individual visual systems remain responsible for implementing their own presentation.

`Game` remains the top-level gameplay coordinator.

### Reason

As Stage One became complete, `Game` accumulated direct knowledge of introduction DOM state, environmental pressure, organism completion presentation, transition delays, result values, and Results reveal classes.

These are related through stage presentation timing, but they are not game-loop mechanics.

`StagePresentationManager` gives major stage moments one coordination boundary without creating a generalized rendering framework.

---

## 2026-07-04 — Keep detailed stage history outside top-level architecture documentation

### Decision

Store detailed stage design, tuning observations, and presentation history under `docs/stages/`.

Keep `ARCHITECTURE.md` focused on reusable application boundaries and current system responsibilities.

### Reason

Stage-specific documents preserve implementation context without turning `ARCHITECTURE.md` into a chronological development journal.

Future stages would make that problem worse.
