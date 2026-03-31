import json
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


if __name__ == "__main__":
    unittest.main()
