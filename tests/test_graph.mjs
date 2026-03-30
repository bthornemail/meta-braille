import test from "node:test";
import assert from "node:assert/strict";
import {
  datasetFromEvent,
  datasetFromRelation,
  formatSignalTranscriptLine,
  jsonCanvasDocumentFromEvents,
  jsonCanvasDocumentFromRelations,
  signalDumpLinesFromEvents,
} from "../web/graph.js";
import {
  formatSignalTranscriptLine as formatSignalTranscriptProjection,
  KING_WEN_HEXAGRAMS,
  projectHexagramFromEvent,
  projectHexagramIndex,
} from "../web/hexagram-projection.js";
import fs from "node:fs";
import {
  buildWordNetControlPlane,
  parsePrologLine,
  summarizeRelationBatch,
} from "../web/prolog-relations.js";
import {
  createRelationStore,
  getRelationSelection,
  ingestRelationBatch,
  summarizeRelationStore,
} from "../web/relation-store.js";

test("datasetFromEvent maps event fields to DOM-friendly strings", () => {
  const dataset = datasetFromEvent({
    braille: "⠓",
    curr8: "13",
    curr6: "13",
    rel16: "A",
    rows: [1, 3, 0, 0],
    orbit: 17,
    part: "3",
    dialect: "default",
    chain: "41",
    path: "m/orbit/17/part/3/dialect/default/chain/41",
    step: 18,
  });

  assert.equal(dataset.braille, "⠓");
  assert.equal(dataset.braille8, "13");
  assert.equal(dataset.hexagram, "䷓");
  assert.equal(dataset.header8, "13");
  assert.equal(dataset.pattern16, "1300");
  assert.equal(dataset.rows, "0x1,0x3,0x0,0x0");
  assert.equal(dataset.fs, "1");
  assert.equal(dataset.gs, "3");
  assert.equal(dataset.orbitStep, "17");
  assert.equal(dataset.path, "m/orbit/17/part/3/dialect/default/chain/41");
});

test("jsonCanvasDocumentFromEvents projects braille events to JSON Canvas shape", () => {
  const document = jsonCanvasDocumentFromEvents([
    {
      braille: "⠁",
      curr8: "01",
      curr6: "01",
      rel16: "3",
      rows: [1, 0, 0, 0],
      selectors: { FS: 1, GS: 0, US: 0, RS: 0 },
      orbit: 0,
      part: "0",
      dialect: "default",
      chain: "0",
      path: "m/orbit/0/part/0/dialect/default/chain/0",
      step: 1,
    },
    {
      braille: "⠃",
      curr8: "03",
      curr6: "03",
      rel16: "5",
      rows: [1, 1, 0, 0],
      selectors: { FS: 1, GS: 1, US: 0, RS: 0 },
      orbit: 1,
      part: "0",
      dialect: "default",
      chain: "0",
      path: "m/orbit/1/part/0/dialect/default/chain/0",
      step: 2,
    },
  ]);

  assert.equal(document.nodes.length, 2);
  assert.equal(document.edges.length, 1);
  assert.equal(document.nodes[0].brailleData.rows, "0x1,0x0,0x0,0x0");
  assert.equal(document.nodes[0].brailleData.hexagram, "䷁");
  assert.equal(document.edges[0].fromNode, "m/orbit/0/part/0/dialect/default/chain/0");
});

test("datasetFromEvent keeps FS/GS/US/RS selector fields for service-worker mirroring", () => {
  const dataset = datasetFromEvent({
    braille: "⠏",
    curr8: "0F",
    curr6: "0F",
    rel16: "4",
    selectors: { FS: 3, GS: 1, US: 1, RS: 0 },
    path: "m/orbit/3/part/0/dialect/default/chain/0",
    step: 4,
  });

  assert.equal(dataset.fs, "3");
  assert.equal(dataset.gs, "1");
  assert.equal(dataset.us, "1");
  assert.equal(dataset.rs, "0");
});

test("projectHexagramIndex uses King Wen ordered Unicode block", () => {
  assert.equal(KING_WEN_HEXAGRAMS[0], "䷀");
  assert.equal(KING_WEN_HEXAGRAMS[63], "䷿");
  assert.deepEqual(projectHexagramIndex(11), {
    hexagram: "䷋",
    hexagram_codepoint: "U+4DCB",
    hexagram_index: 11,
    hexagram_order: 12,
    header8: "0B",
  });
});

