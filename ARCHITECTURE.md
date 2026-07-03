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
    |
    +---- SessionManager
```

`Game` coordinates systems through gameplay events.

```text
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

---

## Source Layout

```text
src/
├── main.js
├── game/
│   ├── Game.js
│   ├── InputManager.js
│   ├── ScoreManager.js
│   ├── SessionManager.js
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

`Game` should coordinate systems, not absorb their internal rules.

Systems communicate through meaningful events rather than directly controlling one another.

---

## Input System

`src/game/InputManager.js` owns keyboard input.

It is responsible for:

- listening for keydown events
- ignoring modifier shortcuts
- accepting plain alphabetic input
- forwarding normalized letters
- stopping keyboard capture when requested

It should not know about words, score, combo, session timing, or rendering.

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
- clearing remaining targets at session completion
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

Session cleanup removes active targets without reporting escape events.

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

The current session duration is 60 seconds.

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
- session duration

Configuration should be named instead of hidden as unexplained numbers inside gameplay code.

---

## Styling

`src/styles/main.css` owns the current visual presentation.

CSS currently handles:

- full-screen layout
- background atmosphere
- HUD placement
- score presentation
- timer presentation
- combo presentation
- normal word target appearance
- power-up word target appearance
- active target feedback
- incorrect letter feedback
- results screen presentation
- basic responsive layout

The current visual design is intentionally provisional.

The first playable loop uses enough presentation to evaluate gameplay behavior without establishing the final stage or renderer design.

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

The next development phase should establish the broader game design before heavily refining visual presentation.

Deferred systems include:

```text
stage progression
themed word pools
WebGL
particles
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