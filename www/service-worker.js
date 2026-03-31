import {
  createRelationStore,
  getRelationSelection,
  ingestRelationBatch,
  selectRelation,
  serializeRelationStore,
} from "./relation-store.js";

const STATIC_CACHE = "meta-braille-static-v1";
const SHELL_FILES = [
  "/",
  "/service-worker.js",
  "/relation-store.js",
  "/relation-worker.js",
  "/prolog-relations.js",
  "/src/app.js",
  "/src/graph.js",
  "/src/worker.js",
  "/src/relation-worker.js",
  "/src/prolog-relations.js",
  "/src/hexagram-projection.js",
  "/src/narrative-components.js",
];
const shadowSceneGraph = new Map();
let relationStore = createRelationStore();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(SHELL_FILES)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === "/shadow-scene-graph") {
    const payload = {
      nodes: [...shadowSceneGraph.values()],
      count: shadowSceneGraph.size,
    };
    event.respondWith(
      new Response(JSON.stringify(payload, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }),
    );
    return;
  }

  if (url.pathname === "/shadow-relations") {
    const selected = url.searchParams.get("id");
    const store = selected ? selectRelation(relationStore, selected) : relationStore;
    event.respondWith(
      new Response(JSON.stringify(serializeRelationStore(store), null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }),
    );
    return;
  }

  if (event.request.method === "GET" && SHELL_FILES.includes(url.pathname === "/" ? "/" : url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request)),
    );
  }
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "event-update" && data.event) {
    const eventKey = data.event.path || data.event.braille || `step-${data.event.step}`;
    shadowSceneGraph.set(eventKey, {
      key: eventKey,
      event: data.event,
      dataset: data.dataset || {},
      cas: data.event.step ?? null,
      updatedAt: Date.now(),
    });
  }

  if (data.type === "recovery-load" && Array.isArray(data.events)) {
    for (const item of data.events) {
      const eventKey = item.path || item.braille || `step-${item.step}`;
      shadowSceneGraph.set(eventKey, {
        key: eventKey,
        event: item,
        dataset: data.datasetMap?.[eventKey] || {},
        cas: item.step ?? null,
        updatedAt: Date.now(),
      });
    }
  }

  if (data.type === "relation-batch" && Array.isArray(data.records)) {
    relationStore = ingestRelationBatch(relationStore, data);
  }

  if (data.type === "relation_selected" && data.id) {
    relationStore = selectRelation(relationStore, data.id);
  }
});
