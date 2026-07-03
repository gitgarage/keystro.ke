# Architecture

keystro.ke is designed as a local-first browser game with a small, understandable codebase.

The early project intentionally avoids frameworks, build tools, and external dependencies so the first playable loop can be understood directly from the source files.

---

## Current Architecture

```text
index.html
    |
    v
src/main.js
    |
    v
Game
    |
    +---- InputManager
    |
    +---- WordManager
    |
    +---- ScoreManager
```

`Game` coordinates systems through gameplay events.

```text
InputManager
    |
    | typed letter
    v
WordManager
    |
    +---- word completed ----+
    |                        |
    +---- incorrect letter --+----> ScoreManager
    |                        |
    +---- word escaped ------+
```

---

## Source Layout

```text
src/
├── main.js
├── game/
│   ├── Game.js
│   ├── InputManager.js
│   ├── ScoreManager.js
│   ├── WordManager.js
│   └── constants.js
└── styles/
    └── main.css
```

---

## Application Shell

`index.html` owns the static page structure.

It provides:

- the application root
- the game viewport
- the HUD
- the word layer
- the script and stylesheet links

The HTML should stay small. Game behavior belongs in JavaScript, not markup.

---

## Entry Point

`src/main.js` is the application entry point.

It is responsible for:

- finding required DOM elements
- creating the top-level `Game`
- starting the game

It should not contain gameplay rules.

---

## Game Coordinator

`src/game/Game.js` owns the top-level game loop.

It is responsible for:

- starting game systems
- scheduling animation frames
- calculating elapsed frame time
- scheduling word spawns
- connecting systems through gameplay events

`Game` should coordinate systems, not absorb their responsibilities.

---

## Input System

`src/game/InputManager.js` owns keyboard input.

It is responsible for:

- listening for keydown events
- ignoring modifier shortcuts
- accepting plain alphabetic input
- forwarding normalized letters

It should not know about words, score, combo, or rendering.

---

## Word System

`src/game/WordManager.js` owns moving word targets.

It is responsible for:

- selecting words
- preventing duplicate starting letters
- spawning word targets
- moving active words
- locking onto a target
- tracking typed progress
- tracking whether a word remains perfect
- removing completed and offscreen words
- reporting meaningful word events

Each active word is represented as a plain JavaScript object:

```text
{
    text,
    type,
    progress,
    isPerfect,
    x,
    y,
    speed,
    element
}
```

The object stores game state.  
The DOM element renders that state.

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

The score system should not know how words move or how keyboard input is captured.

---

## Configuration

`src/game/constants.js` owns shared gameplay configuration.

It currently stores:

- normal word pool
- power-up word pool
- spawn timing
- power-up spawn probability
- normal movement speeds
- power-up movement speeds
- viewport ratios
- visual threshold values
- base score per letter
- power-up score multiplier

Configuration should be named instead of hidden as unexplained numbers inside gameplay code.

---

## Styling

`src/styles/main.css` owns the current visual presentation.

CSS currently handles:

- full-screen layout
- background atmosphere
- HUD placement
- score presentation
- combo presentation
- normal word target appearance
- power-up word target appearance
- active target feedback
- incorrect letter feedback

---

## Design Direction

The first demo should prove the game feel before adding deeper systems.

Current priority:

```text
moving words
typing input
target locking
word completion
combo feedback
basic score
power-up words
session end condition
results screen
```

Deferred until later:

```text
WebGL
particles
audio
statistics depth
GitHub login
Cloudflare D1 sync
```

---

## Rule

`main` should remain deployable.

Feature work should happen on branches and only merge when the current step works locally.