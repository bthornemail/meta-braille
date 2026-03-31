(function attachAztecArtifact(global) {
  const AZTEC_W = 27;
  const AZTEC_H = 27;
  const SLOTS_PER_SYMBOL = 60;
  const PAYLOAD_PER_SYMBOL = 58;
  const PNG_MAGIC = "MBAZPNG1";
  const TRANSPORT_MAGIC = "mbaz1:";

  const AZTEC_TABLE = [
    [17,13],[16,17],[11,17],[9,15],[9,11],[12,9],[18,8],[18,12],[18,16],[15,18],[10,18],[8,16],[8,12],[9,8],[14,8],
    [19,13],[18,19],[11,19],[7,17],[7,11],[10,7],[17,7],[20,10],[20,16],[17,20],[10,20],[6,18],[6,12],[7,6],[14,6],
    [21,13],[20,21],[11,21],[5,19],[5,11],[8,5],[17,5],[22,8],[22,16],[19,22],[10,22],[4,20],[4,12],[5,4],[14,4],
    [23,13],[22,23],[11,23],[3,21],[3,11],[6,3],[17,3],[24,6],[24,16],[21,24],[10,24],[2,22],[2,12],[3,2],[14,2],
  ];

  function utf8ToBytes(text) {
    return Array.from(new TextEncoder().encode(String(text)));
  }

  function bytesToUtf8(bytes) {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  }

  function bytesToHex(bytes) {
    return bytes.map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function hexToBytes(hex) {
    const clean = String(hex || "").trim();
    const bytes = [];
    for (let index = 0; index < clean.length; index += 2) {
      bytes.push(parseInt(clean.slice(index, index + 2), 16));
    }
    return bytes;
  }

  function a13Encode(bytes) {
    const output = [0xc0];
    bytes.forEach((value) => {
      if (value === 0xc0) {
        output.push(0xdb, 0xdc);
      } else if (value === 0xdb) {
        output.push(0xdb, 0xdd);
      } else {
        output.push(value);
      }
    });
    output.push(0xc0);
    return output;
  }

  function a13Decode(bytes) {
    let inFrame = false;
    const output = [];
    for (let index = 0; index < bytes.length; index += 1) {
      const value = bytes[index];
      if (!inFrame) {
        if (value === 0xc0) {
          inFrame = true;
        }
        continue;
      }
      if (value === 0xc0) {
        return output;
      }
      if (value === 0xdb) {
        index += 1;
        if (index >= bytes.length) {
          throw new Error("truncated escape in A13 stream");
        }
        const esc = bytes[index];
        if (esc === 0xdc) output.push(0xc0);
        else if (esc === 0xdd) output.push(0xdb);
        else throw new Error("invalid escape in A13 stream");
      } else {
        output.push(value);
      }
    }
    throw new Error("unterminated A13 frame");
  }

  function streamToSymbols(streamBytes) {
    const symbols = [];
    const total = Math.max(1, Math.ceil(streamBytes.length / PAYLOAD_PER_SYMBOL));
    for (let symbolIndex = 0; symbolIndex < total; symbolIndex += 1) {
      const offset = symbolIndex * PAYLOAD_PER_SYMBOL;
      const chunk = streamBytes.slice(offset, offset + PAYLOAD_PER_SYMBOL);
      const slots = new Array(SLOTS_PER_SYMBOL).fill(0);
      slots[0] = chunk.length;
      slots[1] = symbolIndex + 1 < total ? 1 : 0;
      chunk.forEach((value, index) => {
        slots[2 + index] = value;
      });
      symbols.push(slots);
    }
    return symbols;
  }

  function symbolsToStream(symbols) {
    const stream = [];
    symbols.forEach((slots) => {
      const take = slots[0];
      if (take > PAYLOAD_PER_SYMBOL) {
        throw new Error("chunk_len exceeds payload capacity");
      }
      for (let index = 0; index < take; index += 1) {
        stream.push(slots[2 + index]);
      }
    });
    return stream;
  }

  function symbolToGrid(slots) {
    const grid = Array.from({ length: AZTEC_H }, () => new Array(AZTEC_W).fill(0));
    for (let index = 0; index < SLOTS_PER_SYMBOL; index += 1) {
      const [x, y] = AZTEC_TABLE[index];
      grid[y][x] = slots[index];
    }
    return grid;
  }

  function encodePayloadObject(payload) {
    const json = JSON.stringify(payload);
    const bytes = utf8ToBytes(json);
    const a13 = a13Encode(bytes);
    const symbols = streamToSymbols(a13);
    return {
      payload,
      bytes,
      a13,
      symbols,
      a13_hex: bytesToHex(a13),
    };
  }

  function decodePayloadObjectFromSymbols(symbols) {
    const stream = symbolsToStream(symbols);
    const bytes = a13Decode(stream);
    return JSON.parse(bytesToUtf8(bytes));
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function metaFromEncoded(encoded, label) {
    return {
      artifact_class: "aztec-surface",
      encoding: "ttc-a13-slip-v1",
      payload_encoding: "json-utf8",
      symbol_count: encoded.symbols.length,
      slots_per_symbol: SLOTS_PER_SYMBOL,
      payload_per_symbol: PAYLOAD_PER_SYMBOL,
      aztec_width: AZTEC_W,
      aztec_height: AZTEC_H,
      label,
      a13_hex: encoded.a13_hex,
      symbols: encoded.symbols,
    };
  }

  function renderPayloadAsSvg(payload, options = {}) {
    const encoded = encodePayloadObject(payload);
    const label = options.label || payload?.entity?.name || payload?.entity?.id || "artifact";
    const meta = metaFromEncoded(encoded, label);
    const meta64 = btoa(unescape(encodeURIComponent(JSON.stringify(meta))));
    const cell = options.cellSize || 8;
    const pad = options.padding || 12;
    const gap = options.gap || 14;
    const columns = options.columns || Math.min(4, Math.max(1, encoded.symbols.length));
    const rows = Math.ceil(encoded.symbols.length / columns);
    const symbolSpan = AZTEC_W * cell;
    const totalWidth = (columns * (symbolSpan + pad * 2)) + ((columns - 1) * gap);
    const totalHeight = (rows * (symbolSpan + pad * 2)) + ((rows - 1) * gap) + 44;
    const chunks = [];

    encoded.symbols.forEach((slots, index) => {
      const grid = symbolToGrid(slots);
      const col = index % columns;
      const row = Math.floor(index / columns);
      const originX = col * (symbolSpan + pad * 2 + gap);
      const originY = row * (symbolSpan + pad * 2 + gap);
      chunks.push(`<rect x="${originX + 4}" y="${originY + 4}" width="${symbolSpan + pad * 2 - 8}" height="${symbolSpan + pad * 2 - 8}" fill="#ffffff" stroke="#111111" stroke-width="2"/>`);
      for (let y = 0; y < AZTEC_H; y += 1) {
        for (let x = 0; x < AZTEC_W; x += 1) {
          const value = grid[y][x];
          if (!value) continue;
          const shade = 255 - value;
          chunks.push(`<rect x="${originX + pad + x * cell}" y="${originY + pad + y * cell}" width="${cell}" height="${cell}" fill="rgb(${shade},${shade},${shade})"/>`);
        }
      }
      chunks.push(`<text x="${originX + (symbolSpan + pad * 2) / 2}" y="${originY + symbolSpan + pad * 2 + 12}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="#555555">symbol ${index + 1} · chunk ${slots[0]} · cont ${slots[1]}</text>`);
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" data-artifact-class="aztec-surface" data-artifact-meta="${meta64}">
  <rect width="${totalWidth}" height="${totalHeight}" fill="#fcfaf5"/>
  ${chunks.join("")}
  <text x="${totalWidth / 2}" y="${totalHeight - 18}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#333333">TTC AZTEC ARTIFACT SURFACE</text>
  <text x="${totalWidth / 2}" y="${totalHeight - 6}" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" font-size="10" fill="#555555">${escapeXml(label)}</text>
  <desc>${meta64}</desc>
</svg>`;
  }

  function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((value) => {
      binary += String.fromCharCode(value);
    });
    return btoa(binary);
  }

  function base64ToBytes(text) {
    const binary = atob(String(text || ""));
    const bytes = [];
    for (let index = 0; index < binary.length; index += 1) {
      bytes.push(binary.charCodeAt(index));
    }
    return bytes;
  }

  function bytesToBase64Url(bytes) {
    return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(text) {
    let padded = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
    while (padded.length % 4) padded += "=";
    return base64ToBytes(padded);
  }

  function transportTextFromPayload(payload) {
    const jsonBytes = utf8ToBytes(JSON.stringify(payload));
    return `${TRANSPORT_MAGIC}${bytesToBase64Url(jsonBytes)}`;
  }

  function payloadObjectFromTransportText(text) {
    const value = String(text || "").trim();
    if (!value.startsWith(TRANSPORT_MAGIC)) {
      throw new Error("artifact transport text missing mbaz1 prefix");
    }
    const bytes = base64UrlToBytes(value.slice(TRANSPORT_MAGIC.length));
    return JSON.parse(bytesToUtf8(bytes));
  }

  function readBlobAsText(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("failed to read blob as text"));
      reader.readAsText(blob);
    });
  }

  function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("failed to load artifact image"));
      image.src = url;
    });
  }

  function encodePngMeta(meta) {
    return utf8ToBytes(JSON.stringify(meta));
  }

  function buildPngHeaderBytes(metaBytes) {
    const magicBytes = utf8ToBytes(PNG_MAGIC);
    const length = metaBytes.length >>> 0;
    return [
      ...magicBytes,
      (length >>> 24) & 0xff,
      (length >>> 16) & 0xff,
      (length >>> 8) & 0xff,
      length & 0xff,
      ...metaBytes,
    ];
  }

  function writePngHeader(ctx, width, headerBytes, headerHeight) {
    const image = ctx.createImageData(width, headerHeight);
    let byteIndex = 0;
    for (let y = 0; y < headerHeight; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixelIndex = (y * width + x) * 4;
        image.data[pixelIndex] = byteIndex < headerBytes.length ? headerBytes[byteIndex++] : 255;
        image.data[pixelIndex + 1] = byteIndex < headerBytes.length ? headerBytes[byteIndex++] : 255;
        image.data[pixelIndex + 2] = byteIndex < headerBytes.length ? headerBytes[byteIndex++] : 255;
        image.data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  function decodePngHeaderBytes(imageData) {
    const bytes = [];
    for (let index = 0; index < imageData.data.length; index += 4) {
      bytes.push(imageData.data[index], imageData.data[index + 1], imageData.data[index + 2]);
    }
    return bytes;
  }

  function parsePngMetaFromBytes(bytes) {
    const magicBytes = utf8ToBytes(PNG_MAGIC);
    for (let index = 0; index < magicBytes.length; index += 1) {
      if (bytes[index] !== magicBytes[index]) {
        throw new Error("artifact PNG header missing");
      }
    }
    const offset = magicBytes.length;
    const length = (
      ((bytes[offset] || 0) << 24) |
      ((bytes[offset + 1] || 0) << 16) |
      ((bytes[offset + 2] || 0) << 8) |
      (bytes[offset + 3] || 0)
    ) >>> 0;
    const metaStart = offset + 4;
    const metaEnd = metaStart + length;
    if (bytes.length < metaEnd) {
      throw new Error("artifact PNG metadata truncated");
    }
    return JSON.parse(bytesToUtf8(bytes.slice(metaStart, metaEnd)));
  }

  function payloadObjectFromMeta(meta) {
    if (!Array.isArray(meta.symbols) || !meta.symbols.length) {
      throw new Error("artifact symbols missing");
    }
    return decodePayloadObjectFromSymbols(meta.symbols);
  }

  function payloadObjectFromSvg(svgText) {
    const parsed = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const root = parsed.documentElement;
    const meta64 = root.getAttribute("data-artifact-meta") || parsed.querySelector("desc")?.textContent || "";
    if (!meta64) {
      throw new Error("artifact metadata not found in SVG");
    }
    const meta = JSON.parse(decodeURIComponent(escape(atob(meta64))));
    return payloadObjectFromMeta(meta);
  }

  async function renderPayloadAsPngBlob(payload, options = {}) {
    const encoded = encodePayloadObject(payload);
    const label = options.label || payload?.entity?.name || payload?.entity?.id || "artifact";
    const meta = metaFromEncoded(encoded, label);
    const svgText = renderPayloadAsSvg(payload, options);
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    try {
      const image = await loadImageFromUrl(url);
      const metaBytes = encodePngMeta(meta);
      const headerBytes = buildPngHeaderBytes(metaBytes);
      const width = image.width;
      const headerHeight = Math.max(1, Math.ceil(headerBytes.length / Math.max(1, width * 3)));
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height + headerHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      writePngHeader(ctx, canvas.width, headerBytes, headerHeight);
      ctx.drawImage(image, 0, headerHeight);
      return await new Promise((resolve, reject) => {
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) reject(new Error("failed to render artifact PNG"));
          else resolve(pngBlob);
        }, "image/png");
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function payloadObjectFromPngBlob(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const image = await loadImageFromUrl(url);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const bytes = decodePngHeaderBytes(ctx.getImageData(0, 0, canvas.width, canvas.height));
      const meta = parsePngMetaFromBytes(bytes);
      return payloadObjectFromMeta(meta);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function payloadObjectFromBlob(blob) {
    const type = String(blob.type || "").toLowerCase();
    const name = String(blob.name || "").toLowerCase();
    if (type.includes("svg") || name.endsWith(".svg")) {
      return payloadObjectFromSvg(await readBlobAsText(blob));
    }
    if (type.includes("png") || name.endsWith(".png")) {
      return payloadObjectFromPngBlob(blob);
    }
    throw new Error("unsupported artifact file type");
  }

  global.AztecArtifact = {
    AZTEC_TABLE,
    AZTEC_W,
    AZTEC_H,
    SLOTS_PER_SYMBOL,
    PAYLOAD_PER_SYMBOL,
    a13Encode,
    a13Decode,
    streamToSymbols,
    symbolsToStream,
    symbolToGrid,
    encodePayloadObject,
    decodePayloadObjectFromSymbols,
    renderPayloadAsSvg,
    renderPayloadAsPngBlob,
    payloadObjectFromSvg,
    payloadObjectFromPngBlob,
    payloadObjectFromBlob,
    transportTextFromPayload,
    payloadObjectFromTransportText,
    bytesToHex,
    hexToBytes,
  };
})(window);
