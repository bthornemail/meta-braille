#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[1]
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))

from braille_runtime import format_signal_transcript_line


QUADRANTS = ("xx", "xX", "Xx", "XX")
PHASES = ("p0", "p1", "p2")


def stable_byte(payload: dict[str, Any]) -> int:
    data = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(data).digest()[0]


def braille_from_byte(value: int) -> str:
    return chr(0x2800 + (value & 0xFF))


def hex2(value: int) -> str:
    return f"{value & 0xFF:02X}"


def address_for(seq: int, payload: dict[str, Any]) -> tuple[str, str, str, str, str]:
    line = payload.get("line")
    if isinstance(line, int):
        quadrant = QUADRANTS[(line - 1) % len(QUADRANTS)]
        phase = PHASES[(line - 1) % len(PHASES)]
    else:
        quadrant = QUADRANTS[(seq - 1) % len(QUADRANTS)]
        phase = PHASES[(seq - 1) % len(PHASES)]
    lane = f"{(seq - 1) % 60:02x}"
    leaf = f"{(seq - 1) % 0x13B0:04x}"
    uri = f"artifact://{quadrant}/{phase}/{lane}/{leaf}"
    return quadrant, phase, lane, leaf, uri


def wrap_legacy_event(seq: int, payload: dict[str, Any], previous: dict[str, int] | None = None) -> dict[str, Any]:
    byte = stable_byte(payload)
    curr8 = byte
    curr6 = byte & 0x3F
    prev8 = previous["curr8"] if previous else 0
    prev6 = previous["curr6"] if previous else 0
    d1_8 = curr8 ^ prev8
    d1_6 = curr6 ^ prev6
    d2_8 = (curr8 + seq) & 0xFF
    d2_6 = (curr6 + seq) & 0x3F
    rel16 = ((d2_8 ^ d2_6) & 0x0F)
    hexagram_index = curr6 & 0x3F
    codepoint = 0x4DC0 + hexagram_index
    header8 = f"{hexagram_index:02X}"
    pattern16 = f"{header8}{d2_6:02X}"
    quadrant, phase, lane, leaf, uri = address_for(seq, payload)

    event = {
        "seq": seq,
        "tick": seq,
        "step": seq,
        "braille": braille_from_byte(curr8),
        "curr8": hex2(curr8),
        "curr6": hex2(curr6),
        "d1_8": hex2(d1_8),
        "d2_8": hex2(d2_8),
        "d1_6": hex2(d1_6),
        "d2_6": hex2(d2_6),
        "rel16": f"{rel16:X}",
        "header8": header8,
        "pattern16": pattern16,
        "hexagram_index": hexagram_index,
        "hexagram_order": hexagram_index + 1,
        "hexagram": chr(codepoint),
        "hexagram_codepoint": f"U+{codepoint:04X}",
        "projection_window": "curr6",
        "projection_bits": 6,
        "quadrant": quadrant,
        "phase": phase,
        "lane": lane,
        "leaf": leaf,
        "path": uri,
        "legacy_projection": payload,
    }
    event["transcript"] = format_signal_transcript_line(event)
    return event


def wrap_lines(source: Path) -> list[dict[str, Any]]:
    wrapped: list[dict[str, Any]] = []
    previous: dict[str, int] | None = None
    seq = 0
    with source.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            seq += 1
            payload = json.loads(line)
            event = wrap_legacy_event(seq, payload, previous)
            wrapped.append(event)
            previous = {
                "curr8": int(event["curr8"], 16),
                "curr6": int(event["curr6"], 16),
            }
    return wrapped


def main() -> int:
    parser = argparse.ArgumentParser(description="Wrap legacy NDJSON traces in the current canonical event layer.")
    parser.add_argument("source", help="Legacy NDJSON trace to wrap")
    parser.add_argument("-o", "--output", help="Write wrapped NDJSON to this path")
    args = parser.parse_args()

    source = Path(args.source).resolve()
    wrapped = wrap_lines(source)

    if args.output:
        output = Path(args.output).resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("w", encoding="utf-8") as handle:
            for event in wrapped:
                handle.write(json.dumps(event, ensure_ascii=False) + "\n")
    else:
        for event in wrapped:
            print(json.dumps(event, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
