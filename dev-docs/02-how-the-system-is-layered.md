# How The System Is Layered

Here is the project stack in plain language.

## Layer 1: Canonical Event

This is the smallest stable thing in the system.

It carries fields like:

- Braille symbol
- path
- transcript
- derived header/pattern data

This is the layer the rest of the system must agree with.

## Layer 2: Address And Dependency

Once an event exists, it gets:

- a canonical address or path
- a place in the dependency field

The dependency field is shown using the Pascal lattice.

This is important because it makes “what depends on what” visible.

## Layer 3: Runtime Projection

The project has several public surfaces:

- `/`
- `/shadow`
- `/portal`
- `/world`
- `/artifact`

These are not separate systems. They are different explanation or interaction
surfaces over the same underlying event law.

## Layer 4: Artifact Surface

The artifact layer turns the same payload into portable surfaces.

That includes:

- witness SVG
- witness PNG
- scanner-oriented Aztec barcode forms

The important rule is that they must still decode to the same payload.

## Layer 5: PWA Transport

The browser-level features sit under the artifact law.

That includes:

- manifest
- service worker
- file handling
- web share
- background sync

These help artifacts move between people and devices, but they are not the
truth layer themselves.

## One Diagram To Keep In Mind

```text
canonical payload
-> Braille event
-> address/path
-> Pascal dependency lattice
-> runtime views
-> artifact surfaces
-> share / file / scan
-> exact decode
```

If you can hold that chain, you can usually place any file in the repo.
