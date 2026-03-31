export const WORDNET_RELATION_SOURCES = [
  { kind: "s", path: "/src/prolog/wn_s.pl" },
  { kind: "g", path: "/src/prolog/wn_g.pl" },
  { kind: "hyp", path: "/src/prolog/wn_hyp.pl" },
  { kind: "ant", path: "/src/prolog/wn_ant.pl" },
];

const SENSE_RE = /^s\((\d+),(\d+),'((?:\\'|[^'])*)',([a-z]),(\d+),(\d+)\)\.$/;
const GLOSS_RE = /^g\((\d+),'((?:\\'|[^'])*)'\)\.$/;
const HYP_RE = /^hyp\((\d+),(\d+)\)\.$/;
const ANT_RE = /^ant\((\d+),(\d+),(\d+),(\d+)\)\.$/;

export function parsePrologLine(line) {
  const trimmed = String(line ?? "").trim();
  if (!trimmed) {
    return [];
  }

  const sense = trimmed.match(SENSE_RE);
  if (sense) {
    const [, synsetId, wNum, rawLemma, ssType, senseNumber, tagCount] = sense;
    const lemma = unescapeProlog(rawLemma);
    return [
      {
        kind: "node",
        id: `wn:synset:${synsetId}`,
        role: "synset",
        label: lemma,
        source: "wordnet-live",
        attrs: { synset_id: synsetId, ss_type: ssType },
      },
      {
        kind: "node",
        id: `wn:sense:${synsetId}:${wNum}`,
        role: classifyLemma(lemma),
        label: lemma,
        source: "wordnet-live",
        attrs: {
          synset_id: synsetId,
          w_num: wNum,
          ss_type: ssType,
          sense_number: senseNumber,
          tag_count: tagCount,
        },
      },
      {
        kind: "edge",
        id: `wn:edge:sense:${synsetId}:${wNum}`,
        rel: "sense",
        from: `wn:sense:${synsetId}:${wNum}`,
        to: `wn:synset:${synsetId}`,
        plane: "us",
        source: "wordnet-live",
      },
    ];
  }

  const gloss = trimmed.match(GLOSS_RE);
  if (gloss) {
    const [, synsetId, rawText] = gloss;
    return [
      {
        kind: "gloss",
        id: `wn:gloss:${synsetId}`,
        node: `wn:synset:${synsetId}`,
        text: unescapeProlog(rawText),
        source: "wordnet-live",
      },
    ];
  }

  const hyp = trimmed.match(HYP_RE);
  if (hyp) {
    const [, child, parent] = hyp;
    return [
      {
        kind: "edge",
        id: `wn:edge:hyp:${child}:${parent}`,
        rel: "hyp",
        from: `wn:synset:${child}`,
        to: `wn:synset:${parent}`,
        plane: "fs",
        source: "wordnet-live",
      },
    ];
  }

  const ant = trimmed.match(ANT_RE);
  if (ant) {
    const [, synsetA, senseA, synsetB, senseB] = ant;
    return [
      {
        kind: "edge",
        id: `wn:edge:ant:${synsetA}:${senseA}:${synsetB}:${senseB}`,
        rel: "ant",
        from: `wn:sense:${synsetA}:${senseA}`,
        to: `wn:sense:${synsetB}:${senseB}`,
        plane: "rs",
        source: "wordnet-live",
      },
    ];
  }

  return [];
}

export function parsePrologText(text) {
  const records = [];
  const lines = String(text ?? "").split(/\r?\n/);
  for (const line of lines) {
    records.push(...parsePrologLine(line));
  }
  return records;
}

export function summarizeRelationBatch(records) {
  const summary = {
    total: records.length,
    nodes: 0,
    glosses: 0,
    edges: 0,
    rels: { sense: 0, hyp: 0, ant: 0 },
  };
  for (const record of records) {
    if (record.kind === "node") summary.nodes += 1;
    if (record.kind === "gloss") summary.glosses += 1;
    if (record.kind === "edge") {
      summary.edges += 1;
      if (record.rel in summary.rels) summary.rels[record.rel] += 1;
    }
  }
  return summary;
}

export function buildWordNetControlPlane(selection, storeSummary) {
  const selectedId = selection?.id ?? "waiting…";
  const gloss = selection?.glosses?.[0]?.text ?? "waiting…";
  const antCount = selection?.edges?.filter((edge) => edge.rel === "ant").length ?? 0;
  const hypCount = selection?.edges?.filter((edge) => edge.rel === "hyp").length ?? 0;
  return {
    fs: {
      scope128: selectedId,
      partition_layer: "wordnet",
      scene_step: storeSummary?.total ?? 0,
      orbit_step: hypCount,
    },
    rs: {
      frame16: `ant:${antCount}`,
      braille_reduce: selection?.label ?? selectedId,
      rel16: antCount ? "ant" : "none",
      result_trace: gloss,
    },
  };
}

function unescapeProlog(text) {
  return text.replace(/\\'/g, "'");
}

function classifyLemma(lemma) {
  const value = lemma.toLowerCase();
  if (/(person|human|soul|individual|someone|somebody)/.test(value)) return "human";
  if (/(city|market|road|vehicle|transport|course|movement|travel)/.test(value)) return "transport";
  if (/(state|group|relation|communication|measure|law)/.test(value)) return "city";
  return "sense";
}
