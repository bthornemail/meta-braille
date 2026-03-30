# Signal-First Braille + Hexagram

This document defines the new parallel upgrade path for the repo.

The core shift is simple:

```text
bit law -> Braille projection -> hexagram header projection -> dump / scene / clock rendering
```

In runtime terms, this is best understood as a bit-linked stream, or canonical transition chain. The machine is the ordered chain of emitted state transitions. Braille and hexagrams are projections of that chain, not competing foundations.

## Core Split

- Braille = canonical machine-facing carrier
- hexagram = compact projection class over the same state
- King Wen = visible ordering for the hexagram projection layer
- dump/scene/clock = visible projections
- WordNet/Prolog/narrative = observer layers

This does not delete the relation work. It changes the organizing center.

## Projection Rule

The current implementation uses one deterministic projection rule:

- canonical projection window = `curr6`
- `hexagram_index` = `curr6` interpreted as a 6-bit integer
- `hexagram_order` = `hexagram_index + 1`
- visible symbol = Unicode Yijing hexagram at `U+4DC0 + hexagram_index`

The projection token is explicit in the event envelope:

- `header8` = projection token, not a canonical slice
- `projection_window` = `curr6`
- `projection_bits` = `6`

The visible hexagram layer is presented in King Wen visible order. That order belongs to the display projection, not to canonical storage.

## Event Fields

The signal-first runtime adds:

- `hexagram`
- `hexagram_codepoint`
- `hexagram_index`
- `hexagram_order`
- `header8`
- `pattern16`

Current semantics:

- `header8` = two-digit compact projection token derived from the 6-bit hexagram index
- `pattern16` = `header8` paired with the current `d2_6` witness
- `path` and orbit fields continue to carry addressed body/context

Taken together, the runtime event reads as:

- canonical carrier = Braille event state
- compact projection class = hexagram layer
- witness = `pattern16`
- addressed body/context = `path`, orbit, part, dialect, chain

## Canonical Transcript

The visible proof surface is a strict replay transcript:

```text
<hexagram> | <braille> | <header8>/<pattern16> | <path>
```

Example:

```text
䷁ | ⠁ | 01/0101 | m/orbit/0/part/0/dialect/default/chain/0
```

This transcript is:

- deterministic
- byte-for-byte comparable
- derived only from canonical event fields
- shared across AWK, Python, and JS helpers

The transcript is the canonical observable surface of the transition chain. UI, graph, narrative, and semantic overlays observe this surface rather than redefining it.

## UI Modes

The browser now has three parallel modes:

- `Signal`
- `Stream`
- `WordNet`

`Signal` is the new primary visible proof surface for this upgrade.

It emphasizes:

- top-left 240-step orbit clock
- top-right 2D/3D minimap
- center stage with Braille + hexagram framing
- rolling dump lines in the form:

```text
hexagram | braille | header8/pattern16 | path
```

`Stream` remains the broader legacy event view.

`WordNet` remains an observer/interpretation mode.

## Why This Is Parallel, Not Destructive

The old relation-first work is still useful:

- as proof data
- as observer overlays
- as semantic interpretation

But the primary architectural story is now:

```text
signal first
relations second
```

More explicitly:

```text
bit-linked stream first
projection layers second
observer layers third
```
