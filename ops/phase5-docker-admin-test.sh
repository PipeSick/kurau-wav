#!/bin/sh
set -eu

BUILD_DIR="${BUILD_DIR:-$(pwd)}"
STAMP="$(date +%Y%m%d%H%M%S)"
IMAGE_TAG="${IMAGE_TAG:-kurau-wav:v2.11.1-kurau.6-wings-smoke-${STAMP}}"
CHECK_CONTAINER="${CHECK_CONTAINER:-kurau-wav-nodecheck-${STAMP}}"
APP_CONTAINER="${APP_CONTAINER:-kurau-wav-dummy-start-${STAMP}}"

echo "BUILD_DIR=${BUILD_DIR}"
echo "IMAGE_TAG=${IMAGE_TAG}"
echo "CHECK_CONTAINER=${CHECK_CONTAINER}"
echo "APP_CONTAINER=${APP_CONTAINER}"

cd "$BUILD_DIR"

echo
echo "== Build image =="
docker build --pull --tag "$IMAGE_TAG" "$BUILD_DIR"

echo
echo "== Smoke run: runtime, filesystem, syntax =="
docker run \
  --name "$CHECK_CONTAINER" \
  --rm \
  --network none \
  --cpus 0.50 \
  --memory 256m \
  --pids-limit 128 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  "$IMAGE_TAG" \
  sh -lc 'id && pwd && node --version && npm --version && test -x /entrypoint.sh && test -f /opt/kurau/src/index.js && test -d /opt/kurau/node_modules && node --check /opt/kurau/src/index.js'

echo
echo "== Wings-style startup with dummy credentials =="
docker run \
  --name "$APP_CONTAINER" \
  --detach \
  --network bridge \
  --cpus 0.50 \
  --memory 512m \
  --pids-limit 128 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --env STARTUP='node /opt/kurau/src/index.js' \
  --env TOKEN='dummy' \
  --env LAVALINK_HOST="${LAVALINK_HOST_FOR_TEST:-127.0.0.1}" \
  --env LAVALINK_PORT="${LAVALINK_PORT_FOR_TEST:-2333}" \
  --env LAVALINK_PASSWORD='dummy' \
  --env DEFAULT_LANGUAGE='es' \
  --env BRAND_PROFILE='kurau' \
  --env KURAU_PERSONALITY_ENABLED='true' \
  --env KURAU_VARIANTS_ENABLED='true' \
  --env KURAU_PUBLIC_EVENT_MESSAGES='false' \
  --env KURAU_PRESENCE_ROTATION='true' \
  --env KURAU_SARCASM_LEVEL='medium' \
  --env KURAU_EVENT_COOLDOWN_SECONDS='900' \
  --env KURAU_PRESENCE_INTERVAL_SECONDS='300' \
  --env SPOTIFY_ENABLED='false' \
  --env DEFAULT_VOLUME='80' \
  --env AUTOPLAY_DEFAULT='false' \
  --env DEFAULT_SEARCH_PLATFORM='ytmsearch' \
  "$IMAGE_TAG"

echo
echo "== Wait for dummy startup to finish =="
set +e
docker wait "$APP_CONTAINER"
WAIT_STATUS="$?"
set -e
echo "docker wait command status: ${WAIT_STATUS}"

echo
echo "== Logs =="
docker logs "$APP_CONTAINER"

echo
echo "== Inspect exit status =="
docker inspect "$APP_CONTAINER" --format 'Name={{.Name}} ExitCode={{.State.ExitCode}} OOMKilled={{.State.OOMKilled}} Error={{.State.Error}}'

echo
echo "Expected for dummy credentials:"
echo "- Logs include ':/home/container$ node /opt/kurau/src/index.js'."
echo "- App reaches startup and fails because TOKEN is dummy."
echo "- ExitCode is non-zero due to dummy Discord authentication."
echo "- There are no missing file/module, permission, entrypoint, or OOM errors."

echo
echo "Cleanup command:"
echo "  IMAGE_TAG='$IMAGE_TAG' APP_CONTAINER='$APP_CONTAINER' CHECK_CONTAINER='$CHECK_CONTAINER' sh '$BUILD_DIR/ops/phase5-docker-cleanup.sh'"
