# Read Me First

This is the plain-language path through the project.

The main handbook in [`docs/`](../docs/) is the formal version. It is the
canonical doctrine. This `dev-docs` track is the friendly version: it explains
the same system in simpler terms and in a more human order.

## What This Project Is

At the highest level, this project is trying to do one thing well:

```text
take a small symbolic event
keep it stable
show it in many forms
and prove that those forms still mean the same thing
```

That is why the project keeps returning to the same pattern:

```text
event
-> address
-> dependency structure
-> visible projection
-> transport artifact
-> exact decode
```

## The Shortest Honest Summary

This system treats small symbolic events as the real truth of the system.

Everything else is derived from that:

- the UI
- the runtime views
- the world views
- the artifact images
- the scannable barcode form

So the browser is not the source of truth.
The canvas is not the source of truth.
The layout is not the source of truth.

The source of truth is the canonical symbolic payload and the transcript that
proves it.

## What You Should Understand By The End

If you follow this `dev-docs` path, you should be able to explain:

- what the Symbolic Web means here
- why Braille is used as the canonical carrier
- what the Pascal lattice is doing
- what wormhole propagation means in this system
- why artifacts are shared instead of raw UI state
- why readable SVG/PNG and scannable Aztec are two realizations of one artifact
- how to run the public surfaces locally
- how to reproduce the public showing

## Reading Advice

Do not try to hold every term at once.

Start with these plain reductions:

- `Braille` = the canonical symbolic carrier
- `path/address` = identity
- `Pascal lattice` = visible dependency field
- `wormhole mode` = movement over that field
- `artifact` = portable encoded object
- `scanner/witness` = two views of the same artifact

Once those feel natural, the rest of the repo starts to make sense much more
quickly.
