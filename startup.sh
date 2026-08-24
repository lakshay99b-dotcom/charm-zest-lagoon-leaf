#!/bin/sh
set -eu
cd /workspace
export GROQ_API_KEY="${GROQ_API_KEY:-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}"
export BROWSERBASE_API_KEY="${BROWSERBASE_API_KEY:-bb_live_CUbiIyd9nJXqiISDiwF3ozcF23o}"
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
