import {
  applyEventToGraph,
  applyRelationToGraph,
  datasetFromEvent,
  jsonCanvasDocumentFromEvents,
  jsonCanvasDocumentFromRelations,
  signalDumpLinesFromEvents,
} from "./graph.js";
import { WORDNET_RELATION_SOURCES, buildWordNetControlPlane } from "./prolog-relations.js";
import { projectHexagramFromEvent } from "./hexagram-projection.js";

const worker = new Worker("./worker.js", { type: "module" });
const relationWorker = new Worker("./relation-worker.js", { type: "module" });
const state = {
  peerId: `peer-${Math.random().toString(16).slice(2, 10)}`,
  signalsOffset: 0,
  peerConnections: new Map(),
  channels: new Map(),
  config: null,
  events: [],
  relationSummary: null,
  relationRecords: new Map(),
  relationMode: "signal",
  selectedRelationId: null,
};

const graphRoot = document.querySelector("#graph");
const latestPre = document.querySelector("#latest");
const peersList = document.querySelector("#peers");
const statusEl = document.querySelector("#status");
const peerTargetInput = document.querySelector("#peer-target");
const connectButton = document.querySelector("#connect-peer");
const signalModeButton = document.querySelector("#mode-signal");
const streamModeButton = document.querySelector("#mode-stream");
const wordnetModeButton = document.querySelector("#mode-wordnet");
const canvasPre = document.querySelector("#json-canvas");
const fsScopeEl = document.querySelector("#fs-scope");
const fsPartitionEl = document.querySelector("#fs-partition");
const fsSceneStepEl = document.querySelector("#fs-scene-step");
const fsOrbitStepEl = document.querySelector("#fs-orbit-step");
const rsFrame16El = document.querySelector("#rs-frame16");
const rsBrailleReduceEl = document.querySelector("#rs-braille-reduce");
const rsRel16El = document.querySelector("#rs-rel16");
const rsResultTraceEl = document.querySelector("#rs-result-trace");
const orbitClockEl = document.querySelector("#orbit-clock");
const projectionMapEl = document.querySelector("#projection-map");
const sceneGlyphEl = document.querySelector("#scene-glyph");
const sceneTitleEl = document.querySelector("#scene-title");
const sceneCaptionEl = document.querySelector("#scene-caption");
const sceneDumpEl = document.querySelector("#scene-dump");
const sceneMetaEl = document.querySelector("#scene-meta");
const projection2dButton = document.querySelector("#projection-2d");
const projection3dButton = document.querySelector("#projection-3d");
const cardModeButtons = [...document.querySelectorAll("[data-card-mode]")];
const cardToggleButtons = [...document.querySelectorAll("[data-toggle-card]")];
const cardBodies = {
  transport: document.querySelector("#transport-card"),
  history: document.querySelector("#history-card"),
  selection: document.querySelector("#selection-card"),
  projection: document.querySelector("#projection-card"),
};
const sourceStatusEl = document.querySelector("#wordnet-status");

state.cardModes = {
  transport: "local",
  history: "local",
  selection: "local",
  projection: "local",
};
state.sceneProjection = "2d";
state.shadowGraph = null;

worker.onmessage = (message) => {
  const { type, event } = message.data || {};
  if (type !== "apply") {
    return;
  }
  applyEventToGraph(graphRoot, event);
  state.events.push(event);
  if (state.events.length > 64) {
    state.events.shift();
  }
  latestPre.textContent = state.relationMode === "signal"
    ? signalDumpLinesFromEvents(state.events, 16).join("\n")
    : JSON.stringify(event, null, 2);
  canvasPre.textContent = JSON.stringify(jsonCanvasDocumentFromEvents(state.events), null, 2);
  postToServiceWorker({
    type: "event-update",
    event,
    dataset: datasetFromEvent(event),
  });
  renderControlPlane(event);
  renderFeatureCards(event);
  renderScenePanel();
  broadcastEvent(event);
};

relationWorker.onmessage = (message) => {
  const { type, source, records, summary } = message.data || {};
  if (type === "relation_source_loaded") {
    sourceStatusEl.textContent = `${source.kind}: ${source.status} (${source.bytes} bytes)`;
    postToServiceWorker({ type: "relation-batch", source, records: [] });
    return;
  }

  if (type === "relation_record_parsed" || type === "relation_batch_ready") {
    ingestRelationRecords(records ?? [], source, summary ?? null);
  }
};

