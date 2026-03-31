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

## Handbook Surface

Before publishing, confirm:

- [docs/00-overview.md](./00-overview.md) links the handbook in reading order
- [docs/10-runtime-and-web-architecture.md](./10-runtime-and-web-architecture.md) explains the flow clearly
- [docs/30-proof-and-tests.md](./30-proof-and-tests.md) states the current proof boundary clearly
- [docs/60-signal-first-braille-hexagram.md](./60-signal-first-braille-hexagram.md) matches the public vocabulary
- [docs/90-canonical-projection-and-resolution.md](./90-canonical-projection-and-resolution.md) matches the current protocol law
- implementation maturity is clearly marked as implemented, partial, or conceptual only

## Demo Surface

The public demo should show:

- `Signal` mode as the default public view
- `Tap Stream` as the primary temporal reading surface
- `King Wen` as the reordered visible hexagram view
- transcript lines in the scene panel
- narrative overlay as a read-only observer

## Verification

Before tagging a public release, run the Python and Node test suites and confirm they both pass.

## Local Demo Commands

The public demo should remain reproducible from both a one-command flow and a manual backend flow.

## Deployment

The repo now includes a small container path.

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
- [ ] handbook language is current
- [ ] docs reflect current vocabulary
- [ ] demo script works from a clean checkout
- [ ] deployment path starts successfully
- [ ] release notes drafted
