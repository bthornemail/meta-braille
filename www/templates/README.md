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

## Current Mapping

- `mesh-builder.html`
  Shadow-canvas builder for node and edge projection.
- `metacodex.html`
  Schema and authoring surface for stream-shaped records and templates.
- `metaverse-dashboard.html`
  Replay dashboard / portal shell for transcript, narrative, and scene views.
- `worldbuilder.html`
  Higher-level entity and relation editor.
- `avatar-builder.html`
  Specialized SVG and NDJSON composition tool.

## Usage Rule

Keep the boundary clear:

- canonical state comes from the browser DOM `data-*` substrate or normalized
  runtime events
- transcript remains the public proof surface
- template output is a projection or authoring artifact

No template here should redefine identity or replace canonical runtime state.

## Suggested Routes

If these are exposed on a public site, the clearest route names are:

- `/signal`
- `/shadow`
- `/schema`
- `/world`
- `/avatar`

## Base Convention

If a dashboard needs to load records from a configurable base, keep the base
value explicit in the query string:

- `/?base=/streams/<stream-name>/`
