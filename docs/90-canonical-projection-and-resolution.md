# Canonical Projection And Resolution

This document defines the canonical projection and resolution process for the current `meta-braille` repo.

The primary source for this law is the current handbook in `docs/`. Historical trie/materialization work may still inform the address layer, but the current protocol must be understandable from the docs folder alone.

In this handbook:

- `resolution` means deriving canonical identity from runtime state
- `projection` means producing readable, visual, or serialized views from that identity

The goal is to keep one clean separation:

```text
canonical state
-> canonical materialization address
-> projection layers
-> human-readable ordering and interpretation
```

The most important rule is:

```text
address is not layout
```

Visual position, canvas geometry, and readable symbol order are all projections. They must not replace canonical identity.

## 0. Canonical Rule

The system should always be read in this order:

```text
resolve first
project second
interpret third
```

That means:

1. determine canonical state
2. determine canonical address
3. derive readable views
4. allow human interpretation to attach afterward

If a later layer appears to disagree with an earlier layer, the earlier layer wins.

## 0.5 DOM Substrate Rule

The shortest practical description of the current implementation is:

```text
DOM = carrier
data-* = canonical state surface
JS / Worker / runtime = interpreter
```

This rule matters because it prevents later projection layers from pretending to be the source of truth.

In the browser:

- DOM nodes host canonical `data-*` state
- runtime and worker code derive transitions and witnesses
- transcript, hexagram, tap-stream, canvas, and narrative are layered views over that substrate

So one browser page is still enough to prove the runtime law. Everything else is projection, transport, or packaging.

## 1. Canonical Layers

The current project should be read first on its own terms. Historical material can still clarify the address layer, but it is not the primary definition of the current protocol.

### Basis language law

Before the layers are read independently, one language rule should be frozen:

```text
Braille = basis language
hexagram = dialectic projection over the basis language
Unicode blocks = partitioned dialect spaces
```

In runtime terms this means:

- the meta-circular interpreter speaks Braille
- the stream is the canonical Braille transition chain
- hexagrams are the compact dialectic surface derived from that chain
- extended Unicode blocks are rendering domains for the same underlying state

So the system should not be read as "Braille and hexagram are two competing languages." The stronger formulation is:

```text
Braille is the invariant language of the machine.
Hexagrams are the dialectic over that language.
Unicode blocks are partitioned projection spaces for that dialectic.
```

This is the current project law, not only a historical interpretation.

In the current public implementation this can be read as two coupled spaces:

```text
Braille basis space      = canonical carrier / state basis
hexagram sequencing space = derived sequencing / dialectic basis
```

The practical public proof surface for that coupling is the replay contract:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

If two implementations produce the same transcript for the same input, they are behaving as the same public protocol.

### 1. Braille runtime state

The executable source of truth in the current repo is the Braille event stream:

- `curr8` = canonical 8-dot carrier
- `curr6` = reduced 6-dot projection
- first- and second-order differences
- `rel16`
- `FS`, `GS`, `US`, `RS`

This is the canonical transition law. It is emitted by the reasoner and normalized by the runtime.

This is also the basis language of the meta-circular interpreter. Every later surface is derived from this layer.

### 2. Canonical materialization address

The current project needs a canonical materialization law for projected nodes, paths, and sparse layout surfaces. The compatible law used in this handbook is:

```text
artifacts/{quadrant}/{phase}/{lane}/{leaf}/
```

Using the factoradic 5040 trie statement:

- `quadrant` in `{xx, xX, Xx, XX}`
- `phase` in `{p0, p1, p2}`
- `lane` in `{00..3b}`
- `leaf` in `{0000..13af}`

This is the canonical addressing layer. For the current repo, treat it as a compatible address law that can be attached to the runtime stream and persisted in projected node metadata.

### 3. Projection classes

Projection classes are readable, compact surfaces derived from canonical state:

- hexagram projection from `curr6`
- `header8`
- `pattern16`
- transcript lines
- JSON Canvas nodes and edges
- DOM `data-*`

These are projections of the canonical stream and address law, not authority surfaces.

They should be read as dialectic surfaces over Braille, not as replacements for Braille.

### 4. Human interpretation

The top layer is human-facing interpretation:

- King Wen visible order
- tap-stream reading
- narrative overlays
- WordNet observer mode

These layers help people read the system. They do not define the system.

## 2. Resolution Order

The full resolution order should be read like this:

```text
Braille state
-> runtime transition
-> trie address
-> projection class
-> visible ordering
-> observer interpretation
```

Or more explicitly:

```text
curr8/curr6
-> event fields and invariants
-> quadrant/phase/lane/leaf
-> hexagram/header/witness/transcript
-> King Wen / tap stream / canvas
-> narrative / lexical / semantic overlays
```

This means:

- Braille remains canonical
- trie address is canonical identity
- hexagram is a compact dialectic class derived from Braille
- King Wen is a visible ordering of that dialectic layer
- JSON Canvas is a visual/projective serialization

It also means the stream itself can be understood in two compatible ways:

- as the canonical Braille transition chain spoken by the interpreter
- as a King Wen-sequenced visible dialect over that same chain

The second view is readable because of the first. It never replaces it.

This is the point where the handbook phrasing matters most:

```text
Braille = canonical carrier / basis
Hexagram = sequencing / dialectic expansion
Transcript = observable protocol surface
King Wen = ordering of projection, not identity
```

## 3. Projection Process

Once a canonical address exists, projection can branch into multiple readable surfaces without changing identity.

The current repo already supports several such surfaces:

- transcript lines
- tap-stream timing view
- hexagram class view
- King Wen ordered symbol view
- JSON Canvas-shaped graph projection
- DOM `data-*` mirrors
- narrative observer overlays

These should all be treated as sibling projections of the same resolved state.

