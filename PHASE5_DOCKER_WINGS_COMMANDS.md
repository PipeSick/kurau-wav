# Docker Wings Smoke Test

This document describes a safe local Docker smoke test for the kurau.wav image. It is intentionally generic and does not include private infrastructure details.

## Goal

Validate that the image can start with a Wings-style persistent filesystem mount over `/home/container` while the application runtime remains available at `/opt/kurau`.

## Requirements

- Docker access on a disposable test host.
- A local checkout of this repository.
- No real Discord, Spotify, or Lavalink credentials.

## Run

```sh
npm run test:wings-overlay
```

The script builds a temporary local image, mounts a temporary empty directory at `/home/container`, injects dummy environment variables, and starts the real startup command:

```sh
node /opt/kurau/src/index.js
```

## Expected Result

- Logs show `node /opt/kurau/src/index.js`.
- Logs show `Using local Lavalink server`.
- Logs end with `TokenInvalid` because the Discord token is dummy.
- Logs do not contain `Cannot find module`.
- The container is not OOM-killed.

## Cleanup

The script removes only the temporary container and host directory it creates. If you override `IMAGE_TAG`, remove that temporary image after inspection.