test("projectHexagramFromEvent and signalDumpLinesFromEvents expose signal-first dump fields", () => {
  const projection = projectHexagramFromEvent({ curr6: "0B", d2_6: "04" });
  const lines = signalDumpLinesFromEvents([
    {
      braille: "⠋",
      curr6: "0B",
      d2_6: "04",
      path: "m/orbit/11/part/0/dialect/default/chain/0",
    },
  ]);

  assert.equal(projection.hexagram, "䷋");
  assert.equal(projection.pattern16, "0B04");
  assert.match(lines[0], /䷋ \| ⠋ \| 0B\/0B04 \| m\/orbit\/11/);
});

test("formatSignalTranscriptLine matches the golden transcript fixture", () => {
  const events = [
    { braille: "⠁", curr6: "01", d2_6: "01", path: "m/orbit/0/part/0/dialect/default/chain/0" },
    { braille: "⠃", curr6: "03", d2_6: "03", path: "m/orbit/1/part/0/dialect/default/chain/0" },
    { braille: "⠋", curr6: "0B", d2_6: "0A", path: "m/orbit/2/part/0/dialect/default/chain/0" },
    { braille: "⠏", curr6: "0F", d2_6: "0C", path: "m/orbit/3/part/0/dialect/default/chain/0" },
  ];
  const fixture = fs.readFileSync(new URL("./fixtures/signal.golden.txt", import.meta.url), "utf8").trim().split("\n");
  const lines = events.map((event) => formatSignalTranscriptLine(event));

  assert.deepEqual(lines, fixture);
  assert.deepEqual(lines, events.map((event) => formatSignalTranscriptProjection(event)));
});

test("parsePrologLine parses s/6, g/2, hyp/2, ant/4 and ignores malformed lines", () => {
  assert.equal(parsePrologLine("garbage").length, 0);
  assert.equal(parsePrologLine("s(100007846,1,'person',n,1,6833).").length, 3);
  assert.equal(parsePrologLine("g(100007846,'a human being').")[0].kind, "gloss");
  assert.equal(parsePrologLine("hyp(100007846,100004475).")[0].rel, "hyp");
  assert.equal(parsePrologLine("ant(100019128,1,100021939,1).")[0].rel, "ant");
});

test("relation store ingests batches and exposes selected relation context", () => {
  let store = createRelationStore();
  const records = [
    ...parsePrologLine("s(100007846,1,'person',n,1,6833)."),
    ...parsePrologLine("g(100007846,'a human being')."),
    ...parsePrologLine("hyp(100007846,100004475)."),
    ...parsePrologLine("ant(100019128,1,100021939,1)."),
  ];
  store = ingestRelationBatch(store, {
    source: { kind: "s", path: "/public/WNprolog-3.0/prolog/wn_s.pl" },
    records,
  });
  store.selectedId = "wn:synset:100007846";
  const summary = summarizeRelationStore(store);
  const selection = getRelationSelection(store);

  assert.equal(summary.total, records.length);
  assert.equal(selection.id, "wn:synset:100007846");
  assert.equal(selection.glosses.length, 1);
  assert.equal(selection.edges.some((edge) => edge.rel === "hyp"), true);
});

test("datasetFromRelation and jsonCanvasDocumentFromRelations project relation records", () => {
  const records = [
    { kind: "node", id: "wn:synset:100007846", role: "synset", label: "person", source: "wordnet-live" },
    { kind: "node", id: "wn:sense:100007846:1", role: "human", label: "person", source: "wordnet-live" },
    { kind: "edge", id: "wn:edge:sense:100007846:1", rel: "sense", from: "wn:sense:100007846:1", to: "wn:synset:100007846", plane: "us", source: "wordnet-live" },
  ];
  const dataset = datasetFromRelation(records[0]);
  const document = jsonCanvasDocumentFromRelations(records);

  assert.equal(dataset.relationLabel, "person");
  assert.equal(document.nodes.length, 2);
  assert.equal(document.edges.length, 1);
});

test("buildWordNetControlPlane derives fs/rs surfaces from selection", () => {
  const control = buildWordNetControlPlane(
    {
      id: "wn:synset:100007846",
      label: "person",
      glosses: [{ text: "a human being" }],
      edges: [{ rel: "hyp" }, { rel: "ant" }, { rel: "ant" }],
    },
    { total: 12 },
  );

  assert.equal(control.fs.scope128, "wn:synset:100007846");
  assert.equal(control.fs.scene_step, 12);
  assert.equal(control.rs.rel16, "ant");
});