async function bootstrap() {
  await registerServiceWorker();
  const configResponse = await fetch("/api/config");
  state.config = await configResponse.json();
  statusEl.textContent = `peer=${state.peerId} channel=${state.config.channel} dialect=${state.config.dialect}`;

  await postJSON("/api/presence", { peer: state.peerId });
  await loadRecovery();
  startPresenceLoop();
  startSignalsLoop();
  startEventStream();
  startShadowGraphLoop();
  wireFeatureCards();
  wireModeButtons();
  wireProjectionButtons();
  wireGraphSelection();
  loadWordNetSources();
}

async function loadRecovery() {
  const recovery = await fetch(`/api/recovery?dialect=${encodeURIComponent(state.config.dialect)}&part=${encodeURIComponent(state.config.part)}&chain=${encodeURIComponent(state.config.chain)}&limit=${encodeURIComponent(state.config.windowSize)}`);
  const payload = await recovery.json();
  postToServiceWorker({ type: "recovery-load", events: payload.events || [] });
  for (const event of payload.events || []) {
    worker.postMessage({ type: "event", event });
  }
}

function startEventStream() {
  const source = new EventSource("/api/events");
  source.onmessage = (message) => {
    try {
      const event = JSON.parse(message.data);
      worker.postMessage({ type: "event", event });
    } catch (_error) {
      return;
    }
  };
}

function startPresenceLoop() {
  refreshPeers();
  setInterval(async () => {
    await postJSON("/api/presence", { peer: state.peerId });
    await refreshPeers();
  }, 5000);
}

async function refreshPeers() {
  const response = await fetch("/api/peers");
  const payload = await response.json();
  peersList.innerHTML = "";
  for (const peer of payload.peers || []) {
    if (peer.peer === state.peerId) {
      continue;
    }
    const item = document.createElement("li");
    item.textContent = peer.peer;
    peersList.appendChild(item);
  }
  renderFeatureCards(state.events.at(-1) || null);
  renderControlPlane(state.events.at(-1) || null);
}

function startSignalsLoop() {
  setInterval(async () => {
    const response = await fetch(`/api/signals?peer=${encodeURIComponent(state.peerId)}&since=${state.signalsOffset}`);
    const payload = await response.json();
    state.signalsOffset = payload.nextOffset || state.signalsOffset;
    for (const message of payload.messages || []) {
      await handleSignal(message);
    }
  }, 1000);
}

async function connectToPeer(peerId) {
  const connection = getOrCreateConnection(peerId, true);
  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);
  await postSignal(peerId, "offer", connection.localDescription);
}

function getOrCreateConnection(peerId, initiator = false) {
  if (state.peerConnections.has(peerId)) {
    return state.peerConnections.get(peerId);
  }
  const connection = new RTCPeerConnection({ iceServers: [] });
  state.peerConnections.set(peerId, connection);

  if (initiator) {
    const channel = connection.createDataChannel("braille-stream");
    attachChannel(peerId, channel);
  }

  connection.ondatachannel = (event) => {
    attachChannel(peerId, event.channel);
  };

  connection.onicecandidate = async (event) => {
    if (!event.candidate) {
      return;
    }
    await postSignal(peerId, "ice", event.candidate);
  };

  return connection;
}

function attachChannel(peerId, channel) {
  state.channels.set(peerId, channel);
  channel.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload && payload.kind === "stream-event") {
        worker.postMessage({ type: "event", event: payload.event });
      }
    } catch (_error) {
      return;
    }
  };
}

async function handleSignal(message) {
  const peerId = message.from;
  const connection = getOrCreateConnection(peerId, false);

  if (message.kind === "offer") {
    await connection.setRemoteDescription(new RTCSessionDescription(message.payload));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    await postSignal(peerId, "answer", connection.localDescription);
    return;
  }

  if (message.kind === "answer") {
    await connection.setRemoteDescription(new RTCSessionDescription(message.payload));
    return;
  }

  if (message.kind === "ice" && message.payload) {
    try {
      await connection.addIceCandidate(message.payload);
    } catch (_error) {
      return;
    }
  }
}

