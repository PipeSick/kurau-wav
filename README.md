# kurau.wav

kurau.wav is the PipeSick branded distribution of BeatDock `v2.11.1`.

Current candidate: `v2.11.1-kurau.5`.

It keeps the BeatDock playback stack intact and adds:

- centralized branding under `src/brand/`
- Spanish kurau.wav personality messages
- message variants with immediate-repeat protection
- configurable cooldowns for optional public event messages
- violet embed theme color `#B45CFF`
- slow idle presence rotation
- Pelican PLCN_v3 egg for an external Lavalink server
- Docker image prepared for Pelican/Wings conventions
- CI, GHCR publish workflow, and upstream update watch

## Attribution

This distribution is based on [BeatDock](https://github.com/albertgmz/BeatDock), licensed under Apache-2.0. BeatDock credits and license notices are preserved. kurau.wav is a PipeSick customization layer, not a rewrite of the player.

## Runtime

- Node.js `>=22.16.0`
- npm `>=11.4.2`
- Discord bot token
- External Lavalink v4 server
- Optional LavaSrc/Spotify support, unchanged from BeatDock

Configure the Lavalink host, port, password, and Discord token in Pelican variables. Do not commit runtime secrets.

## Local Checks

```bash
npm ci
npm run validate
npm test
find src scripts -name '*.js' -exec node --check {} +
```

## Docker

Local build:

```bash
./scripts/build-local-image.sh
```

Release image shape after publication:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

Do not use `latest` for production-like deployments. After publication, prefer pinning the Pelican egg to the image digest.

## Pelican

Import:

```text
pelican/egg-kurau-wav.json
```

The egg is prepared with:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

After publication, prefer its immutable digest.

## Key Variables

Original BeatDock variables remain supported, including:

- `TOKEN`
- `LAVALINK_HOST`
- `LAVALINK_PORT`
- `LAVALINK_PASSWORD`
- `SPOTIFY_ENABLED`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `DEFAULT_VOLUME`
- `AUTOPLAY_DEFAULT`
- `DEFAULT_SEARCH_PLATFORM`

kurau.wav variables:

- `BRAND_PROFILE=kurau`
- `DEFAULT_LANGUAGE=es`
- `KURAU_PERSONALITY_ENABLED=true`
- `KURAU_VARIANTS_ENABLED=true`
- `KURAU_PUBLIC_EVENT_MESSAGES=false`
- `KURAU_PRESENCE_ROTATION=true`
- `KURAU_THEME_COLOR=#B45CFF`
- `KURAU_SARCASM_LEVEL=medium`
- `KURAU_EVENT_COOLDOWN_SECONDS=300`
- `KURAU_PRESENCE_INTERVAL_SECONDS=900`

## Safety Defaults

- Extra public event messages are disabled by default.
- Player buttons and internal component IDs are unchanged.
- Lavalink, youtube-source, LavaSrc, search, selection, and autoplay algorithms are not replaced.
- Logs remain technical; personality is applied only to user-facing bot messages.

## Docs

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [UPDATES.md](UPDATES.md)
- [ROLLBACK.md](ROLLBACK.md)
- [TESTING.md](TESTING.md)
- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- [KURAU_RELEASE_AUDIT.md](KURAU_RELEASE_AUDIT.md)
- [CHANGELOG.md](CHANGELOG.md)
