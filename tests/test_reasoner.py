from __future__ import annotations

import json
import os
import subprocess
import tempfile
import time
import unittest
from pathlib import Path

from braille_runtime import format_signal_transcript_line, parse_event


REPO = Path(__file__).resolve().parents[1]


class ReasonerTests(unittest.TestCase):
    def test_reasoner_emits_expected_schema(self) -> None:
        command = [
            "gawk",
            "-v",
            "dialect=test",
            "-v",
            "part=1",
            "-v",
            "chain=2",
            "-f",
            str(REPO / "braille_relational_reasoner.awk"),
        ]
        result = subprocess.run(
            command,
            input="⠁⠃⠇\n",
            text=True,
            capture_output=True,
            check=True,
        )
        events = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
        self.assertEqual(len(events), 3)
        self.assertEqual(events[0]["braille"], "⠁")
        self.assertEqual(events[0]["curr8"], "01")
        self.assertEqual(events[0]["curr6"], "01")
        self.assertEqual(events[0]["hexagram"], "䷁")
        self.assertEqual(events[0]["hexagram_codepoint"], "U+4DC1")
        self.assertEqual(events[0]["hexagram_index"], 1)
        self.assertEqual(events[0]["hexagram_order"], 2)
        self.assertEqual(events[0]["header8"], "01")
        self.assertEqual(events[0]["pattern16"], "0101")
        self.assertEqual(events[0]["projection_window"], "curr6")
        self.assertEqual(events[0]["projection_bits"], 6)
        self.assertEqual(events[0]["transcript"], "䷁ | ⠁ | 01/0101 | m/orbit/0/part/1/dialect/test/chain/2")
        self.assertEqual(events[0]["rows"], [1, 0, 0, 0])
        self.assertEqual(events[0]["selectors"], {"FS": 1, "GS": 0, "US": 0, "RS": 0})
        self.assertEqual(events[0]["rows_hex"], "0x1,0x0,0x0,0x0")
        self.assertEqual(events[0]["orbit_step"], 0)
        self.assertEqual(events[0]["fs"]["scope128"], "m/orbit/0/part/1/dialect/test/chain/2")
        self.assertEqual(events[0]["gs"]["group_id"], "1")
        self.assertEqual(events[0]["us"]["selected_unit"], "⠁")
        self.assertEqual(events[0]["rs"]["rel16"], "3")
        self.assertEqual(events[0]["rs"]["header8"], "01")
        self.assertEqual(events[0]["rs"]["pattern16"], "0101")
        self.assertEqual(events[0]["dialect"], "test")
        self.assertEqual(events[0]["part"], "1")
        self.assertEqual(events[0]["chain"], "2")
        self.assertTrue(events[0]["path"].startswith("m/orbit/0/part/1/dialect/test/chain/2"))

    def test_reasoner_replay_is_stable(self) -> None:
        command = ["gawk", "-f", str(REPO / "braille_relational_reasoner.awk")]
        first = subprocess.run(command, input="⠁⠃⠇⠏\n", text=True, capture_output=True, check=True)
        second = subprocess.run(command, input="⠁⠃⠇⠏\n", text=True, capture_output=True, check=True)
        self.assertEqual(first.stdout, second.stdout)

    def test_signal_transcript_matches_golden_fixture_and_python_formatter(self) -> None:
        command = ["gawk", "-f", str(REPO / "braille_relational_reasoner.awk")]
        result = subprocess.run(command, input="⠁⠃⠋⠏\n", text=True, capture_output=True, check=True)
        parsed = [parse_event(line) for line in result.stdout.splitlines() if line.strip()]
        transcripts = [event["transcript"] for event in parsed if event is not None]
        self.assertEqual(transcripts, [format_signal_transcript_line(event) for event in parsed if event is not None])
        golden = (REPO / "tests" / "fixtures" / "signal.golden.txt").read_text(encoding="utf-8").splitlines()
        self.assertEqual(transcripts, golden)

    def test_backend_run_and_publish(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            env = {
                **os.environ,
                "STATE_DIR": tmpdir,
                "WINDOW_SIZE": "4",
            }
            runner = subprocess.Popen(
                ["bash", str(REPO / "braille_fifo_backend.sh"), "run"],
                cwd=REPO,
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            try:
                time.sleep(0.8)
                subprocess.run(
                    ["bash", str(REPO / "braille_fifo_backend.sh"), "publish", "⠁⠃⠇"],
                    cwd=REPO,
                    env=env,
                    check=True,
                )
                deadline = time.time() + 5
                rel_log = Path(tmpdir) / "rel.log"
                while time.time() < deadline:
                    if rel_log.exists() and rel_log.read_text(encoding="utf-8").strip():
                        break
                    time.sleep(0.2)
                self.assertTrue(rel_log.exists())
                lines = [line for line in rel_log.read_text(encoding="utf-8").splitlines() if line.strip()]
                self.assertGreaterEqual(len(lines), 3)
            finally:
                runner.terminate()
                runner.wait(timeout=5)


if __name__ == "__main__":
    unittest.main()