async function postSignal(target, kind, payload) {
  await postJSON("/api/signals", {
    id: `${kind}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    from: state.peerId,
    target,
    kind,
    payload,
  });
}

function broadcastEvent(event) {
  for (const channel of state.channels.values()) {
    if (channel.readyState !== "open") {
      continue;
    }
    channel.send(JSON.stringify({ kind: "stream-event", event }));
  }
}

function wireFeatureCards() {
  for (const button of cardModeButtons) {
    button.dataset.active = String(state.cardModes[button.dataset.cardMode] === button.dataset.mode);
    button.addEventListener("click", () => {
      state.cardModes[button.dataset.cardMode] = button.dataset.mode;
      updateCardModeButtons();
      renderFeatureCards(state.events.at(-1) || null);
    });
  }

  for (const button of cardToggleButtons) {
    button.addEventListener("click", () => {
      const card = document.querySelector(`[data-card="${button.dataset.toggleCard}"]`);
      const hidden = !card.hasAttribute("hidden");
      if (hidden) {
        card.setAttribute("hidden", "");
        button.textContent = "Show";
      } else {
        card.removeAttribute("hidden");
        button.textContent = "Hide";
      }
    });
  }
}

function wireModeButtons() {
  signalModeButton.addEventListener("click", () => {
    state.relationMode = "signal";
    renderMainView();
  });
  streamModeButton.addEventListener("click", () => {
    state.relationMode = "stream";
    renderMainView();
  });
  wordnetModeButton.addEventListener("click", () => {
    state.relationMode = "wordnet";
    renderMainView();
  });
  renderModeButtons();
}

function wireProjectionButtons() {
  projection2dButton.addEventListener("click", () => {
    state.sceneProjection = "2d";
    renderSceneProjectionButtons();
    renderScenePanel();
  });
  projection3dButton.addEventListener("click", () => {
    state.sceneProjection = "3d";
    renderSceneProjectionButtons();
    renderScenePanel();
  });
  renderSceneProjectionButtons();
}

function renderModeButtons() {
  signalModeButton.dataset.active = String(state.relationMode === "signal");
  streamModeButton.dataset.active = String(state.relationMode === "stream");
  wordnetModeButton.dataset.active = String(state.relationMode === "wordnet");
}

function renderSceneProjectionButtons() {
  projection2dButton.dataset.active = String(state.sceneProjection === "2d");
  projection3dButton.dataset.active = String(state.sceneProjection === "3d");
}

function wireGraphSelection() {
  graphRoot.addEventListener("click", (event) => {
    const target = event.target.closest("[data-relation-id]");
    if (!target) {
      return;
    }
    state.selectedRelationId = target.dataset.relationId;
    postToServiceWorker({ type: "relation_selected", id: state.selectedRelationId });
    renderMainView();
  });
}

function updateCardModeButtons() {
  for (const button of cardModeButtons) {
    button.dataset.active = String(state.cardModes[button.dataset.cardMode] === button.dataset.mode);
  }
}

async function startShadowGraphLoop() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const fetchShadow = async () => {
    try {
      const response = await fetch("/shadow-scene-graph");
      if (!response.ok) {
        return;
      }
      state.shadowGraph = await response.json();
      await fetchRelationShadow();
      renderFeatureCards(state.events.at(-1) || null);
      renderScenePanel();
    } catch (_error) {
      return;
    }
  };
  await fetchShadow();
  setInterval(fetchShadow, 3000);
}

async function fetchRelationShadow() {
  try {
    const path = state.selectedRelationId
      ? `/shadow-relations?id=${encodeURIComponent(state.selectedRelationId)}`
      : "/shadow-relations";
    const response = await fetch(path);
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    state.relationSummary = payload.summary;
    state.selectedRelationId = payload.selectedId ?? state.selectedRelationId;
    renderMainView(payload.records ?? []);
  } catch (_error) {
    return;
  }
}

function loadWordNetSources() {
  relationWorker.postMessage({
    type: "load_sources",
    sources: WORDNET_RELATION_SOURCES,
  });
}

function ingestRelationRecords(records, source, summary) {
  for (const record of records) {
    state.relationRecords.set(record.id, record);
    if (!state.selectedRelationId && record.kind === "node") {
      state.selectedRelationId = record.id;
    }
  }
  state.relationSummary = combineRelationSummary(state.relationSummary, summary, source);
  postToServiceWorker({ type: "relation-batch", source, records });
  renderMainView();
}

function combineRelationSummary(existing, summary, source) {
  return {
    total: (existing?.total ?? 0) + (summary?.total ?? 0),
    nodes: (existing?.nodes ?? 0) + (summary?.nodes ?? 0),
    glosses: (existing?.glosses ?? 0) + (summary?.glosses ?? 0),
    edges: (existing?.edges ?? 0) + (summary?.edges ?? 0),
    rels: {
      sense: (existing?.rels?.sense ?? 0) + (summary?.rels?.sense ?? 0),
      hyp: (existing?.rels?.hyp ?? 0) + (summary?.rels?.hyp ?? 0),
      ant: (existing?.rels?.ant ?? 0) + (summary?.rels?.ant ?? 0),
    },
    source: source?.kind ?? existing?.source ?? null,
  };
}

function renderMainView(recordsOverride = null) {
  renderModeButtons();
  if (state.relationMode === "signal" || state.relationMode === "stream") {
    renderControlPlane(state.events.at(-1) || null);
    renderFeatureCards(state.events.at(-1) || null);
    if (state.relationMode === "signal") {
      latestPre.textContent = signalDumpLinesFromEvents(state.events, 16).join("\n");
      canvasPre.textContent = JSON.stringify(jsonCanvasDocumentFromEvents(state.events), null, 2);
    }
    renderScenePanel();
    return;
  }

  const records = recordsOverride ?? [...state.relationRecords.values()];
  graphRoot.innerHTML = "";
  const selection = getSelectedRelation(records);
  for (const record of records.filter((item) => item.kind === "node").slice(0, 80)) {
    applyRelationToGraph(graphRoot, record, state.selectedRelationId);
  }
  canvasPre.textContent = JSON.stringify(jsonCanvasDocumentFromRelations(records), null, 2);
  latestPre.textContent = JSON.stringify(selection ?? state.relationSummary ?? {}, null, 2);
  const control = buildWordNetControlPlane(selection, state.relationSummary);
  renderControlPlane(control);
  renderFeatureCards(selection);
  renderScenePanel(records, selection);
}

function getSelectedRelation(records) {
  const selected = records.find((record) => record.id === state.selectedRelationId && record.kind === "node");
  if (!selected) {
    return null;
  }
  const glosses = records.filter((record) => record.kind === "gloss" && record.node === selected.id);
  const edges = records.filter((record) => record.kind === "edge" && (record.from === selected.id || record.to === selected.id));
  return { ...selected, glosses, edges };
}

function renderFeatureCards(event) {
  renderCard("transport", event);
  renderCard("history", event);
  renderCard("selection", event);
  renderCard("projection", event);
}

function renderControlPlane(event) {
  fsScopeEl.textContent = event?.fs?.scope128 ?? event?.path ?? "waiting…";
  fsPartitionEl.textContent = String(event?.fs?.partition_layer ?? event?.part ?? "waiting…");
  fsSceneStepEl.textContent = String(event?.fs?.scene_step ?? event?.step ?? "waiting…");
  fsOrbitStepEl.textContent = String(event?.fs?.orbit_step ?? event?.orbit_step ?? event?.orbit ?? "waiting…");
  rsFrame16El.textContent = String(event?.rs?.frame16 ?? "waiting…");
  rsBrailleReduceEl.textContent = String(event?.rs?.braille_reduce ?? event?.braille ?? "waiting…");
  rsRel16El.textContent = String(event?.rs?.rel16 ?? event?.rel16 ?? "waiting…");
  rsResultTraceEl.textContent = String(event?.rs?.result_trace ?? "waiting…");
}

function renderScenePanel(recordsOverride = null, selectionOverride = null) {
  renderSceneProjectionButtons();
  const scene = state.relationMode === "wordnet"
    ? buildWordNetScene(recordsOverride ?? [...state.relationRecords.values()], selectionOverride ?? getSelectedRelation(recordsOverride ?? [...state.relationRecords.values()]))
    : state.relationMode === "signal"
      ? buildSignalScene(state.events)
      : buildStreamScene(state.events);

  orbitClockEl.innerHTML = buildOrbitClockSvg(scene);
  projectionMapEl.innerHTML = state.sceneProjection === "3d"
    ? buildProjectionMap3d(scene)
    : buildProjectionMap2d(scene);
  sceneGlyphEl.textContent = scene.glyph;
  sceneTitleEl.textContent = scene.title;
  sceneCaptionEl.textContent = scene.caption;
  sceneDumpEl.textContent = scene.dump.join("\n");
  sceneMetaEl.textContent = scene.meta.join("\n");
}

function buildStreamScene(events) {
  const latest = events.at(-1) ?? {};
  const orbitValue = Number(latest.orbit_step ?? latest.orbit ?? 0) % 240;
  const braille = latest.braille ?? "⠿";
  const rel = latest.rel16 ?? "-";
  const path = latest.path ?? "m/orbit/0/part/0/dialect/default/chain/0";
  const recent = events.slice(-12);
  return {
    kind: "stream",
    orbit: orbitValue,
    glyph: braille,
    title: `Orbit ${orbitValue} / Braille ${braille}`,
    caption: `Top-left is the live 240-step clock. Top-right is the projection minimap in ${state.sceneProjection.toUpperCase()} mode.`,
    dump: signalDumpLinesFromEvents(events, 8),
    meta: [
      `path=${path}`,
      `rel16=${rel}`,
      `events=${events.length}`,
      `projection=${state.sceneProjection}`,
    ],
    sequence: recent.map((event, index) => ({
      glyph: event.braille ?? "·",
      label: event.rel16 ?? String(index),
      value: Number(event.orbit_step ?? event.orbit ?? index),
    })),
    miniPoints: recent.map((event, index) => ({
      x: index,
      y: Number(event.rel16 ?? 0) || 0,
      label: event.braille ?? "·",
    })),
  };
}

function buildSignalScene(events) {
  const latest = events.at(-1) ?? {};
  const projection = projectHexagramFromEvent(latest);
  const orbitValue = Number(latest.orbit_step ?? latest.orbit ?? 0) % 240;
  const recent = events.slice(-12);
  return {
    kind: "signal",
    orbit: orbitValue,
    glyph: `${projection.hexagram}${latest.braille ?? "⠀"}`,
    title: `Signal ${projection.hexagram} / ${latest.braille ?? "⠀"}`,
    caption: "Signal-first mode treats Braille as canonical and hexagrams as the compact header/class view over the same stream.",
    dump: signalDumpLinesFromEvents(events, 8),
    meta: [
      `header8=${projection.header8}`,
      `pattern16=${projection.pattern16}`,
      `hexagram_order=${projection.hexagram_order}`,
      `codepoint=${projection.hexagram_codepoint}`,
      `path=${latest.path ?? "-"}`,
      `observer-layer=wordnet/prolog/narrative`,
    ],
    sequence: recent.map((event, index) => {
      const item = projectHexagramFromEvent(event);
      return {
        glyph: item.hexagram,
        label: event.braille ?? String(index),
        value: Number(event.orbit_step ?? event.orbit ?? index),
      };
    }),
    miniPoints: recent.map((event, index) => {
      const item = projectHexagramFromEvent(event);
      return {
        x: index,
        y: (item.hexagram_index % 4) + 1,
        label: item.hexagram,
      };
    }),
  };
}

function buildWordNetScene(records, selection) {
  const nodeCount = records.filter((record) => record.kind === "node").length;
  const selected = selection ?? { id: "wn:none", label: "WordNet", glosses: [], edges: [], role: "node" };
  const gloss = selected.glosses?.[0]?.text ?? "Choose a relation node to center the scene.";
  const edges = selected.edges ?? [];
  const hierarchy = edges.filter((edge) => edge.rel === "hyp").length;
  const contrasts = edges.filter((edge) => edge.rel === "ant").length;
  return {
    kind: "wordnet",
    orbit: nodeCount % 240,
    glyph: selected.label?.slice(0, 2) ?? "WN",
    title: `${selected.label ?? "WordNet"} / ${selected.role ?? "node"}`,
    caption: gloss,
    dump: [
      `observer | ${selected.label ?? "WordNet"} | ${selected.role ?? "node"} | ${selected.id ?? "-"}`,
      `glosses=${selected.glosses?.length ?? 0} | edges=${edges.length} | mode=observer`,
    ],
    meta: [
      `selected=${selected.id ?? "-"}`,
      `nodes=${nodeCount}`,
      `hyp=${hierarchy}`,
      `ant=${contrasts}`,
      `projection=${state.sceneProjection}`,
    ],
    sequence: edges.slice(0, 12).map((edge, index) => ({
      glyph: edge.rel === "hyp" ? "↥" : edge.rel === "ant" ? "↔" : "→",
      label: edge.rel,
      value: index * 20,
    })),
    miniPoints: edges.slice(0, 12).map((edge, index) => ({
      x: index,
      y: edge.rel === "hyp" ? 3 : edge.rel === "ant" ? 1 : 2,
      label: edge.rel,
    })),
  };
}

function buildOrbitClockSvg(scene) {
  const total = 240;
  const active = ((scene.orbit % total) + total) % total;
  const points = [];
  for (let index = 0; index < total; index += 1) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = 110 + Math.cos(angle) * 84;
    const y = 110 + Math.sin(angle) * 84;
    const radius = index === active ? 3.9 : index % 15 === 0 ? 2.3 : 1.5;
    const fill = index === active ? "#8b4513" : index % 15 === 0 ? "#c99a66" : "#d8c8b1";
    points.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius}" fill="${fill}" />`);
  }
  return `
    <svg class="orbit-svg" viewBox="0 0 220 220" aria-label="orbit clock">
      <circle cx="110" cy="110" r="92" fill="#fffaf2" stroke="#d8c8b1" stroke-width="1.5" />
      <circle cx="110" cy="110" r="64" fill="#f8efe0" stroke="#e5d8c5" stroke-width="1" />
      ${points.join("")}
      <text x="110" y="102" text-anchor="middle" font-size="28" font-family="IBM Plex Sans, sans-serif">${escapeHtml(scene.glyph)}</text>
      <text x="110" y="126" text-anchor="middle" font-size="14" font-family="IBM Plex Mono, monospace" fill="#6d5843">${scene.orbit}/240</text>
    </svg>
  `;
}

