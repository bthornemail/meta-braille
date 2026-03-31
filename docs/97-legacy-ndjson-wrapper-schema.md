# Legacy NDJSON Wrapper Schema

This document defines how older NDJSON world-generation traces should be
carried into the current `meta-braille` system.

The goal is not to preserve older protocol meaning as authority. The goal is to
reuse older replayable programs under the current canonical language law.

## 0. Core Rule

Older NDJSON traces are not discarded, but they are no longer canonical on
their own.

They must be wrapped or normalized into the current event law:

```text
legacy NDJSON event
-> canonical Braille event
-> transcript
-> derived projection payload
```

This means:

- Braille remains canonical
- transcript remains the public proof surface
- legacy geometry, WordNet, matrix, angle, and world data remain as projection
  payload

## 1. Why A Wrapper Is Needed

Older traces often use fields such as:

- `event`
- `line`
- `points`
- `matrix`
- `angle`
- `seed`
- `hd_wallet_path`

Those traces already describe replayable world construction, but they do so in
an older geometry-first vocabulary.

The current project needs a stable public law that reads:

```text
Braille
-> runtime transition
-> transcript
-> interpretation
-> geometry/world projection
```

So the wrapper exists to keep the old replay programs useful while freezing the
new canonical order.

## 2. Wrapper Shape

The normalized wrapped event should have two layers:

1. canonical event fields
2. legacy projection payload

The canonical layer proves protocol equivalence.
The projection layer preserves older world-generation detail.

Recommended wrapped shape:

```json
{
  "seq": 144,
  "tick": 144,
  "braille": "⠁",
  "curr8": 1,
  "curr6": 1,
  "rel16": 3,
  "header8": "01",
  "pattern16": "0101",
  "path": "artifact://xX/p0/17/03af",
  "hexagram_index": 1,
  "hexagram": "䷁",
  "transcript": "䷁ | ⠁ | 01/0101 | artifact://xX/p0/17/03af",
  "legacy_projection": {
    "event": "seed_word",
    "word": "wisdom",
    "line": 3,
    "points": [1, 5, 6],
    "angle": 51.428571,
    "matrix": [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
    "seed": 9069010,
    "hd_wallet_path": "m/240'/2'/1'/5'"
  }
}
```

## 3. Required Canonical Fields

Every wrapped event should carry enough canonical information to join the
current runtime and browser law.

Minimum required canonical fields:

- `seq`
- `braille`
- `curr8`
- `curr6`
- `rel16`
- `path`
- `transcript`

Recommended canonical fields:

- `tick`
- `header8`
- `pattern16`
- `hexagram_index`
- `hexagram`
- selector or row fields
- canonical address tuple fields

The canonical layer is what current runtime surfaces must trust.

## 4. Legacy Projection Payload

Everything inherited from older traces should be placed in a dedicated
projection field, not mixed into the canonical contract.

Recommended field name:

```text
legacy_projection
```

This payload may contain:

- geometry-first event names
- Fano or line metadata
- matrix and angle payloads
- WordNet expansion details
- world-building graph fragments
- media, audio, or sensor projection hints
- historical seed or mnemonic fields

The payload is preserved for replay and interpretation, but it is no longer the
source of identity or equivalence.

## 5. Identity Rule

Legacy fields must not become canonical identity by themselves.

Not sufficient alone:

- `line`
- `points`
- `matrix`
- `angle`
- event name
- transcript position

Canonical identity must come from the normalized event layer:

- `path`
- canonical address tuple
- stable runtime key
- transcript reproducibility

## 6. Replay Rule

When replaying wrapped legacy traces, the system should behave like this:

```text
read wrapped event
-> trust canonical Braille fields
-> verify transcript shape
-> expose legacy projection payload to geometry/world/media surfaces
```

That keeps replay lawful and keeps older visual and world-generation work
available.

## 7. Converter Rule

An importer or converter for older NDJSON should follow this order:

```text
legacy event
-> derive or attach seq
-> derive or attach Braille state
-> derive transcript fields
-> preserve original fields under legacy_projection
```

The converter does not need to erase old semantics. It only needs to place them
below the canonical layer.

## 8. Old To New Mapping

The practical bridge can be read like this:

| Older field family | New role |
|---|---|
| `event` | projection/event label in `legacy_projection` |
| `matrix`, `angle` | projection payload |
| `line`, `points` | legacy coordinate adapter payload |
| `seed`, mnemonic, ratios | projection payload |
| HD-style path | candidate input to canonical `path` normalization |
| world graph and cloud nodes | projection/world payload |
| NDJSON line order | input for `seq` |

And the current canonical layer becomes:

| Current field | Role |
|---|---|
| `braille` | canonical emitted carrier |
| `curr8` | canonical byte state |
| `curr6` | canonical lower projection |
| `rel16` | compact relation witness |
| `path` | canonical materialization identity |
| `transcript` | proof surface |
| `hexagram` | derived interpretation |

## 9. World-Generation Interpretation

Older NDJSON traces can now be read correctly as:

```text
replayable world-generation programs
```

They are not reduced to “demo files.” They remain useful because they still
contain:

- input events
- expansion logic
- graph or cloud construction
- geometric projection
- address or seed material
- closure events

The wrapper schema lets those programs run under the newer canonical law.

## 10. One-Sentence Freeze

Legacy NDJSON traces remain reusable as replayable world-generation programs,
but they must be wrapped in a canonical Braille-and-transcript event layer so
that old projection meaning does not replace current protocol authority.
