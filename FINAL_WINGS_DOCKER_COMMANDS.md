# kurau.wav v2.11.1-kurau.6 final Wings Docker validation

These commands validate the `.6` candidate before publishing. They do not use
real credentials, do not publish ports, do not mount production volumes, and do
not mount the Docker socket.

Run from the `kurau-wav` repository root on a host with Docker access.

## Build and run

```sh
set -eu

STAMP="$(date +%Y%m%d%H%M%S)"
IMAGE_TAG="kurau-wav:v2.11.1-kurau.6-wings-overlay-${STAMP}"
CONTAINER_NAME="kurau-wav-wings-overlay-test-${STAMP}"
TMP_HOME="$(mktemp -d)"

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
  "$IMAGE_TAG"

docker wait "$CONTAINER_NAME" || true
docker logs "$CONTAINER_NAME"
docker inspect "$CONTAINER_NAME" \
  --format 'Name={{.Name}} ExitCode={{.State.ExitCode}} OOMKilled={{.State.OOMKilled}} Error={{.State.Error}}'
```

## Expected result

- logs include `:/home/container$ node /opt/kurau/src/index.js`
- logs include `Using local Lavalink server`
- logs include `TokenInvalid`
- logs do not include `Cannot find module`
- `OOMKilled=false`
- non-zero exit is acceptable because `TOKEN=dummy`

## Cleanup

```sh
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker rmi "$IMAGE_TAG" >/dev/null 2>&1 || true
rm -rf "$TMP_HOME"
```

Only the container, image, and temporary directory named above are removed.
