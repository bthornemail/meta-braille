export const KING_WEN_HEXAGRAMS = [
  "䷀", "䷁", "䷂", "䷃", "䷄", "䷅", "䷆", "䷇",
  "䷈", "䷉", "䷊", "䷋", "䷌", "䷍", "䷎", "䷏",
  "䷐", "䷑", "䷒", "䷓", "䷔", "䷕", "䷖", "䷗",
  "䷘", "䷙", "䷚", "䷛", "䷜", "䷝", "䷞", "䷟",
  "䷠", "䷡", "䷢", "䷣", "䷤", "䷥", "䷦", "䷧",
  "䷨", "䷩", "䷪", "䷫", "䷬", "䷭", "䷮", "䷯",
  "䷰", "䷱", "䷲", "䷳", "䷴", "䷵", "䷶", "䷷",
  "䷸", "䷹", "䷺", "䷻", "䷼", "䷽", "䷾", "䷿",
];

const HEXAGRAM_BASE = 0x4dc0;

function clampHexagramIndex(value) {
  return Number(value ?? 0) & 63;
}

function hex2(value) {
  return clampHexagramIndex(value).toString(16).toUpperCase().padStart(2, "0");
}

export function projectHexagramIndex(value) {
  const index = clampHexagramIndex(value);
  const codepoint = HEXAGRAM_BASE + index;
  return {
    hexagram: KING_WEN_HEXAGRAMS[index],
    hexagram_codepoint: `U+${codepoint.toString(16).toUpperCase().padStart(4, "0")}`,
    hexagram_index: index,
    hexagram_order: index + 1,
    header8: hex2(index),
  };
}

export function projectHexagramFromEvent(event) {
  const index = clampHexagramIndex(
    event?.hexagram_index ??
    parseInt(String(event?.curr6 ?? "0"), 16),
  );
  const projection = projectHexagramIndex(index);
  const pattern16 = String(event?.pattern16 ?? `${projection.header8}${String(event?.d2_6 ?? "00").padStart(2, "0")}`);
  return {
    ...projection,
    pattern16,
  };
}

export function formatSignalTranscriptLine(event) {
  const projection = projectHexagramFromEvent(event);
  return `${projection.hexagram} | ${event.braille ?? ""} | ${projection.header8}/${projection.pattern16} | ${event.path ?? ""}`;
}

export function signalDumpLinesFromEvents(events, limit = 12) {
  return events.slice(-limit).map((event) => formatSignalTranscriptLine(event));
}

function parseStep(event, fallback) {
  const value = Number(event?.step ?? event?.orbit_step ?? event?.orbit ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function popcount8(value) {
  let bits = Number(value) & 0xff;
  let count = 0;
  while (bits) {
    count += bits & 1;
    bits >>= 1;
  }
  return count;
}

export function buildTapStreamFrames(events, options = {}) {
  const limit = Number(options.limit ?? 12);
  const order = options.order === "kingwen" ? "kingwen" : "stream";
  const gapThreshold = Number(options.gapThreshold ?? 1);
  const recent = events.slice(-limit);
  const frames = recent.map((event, index) => {
    const projection = projectHexagramFromEvent(event);
    const prev = recent[index - 1] ?? null;
    const step = parseStep(event, index);
    const prevStep = prev ? parseStep(prev, step - 1) : step - 1;
    const delta = Math.max(1, step - prevStep);
    const gap = index === 0 ? "lead" : delta > gapThreshold ? "long" : "short";
    const carrier = Number.parseInt(String(event?.curr8 ?? event?.curr6 ?? "0"), 16);
    const pulseCount = Math.max(1, popcount8(Number.isFinite(carrier) ? carrier : index + 1));
    return {
      index,
      step,
      delta,
      gap,
      pulseCount,
      pulseText: "•".repeat(pulseCount),
      braille: event?.braille ?? "⠀",
      path: event?.path ?? "",
      transcript: formatSignalTranscriptLine(event),
      ...projection,
    };
  });

  if (order === "kingwen") {
    return [...frames].sort((left, right) => {
      if (left.hexagram_order !== right.hexagram_order) {
        return left.hexagram_order - right.hexagram_order;
      }
      return left.index - right.index;
    });
  }

  return frames;
}
