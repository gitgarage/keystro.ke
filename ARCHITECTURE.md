# Architecture

keystro.ke is designed as a local-first browser game with a small, understandable codebase.

The early project intentionally avoids frameworks, build tools, and external dependencies so the playable game can be understood directly from the source files.

---

## Current Architecture

```text
index.html
    |
    v
src/main.js
    |
    +---- StageManager
    |         |
    |         v
    |   stages/amoebaStage.js
    |
    v
Game
    |
    +---- InputManager
    |
    +---- WordManager
    |         |
    |         +---- OrganismProfileFactory
    |         |
    |         +---- OrganismRenderer
    |
    +---- ScoreManager
    |
    +---- SessionManager
    |
    +---- MicroscopicEnvironment
```

`Game` coordinates systems through gameplay events.

```text
StageManager
    |
    | active stage configuration
    v
Game
    |
    +---- WordManager
    |
    +---- ScoreManager
    |
    +---- SessionManager

InputManager
    |
    | typed letter
    v
WordManager
    |
    +---- word completed ----+----> ScoreManager
    |                        |
    |                        +----> SessionManager
    |
    +---- incorrect letter --+----> ScoreManager
    |                        |
    |                        +----> SessionManager
    |
    +---- word escaped -----------> ScoreManager

SessionManager
    |
    | session ended
    v
Game
    |
    +---- stop input
    +---- clear word targets
    +---- collect summaries
    +---- render results
```

Organism targets are divided into gameplay state, stable generated profiles, and DOM presentation.

```text
OrganismProfileFactory
    |
    | stable target profile
    v
WordManager
    |
    | target state
    v
OrganismRenderer
    |
    | DOM presentation
    v
word target element
```

---

## Source Layout

```text
src/
├── main.js
├── game/
│   ├── stages/
│   │   └── amoebaStage.js
│   ├── Game.js
│   ├── InputManager.js
│   ├── MicroscopicEnvironment.js
│   ├── OrganismProfileFactory.js
│   ├── OrganismRenderer.js
│   ├── ScoreManager.js
│   ├── SessionManager.js
│   ├── StageManager.js
│   ├── WordManager.js
│   └── constants.js
└── styles/
    ├── main.css
    ├── environment.css
    ├── footer.css
    ├── hud.css
    ├── layout.css
    ├── results.css
    └── words.css
```

---

## Application Shell

`index.html` owns the static page structure.

It provides:

- the application root
- the game viewport
- the HUD
- the word layer
- the results screen
- the script and stylesheet links

The HTML should stay small.

Game behavior belongs in JavaScript, not markup.

Static presentation structure may remain in HTML when JavaScript only needs to update its state or values.

---

## Entry Point

`src/main.js` is the application entry point.

It is responsible for:

- finding required DOM elements
- validating the application shell
- creating the stage manager
- selecting the active stage
- creating the top-level `Game`
- starting the game

It should not contain gameplay rules.

The application should fail clearly when a required shell element is missing instead of starting in a partially initialized state.

---

## Game Coordinator

`src/game/Game.js` owns the top-level game loop.

It is responsible for:

- starting game systems
- scheduling animation frames
- calculating elapsed frame time
- scheduling word spawns
- connecting systems through gameplay events
- coordinating session completion
- collecting system summaries
- presenting final results

`Game` receives the active stage configuration and supplies stage-specific values to the systems that need them.

`Game` also starts presentation systems that belong to the active game environment.

`Game` should coordinate systems, not absorb their internal rules.

Systems communicate through meaningful events rather than directly controlling one another.

---

## Stage System

The stage system is divided between the stage manager and individual stage definitions.

```text
StageManager
    |
    +---- stage definitions
              |
              +---- amoebaStage
```

`src/game/StageManager.js` owns stage selection.

It is responsible for:

- storing available stage definitions
- selecting a stage by identifier
- exposing the active stage configuration

`StageManager` should not implement gameplay rules.

Individual stage definitions live under `src/game/stages/`.

`src/game/stages/amoebaStage.js` defines the current Stage One configuration.

A stage definition may provide:

- stage identity
- stage name
- normal word pool
- power-up word pool
- spawn timing
- power-up spawn probability
- movement speeds
- session duration

