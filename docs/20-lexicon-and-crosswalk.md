# Lexicon And Crosswalk

This document is the reference bridge between the conceptual `dev-docs/` material and the implementation in the runtime, web, and test layers.

## Lexicon

### Braille cell

A single Braille symbol treated as a structured byte and decoded into 8-dot and 6-dot views.

Implementation:
- [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L30)

### 8-dot canonical state

The full Braille byte used as the canonical or blackboard-style state surface.

Implementation:
- [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L30)

### 6-dot projection

The lower-six-bit projection used as a reduced or propagation-oriented state view.

Implementation:
- [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L90)

### `FS`, `GS`, `US`, `RS`

Selector roles derived from Braille row pairs:

- `FS` = frame / scope selector
- `GS` = group / state-fabric selector
- `US` = unit / selection selector
- `RS` = reduction / relation selector

Implementation:
- [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L56)
- [web/graph.js](/root/meta-braille/web/graph.js#L1)

### `rel16`

The compact four-bit relation classifier produced from second-order reasoning over the 6-dot and 8-dot views.

Implementation:
- [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L39)

### JSON Canvas projection

A helper projection of current event history into a JSON Canvas-shaped node and edge structure.

Implementation:
- [web/graph.js](/root/meta-braille/web/graph.js#L92)

### shadow scene graph

A local service-worker mirror of recent event state used as a control-plane staging surface.

Implementation:
- [web/service-worker.js](/root/meta-braille/web/service-worker.js#L1)

### FIFO ingress

The named-pipe entrypoint that accepts stream input before it is forwarded into the AWK reasoner.

Implementation:
- [braille_fifo_backend.sh](/root/meta-braille/braille_fifo_backend.sh#L16)

### recovery window

A bounded hot-state and replay slice maintained in runtime cache files and optional memcached keys.

Implementation:
- [braille_runtime.py](/root/meta-braille/braille_runtime.py#L172)
- [braille_runtime.py](/root/meta-braille/braille_runtime.py#L286)

### service-worker control plane

The browser-local orchestrator that mirrors recent events and exposes them through a worker-owned endpoint.

Implementation:
- [web/app.js](/root/meta-braille/web/app.js#L386)
- [web/service-worker.js](/root/meta-braille/web/service-worker.js#L1)

### memcached state fabric

An architectural role where memcached provides ephemeral shared state snapshots and hot-state lookup, not persistence or authority.

Current status:
- partially implemented through text-protocol hooks in the Python runtime
- binary protocol remains conceptual/spec-backed only

Implementation:
- [braille_runtime.py](/root/meta-braille/braille_runtime.py#L196)

### MQTT discovery/diff layer

An architectural role where MQTT carries discovery, presence, and event diff metadata.

Current status:
- runtime publish hooks exist
- full browser-side subscription and richer circulation semantics remain partial

Implementation:
- [braille_runtime.py](/root/meta-braille/braille_runtime.py#L223)
- [braille_runtime.py](/root/meta-braille/braille_runtime.py#L419)

### canonical relation substrate

The normalized `node` / `gloss` / `edge` / `frame` NDJSON shape that can be imported from lexical or narrative sources before being projected into Braille or browser views.

Implementation:
- [docs/40-canonical-relation-schema.md](/root/meta-braille/docs/40-canonical-relation-schema.md)
- [scripts/wordnet_to_relations.py](/root/meta-braille/scripts/wordnet_to_relations.py)
- [scripts/narrative_to_relations.py](/root/meta-braille/scripts/narrative_to_relations.py)

### shared relation vocabulary

The small anchor concept set used to compare WordNet, narrative, and hexagram records without manually tagging every symbol one by one.

Implementation:
- [docs/50-shared-vocabulary.md](/root/meta-braille/docs/50-shared-vocabulary.md)
- [scripts/shared_relation_vocabulary.py](/root/meta-braille/scripts/shared_relation_vocabulary.py)

### live browser WordNet relation parsing

The browser-side path that fetches public WordNet Prolog files, parses `s/6`, `g/2`, `hyp/2`, and `ant/4`, stores the resulting canonical records in the service-worker mirror, and projects them into the existing control-plane and JSON Canvas helper surfaces.

Implementation:
- [web/prolog-relations.js](/root/meta-braille/web/prolog-relations.js)
- [web/relation-worker.js](/root/meta-braille/web/relation-worker.js)
- [web/relation-store.js](/root/meta-braille/web/relation-store.js)
- [web/service-worker.js](/root/meta-braille/web/service-worker.js)
- [web/app.js](/root/meta-braille/web/app.js)

## Trace Table

| Concept | Source dev-doc(s) | Runtime/Web implementation | Proof/Test coverage | Notes / current status |
| --- | --- | --- | --- | --- |
| Braille as structured byte | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md) | [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L30) | [test_reasoner.py](/root/meta-braille/tests/test_reasoner.py#L16) | Implemented |
| 8-dot canonical and 6-dot projection split | [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md), [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md) | [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L30), [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L90) | [test_reasoner.py](/root/meta-braille/tests/test_reasoner.py#L16) | Implemented |
| `rel16` relation law | [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md) | [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L39) | [test_reasoner.py](/root/meta-braille/tests/test_reasoner.py#L53) | Implemented, replay-stable |
| `FS` / `GS` / `US` / `RS` selector roles | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md), [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md) | [braille_relational_reasoner.awk](/root/meta-braille/braille_relational_reasoner.awk#L56), [web/graph.js](/root/meta-braille/web/graph.js#L1), [web/index.html](/root/meta-braille/web/index.html#L177) | [test_reasoner.py](/root/meta-braille/tests/test_reasoner.py#L16), [test_graph.mjs](/root/meta-braille/tests/test_graph.mjs#L5) | Implemented as selectors and UI surfaces |
| FIFO ingress and local modularity | [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md) | [braille_fifo_backend.sh](/root/meta-braille/braille_fifo_backend.sh#L16) | [test_reasoner.py](/root/meta-braille/tests/test_reasoner.py#L59) | Implemented |
| Recovery window / bounded hot state | [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md), [memcached_protocol.md](/root/meta-braille/dev-docs/memcached_protocol.md) | [braille_runtime.py](/root/meta-braille/braille_runtime.py#L180), [braille_runtime.py](/root/meta-braille/braille_runtime.py#L286) | [test_reasoner.py](/root/meta-braille/tests/test_reasoner.py#L59) | Implemented locally; memcached is optional |
| MQTT as signaling/awareness layer | [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md), [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md) | [braille_runtime.py](/root/meta-braille/braille_runtime.py#L223), [braille_runtime.py](/root/meta-braille/braille_runtime.py#L419) | No dedicated automated MQTT test | Partial |
| memcached as ephemeral state fabric | [memcached_protocol.md](/root/meta-braille/dev-docs/memcached_protocol.md), [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md) | [braille_runtime.py](/root/meta-braille/braille_runtime.py#L196) | No dedicated memcached daemon test | Partial; text protocol only |
| JSON Canvas as graph execution/projection surface | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md) | [web/graph.js](/root/meta-braille/web/graph.js#L68), [web/app.js](/root/meta-braille/web/app.js#L56) | [test_graph.mjs](/root/meta-braille/tests/test_graph.mjs#L29) | Implemented as projection helper, not full engine |
| Service-worker shadow scene graph | [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md), [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md) | [web/service-worker.js](/root/meta-braille/web/service-worker.js#L1), [web/app.js](/root/meta-braille/web/app.js#L57) | [test_graph.mjs](/root/meta-braille/tests/test_graph.mjs#L67) | Partial, local mirror only |
| Control-plane bars and rails | [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md) | [web/index.html](/root/meta-braille/web/index.html#L177), [web/index.html](/root/meta-braille/web/index.html#L287), [web/app.js](/root/meta-braille/web/app.js#L288) | No direct DOM integration test | Implemented as UI display/control surfaces |
| WebRTC narrow peer channel | [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md) | [web/app.js](/root/meta-braille/web/app.js#L138) | No automated browser peer test | Partial |
| A-Frame dual projection | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md), [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md) | None in current code | None | Conceptual only |
| memcached binary protocol as packet law | [memcached_protocol.md](/root/meta-braille/dev-docs/memcached_protocol.md) | None in current code beyond text-protocol helpers | None | Conceptual/spec-backed only |
| Canonical relation substrate | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md), [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md) | [40-canonical-relation-schema.md](/root/meta-braille/docs/40-canonical-relation-schema.md), [wordnet_to_relations.py](/root/meta-braille/scripts/wordnet_to_relations.py), [narrative_to_relations.py](/root/meta-braille/scripts/narrative_to_relations.py) | [test_relation_importers.py](/root/meta-braille/tests/test_relation_importers.py) | Implemented as import/export substrate |
| Shared relation vocabulary | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md), [Life_Ruined_by_Word_Games](/root/meta-braille/dev-docs/2026-03-29-Life_Ruined_by_Word_Games.md) | [50-shared-vocabulary.md](/root/meta-braille/docs/50-shared-vocabulary.md), [shared_relation_vocabulary.py](/root/meta-braille/scripts/shared_relation_vocabulary.py) | [test_shared_vocabulary.py](/root/meta-braille/tests/test_shared_vocabulary.py) | Implemented as a small anchor vocabulary plus proof-slice projector |
| WordNet lexical relation import | [memcached_protocol.md](/root/meta-braille/dev-docs/memcached_protocol.md), [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md) | [wordnet_to_relations.py](/root/meta-braille/scripts/wordnet_to_relations.py) | [test_relation_importers.py](/root/meta-braille/tests/test_relation_importers.py) | Implemented for `s/6`, `g/2`, `hyp/2`, `ant/4` |
| Live browser WordNet relation parsing | [Braille_Thinking_System](/root/meta-braille/dev-docs/2026-03-29-Braille_Thinking_System.md), [Braille_Shadow_Scene_Graph_Spec](/root/meta-braille/dev-docs/2026-03-29-Braille_Shadow_Scene_Graph_Spec.md) | [prolog-relations.js](/root/meta-braille/web/prolog-relations.js), [relation-worker.js](/root/meta-braille/web/relation-worker.js), [relation-store.js](/root/meta-braille/web/relation-store.js), [service-worker.js](/root/meta-braille/web/service-worker.js), [app.js](/root/meta-braille/web/app.js) | [test_graph.mjs](/root/meta-braille/tests/test_graph.mjs#L100) | Implemented for live parsing of `wn_s.pl`, `wn_g.pl`, `wn_hyp.pl`, and `wn_ant.pl`; browser automation coverage is still partial |
| Narrative relation import | [When Wisdom, Law, and the Tribe Sat Down Together](/root/meta-braille/web/public/When%20Wisdom%2C%20Law%2C%20and%20the%20Tribe%20Sat%20Down%20Together/ARTICLE%20I.md) | [narrative_to_relations.py](/root/meta-braille/scripts/narrative_to_relations.py) | [test_relation_importers.py](/root/meta-braille/tests/test_relation_importers.py) | Implemented as heuristic extractor; spectacle projection remains partial |

## How To Use This Crosswalk

- Start with the concept you care about.
- Check the `Source dev-doc(s)` column to find its narrative or architectural origin.
- Check the `Runtime/Web implementation` column to see the present code.
- Check the `Proof/Test coverage` column to see whether the current implementation has a proof-of-concept witness.
- Read the `Notes / current status` column carefully; not every concept in `dev-docs/` is fully implemented.
