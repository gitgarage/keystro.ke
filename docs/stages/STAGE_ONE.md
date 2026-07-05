# Stage One — Microscopic Drift

## Status

Microscopic Drift is the first complete playable stage in keystro.ke.

It establishes the first themed environment built on the reusable typing, scoring, session, and stage systems.

---

## Identity

- Stage: Stage One
- Name: Microscopic Drift
- Stage ID: `amoeba`
- Stage class: `stage-amoeba`

The player types organism words moving through a microscopic fluid sample.

The stage begins calmly and becomes increasingly unstable during the sixty-second session.

The visual and gameplay pressure rise together.

---

## Gameplay Premise

The player types organisms before the sample grows unstable.

Each visible amoeba contains a word.

Typing the first letter of an available target locks input onto that organism.

The player must finish the locked word before selecting another target.

Perfect words build combo.

Incorrect letters break combo and mark the current word imperfect.

Power-up organisms use the same typing mechanic but can award an increased score multiplier when completed perfectly.

---

## Stage Vocabulary

The Stage One vocabulary uses short biological and motion-oriented words.

The pool is intentionally readable while organisms are moving.

Current vocabulary includes terms associated with cells, membranes, cytoplasm, absorption, flow, drift, and microscopic movement.

Power-up vocabulary is visually and mechanically distinguished through the existing power-up target type.

Vocabulary belongs in `src/game/stages/amoebaStage.js`.

It should not be embedded in `WordManager`.

---

## Session Structure

Microscopic Drift is a sixty-second timed stage.

The session is divided into three progression phases:

1. Phase One — calm sample
2. Phase Two — agitated sample
3. Phase Three — unstable sample

Progression is based on elapsed session progress.

The current phase affects:

- spawn timing
- organism movement pressure
- active organism limits
- environmental particulate agitation

The progression system is continuous from the player's perspective.

Existing organisms respond when the phase changes.

They do not remain permanently bound to the difficulty of the phase in which they spawned.

---

## Initial Organisms

Early Stage One builds spawned every organism beyond the right edge of the viewport.

This caused the session timer to reach approximately fifty-seven seconds before the first organism became playable.

The stage now seeds organisms into the visible right side of the viewport when the session begins.

This gives the stage immediate playable material while preserving normal spawn behavior for the rest of the session.

---

## Active Organism Pressure

Early progression tuning increased spawn and movement pressure but retained a single active target limit.

Telemetry and repeated play sessions showed that the final phase did not consistently create enough playable pressure.

Phase-aware active target limits were introduced.

The active organism population may therefore increase as the sample becomes unstable.

The final phase intentionally leaves several unresolved organisms when the sixty-second timer expires.

An unresolved organism is not considered escaped.

The timer ended while the organism remained inside the sample.

---

## Progression Pressure on Existing Organisms

The first progression implementation assigned movement difficulty when an organism spawned.

This produced slow stragglers.

An organism created during Phase Two could remain slow after the stage entered Phase Three.

Telemetry also initially attributed a completed organism to its birth phase.

Repeated sessions exposed the mismatch.

The player was performing Phase Three gameplay while telemetry reported many completions under Phase Two.

The stage now applies current progression pressure to active organisms.

Gameplay events are attributed to the phase in which the event occurs.

The current stage state therefore controls both visible pressure and telemetry interpretation.

---

## Telemetry

Stage One development introduced phase-aware session telemetry.

For each phase, development telemetry records:

- completed
- perfect
- mistakes
- escaped
- remaining

`remaining` represents unresolved organisms still active when the session ends.

Repeated manual sessions were used to compare phase behavior.

The telemetry exposed two important tuning problems:

1. Completion attribution followed organism birth phase rather than gameplay event phase.
2. The final phase did not create enough active pressure because existing organisms retained earlier movement characteristics and the active target limit remained too low.

The current progression model was tuned in response to those observations.

Telemetry remains development-facing.

The player-facing Results screen displays:

- score
- highest combo
- completed words
- perfect words
- mistakes

---

## Organism Presentation

Stage One organisms are rendered with DOM and CSS.

The presentation intentionally avoids a uniform pill silhouette.

Each organism receives a stable generated profile when it spawns.

The profile may vary:

- scale
- rotation
- membrane shape
- membrane opacity
- membrane animation timing
- membrane animation phase
- vertical movement amplitude
- vertical movement frequency
- vertical movement phase

The profile remains stable for the lifetime of the organism.

Continuous randomization is intentionally avoided because it creates visual jitter.

---

## Membrane Deformation

Amoeba membranes deform through CSS animation.

The animation creates a soft irregular cell boundary without moving decorative shape calculations into the JavaScript gameplay loop.

Individual organisms receive stable membrane timing and phase values.

This prevents the entire population from deforming in synchronization.

---

## Organelles

The original amoeba presentation contained one small internal decorative detail.

Its fixed placement made it appear repeatedly in the same upper-right area of each organism.

The presentation was expanded into multiple independently drifting organelle-like elements.

Each organelle may vary:

- size
- position
- opacity
- drift
- animation duration
- animation phase

The details are decorative.

They do not affect typing, scoring, movement, or target selection.

Their purpose is to make the organisms feel internally alive.

---

## Organic Movement

