# Roadmap

## Current Milestone

Stage One / Amoeba Prototype

---

## Completed Milestones

- Repository Initialization
- First Typing Prompt
- Moving Word Targets
- Typing Session Engine
- Target Locking
- Combo and Score System
- Power-Up Word Targets
- Timed Session
- Results Screen
- Public Demo Shell
- Cloudflare Pages Deployment
- Custom Domain Deployment
- Initial Stage System

---

## Current Task

Give Stage One its first amoeba-like target presentation.

The first visual pass uses the existing DOM word targets and CSS to establish a living microscopic silhouette without changing gameplay behavior.

---

## Next Task

Evaluate the amoeba target presentation and decide whether individual targets need randomized shape data.

If CSS-only targets establish the correct direction, continue into the microscopic stage environment.

If the targets feel too uniform, introduce small per-target visual variables without coupling those values to typing behavior.

---

## Planned Milestones

- Amoeba Target Presentation
- Microscopic Stage Environment
- Stage One Gameplay Tuning
- Stage Progression
- Additional Themed Word Pools
- Difficulty Progression
- Electronic Stage Music
- WebGL Renderer
- Particle Engine
- Audio Engine
- Expanded Statistics Engine
- Keyboard Heatmap
- GitHub Login
- Cloudflare Synchronization
- Public Beta

---

## First Playable Loop

The first playable loop now supports:

- Moving word targets
- Unique active starting letters
- Keyboard target locking
- Typed progress tracking
- Mistake detection
- Combo scoring
- Score calculation
- Power-up word targets
- Timed sessions
- Session results

The first public playable demo is available at:

`https://keystro.ke`

---

## Stage System

The game now has an initial stage configuration boundary.

Stage-specific configuration may define:

- stage identity
- stage name
- normal word pool
- power-up word pool
- spawn timing
- power-up probability
- movement speeds
- session duration

The stage system is intentionally small.

The project should avoid designing a large generalized stage framework before multiple stages demonstrate what abstractions are actually shared.

Stage One is the first test of this architecture.

---

## Stage Direction

The game will progress through environments of increasing scale.

Early stages begin with microscopic life.

Later stages move through increasingly complex organisms, environments, civilizations, and technologies.

The progression is based on successful evolutionary and organizational transitions rather than a simple escalation toward conflict.

The increasing physical scale of each environment should make the game universe feel much larger than the total number of stages.

Stage vocabulary should be thematically connected to the environment.

Common targets should use shorter words.

More significant targets and mini-boss-like entities may use longer and more difficult words.

---

## Amoeba Presentation Direction

Stage One should first read as microscopic life before the project invests in a final renderer.

The initial target presentation should preserve:

- readable words
- clear typed progress
- visible active targeting
- mistake feedback
- speed distinctions
- power-up distinction

The first visual prototype uses:

- irregular cell silhouettes
- a translucent body
- an outer membrane
- subtle internal organelle-like details
- slow organic shape changes

The visual layer should remain replaceable.

Gameplay systems should not depend on the current CSS representation of an amoeba.

---

## Deployment

The public development demo is deployed through Cloudflare Pages.

The `dev` branch is the current production branch for the development demo.

Pushes to `dev` automatically trigger a new deployment.

The custom domain is:

`https://keystro.ke`

The `main` branch remains reserved for stable release checkpoints.

---

## Long-Term Vision

Become the most educational open-source typing platform available.

The game should combine typing practice, focused attention, stage progression, and increasingly ambitious visual environments without hiding its educational purpose behind shallow gameplay systems.