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
- Dedicated score management.
- Dedicated session management.
- Combo tracking.
- Highest combo tracking.
- Basic score tracking.
- Perfect and imperfect word state.
- Power-up word targets.
- Distinct power-up target presentation.
- Power-up-specific movement speeds.
- Perfect power-up score multiplier.
- Sixty-second timed typing sessions.
- Visible session countdown.
- Completed word statistics.
- Perfect word statistics.
- Incorrect letter statistics.
- Session completion behavior.
- Final results screen.
- Final score summary.
- Highest combo summary.
- Application shell validation.
- Subtle open-source project footer.
- GitHub source link.
- AGPL-3.0 license identification in the application UI.
- Canonical production URL metadata.

### Changed

- Split the original application loop into dedicated game systems.
- Replaced direct HTML word-progress rendering with DOM element construction.
- Updated scoring so imperfect completed words receive base score without increasing combo.
- Generalized word selection to support multiple target pools and target types.
- Extended score tracking to preserve the highest combo reached during a session.
- Stopped gameplay input when a session ends.
- Clear remaining word targets when session time expires.
- Use animation-frame delta time for session timing.
- Expanded the HUD to display remaining session time.
- Prepared the application shell for public deployment.

### Fixed

- Prevented multiple untargeted visible words from sharing the same starting letter.
- Prevented delayed error feedback from referencing a different active target.
- Prevented session cleanup from treating remaining targets as escaped words.