# Shared Vocabulary

This document defines the smallest shared relation vocabulary used to compare different symbolic domains without manually tagging every symbol one by one.

The point is not to erase domain differences. The point is to anchor a small canonical layer and let structure do most of the translation work.

## Core Rule

Different character sets do not need direct pairwise mappings if they can all land on the same relation substrate.

In this repo the current strategy is:

```text
symbol system
-> canonical relation vocabulary
-> Braille/control-plane projection
-> browser/runtime projection
```

That means:

- Braille stays the canonical machine-facing basis
- WordNet supplies lexical relation structure
- narrative text supplies actor, witness, and scene structure
- hexagrams supply ordered transformation structure

## Canonical Terms

The first shared vocabulary is intentionally small:

- `identity`
- `attribute`
- `gloss`
- `parent`
- `opposite`
- `contains`
- `moves`
- `actor`
- `witness`
- `scope`

These terms live in [shared_relation_vocabulary.py](/root/meta-braille/scripts/shared_relation_vocabulary.py).

## Domain Crosswalk

### WordNet

WordNet lands on the shared vocabulary like this:

- `s/6` -> `identity`
- `g/2` -> `gloss`
- `hyp/2` -> `parent`, `scope`
- `ant/4` -> `opposite`

### Narrative

The article corpus lands on the shared vocabulary like this:

- actor nodes -> `identity`, `actor`
- quoted passages -> `gloss`, `witness`
- `contains` edges -> `contains`, `scope`
- `speaks` edges -> `actor`, `witness`
- article and scene wrappers -> `scope`

### Hexagram

The first hexagram proof slice uses a small King Wen-aligned anchor set:

- hexagram nodes -> `identity`, `scope`
- yin/yang anchors -> `attribute`
- gloss text -> `gloss`, `witness`
- pairing and inversion contrast -> `opposite`
- ordered transition -> `moves`
- frame wrapper -> `scope`, `witness`

## Proof Slices

The projector script can emit all three domains into the same normalized NDJSON form:

```sh
python3 scripts/shared_relation_vocabulary.py --domain all --limit 24
```

It can also write public proof slices for browser inspection:

```sh
python3 scripts/shared_relation_vocabulary.py --write-public-proof-slices --limit 24
```

That produces:

- [wordnet-shared-vocabulary.ndjson](/root/meta-braille/web/public/proof/wordnet-shared-vocabulary.ndjson)
- [narrative-shared-vocabulary.ndjson](/root/meta-braille/web/public/proof/narrative-shared-vocabulary.ndjson)
- [hexagram-shared-vocabulary.ndjson](/root/meta-braille/web/public/proof/hexagram-shared-vocabulary.ndjson)

## Why This Matters

This is the boundary that reduces manual tagging.

Instead of hand-labeling every symbol across every character set, the repo only needs a small anchor vocabulary and a domain-specific way to project records into it. After that, the same records can be compared, rendered, and eventually translated through the existing control-plane and Braille runtime layers.

## Current Status

Implemented now:

- shared vocabulary definition
- projector script for WordNet, narrative, and hexagram proof slices
- generated public proof slices
- automated proof coverage in [test_shared_vocabulary.py](/root/meta-braille/tests/test_shared_vocabulary.py)

Still partial:

- no automatic Braille-stream transpilation from the proof slices yet
- no live browser loader for the proof slices yet
- no embedding or HNSW adapter over the normalized gloss layer yet
