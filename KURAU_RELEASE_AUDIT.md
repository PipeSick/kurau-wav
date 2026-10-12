# kurau.wav Release Audit

Candidate: `v2.11.1-kurau.3`  
Base upstream: BeatDock `v2.11.1`  
Date: 2026-10-11

## Implementado

- Version bump from `2.11.1-kurau.2` to `2.11.1-kurau.3`.
- Official `KURAU_PERSONALITY_SPEC.md` v1.0 catalog integrated literally in `src/brand/kurau.persona.json`.
- Tone-weighted personality selection implemented at Natural 40 %, Sarcastic 30 %, Foul 20 %, Tender 10 %.
- Per-guild temporary context state implemented for skip streak, autoplay toggle spam, session duration, and long-session farewell.
- Tender cooldown implemented per guild.
- Two-hour session reaction integrated into the existing player embed.
- Lavalink unavailable messages now append useful technical guidance without secrets.
- Sensitive Pelican variables are hidden from user view in the egg.
- Docker image now uses a digest-pinned Node Alpine base, non-root `container` user, `/home/container`, `tini`, and a Wings-compatible entrypoint.
- Pelican egg updated for GHCR candidate distribution and PipeSick Lavalink reference host/port.
- Upstream watch corrected to fetch tags into `refs/tags/upstream/*` and merge valid tag refs.
- Upstream watch made idempotent for refreshed branches, existing PRs, and existing conflict issues.
- Docker publish workflow now publishes `ghcr.io/pipesick/kurau-wav:*` and no longer creates releases as a side effect.
- Duplicate generic CI workflow removed; `kurau.wav CI`, security, release, publish, and upstream watch remain separated.
- `.env.example` sanitized so it does not include fake token strings or a default Lavalink password.
- Added presence, command, upstream policy, official personality, and context event regression tests.
- Added `RELEASE_CHECKLIST.md`.
- Updated deployment, update, rollback, testing, changelog, and README docs.

## Problemas Encontrados

- `upstream-watch.yml` attempted `git merge upstream/<tag>`, which is not a valid remote tag ref after `git fetch --tags`.
- Upstream watch could create duplicate PRs/issues or hide conflict state.
- Pelican egg still referenced a local image from `.1`.
- Dockerfile used `/app` and a generic user instead of Pelican/Wings `container` conventions.
- `.env.example` included placeholder token strings and a common Lavalink password example.
- Security workflow had previously been corrected away from `beatdock:latest`; final scan confirmed no active non-test `latest` image refs.
- Documentation still showed the invalid manual merge form `upstream/vX.Y.Z`.
- New command test initially hung because Discord.js internals kept handles alive; the test now exits explicitly after assertions.
- Context cooldown logic initially suppressed the first skip/autoplay reaction when the synthetic clock was near zero; fixed by only applying cooldown after a real previous reaction.
- Tone weighting initially applied per phrase rather than per tone group; fixed to select tone first, then phrase.

## Correcciones Aplicadas

- `Dockerfile`: pinned base digest, Wings-compatible user/workdir/entrypoint.
- `docker/entrypoint.sh`: added startup handling compatible with direct Docker and Wings `STARTUP`.
- `package.json` and `package-lock.json`: updated version and test suite.
- `pelican/egg-kurau-wav.json`: updated image, defaults, installer note, and variable descriptions.
- `.github/workflows/upstream-watch.yml`: valid tag refs, stable tag filter, branch refresh, conflict reports, PR/issue idempotency.
- `.github/workflows/docker-publish.yml`: GHCR `pipesick/kurau-wav` naming, least privilege on merge job, no release creation side effect.
- `.github/workflows/ci.yml`: removed duplicate generic CI.
- `scripts/test-presence.js`: added.
- `scripts/test-commands.js`: added.
- `scripts/upstream-policy.js` and `scripts/test-upstream-policy.js`: added.
- Docs updated across README, deployment, updates, rollback, testing, changelog, and release checklist.
- `KURAU_PERSONALITY_CATALOG.md`: added.
- `src/brand/ContextEventManager.js`: added contextual reactions and per-guild session memory.
- `src/brand/PersonaManager.js`: extended for tone objects, weighted tone choice, tender cooldown, and context messages.

## Probado Localmente

- `npm ci`
- `npm run validate`
- `npm test`
- `find src scripts -name '*.js' -exec node --check {} +`
- JSON parsing for package, locales, brand files, and Pelican egg
- YAML parsing for GitHub workflow files
- `npm audit --omit=dev --audit-level=high`

## Pendiente de CI Real

- GitHub-hosted Docker build.
- GHCR publish workflow.
- Upstream watch against the real GitHub repository.
- Trivy security scan in GitHub Actions.

## Pendiente de Discord/Lavalink E2E

- Bot login.
- Slash command registration.
- `/play`, `/search`, select menu, buttons.
- `/queue`, `/skip`, `/pause`, `/autoplay`.
- Spotify link playback.
- Empty voice channel cleanup.
- Lavalink outage behavior.

## Pendiente de Publicación

- Push repository changes.
- Run manual GHCR publish workflow.
- Record image digest.
- After publication, optionally pin the egg image `ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.3` to the immutable digest.

## Pendiente de Despliegue

- Import egg into Pelican.
- Create a separate test server.
- Configure real secrets in Pelican only.
- Start one bot instance per Discord token.
- Run E2E validation before replacing production BeatDock.

## Estado Docker

Prepared but not locally built in this Codex workspace because Docker is unavailable. Docker build validation is prepared for CI and documented in `TESTING.md`.

## Estado Egg

Static validation passes. The egg remains a candidate because the GHCR owner and digest cannot be known before publication.

## Estado Upstream

Policy and workflow were corrected. Local policy tests cover stable tag selection, prerelease rejection, invalid tag rejection, and newer/current/older comparisons. Real GitHub execution remains pending.