function buildProjectionMap2d(scene) {
  const cells = scene.miniPoints.slice(0, 12);
  const marks = cells.map((point, index) => {
    const x = 18 + index * 20;
    const y = 92 - point.y * 18;
    return `<g>
      <rect x="${x}" y="${y}" width="16" height="16" rx="3" fill="#8b4513" opacity="${0.35 + index * 0.04}" />
      <text x="${x + 8}" y="${y + 11}" text-anchor="middle" font-size="7" fill="#fffaf2">${escapeHtml(String(point.label).slice(0, 2))}</text>
    </g>`;
  });
  return `
    <svg class="minimap-svg" viewBox="0 0 280 120" aria-label="2d projection map">
      <rect x="6" y="6" width="268" height="108" rx="14" fill="#fbf7f0" stroke="#d8c8b1" />
      <path d="M18 92 L258 92" stroke="#c9b89f" stroke-width="1.5" />
      <path d="M18 74 L258 74" stroke="#ede1cf" stroke-width="1" />
      <path d="M18 56 L258 56" stroke="#ede1cf" stroke-width="1" />
      <path d="M18 38 L258 38" stroke="#ede1cf" stroke-width="1" />
      ${marks.join("")}
    </svg>
  `;
}

function buildProjectionMap3d(scene) {
  const bars = scene.miniPoints.slice(0, 10).map((point, index) => {
    const x = 24 + index * 22;
    const height = 18 + point.y * 16;
    const y = 96 - height;
    return `<g transform="skewX(-18)">
      <rect x="${x}" y="${y}" width="14" height="${height}" fill="#8b4513" opacity="${0.42 + index * 0.04}" />
      <rect x="${x}" y="${y - 6}" width="14" height="6" fill="#c99a66" opacity="0.8" />
    </g>`;
  });
  return `
    <svg class="minimap-svg" viewBox="0 0 280 120" aria-label="3d projection map">
      <rect x="8" y="10" width="264" height="100" rx="14" fill="#fbf7f0" stroke="#d8c8b1" />
      <path d="M20 96 L258 96" stroke="#c9b89f" stroke-width="1.5" />
      <path d="M20 96 L242 26" stroke="#ede1cf" stroke-width="1" />
      <path d="M258 96 L242 26" stroke="#ede1cf" stroke-width="1" />
      ${bars.join("")}
    </svg>
  `;
}

