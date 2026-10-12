# Deployment

This candidate is prepared for integration testing and later publication. This agent did not deploy, publish, restart, or modify production services.

## 1. Prepare Repository

Commit the `v2.11.1-kurau.3` source to the real GitHub repository:

```text
PipeSick/kurau-wav
```

The release image name is:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.3
```

## 2. Run Local Checks

```bash
npm ci
npm run validate
npm test
find src scripts -name '*.js' -exec node --check {} +
npm audit --omit=dev --audit-level=high
```

## 3. Build Docker Image

On a Docker-capable machine:

```bash
docker build -t kurau-wav:v2.11.1-kurau.3 .
docker inspect kurau-wav:v2.11.1-kurau.3 --format '{{.Config.User}} {{.Config.WorkingDir}} {{json .Config.Entrypoint}} {{json .Config.Cmd}}'
```

Expected:

```text
container /home/container ["/sbin/tini","--","/entrypoint.sh"] ["node","src/index.js"]
```

## 4. Publish to GHCR

Use the manual workflow:

```text
.github/workflows/docker-publish.yml
```

Run it with input:

```text
publish
```

The workflow publishes versioned tags only. It does not publish `latest`.

## 5. Prepare Pelican Egg

Import:

```text
pelican/egg-kurau-wav.json
```

The egg currently points at:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.3
```

After publication, prefer pinning it to the immutable digest:

```text
ghcr.io/pipesick/kurau-wav@sha256:DIGEST
```

## 6. Required Pelican Variables

- `TOKEN`
- `LAVALINK_HOST=192.168.3.131`
- `LAVALINK_PORT=30002`
- `LAVALINK_PASSWORD`
- `DEFAULT_LANGUAGE=es`
- `BRAND_PROFILE=kurau`

Recommended kurau defaults:

- `KURAU_PERSONALITY_ENABLED=true`
- `KURAU_VARIANTS_ENABLED=true`
- `KURAU_PUBLIC_EVENT_MESSAGES=false`
- `KURAU_PRESENCE_ROTATION=true`
- `KURAU_THEME_COLOR=#B45CFF`
- `KURAU_SARCASM_LEVEL=medium`
- `KURAU_EVENT_COOLDOWN_SECONDS=300`
- `KURAU_PRESENCE_INTERVAL_SECONDS=900`

## 7. E2E Validation

Test in a separate Pelican server before production:

- Discord login
- slash command registration
- `/play`
- `/search`
- result selection
- player buttons
- `/queue`
- `/skip`
- `/pause`
- `/autoplay`
- Spotify links
- empty voice channel disconnect
- Lavalink unavailable behavior
- stop/restart behavior in Pelican

Do not run two bot instances with the same Discord token at the same time.
