#!/bin/sh
# Restart the preview server on PORT (default 3100) WITHOUT killing every node
# process on the machine.
#
# Why this exists: `taskkill /F /IM node.exe` frees the port but also kills every
# open free-pi/pi session, their MCP servers, and the caller itself - the caller
# dies mid-tool-call with no error, which looks like a random crash. This kills
# only the process listening on the port, then waits for the server to answer.
#
# Usage:  sh scripts/restart-dev.sh          # build-free start on 3100
#         sh scripts/restart-dev.sh 3200     # another port

PORT="${1:-3100}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="/tmp/pw-prod-$PORT.log"

cd "$ROOT" || exit 1

if command -v node >/dev/null 2>&1 && [ -f "$HOME/.free-pi/kill-port.mjs" ]; then
  node "$HOME/.free-pi/kill-port.mjs" "$PORT"
else
  # Fallback: find the listener with netstat and kill only that pid.
  pid=$(netstat -ano 2>/dev/null | grep -E "LISTENING" | grep -E "[:.]$PORT[[:space:]]" | awk '{print $NF}' | head -1)
  [ -n "$pid" ] && taskkill //F //PID "$pid" >/dev/null 2>&1
fi

sleep 1
npx next start -p "$PORT" > "$LOG" 2>&1 &
echo "starting next on $PORT, log: $LOG"

i=0
while [ "$i" -lt 40 ]; do
  code=$(curl -s -m 2 -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" 2>/dev/null)
  case "$code" in
    200|302|307|308)
      echo "port $PORT up (HTTP $code)"
      exit 0 ;;
  esac
  i=$((i + 1))
  sleep 1
done

echo "server did not answer on $PORT after 40s; last log lines:" >&2
tail -20 "$LOG" >&2
exit 1
