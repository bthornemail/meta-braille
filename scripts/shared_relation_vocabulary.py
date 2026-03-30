#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

from narrative_to_relations import emit_narrative_records
from wordnet_to_relations import emit_wordnet_records


REPO_ROOT = Path(__file__).resolve().parents[1]

CANONICAL_VOCABULARY = {
    "identity": "A stable unit binding that lets different symbol systems refer to the same logical subject.",
    "attribute": "A descriptive quality or polarity attached to a unit without replacing the unit itself.",
    "gloss": "A textual witness that explains, names, or exemplifies a unit or relation.",
    "parent": "An upward semantic or structural relation.",
    "opposite": "A mirrored, contrastive, or inverse relation.",
    "contains": "A scope-bearing containment relation between larger and smaller units.",
    "moves": "A directed transition from one state, scene, or symbol arrangement to another.",
    "actor": "An agent-bearing role that can speak, witness, or move through a scene.",
    "witness": "A quoted, observed, or attached trace that testifies to a relation or event.",
    "scope": "A framing surface that bounds interpretation, grouping, or scene horizon.",
}

HEXAGRAM_PROOF_RECORDS = [
    {"kind": "node", "id": "hex:1", "role": "hexagram", "label": "乾", "source": "hexagram", "attrs": {"name": "qián", "king_wen": 1, "trigram_upper": "乾", "trigram_lower": "乾"}},
    {"kind": "node", "id": "hex:2", "role": "hexagram", "label": "坤", "source": "hexagram", "attrs": {"name": "kūn", "king_wen": 2, "trigram_upper": "坤", "trigram_lower": "坤"}},
    {"kind": "node", "id": "hex:11", "role": "hexagram", "label": "泰", "source": "hexagram", "attrs": {"name": "tài", "king_wen": 11, "trigram_upper": "坤", "trigram_lower": "乾"}},
    {"kind": "node", "id": "hex:12", "role": "hexagram", "label": "否", "source": "hexagram", "attrs": {"name": "pǐ", "king_wen": 12, "trigram_upper": "乾", "trigram_lower": "坤"}},
    {"kind": "node", "id": "hex:attr:yang", "role": "attribute", "label": "yang", "source": "hexagram"},
    {"kind": "node", "id": "hex:attr:yin", "role": "attribute", "label": "yin", "source": "hexagram"},
    {"kind": "gloss", "id": "hex:gloss:11", "node": "hex:11", "text": "Peace: earth above heaven, a crossing of forces into balance.", "source": "hexagram"},
    {"kind": "gloss", "id": "hex:gloss:12", "node": "hex:12", "text": "Stagnation: heaven above earth, a blocked exchange and failed passage.", "source": "hexagram"},
    {"kind": "edge", "id": "hex:edge:attribute:1:yang", "rel": "attribute", "from": "hex:1", "to": "hex:attr:yang", "plane": "us", "source": "hexagram"},
    {"kind": "edge", "id": "hex:edge:attribute:2:yin", "rel": "attribute", "from": "hex:2", "to": "hex:attr:yin", "plane": "us", "source": "hexagram"},
    {"kind": "edge", "id": "hex:edge:parent:11:1", "rel": "parent", "from": "hex:11", "to": "hex:1", "plane": "fs", "source": "hexagram"},
    {"kind": "edge", "id": "hex:edge:parent:12:2", "rel": "parent", "from": "hex:12", "to": "hex:2", "plane": "fs", "source": "hexagram"},
    {"kind": "edge", "id": "hex:edge:opposite:11:12", "rel": "opposite", "from": "hex:11", "to": "hex:12", "plane": "rs", "source": "hexagram"},
    {"kind": "edge", "id": "hex:edge:moves:11:12", "rel": "moves", "from": "hex:11", "to": "hex:12", "plane": "gs", "source": "hexagram"},
    {"kind": "frame", "id": "hex:frame:11-12", "open": "☝️", "hex": ["䷊", "䷋"], "payload": ["hex:11", "hex:12"], "close": "⛹️", "source": "hexagram"},
]

EDGE_CONCEPTS = {
    "sense": ["identity"],
    "hyp": ["parent", "scope"],
    "parent": ["parent", "scope"],
    "ant": ["opposite"],
    "opposite": ["opposite"],
    "contains": ["contains", "scope"],
    "moves": ["moves"],
    "attribute": ["attribute"],
    "speaks": ["actor", "witness"],
    "mentions": ["actor"],
}


def canonical_concepts(record: dict) -> list[str]:
    concepts: list[str] = []
    kind = record.get("kind")

    if kind == "node":
        concepts.append("identity")
        role = record.get("role")
        if role in {"human", "actor"}:
            concepts.append("actor")
        if role == "attribute":
            concepts.append("attribute")
        if role in {"story", "scene", "synset", "hexagram"}:
            concepts.append("scope")
    elif kind == "gloss":
        concepts.append("gloss")
        if record.get("source") in {"narrative", "hexagram"}:
            concepts.append("witness")
    elif kind == "frame":
        concepts.extend(["scope", "witness"])
    elif kind == "edge":
        concepts.extend(EDGE_CONCEPTS.get(record.get("rel"), []))

    return list(dict.fromkeys(concepts))


def project_record(record: dict, domain: str) -> dict:
    projected = dict(record)
    projected["canon"] = {
        "domain": domain,
        "concepts": canonical_concepts(record),
    }
    return projected


def emit_hexagram_records() -> Iterable[dict]:
    yield from HEXAGRAM_PROOF_RECORDS


def emit_domain_records(domain: str, limit: int | None) -> Iterable[dict]:
    if domain == "wordnet":
        yield from emit_wordnet_records(REPO_ROOT / "web" / "public" / "WNprolog-3.0" / "prolog", {"person"}, limit)
        return
    if domain == "narrative":
        yield from emit_narrative_records(REPO_ROOT / "web" / "public" / "When Wisdom, Law, and the Tribe Sat Down Together", limit)
        return
    if domain == "hexagram":
        emitted = 0
        for record in emit_hexagram_records():
            yield record
            emitted += 1
            if limit is not None and emitted >= limit:
                return
        return
    raise ValueError(f"unsupported domain: {domain}")


def public_output_path(domain: str) -> Path:
    return REPO_ROOT / "web" / "public" / "proof" / f"{domain}-shared-vocabulary.ndjson"


def write_public_proof_slices(limit: int | None) -> list[Path]:
    output_dir = REPO_ROOT / "web" / "public" / "proof"
    output_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    for domain in ("wordnet", "narrative", "hexagram"):
        path = public_output_path(domain)
        with path.open("w", encoding="utf-8") as handle:
            for record in emit_domain_records(domain, limit):
                handle.write(json.dumps(project_record(record, domain), ensure_ascii=False))
                handle.write("\n")
        written.append(path)
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description="Project relation records into the shared canonical vocabulary")
    parser.add_argument("--domain", choices=("wordnet", "narrative", "hexagram", "all"), default="all", help="Select which proof domain to emit")
    parser.add_argument("--limit", type=int, default=24, help="Maximum records per domain to emit")
    parser.add_argument("--write-public-proof-slices", action="store_true", help="Write one NDJSON proof slice per domain under web/public/proof")
    args = parser.parse_args()

    if args.write_public_proof_slices:
        for path in write_public_proof_slices(args.limit):
            print(path.relative_to(REPO_ROOT))
        return 0

    domains = ("wordnet", "narrative", "hexagram") if args.domain == "all" else (args.domain,)
    for domain in domains:
        for record in emit_domain_records(domain, args.limit):
            print(json.dumps(project_record(record, domain), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