Organisms move primarily from right to left.

A stable movement profile adds slow vertical wandering.

The vertical movement varies by amplitude, frequency, and phase.

This preserves predictable gameplay movement while preventing organisms from appearing to travel on perfectly rigid horizontal rails.

Current stage pressure may modify active organism movement as progression advances.

---

## Microscopic Environment

`MicroscopicEnvironment` creates the fluid particulate behind gameplay.

The environment contains three particle depth layers:

- far
- middle
- near

Each layer uses different visual behavior to suggest depth.

Particles receive stable randomized presentation values.

The environment is independent from organism gameplay.

Environmental particles do not participate in typing, score, combo, target selection, or session statistics.

---

## Progressive Instability

The microscopic environment responds to the current progression phase.

Phase One presents a calm sample.

Phase Two increases particulate agitation.

Phase Three presents the most unstable particulate behavior.

The environmental container persists throughout the stage.

Progression changes the pressure state of the existing sample rather than destroying and rebuilding particle layers.

This preserves visual continuity.

The pressure change was intentionally made visible enough to notice during normal gameplay without becoming a competing foreground effect.

---

## Stage Introduction

Microscopic Drift begins with an atmospheric stage introduction.

The introduction presents:

- `STAGE ONE`
- `Microscopic Drift`
- `Type organisms before the sample grows unstable.`

Gameplay organisms are already present and moving during the introduction.

The introduction is layered between the microscopic environment and organism targets.

This is intentional.

Organisms may cross over the introduction presentation so the letters the player must type are never hidden behind decorative stage text.

The introduction is presentation rather than a gameplay pause.

---

## Completion Transition

When the sixty-second timer reaches zero:

1. `SessionManager` ends the active session.
2. `Game` stops keyboard input.
3. `Game` records unresolved organisms.
4. `Game` collects score and session summaries.
5. `Game` logs telemetry.
6. `StagePresentationManager` populates Results values.
7. `StagePresentationManager` requests organism settling.
8. `WordManager` marks active organisms as settling.
9. CSS dissolves organisms through opacity and blur.
10. `StagePresentationManager` waits for the completion transition.
11. Remaining organisms are cleared.
12. Results are revealed.

An earlier completion experiment attempted to animate organism transforms directly.

That conflicted with normal position rendering because `OrganismRenderer` continued writing the target transform.

The current completion dissolve animates opacity and filter instead.

Position rendering may continue without overwriting the dissolve.

The microscopic particulate environment does not slide toward the center or perform a separate settling animation.

The final effect is the disappearance of the active organisms followed by the Results reveal.

---

## Results Presentation

The Results screen presents score as the primary outcome.

Score occupies its own full-width row.

The secondary statistics appear beneath it:

- highest combo
- completed words
- perfect words
- mistakes

The score was promoted to a separate row after six-digit values collided with adjacent statistics in the original five-column layout.

The visual hierarchy now matches the gameplay hierarchy.

Score is the headline result.

The other values explain the session.

---

## Presentation Architecture

Stage One presentation responsibilities are divided between focused systems.

### `MicroscopicEnvironment`

Owns environmental particulate and environmental pressure state.

### `OrganismProfileFactory`

Creates stable organism characteristics.

### `OrganismRenderer`

Owns organism DOM presentation.

### `WordManager`

Owns organism gameplay lifecycle, movement state, and completion settling requests.

### `StagePresentationManager`

Coordinates the stage introduction, presentation pressure, completion timing, and Results population and reveal.

`Game` coordinates gameplay.

It should not know the CSS class used to reveal Results or the duration of the organism dissolve.

`StagePresentationManager` coordinates major presentation moments without becoming a renderer.

The current architecture intentionally avoids a generalized stage rendering framework.

Additional stages should prove what shared presentation abstraction is actually necessary.

---

## Styling

Stage One presentation is divided across responsibility-based stylesheets.

### `environment.css`

Owns microscopic particulate and progression pressure.

### `words.css`

Owns organism membranes, organelles, target feedback, typed progress, and the completion dissolve.

### `stage-intro.css`

Owns the stage introduction.

### `results.css`

Owns Results presentation, score hierarchy, and session statistics.

`main.css` remains the stylesheet entry point.

Reduced-motion rules live beside the animation systems they affect.

---

## Current Boundary

Microscopic Drift is considered a complete playable Stage One implementation.

The stage currently proves:

- themed vocabulary
- stage configuration
- timed gameplay
- three-phase progression
- phase-aware pressure
- phase-aware telemetry
- immediate initial targets
- organic target movement
- generated organism morphology
- animated membranes
- drifting organelles
- layered microscopic particulate
- progressive environmental instability
- stage introduction
- completion dissolve
- Results transition

Further changes to Stage One should fix a demonstrated problem or support a broader game system.

New visual experiments should not delay development of the next architectural or gameplay milestone without a specific reason.

---

## Future Questions

Future stages may demonstrate a need for:

- generalized environment interfaces
- generalized stage presentation definitions
- stage-specific renderer selection
- audio presentation lifecycle
- persistent session statistics
- accessibility-specific presentation adapters
- multiplayer stage synchronization

Those abstractions should be introduced when another stage or game mode provides a concrete second use case.

Microscopic Drift should not predict every future stage by itself.
