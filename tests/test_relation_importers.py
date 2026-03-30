from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


REPO = Path(__file__).resolve().parents[1]


class RelationImporterTests(unittest.TestCase):
    def test_wordnet_importer_emits_node_gloss_and_edges(self) -> None:
        result = subprocess.run(
            [
                "python3",
                str(REPO / "scripts" / "wordnet_to_relations.py"),
                "--root",
                str(REPO / "web" / "public" / "WNprolog-3.0" / "prolog"),
                "--lemma",
                "person",
                "--limit",
                "256",
            ],
            text=True,
            capture_output=True,
            check=True,
        )
        records = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
        kinds = {record["kind"] for record in records}
        self.assertIn("node", kinds)
        self.assertIn("gloss", kinds)
        self.assertIn("edge", kinds)
        self.assertTrue(any(record.get("rel") == "sense" for record in records if record["kind"] == "edge"))
        self.assertTrue(any(record.get("rel") == "hyp" for record in records if record["kind"] == "edge"))
        self.assertTrue(any(record.get("label") == "person" for record in records if record["kind"] == "node"))

    def test_narrative_importer_emits_story_scene_gloss_and_frame(self) -> None:
        result = subprocess.run(
            [
                "python3",
                str(REPO / "scripts" / "narrative_to_relations.py"),
                "--root",
                str(REPO / "web" / "public" / "When Wisdom, Law, and the Tribe Sat Down Together"),
                "--limit",
                "80",
            ],
            text=True,
            capture_output=True,
            check=True,
        )
        records = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
        kinds = {record["kind"] for record in records}
        self.assertIn("node", kinds)
        self.assertIn("gloss", kinds)
        self.assertIn("edge", kinds)
        self.assertIn("frame", kinds)
        self.assertTrue(any(record.get("label") == "Solomon" for record in records if record["kind"] == "node"))
        self.assertTrue(any(record.get("rel") == "speaks" for record in records if record["kind"] == "edge"))


if __name__ == "__main__":
    unittest.main()
