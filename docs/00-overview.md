# Meta-Braille Handbook

This handbook is the builder-facing documentation surface for the current `meta-braille` codebase. It explains the system from first principles, then ties those ideas to the code that exists today in the runtime, browser surface, and tests.

The guiding rule for reading this repo is:

```text
dev-docs = conceptual origin and architecture pressure
runtime/web = current implementation
tests = proof-of-concept witness for implemented behavior
```

## Reading Order

1. [Overview](./00-overview.md)
2. [Runtime And Web Architecture](./10-runtime-and-web-architecture.md)
3. [Lexicon And Crosswalk](./20-lexicon-and-crosswalk.md)
4. [Proof And Tests](./30-proof-and-tests.md)
5. [Canonical Relation Schema](./40-canonical-relation-schema.md)
6. [Shared Vocabulary](./50-shared-vocabulary.md)
7. [Signal-First Braille + Hexagram](./60-signal-first-braille-hexagram.md)
8. [Public Release](./70-public-release.md)
9. [matroid-garden.com Deployment](./80-matroid-garden-deploy.md)
10. [Canonical Projection And Resolution](./90-canonical-projection-and-resolution.md)

## What This System Is

At its core, this repo is a small Braille-addressed runtime that turns Braille characters into a stream of deterministic state transitions. The current implementation proves a narrow but real vertical slice:

```text
FIFO ingress
-> gawk relational reasoner
-> Python runtime fanout and recovery
-> browser event stream
-> data-* graph / JSON Canvas projection
-> service-worker shadow scene graph
-> narrow WebRTC signaling path
```

The source of truth is not the browser, MQTT, memcached, or the UI. The current code treats the Braille event law as canonical and everything else as transport, recovery, projection, or mirroring.

The newest parallel upgrade extends that idea one step further: the runtime now supports a signal-first Braille + hexagram view where Braille is the basis language and canonical carrier, the Yijing hexagram block acts as the compact dialectic projection class over the same state stream, and the underlying machine is best thought of as a bit-linked stream or canonical transition chain.

## Canonical Runtime Pieces

### Braille cell

A Braille cell is treated as a structured byte. The runtime uses full 8-dot Braille as the canonical state surface and 6-dot Braille as a lower projection used for propagation-style reasoning. This is implemented in [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L30).

Conceptual origin:
- [2026-03-29-Braille_Thinking_System.md](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md)
- [2026-03-29-Life_Ruined_by_Word_Games.md](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md)

### 8-dot canonical state

The runtime computes `curr8` as the canonical 8-dot byte for each Braille symbol. That value is the reversible state surface the rest of the stream is derived from. See [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L30).

### 6-dot projection

The runtime computes `curr6` as the projected 6-dot form of the same symbol. In the current implementation this is a masked lower-six-bit projection, defined in [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L90).

### `FS`, `GS`, `US`, `RS`

The current codebase uses four selector roles derived from Braille row pairs:

- `FS` = top scope / frame selector
- `GS` = group or state-fabric selector
- `US` = unit or selection selector
- `RS` = reduction or result selector

Those selectors are emitted as both `rows` and `selectors` in the AWK event stream, normalized in the Python runtime, and written to `data-*` attributes in the browser. See:
- [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L56)
- [braille_runtime.py](/root/meta-braille/braille_runtime.py#L123)
- [web/graph.js](/root/meta-braille/web/graph.js#L1)

### `rel16`

`rel16` is the compact relation classifier derived from first- and second-order differences over the 6-dot and 8-dot views. In the current implementation it is calculated by rotating the second-order 8-dot difference, xoring it with the second-order 6-dot difference, and masking to four bits. See [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L39).

### JSON Canvas projection

The browser currently projects recent event history into a JSON Canvas-shaped document, not as a complete graph engine but as a lightweight projection helper. This lives in [web/graph.js](/root/meta-braille/web/graph.js#L68) and is displayed in the main browser surface.

### Shadow scene graph

The browser registers a service worker that mirrors recent event state into a local shadow scene graph. This is a control-plane mirror, not canonical truth. The implementation lives in:
- [web/service-worker.js](/root/meta-braille/web/service-worker.js#L1)
- [web/app.js](/root/meta-braille/web/app.js#L386)

## What Exists Today vs. What Is Still Conceptual

### Implemented today

- FIFO-compatible runtime shell around the AWK reasoner
- NDJSON event stream with Braille, selector, and control-plane fields
- Python runtime for recovery files, SSE stream, signaling endpoints, and optional MQTT/memcached hooks
- Browser page with:
  - `FS` top scope strip
  - `GS` left feature rail
  - `US` right feature rail
  - `RS` bottom reduction bar
  - central data-attribute graph and JSON Canvas projection
- Service-worker mirror for recent state
- Proof-of-concept tests for the reasoner, backend flow, and graph helpers

### Partial or planned

- MQTT publish hooks exist, but browser-side subscription and full MQTT-driven circulation are still partial.
- memcached hooks exist through the text protocol, but the memcached binary protocol is not yet implemented in code.
- A-Frame is discussed in the conceptual docs, but no A-Frame renderer exists in the current repo.
- The control-plane bars are currently display and inspection surfaces, not full interactive state owners.

### Conceptual source material

The `dev-docs/` folder contains the narrative and architectural pressure that led to the current implementation. Those documents are not identical to current code behavior. This handbook treats them as origin documents and cross-references them explicitly rather than assuming they are all implemented.

## Repo Map

Current builder-relevant areas:

- Runtime reasoner: [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk)
- Shell entrypoint: [braille_fifo_backend.sh](/root/meta-braille/braille_fifo_backend.sh)
- Python runtime: [braille_runtime.py](/root/meta-braille/braille_runtime.py)
- Browser surface: [web/app.js](/root/meta-braille/web/app.js), [web/graph.js](/root/meta-braille/web/graph.js), [web/index.html](/root/meta-braille/web/index.html), [web/service-worker.js](/root/meta-braille/web/service-worker.js)
- Proofs/tests: [tests/test_reasoner.py](/root/meta-braille/tests/test_reasoner.py), [tests/test_graph.mjs](/root/meta-braille/tests/test_graph.mjs)
- Relation importers: [scripts/wordnet_to_relations.py](/root/meta-braille/scripts/wordnet_to_relations.py), [scripts/narrative_to_relations.py](/root/meta-braille/scripts/narrative_to_relations.py)
- Shared vocabulary projector: [scripts/shared_relation_vocabulary.py](/root/meta-braille/scripts/shared_relation_vocabulary.py)
- Signal-first guide: [docs/60-signal-first-braille-hexagram.md](/root/meta-braille/docs/60-signal-first-braille-hexagram.md)
- Conceptual sources: [dev-docs](/root/meta-braille/dev-docs)

## Where To Go Next

- For the implementation flow, continue to [Runtime And Web Architecture](./10-runtime-and-web-architecture.md).
- For term definitions and concept-to-code references, go to [Lexicon And Crosswalk](./20-lexicon-and-crosswalk.md).
- For the proof surface and current test limits, go to [Proof And Tests](./30-proof-and-tests.md).
- For the small cross-domain anchor vocabulary, go to [Shared Vocabulary](./50-shared-vocabulary.md).
- For the signal-first upgrade, go to [Signal-First Braille + Hexagram](./60-signal-first-braille-hexagram.md).
- For the full address / projection / materialization stack, go to [Canonical Projection And Resolution](./90-canonical-projection-and-resolution.md).
