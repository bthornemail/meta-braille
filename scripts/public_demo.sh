#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${STATE_DIR:-$ROOT_DIR/runtime}"
HTTP_HOST="${HTTP_HOST:-127.0.0.1}"
HTTP_PORT="${HTTP_PORT:-8008}"

"$ROOT_DIR/scripts/seed_demo_stream.sh"

printf 'public demo ready\n'
printf 'open http://%s:%s\n' "$HTTP_HOST" "$HTTP_PORT"

exec python3 "$ROOT_DIR/braille_runtime.py" \
  --state-dir "$STATE_DIR" \
  --channel "${CHANNEL:-default}" \
  --dialect "${DIALECT:-default}" \
  --part "${PART:-0}" \
  --chain "${CHAIN:-0}" \
  --window-size "${WINDOW_SIZE:-64}" \
  serve
