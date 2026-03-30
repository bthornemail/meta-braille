import {
  formatSignalTranscriptLine as formatSignalTranscript,
  projectHexagramFromEvent,
  signalDumpLinesFromEvents as projectSignalDumpLines,
} from "./hexagram-projection.js";

export function datasetFromEvent(event) {
  const selectors = selectorsFromEvent(event);
  const hexagram = projectHexagramFromEvent(event);
  const rows = event.rowsHex ?? event.rows_hex ?? selectorsToRowsHex(selectors);
  return {
    braille: String(event.braille ?? ""),
    braille8: String(event.curr8 ?? ""),
    braille6: String(event.curr6 ?? ""),
    hexagram: String(event.hexagram ?? hexagram.hexagram),
    hexagramCodepoint: String(event.hexagram_codepoint ?? hexagram.hexagram_codepoint),
    hexagramIndex: String(event.hexagram_index ?? hexagram.hexagram_index),
    hexagramOrder: String(event.hexagram_order ?? hexagram.hexagram_order),
    header8: String(event.header8 ?? hexagram.header8),
    pattern16: String(event.pattern16 ?? hexagram.pattern16),
    rel16: String(event.rel16 ?? ""),
    rows,
    fs: String(selectors.FS),
    gs: String(selectors.GS),
    us: String(selectors.US),
    rs: String(selectors.RS),
    orbitStep: String(event.orbit_step ?? event.orbit ?? ""),
    fsScope: String(event.fs?.scope128 ?? event.path ?? ""),
    gsTree: String(event.gs?.tree64 ?? ""),
    usFrame: String(event.us?.frame32 ?? ""),
    rsFrame: String(event.rs?.frame16 ?? ""),
    orbit: String(event.orbit ?? ""),
    part: String(event.part ?? ""),
    dialect: String(event.dialect ?? ""),
    chain: String(event.chain ?? ""),
    path: String(event.path ?? ""),
    step: String(event.step ?? ""),
  };
}

export function datasetFromRelation(record) {
  return {
    relationKind: String(record.kind ?? ""),
    relationId: String(record.id ?? ""),
    relationRole: String(record.role ?? ""),
    relationLabel: String(record.label ?? record.rel ?? record.id ?? ""),
    relationPlane: String(record.plane ?? ""),
    relationFrom: String(record.from ?? ""),
    relationTo: String(record.to ?? ""),
    relationNode: String(record.node ?? ""),
    relationSource: String(record.source ?? ""),
  };
}

export function applyEventToElement(element, event) {
  const dataset = datasetFromEvent(event);
  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = value;
  });
  element.innerHTML = `
    <strong>${escapeHtml(dataset.hexagram)} ${escapeHtml(dataset.braille)}</strong>
    <span>${escapeHtml(dataset.path)}</span>
    <code>header8=${escapeHtml(dataset.header8)} pattern16=${escapeHtml(dataset.pattern16)} rows=${escapeHtml(dataset.rows)}</code>
    <span>FS=${escapeHtml(dataset.fs)} GS=${escapeHtml(dataset.gs)} US=${escapeHtml(dataset.us)} RS=${escapeHtml(dataset.rs)} orbit=${escapeHtml(dataset.orbitStep)} rel16=${escapeHtml(dataset.rel16)}</span>
  `;
}

export function applyEventToGraph(root, event) {
  const key = event.path || `m/orbit/${event.orbit}/part/${event.part}/dialect/${event.dialect}/chain/${event.chain}`;
  const selector = `[data-node-key="${cssEscape(key)}"]`;
  let node = root.querySelector(selector);
  if (!node) {
    node = document.createElement("article");
    node.className = "braille-node";
    node.dataset.nodeKey = key;
    root.prepend(node);
  }
  applyEventToElement(node, event);
  return node;
}

export function applyRelationToGraph(root, record, selectedId = null) {
  const key = record.id;
  const selector = `[data-node-key="${cssEscape(key)}"]`;
  let node = root.querySelector(selector);
  if (!node) {
    node = document.createElement("article");
    node.className = "braille-node relation-node";
    node.dataset.nodeKey = key;
    root.prepend(node);
  }
  const dataset = datasetFromRelation(record);
  Object.entries(dataset).forEach(([name, value]) => {
    node.dataset[name] = value;
  });
  node.dataset.selected = String(selectedId === record.id);
  node.innerHTML = `
    <strong>${escapeHtml(dataset.relationLabel)}</strong>
    <span>${escapeHtml(dataset.relationKind)} ${escapeHtml(dataset.relationId)}</span>
    <code>${escapeHtml(dataset.relationPlane || dataset.relationRole || "record")}</code>
  `;
  return node;
}

