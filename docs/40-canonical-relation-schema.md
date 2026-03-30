# Canonical Relation Schema

This document defines the smallest shared NDJSON shape that can unify:

- WordNet-style lexical relations
- article/narrative relation extraction
- Braille-indexed projection into the existing runtime and browser surfaces

The goal is not to replace the Braille event stream. The goal is to define a relation substrate that the meta-circular interpreter can transpile into Braille, JSON Canvas, DOM `data-*`, or spectacle-oriented character-set frames.

## Record Kinds

The schema has four primary record kinds:

- `node`
- `gloss`
- `edge`
- `frame`

Every record is emitted as one NDJSON object per line.

## `node`

Represents an identity-bearing unit.

```json
{
  "kind": "node",
  "id": "solomon",
  "role": "human",
  "label": "Solomon",
  "source": "narrative",
  "attrs": {
    "article": "article-i"
  }
}
```

Recommended roles:

- `human`
- `transport`
- `city`
- `synset`
- `sense`
- `scene`
- `story`
- `narrative`

## `gloss`

Represents attached text payload or witness text.

```json
{
  "kind": "gloss",
  "id": "solomon.g1",
  "node": "solomon",
  "text": "Order does not begin with law. It begins with right relation.",
  "source": "narrative"
}
```

This maps naturally to:

- WordNet `g/2`
- narrative quotations
- section or paragraph witnesses

## `edge`

Represents a normalized relation.

```json
{
  "kind": "edge",
  "id": "e1",
  "rel": "hyp",
  "from": "wn:synset:100007846",
  "to": "wn:synset:100004475",
  "plane": "fs",
  "source": "wordnet"
}
```

Common relation types already supported by the importers:

- `sense`
- `hyp`
- `ant`
- `contains`
- `speaks`
- `mentions`

Suggested plane mapping:

- `fs` = top-down semantic or scope hierarchy
- `gs` = group/state fabric or lateral context
- `us` = unit-local identity or binding
- `rs` = reduction, contrast, or result witness

## `frame`

Represents a higher-level spectacle or encapsulation unit.

```json
{
  "kind": "frame",
  "id": "narrative:frame:article-i:1",
  "open": "☝️",
  "hex": ["䷀", "䷁"],
  "payload": ["narrative:scene:article-i:1"],
  "close": "⛹️",
  "source": "narrative"
}
```

This is the character-set and transition wrapper layer:

- emoji delimiters = outer frame
- I Ching hexagram pair = transition register
- Braille or relation payload = canonical inner content

## WordNet Mapping

The first importer maps:

- `s/6` -> `node` for synset + `node` for sense + `edge` with `rel="sense"`
- `g/2` -> `gloss`
- `hyp/2` -> `edge` with `rel="hyp"` and `plane="fs"`
- `ant/4` -> `edge` with `rel="ant"` and `plane="rs"`

## Narrative Mapping

The narrative importer maps:

- article and section headings -> `node`
- block quotes -> `gloss`
- speaker-to-gloss attachment -> `edge` with `rel="speaks"`
- article/section containment -> `edge` with `rel="contains"`
- repeated named figures -> `node` with `role="human"`
- scene wrappers -> `frame`

## Current Status

Implemented in this repo:

- WordNet importer CLI
- narrative importer CLI
- proof-of-concept tests for both
- browser-side Prolog parser contract for `s/6`, `g/2`, `hyp/2`, and `ant/4`
- browser relation worker and service-worker mirror for live WordNet ingestion
- JSON Canvas and DOM projection helpers for canonical relation records

Not yet implemented:

- automatic transpilation of these records into the AWK Braille stream
- character-set spectacle rendering beyond `frame` emission
- HNSW or embedding-based gloss navigation
