# Stage Two — Neural Current

## Status

Neural Current is the planned second stage for keystro.ke.

It is currently a foundation-stage configuration, not a complete playable themed stage.

---

## Identity

- Stage: Stage Two
- Name: Neural Current
- Stage ID: `neural`
- Stage class: `stage-neural`

---

## Purpose

Stage Two exists to test whether the reusable typing systems can support a second theme without becoming tied to Microscopic Drift.

The initial foundation should add data only:

- stage identity
- vocabulary
- power-up vocabulary
- pacing
- progression phases

Visual and audio presentation should be added in later commits after the stage can be selected deliberately.

---

## Theme Direction

Neural Current should feel like a field of charged signals.

Potential language:

- arcs
- voltage
- currents
- impulses
- synapses
- circuits
- static
- conductivity

The stage should feel sharper and more electrical than Microscopic Drift.

It should not simply recolor amoebas.

---

## Architecture Pressure

Stage Two should reveal which systems are truly reusable.

Expected pressure points:

- `StageManager` stage selection
- stage-specific intro copy
- stage-specific environment presentation
- target presentation beyond amoeba organisms
- stage-specific audio identity
- accessibility paths for non-visual and non-audio feedback

No broad abstraction should be introduced until Stage Two demonstrates the actual need.

---

## Current Boundary

The first Stage Two commit should not change the active playable stage.

Microscopic Drift remains active while Neural Current is registered as available stage data.

Stage switching should be designed separately.