# Public Route Smoke Checklist

Status: pre-show release checklist for the current public-default surface set

## Purpose

This checklist is the final release gate for the public routes:

- `/`
- `/shadow`
- `/portal`
- `/world`
- `/artifact`
- `/docs/`

The goal is not to redesign the system. The goal is to confirm that the public
story, interaction path, and failure handling are good enough for live showing.

## Public Rule

Every public route must explain the same system:

```text
Braille -> Address -> Pascal lattice -> Projection -> Runtime overlays
```

If a route cannot make its place in that chain legible, it is not ready to be
public by default.

## Go / No-Go Table

| Route | Primary Role | Required Pass | Current Gate |
| --- | --- | --- | --- |
| `/` | entry and framing | desktop smoke | go after route-open sanity check |
| `/shadow` | dependency field | desktop smoke | go after interaction sanity check |
| `/portal` | runtime view | desktop smoke + copy choice | review seeded narrative before broad show |
| `/world` | composition surface | desktop smoke | go after interaction sanity check |
| `/artifact` | witness / scanner realization | desktop + mobile/device smoke | needs real device scan check |
| `/docs/` | doctrine | desktop smoke | go |

## Route Checks

### `/`

Pass if all are true:

- page title and headline read as public framing, not internal tooling
- links to `/shadow`, `/portal`, `/world`, `/artifact`, and `/docs/` are visible
- no dead links or accidental links into archive/dev-only areas
- grounding line is visible and readable
- no console-breaking errors on load

No-go if any are true:

- page reads like a shell or operator console instead of an entry point
- the top section does not answer what the system is and where to click

### `/shadow`

Pass if all are true:

- Pascal `STRUCTURE` mode is obvious on load
- `RUNTIME` / `WORMHOLE` behavior is discoverable without explanation
- node identity is visibly tied to canonical path/transcript, not layout
- export/import wording still says JSON Canvas is projection, not authority
- no console-breaking errors during node interaction, export, or artifact actions

No-go if any are true:

- the canvas reads as truth instead of projection
- runtime overlay obscures the dependency field

### `/portal`

Pass if all are true:

- Pascal dependency field is visible or clearly implied in the runtime view
- transcript/path fields remain visible somewhere persistent
- scene/runtime panes read as public explanation, not operator-only tools
- seeded narrative is either intentionally public or relabeled as sample content
- no console-breaking errors during mode changes

No-go if any are true:

- narrative copy conflicts with the rest of the public set
- the page feels like a private operator dashboard

### `/world`

Pass if all are true:

- world composition reads as general-purpose, not tied to one imported domain
- Pascal `Structure` / `Runtime` modes are obvious
- entity identity is clearly tied to path/address rather than position
- artifact controls are understandable to a first-time viewer
- no console-breaking errors during add/import/freeze/export flows

No-go if any are true:

- external input widgets imply source data is truth
- composition feels domain-specific instead of system-level

### `/artifact`

Pass if all are true:

- witness vs scanner realization is explained in one sentence
- transcript/proof strip is always visible
- SVG/PNG messaging is truthful about deterministic witness import/export
- missing `BarcodeDetector` is handled clearly and gracefully
- file-scan fallback works when camera path is unavailable
- at least one real device/browser scan succeeds against the standard Aztec path

No-go if any are true:

- witness/scanner read as different artifacts instead of realization positions
- scanner failure states are confusing or silent

### `/docs/`

Pass if all are true:

- handbook landing page opens cleanly
- `00`, `01`, `95`, `98`, `99`, `100`, and `103` are easy to reach
- wording is consistent on:
  - Symbolic Web
  - realization axis
  - witness / scanner
  - Pascal dependency field
- no doc implies layout or projection defines identity

No-go if any are true:

- core terms drift between docs
- the reading path is unclear for first-time viewers

## Device Matrix

Minimum smoke matrix:

- Desktop Chromium: `/`, `/shadow`, `/portal`, `/world`, `/artifact`, `/docs/`
- Desktop Firefox or Safari: `/`, `/shadow`, `/portal`, `/world`, `/docs/`
- Mobile Chromium or Safari:
  - `/artifact` camera path
  - `/artifact` file-scan fallback
  - `/world` route-open sanity
  - `/portal` route-open sanity

## Console / Error Gate

Every public route should be checked for:

- uncaught exceptions on load
- broken imports or missing assets
- route-specific interaction errors
- silent failure on export/import buttons

One non-blocking warning is acceptable during alpha if:

- it is understood
- it is visible
- it does not break the main story

An uncaught exception or dead primary action is a no-go.

## Release Outcome

### Go

Use when:

- the main route story is legible
- primary interactions work
- failure states are graceful
- no console-breaking errors appear

### Go With Note

Use when:

- route is good enough for live showing
- one known browser/device limitation remains
- limitation is disclosed and avoidable during demo

### No-Go

Use when:

- route misstates the doctrine
- primary action fails
- console errors break the interaction path
- missing capability has no fallback or explanation

## Recommended Order

1. `/artifact`
2. `/portal`
3. `/world`
4. `/shadow`
5. `/`
6. `/docs/`

This order prioritizes the route with the most device/browser sensitivity first,
then confirms the public narrative surfaces.

After this checklist is complete, record the real-device artifact acceptance in
[72-artifact-device-validation-record.md](./72-artifact-device-validation-record.md).
