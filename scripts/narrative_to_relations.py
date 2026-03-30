#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Iterable


KNOWN_HUMANS = {
    "Solomon": "human",
    "Solon": "human",
    "ʿAsabiyyah": "human",
}

MOVEMENT_WORDS = {"walk", "walked", "arrive", "arrived", "roads", "path", "return", "departure", "gate", "horizon"}
CITY_WORDS = {"city", "cities", "market", "ledger", "tower", "babel", "gate"}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def split_quote_blocks(lines: list[str]) -> list[list[str]]:
    blocks: list[list[str]] = []
    current: list[str] = []
    for line in lines:
        stripped = line.rstrip()
        if stripped.startswith(">"):
            current.append(stripped.lstrip("> ").strip())
        elif current:
            blocks.append(current)
            current = []
    if current:
        blocks.append(current)
    return blocks


def detect_speaker(context: str) -> str | None:
    for name in KNOWN_HUMANS:
        if name in context:
            return name
    return None


def classify_label(label: str) -> str:
    lowered = label.lower()
    if label in KNOWN_HUMANS:
        return "human"
    if any(word in lowered for word in CITY_WORDS):
        return "city"
    if any(word in lowered for word in MOVEMENT_WORDS):
        return "transport"
    return "narrative"


def hexagram_pair(index: int) -> list[str]:
    base = 0x4DC0
    return [chr(base + (index % 64)), chr(base + ((index + 1) % 64))]


def emit_narrative_records(root: Path, limit: int | None) -> Iterable[dict]:
    markdown_files = sorted(root.glob("ARTICLE *.md"))
    emitted = 0

    for article_index, path in enumerate(markdown_files, start=1):
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        title_line = next((line.strip("# ").strip() for line in lines if line.startswith("#")), path.stem)
        article_slug = slugify(path.stem)
        article_id = f"narrative:article:{article_slug}"

        yield {
            "kind": "node",
            "id": article_id,
            "role": "story",
            "label": title_line,
            "source": "narrative",
            "attrs": {"path": str(path.relative_to(root.parent.parent))},
        }
        emitted += 1
        if limit is not None and emitted >= limit:
            return

        article_text = "\n".join(lines)
        for name, role in KNOWN_HUMANS.items():
            if name in article_text:
                yield {
                    "kind": "node",
                    "id": f"narrative:actor:{slugify(name)}",
                    "role": role,
                    "label": name,
                    "source": "narrative",
                    "attrs": {"article": article_slug},
                }
                emitted += 1
                if limit is not None and emitted >= limit:
                    return

        if "city" in article_text.lower():
            yield {
                "kind": "node",
                "id": f"narrative:city:{article_slug}",
                "role": "city",
                "label": "City",
                "source": "narrative",
                "attrs": {"article": article_slug},
            }
            emitted += 1
            if limit is not None and emitted >= limit:
                return

        section_index = 0
        context_window: list[str] = []
        current_section_id = article_id

        for idx, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                continue

            if stripped.startswith("##"):
                section_index += 1
                section_title = stripped.lstrip("#").strip()
                current_section_id = f"narrative:scene:{article_slug}:{section_index}"
                yield {
                    "kind": "node",
                    "id": current_section_id,
                    "role": classify_label(section_title),
                    "label": section_title,
                    "source": "narrative",
                    "attrs": {"article": article_slug, "index": section_index},
                }
                yield {
                    "kind": "edge",
                    "id": f"narrative:edge:contains:{article_slug}:{section_index}",
                    "rel": "contains",
                    "from": article_id,
                    "to": current_section_id,
                    "plane": "gs",
                    "source": "narrative",
                }
                yield {
                    "kind": "frame",
                    "id": f"narrative:frame:{article_slug}:{section_index}",
                    "open": "☝️",
                    "hex": hexagram_pair(section_index + article_index),
                    "payload": [current_section_id],
                    "close": "⛹️",
                    "source": "narrative",
                }
                emitted += 3
                if limit is not None and emitted >= limit:
                    return
                context_window = [section_title]
                continue

            context_window.append(stripped)
            context_window = context_window[-5:]

            if stripped.startswith(">"):
                quote_lines = [stripped]
                follow = idx + 1
                while follow < len(lines) and lines[follow].strip().startswith(">"):
                    quote_lines.append(lines[follow].strip())
                    follow += 1
                quote_text = " ".join(line.lstrip("> ").strip() for line in quote_lines).strip()
                speaker = detect_speaker("\n".join(context_window))
                gloss_id = f"{current_section_id}:gloss:{idx + 1}"
                yield {
                    "kind": "gloss",
                    "id": gloss_id,
                    "node": current_section_id,
                    "text": quote_text,
                    "source": "narrative",
                }
                yield {
                    "kind": "edge",
                    "id": f"{gloss_id}:contains",
                    "rel": "contains",
                    "from": current_section_id,
                    "to": gloss_id,
                    "plane": "us",
                    "source": "narrative",
                }
                if speaker:
                    yield {
                        "kind": "edge",
                        "id": f"{gloss_id}:speaks:{slugify(speaker)}",
                        "rel": "speaks",
                        "from": f"narrative:actor:{slugify(speaker)}",
                        "to": gloss_id,
                        "plane": "us",
                        "source": "narrative",
                    }
                emitted += 2 + (1 if speaker else 0)
                if limit is not None and emitted >= limit:
                    return

            for name in KNOWN_HUMANS:
                if name in stripped:
                    yield {
                        "kind": "edge",
                        "id": f"{current_section_id}:mentions:{slugify(name)}:{idx + 1}",
                        "rel": "mentions",
                        "from": current_section_id,
                        "to": f"narrative:actor:{slugify(name)}",
                        "plane": "gs",
                        "source": "narrative",
                    }
                    emitted += 1
                    if limit is not None and emitted >= limit:
                        return


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert narrative articles to canonical NDJSON relation records")
    parser.add_argument(
        "--root",
        default="web/public/When Wisdom, Law, and the Tribe Sat Down Together",
        help="Path to article directory",
    )
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of records to emit")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    for record in emit_narrative_records(root, args.limit):
        print(json.dumps(record, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

