# Roadmap

## Current Milestone

Stage One / Microscopic Stage Environment

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
- Amoeba Target Presentation

---

## Current Task

Give Stage One its first microscopic environment.

The target population now has irregular amoeba-like silhouettes, per-target morphology variation, slow membrane deformation, and organic vertical wandering.

The next visual pass should make the surrounding playfield feel like a microscopic environment rather than an abstract dark background.

---

## Next Task

Evaluate the first microscopic environment with the existing amoeba population.

The environment should add depth and biological atmosphere without reducing word readability or making the playfield visually noisy.

Once the environment direction is established, continue into Stage One gameplay tuning.

---

## Planned Milestones

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

Stage One targets should read as microscopic life while remaining easy to type.

The current amoeba presentation preserves:

- readable words
- clear typed progress
- visible active targeting
- mistake feedback
- speed distinctions
- power-up distinction

The current visual prototype uses:

- irregular cell silhouettes
- a translucent body
- an outer membrane
- subtle internal organelle-like details
- per-target morphology variation
- slow organic shape changes
- smooth vertical wandering
- per-target movement timing variation

Amoeba movement preserves the primary leftward gameplay direction.

Organic motion is layered around a stable travel lane so target movement remains predictable enough for focused typing.

The visual layer remains replaceable.

Gameplay systems should not depend on the current CSS representation of an amoeba.

---

## Microscopic Environment Direction

The Stage One playfield should feel like a microscopic environment rather than a generic game background.

The environment should establish:

- depth
- fluid atmosphere
- biological scale
- subtle environmental movement

Environmental presentation must remain secondary to the word targets.

The player should always be able to identify, lock onto, and type a target without fighting visual noise.

The first environment prototype should remain lightweight and compatible with the current DOM and CSS renderer.

The project should not move to WebGL solely to create the first microscopic background.

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