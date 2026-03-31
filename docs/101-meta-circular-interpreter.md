# Meta-Circular Interpreter

This document freezes the interpreter layer that sits between the
[Braille Kernel Codec](./100-braille-kernel-codec.md) and the runtime and
projection surfaces.

The purpose of this note is to define how a lawful Braille stream becomes:

```text
tokens
-> blocks
-> canonical event sequences
-> execution or projection units
```

This is the layer that completes the protocol stack:

```text
definition
-> axes
-> emission contract
-> codec
-> interpreter
-> runtime
-> projection
```

## 0. Core Statement

The meta-circular interpreter is the deterministic pass that reads the canonical
Braille stream, recognizes lawful boundaries, and produces execution units that
remain replayable and transcript-safe.

Its main rule is:

```text
Braille stream
-> token boundaries
-> block semantics
-> canonical event sequence
```

The interpreter must not invent protocol truth. It may only:

- recognize lawful structure
- normalize it into execution units
- expose it to runtime and projection layers

## 1. Why This Layer Exists

The codec already defines:

- 6-bit kernel payload
- 8-dot Braille carrier
- control classes
- block start and end classes

But the codec alone does not define:

- where token boundaries become meaningful execution units
- how replay blocks differ from asset blocks operationally
- how a stream becomes a program-like structure

The interpreter layer freezes that boundary.

## 2. Canonical Input

The interpreter reads canonical Braille events, not arbitrary projections.

The minimum lawful input is:

- `braille`
- `curr8`
- `curr6`
- `path`
- `transcript`

Recommended additional input fields:

- `seq`
- `tick`
- `step`
- `control_class`
- `block_kind`
- `d1_8`
- `d2_8`
- `d1_6`
- `d2_6`
- `rel16`
- `header8`
- `pattern16`
- `axis7`
- `axis240`
- `axis256`

This means the interpreter always runs on canonical event state, never on
observer-only projections.

## 3. Tokenization Rule

Tokenization must be deterministic.

The interpreter should read the Braille stream as a sequence of codec cells and
classify each cell by:

- payload slice
- control class
- position in the current block

The minimal tokenization rule is:

```text
Braille cell
-> split payload and control bits
-> assign token role
```

The token role must be derivable from canonical fields, not from later
projection layers.

## 4. Token Roles

The first stable token roles are:

- `data`
- `block_start`
- `block_end`
- `control`

These correspond directly to the codec control classes.

Additional token roles may be derived later, but only after the base control
class is recognized.

So the lawful order is:

```text
carrier class first
derived token meaning second
```

## 5. Block Model

The interpreter groups tokens into blocks.

The minimal block model is:

```text
Block
-> Header
-> Payload
-> Terminator
```

With the practical reading:

```text
block start
-> kernel payload cells
-> block end
```

This is enough to support the two block kinds already frozen in the codec:

- replay blocks
- asset blocks

## 6. Replay Block Rule

A replay block is the canonical execution-oriented block.

The interpreter should treat replay blocks as:

- ordered
- deterministic
- transcript-bearing
- suitable for state recovery and replay

Replay blocks are the preferred unit for:

- canonical event recovery
- runtime stepping
- proof continuity

## 7. Asset Block Rule

An asset block is a richer projected block.

The interpreter should treat asset blocks as:

- subordinate to canonical event law
- capable of carrying richer media or world payloads
- valid only when their boundaries are recognized lawfully

Asset blocks may later drive:

- media surfaces
- geometry/world surfaces
- wrapped legacy world-generation payloads

But they still begin as lawful codec blocks.

## 8. Minimal AST

The interpreter should produce a minimal structural form, not a heavy semantic
tree.

The first stable AST is:

```text
Program
-> Block*

Block
-> Header
-> Payload
-> Terminator

Payload
-> KernelUnit*
```

Where:

- `Program` is a replayable stream segment
- `Block` is a bounded interpreter unit
- `KernelUnit` is one decoded 6-bit payload slice plus its carrier metadata

This is enough to make the interpreter real without forcing premature semantic
complexity.

## 9. Kernel Units

A kernel unit is the smallest interpreter-visible payload element after the
Braille carrier has been split.

It should contain at least:

- 6-bit payload value
- control class
- source Braille cell
- position within block

Optional metadata may include:

- axis values
- path
- transcript line
- relation witness fields

Kernel units are the real payload objects the interpreter reasons over.

## 10. Execution Surface

The interpreter does not need to define “meaning” in the semantic sense.

Its job is only to turn blocks into lawful execution surfaces such as:

- canonical event sequences
- relation substrate records
- projection-ready units

So the execution surface is:

```text
block
-> canonical event sequence
-> runtime or projection consumer
```

Not:

```text
block
-> arbitrary semantic truth
```

## 11. Meta-Circular Rule

The interpreter is meta-circular because the same symbolic substrate it reads is
also the substrate through which it can describe itself.

In practice this means:

- canonical events can describe the interpreter’s own blocks
- replay is possible because the same law is used for reading and re-emitting
- projection layers can inspect interpreter structure without becoming
  authoritative

The system remains closed under replay because transcript equality remains the
final proof surface.

## 12. Tap-Code Bridge

Tap code is a useful bridge for understanding this layer.

Tap code works like:

```text
coordinate
-> timed traversal
-> symbol recovery
```

The interpreter generalizes the same law:

```text
axis traversal
-> Braille carrier
-> kernel unit recovery
-> block reconstruction
```

So the interpreter can be read as a machine version of coordinate-plus-clock
symbol recovery.

## 13. Determinism Rule

The interpreter must be deterministic.

Given the same lawful Braille sequence, it must produce the same:

- token sequence
- block boundaries
- kernel units
- canonical event sequence

Without this rule, the interpreter would become another projection layer rather
than a protocol layer.

## 14. What The Interpreter Prevents

This layer prevents:

### projection drift

UI or geometry layers cannot decide block boundaries on their own.

### semantic drift

Narrative or lexical overlays cannot decide token structure on their own.

### transport drift

Adapters cannot reinterpret the stream using a different block law without
leaving the protocol.

### replay drift

The same stream cannot yield different lawful blocks for different consumers.

## 15. One-Sentence Freeze

The meta-circular interpreter is the deterministic layer that reads the
canonical Braille stream, recognizes lawful token and block boundaries, and
produces replayable execution units without allowing projection or semantics to
redefine protocol truth.
