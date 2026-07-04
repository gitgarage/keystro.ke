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

### Changed

- Modularized the initial game loop into dedicated game systems.
- Separated keyboard input from gameplay coordination.
- Separated word target management from the main game loop.
- Moved shared gameplay values into named configuration constants.
- Updated combo rules so a word containing a mistake cannot increase the combo when completed.
- Expanded the public demo shell for live deployment.
- Set the `dev` branch as the automatic Cloudflare Pages deployment branch.
- Advanced the current development milestone to the Stage One amoeba prototype.

---

## 0.1.0 - In Development

The first public development version of keystro.ke.

The current goal is to establish the complete foundation of the first playable loop before expanding into themed stages, richer rendering, audio, and deeper statistics.