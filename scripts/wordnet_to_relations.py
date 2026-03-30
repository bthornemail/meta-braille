#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


SENSE_RE = re.compile(r"^s\((\d+),(\d+),'((?:\\'|[^'])*)',([a-z]),(\d+),(\d+)\)\.$")
GLOSS_RE = re.compile(r"^g\((\d+),'((?:\\'|[^'])*)'\)\.$")
HYP_RE = re.compile(r"^hyp\((\d+),(\d+)\)\.$")
ANT_RE = re.compile(r"^ant\((\d+),(\d+),(\d+),(\d+)\)\.$")


@dataclass
class Sense:
    synset_id: str
    w_num: str
    lemma: str
    ss_type: str
    sense_number: str
    tag_count: str

    @property
    def synset_node_id(self) -> str:
        return f"wn:synset:{self.synset_id}"

    @property
    def sense_node_id(self) -> str:
        return f"wn:sense:{self.synset_id}:{self.w_num}"


def unescape_prolog(text: str) -> str:
    return text.replace("\\'", "'")


def parse_senses(path: Path) -> dict[str, list[Sense]]:
    senses: dict[str, list[Sense]] = defaultdict(list)
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = SENSE_RE.match(line.strip())
        if not match:
            continue
        sense = Sense(
            synset_id=match.group(1),
            w_num=match.group(2),
            lemma=unescape_prolog(match.group(3)),
            ss_type=match.group(4),
            sense_number=match.group(5),
            tag_count=match.group(6),
        )
        senses[sense.synset_id].append(sense)
    return senses


def parse_glosses(path: Path) -> dict[str, str]:
    glosses: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = GLOSS_RE.match(line.strip())
        if match:
            glosses[match.group(1)] = unescape_prolog(match.group(2))
    return glosses


def parse_pairs(path: Path, regex: re.Pattern[str]) -> list[tuple[str, ...]]:
    pairs: list[tuple[str, ...]] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = regex.match(line.strip())
        if match:
            pairs.append(match.groups())
    return pairs


def classify_lemma(lemma: str) -> str:
    value = lemma.lower()
    if any(token in value for token in ("person", "human", "soul", "individual", "someone", "somebody")):
        return "human"
    if any(token in value for token in ("city", "market", "road", "vehicle", "transport", "course", "movement", "travel")):
        return "transport"
    if any(token in value for token in ("state", "group", "relation", "communication", "measure", "law")):
        return "city"
    return "sense"


def filter_synsets(
    senses: dict[str, list[Sense]],
    glosses: dict[str, str],
    hyps: list[tuple[str, str]],
    ants: list[tuple[str, str, str, str]],
    lemmas: set[str],
) -> set[str]:
    if not lemmas:
        return set(senses.keys())

    selected: set[str] = set()
    normalized = {lemma.lower() for lemma in lemmas}
    for synset_id, entries in senses.items():
        if any(entry.lemma.lower() in normalized for entry in entries):
            selected.add(synset_id)

    expanded = set(selected)
    for child, parent in hyps:
        if child in selected or parent in selected:
            expanded.add(child)
            expanded.add(parent)
    for synset_a, _sense_a, synset_b, _sense_b in ants:
        if synset_a in selected or synset_b in selected:
            expanded.add(synset_a)
            expanded.add(synset_b)
    for synset_id in glosses:
        if synset_id in selected:
            expanded.add(synset_id)
    return expanded


def emit_wordnet_records(root: Path, lemmas: set[str], limit: int | None) -> Iterable[dict]:
    senses = parse_senses(root / "wn_s.pl")
    glosses = parse_glosses(root / "wn_g.pl")
    hyps = parse_pairs(root / "wn_hyp.pl", HYP_RE)
    ants = parse_pairs(root / "wn_ant.pl", ANT_RE)

    selected_synsets = filter_synsets(senses, glosses, hyps, ants, lemmas)
    hyps_by_child: dict[str, list[tuple[str, str]]] = defaultdict(list)
    ants_by_synset: dict[str, list[tuple[str, str, str, str]]] = defaultdict(list)
    for child, parent in hyps:
        hyps_by_child[child].append((child, parent))
    for synset_a, sense_a, synset_b, sense_b in ants:
        ants_by_synset[synset_a].append((synset_a, sense_a, synset_b, sense_b))

    count = 0
    for synset_id in sorted(selected_synsets):
        if synset_id not in senses:
            continue
        entries = sorted(senses[synset_id], key=lambda item: int(item.w_num))
        lead = entries[0]
        yield {
            "kind": "node",
            "id": lead.synset_node_id,
            "role": "synset",
            "label": lead.lemma,
            "source": "wordnet",
            "attrs": {
                "synset_id": synset_id,
                "ss_type": lead.ss_type,
                "sense_count": len(entries),
            },
        }
        count += 1
        if limit is not None and count >= limit:
            return

        for sense in entries:
            yield {
                "kind": "node",
                "id": sense.sense_node_id,
                "role": classify_lemma(sense.lemma),
                "label": sense.lemma,
                "source": "wordnet",
                "attrs": {
                    "synset_id": sense.synset_id,
                    "w_num": sense.w_num,
                    "ss_type": sense.ss_type,
                    "sense_number": sense.sense_number,
                    "tag_count": sense.tag_count,
                },
            }
            yield {
                "kind": "edge",
                "id": f"wn:edge:sense:{sense.synset_id}:{sense.w_num}",
                "rel": "sense",
                "from": sense.sense_node_id,
                "to": sense.synset_node_id,
                "plane": "us",
                "source": "wordnet",
            }
            count += 2
            if limit is not None and count >= limit:
                return

        gloss = glosses.get(synset_id)
        if gloss:
            yield {
                "kind": "gloss",
                "id": f"wn:gloss:{synset_id}",
                "node": lead.synset_node_id,
                "text": gloss,
                "source": "wordnet",
            }
            count += 1
            if limit is not None and count >= limit:
                return

        for child, parent in hyps_by_child.get(synset_id, []):
            if parent not in selected_synsets:
                continue
            yield {
                "kind": "edge",
                "id": f"wn:edge:hyp:{child}:{parent}",
                "rel": "hyp",
                "from": f"wn:synset:{child}",
                "to": f"wn:synset:{parent}",
                "plane": "fs",
                "source": "wordnet",
            }
            count += 1
            if limit is not None and count >= limit:
                return

        for synset_a, sense_a, synset_b, sense_b in ants_by_synset.get(synset_id, []):
            if synset_b not in selected_synsets:
                continue
            yield {
                "kind": "edge",
                "id": f"wn:edge:ant:{synset_a}:{sense_a}:{synset_b}:{sense_b}",
                "rel": "ant",
                "from": f"wn:sense:{synset_a}:{sense_a}",
                "to": f"wn:sense:{synset_b}:{sense_b}",
                "plane": "rs",
                "source": "wordnet",
            }
            count += 1
            if limit is not None and count >= limit:
                return


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert WordNet Prolog relations to canonical NDJSON records")
    parser.add_argument("--root", default="web/public/WNprolog-3.0/prolog", help="Path to WordNet Prolog directory")
    parser.add_argument("--lemma", action="append", default=[], help="Filter by lemma; can be passed multiple times")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of records to emit")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    for record in emit_wordnet_records(root, set(args.lemma), args.limit):
        print(json.dumps(record, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
