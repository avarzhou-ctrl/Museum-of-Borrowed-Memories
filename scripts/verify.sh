#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
server_pid=""
server_log="${TMPDIR:-/tmp}/museum-of-borrowed-memories-server.log"

cleanup() {
  if [[ -n "$server_pid" ]]; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

cd "$project_dir"

if ! curl --silent --fail --max-time 2 http://127.0.0.1:4173/ >/dev/null; then
  python3 -m http.server 4173 --bind 127.0.0.1 >"$server_log" 2>&1 &
  server_pid=$!
  for _ in {1..30}; do
    if curl --silent --fail --max-time 2 http://127.0.0.1:4173/ >/dev/null; then
      break
    fi
    sleep .2
  done
fi

curl --silent --fail --max-time 2 http://127.0.0.1:4173/ >/dev/null
node --check src/data.js
node --check src/room-collision.js
node --check src/game.js
python3 tests/browser_smoke.py
python3 tests/browser_branches.py

echo "PASS: syntax, smoke, and branch verification completed sequentially"
