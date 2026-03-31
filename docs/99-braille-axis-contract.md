# Braille Axis Contract

This document defines the bridge between the axis model and the canonical
runtime.

If the [Axis Model](./98-axis-model.md) says what the system is organized
around, this document says how that organization becomes a lawful emitted
state.

## 0. Core Statement

The system is organized across three orthogonal axes:

```text
7-axis   = cyclic stepping / relational clock
240-axis = canonical world addressing / topology
256-axis = observer window / projection
```

The Braille axis contract freezes the next step:

```text
Braille = canonical cross-axis descriptor
```

That means Braille is the emitted carrier that binds:

- stepping
- identity
- observation

into one replayable event surface.

## 1. Contract Shape

The contract can be read as:

```text
given:
- tick and relational step context
- canonical address or world identity
- local state needed for emission

produce:
- canonical Braille state
- canonical event fields
- canonical transcript line
```

Or, in the shortest practical form:

```text
tick + address + state
-> Braille event
-> transcript
```

## 2. Inputs

The canonical inputs to Braille emission are:

### 7-axis inputs

- `tick`
- local step position
- relational or cyclic phase

These answer:

```text
how is the system stepping
```

### 240-axis inputs

- canonical path
- canonical URI
- canonical address tuple
- world/topology placement identity

These answer:

```text
where does this event exist
```

### Local state inputs

- current machine state needed for emission
- prior state if differential or relational emission is needed
- selector or row context

These answer:

```text
what is being emitted at this step
```

### 256-axis inputs

The 256-axis does not define canonical truth, but it may provide observer
context for projection and framing.

It answers:

```text
how will the event be seen
```

This axis may affect projection afterward, but not canonical identity.

## 3. Required Outputs

Every canonical Braille event should produce at least:

- `braille`
- `curr8`
- `curr6`
- `path`
- `transcript`

Recommended additional outputs:

- `seq`
- `tick`
- `step`
- `d1_8`
- `d2_8`
- `d1_6`
- `d2_6`
- `rel16`
- `rows`
- `selectors`
- `header8`
- `pattern16`
- `hexagram_index`
- `hexagram`

The first set is the minimum public proof surface.
The second set is the preferred operational surface.

## 4. Canonical Order

The contract must always be read in this order:

```text
7-axis stepping
-> Braille emission
-> 240-axis identity binding
-> transcript proof
-> 256-axis projection
-> hexagram interpretation
```

This means:

- the 7-axis tells the runtime how to step
- Braille expresses the step as canonical emitted state
- the 240-axis binds that state to identity
- the transcript proves equivalence
- the 256-axis receives the event as observer projection
- hexagram interprets the event after canonical state is already fixed

## 5. Braille As Cross-Axis Descriptor

Braille is not merely a display symbol.

In the current project, it is the cross-axis descriptor because it carries the
canonical emitted state that all later surfaces rely on.

That is why the project law should be read as:

```text
Braille is the canonical descriptor that binds stepping, identity, and
observation into one replayable event.
```

This is the most important rule in the contract.

## 6. 8-Dot Structure

The runtime currently treats Braille as a structured byte.

The working practical split is:

- `curr8` = canonical 8-dot state
- `curr6` = reduced 6-dot projection

That means:

```text
8-dot Braille = full canonical emitted state
6-dot Braille = reduced projection used for compact interpretation
```

The contract therefore assumes:

- canonical emission is 8-dot
- compact interpretation can use the 6-dot reduction

## 7. Differential And Relational Fields

The Braille event is not just a static symbol.

It also carries the differential and relational surfaces needed for stepping and
replay:

- first-order differences
- second-order differences
- compact relation witness such as `rel16`
- selector and row decomposition

These derived fields remain part of the canonical event envelope because they
help prove lawful state transition, not because they replace Braille.

## 8. Transcript Binding

The transcript is the public proof surface of the contract.

The current replay line remains:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

That means the contract must always be able to produce:

1. the emitted Braille carrier
2. the canonical path or address
3. the compact derived projection fields needed for the transcript line

Transcript equality still defines protocol equivalence.

## 9. Hexagram Binding

Hexagram remains derived and secondary.

The contract does not emit Braille from hexagram.

Instead:

```text
Braille event
-> curr6
-> hexagram_index
-> hexagram
-> header8 / pattern16
```

So the relationship is:

- Braille = canonical cross-axis descriptor
- hexagram = higher-order interpretation over Braille state

Hexagram extends the event into readable higher-order meaning, but it does not
own identity or stepping.

## 10. Determinism Rule

The contract must remain deterministic.

Given the same:

- 7-axis stepping context
- 240-axis identity context
- canonical local state

the runtime must emit the same:

- Braille state
- canonical event fields
- transcript

This rule is what keeps the axis model from collapsing into arbitrary symbolic
projection.

## 11. What The Contract Prevents

This contract prevents several kinds of drift:

### observer drift

The 256-axis may change frames, windows, or layouts, but it may not redefine
identity or Braille emission.

### geometry drift

Geometry or world placement may host the event, but it may not replace the
Braille/transcript proof surface.

### interpretation drift

Hexagram, narrative, WordNet, and other observer layers may interpret, but they
may not redefine the canonical event.

### address drift

Visible ordering or glyph choice may change, but canonical address remains
bound on the 240-axis.

## 12. Minimal Runtime Question

Every lawful runtime step should be answerable as:

```text
what stepped
where does it exist
what Braille state was emitted
what transcript proves it
how may it now be projected
```

If a runtime surface cannot answer those questions, it is not yet aligned with
the Braille axis contract.

## 13. One-Sentence Freeze

Given stepping on the 7-axis, identity on the 240-axis, and local state, the
runtime must emit a deterministic Braille event whose transcript can be replayed
and whose observer projections on the 256-axis remain derived.

The next layer down from this contract is the codec and framing law that packs
kernel payload into the Braille carrier. For that, continue to
[Braille Kernel Codec](./100-braille-kernel-codec.md).
