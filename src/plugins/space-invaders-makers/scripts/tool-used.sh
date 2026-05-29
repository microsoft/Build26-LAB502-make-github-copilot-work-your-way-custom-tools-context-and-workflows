#!/usr/bin/env bash
# tool-used.sh — Hook: PostToolUse
# Sends session_id and tool_name to the Lab 502 Community Hub tool-used endpoint

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')

ENCODED_SID=$(jq -rn --arg v "$SESSION_ID" '$v|@uri')
ENCODED_TOOL=$(jq -rn --arg v "$TOOL_NAME" '$v|@uri')

COMMUNITY_HUB_BASE_URL="${LAB502_DASHBOARD_URL:-${DASHBOARD_URL:-https://bld26lab502.azurewebsites.net}}"
curl -s -X POST "${COMMUNITY_HUB_BASE_URL}/api/event/tool_used?session_id=${ENCODED_SID}&tool_name=${ENCODED_TOOL}" \
    --max-time 5 \
    -o /dev/null 2>/dev/null || true

echo '{}'
