# Templates

This directory contains standalone HTML front-end surfaces that can be reused
as projection and authoring tools for the current project.

They should be understood with the current naming law:

- Braille = canonical basis language
- hexagram = derived projection class
- transcript = canonical observable surface
- shadow canvas = visual arrangement surface
- narrative = observer overlay

These files are not protocol authority. They are browser-side tools that can
consume or emit stream-shaped records.

## Public Showing Split

For a public showing, it helps to separate these surfaces into three groups:

- public surfaces: stable pages that explain or demonstrate the current system
- demo surfaces: showcase pages that are intentionally more exploratory
- internal surfaces: utility or setup pages that should not be treated as the
  main product

## Public Surfaces

- `../index.html`
  Main Symbolic Web runtime shell.
- `mesh-builder.html`
  Shadow-canvas builder for node and edge projection.
- `worldbuilder.html`
  Higher-level entity and relation editor with artifact mode.
- `artifact-demo.html`
  Artifact realization showcase for witness and scanner surfaces.

## Demo Surfaces

- `../demos/index.html`
  Curated gallery of demo views over the current runtime.
- `metacodex.html`
  Schema and authoring surface for stream-shaped records and templates.
- `metaverse-dashboard.html`
  Replay dashboard / portal shell for transcript, narrative, and scene views.
- `avatar-builder.html`
  Specialized SVG and NDJSON composition tool.

## Internal / Operator Surfaces

- `bip39_entry.html`
  Universe gate and setup utility.
- `light_garden.html`
  Historical projection/operator surface retained for continuity.

## Usage Rule

Keep the boundary clear:

- canonical state comes from the browser DOM `data-*` substrate or normalized
  runtime events
- transcript remains the public proof surface
- template output is a projection or authoring artifact

No template here should redefine identity or replace canonical runtime state.

## Suggested Routes

If these are exposed on a public site, the clearest route names are:

- `/`
- `/shadow`
- `/world`
- `/artifact`
- `/demos/`

## Base Convention

If a dashboard needs to load records from a configurable base, keep the base
value explicit in the query string:

- `/?base=/streams/<stream-name>/`
