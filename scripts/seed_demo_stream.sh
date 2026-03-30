#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${STATE_DIR:-$ROOT_DIR/runtime}"
DIALECT="${DIALECT:-default}"
PART="${PART:-0}"
CHAIN="${CHAIN:-0}"
ORBIT_MOD="${ORBIT_MOD:-5040}"
WINDOW_SIZE="${WINDOW_SIZE:-64}"
SAMPLE_STREAM="${SAMPLE_STREAM:-⠁⠃⠇⠏⠛⠓⠉⣀}"

mkdir -p "$STATE_DIR"

printf '%s\n' "$SAMPLE_STREAM" | \
  gawk \
    -v dialect="$DIALECT" \
    -v part="$PART" \
    -v chain="$CHAIN" \
    -v orbit_mod="$ORBIT_MOD" \
    -f "$ROOT_DIR/braille_relational_reasoner.awk" | \
  python3 "$ROOT_DIR/braille_runtime.py" \
    --state-dir "$STATE_DIR" \
    --channel "${CHANNEL:-default}" \
    --dialect "$DIALECT" \
    --part "$PART" \
    --chain "$CHAIN" \
    --window-size "$WINDOW_SIZE" \
    fanout

printf 'seeded demo stream into %s\n' "$STATE_DIR"
