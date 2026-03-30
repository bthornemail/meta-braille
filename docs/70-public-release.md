# Public Release

This document is the release checklist for publishing `meta-braille` as a public demo.

## Public Story

Freeze this language:

```text
Braille        = canonical signal
transition     = atomic step
tap stream     = temporal reading model
hexagram       = compact decoded class
King Wen       = visible ordering of decoded layer
narrative      = observer interpretation
```

The browser should present:

```text
transcript = law
projections = structure
observers = meaning
```

## Repo Surface

Before publishing, confirm:

- [README.md](../README.md) describes the public story clearly
- [LICENSE](../LICENSE) exists
- [CONTRIBUTING.md](../CONTRIBUTING.md) exists
- [docs/00-overview.md](./00-overview.md) links the handbook in reading order
- implementation maturity is clearly marked as implemented, partial, or conceptual only

## Demo Surface

The public demo should show:

- `Signal` mode as the default public view
- `Tap Stream` as the primary temporal reading surface
- `King Wen` as the reordered visible hexagram view
- transcript lines in the scene panel
- narrative overlay as a read-only observer

## Verification

Before tagging a public release, run:

```sh
node --test tests/test_graph.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

## Local Demo Commands

One-command public demo:

```sh
./scripts/public_demo.sh
```

Manual backend flow:

```sh
./braille_fifo_backend.sh init
./braille_fifo_backend.sh run
./braille_fifo_backend.sh serve
printf '⠁⠃⠇⠏\n' | ./braille_fifo_backend.sh publish
```

## Deployment

The repo now includes a small container path:

- [Dockerfile](../Dockerfile)

That container:

- installs `gawk`
- seeds the deterministic public demo stream
- starts the Python runtime server

For a public first release, a static screenshot/GIF plus the seeded runtime demo is enough. Live MQTT or memcached integration is not required for `v0.1.0`.

## Release Shape

Recommended first public tag:

```text
v0.1.0
```

Release notes should emphasize:

- canonical Braille stream
- golden transcript
- tap-stream browser mode
- hexagram projection
- narrative overlays as observers

## Push Checklist

- [ ] tests pass
- [ ] README is current
- [ ] docs reflect current vocabulary
- [ ] demo script works from a clean checkout
- [ ] deployment path starts successfully
- [ ] release notes drafted
