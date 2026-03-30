# meta-braille

This repo now contains a first runnable vertical slice for the Braille stream architecture described in the docs:

`FIFO ingress -> gawk relational reasoner -> MQTT/Memcached hooks -> browser data-* graph -> WebRTC peer channel`

The browser projection now treats Braille row pairs as selector channels:
- `FS` = file-system style / top selector
- `GS` = group style / right selector
- `US` = node/unit style / bottom selector
- `RS` = edge/relation style / left selector

DOM nodes carry the Braille graph state like:

```html
<div
  data-braille="⠓"
  data-braille8="13"
  data-braille6="13"
  data-rel16="A"
  data-rows="0x1,0x3,0x0,0x0"
  data-fs="1"
  data-gs="3"
  data-us="0"
  data-rs="0"
></div>
```

The browser also projects recent events into a JSON Canvas-shaped document where:
- FS/GS/US/RS behave as selector channels
- nodes are Braille-addressed DOM/Canvas units
- edges are derived from selector flow between consecutive events

## Files
- `braille_relational_reasoner.awk`: canonical 8-dot / projected 6-dot stream reasoner that emits NDJSON.
- `braille_fifo_backend.sh`: busybox-style shell entrypoint for `init`, `run`, `publish`, `inspect`, and `serve`.
- `braille_runtime.py`: stdlib-only HTTP server plus recovery/signaling helpers and MQTT/memcached adapters.
- `web/`: browser surface with a worker-backed `data-*` graph, service-worker shadow scene graph, and narrow WebRTC signaling flow.
- `dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md`: stack spec for Braille, MQTT, memcached, Service Worker, and renderer roles.

## Quick Start
Run the backend in one terminal:

```sh
./braille_fifo_backend.sh init
./braille_fifo_backend.sh run
```

Run the browser proxy/server in another:

```sh
./braille_fifo_backend.sh serve
```

Publish a stream:

```sh
printf '⠁⠃⠇⠏\n' | ./braille_fifo_backend.sh publish
```

Then open `http://127.0.0.1:8008`.

## Environment
Common knobs:

```sh
STATE_DIR=./runtime
CHANNEL=default
DIALECT=default
PART=0
CHAIN=0
WINDOW_SIZE=64
ORBIT_MOD=5040
MQTT_ENABLE=0
MEMCACHED_ENABLE=0
HTTP_HOST=127.0.0.1
HTTP_PORT=8008
```

Optional integrations:
- If `mosquitto_pub` is installed and `MQTT_ENABLE=1`, the runtime publishes stream/proof/tip topics.
- If a memcached daemon is available and `MEMCACHED_ENABLE=1`, the runtime writes bounded recovery snapshots via the text protocol.

## Shadow Scene Graph
The browser registers `web/service-worker.js`, which keeps a local shadow scene graph mirror of recent events and exposes it at:

```text
/shadow-scene-graph
```

That mirror is a control-plane staging area for DOM/SVG/A-Frame projections. It is local state, not canonical truth.

## Tests
Run:

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/test_graph.mjs
```
