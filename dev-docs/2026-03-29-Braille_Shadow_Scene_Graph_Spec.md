# Braille Shadow Scene Graph Spec v0.1

## Purpose
This document freezes the role split between Braille addressing, MQTT signaling, memcached recovery, the service-worker control plane, and SVG/A-Frame/DOM projection.

The primary rule is:

```text
Braille runtime = canonical
MQTT = awareness / circulation
memcached = ephemeral shared state
Service Worker = local control plane
DOM/SVG/A-Frame = projection
```

## Layer Roles

| Layer | Role | Authority |
| --- | --- | --- |
| Braille 6/8-dot | Canonical symbolic addressing and relation law | Yes |
| FIFO / process pipes | Local ingress and interpolation | No |
| MQTT / Mosquitto | Discovery, presence, diff signaling | No |
| memcached | Ephemeral object/state snapshots | No |
| Service Worker | Local orchestrator and mirror | No |
| DOM / SVG / A-Frame | 2D / 3D projection | No |

## Memcached Binary Protocol Mapping

The memcached binary protocol is treated as a deterministic state-packet layout, not a routing law.

| Memcached Field | Braille Runtime Meaning |
| --- | --- |
| `Key` | Braille / base16 address projection |
| `Value` | Node / object state snapshot |
| `Opcode` | Mutation kind (`set`, `delete`, `touch`) |
| `CAS` | Version / invariant lock |
| `Opaque` | Event lineage / proof correlation |

Rules:
- memcached MUST NOT be relied on for persistence.
- `CAS` MUST be validated before a state mutation is treated as current.
- `Opaque` SHOULD carry a replay/correlation token derived from the event lineage.
- MQTT MUST NOT carry the full value payload in the common path.

## MQTT Topic Contract

MQTT carries presence, key diffs, and signaling metadata.

Recommended topics:

```text
braille/node/<dialect>/<part>/<chain>/set
braille/node/<dialect>/<part>/<chain>/delete
braille/node/<dialect>/<part>/<chain>/touch
braille/signaling/presence
braille/signaling/<peer>
```

Recommended diff payload:

```json
{
  "key": "m/orbit/17/part/3/dialect/default/chain/41",
  "braille": "⠓",
  "cas": 123,
  "opaque": "proof-17-3-41-123",
  "hash": "sha256:..."
}
```

Rules:
- MQTT SHOULD send `key`, `cas`, `opaque`, and an integrity/hash field.
- MQTT SHOULD NOT send the full memcached value unless explicitly forcing recovery.
- MQTT presence is for discovery and liveness, not authority.

## Service Worker Control Plane

The Service Worker hosts a shadow scene graph:

```text
Map<key, {
  dataset,
  event,
  cas,
  updatedAt
}>
```

Responsibilities:
- cache the static shell
- mirror recent event updates from the page runtime
- expose a local shadow-scene endpoint for inspection/recovery
- serialize local state for renderer consumers
- treat itself as the only browser-side writer to projected state contracts

The Service Worker does not define truth; it mirrors and stages local state.

## Renderer Contract

All renderers consume the same `data-*`/selector model:

```html
<div
  data-braille="⠓"
  data-braille8="13"
  data-braille6="13"
  data-rel16="5"
  data-rows="0x1,0x3,0x0,0x0"
  data-fs="1"
  data-gs="3"
  data-us="0"
  data-rs="0"
></div>
```

Selector roles:
- `FS` = file/frame selector
- `GS` = group/transport selector
- `US` = unit/node selector
- `RS` = relation/edge selector

Renderer split:
- DOM/SVG = 2D structural projection
- A-Frame = 3D spatial projection
- both MUST be projections of the same mirrored state

## Execution Flow

```text
Unicode / Braille stream
-> FIFO ingress
-> gawk reasoner
-> normalized event
-> Service Worker mirror
-> memcached snapshot write
-> MQTT diff / presence signal
-> DOM/SVG/A-Frame projection
```

## Current Repo Status

Implemented:
- Braille NDJSON event stream
- FIFO backend
- browser data-attribute graph
- JSON Canvas projection
- narrow signaling API and WebRTC path

Not yet implemented:
- true memcached binary-protocol client
- CAS-aware mutation enforcement
- A-Frame projection
- MQTT subscriber bridge in the browser control plane

