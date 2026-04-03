# Core Ideas

This project can sound abstract if you hear all the terms at once. So here are
the core ideas in the simplest possible form.

## 1. One thing, many views

The project keeps one central rule:

> the thing itself should stay stable even if we look at it in different ways

A single event can appear as:

- a Braille symbol
- a transcript line
- a node in a dependency graph
- a JSON Canvas projection
- an artifact image
- a scannable Aztec barcode

Those are not supposed to be different truths. They are supposed to be
different views of the same thing.

## 2. Identity must not come from layout

If a node moves on the screen, it should still be the same node.

So identity comes from a path or address, not from x/y coordinates.

That is why the project insists on:

```text
path/address = identity
layout = projection
```

## 3. The project is signal-first

Many systems start with meaning or UI. This one starts with signal.

That means:

- first define the canonical event
- then give it an address
- then show how it depends on other events
- then project it into visible surfaces

In project language:

```text
Braille -> Address -> Pascal lattice -> Projection -> Runtime overlays
```

## 4. Dependency should be visible

The project uses a Pascal-style lattice to make dependency easy to see.

That means each visible node can be understood as depending on earlier nodes.
This makes the system easier to explain and also easier to animate.

So:

- `Pascal lattice` = static dependency structure
- `wormhole mode` = dynamic movement over that structure

## 5. People should share artifacts, not loose app state

This is one of the most important ideas in the repo.

Instead of sharing:

- canvas position
- tab state
- unsaved UI edits

the system tries to share:

- encoded artifact payloads
- SVG/PNG artifact surfaces
- scanner-friendly transport forms

That keeps sharing deterministic and reproducible.

## 6. Readable and scannable should still decode to the same payload

This project does not want one image for people and a different image for
machines.

It wants:

```text
same payload
-> readable witness
-> scannable realization
-> exact decode
```

That is why the artifact lane matters so much.
