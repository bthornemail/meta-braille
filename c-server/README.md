# Native Runtime

This directory contains the native server/runtime lane for the current project.

It should no longer be read as a Fano-first or canon-first server. The correct
current interpretation is:

```text
clock
-> Braille stream
-> first-order logical state
-> canonical transcript
-> second-order hexagram interpretation
-> production / consumption surfaces
-> transport and UI projections
```

## What Survives From The Legacy Server

The legacy implementation still provides a useful substrate:

- native event loop
- socket handling
- timed playback
- static file serving
- WebSocket fanout
- SSE fanout
- threading and concurrency primitives

Those parts are worth keeping.

## What Does Not Survive As Meaning

The older meaning model should not be treated as authoritative anymore:

- Fano point naming
- canon chunk semantics
- matrix/angle/seed as the primary public protocol
- Fano-first browser vocabulary

Those belong to an earlier runtime lane and should be treated as legacy compatibility surfaces only.

## Current Naming Law

The current project vocabulary is:

```text
Braille        = canonical carrier / basis language
hexagram       = derived sequencing / dialectic projection
transcript     = canonical observable protocol surface
King Wen       = ordering of projection, not identity
shadow canvas  = projection surface
DOM data-*     = canonical browser substrate
```

For the native runtime this means:

```text
first order  = Braille streaming over clocking
second order = hexagram interpretation over higher-order production / consumption
```

## Runtime Boundary

The native server should eventually expose:

- clock / tick progression
- first-order Braille event state
- transcript emission
- second-order hexagram interpretation
- production / consumption interfaces

and should not let second-order interpretation rewrite first-order truth.

## Compatibility Rule

This directory may still expose legacy endpoints and binary names while it is being rewritten, but they should be treated as compatibility aliases only.

The intended long-term shape is:

```text
native runtime
-> stable first-order event
-> transcript
-> derived interpretation
-> HTTP / WS / SSE fanout
```

## Front-End Fit

The HTML tools in `www/templates` can be used as front ends for this runtime,
but only as projection or authoring layers.

The best current mapping is:

- `mesh-builder.html` -> shadow-canvas / node-edge projection surface
- `metacodex.html` -> schema and authoring surface
- `metaverse-dashboard.html` -> replay dashboard / proof viewer

They should consume normalized runtime events rather than define protocol truth themselves.
