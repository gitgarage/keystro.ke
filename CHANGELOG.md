# Changelog

All notable changes to keystro.ke will be documented in this file.

The project is currently in early development.

---

## Unreleased

### Added

- Initial repository structure and public project documentation.
- First playable browser game shell.
- Moving word targets with unique active starting-letter selection.
- Keyboard input, target locking, typed progress, and mistake detection.
- Combo tracking and score calculation.
- Power-up word targets.
- Timed typing sessions and session statistics.
- Results screen and responsive public demo presentation.
- Open-source source link, license footer, and SVG application favicon.
- Cloudflare Pages deployment at `https://keystro.ke`.
- Stage configuration and stage selection systems.
- Stage One: Microscopic Drift.
- Stage-specific vocabulary, gameplay timing, and progression phases.
- Phase-aware spawn pressure, movement pressure, and active target limits.
- Seeded initial organisms so gameplay begins immediately.
- Phase-aware session telemetry.
- Unresolved target telemetry at session completion.
- CSS-driven amoeba organism presentation.
- Stable per-target organism morphology and movement profiles.
- Animated membrane deformation.
- Multiple independently drifting organelle-like details.
- Organic vertical organism movement.
- Dedicated organism profile generation system.
- Dedicated organism DOM rendering system.
- Microscopic environmental presentation system.
- Layered far, middle, and near environmental particulate.
- Progressive environmental agitation across Stage One phases.
- Atmospheric Stage One introduction.
- Stage One completion dissolve and results transition.
- Dedicated stage presentation coordination system.
- Responsibility-based stylesheet modules.
- Reduced-motion handling for organism and environmental animation.

### Changed

- Modularized the initial game loop into dedicated game systems.
- Separated keyboard input from gameplay coordination.
- Separated word target management from the main game loop.
- Moved shared gameplay values into named configuration constants.
- Updated combo rules so a word containing a mistake cannot increase combo when completed.
- Expanded the public demo shell for live deployment.
- Set the `dev` branch as the automatic Cloudflare Pages deployment branch.
- Separated reusable typing mechanics from stage-specific gameplay configuration.
- Updated `Game` and `WordManager` to consume active stage values.
- Replaced the initial pill-like target silhouette with an irregular microscopic organism presentation.
- Generated stable organism characteristics once at spawn time instead of during animation frames.
- Applied progression pressure to organisms already active when a phase changes.
- Tracked session telemetry by the phase in which gameplay events occur rather than the phase in which a target originally spawned.
- Kept microscopic environmental movement independent from word target gameplay.
- Extracted stable organism profile generation from `WordManager`.
- Extracted organism DOM creation and presentation updates from `WordManager`.
- Reduced `WordManager` to target selection, gameplay state, movement calculation, typing behavior, and lifecycle responsibilities.
- Extracted stage introduction, environmental pressure coordination, completion timing, and results presentation from `Game`.
- Split the monolithic stylesheet into responsibility-based presentation modules.
- Moved responsive and reduced-motion rules beside the presentation systems they affect.
- Promoted final score above session statistics in the Results layout.
- Preserved gameplay and visual behavior while modularizing JavaScript and CSS responsibilities.

### Fixed

- Prevented slow organisms from remaining behind after Stage One progression pressure increases.
- Corrected phase telemetry so completed organisms are attributed to the active gameplay phase.
- Removed unused environment settling behavior that conflicted with organism completion presentation.
- Prevented organism position rendering from overriding the completion dissolve.
- Kept Stage One introduction text below organism targets so gameplay letters remain unobstructed.
- Prevented large score values from colliding with adjacent Results statistics.

---

## 0.1.0 - In Development

The first public development version of keystro.ke.

The current milestone contains the reusable typing loop and the completed Microscopic Drift stage.

Detailed Stage One design and tuning notes live in `docs/stages/STAGE_ONE.md`.