function renderCard(card, event) {
  const body = cardBodies[card];
  if (!body) {
    return;
  }
  const mode = state.cardModes[card];
  const relationSelection = state.relationMode === "wordnet" ? getSelectedRelation([...state.relationRecords.values()]) : null;
  if (card === "transport") {
    body.textContent = mode === "local"
      ? [
          `mode=local`,
          state.relationMode === "wordnet" ? `source=wordnet` : `fifo=ingress/interp`,
          state.relationMode === "wordnet" ? `loaded=${state.relationSummary?.total ?? 0}` : `channel=${state.config?.channel ?? "?"}`,
          state.relationMode === "wordnet" ? `sources=${WORDNET_RELATION_SOURCES.length}` : `events=${state.events.length}`,
        ].join("\n")
      : [
          `mode=remote`,
          `peers=${Math.max(0, peersList.children.length)}`,
          `mqtt=signaling/diff`,
          `webrtc=${state.channels.size} open candidate(s)`,
        ].join("\n");
    return;
  }

  if (card === "history") {
    const latest = state.events.at(-1);
    body.textContent = mode === "local"
      ? [
          `mode=local`,
          state.relationMode === "wordnet" ? `nodes=${state.relationSummary?.nodes ?? 0}` : `latest-step=${latest?.step ?? "-"}`,
          state.relationMode === "wordnet" ? `glosses=${state.relationSummary?.glosses ?? 0}` : `rel16=${latest?.rel16 ?? "-"}`,
          state.relationMode === "wordnet" ? `edges=${state.relationSummary?.edges ?? 0}` : `path=${latest?.path ?? "-"}`,
        ].join("\n")
      : [
          `mode=remote`,
          `signals-offset=${state.signalsOffset}`,
          `shadow-count=${state.shadowGraph?.count ?? 0}`,
          `remote-tip=${latest?.braille ?? "-"}`,
        ].join("\n");
    return;
  }

  if (card === "selection") {
    body.textContent = mode === "local"
      ? [
          `mode=local`,
          state.relationMode === "wordnet" ? `id=${relationSelection?.id ?? "-"}` : `braille=${event?.braille ?? "-"}`,
          state.relationMode === "wordnet" ? `label=${relationSelection?.label ?? "-"}` : `rows=${event?.rows_hex ?? "-"}`,
          state.relationMode === "wordnet" ? `role=${relationSelection?.role ?? "-"}` : `selectors=${JSON.stringify(event?.selectors ?? {})}`,
        ].join("\n")
      : [
          `mode=remote`,
          `peer-target=${peerTargetInput.value || "-"}`,
          `connections=${state.peerConnections.size}`,
          `shadow-node=${state.shadowGraph?.nodes?.[0]?.key ?? "-"}`,
        ].join("\n");
    return;
  }

  if (card === "projection") {
    body.textContent = mode === "local"
      ? [
          `mode=local`,
          state.relationMode === "wordnet" ? `json-canvas-nodes=${state.relationSummary?.nodes ?? 0}` : `json-canvas-nodes=${state.events.length}`,
          `graph-dom=${graphRoot.children.length}`,
          state.relationMode === "wordnet" ? `render=dom/json-canvas/wordnet` : `render=dom/json-canvas`,
        ].join("\n")
      : [
          `mode=remote`,
          `shadow-scene=${state.shadowGraph?.count ?? 0}`,
          `projection=a-frame/svg ready`,
          `mirror-endpoint=/shadow-scene-graph`,
        ].join("\n");
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`${url} failed`);
  }
  return response.json();
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register("/service-worker.js", { type: "module" });
  } catch (_error) {
    return;
  }
}

function postToServiceWorker(message) {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
    return;
  }
  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage(message);
  });
}

connectButton.addEventListener("click", async () => {
  const peerId = peerTargetInput.value.trim();
  if (!peerId) {
    return;
  }
  await connectToPeer(peerId);
});

bootstrap().catch((error) => {
  statusEl.textContent = `error: ${error.message}`;
});
