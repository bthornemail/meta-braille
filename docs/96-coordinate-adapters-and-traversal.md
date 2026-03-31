# Coordinate Adapters And Traversal

This document freezes one of the most important reductions in the current
`meta-braille` project:

```text
finite coordinate space
+ clocked traversal
= reconstructable language
```

The purpose of this note is to clarify how older geometry-first systems,
tap-code-like grids, and newer Braille plus hexagram work fit together without
competing for protocol authority.

## 0. Core Law

The canonical language of the system is not a geometry and not a visible symbol
set. It is the emitted stream.

For the current project that means:

```text
Braille = canonical emitted carrier
transcript = canonical observable proof surface
hexagram = derived interpretation
geometry = coordinate adapter
```

So the system should always be read in this order:

```text
coordinate space
-> traversal
-> canonical emission
-> transcript
-> interpretation
-> projection
```

The key consequence is:

```text
coordinate systems are interchangeable
canonical emission is not
```

## 1. Tap-Code Reduction

Tap code gives the simplest human example of the law.

Tap code works like this:

```text
5x5 coordinate grid
-> row count
-> pause
-> column count
-> reconstructed symbol
```

It does not transmit the letter directly. It transmits the traversal of a
finite coordinate space.

That is why tap code matters here. It proves that language can be encoded as:

```text
coordinate + clock = reconstructable symbol
```

The current project generalizes that idea:

```text
coordinate adapter
-> step or tick traversal
-> Braille carrier
-> transcript
-> higher-order interpretation
```

## 2. Coordinate Adapter Rule

The project can support many coordinate systems as long as they remain
adapters, not authority layers.

Examples of valid coordinate adapters include:

- tap-code-like grids
- Fano-style 7-state relational geometry
- Pascal-style combinatorial lattices
- trie-addressed sparse layout surfaces
- world or XR geometry
- mesh and shadow-canvas placement spaces

These spaces can determine:

- where the system is
- how the next step is selected
- how a state is arranged spatially
- how projections are grouped for humans

They may not determine:

- canonical identity by themselves
- canonical event truth by themselves
- transcript authority
- the meaning of Braille emission

So the rule is:

```text
geometry can host the language
geometry is not the language
```

## 3. Fano As Coordinate Adapter

The older geometry-first work discovered a very strong cyclic coordinate space:

```text
7-state relational closure
-> cyclic traversal
-> world, light, sound, and topology projections
```

That work still matters, but it must now be read correctly.

In the current project, Fano-like geometry is best treated as:

```text
legacy or optional coordinate adapter
```

not:

```text
the primary protocol truth
```

That means:

- Fano state can guide traversal
- Fano layout can drive geometry projections
- Fano-derived world surfaces can still be useful

but:

- Braille remains the canonical emitted carrier
- transcript remains the proof surface
- hexagram remains a derived interpretation layer

## 4. Geometry Root And Symbolic Root

The project now has two compatible roots that must be kept distinct.

### Geometry root

The older system already proved:

- cyclic world and topology surfaces
- 2D, 3D, AR, VR, and XR projection ideas
- replay-shaped NDJSON traces
- transport and synchronization substrate

This root should be read as:

```text
world and coordinate substrate
```

### Symbolic root

The newer work froze:

- Braille as basis language
- transcript as proof surface
- hexagram as derived projection class
- King Wen as visible ordering of projection

This root should be read as:

```text
canonical language and proof substrate
```

The correct synthesis is:

```text
geometry root = coordinate space
symbolic root = canonical emission law
```

Neither replaces the other.

## 5. Traversal Rule

A system element should be reducible to:

```text
where am I
what step is next
what canonical state is emitted
how is that state proved
how is that state interpreted
```

For the current project this becomes:

```text
coordinate adapter
-> tick or step
-> Braille state
-> transcript line
-> hexagram class
-> visible ordering and overlays
```

If a proposed feature cannot be reduced to that shape, it is probably a
projection-only idea rather than core protocol law.

## 6. Current Canonical Form

The current canonical event stack remains:

```text
Braille event state
-> runtime transition
-> canonical address
-> transcript
-> hexagram projection
-> visible ordering
-> observer overlays
```

The public replay contract remains:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

This line proves protocol equivalence.

Coordinate adapters can help generate, arrange, or read that event stream, but
they do not replace the stream.

## 7. Binding Rule For Older World Surfaces

Older geometry and world surfaces should be rebound to the current system like
this:

```text
coordinate adapter
-> canonical Braille event
-> transcript
-> hexagram and other dialect projections
-> world, media, and sensor surfaces
```

This keeps the earlier world-building work reusable without allowing it to
redefine the current law.

When those older world traces already exist as NDJSON, they should be wrapped
under the current canonical event law rather than replayed as standalone
authority. For the wrapper contract, continue to
[Legacy NDJSON Wrapper Schema](./97-legacy-ndjson-wrapper-schema.md).

So the correct policy is:

- adapt older world and geometry surfaces as coordinate adapters
- reconstruct protocol meaning around Braille and transcript
- auto-interpret legacy traces through a normalized event layer

## 8. One-Sentence Freeze

The canonical language is the emitted Braille and transcript stream; tap-code
grids, Fano geometry, trie spaces, and world layouts are coordinate adapters
that the stream can traverse and project through.
