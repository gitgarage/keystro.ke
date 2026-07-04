# Changelog

All notable changes to keystro.ke will be documented in this file.

The project is currently in early development.

---

## Unreleased

### Added

- Initial repository structure.
- Public project documentation.
- First playable browser shell.
- Moving word targets.
- Unique active starting-letter selection.
- Keyboard input handling.
- Target locking.
- Typed progress feedback.
- Mistake detection.
- Combo tracking.
- Score calculation.
- Power-up word targets.
- Timed typing sessions.
- Session statistics.
- Results screen.
- Responsive public demo presentation.
- Open-source source link and license footer.
- SVG application favicon.
- Cloudflare Pages deployment.
- Public deployment at `https://keystro.ke`.
- Initial stage configuration system.
- Stage One amoeba prototype configuration.
- Stage-specific word pools and gameplay timing.
- CSS-driven amoeba target presentation.
- Per-target amoeba morphology variation.
- Animated amoeba membrane and internal organelle-like details.
- Stable per-target membrane animation timing and phase.
- Slow organic vertical movement for amoeba targets.
- Per-target movement amplitude, frequency, and phase variation.
- Multiple drifting organelle-like details inside individual amoeba targets.
- Per-organelle size, position, opacity, drift, timing, and phase variation.
- Microscopic environmental presentation system.
- Layered microscopic fluid particulate.
- Independent far, middle, and near environmental particle layers.
- Reduced-motion handling for amoeba and environmental animation.
- Dedicated organism profile generation system.
- Dedicated organism DOM rendering system.
- Responsibility-based stylesheet modules.

### Changed

- Modularized the initial game loop into dedicated game systems.
- Separated keyboard input from gameplay coordination.
- Separated word target management from the main game loop.
- Moved shared gameplay values into named configuration constants.
- Updated combo rules so a word containing a mistake cannot increase the combo when completed.
- Expanded the public demo shell for live deployment.
- Set the `dev` branch as the automatic Cloudflare Pages deployment branch.
- Advanced the current development milestone to the Stage One amoeba prototype.
- Separated reusable typing mechanics from stage-specific gameplay configuration.
- Updated `Game` and `WordManager` to consume active stage values.
- Replaced the pill-like Stage One target silhouette with an irregular microscopic cell presentation.
- Added stable visual variation so individual amoeba targets no longer share an identical silhouette.
- Added slow membrane deformation without moving decorative animation into the gameplay loop.
- Added smooth vertical wandering while preserving the primary leftward target movement.
- Preserved speed, power-up, active-target, mistake, muted, and typed-progress feedback in the amoeba presentation.
- Expanded amoeba interiors from a fixed decorative detail to multiple independently drifting organelle-like elements.
- Kept microscopic environmental movement independent from word target gameplay.
- Extracted stable organism profile generation from `WordManager`.
- Extracted organism DOM creation and presentation updates from `WordManager`.
- Reduced `WordManager` to target selection, gameplay state, movement calculation, typing behavior, and lifecycle responsibilities.
- Split the monolithic stylesheet into layout, environment, HUD, word, results, and footer presentation modules.
- Moved responsive and reduced-motion rules beside the presentation systems they affect.
- Preserved the existing visual presentation while modularizing JavaScript and CSS responsibilities.

---

## 0.1.0 - In Development

The first public development version of keystro.ke.

The current goal is to establish the first themed stage prototype while preserving the reusable typing, scoring, session, rendering, and presentation boundaries proven by the first playable loop.