Stage-specific values should enter gameplay through the active stage configuration rather than being embedded directly inside `Game` or `WordManager`.

This creates a boundary between reusable typing mechanics and themed stage content.

The first stage implementation is intentionally small.

The stage system should grow only when additional stages prove that more abstraction is necessary.

---

## Input System

`src/game/InputManager.js` owns keyboard input.

It is responsible for:

- listening for keydown events
- ignoring modifier shortcuts
- accepting plain alphabetic input
- forwarding normalized letters
- stopping keyboard capture when requested

It should not know about words, score, combo, session timing, stages, or rendering.

---

## Word System

`src/game/WordManager.js` owns the lifecycle and gameplay state of moving word targets.

It is responsible for:

- selecting words from the active stage configuration
- preventing duplicate starting letters
- spawning word targets
- moving active words
- locking onto a target
- tracking typed progress
- tracking whether a word remains perfect
- removing completed and offscreen words
- clearing remaining targets at session completion
- reporting meaningful word events

`WordManager` delegates stable organism profile generation to `OrganismProfileFactory`.

`WordManager` delegates organism DOM creation and presentation updates to `OrganismRenderer`.

Each active word is represented as a plain JavaScript object containing gameplay, movement, presentation, and DOM references.

```text
{
    text,
    type,
    progress,
    isPerfect,
    x,
    baseY,
    speed,
    presentationProfile,
    movementProfile,
    organelleProfiles,
    element
}
```

The object stores target state.

`OrganismRenderer` renders that state.

Session cleanup removes active targets without reporting escape events.

`WordManager` owns word behavior but should not own thematic vocabulary or organism DOM structure.

---

## Organism Profile System

`src/game/OrganismProfileFactory.js` creates stable per-target organism profiles.

It is responsible for generating:

- organism scale variation
- organism rotation
- membrane radius variation
- membrane opacity
- membrane animation duration and phase
- vertical movement amplitude
- vertical movement frequency
- vertical movement phase
- organelle count
- organelle size
- organelle position
- organelle opacity
- organelle drift
- organelle animation duration and phase

Profiles are created once when a target spawns.

The profile factory should not create DOM elements or update target positions.

Stable profiles prevent visual properties from being randomized during every animation frame.

---

## Organism Rendering System

`src/game/OrganismRenderer.js` owns the DOM presentation of organism word targets.

It is responsible for:

- creating target elements
- applying organism presentation CSS variables
- creating organelle elements
- applying organelle CSS variables
- creating word text elements
- rendering typed and remaining word progress
- preserving organelles when typed progress changes
- applying rendered target position transforms

`OrganismRenderer` does not choose words, validate typed letters, calculate movement, update score, or track session state.

The renderer receives target state from `WordManager` and translates it into DOM presentation.

This boundary allows organism presentation to evolve without placing presentation-specific DOM logic inside the word lifecycle system.

---

## Microscopic Environment

`src/game/MicroscopicEnvironment.js` owns the current Stage One environmental particulate presentation.

It is responsible for:

- creating the environmental presentation container
- creating far, middle, and near particle layers
- creating stable particle presentation values
- inserting the environment behind gameplay targets

Environmental particles move through CSS animation.

They are independent of word target movement and typing gameplay.

The environmental system should not affect score, input, target selection, or session statistics.

Future stage-specific environment architecture should be introduced only when additional stages demonstrate the required boundary.

---

## Word Target Types

Word targets currently have one of two types:

```text
normal
power-up
```

Both target types use the same core typing rules.

A target type may influence:

- word selection
- movement speed
- visual presentation
- scoring behavior

Power-up words are intentionally represented as typed word targets instead of a separate gameplay system.

This keeps shared behavior in `WordManager` while allowing other systems to react to the target type.

---

## Score System

`src/game/ScoreManager.js` owns combo and score state.

It tracks:

- current combo
- highest combo
- current score

It responds to gameplay events:

- completed word
- incorrect letter
- escaped word

Current scoring rules:

```text
perfect normal word
    combo += 1

normal word score
    word length
    × 100
    × current combo

perfect power-up word
    combo += 1

power-up word score
    word length
    × 100
    × current combo
    × 4

imperfect completed word
    combo does not increase

imperfect word score
    word length
    × 100

incorrect letter
    current word becomes imperfect
    combo = 0

escaped word
    combo = 0
```

