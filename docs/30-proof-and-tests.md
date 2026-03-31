# Proof And Tests

This repo does not try to prove the whole conceptual system at once. The current tests are proof-of-concept witnesses for specific parts of the runtime and browser projection layers.

## Current Test Surface

There are four automated test areas:

- runtime reasoner tests
- browser graph/projection tests
- relation importer tests
- shared vocabulary tests

Together they prove that:

- the AWK reasoner emits the expected schema for known Braille input
- replay of the same input is stable
- the backend shell path can run and emit output into `rel.log`
- browser graph helpers preserve selector data and project JSON Canvas-like structures
- browser-side Prolog parsers can safely parse `s/6`, `g/2`, `hyp/2`, and `ant/4`
- browser-side relation stores can ingest canonical relation batches and retrieve selected relation state
- relation importers can turn WordNet and the article corpus into canonical `node` / `gloss` / `edge` / `frame` NDJSON
- the shared vocabulary projector can normalize WordNet, narrative, and hexagram proof slices into one canonical concept surface
- the signal-first event path can project stable hexagram fields, witness fields, and dump lines from the Braille stream
- the signal transcript is frozen as a golden replay witness shared across AWK, Python, and JS
- the artifact realization helpers preserve payload identity across witness and scanner realizations

## What The Runtime Tests Prove

### Schema witness

The runtime tests feed Braille input into the reasoner and check the resulting event objects.

It verifies:

- canonical `curr8`
- projected `curr6`
- row-pair selectors
- `rows_hex`
- normalized control-plane fields like `fs`, `gs`, `us`, `rs`
- path and routing coordinates

This is the strongest current proof that the runtime event contract is stable for known input.

### Replay stability

The runtime tests run the same input twice and assert identical output.

This proves a narrow but important property:

```text
same input stream -> same event stream
```

### Backend smoke path

The runtime tests also launch the shell backend, publish Braille input, and check that `rel.log` is populated.

This proves that the local FIFO/backend path is wired end-to-end at a smoke-test level.

## What The Browser Projection Tests Prove

### DOM dataset projection

The browser projection tests check that event-to-dataset conversion produces the expected DOM-safe fields.

It verifies:

- Braille values
- hexagram and header values
- row hex string
- selector values
- path/orbit-style metadata

This is the proof surface for the browser `data-*` graph contract.

### JSON Canvas projection helper

They also check that the helper can turn recent events into a JSON Canvas-shaped node and edge object.

This proves:

- node projection exists
- edge projection exists
- selector-bearing events survive projection

It does not prove that the browser is executing a complete JSON Canvas engine.

### Service-worker selector mirror compatibility

They check that selector fields survive in a shape suitable for service-worker mirroring.

This is a proof of compatibility, not a full browser integration test.

### Live WordNet parser and relation projection helpers

They check the browser-side parser contract for:

- `s/6`
- `g/2`
- `hyp/2`
- `ant/4`
- malformed lines that must be ignored

They also check that parsed relation batches can be ingested into a local relation store, selected by ID, and projected into JSON Canvas-shaped browser objects.

This proves the live browser relation layer at the helper and store level. It does not yet prove a full browser fetch-plus-service-worker end-to-end flow under a real browser automation harness.

### Signal-first projection helpers

The same file now also checks the signal-first projection helpers:

- King Wen visible-order hexagram mapping
- event-to-header projection
- rolling dump-line rendering from the event stream
- golden transcript equality against a fixed fixture

### Artifact realization invariant

The current proof surface also includes an artifact realization check.

It verifies the same canonical payload can survive:

```text
payload
-> witness realization
-> canonical payload

payload
-> scanner realization
-> canonical payload
```

and therefore proves the narrow but critical invariant:

```text
decode(witness realization) == decode(scanner realization)
```

This is the current executable proof that witness and scanner are coordinate
positions on the same realization axis rather than separate artifact systems.

## What The Relation Importer Tests Prove

### WordNet import

The relation importer tests run the WordNet importer against the bundled Prolog files and check that the emitted NDJSON includes:

- `node`
- `gloss`
- `edge`
- at least one `hyp` edge
- a known label such as `person`

This proves the repo can already lift part of WordNet into the shared canonical relation substrate.

### Narrative import

They also run the article importer against the bundled article set and check for:

- story or actor nodes
- gloss records from quoted passages
- edges such as `speaks`
- spectacle-oriented `frame` records

This proves the repo can already lift the narrative corpus into the same relation substrate used for lexical imports.

## What The Shared Vocabulary Tests Prove

### Cross-domain convergence

The shared vocabulary tests run the projector across all three proof domains:

- WordNet
- narrative
- hexagram

It checks that all three domains emit records with the same canonical `canon.concepts` surface.

This is the current proof that the repo can compare lexical, narrative, and ordered-transformation sources without requiring a one-off tag for every symbol.

### Public proof slice generation

They also verify that the projector can write browser-inspectable proof slices and that each emitted record carries canonical vocabulary metadata.

## How To Run

Run the Python test suite.

Run the Node test suite as well.

These two suites are the practical verification surface for the current repo and should remain synchronized with the implemented test surface.

## What These Tests Do Not Prove Yet

The current proof surface is intentionally limited. Important gaps remain:

- No automated MQTT daemon integration test
- No automated memcached daemon integration test
- No true memcached binary-protocol test
- No full browser DOM integration or rendering test
- No service-worker-controlled browser e2e test
- No browser automation test that fetches the real public WordNet files and drives the live relation mode
- No automated WebRTC peer-to-peer browser test
- No A-Frame projection test
- No proof that `FS`, `GS`, `US`, and `RS` are full interactive state owners yet
- No browser automation proof that a camera-scanned commodity Aztec symbol round-trips on every target browser/device yet

These are not failures; they are simply outside the current proof-of-concept boundary.

## How To Read Claims Safely

Use this rule when reading the repo:

- if it is covered by code and tests, treat it as implemented proof-of-concept behavior
- if it is covered by code only, treat it as implemented but lightly proven behavior
- if it appears only as a future or conceptual idea in the handbook, treat it as planned unless stated otherwise

That rule helps prevent over-reading the current state of the project.
