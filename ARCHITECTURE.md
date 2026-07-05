# Architecture

keystro.ke is designed as a local-first browser game with a small, understandable codebase.

The early project intentionally avoids frameworks, build tools, and external dependencies so the playable game can be understood directly from the source files.

Detailed stage design belongs under `docs/stages/`.

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
    +---- StageManager
    |         |
    |         v
    |   stages/amoebaStage.js
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
    |
    +---- StagePresentationManager