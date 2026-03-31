# Runtime And Web Architecture

This document walks through the current implementation from input stream to browser projection. It is organized by behavior, not by file inventory, so a builder can understand the runtime path without leaving the handbook.

## End-To-End Flow

The current stack is:

```text
Braille input
-> FIFO ingress
-> AWK reasoner
-> NDJSON event
-> Python runtime fanout
-> SSE / recovery / signaling endpoints
-> browser worker and app shell
-> data-* graph + JSON Canvas projection
-> service-worker shadow scene graph
```

## 1. Stream Reasoning

The first stage is the AWK reasoner.

It performs these steps for each Braille character:

- decode the symbol to its canonical 8-dot byte
- project to a 6-dot byte
- compute first-order and second-order differences for both views
- compute `rel16`
- derive row-pair selectors `FS`, `GS`, `US`, `RS`
- emit one NDJSON event per symbol

Important fields emitted here:

- `braille`
- `curr8`
- `curr6`
- `d1_6`, `d2_6`
- `d1_8`, `d2_8`
- `rel16`
- `hexagram`
- `hexagram_codepoint`
- `hexagram_index`
- `hexagram_order`
- `header8`
- `pattern16`
- `rows`
- `selectors`
- `rows_hex`
- `fs`, `gs`, `us`, `rs`
- `orbit`, `orbit_step`
- `part`, `dialect`, `chain`
- `step`
- `path`

This stage is the current canonical reasoning surface.

In the signal-first upgrade, Braille remains canonical and the hexagram fields are treated as a deterministic compact projection of `curr6`, not as a second source of truth. The runtime is best read as a canonical transition chain: a bit-linked stream whose visible hexagram layer is presented in King Wen order.

## 2. FIFO And Shell Orchestration

The shell entrypoint provides the busybox-style local runtime commands:

- `init`
- `run`
- `publish`
- `inspect`
- `serve`

When `run` is active:

- `ingress.fifo` accepts stream input
- raw input is appended to `raw.log`
- the same input is forwarded to `interp.fifo`
- `gawk` reads from `interp.fifo`
- the emitted NDJSON is piped to the Python runtime fanout command

This keeps the local process layer small and transparent.

## 3. Runtime Fanout, Recovery, And Signaling

The Python runtime does three kinds of work:

### Event normalization

`parse_event()` normalizes incoming NDJSON and fills in derived fields when needed, especially:

- selector objects
- hex row strings
- control-plane envelopes `fs`, `gs`, `us`, `rs`
- `orbit_step`

### Recovery and hot-state storage

`process_event()` writes the incoming event to:

- `rel.log`
- `cache/latest.json`
- `cache/tip.json`
- per-coordinate cache directories
- bounded recovery window files

It also writes optional memcached keys and optional MQTT publish events when those integrations are enabled.

Current truth boundary:

- file caches and memcached are recovery or hot-state helpers
- they are not treated as authority over the Braille event law

### HTTP/SSE/signaling surface

The HTTP server exposes:

- `/api/config`
- `/api/latest`
- `/api/recovery`
- `/api/events`
- `/api/peers`
- `/api/signals`

and also serves the browser shell and service worker.

## 4. Browser Runtime

The main browser control logic lives in the browser shell and its helper modules.

It currently does these jobs:

- fetch initial config
- announce local peer presence
- load the recovery window
- subscribe to live SSE event stream
- maintain a recent in-memory event list
- render the control-plane bars and feature rails
- mirror events into the service worker
- maintain narrow WebRTC peer signaling and channel forwarding
- load and parse live WordNet Prolog sources in a dedicated worker

### Live WordNet relation mode

The browser now also has a live WordNet mode built on top of the same shell.

The source list is fixed to four public WordNet relation files:

- `wn_s.pl`
- `wn_g.pl`
- `wn_hyp.pl`
- `wn_ant.pl`

The relation worker fetches those public `.pl` files, parses them line by line, and emits four internal browser events:

- `relation_source_loaded`
- `relation_record_parsed`
- `relation_batch_ready`
- `relation_selected`

The parser contract currently supports:

- `s/6` -> synset node, sense node, `sense` edge
- `g/2` -> gloss record
- `hyp/2` -> `fs` hierarchy edge
- `ant/4` -> `rs` contrast edge

The page runtime ingests those canonical relation records, mirrors them into the service worker, and projects them into the same DOM and JSON Canvas helper surfaces used by the Braille stream.

### Signal-first mode

The browser shell now also exposes a dedicated `Signal` mode.

That mode emphasizes:

- Braille as canonical stream
- hexagram as compact header/class view
- rolling dump lines rendered from the same event envelope
- the orbit clock and minimap as the main visible proof surface

This mode is implemented by the shared event projection layer, the hexagram projection helper, and the scene logic in the browser shell.

### Top and bottom control planes

The browser now renders real `FS` and `RS` surfaces:

- `FS` top scope strip:
  - `scope128`
  - `partition_layer`
  - `scene_step`
  - `orbit_step`
- `RS` bottom reduction bar:
  - `frame16`
  - `braille_reduce`
  - `rel16`
  - `result_trace`

These are updated together by the main control-plane renderer.

### Side rails

The side rails are currently:

- left `GS` rail
  - transport fabric
  - history / diff
- right `US` rail
  - selection / node
  - projection / mirror

Each card can switch between local and remote modes and can be collapsed or expanded.

## 5. DOM Graph And JSON Canvas Projection

The graph helper layer is where runtime events become browser-facing projection objects.

It provides three important transforms:

- `datasetFromEvent()`:
  converts one event into DOM-safe `data-*` values
- `applyEventToGraph()`:
  applies one event to a browser node keyed by `path`
- `jsonCanvasDocumentFromEvents()`:
  projects recent event history into a JSON Canvas-shaped structure

Current status:

- the DOM `data-*` graph is implemented
- the JSON Canvas projection is implemented as a helper/view model
- full JSON Canvas execution semantics are still partial/conceptual

## 6. Shadow Scene Graph

The service worker acts as a local control-plane mirror.

It currently:

- caches the browser shell
- mirrors recent events into a local `Map`
- exposes `/shadow-scene-graph`
- mirrors parsed WordNet relation records into a keyed relation store
- exposes `/shadow-relations`

This is intentionally a local mirror and staging surface, not authority.

## 7. WebRTC And Signaling

The current WebRTC path is narrow and builder-oriented:

- peer presence is tracked via `/api/presence`
- signaling messages move through `/api/signals`
- data channels mirror stream events once a peer link exists

Current limitations:

- signaling is intentionally minimal
- no media tracks
- no mesh routing
- no durable session model

## 8. What This Architecture Proves

The current codebase proves that the repo can:

- reason over Braille input deterministically
- fan out normalized events into recovery files and browser streams
- render those events into explicit control-plane UI surfaces
- maintain a local service-worker mirror
- expose a JSON Canvas-shaped projection

It does not yet prove:

- full MQTT-first circulation
- true memcached binary-protocol packet handling
- A-Frame or 3D projection
- full interactive ownership of `FS`, `GS`, `US`, and `RS`

Those appear in the conceptual docs and spec, but only some parts are implemented today.
