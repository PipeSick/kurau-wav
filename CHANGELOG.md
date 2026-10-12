# Changelog

## v2.11.1-kurau.5

- Integrated the official `KURAU_PERSONALITY_SPEC.md` v1.0 phrase catalog.
- Added tone-group selection with approximate Natural 40 %, Sarcastic 30 %, Foul 20 %, Tender 10 % distribution.
- Added per-guild tender cooldowns and antirepetition.
- Added per-guild contextual state for skip streaks, autoplay toggle spam, two-hour sessions, and long-session farewells.
- Added approved `voiceLeave` lines through the existing `LEFT_EMPTY` key.
- Added two-hour session note to the player embed instead of sending a new public message.
- Added useful technical guidance alongside Lavalink unavailable errors without exposing secrets.
- Hardened Pelican egg secret visibility for Discord token, Lavalink password, and Spotify client secret.
- Added `KURAU_PERSONALITY_CATALOG.md`.
- Added context event tests and expanded personality regression tests.
- Kept Docker/GHCR/Pelican hardening from `.2`, updated to the `.3` candidate.

## v2.11.1-kurau.2

- Updated package version, local image tag, and docs to the `.2` candidate.
- Changed Docker image to a digest-pinned Node base, non-root `container` user, `/home/container` working directory, `tini`, and a Wings-compatible entrypoint.
- Prepared GHCR release image naming as `ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.2`.
- Updated the Pelican egg from local image mode to GHCR candidate mode with PipeSick Lavalink host/port defaults and no real secrets.
- Fixed upstream watch to fetch tags into `refs/tags/upstream/*` and merge valid tag refs instead of invalid `upstream/vX.Y.Z` paths.
- Made upstream watch idempotent for refreshed branches, existing PRs, and existing conflict issues.
- Removed duplicate CI workflow and kept CI, security, release, publish, and upstream watch responsibilities separated.
- Added regression tests for presence, command modules, command behavior mocks, and upstream stable-tag policy.
- Removed public environment templates and kept secrets in Pelican variables only.
- Updated deployment, update, rollback, testing, release checklist, and audit documentation.

## v2.11.1-kurau.1

- Initial kurau.wav distribution over BeatDock `v2.11.1`.
- Added branding/persona layer, theme color, message variants, cooldowns, locale overlays, presence rotation, Pelican egg, Dockerfile, workflows, and operational docs.
