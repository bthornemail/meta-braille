# Shadow Canvas Law

Status: normative for the current `meta-braille` and `matroid-garden` browser surface

## 0. Core Invariant

The browser page is enough to host the runtime law.

```text
DOM = carrier
data-* = canonical browser state surface
JS / Worker / runtime = interpreter
canvas / transcript / hexagram / narrative = projections
```

No projection layer may become the source of truth.

## 1. Canonical Order

The browser should always be read in this order:

```text
Braille event state
-> runtime transition fields
-> canonical address fields
-> projection fields
-> visible ordering
-> observer overlays
```

If a projection disagrees with canonical event state, the event state wins.

## 2. Canonical Browser State

Each runtime node must remain reconstructable from DOM `data-*` alone.

Minimum canonical browser fields:

- `braille`
- `curr8`
- `curr6`
- `rel16`
- `rows` or `selectors`
- `step`
- `path`

Recommended derived fields that may also be mirrored:

- `hexagram`
- `hexagram_index`
- `header8`
- `pattern16`
- `orbit_step`

The current browser surface already treats the DOM `data-*` layer as the browser-facing canonical state surface.

## 3. Hexagram Rule

Hexagram is derived, never authoritative.

Projection law:

```text
curr6
-> hexagram_index
-> Unicode Yijing symbol
-> header8
-> pattern16
```

So:

- Braille is canonical carrier
- hexagram is compact decoded class
- King Wen is visible ordering only
- transcript is the public proof surface

## 4. Shadow Canvas Rule

Shadow canvas is a projection surface over resolved state.

It may show:

- node placement
- grouping
- hierarchy
- visible sequence
- minimap, orbit, and scene composition

It may not define:

- identity
- canonical state
- relation truth
- address truth

So:

```text
address is not layout
layout is not identity
hexagram is not identity
transcript position is not identity
```

## 5. Identity Rule

Canvas nodes must derive identity from canonical address or canonical path, not from layout.

Allowed identity inputs:

- `path`
- canonical URI
- canonical address tuple
- stable runtime key

Not allowed as sole identity:

- `x` / `y`
- canvas node order
- hexagram glyph
- Braille glyph alone
- ad hoc JSON Canvas ID

## 6. Recommended Node Shape

Canonical DOM mirror:

```html
<div
  data-braille="⠓"
  data-curr8="13"
  data-curr6="13"
  data-rel16="A"
  data-rows="0x1,0x3,0x0,0x0"
  data-hexagram="䷍"
  data-header8="0D"
  data-pattern16="0D03"
  data-step="42"
  data-path="m/orbit/0/part/0/dialect/default/chain/0"
></div>
```

Recommended projected canvas node:

```json
{
  "id": "<derived from canonical path or address>",
  "type": "text",
  "x": 80,
  "y": 160,
  "width": 200,
  "height": 120,
  "text": "䷍ ⠓ ...",
  "data": {
    "braille": "⠓",
    "curr8": "13",
    "curr6": "13",
    "rel16": "A",
    "header8": "0D",
    "pattern16": "0D03",
    "path": "m/orbit/0/part/0/dialect/default/chain/0"
  }
}
```

The canvas node is derived from the DOM/data-* substrate, not the other way around.

## 7. Hierarchy Rule

Hierarchical modeling is allowed only as an added projection and address layer.

Hierarchy may be expressed through:

- parent and child relation fields
- canonical address tuples
- lane and leaf materialization fields
- projection grouping in canvas

But hierarchy must remain reducible back to canonical event state plus stable identity metadata.

Hierarchy is attached to the stream.
It does not replace the stream.

## 8. Worker Rule

Workers compute and normalize.
They do not redefine canonical law.

The correct split is:

- interpreter workers derive and fan out state
- DOM mirrors it
- canvas projects it

## 9. Service Worker Rule

The service worker is a local mirror, not authority.

It may:

- cache shell files
- mirror shadow scene graph state
- expose local shadow endpoints
- mirror relation selections

It may not become canonical truth.

## 10. UI Rule

The visible public proof surface remains the transcript:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

Everything visual must be explainable from that same event envelope.

So the shadow canvas should be readable as:

```text
the same stream, arranged spatially
```

not:

```text
a second independent protocol
```

## 11. React Rule

React may be added only as an adapter and view layer.

Correct stack:

```text
runtime
-> stable event/API surface
-> DOM/data-* contract
-> optional React hooks/components
```

Incorrect stack:

```text
React component tree
-> invented local semantics
-> runtime hidden behind framework state
```

Canonical state must remain usable without React.

## 12. Implementation Priority

Build in this order:

1. keep event envelope stable
2. keep DOM `data-*` mirror complete
3. derive shadow canvas from those nodes
4. add hexagram and King Wen overlays
5. add hierarchy and grouping only as projection metadata
6. add React hooks later if needed

## 13. One-Sentence Freeze

```text
The browser DOM with data-* attributes is the canonical substrate; shadow canvas, hexagrams, transcript, and hierarchical views are projections of that substrate.
```

This law is the practical bridge between:

- [10-runtime-and-web-architecture.md](./10-runtime-and-web-architecture.md)
- [60-signal-first-braille-hexagram.md](./60-signal-first-braille-hexagram.md)
- [90-canonical-projection-and-resolution.md](./90-canonical-projection-and-resolution.md)
