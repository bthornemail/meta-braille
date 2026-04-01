import json
from pathlib import Path
import subprocess
import textwrap
import unittest


class AztecRealizationAxisTests(unittest.TestCase):
    def test_witness_and_scanner_realizations_preserve_same_payload(self):
        script = textwrap.dedent(
            r"""
            const fs = require('fs');
            const vm = require('vm');
            const { TextEncoder, TextDecoder } = require('util');

            const source = fs.readFileSync('www/src/aztec-artifact.js', 'utf8');
            const context = {
              window: {},
              TextEncoder,
              TextDecoder,
              btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
              atob: (value) => Buffer.from(value, 'base64').toString('binary'),
              escape: global.escape,
              unescape: global.unescape,
              console,
            };
            context.window = context;
            vm.createContext(context);
            vm.runInContext(source, context);

            const artifact = context.AztecArtifact;
            const payload = {
              schema_version: 1,
              kind: 'artifact.test',
              transcript: '䷁ | ⠁ | 01/0101 | artifact://tests/realization-axis',
              path: 'artifact://tests/realization-axis',
              entity: {
                id: 'axis-demo',
                name: 'Axis Demo',
                artifactState: 'inactive'
              }
            };

            const witnessDecoded = artifact.decodePayloadObjectFromSymbols(
              artifact.encodePayloadObject(payload).symbols
            );
            const scannerDecoded = artifact.payloadObjectFromTransportText(
              artifact.transportTextFromPayload(payload)
            );

            const result = {
              witnessDecoded,
              scannerDecoded
            };
            process.stdout.write(JSON.stringify(result));
            """
        )
        completed = subprocess.run(
            ["node", "-e", script],
            cwd="/root/meta-braille",
            capture_output=True,
            text=True,
            check=True,
        )
        result = json.loads(completed.stdout)
        self.assertEqual(result["witnessDecoded"], result["scannerDecoded"])
        self.assertEqual(
            result["witnessDecoded"]["path"], "artifact://tests/realization-axis"
        )

    def test_icon_payload_and_manifest_stay_on_same_artifact_law(self):
        manifest = json.loads(
            Path("/root/meta-braille/www/manifest.json").read_text(encoding="utf-8")
        )
        icon_sources = {entry["src"] for entry in manifest.get("icons", [])}
        self.assertIn("/icons/artifact-aztec.svg", icon_sources)
        self.assertIn("/icons/artifact-aztec-192.png", icon_sources)
        self.assertIn("/icons/artifact-aztec-512.png", icon_sources)
        self.assertEqual(manifest.get("share_target", {}).get("action"), "/artifact-share")

        for relpath in (
            "www/icons/artifact-aztec.svg",
            "www/icons/artifact-aztec-192.png",
            "www/icons/artifact-aztec-512.png",
        ):
            self.assertTrue(Path("/root/meta-braille", relpath).exists(), relpath)

        script = textwrap.dedent(
            r"""
            const fs = require('fs');
            const vm = require('vm');
            const { TextEncoder, TextDecoder } = require('util');

            const source = fs.readFileSync('www/src/aztec-artifact.js', 'utf8');
            const context = {
              window: {},
              TextEncoder,
              TextDecoder,
              btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
              atob: (value) => Buffer.from(value, 'base64').toString('binary'),
              escape: global.escape,
              unescape: global.unescape,
              console,
            };
            context.window = context;
            vm.createContext(context);
            vm.runInContext(source, context);

            const artifact = context.AztecArtifact;
            const payload = {
              kind: 'app.icon',
              path: 'artifact://public/icon',
              transcript: '䷁ | ⠁ | 01/0101 | artifact://public/icon',
              entity: {
                id: 'app-icon',
                name: 'App Icon',
                artifactState: 'inactive'
              }
            };

            const encoded = artifact.encodePayloadObject(payload);
            const witnessDecoded = artifact.decodePayloadObjectFromSymbols(encoded.symbols);
            const transport = artifact.transportTextFromPayload(payload);
            const scannerDecoded = artifact.payloadObjectFromTransportText(transport);

            process.stdout.write(JSON.stringify({
              transport,
              symbolCount: encoded.symbols.length,
              witnessDecoded,
              scannerDecoded
            }));
            """
        )
        completed = subprocess.run(
            ["node", "-e", script],
            cwd="/root/meta-braille",
            capture_output=True,
            text=True,
            check=True,
        )
        result = json.loads(completed.stdout)
        self.assertTrue(result["transport"].startswith("mbaz1:"))
        self.assertGreaterEqual(result["symbolCount"], 1)
        self.assertEqual(result["witnessDecoded"], result["scannerDecoded"])
        self.assertEqual(result["scannerDecoded"]["path"], "artifact://public/icon")


if __name__ == "__main__":
    unittest.main()
