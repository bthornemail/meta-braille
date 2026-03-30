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