A power-up receives its special score multiplier only when completed perfectly.

Existing score is never removed when a combo breaks.

`ScoreManager` exposes a summary of final score and highest combo for session results.

The score system should not know how words move, how keyboard input is captured, or when a session ends.

---

## Session System

`src/game/SessionManager.js` owns the lifecycle and statistics of one playable session.

It is responsible for:

- tracking whether the session is active
- tracking elapsed session time
- calculating visible remaining time
- tracking completed words
- tracking perfect words
- tracking incorrect typed letters
- reporting session completion

Session duration is supplied by the active stage configuration.

Session time advances using animation-frame delta time supplied by `Game`.

`SessionManager` does not create a separate interval or animation loop.

Current session statistics are:

```text
completed words
perfect words
mistakes
```

A mistake means an incorrect typed letter.

An escaped word may break combo, but it is not recorded as a typing mistake.

`SessionManager` exposes its final statistics through a summary object.

---

## Session Completion

When session time reaches zero:

```text
SessionManager
    marks the session inactive
    renders zero remaining seconds
    reports session completion

Game
    stops keyboard input
    clears remaining word targets
    collects ScoreManager summary
    collects SessionManager summary
    updates result values
    reveals the results screen
```

Remaining words are cleared without being treated as escaped words.

Session cleanup should not change final score, combo, or mistake statistics.

---

## Configuration

`src/game/constants.js` owns gameplay values shared across stages and systems.

Stage-specific configuration belongs in an individual stage definition.

Shared configuration may include:

- visual threshold values
- base score per letter
- power-up score multiplier
- error feedback duration

Stage configuration may include:

- word pools
- spawn timing
- power-up spawn probability
- movement speeds
- session duration
- target viewport ratios
- target spawn and exit positions

Configuration should be named instead of hidden as unexplained numbers inside gameplay code.

Stage definitions should contain themed values without implementing the systems that consume them.

---

## Styling

`src/styles/main.css` is the stylesheet entry point.

It imports presentation styles by responsibility.

```text
main.css
    |
    +---- layout.css
    +---- environment.css
    +---- hud.css
    +---- words.css
    +---- results.css
    +---- footer.css
```

`layout.css` owns:

- global box sizing
- page and viewport layout
- application background
- stage title presentation

`environment.css` owns:

- microscopic environment layers
- environmental particulate presentation
- particulate drift animation

`hud.css` owns:

- brand presentation
- score presentation
- timer presentation
- combo presentation
- HUD responsive behavior

`words.css` owns:

- word target presentation
- amoeba membrane presentation
- organelle presentation
- membrane deformation
- organelle drift
- speed-state presentation
- power-up presentation
- active and muted target feedback
- incorrect letter feedback
- typed progress presentation

`results.css` owns:

- results screen presentation
- results card layout
- result statistics
- results responsive behavior

`footer.css` owns:

- public source and license footer
- footer interaction states
- footer responsive behavior

Reduced-motion rules should live beside the animation system they affect.

Presentation styles should be added to the stylesheet that owns the affected system rather than returning unrelated rules to `main.css`.

---

## Design Direction

The first playable loop has proven:

```text
moving words
typing input
target locking
word completion
combo feedback
basic score
power-up words
timed sessions
session statistics
results presentation
```

The current development phase is establishing themed stages while preserving the reusable typing systems.

The Stage One amoeba prototype now includes:

```text
stage-specific vocabulary and tuning
irregular organism silhouettes
stable per-target morphology
animated membrane deformation
drifting internal organelles
organic vertical movement
microscopic environmental particulate
```

The current Stage One presentation is still implemented with DOM and CSS.

This is intentional.

WebGL should be introduced only when the visual requirements demonstrate that DOM and CSS are no longer an appropriate presentation layer.

Deferred systems include:

```text
stage progression
additional themed stages
WebGL
generated audio
letter tone mapping
melodic typing patterns
statistics depth
GitHub login
Cloudflare D1 sync
```

---

## Rule

`main` should remain deployable.

Feature work should happen on branches and only merge when the current step works locally.