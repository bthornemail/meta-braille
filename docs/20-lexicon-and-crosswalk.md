# Lexicon And Crosswalk

This document is the handbook vocabulary for the current project. It defines the main terms in plain language and cross-links them to the other docs in this folder.

## Lexicon

### Braille cell

A single Braille symbol treated as a structured byte and decoded into 8-dot and 6-dot views.

### 8-dot canonical state

The full Braille byte used as the canonical or blackboard-style state surface.

### 6-dot projection

The lower-six-bit projection used as a reduced or propagation-oriented state view.

### bit-linked stream

The ordered transition chain emitted by the runtime. This is the simplest description of the machine: a sequential stream of bit-encapsulated state transitions that later projections observe.

### canonical transition chain

Another name for the same signal-first runtime spine. It emphasizes that runtime meaning comes from ordered transitions and replay, not from isolated symbols or static records.

### hexagram projection class

The compact Unicode Yijing symbol derived from the `curr6` projection window. It is a visible projection class over the canonical Braille state, not a second authority surface.

### King Wen visible order

The visible ordering used for the hexagram projection layer. In the current implementation it describes how the hexagram projection is presented, not how canonical state is stored.

### witness

The compact field that shows how a projection token is paired with a local relation snapshot. In the current signal-first slice, `pattern16` is the main witness field.

### `FS`, `GS`, `US`, `RS`

Selector roles derived from Braille row pairs:

- `FS` = frame / scope selector
- `GS` = group / state-fabric selector
- `US` = unit / selection selector
- `RS` = reduction / relation selector

### `rel16`

The compact four-bit relation classifier produced from second-order reasoning over the 6-dot and 8-dot views.

### JSON Canvas projection

A helper projection of current event history into a JSON Canvas-shaped node and edge structure.

### shadow scene graph

A local service-worker mirror of recent event state used as a control-plane staging surface.

### FIFO ingress

The named-pipe entrypoint that accepts stream input before it is forwarded into the AWK reasoner.

### recovery window

A bounded hot-state and replay slice maintained in runtime cache files and optional memcached keys.

### service-worker control plane

The browser-local orchestrator that mirrors recent events and exposes them through a worker-owned endpoint.

### memcached state fabric

An architectural role where memcached provides ephemeral shared state snapshots and hot-state lookup, not persistence or authority.

Current status:
- partially implemented through text-protocol hooks in the Python runtime
- binary protocol remains conceptual/spec-backed only

### MQTT discovery/diff layer

An architectural role where MQTT carries discovery, presence, and event diff metadata.

Current status:
- runtime publish hooks exist
- full browser-side subscription and richer circulation semantics remain partial

### canonical relation substrate

The normalized `node` / `gloss` / `edge` / `frame` NDJSON shape that can be imported from lexical or narrative sources before being projected into Braille or browser views.

Current status:
- still implemented and useful
- no longer the only organizing center of the repo after the signal-first upgrade

### shared relation vocabulary

The small anchor concept set used to compare WordNet, narrative, and hexagram records without manually tagging every symbol one by one.

### live browser WordNet relation parsing

The browser-side path that fetches public WordNet Prolog files, parses `s/6`, `g/2`, `hyp/2`, and `ant/4`, stores the resulting canonical records in the service-worker mirror, and projects them into the existing control-plane and JSON Canvas helper surfaces.
## Crosswalk Summary

This glossary now stands on its own inside the docs folder.

Use it like this:

- read a term here first
- use [00-overview.md](./00-overview.md) for the system summary
- use [10-runtime-and-web-architecture.md](./10-runtime-and-web-architecture.md) for flow and behavior
- use [30-proof-and-tests.md](./30-proof-and-tests.md) for what is currently proven
- use [60-signal-first-braille-hexagram.md](./60-signal-first-braille-hexagram.md) and [90-canonical-projection-and-resolution.md](./90-canonical-projection-and-resolution.md) for the current language law and projection stack
