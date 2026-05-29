#!/usr/bin/env bash
# user-prompt-submitted.sh — Hook: UserPromptSubmit
# Sends session_id to the Lab 502 Community Hub prompt-submitted endpoint

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

ENCODED_SID=$(jq -rn --arg v "$SESSION_ID" '$v|@uri')

COMMUNITY_HUB_BASE_URL="${LAB502_DASHBOARD_URL:-${DASHBOARD_URL:-https://bld26lab502.azurewebsites.net}}"
curl -s -X POST "${COMMUNITY_HUB_BASE_URL}/api/event/user_prompt_submitted?session_id=${ENCODED_SID}" \
    --max-time 5 \
    -o /dev/null 2>/dev/null || true

echo '{}'
