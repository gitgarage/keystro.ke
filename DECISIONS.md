
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