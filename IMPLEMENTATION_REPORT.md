# Implementation Report

## Implemented

- Source distribution copied from BeatDock `v2.11.1`.
- `src/brand/BrandingManager.js`
- `src/brand/PersonaManager.js`
- `src/brand/PresenceManager.js`
- `src/brand/config.js`
- `src/brand/kurau.theme.json`
- `src/brand/kurau.persona.json`
- `src/brand/locales/es.json`
- branded embed helper in `src/utils/brandEmbed.js`
- `LanguageManager` support for branding overlays, variants, placeholders, and fallback
- kurau.wav visual color `#B45CFF`
- kurau.wav personality messages
- configurable extra public event messages, disabled by default
- idle presence rotation with cleanup
- Pelican test egg
- local image build script
- validation scripts
- GitHub Actions for CI, upstream tracking, and controlled publishing

## Preserved

- Lavalink external architecture
- youtube-source/LavaSrc assumptions
- BeatDock search and playback algorithms
- `/search` interactive flow
- player button custom IDs
- queue controls
- autoplay algorithm
- non-root Docker runtime inherited from upstream Dockerfile

## Locally Tested

Run locally:

```bash
npm run validate
npm run test:branding
```

Also run where dependencies are installed:

```bash
npm test
```

## Not Tested Here

- Docker build, because Docker was not available in the Codex workspace.
- Discord login.
- Slash command registration.
- Real Lavalink playback.
- Pelican import/start/stop.
- Spotify playback.

## Upstream Automation

`.github/workflows/upstream-watch.yml` detects newer BeatDock tags, attempts a merge, runs validation/tests/build, then opens a PR or issue. It never deploys or promotes production images automatically.

## Publishing

`.github/workflows/docker-publish.yml` is manual-only and requires typing `publish`. It publishes versioned tags only.

## Manual Review Required

Human review is required when upstream changes:

- player lifecycle
- command handling
- search interactions
- `LanguageManager`
- Dockerfile/runtime
- package dependencies

## Pending Real Integration

- Import `pelican/egg-kurau-wav.json` in a non-production Pelican environment.
- Build `kurau-wav:v2.11.1-kurau.5` on Wings.
- Test Discord/Lavalink workflows.
- Approve or reject production rollout.
