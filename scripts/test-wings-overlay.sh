#!/bin/sh
set -eu

IMAGE_TAG="${IMAGE_TAG:-kurau-wav:v2.11.1-kurau.6-wings-overlay}"
CONTAINER_NAME="${CONTAINER_NAME:-kurau-wav-wings-overlay-test-$(date +%Y%m%d%H%M%S)}"
TMP_HOME="$(mktemp -d)"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  rm -rf "$TMP_HOME"
}
trap cleanup EXIT INT TERM

docker build -t "$IMAGE_TAG" .

docker run -d \
  --name "$CONTAINER_NAME" \
  --mount "type=bind,src=$TMP_HOME,dst=/home/container" \
  --env STARTUP='node /opt/kurau/src/index.js' \
  --env TOKEN='dummy' \
  --env LAVALINK_HOST='127.0.0.1' \
  --env LAVALINK_PORT='30002' \
  --env LAVALINK_PASSWORD='dummy-password' \
  --env DEFAULT_LANGUAGE='es' \
  --env BRAND_PROFILE='kurau' \
  --env KURAU_PERSONALITY_ENABLED='true' \
  --env KURAU_VARIANTS_ENABLED='true' \
  --env KURAU_PUBLIC_EVENT_MESSAGES='false' \
  --env KURAU_PRESENCE_ROTATION='true' \
  --env KURAU_SARCASM_LEVEL='medium' \
  --env SPOTIFY_ENABLED='false' \
  --env DEFAULT_VOLUME='80' \
  --env AUTOPLAY_DEFAULT='false' \
  --env DEFAULT_SEARCH_PLATFORM='ytmsearch' \
  --memory 256m \
  --cpus 1 \
  --pids-limit 128 \
  --network bridge \
  "$IMAGE_TAG" >/dev/null

docker wait "$CONTAINER_NAME" >/dev/null || true
LOGS="$(docker logs "$CONTAINER_NAME" 2>&1 || true)"

printf '%s\n' "$LOGS"

echo "$LOGS" | grep -q ':/home/container\$ node /opt/kurau/src/index.js'
echo "$LOGS" | grep -q 'Using local Lavalink server'
echo "$LOGS" | grep -q 'TokenInvalid'

if echo "$LOGS" | grep -q 'Cannot find module'; then
  echo "Unexpected module resolution failure" >&2
  exit 1
fi

echo "kurau Wings overlay Docker test passed"
