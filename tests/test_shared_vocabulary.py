from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


REPO = Path(__file__).resolve().parents[1]


class SharedVocabularyTests(unittest.TestCase):
    def test_script_emits_all_domains_with_canonical_concepts(self) -> None:
        result = subprocess.run(
            [
                "python3",
                str(REPO / "scripts" / "shared_relation_vocabulary.py"),
                "--domain",
                "all",
                "--limit",
                "24",
            ],
            text=True,
            capture_output=True,
            check=True,
        )
        records = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
        domains = {record.get("canon", {}).get("domain") for record in records}
        concepts = {concept for record in records for concept in record.get("canon", {}).get("concepts", [])}

        self.assertEqual(domains, {"wordnet", "narrative", "hexagram"})
        self.assertIn("identity", concepts)
        self.assertIn("gloss", concepts)
        self.assertIn("opposite", concepts)
        self.assertIn("scope", concepts)

    def test_public_proof_slices_can_be_written(self) -> None:
        result = subprocess.run(
            [
                "python3",
                str(REPO / "scripts" / "shared_relation_vocabulary.py"),
                "--write-public-proof-slices",
                "--limit",
                "16",
            ],
            text=True,
            capture_output=True,
            check=True,
        )
        paths = [REPO / line.strip() for line in result.stdout.splitlines() if line.strip()]
        self.assertTrue(paths)
        for path in paths:
            self.assertTrue(path.exists(), path)
            lines = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
            self.assertTrue(lines)
            self.assertTrue(all("canon" in record for record in lines))


if __name__ == "__main__":
    unittest.main()
