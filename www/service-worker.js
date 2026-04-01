import {
  createRelationStore,
  getRelationSelection,
  ingestRelationBatch,
  selectRelation,
  serializeRelationStore,
} from "./relation-store.js";

const STATIC_CACHE = "meta-braille-static-v1";
const ARTIFACT_SHARE_CACHE = "meta-braille-artifact-share-v1";
const ARTIFACT_SHARE_KEY = "/__artifact-share/latest.json";
const SHELL_FILES = [
  "/",
  "/manifest.json",
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
  "/icons/artifact-aztec.svg",
  "/icons/artifact-aztec-192.png",
  "/icons/artifact-aztec-512.png",
];
const shadowSceneGraph = new Map();
let relationStore = createRelationStore();

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }
  return btoa(binary);
}

async function serializeArtifactFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return {
    name: file.name || "artifact",
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified || Date.now(),
    size: file.size || bytes.length,
    base64: bytesToBase64(bytes),
  };
}

async function loadLatestArtifactShare() {
  const cache = await caches.open(ARTIFACT_SHARE_CACHE);
  const response = await cache.match(ARTIFACT_SHARE_KEY);
  return response ? response.json() : null;
}

async function storeLatestArtifactShare(record) {
  const cache = await caches.open(ARTIFACT_SHARE_CACHE);
  await cache.put(
    ARTIFACT_SHARE_KEY,
    new Response(JSON.stringify(record, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }),
  );
}

async function clearLatestArtifactShare() {
  const cache = await caches.open(ARTIFACT_SHARE_CACHE);
  await cache.delete(ARTIFACT_SHARE_KEY);
}

async function publishArtifactShare(record) {
  if ("BroadcastChannel" in self) {
    const channel = new BroadcastChannel("artifact-share");
    channel.postMessage({ type: "artifact-share", share: record });
    channel.close();
  }
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: "artifact-share", share: record });
  }
}

async function handleArtifactShareTarget(request) {
  const form = await request.formData();
  const files = await Promise.all(
    form
      .getAll("artifacts")
      .filter((entry) => entry instanceof File)
      .map((file) => serializeArtifactFile(file)),
  );
  const record = {
    id: `artifact-share-${Date.now()}`,
    ts: Date.now(),
    title: String(form.get("title") || ""),
    text: String(form.get("text") || ""),
    url: String(form.get("url") || ""),
    files,
  };
  await storeLatestArtifactShare(record);
  await publishArtifactShare(record);
  return Response.redirect("/artifact?source=share-target", 303);
}

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

  if (url.pathname === "/artifact-share" && event.request.method === "POST") {
    event.respondWith(handleArtifactShareTarget(event.request));
    return;
  }

  if (url.pathname === "/api/artifact-share/latest") {
    event.respondWith(
      loadLatestArtifactShare().then((record) =>
        new Response(JSON.stringify({ share: record }, null, 2), {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }),
      ),
    );
    return;
  }

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

  if (data.type === "artifact-share-clear") {
    clearLatestArtifactShare();
  }
});
