import { WORDNET_RELATION_SOURCES, parsePrologText, summarizeRelationBatch } from "./prolog-relations.js";

self.onmessage = async (message) => {
  const { type, sources } = message.data || {};
  if (type !== "load_sources") {
    return;
  }

  const activeSources = Array.isArray(sources) && sources.length > 0 ? sources : WORDNET_RELATION_SOURCES;

  for (const source of activeSources) {
    const response = await fetch(source.path);
    const text = await response.text();
    self.postMessage({
      type: "relation_source_loaded",
      source: {
        ...source,
        status: response.ok ? "loaded" : "error",
        bytes: text.length,
      },
    });

    const records = parsePrologText(text);
    const chunkSize = 250;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      self.postMessage({
        type: "relation_record_parsed",
        source,
        records: chunk,
        summary: summarizeRelationBatch(chunk),
      });
    }

    self.postMessage({
      type: "relation_batch_ready",
      source,
      records,
      summary: summarizeRelationBatch(records),
    });
  }
};

