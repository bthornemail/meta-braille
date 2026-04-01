# Meta-Braille Handbook

This handbook is the builder-facing documentation surface for the current `meta-braille` codebase. It explains the system from first principles and is intended to stand on its own without requiring the reader to leave the `docs/` folder.

The guiding rule for reading this handbook is:

```text
overview docs = protocol and vocabulary
architecture docs = runtime behavior
proof docs = confidence boundary
```

## Reading Order

1. [Overview](./00-overview.md)
2. [Symbolic Web Definition](./01-symbolic-web-definition.md)
3. [Runtime And Web Architecture](./10-runtime-and-web-architecture.md)
4. [Lexicon And Crosswalk](./20-lexicon-and-crosswalk.md)
5. [Proof And Tests](./30-proof-and-tests.md)
6. [Canonical Relation Schema](./40-canonical-relation-schema.md)
7. [Shared Vocabulary](./50-shared-vocabulary.md)
8. [Signal-First Braille + Hexagram](./60-signal-first-braille-hexagram.md)
9. [Public Release](./70-public-release.md)
10. [Public Route Smoke Checklist](./71-public-route-smoke-checklist.md)
11. [matroid-garden.com Deployment](./80-matroid-garden-deploy.md)
12. [Canonical Projection And Resolution](./90-canonical-projection-and-resolution.md)
13. [Shadow Canvas Law](./95-shadow-canvas-law.md)
14. [Coordinate Adapters And Traversal](./96-coordinate-adapters-and-traversal.md)
15. [Legacy NDJSON Wrapper Schema](./97-legacy-ndjson-wrapper-schema.md)
16. [Axis Model](./98-axis-model.md)
17. [Braille Axis Contract](./99-braille-axis-contract.md)
18. [Braille Kernel Codec](./100-braille-kernel-codec.md)
19. [Meta-Circular Interpreter](./101-meta-circular-interpreter.md)
20. [Matroid Emergence](./102-matroid-emergence.md)
21. [Aztec Artifact Surface](./103-aztec-artifact-surface.md)
22. [Artifact-First Transport And Sharing](./104-artifact-first-transport-and-sharing.md)

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

The artifact lane now follows the same rule. The project treats a canonical
artifact as invariant across a realization axis:

```text
artifact = invariant
realization = coordinate choice
witness / scanner = positions on the realization axis
```

So artifact surfaces do not compete with the canonical event law. They are
offset-related realizations of the same payload, transcript, and identity.

The newest parallel upgrade extends that idea one step further: the runtime now supports a signal-first Braille + hexagram view where Braille is the basis language and canonical carrier, the Yijing hexagram block acts as the compact dialectic projection class over the same state stream, and the underlying machine is best thought of as a bit-linked stream or canonical transition chain.

## Canonical Runtime Pieces

### Braille cell

A Braille cell is treated as a structured byte. The runtime uses full 8-dot Braille as the canonical state surface and 6-dot Braille as a lower projection used for propagation-style reasoning.

### 8-dot canonical state

The runtime computes `curr8` as the canonical 8-dot byte for each Braille symbol. That value is the reversible state surface the rest of the stream is derived from.

### 6-dot projection

The runtime computes `curr6` as the projected 6-dot form of the same symbol. In the current implementation this is a masked lower-six-bit projection.

### `FS`, `GS`, `US`, `RS`

The current codebase uses four selector roles derived from Braille row pairs:

- `FS` = top scope / frame selector
- `GS` = group or state-fabric selector
- `US` = unit or selection selector
- `RS` = reduction or result selector

Those selectors are emitted as both `rows` and `selectors` in the event stream, normalized in the runtime, and written to `data-*` attributes in the browser.

### `rel16`

`rel16` is the compact relation classifier derived from first- and second-order differences over the 6-dot and 8-dot views. In the current implementation it is calculated by rotating the second-order 8-dot difference, xoring it with the second-order 6-dot difference, and masking to four bits.

### JSON Canvas projection

The browser currently projects recent event history into a JSON Canvas-shaped document, not as a complete graph engine but as a lightweight projection helper.

The current shadow-canvas lane can also be read through a Pascal dependency field:

```text
Braille event
-> canonical address
-> Pascal dependency lattice
-> JSON Canvas projection
-> runtime / artifact / observer overlays
```

That same dependency field now appears across the main browser explanation surfaces:

- shadow canvas / mesh builder
- runtime dashboard
- world composition surface

### Shadow scene graph

The browser registers a service worker that mirrors recent event state into a local shadow scene graph. This is a control-plane mirror, not canonical truth.

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

## Handbook Boundary

This handbook is intentionally self-contained. The rest of the repo still contains implementation files, tests, and deployment assets, but the docs should be readable without leaving `docs/`.

## Where To Go Next

- For the implementation flow, continue to [Runtime And Web Architecture](./10-runtime-and-web-architecture.md).
- For the apex signal-first definition of the project, go to [Symbolic Web Definition](./01-symbolic-web-definition.md).
- For term definitions and concept-to-code references, go to [Lexicon And Crosswalk](./20-lexicon-and-crosswalk.md).
- For the proof surface and current test limits, go to [Proof And Tests](./30-proof-and-tests.md).
- For the small cross-domain anchor vocabulary, go to [Shared Vocabulary](./50-shared-vocabulary.md).
- For the signal-first upgrade, go to [Signal-First Braille + Hexagram](./60-signal-first-braille-hexagram.md).
- For the final go/no-go pass across the public routes, go to [Public Route Smoke Checklist](./71-public-route-smoke-checklist.md).
- For the full address / projection / materialization stack, go to [Canonical Projection And Resolution](./90-canonical-projection-and-resolution.md).
- For the browser-side substrate and projection law, go to [Shadow Canvas Law](./95-shadow-canvas-law.md).
- For the coordinate-space, traversal, and tap-code-style reduction, go to [Coordinate Adapters And Traversal](./96-coordinate-adapters-and-traversal.md).
- For carrying older replay traces into the current law, go to [Legacy NDJSON Wrapper Schema](./97-legacy-ndjson-wrapper-schema.md).
- For the main unification proposal across stepping, address, and observer space, go to [Axis Model](./98-axis-model.md).
- For the bridge from the axis model to canonical runtime emission, go to [Braille Axis Contract](./99-braille-axis-contract.md).
- For the canonical 6-bit to 8-dot Braille transport and framing law, go to [Braille Kernel Codec](./100-braille-kernel-codec.md).
- For the token, block, and execution-unit layer above the codec, go to [Meta-Circular Interpreter](./101-meta-circular-interpreter.md).
- For why closure, basis, and dependence become unavoidable in the system, go to [Matroid Emergence](./102-matroid-emergence.md).
- For the portable 2D artifact and scan/re-entry lane inside the same system, go to [Aztec Artifact Surface](./103-aztec-artifact-surface.md).
- For the artifact-first transport and PWA/file/share rule above the same artifact law, go to [Artifact-First Transport And Sharing](./104-artifact-first-transport-and-sharing.md).