export function selectorsFromEvent(event) {
  if (event.selectors && typeof event.selectors === "object") {
    return {
      FS: Number(event.selectors.FS ?? 0),
      GS: Number(event.selectors.GS ?? 0),
      US: Number(event.selectors.US ?? 0),
      RS: Number(event.selectors.RS ?? 0),
    };
  }
  const rows = Array.isArray(event.rows) ? event.rows : [0, 0, 0, 0];
  return {
    FS: Number(rows[0] ?? 0),
    GS: Number(rows[1] ?? 0),
    US: Number(rows[2] ?? 0),
    RS: Number(rows[3] ?? 0),
  };
}

export function selectorsToRowsHex(selectors) {
  return `0x${selectors.FS},0x${selectors.GS},0x${selectors.US},0x${selectors.RS}`;
}

export function jsonCanvasNodeFromEvent(event, index = 0) {
  const selectors = selectorsFromEvent(event);
  const hexagram = projectHexagramFromEvent(event);
  return {
    id: String(event.path ?? event.braille ?? `node-${index}`),
    type: "text",
    x: 80 + (index % 4) * 220,
    y: 80 + Math.floor(index / 4) * 160,
    width: 200,
    height: 120,
    text: `${hexagram.hexagram} ${event.braille} ${event.path}\nheader8=${hexagram.header8} pattern16=${hexagram.pattern16}\nFS=${selectors.FS} GS=${selectors.GS} US=${selectors.US} RS=${selectors.RS}\nrel16=${event.rel16}`,
    color: String(selectors.RS ?? 0),
    brailleData: datasetFromEvent(event),
  };
}

export function jsonCanvasEdgesFromEvents(events) {
  const edges = [];
  for (let i = 1; i < events.length; i += 1) {
    const prev = events[i - 1];
    const next = events[i];
    const selectors = selectorsFromEvent(prev);
    edges.push({
      id: `edge-${i}`,
      fromNode: String(prev.path),
      fromSide: selectorToSide(selectors.RS, "RS"),
      toNode: String(next.path),
      toSide: selectorToSide(selectors.US, "US"),
      label: `rel16 ${prev.rel16}`,
    });
  }
  return edges;
}

export function jsonCanvasDocumentFromEvents(events) {
  return {
    nodes: events.map((event, index) => jsonCanvasNodeFromEvent(event, index)),
    edges: jsonCanvasEdgesFromEvents(events),
  };
}

export function signalDumpLinesFromEvents(events, limit = 12) {
  return projectSignalDumpLines(events, limit);
}

export function formatSignalTranscriptLine(event) {
  return formatSignalTranscript(event);
}

export function jsonCanvasDocumentFromRelations(records) {
  const nodes = records
    .filter((record) => record.kind === "node")
    .slice(0, 120)
    .map((record, index) => ({
      id: record.id,
      type: "text",
      x: 80 + (index % 4) * 220,
      y: 80 + Math.floor(index / 4) * 160,
      width: 200,
      height: 120,
      text: `${record.label}\n${record.role ?? "node"}`,
      color: String(colorForRecord(record)),
      relationData: datasetFromRelation(record),
    }));

  const edges = records
    .filter((record) => record.kind === "edge")
    .slice(0, 200)
    .map((record, index) => ({
      id: record.id || `relation-edge-${index}`,
      fromNode: record.from,
      fromSide: planeToSide(record.plane, "from"),
      toNode: record.to,
      toSide: planeToSide(record.plane, "to"),
      label: record.rel,
    }));

  return { nodes, edges };
}

function colorForRecord(record) {
  if (record.role === "human") return 6;
  if (record.role === "transport") return 4;
  if (record.role === "city") return 2;
  return 0;
}

function planeToSide(plane, direction) {
  if (plane === "fs") return direction === "from" ? "top" : "bottom";
  if (plane === "rs") return direction === "from" ? "left" : "right";
  if (plane === "us") return direction === "from" ? "right" : "left";
  return direction === "from" ? "right" : "left";
}

function selectorToSide(value, fallback) {
  if (value === 1) return "left";
  if (value === 2) return "right";
  if (value === 3) return "bottom";
  if (fallback === "FS") return "top";
  if (fallback === "GS") return "right";
  if (fallback === "US") return "bottom";
  return "left";
}

function cssEscape(value) {
  if (globalThis.CSS && typeof globalThis.CSS.escape === "function") {
    return globalThis.CSS.escape(value);
  }
  return String(value).replace(/"/g, '\\"');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
