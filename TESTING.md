# Testing

## Local Static Tests

```bash
npm ci
npm run validate
npm test
find src scripts -name '*.js' -exec node --check {} +
npm audit --omit=dev --audit-level=high
```

Coverage currently includes:

- branding config validation
- theme JSON validation
- persona JSON validation
- locale override loading
- placeholders
- variants
- immediate-repeat protection
- public event cooldowns
- sarcasm level behavior
- presence rotation and timer cleanup
- command module exports for `/play`, `/search`, `/queue`, `/skip`, `/pause`, `/autoplay`
- command mock regressions for pause/resume, autoplay, skip, missing voice channel
- Pelican egg JSON sanity
- stable upstream tag selection policy
- upstream autoplay tests
- upstream playback resilience tests

These are local unit/regression tests. They are not Discord or Lavalink E2E tests.

## Workflow Syntax

```bash
find .github/workflows -name '*.yml' -exec ruby -e 'require "yaml"; ARGV.each { |f| YAML.load_file(f); puts "ok #{f}" }' {} +
```

## Docker Build Test

Requires Docker:

```bash
docker build -t kurau-wav:v2.11.1-kurau.5 .
docker inspect kurau-wav:v2.11.1-kurau.5 --format '{{.Config.User}} {{.Config.WorkingDir}} {{json .Config.Entrypoint}} {{json .Config.Cmd}}'
```

Expected image metadata:

```text
container /home/container ["/sbin/tini","--","/entrypoint.sh"] ["node","src/index.js"]
```

Docker was not available in the Codex workspace, so build execution remains pending for CI or a Docker-capable host.

## Real Integration Tests

These require Discord, Pelican/Wings, and Lavalink:

- bot login
- slash command registration
- `/play`
- `/search`
- select menu track selection
- player buttons
- `/queue`
- `/skip`
- `/pause`
- `/autoplay`
- Spotify links
- voice channel empty cleanup
- Lavalink outage handling
- Pelican restart/stop behavior

Do not mark these as verified until tested in the homelab.
