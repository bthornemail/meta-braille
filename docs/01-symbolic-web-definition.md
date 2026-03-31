# Symbolic Web Definition

This document gives the apex definition of the point of view introduced by the
current project.

The shortest form is:

```text
Semantic Web = meaning-first
Symbolic Web = signal-first
```

The purpose of this note is to define the Symbolic Web precisely enough to be
useful in protocol, runtime, and world-building terms.

## 0. Core Definition

The Symbolic Web is a signal-first architecture where canonical symbolic events
are emitted as a replayable transcript, and all semantics, media, and world
representations are derived projections over that shared symbolic substrate.

This means:

- symbols are canonical
- transcript is the proof surface
- interpretation is derived
- semantics are one projection layer, not the authority layer

## 1. Canonical Law

The main law of the Symbolic Web is:

```text
signal
-> symbol
-> transcript
-> projection
-> interpretation
```

In the current project that becomes:

```text
Braille event
-> canonical transcript
-> structural relation layer
-> projection systems
-> local interpretation
```

So the system is not organized around “shared meaning first.” It is organized
around:

```text
shared symbolic replay first
```

## 2. Difference From The Semantic Web

The difference is not cosmetic.

### Semantic Web

The Semantic Web is generally meaning-first:

```text
data
-> ontology
-> meaning
-> reasoning
```

This has strengths, but it also makes protocol truth depend on contested or
fragile semantic agreement.

### Symbolic Web

The Symbolic Web is signal-first:

```text
signal
-> symbol
-> transcript
-> projection
-> interpretation
```

This allows:

- deterministic cores
- replayable protocol surfaces
- multiple local interpretations
- semantic disagreement without transcript disagreement

So the real distinction is:

```text
Semantic Web asks systems to agree on meaning.
Symbolic Web asks systems to agree on canonical symbolic replay.
```

## 3. Why This Project Uses The Symbolic Web View

The current project already behaves this way:

- Braille is the canonical emitted carrier
- transcript is the public proof surface
- hexagram is derived from `curr6`
- geometry, world, and observer views are projections
- WordNet is a semantic lens, not the authority layer

So the Symbolic Web is not a slogan added afterward. It is the best name for
what the repo already does.

## 4. Canonical Layer

The canonical layer of the Symbolic Web is the part every participant must be
able to agree on.

In the current project this layer includes:

- Braille carrier
- canonical event envelope
- transcript proof surface
- canonical address and path identity

This layer must remain:

- deterministic
- replayable
- transportable
- projection-independent

## 5. Structural Layer

Above the canonical layer is a structural layer.

This includes:

- relation substrate
- normalized anchors such as identity, witness, gloss, scope, actor, and moves
- shared vocabulary crosswalks

This layer helps systems compare domains without forcing them into a single
semantic doctrine.

## 6. Projection Layer

Above the structural layer are projection systems.

These include:

- hexagram classes and King Wen ordering
- narrative overlays
- world and geometry views
- JSON Canvas and shadow-canvas views
- media projections
- hardware projections
- semantic and lexical projections such as WordNet

These layers are allowed to vary as long as they remain derivable from the
canonical symbolic substrate.

## 7. Materialized Artifact Layer

The Symbolic Web is not limited to live streams, browser views, or semantic
overlays. It also allows canonical symbolic state to be materialized into
portable artifact surfaces.

The current project's historical Aztec lane is the clearest example:

```text
canonical symbolic event and transcript
-> artifact surface
-> portable embodiment
-> scan / re-entry
```

This means a Symbolic Web system can produce an artifact that is:

- materially portable
- independently scannable
- replay-compatible
- still subordinate to transcript authority

So the artifact lane is not a separate theory. It is one way the Symbolic Web
becomes portable across environments.

For the specific Aztec embodiment of this rule, see
[Aztec Artifact Surface](./103-aztec-artifact-surface.md).

## 8. Main Constraint

The Symbolic Web only works if one rule remains frozen:

```text
Every projection must be derivable from the transcript,
and no projection may redefine the transcript.
```

This keeps:

- semantics honest
- geometry subordinate to proof
- observer layers non-authoritative
- adapters interoperable

## 9. Current Project Stack

The Symbolic Web as implemented here can be read as:

```text
Symbolic Web
-> axis model
-> Braille carrier
-> transcript
-> relation substrate
-> projection adapters
-> interpretation systems
```

Or more concretely:

```text
Axis Model
-> Braille Axis Contract
-> Braille Kernel Codec
-> transcript proof
-> geometry, semantics, UI, XR, and hardware projections
```

The artifact lane also fits into the same stack:

```text
canonical event and transcript
-> artifact surface
-> portable embodiment
-> scan / re-entry
```

This is one of the places where the Symbolic Web becomes materially portable,
not only conceptually replayable.

## 10. Relationship To The Semantic Web

The Symbolic Web does not abolish semantic systems.

It contains them.

That means:

```text
Semantic Web = one projection layer inside the Symbolic Web
```

So semantic reasoning, lexical systems, and ontological tools are still useful.
They are simply not allowed to redefine protocol truth.

## 10. Why This Matters

This definition changes what counts as interoperability.

Under the Symbolic Web:

- two systems can disagree on meaning
- yet still agree on transcript
- and therefore still participate in the same protocol

That is a much stronger and more practical form of interoperability for the
current project than shared ontology alone.

## 11. One-Sentence Freeze

The Symbolic Web is a signal-first architecture in which canonical symbolic
events and their replayable transcript are primary, while semantics, media,
worlds, and ontologies remain derived projections over that shared symbolic
substrate.
