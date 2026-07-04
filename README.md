# keystro.ke

A focused typing game built around moving word targets, fast decisions, and sustained attention.

**Live demo:** https://keystro.ke

---

## Current Status

keystro.ke is in early development.

The first public playable demo is live and currently includes:

- Moving word targets
- Keyboard target locking
- Typed progress feedback
- Mistake tracking
- Combo scoring
- Score calculation
- Power-up word targets
- Timed sessions
- Session results
- Responsive browser presentation

The current demo is the foundation for a larger stage-based typing game.

---

## Play

Visit:

https://keystro.ke

Type the first letter of a visible word to lock onto that target.

Continue typing the word correctly to complete it.

A mistake breaks the current combo and prevents the affected word from increasing the combo when completed.

Special power-up words provide additional scoring opportunities.

The session ends when the timer reaches zero.

---

## Development Direction

The next major milestone is the first themed stage prototype.

Stage One will introduce an early microscopic environment populated by amoeba-like word targets.

The long-term game progression will move through increasingly large environments and increasingly complex forms of life and technology.

The changing scale of the stages is intended to make the game universe feel much larger than its total number of stages.

---

## Architecture

The current version intentionally uses:

- HTML
- CSS
- JavaScript ES modules

The early project avoids frameworks, build tools, and runtime dependencies.

Gameplay systems are separated into small modules so rendering, audio, statistics, and stage systems can evolve without turning the main game loop into a monolithic file.

See `ARCHITECTURE.md` for the current application structure.

---

## Development Workflow

Feature work is developed on dedicated Git branches.

The current workflow is:

```text
feature branch
      |
      v
     dev
      |
      v
Cloudflare Pages
```

The `dev` branch is automatically deployed to the public development demo.

The `main` branch is reserved for intentional stable release checkpoints.

---

## Open Source

keystro.ke is an open-source project.

The public game includes a subtle source link so interested players and developers can inspect the project directly.

Licensed under the GNU Affero General Public License v3.0 or later.

See `LICENSE` for details.

---

## Project Documentation

- `ARCHITECTURE.md` — application structure and system responsibilities
- `ROADMAP.md` — current milestone and planned development direction
- `DECISIONS.md` — important design and architecture decisions
- `CHANGELOG.md` — notable project changes

---

## Website

https://keystro.ke