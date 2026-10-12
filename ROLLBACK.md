# Rollback

Rollback is image-based and configuration-based. kurau.wav does not add a database or persistent queue state.

## Pelican Rollback

1. Stop the failed kurau.wav server.
2. Confirm the production BeatDock server is not using the same Discord token at the same time.
3. Change the Pelican Docker image back to the previous known-good tag or digest.
4. Restore the previous Pelican startup variables from backup.
5. Start the server.
6. Watch logs for Discord login and Lavalink connection.
7. Verify `/play`, `/search`, `/queue`, `/skip`, `/pause`, and `/autoplay`.
8. Test one known-good YouTube query and one Spotify link if Spotify is enabled.

Prefer digest rollback:

```text
ghcr.io/pipesick/kurau-wav@sha256:PREVIOUS_DIGEST
```

Version tag rollback is acceptable only when tags are immutable:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.1
```

## Configuration Backup

Before switching images, record:

- Docker image or digest
- `TOKEN` owner/application, without printing the token
- `LAVALINK_HOST`
- `LAVALINK_PORT`
- Lavalink password presence, without printing the value
- `DEFAULT_LANGUAGE`
- all `KURAU_*` variables
- Spotify enabled state

Do not delete backups automatically.

## Git Rollback

```bash
git revert <bad-commit>
npm ci
npm run validate
npm test
docker build -t kurau-wav:v2.11.1-kurau.rollback .
```

Publish a new versioned fix image instead of moving an old tag.

## Upstream Update Rollback

If an upstream update PR fails:

- do not merge it
- keep the previous image in Pelican
- inspect the generated conflict report
- repair on a separate branch
- rerun tests before publishing
