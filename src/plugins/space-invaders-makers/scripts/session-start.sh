#!/usr/bin/env bash
# session-start.sh — Hook: SessionStart
# Sends session_id and user_info to the Lab 502 Community Hub session-start endpoint

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
CURRENT_USER="${USER:-${USERNAME:-unknown}}"
CURRENT_USER_LOWER=$(printf '%s' "$CURRENT_USER" | tr '[:upper:]' '[:lower:]')
# When the OS username is the shared lab account, generate a random GUID on
# first run and persist it so every VM gets a unique user (synthetic identity). For other usernames, just use the OS username.
# This a workaround to get distinct users for each VM when the shared "LabUser" account is used
if [[ "$CURRENT_USER_LOWER" == "labuser" ]]; then
    ID_FILE="${HOME}/.lab502-user-id"
    if [[ -r "$ID_FILE" ]]; then
        USER_INFO=$(cat "$ID_FILE")
    else
        USER_INFO=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || od -x /dev/urandom | head -1 | awk '{print $2$3"-"$4$5"-"$6$7"-"$8$9}')
        printf '%s' "$USER_INFO" > "$ID_FILE"
    fi
else
    USER_INFO="$CURRENT_USER"
fi

ENCODED_SID=$(jq -rn --arg v "$SESSION_ID" '$v|@uri')
ENCODED_USER=$(jq -rn --arg v "$USER_INFO" '$v|@uri')

COMMUNITY_HUB_BASE_URL="${LAB502_DASHBOARD_URL:-${DASHBOARD_URL:-https://bld26lab502.azurewebsites.net}}"
curl -s -X POST "${COMMUNITY_HUB_BASE_URL}/api/event/session_start?session_id=${ENCODED_SID}&user_info=${ENCODED_USER}" \
    --max-time 5 \
    -o /dev/null 2>/dev/null || true

echo '{}'
