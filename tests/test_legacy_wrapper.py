from __future__ import annotations

import json
import unittest
from pathlib import Path

from scripts.wrap_legacy_ndjson import wrap_legacy_event

REPO = Path(__file__).resolve().parents[1]


class LegacyWrapperTests(unittest.TestCase):
    def test_wrapped_wisdom_fixture_matches_canonical_shape(self) -> None:
        fixture = REPO / "tests" / "fixtures" / "wisdom-fractal.wrapped.ndjson"
        events = [json.loads(line) for line in fixture.read_text(encoding="utf-8").splitlines() if line.strip()]
        self.assertGreaterEqual(len(events), 4)
        first = events[0]
        self.assertEqual(first["seq"], 1)
        self.assertIn("braille", first)
        self.assertIn("curr8", first)
        self.assertIn("curr6", first)
        self.assertIn("rel16", first)
        self.assertIn("path", first)
        self.assertIn("transcript", first)
        self.assertIn("legacy_projection", first)
        self.assertEqual(first["legacy_projection"]["event"], "knowledge_cloud_start")
        self.assertTrue(first["path"].startswith("artifact://"))
        self.assertEqual(first["transcript"], f"{first['hexagram']} | {first['braille']} | {first['header8']}/{first['pattern16']} | {first['path']}")

    def test_wrap_legacy_event_builds_expected_projection_layer(self) -> None:
        event = wrap_legacy_event(
            4,
            {
                "event": "seed_word",
                "word": "wisdom",
                "language": "English",
                "line": 3,
                "matrix": [0, 0, 0, 0, 0, 0, 0],
                "angle": 0,
            },
        )
        self.assertEqual(event["seq"], 4)
        self.assertEqual(event["tick"], 4)
        self.assertEqual(event["legacy_projection"]["event"], "seed_word")
        self.assertEqual(event["legacy_projection"]["word"], "wisdom")
        self.assertEqual(event["quadrant"], "Xx")
        self.assertEqual(event["phase"], "p2")
        self.assertTrue(event["transcript"].endswith(event["path"]))


if __name__ == "__main__":
    unittest.main()
