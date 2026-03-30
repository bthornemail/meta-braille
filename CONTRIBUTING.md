# Contributing

## Principles

- Keep Braille canonical.
- Treat the transcript as the public replay contract.
- Add projection layers without moving authority out of the canonical stream.
- Keep observer layers read-only over the transcript.

## Before Opening A Change

Run:

```sh
node --test tests/test_graph.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

If you change runtime behavior, update the public docs in `docs/` and explain whether the change affects:

- canonical signal
- projection layer
- observer layer

## Style

- Prefer small, replay-safe changes.
- Keep the signal-first vocabulary used in the docs.
- Avoid introducing new “truth” surfaces when a projection will do.

## Public Demo

To check the public demo flow locally:

```sh
./scripts/public_demo.sh
```
