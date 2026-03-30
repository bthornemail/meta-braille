# meta-braille

`meta-braille` is a deterministic signal interpreter with human-decodable projection layers.

The current public slice is organized like this:

```text
Braille        = canonical signal
transition     = atomic step
tap stream     = temporal reading model
hexagram       = compact decoded class
King Wen       = visible ordering of decoded layer
narrative      = observer interpretation
```

The browser demo renders that stack as:

```text
Braille stream
-> golden transcript
-> tap stream / hexagram / graph / narrative projections
```

## What Is In The Repo

- [docs/00-overview.md](docs/00-overview.md): builder-facing entry point
- [docs/10-runtime-and-web-architecture.md](docs/10-runtime-and-web-architecture.md): end-to-end runtime walkthrough
- [docs/30-proof-and-tests.md](docs/30-proof-and-tests.md): what is currently proven
- [docs/60-signal-first-braille-hexagram.md](docs/60-signal-first-braille-hexagram.md): signal-first upgrade
- [braille_relational_reasoner.awk](braille_relational_reasoner.awk): canonical stream reasoner
- [braille_fifo_backend.sh](braille_fifo_backend.sh): local FIFO backend entrypoint
- [braille_runtime.py](braille_runtime.py): stdlib HTTP runtime and recovery/signaling helper
- [web/index.html](web/index.html): browser demo surface

## Public Demo

The fastest way to see the project is:

```sh
./scripts/public_demo.sh
```

That command:

1. creates `./runtime`
2. seeds a deterministic sample Braille stream
3. starts the browser server on `http://127.0.0.1:8008`

Open the page and use:

- `Signal` mode for the canonical public demo
- `Tap Stream` for temporal pulse reading
- `King Wen` for reordered decoded hexagram view
- `Stream` for the broader event view
- `WordNet` for the observer layer

## Manual Quick Start

Run the full backend in one terminal:

```sh
./braille_fifo_backend.sh init
./braille_fifo_backend.sh run
```

Run the browser server in another:

```sh
./braille_fifo_backend.sh serve
```

Publish a short stream:

```sh
printf '⠁⠃⠇⠏\n' | ./braille_fifo_backend.sh publish
```

Then open:

```text
http://127.0.0.1:8008
```

## Replay Contract

The canonical observable surface is the golden transcript:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

Example:

```text
䷁ | ⠁ | 01/0101 | m/orbit/0/part/0/dialect/default/chain/0
```

If two implementations produce the same transcript for the same input, they are behaving as the same public protocol.

## Verify

Run:

```sh
node --test tests/test_graph.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

## Project Status

- `implemented`: canonical Braille stream, golden transcript, tap-stream projection, hexagram projection, browser signal view, narrative overlay, relation importers
- `partial`: MQTT hooks, memcached hooks, service-worker mirror, live WordNet observer mode, WebRTC peer path
- `conceptual only`: A-Frame renderer, memcached binary protocol law, richer distributed consensus semantics

## Publishing Notes

- Public release checklist: [docs/70-public-release.md](docs/70-public-release.md)
- License: [LICENSE](LICENSE)
- Contributing guide: [CONTRIBUTING.md](CONTRIBUTING.md)
