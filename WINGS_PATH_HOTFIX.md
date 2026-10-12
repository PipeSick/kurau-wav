# kurau.wav Wings path hotfix

Version candidate: `v2.11.1-kurau.6`

## Problem

Pelican Wings mounts the server's persistent filesystem at `/home/container`.
The previous image stored the application code at `/home/container`, so the
mount hid the bundled `src/index.js` and `node_modules` at runtime.

Observed startup failure:

```text
Cannot find module '/home/container/src/index.js'
```

## Fix

- Application code and `node_modules` now live at `/opt/kurau` inside the image.
- `/home/container` is reserved for persistent server files only.
- The default container command is `node /opt/kurau/src/index.js`.
- The Pelican egg startup command is `node /opt/kurau/src/index.js`.
- `dotenv` explicitly reads `/home/container/.env` as an optional fallback while
  Pelican-injected environment variables keep priority.

## Secrets

The egg defines these sensitive variables with empty defaults and restricted
visibility:

- `TOKEN`
- `LAVALINK_PASSWORD`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Configure them in Pelican's startup variable UI, matching the working BeatDock
deployment. Restricted visibility is not encryption and does not replace
administrator-level secret hygiene.

## Docker overlay test

The script `scripts/test-wings-overlay.sh` simulates Wings by mounting an empty
host directory over `/home/container` and starting the bot with the real startup
command plus dummy environment variables.

Expected result with dummy credentials:

- startup logs show `node /opt/kurau/src/index.js`
- logs include `Using local Lavalink server`, proving injected Lavalink
  variables were received without needing `.env`
- startup fails with `TokenInvalid`
- logs do not include `Cannot find module`

This test requires Docker and was not executable on the local Mac where Docker
is not installed.
