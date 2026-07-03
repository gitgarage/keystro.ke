# Decisions

This document records important technical and product decisions for keystro.ke.

The purpose is to preserve the reasoning behind the project so future changes do not repeatedly revisit already considered questions.

---

## 2026-07-02 — Use the GNU Affero General Public License v3

### Decision

License keystro.ke under the GNU Affero General Public License v3.0 or later.

### Reason

The project is intended to remain open source, including when modified software is operated as a network service.

Commercial redistribution is acceptable when the corresponding source obligations of the license are followed.

---

## 2026-07-03 — Keep the early browser game dependency-free

### Decision

Build the first playable loop with browser-native HTML, CSS, and JavaScript modules.

Do not introduce a frontend framework or build system yet.

### Reason

The first demo should remain directly understandable from the source code.

Dependencies should be introduced only when a specific project requirement justifies them.

---

## 2026-07-03 — Use a coordinator with focused game systems

### Decision

Use `Game` as the top-level coordinator and move focused responsibilities into dedicated manager classes.

Current systems include:

- `InputManager`
- `WordManager`
- `ScoreManager`

### Reason

The original single-file game loop proved the mechanic, but continued feature development inside one source file would make responsibilities difficult to separate.

`Game` should connect systems through meaningful gameplay events instead of implementing every feature directly.

---

## 2026-07-03 — Reserve starting letters for visible word targets

### Decision

Do not allow multiple available visible word targets to share the same starting letter.

### Reason

The first typed letter selects a target.

Allowing two available targets with the same starting letter would make selection visually ambiguous even if the program selected one deterministically.

---

## 2026-07-03 — Define combo as consecutive perfect words

### Decision

Combo measures consecutive words completed without an incorrect letter or escaped word.

An incorrect letter marks the active word as imperfect and immediately resets combo.

Completing that imperfect word does not increase combo.

### Reason

Combo should measure clean typing streaks rather than persistence alone.

The player still receives base score for completing an imperfect word, so a mistake removes the streak reward without removing all credit for finishing the target.

---

## 2026-07-03 — Represent power-ups as typed word targets

### Decision

Represent power-ups as word targets with a distinct `type` value rather than creating a separate power-up gameplay system.

Current target types are:

```text
normal
power-up
```

### Reason

Power-ups currently share the fundamental behavior of normal targets:

- they spawn into the play area
- they move across the screen
- they reserve a starting letter
- the player locks onto them through typing
- they track typed progress
- they may be completed perfectly or imperfectly
- they may escape

Creating a separate system would duplicate this behavior.

The target type gives scoring and presentation systems enough information to apply specialized behavior without duplicating the core word lifecycle.

---

## 2026-07-03 — Reward only perfect power-up completion

### Decision

Apply the power-up score multiplier only when a power-up word is completed perfectly.

An imperfect power-up receives normal base score.

### Reason

The visually distinct target presents a higher-value opportunity.

The special reward should require clean execution. Allowing a player to make mistakes and retain the full power-up multiplier would weaken the meaning of both perfect words and combo streaks.