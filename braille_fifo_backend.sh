#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:-help}"

CHANNEL="${CHANNEL:-default}"
DIALECT="${DIALECT:-default}"
PART="${PART:-0}"
CHAIN="${CHAIN:-0}"
STATE_DIR="${STATE_DIR:-$PWD/runtime}"
AWK_SCRIPT="${AWK_SCRIPT:-$PWD/braille_relational_reasoner.awk}"
PYTHON_RUNTIME="${PYTHON_RUNTIME:-$PWD/braille_runtime.py}"
WINDOW_SIZE="${WINDOW_SIZE:-64}"
ORBIT_MOD="${ORBIT_MOD:-5040}"

INGRESS_FIFO="$STATE_DIR/ingress.fifo"
INTERP_FIFO="$STATE_DIR/interp.fifo"
RAW_LOG="$STATE_DIR/raw.log"
REL_LOG="$STATE_DIR/rel.log"
FANOUT_PID=""

ensure_state() {
  mkdir -p "$STATE_DIR"
  touch "$RAW_LOG" "$REL_LOG"
  [[ -p "$INGRESS_FIFO" ]] || mkfifo "$INGRESS_FIFO"
  [[ -p "$INTERP_FIFO" ]] || mkfifo "$INTERP_FIFO"
}

cmd_init() {
  ensure_state
  printf 'state_dir=%s\n' "$STATE_DIR"
  printf 'ingress_fifo=%s\n' "$INGRESS_FIFO"
  printf 'interp_fifo=%s\n' "$INTERP_FIFO"
}

cmd_publish() {
  ensure_state
  if [[ $# -gt 0 ]]; then
    printf '%s\n' "$*" > "$INGRESS_FIFO"
  else
    cat > "$INGRESS_FIFO"
  fi
}

cmd_run() {
  ensure_state
  (
    stdbuf -o0 gawk \
      -v dialect="$DIALECT" \
      -v part="$PART" \
      -v chain="$CHAIN" \
      -v orbit_mod="$ORBIT_MOD" \
      -f "$AWK_SCRIPT" < "$INTERP_FIFO" | \
      python3 "$PYTHON_RUNTIME" \
        --state-dir "$STATE_DIR" \
        --channel "$CHANNEL" \
        --dialect "$DIALECT" \
        --part "$PART" \
        --chain "$CHAIN" \
        --window-size "$WINDOW_SIZE" \
        fanout
  ) &
  FANOUT_PID=$!

  cleanup() {
    if [[ -n "$FANOUT_PID" ]]; then
      kill "$FANOUT_PID" 2>/dev/null || true
    fi
  }
  handle_signal() {
    cleanup
    exit 0
  }
  trap cleanup EXIT
  trap handle_signal INT TERM

  while true; do
    while IFS= read -r line || [[ -n "$line" ]]; do
      printf '%s\n' "$line" >> "$RAW_LOG"
      printf '%s\n' "$line" > "$INTERP_FIFO"
    done < "$INGRESS_FIFO"
  done
}

cmd_inspect() {
  ensure_state
  printf 'channel=%s dialect=%s part=%s chain=%s\n' "$CHANNEL" "$DIALECT" "$PART" "$CHAIN"
  printf 'raw_log=%s\n' "$RAW_LOG"
  printf 'rel_log=%s\n' "$REL_LOG"
  [[ -f "$STATE_DIR/cache/latest.json" ]] && cat "$STATE_DIR/cache/latest.json" || true
}

cmd_serve() {
  ensure_state
  python3 "$PYTHON_RUNTIME" \
    --state-dir "$STATE_DIR" \
    --channel "$CHANNEL" \
    --dialect "$DIALECT" \
    --part "$PART" \
    --chain "$CHAIN" \
    --window-size "$WINDOW_SIZE" \
    serve
}

cmd_help() {
  cat <<'EOF'
Usage:
  ./braille_fifo_backend.sh init
  ./braille_fifo_backend.sh run
  printf '⠁⠃⠇\n' | ./braille_fifo_backend.sh publish
  ./braille_fifo_backend.sh inspect
  ./braille_fifo_backend.sh serve
EOF
}

case "$COMMAND" in
  init) shift; cmd_init "$@" ;;
  run) shift; cmd_run "$@" ;;
  publish) shift; cmd_publish "$@" ;;
  inspect) shift; cmd_inspect "$@" ;;
  serve) shift; cmd_serve "$@" ;;
  help|*) cmd_help ;;
esac