In the current framing, the projection layer is best thought of as a sparse trie over the resolved stream state:

- trie address gives canonical materialization
- King Wen sequencing gives readable visible order
- projection surfaces expose different partitions of the same resolved state

So the projection layer is not "a new language." It is a sparse, ordered projection over the basis language.

The same rule also applies one layer lower:

```text
coordinate space is not canonical language
```

Finite grids, relational geometries, trie surfaces, and world layouts can all
act as coordinate adapters for traversal, but the canonical language remains the
emitted Braille and transcript stream. For the full coordinate-adapter framing,
continue to [Coordinate Adapters And Traversal](./96-coordinate-adapters-and-traversal.md).

The same unification can also be read as an axis model:

```text
7-axis   = cyclic stepping
240-axis = canonical address and topology
256-axis = observer window and projection
```

For that higher-level framing, continue to [Axis Model](./98-axis-model.md).

## 4. Canonical Address Contract

The canonical identity tuple is:

```text
(quadrant, phase, lane, leaf)
```

Recommended stable string form:

```text
artifact:{quadrant}:{phase}:{lane}:{leaf}
```

Examples:

- `artifact:xX:p0:17:03af`
- `artifact:XX:p2:3b:13af`

Recommended canonical URI form:

```text
artifact://{quadrant}/{phase}/{lane}/{leaf}
```

Recommended filesystem form:

```text
artifacts/{quadrant}/{phase}/{lane}/{leaf}/
```

### Semantic roles

- `quadrant` = orientation or chirality class
- `phase` = epoch or projection family
- `lane` = canonical 60-slot namespace
- `leaf` = sparse materialization target within that lane

### Canonical rule

No projection layer may replace this tuple.

That means canonical identity must not be defined only by:

- `x` / `y`
- JSON Canvas `id` invented ad hoc
- Braille glyph alone
- hexagram alone
- transcript position alone

All of those are derived views.

## 5. Projection Contract

### Hexagram projection

The current signal-first implementation projects:

```text
curr6
-> hexagram_index
-> Unicode Yijing symbol
-> header8
-> pattern16
```

This is documented in [60-signal-first-braille-hexagram.md](./60-signal-first-braille-hexagram.md).

This should be read as:

```text
Braille basis language
-> 6-bit dialect window
-> hexagram class
-> Unicode Yijing rendering
```

The same pattern can extend to other Unicode block partitions later, but the basis language remains Braille.

### Transcript projection

The canonical observable surface is:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

This transcript is the replay witness for the current implementation.

It is also the stable public protocol contract of the current project:

- Braille fields prove the canonical carrier
- hexagram fields prove the derived sequencing layer
- `header8` / `pattern16` prove the local witness surface
- `path` proves the public addressing and routing surface

So the transcript is not just a log line. It is the place where state, sequencing, witness, and public path meet in one replayable line.

### JSON Canvas projection

JSON Canvas is a projective view of the stream and address space.

For future node/address work, the recommended rule is:

- JSON Canvas node `id` should be derived from the canonical address tuple
- `x`, `y`, `width`, `height` should remain projection fields
- node metadata should carry canonical identity fields directly

Recommended node shape:

```json
{
  "id": "artifact:xX:p0:17:03af",
  "type": "text",
  "x": 80,
  "y": 160,
  "width": 200,
  "height": 120,
  "text": "…",
  "data": {
    "quadrant": "xX",
    "phase": "p0",
    "lane": "17",
    "leaf": "03af",
    "canonical_path": "artifacts/xX/p0/17/03af/",
    "canonical_uri": "artifact://xX/p0/17/03af"
  }
}
```

Recommended DOM mirror:

```html
<div
  data-quadrant="xX"
  data-phase="p0"
  data-lane="17"
  data-leaf="03af"
  data-canonical-path="artifacts/xX/p0/17/03af/"
  data-canonical-uri="artifact://xX/p0/17/03af"
></div>
```

## 6. King Wen And Canvas Ordering

King Wen sequencing belongs to the visible ordering layer, not the canonical address layer.

So the correct statement is:

```text
the canvas node is canonically addressed by the trie law,
but can be visually sequenced in King Wen order
over the meta-circular Braille state
```

This keeps the layers clean:

- trie address = who / where
- Braille = basis language and canonical state
- hexagram = compact dialectic class
- King Wen = readable order of dialectic classes
- canvas = projective arrangement

The useful summary is:

```text
the interpreter speaks Braille
the projection layer sequences hexagrams in King Wen order
the canvas arranges that sequence over sparse trie addresses
```

Another equivalent way to say this, matching the handbook language, is:

```text
Braille defines basis state
hexagram defines derived sequencing
transcript proves protocol equivalence
King Wen orders the visible projection
```

## 7. Historical Address Law And Current Repo

Earlier trie-first work established a useful materialization-address pattern.

The current `meta-braille` repo is stream-first and transition-first.

They can be unified with this rule:

```text
Braille stream = canonical transition law
Factoradic 5040 trie = canonical materialization address
Canvas / DOM / hexagram = projection layers
```

That means the historical project does not need to be copied literally into the new one. Instead:

- preserve the trie law
- preserve the lane / leaf identity contract
- preserve the projection-only role of witnesses and visual surfaces
- let the current Braille runtime feed that address space

## 8. Practical Default For Future Work

If new node-address work is added to the current repo, the safest default is:

1. derive canonical address from runtime event state
2. attach `quadrant`, `phase`, `lane`, and `leaf` to the event
3. derive node IDs and DOM `data-*` from that tuple
4. derive canvas layout from the same tuple
5. keep King Wen, tap-stream, and narrative as readable overlays

In short:

```text
address first
projection second
interpretation third
```

And, more fully:

```text
Braille first
address second
dialect projection third
interpretation fourth
```
