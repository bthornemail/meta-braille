# Run It Yourself

This is the shortest practical path for reproducing the current project locally.

## 1. Start from the repo root

```sh
cd /root/meta-braille
```

## 2. Run the tests first

This gives you a quick sanity check before opening the UI.

```sh
python3 -m unittest tests.test_aztec_realization_axis tests.test_legacy_wrapper tests.test_reasoner
```

## 3. Start the runtime server

The project uses `braille_runtime.py` to serve the public web UI and the small
runtime endpoints.

```sh
python3 braille_runtime.py serve
```

By default this serves from `./www` and uses `./runtime` for state.

## 4. Open the main public routes

These are the primary routes to understand:

- `/`
- `/shadow`
- `/portal`
- `/world`
- `/artifact`
- `/docs/`

If you are running locally through the Python server, the base URL is usually:

```text
http://127.0.0.1:8008
```

## 5. What to look at first

Start in this order:

1. `/`
2. `/artifact`
3. `/shadow`
4. `/portal`
5. `/world`

That gives you:

- the public framing
- the portable artifact layer
- the dependency field
- the runtime view
- the composition view

## 6. Where the important files are

- public landing page: [`www/index.html`](../www/index.html)
- artifact demo: [`www/templates/artifact-demo.html`](../www/templates/artifact-demo.html)
- shadow/dependency surface: [`www/templates/mesh-builder.html`](../www/templates/mesh-builder.html)
- runtime dashboard: [`www/templates/metaverse-dashboard.html`](../www/templates/metaverse-dashboard.html)
- world composition: [`www/templates/worldbuilder.html`](../www/templates/worldbuilder.html)
- artifact codec: [`www/src/aztec-artifact.js`](../www/src/aztec-artifact.js)
- runtime server: [`braille_runtime.py`](../braille_runtime.py)

## 7. Good first proof checks

To prove the system is behaving as intended, verify:

- the landing page shows the public icon artifact
- `/artifact` can export SVG and PNG
- `/artifact` can decode transport text back into the same payload
- `/shadow-scene-graph` returns JSON
- the tests still pass
