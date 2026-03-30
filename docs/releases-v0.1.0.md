# v0.1.0

## Summary

The first public release of `meta-braille` publishes the signal-first runtime slice.

This release centers the project around:

```text
Braille        = canonical signal
transition     = atomic step
tap stream     = temporal reading model
hexagram       = compact decoded class
King Wen       = visible ordering of decoded layer
narrative      = observer interpretation
```

## Included

- canonical Braille stream reasoner
- golden transcript as replay proof surface
- tap-stream browser mode
- hexagram projection layer
- King Wen visible-order toggle
- narrative overlays as read-only observers
- relation importers and WordNet observer mode
- seeded public demo scripts
- container path for serving the public demo

## Verification

This release was verified with:

```sh
./scripts/seed_demo_stream.sh
node --test tests/test_graph.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

## Notes

- Braille remains canonical.
- Hexagrams remain projections, not storage truth.
- WordNet and narrative layers remain observers over the transcript.
- MQTT, memcached, and WebRTC remain partial integrations in this release.
