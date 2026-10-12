# Updates

kurau.wav is maintained as a small distribution branch over BeatDock.

## Strategy

Use merge-based upstream updates. This preserves visible history from BeatDock and keeps kurau.wav changes reviewable. Rebase is avoided for automation because it rewrites candidate branch history and makes idempotent reruns harder. Patch-only distribution was considered, but current branding touches enough source files that merge PRs are simpler to audit.

Trace every release with:

- upstream BeatDock tag, currently `v2.11.1`
- kurau.wav package version, currently `2.11.1-kurau.3`
- Docker image tag, `ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.3`
- Pelican egg image or digest
- changelog entry

## Automated Upstream Watch

Workflow:

```text
.github/workflows/upstream-watch.yml
```

It:

- fetches upstream tags into `refs/tags/upstream/*`
- filters only stable tags matching `vX.Y.Z`
- ignores prereleases such as `v2.12.0-rc.1`
- verifies the selected tag resolves to a commit
- compares with `BASE_UPSTREAM_TAG`
- refreshes `automation/upstream-vX.Y.Z` idempotently
- merges using `refs/tags/upstream/vX.Y.Z`
- runs validation, tests, and Docker build for clean merges
- opens or updates a PR for human review
- opens or updates an issue for conflicts
- fails the workflow when conflicts require manual review

It does not:

- deploy to production
- publish a stable image automatically
- overwrite production image tags
- resolve all conflicts without human review

## Manual Update

```bash
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream https://github.com/albertgmz/BeatDock.git
git fetch upstream '+refs/tags/*:refs/tags/upstream/*' --prune --force
git rev-parse --verify refs/tags/upstream/vX.Y.Z^{commit}
git checkout -b update/beatdock-vX.Y.Z
git merge --no-ff refs/tags/upstream/vX.Y.Z
npm ci
npm run validate
npm test
docker build -t kurau-wav:vX.Y.Z-kurau.N .
```

Review especially:

- `src/index.js`
- `src/LanguageManager.js`
- `src/brand/`
- `src/utils/PlayerController.js`
- `src/events/interactionCreate.js`
- `src/interactions/searchNavigation.js`
- `src/interactions/filterNavigation.js`
- `package.json`
- `Dockerfile`
- `pelican/egg-kurau-wav.json`
- `.github/workflows/`

## Conflict Resolution

When the upstream workflow reports conflicts:

1. Open the generated issue.
2. Check the conflicting file list.
3. Create a manual branch from current `main`.
4. Merge `refs/tags/upstream/vX.Y.Z`.
5. Resolve conflicts while preserving kurau branding and BeatDock playback behavior.
6. Run the full local test suite.
7. Build Docker locally or wait for CI Docker build.
8. Open a PR for review.

Do not publish an image from a conflicted update branch.

## Versioning

Use immutable version tags:

```text
v2.11.1-kurau.3
v2.12.0-kurau.1
v2.12.1-kurau.1
```

Do not use `latest` for production-like deployments.
