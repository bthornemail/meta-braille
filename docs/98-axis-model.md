# Axis Model

This document freezes the main unification proposal of the current project:

```text
the system is organized across orthogonal axes
```

The axis model is the simplest way to state how the geometry-first work, the
Braille runtime, the transcript law, and the observer-facing surfaces fit
together without collapsing into one vocabulary.

## 0. Core Statement

The runtime is defined across three orthogonal axes:

```text
7-axis   = cyclic stepping / relational clock
240-axis = canonical world addressing / topology
256-axis = observer window / frame / projection
```

These are not competing spaces.

They are:

```text
distinct roles in one system
```

## 1. The 7-Axis

The 7-axis is the cyclic stepping axis.

It owns:

- tick progression
- relational stepping
- cyclic traversal
- finite closure over local state transitions

This is the axis that earlier Fano-style work was reaching toward.

In current language:

```text
7-axis = how the system steps
```

It should not be confused with:

- world identity
- visual layout
- observer frames

## 2. The 240-Axis

The 240-axis is the canonical world axis.

It owns:

- address and provenance
- topology and placement in the world
- materialization identity
- physical mapping
- replay anchor

This is the axis expressed through canonical address laws and HD-path-like
identity surfaces.

In current language:

```text
240-axis = where the system exists
```

This is the axis that should carry:

- path
- canonical URI
- trie-style materialization identity
- world and topology anchoring

It should not be replaced by:

- window coordinates
- visible glyph order
- projection layout

## 3. The 256-Axis

The 256-axis is the observer axis.

It owns:

- frame and windowing
- 16x16 style view surfaces
- packet-sized visible slices
- UI and canvas projection
- XR, screen, and observer-facing arrangement

In current language:

```text
256-axis = how the system is seen
```

This axis is allowed to change freely as long as it does not redefine the
240-axis identity or the 7-axis stepping law.

One important subspace inside the 256-axis is the realization axis for
artifact surfaces.

That subspace currently includes two important realization positions:

- witness realization = canonical internal artifact placement
- scanner realization = external scanner-compatible placement

These are related by an offset transform while preserving canonical identity.

## 4. Canonical Reading Order

The axis model should be read like this:

```text
7-axis
-> Braille state
-> 240-axis address
-> transcript
-> 256-axis projection
-> interpretation
```

Or more explicitly:

```text
tick mod 7
-> Braille carrier
-> canonical path / address
-> transcript proof line
-> window / frame / canvas / XR surface
-> hexagram and observer overlays
```

This is the cleanest current unification of the project.

## 5. Braille In The Axis Model

Braille remains the canonical emitted carrier.

That means:

- the 7-axis drives stepping into Braille state
- the 240-axis anchors Braille events in world identity
- the 256-axis receives Braille events as projection input

So the canonical law remains:

```text
Braille = canonical emitted language
```

The axis model does not replace that law. It organizes where that law lives.

## 6. Transcript In The Axis Model

The transcript remains the public proof surface.

The transcript sits between canonical resolution and observer projection:

```text
7-axis stepping
-> Braille event
-> 240-axis identity
-> transcript
-> 256-axis observer projection
```

That is why transcript equality still defines protocol equivalence.

## 7. Hexagram In The Axis Model

Hexagram is still derived.

It belongs to the observer and interpretation side of the system, not the
identity side.

So:

```text
hexagram = derived interpretation over Braille state
```

Within the axis model, hexagram sits above the canonical event and below the
human-facing projection layers:

```text
Braille event
-> transcript
-> hexagram class
-> King Wen visible order
-> observer view
```

It must not replace:

- 7-axis stepping
- 240-axis address
- transcript authority

## 8. Why This Unifies The Project

The axis model resolves several earlier confusions:

### 240 vs 256

These are not rival encodings.

They are:

- `240` for canonical world identity
- `256` for observer framing

### geometry vs language

Geometry can host or arrange the system, but the canonical emitted language is
still Braille and transcript.

### witness vs scanner

These are not separate artifact systems.

They are:

- two positions on the realization axis inside the 256-axis
- related by an offset transform
- required to decode to the same canonical payload and transcript

### old world runtime vs new canonical runtime

The older world and geometry work fits into the 240-axis and 256-axis surfaces.
The newer Braille and transcript law clarifies the 7-axis stepping and the
canonical emitted layer.

## 9. Implementation Rule

Every event should be understandable across the three axes:

1. what is the current step on the 7-axis
2. what is the current identity on the 240-axis
3. what is the current projection on the 256-axis

So a normalized event should always be able to answer:

- what stepped
- where it exists
- how it is shown

No observer-facing projection may redefine canonical identity.

## 10. One-Sentence Freeze

The system operates across three orthogonal axes: a 7-axis for cyclic stepping,
a 240-axis for canonical world addressing, and a 256-axis for observer
projection.

The next layer down from this model is the canonical emitted carrier. For that
bridge, continue to [Braille Axis Contract](./99-braille-axis-contract.md).
