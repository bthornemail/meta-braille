# Artifact-First Transport And Sharing

This note freezes the transport consequence of
[Aztec Artifact Surface](./103-aztec-artifact-surface.md).

The short rule is:

> People share artifacts, not mutable UI state.

## 0. Core Statement

Artifact-first transport means the shared object between people is always a
deterministically encodable and decodable artifact, with readable witness and
scannable realization as two exact bitwise realizations of the same payload.

The reduction is:

```text
artifact as data
= canonical payload carrier

artifact as image
= human/distributed transport embodiment

readable witness
= deterministic realization for people

scannable realization
= deterministic realization for devices

decode
= exact recovery of the same payload
```

## 1. Deterministic Bitwise Law

Artifact transport is only valid when all of the following are deterministic:

- payload encoding
- bitwise packing and unpacking
- readable witness realization
- scannable realization
- exact decode

In the current handbook this already points to one implemented path:

- fixed `27x27` surface table
- fixed `60` slots per symbol
- `A13` framing and deframing
- exact encode and decode
- realization-axis equality between witness and scanner surfaces

This note does not define a new codec. It states that transport is only lawful
when those existing deterministic properties hold.

## 2. What Is Shared

Primary transport objects are:

- artifact payloads
- artifact files
- witness SVG and PNG embodiments
- scanner transport embodiments
- transcript, path, and hash metadata
- artifact receipts

These are the objects that should move between people, devices, and
environments.

## 3. What Is Not Shared As Primary

The following are not primary public transport objects:

- ad hoc canvas state
- temporary layout or view state
- local tab or session state
- unverified live edits that have not been artifact-encoded

Local UI state may exist and may be useful for editing or viewing, but it is
not the transport law of the system.

## 4. Search And Discovery

Search and discovery should anchor to artifact-native fields, not only to
rendered UI text.

Artifacts may also be embedded directly as application icons, enabling
scan-based discovery and instantiation of canonical payloads under the same
deterministic transport law.

Primary discovery keys are:

- payload hash
- transcript
- canonical path or address
- artifact class
- bitboard or signature
- realization metadata

This keeps discovery tied to something resolvable and decodable instead of only
to a surface rendering.

## 5. PWA, File, And Share Placement

PWA and browser participation features sit under artifact law, not above it.

They should be read like this:

```text
file handling
-> open artifact files directly

web share
-> share artifact payloads, files, or witness/scanner embodiments

background sync
-> reconcile artifact receipts and transcript proofs

BroadcastChannel / postMessage
-> coordinate views of the same artifact locally
```

The important boundary is:

> Service workers, file handling, share targets, and background sync are
> participation helpers. They do not replace the artifact codec as the truth
> layer.

## 6. Timing And Synchronization

Artifact-first transport also defines the synchronization boundary.

- local participation may queue artifact receipts or pending artifact sends
- background sync may flush or reconcile those receipts later
- local browser timing is not canonical timing truth
- timing agreement must still resolve against canonical transcript and proof

So the correct order is:

```text
local participation
-> queued artifact transport
-> transcript reconciliation
-> shared timing agreement
```

not:

```text
browser state
-> becomes truth
```

## 7. Relationship To 103

`103` defines the artifact surface and realization axis.

This note defines how those artifacts should be transported and shared between
people and devices under the same deterministic law.
