# Artifacts, Scanning, And Sharing

This is the easiest place to get confused, so here is the plain version.

## What an artifact is

An artifact is the portable form of a canonical payload.

It is designed so that you can:

- save it
- send it
- render it
- scan it
- decode it

without changing what it fundamentally is.

## Why artifacts matter

If people only share app state, the result is fragile.

App state depends on:

- the browser
- the current page
- current layout
- temporary UI choices

Artifacts are better because they can be treated as stable transport objects.

## Two realizations, one artifact

The project uses this distinction:

- `witness realization` = readable, stable artifact surface
- `scanner realization` = scanner-oriented transport surface

These are not supposed to be two different artifacts.

They are supposed to be:

```text
same artifact
two realizations
same decode
```

## The important transport rule

The public sharing law is:

> people share artifacts, not mutable UI state

In practical terms that means the preferred transport objects are:

- artifact payloads
- artifact files
- witness SVG/PNG
- scanner transport embodiments
- transcript/path/hash metadata

## What the PWA is doing

The manifest and service worker are there to make artifact handling feel like an
app.

That includes:

- opening artifact files
- sharing artifact files
- receiving shared artifacts
- keeping local participation smooth even when connectivity is imperfect

But the service worker is not the truth layer.

The artifact codec is still the truth layer.

## The public icon

The app icon is now treated as part of the artifact story too.

The public icon artifact suite lives here:

- [`/artifacts/public-icon/`](../www/artifacts/public-icon/index.html)

That suite includes:

- PNG
- SVG
- metadata

So the icon is not just decoration. It is part of the artifact transport story.
