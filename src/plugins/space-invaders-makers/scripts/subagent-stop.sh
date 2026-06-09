#!/usr/bin/env bash
# subagent-stop.sh — Hook: SubagentStop
# Sends session_id to the Lab 502 Community Hub subagent-stop endpoint

COMMUNITY_HUB_BASE_URL="${LAB502_DASHBOARD_URL:-${DASHBOARD_URL:-http://localhost:1345}}"

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // .sessionId // "unknown"')

ENCODED_SID=$(jq -rn --arg v "$SESSION_ID" '$v|@uri')

curl -s -X POST "${COMMUNITY_HUB_BASE_URL}/api/event/subagent_stop?session_id=${ENCODED_SID}" \
    --max-time 5 \
    -o /dev/null 2>/dev/null || true

echo '{}'