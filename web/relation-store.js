export function createRelationStore() {
  return {
    records: new Map(),
    sourceMeta: {},
    selectedId: null,
  };
}

export function ingestRelationBatch(store, payload) {
  const next = {
    records: new Map(store.records),
    sourceMeta: { ...store.sourceMeta },
    selectedId: store.selectedId,
  };

  if (payload?.source) {
    next.sourceMeta[payload.source.path ?? payload.source.kind ?? "unknown"] = {
      ...(next.sourceMeta[payload.source.path ?? payload.source.kind ?? "unknown"] ?? {}),
      ...payload.source,
    };
  }

  for (const record of payload?.records ?? []) {
    const existing = next.records.get(record.id);
    next.records.set(record.id, existing ? { ...existing, ...record } : record);
  }

  return next;
}

export function selectRelation(store, id) {
  return { ...store, selectedId: id };
}

export function summarizeRelationStore(store) {
  const records = [...store.records.values()];
  return {
    total: records.length,
    nodes: records.filter((record) => record.kind === "node").length,
    glosses: records.filter((record) => record.kind === "gloss").length,
    edges: records.filter((record) => record.kind === "edge").length,
    selectedId: store.selectedId,
    sources: Object.values(store.sourceMeta),
  };
}

export function getRelationSelection(store) {
  if (!store.selectedId) return null;
  const record = store.records.get(store.selectedId);
  if (!record) return null;
  const records = [...store.records.values()];
  const glosses = records.filter((item) => item.kind === "gloss" && item.node === record.id);
  const edges = records.filter((item) => item.kind === "edge" && (item.from === record.id || item.to === record.id));
  return { ...record, glosses, edges };
}

export function serializeRelationStore(store) {
  return {
    summary: summarizeRelationStore(store),
    selectedId: store.selectedId,
    records: [...store.records.values()],
    selection: getRelationSelection(store),
  };
}

