function roleFromEvent(event) {
  const selectors = event?.selectors ?? {};
  const rel16 = String(event?.rel16 ?? "");
  const fs = Number(selectors.FS ?? event?.rows?.[0] ?? 0);
  const gs = Number(selectors.GS ?? event?.rows?.[1] ?? 0);
  const us = Number(selectors.US ?? event?.rows?.[2] ?? 0);

  if (fs >= 2 || rel16 === "A" || rel16 === "B") {
    return "city";
  }
  if (gs >= 2 || rel16 === "4" || rel16 === "5") {
    return "transport";
  }
  if (us >= 1 || rel16 === "3" || rel16 === "7") {
    return "human";
  }
  return "human";
}

function makeCard(kind, event, title, body, accent) {
  return {
    kind,
    title,
    body,
    accent,
    subtitle: `${event?.hexagram ?? ""} ${event?.braille ?? ""}`.trim(),
  };
}

export function NarrativeHuman(event) {
  if (!event || roleFromEvent(event) !== "human") {
    return null;
  }
  return makeCard(
    "human",
    event,
    "Human Witness",
    `A local actor appears at ${event.path ?? "unknown path"} and holds the current unit in view.`,
    event.rel16 ?? "",
  );
}

export function NarrativeTransport(event) {
  if (!event || roleFromEvent(event) !== "transport") {
    return null;
  }
  return makeCard(
    "transport",
    event,
    "Transport Passage",
    `The stream is in motion through orbit ${event.orbit_step ?? event.orbit ?? "?"}, carrying the current projection across the path boundary.`,
    event.rel16 ?? "",
  );
}

export function NarrativeCity(event) {
  if (!event || roleFromEvent(event) !== "city") {
    return null;
  }
  return makeCard(
    "city",
    event,
    "City Frame",
    `The frame widens into a scoped structure. The current header ${event.header8 ?? "--"} acts as a public class marker over the addressed body.`,
    event.rel16 ?? "",
  );
}

export const NARRATIVES = [
  NarrativeHuman,
  NarrativeTransport,
  NarrativeCity,
];

export function resolveNarratives(event) {
  return NARRATIVES.map((resolver) => resolver(event)).filter(Boolean);
}

export function renderNarrativeComponents(root, components) {
  if (!root) {
    return;
  }
  root.innerHTML = "";
  if (!components.length) {
    root.innerHTML = `<article class="narrative-card"><strong>Narrative Overlay</strong><span>No active narrative components.</span></article>`;
    return;
  }
  for (const component of components) {
    const card = document.createElement("article");
    card.className = "narrative-card";
    card.dataset.narrativeKind = component.kind;
    card.dataset.narrativeAccent = component.accent ?? "";
    card.innerHTML = `
      <strong>${escapeHtml(component.title)}</strong>
      <span>${escapeHtml(component.subtitle ?? "")}</span>
      <p>${escapeHtml(component.body)}</p>
    `;
    root.appendChild(card);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
