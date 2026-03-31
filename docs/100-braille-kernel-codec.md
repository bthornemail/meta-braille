# Braille Kernel Codec

This document freezes the next normative layer after the
[Braille Axis Contract](./99-braille-axis-contract.md):

```text
binary
-> 6-bit kernel stream
-> 8-dot Braille carrier
-> transcript-safe framing
-> derived hexagram dialect
-> lossless decode
```

The goal of this codec is to make the current project readable as a real
transport and replay law rather than only a symbolic projection system.

## 0. Core Law

The codec is organized around three numeric roles:

```text
7 = cyclic stepping and framing axis
6 = interpretable payload slice
8 = canonical Braille transport carrier
```

This means:

- the 7-axis governs stepping and block progression
- the 6-bit slice carries the kernel payload
- the 8-dot Braille cell carries the emitted transport-safe symbol

## 1. Canonical Split

The canonical split is:

```text
6-bit kernel payload
+ 2 control bits
= 8-dot Braille cell
```

Or more concretely:

```text
[ b0 b1 b2 b3 b4 b5 | c0 c1 ]
```

Where:

- `b0..b5` are the kernel payload bits
- `c0..c1` are the control bits

This gives one emitted Braille cell per codec unit.

## 2. Why The Split Matters

The current runtime already distinguishes:

- `curr8` as full canonical emitted state
- `curr6` as reduced projection

The codec freezes that distinction at the transport layer:

```text
curr8 = full carrier
curr6 = payload slice
```

That means:

- the lower 6 bits remain the compact kernel and hexagram-facing slice
- the full 8 bits remain the canonical transport surface used for replay

## 3. Packing Rule

Raw bytes must be packed into a 6-bit kernel stream before Braille emission.

The recommended first implementation is:

```text
input bytes
-> streaming bit buffer
-> emit 6-bit units in order
-> stuff each unit into an 8-dot Braille cell
```

This keeps the codec deterministic and avoids requiring byte-aligned payloads at
the 6-bit layer.

The important rule is:

```text
same binary input -> same 6-bit unit stream -> same Braille sequence
```

## 4. Control Bits

The recommended first control-bit table is:

```text
c0 c1
00 = data cell
01 = block start
10 = block end
11 = control / escape / metadata
```

This is the first normative table because it is simple, expressive, and
compatible with the current event law.

So the full cell should be read as:

```text
payload bits + control class
```

not:

```text
hexagram + arbitrary decoration
```

## 5. Block Kinds

The codec supports at least two block kinds.

### Replay block

A replay block is the canonical stream-oriented block.

It is for:

- replay-safe payload
- canonical sequencing
- proof and transcript continuity
- deterministic decode

### Asset block

An asset block is a richer projected block riding on the same codec.

It is for:

- media payload
- projected world objects
- richer connection or object metadata
- wrapped legacy world-generation payloads

Both block kinds use the same transport law. They differ by control-class and
payload interpretation.

## 6. Block Boundary Rule

The codec must mark block boundaries explicitly.

At minimum:

- block start cells must be identifiable
- block end cells must be identifiable
- control or escape cells must be distinguishable from data cells

This is what makes the stream transcript-safe and replay-safe.

The 7-axis can provide step and phase structure, but the Braille stream itself
must still be able to mark boundaries lawfully.

## 7. Hexagram Binding

Hexagram remains derived.

The binding rule is:

```text
Braille carries the data
hexagram describes the dialect of the 6-bit slice
```

So the codec relation is:

```text
8-dot Braille cell
-> extract lower 6 bits
-> derive hexagram class
-> derive dialect surface
```

This means:

- hexagram is not required to reconstruct binary
- hexagram is useful for interpretation, classification, and higher-order
  production or consumption
- Braille remains the canonical carrier

## 8. Transcript Binding

The transcript remains the public proof surface of the codec.

The current canonical line remains:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

The codec must therefore always be able to derive:

- the emitted Braille carrier
- the compact 6-bit-derived projection fields
- the canonical path or address

That makes replay and transport visible without exposing raw binary directly.

## 9. Event Envelope

The codec extends the current canonical event envelope rather than replacing it.

Minimum canonical event fields remain:

- `braille`
- `curr8`
- `curr6`
- `path`
- `transcript`

Recommended additional codec-facing fields:

- `seq`
- `tick`
- `step`
- `control_class`
- `block_kind`
- `block_index`
- `block_open`
- `block_close`
- `d1_8`
- `d2_8`
- `d1_6`
- `d2_6`
- `rel16`
- `header8`
- `pattern16`
- `hexagram_index`
- `hexagram`

These fields make the codec readable as an event stream, not only as a byte
transform.

## 10. Replay Blocks And Asset Blocks

A replay block should prioritize:

- deterministic decode
- stable transcript continuity
- canonical state recovery

An asset block should prioritize:

- carrying richer projected payloads
- attaching world, media, or object data
- remaining subordinate to the canonical event layer

This is the same rule already used for wrapped legacy NDJSON:

```text
canonical layer first
projection payload second
```

## 11. Decode Rule

Decode must be lossless and deterministic.

The recommended decode order is:

```text
Braille stream
-> recover curr8 cells
-> split payload bits and control bits
-> rebuild 6-bit unit stream
-> reassemble original byte stream
```

Hexagram does not participate in reconstruction as authority.

It may validate or interpret the payload slice, but decode must succeed from the
Braille carrier law alone.

## 12. Determinism Rule

The codec must satisfy:

```text
same input bytes
-> same 6-bit units
-> same 8-dot Braille cells
-> same transcript-visible event sequence
```

And conversely:

```text
same lawful Braille sequence
-> same recovered binary
```

Without this rule the codec becomes symbolic decoration rather than a transport
law.

## 13. Why This Fits The Handbook

This codec keeps the rest of the handbook aligned:

- the [Axis Model](./98-axis-model.md) still governs stepping, identity, and
  observer space
- the [Braille Axis Contract](./99-braille-axis-contract.md) still governs
  canonical emission
- the [Legacy NDJSON Wrapper Schema](./97-legacy-ndjson-wrapper-schema.md)
  still allows richer world payloads to ride under canonical events
- the [Coordinate Adapters And Traversal](./96-coordinate-adapters-and-traversal.md)
  still ensures geometry and symbol families are adapters, not authority

So this codec is not a separate theory. It is the transport and framing law of
the same system.

## 14. First Reference Table

The first reference implementation should assume:

```text
payload bits = lower six bits
control bits = upper two bits
```

with:

```text
00 = data
01 = block start
10 = block end
11 = control / metadata
```

This should be the default until a stronger table is proven necessary.

## 15. One-Sentence Freeze

Binary is packed into a 6-bit kernel stream, emitted through 8-dot Braille as
the canonical carrier, and interpreted through hexagram classes as a derived
dialect layer; deterministic decode must recover the original binary exactly.

The next layer above the codec is the interpreter pass that recognizes tokens,
blocks, and execution units. For that, continue to
[Meta-Circular Interpreter](./101-meta-circular-interpreter.md).
