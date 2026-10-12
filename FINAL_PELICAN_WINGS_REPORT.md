# kurau.wav final Pelican/Wings validation report

Candidate: `v2.11.1-kurau.6`

## Credential model

kurau.wav now matches the working BeatDock deployment model:

- Pelican injects credentials as environment variables.
- `.env` remains an optional fallback only.
- `dotenv` does not override existing Pelican-injected variables.

Sensitive egg variables are present with empty defaults and restricted
visibility:

- `TOKEN`
- `LAVALINK_PASSWORD`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Restricted visibility is not encryption and does not replace administrator
secret hygiene.

## Wings compatibility

The application runtime lives at `/opt/kurau` in the image:

- app code: `/opt/kurau/src/index.js`
- dependencies: `/opt/kurau/node_modules`
- persistent server files: `/home/container`

The Pelican startup command is:

```sh
node /opt/kurau/src/index.js
```

This prevents Wings' `/home/container` mount from hiding the bundled runtime.

## Local validation

Executed successfully:

- `npm run validate`
- `npm test`
- JavaScript syntax checks with `node --check`
- shell syntax checks with `sh -n`
- JSON parsing checks
- GitHub workflow YAML parsing checks

The Docker overlay test could not be executed on the local Mac because Docker is
not installed. `scripts/test-wings-overlay.sh` and
`FINAL_WINGS_DOCKER_COMMANDS.md` are ready for an administrator to run on a host
with Docker access.

## GO / NO-GO

GO for administrator Docker validation of `.6`.

NO-GO for GHCR publication until the Wings overlay Docker test passes with
dummy credentials and no `MODULE_NOT_FOUND`, permission, OOM, or route errors.
