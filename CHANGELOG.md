# Changelog

All notable changes to keystro.ke will be documented in this file.

The project follows semantic versioning where practical during early development.

---

## [Unreleased]

### Added

- Initial repository documentation and project structure.
- Static full-screen application shell.
- Moving word targets.
- Keyboard typing input.
- First-letter target locking.
- Unambiguous starting-letter reservation.
- Typed word progress rendering.
- Completed word removal.
- Modular game loop architecture.
- Dedicated input management.
- Dedicated word target management.
- Combo tracking.
- Basic score tracking.
- Perfect and imperfect word state.
- Combo reset after incorrect letters.
- Combo reset after escaped words.
- Power-up word targets.
- Distinct power-up target presentation.
- Power-up-specific movement speeds.
- Perfect power-up score multiplier.

### Changed

- Split the original application loop into dedicated game systems.
- Replaced direct HTML word-progress rendering with DOM element construction.
- Updated scoring so imperfect completed words receive base score without increasing combo.
- Generalized word selection to support multiple target pools and target types.

### Fixed

- Prevented multiple untargeted visible words from sharing the same starting letter.
- Prevented delayed error feedback from referencing a different active target.