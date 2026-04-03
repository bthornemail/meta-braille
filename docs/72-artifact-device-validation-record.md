# Artifact Device Validation Record

Status: acceptance record for artifact-first public transport on real devices

## Purpose

This note records the final real-device validation for the public artifact lane.

The remaining gap is not doctrine or implementation design. It is practical
acceptance on actual browsers and devices:

```text
installed PWA icon -> scan -> decode
exported PNG       -> scan -> decode
unsupported path   -> graceful fallback
```

Use this note after the public route smoke checklist in
[71-public-route-smoke-checklist.md](./71-public-route-smoke-checklist.md).

## Public Rule

Artifact device validation passes only when the same artifact law still holds on
real hardware:

```text
canonical payload
-> deterministic artifact realization
-> device scan or file import
-> exact decode
-> same payload
```

This note does not create a new truth layer. It confirms that real device
behavior still respects the existing artifact law.

## Record Template

Copy one block per device/browser combination.

```text
device:
browser:
os:
route:

installed pwa:
artifact icon scan:
exported png scan:
svg/png witness import:
unsupported scanner fallback:

result: pass | pass with note | fail
notes:
```

## Minimum Fields

- `device`
  - phone, tablet, laptop, or desktop model
- `browser`
  - browser name and version when available
- `os`
  - operating system and version when available
- `route`
  - normally `/artifact`
- `installed pwa`
  - whether the installed app path was used
- `artifact icon scan`
  - whether the installed icon or visible icon surface scanned and decoded
- `exported png scan`
  - whether exported scanner PNG decoded correctly
- `svg/png witness import`
  - whether deterministic file import still worked
- `unsupported scanner fallback`
  - whether missing or partial scanner support was explained cleanly
- `result`
  - `pass`, `pass with note`, or `fail`
- `notes`
  - concise observation only; avoid redesign discussion here

## Acceptance Rule

Use these outcomes:

### Pass

- installed icon or visible icon path scans successfully, or the device clearly
  lacks the required camera/barcode support but all fallbacks work exactly as
  documented
- exported PNG scan succeeds
- SVG or PNG witness import succeeds
- failure states are graceful and visible

### Pass With Note

- the main artifact path works
- one device-specific limitation remains
- the limitation is disclosed and does not misstate the artifact law

### Fail

- decoded payload does not match the originating artifact
- scan path silently fails
- fallback path is broken or misleading
- device behavior implies the scanner path is canonical truth

## Example Record

```text
device: Pixel 8
browser: Chrome 141
os: Android 16
route: /artifact

installed pwa: yes
artifact icon scan: pass
exported png scan: pass
svg/png witness import: pass
unsupported scanner fallback: pass

result: pass
notes: installed icon and exported scanner PNG both decoded to the same payload
```

## Relationship To 71 And 104

- [71-public-route-smoke-checklist.md](./71-public-route-smoke-checklist.md)
  decides whether the public route set is show-ready.
- [104-artifact-first-transport-and-sharing.md](./104-artifact-first-transport-and-sharing.md)
  defines artifact-first transport as doctrine.

This note records the final real-device acceptance that connects those two.
