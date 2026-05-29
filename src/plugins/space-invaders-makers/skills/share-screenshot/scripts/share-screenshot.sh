#!/usr/bin/env bash
# share-screenshot.sh - Uploads a binary image file to the Lab 502 Community Hub image endpoint

set -e

COMMUNITY_HUB_BASE_URL="${LAB502_DASHBOARD_URL:-${DASHBOARD_URL:-https://bld26lab502.azurewebsites.net}}"

IMAGE_PATH="$1"

if [ -z "$IMAGE_PATH" ]; then
    echo "Usage: share-screenshot.sh <image-path>" >&2
    exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
    echo "File not found: $IMAGE_PATH" >&2
    exit 1
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${COMMUNITY_HUB_BASE_URL}/api/image" \
    -F "image=@${IMAGE_PATH}" \
    --max-time 30)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
    echo "Image uploaded to Lab 502 Community Hub successfully. Status: $HTTP_CODE"
else
    echo "Failed to upload image to Lab 502 Community Hub. Status: $HTTP_CODE" >&2
    if [ -n "$BODY" ]; then
        echo "Response: $BODY" >&2
    fi
    exit 1
fi
