# Release Checklist

## Repository

- Confirm `package.json` version is `2.11.1-kurau.5`.
- Confirm `package-lock.json` root package version matches.
- Confirm `CHANGELOG.md` has a `v2.11.1-kurau.5` entry.
- Confirm no real secrets are committed.
- Confirm upstream base is documented as BeatDock `v2.11.1`.

## Local Validation

```bash
npm ci
npm run validate
npm test
find src scripts -name '*.js' -exec node --check {} +
npm audit --omit=dev --audit-level=high
```

## Docker

```bash
docker build -t kurau-wav:v2.11.1-kurau.5 .
docker inspect kurau-wav:v2.11.1-kurau.5 --format '{{.Config.User}} {{.Config.WorkingDir}} {{json .Config.Entrypoint}} {{json .Config.Cmd}}'
```

Expected:

```text
container /home/container ["/sbin/tini","--","/entrypoint.sh"] ["node","src/index.js"]
```

## GitHub Actions

- Confirm repository Actions are enabled.
- Confirm package write permissions are available for `GITHUB_TOKEN`.
- Confirm branch protection requires CI before merging.
- Run `kurau.wav CI` on PR.
- Run `Security Scan` on PR or main.
- Do not expose publish secrets to untrusted PR code.

## GHCR Publication

- Run `Publish kurau.wav Docker Image` manually.
- Enter the exact input:

```text
publish
```

- Confirm pushed tag:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

- Record the immutable digest:

```bash
docker buildx imagetools inspect ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

## Pelican Egg

- Import `pelican/egg-kurau-wav.json`.
- Confirm image:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

- Prefer the immutable digest after publication:

```text
ghcr.io/pipesick/kurau-wav@sha256:DIGEST
```

## Pelican Variables

- `TOKEN`
- `LAVALINK_HOST`
- `LAVALINK_PORT=30002`
- `LAVALINK_PASSWORD`
- `DEFAULT_LANGUAGE=es`
- `BRAND_PROFILE=kurau`
- `KURAU_PERSONALITY_ENABLED=true`
- `KURAU_VARIANTS_ENABLED=true`
- `KURAU_PUBLIC_EVENT_MESSAGES=false`
- `KURAU_PRESENCE_ROTATION=true`
- `KURAU_THEME_COLOR=#B45CFF`
- `KURAU_SARCASM_LEVEL=medium`
- `KURAU_EVENT_COOLDOWN_SECONDS=300`
- `KURAU_PRESENCE_INTERVAL_SECONDS=900`

## E2E Validation

- Start only one bot instance per Discord token.
- Verify Discord login.
- Verify Lavalink connection.
- Verify slash commands.
- Test `/play`.
- Test `/search` and select menu.
- Test player buttons.
- Test `/queue`, `/skip`, `/pause`, `/autoplay`.
- Test Spotify link if enabled.
- Test empty voice channel cleanup.
- Test Pelican stop/restart.

## Rollback

- Keep previous image tag or digest.
- Keep previous Pelican variable backup.
- Stop failed server before starting rollback.
- Restore previous image.
- Restore previous variables.
- Start server.
- Verify Discord and Lavalink connections.

## Future Updates

- Let `upstream-watch.yml` create candidate PRs.
- Review conflict issues manually.
- Never publish from a conflicted upstream branch.
- Bump kurau version before publishing.
