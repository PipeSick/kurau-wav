const assert = require('assert');
const fs = require('fs');

const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
const entrypoint = fs.readFileSync('docker/entrypoint.sh', 'utf8');
const index = fs.readFileSync('src/index.js', 'utf8');
const egg = JSON.parse(fs.readFileSync('pelican/egg-kurau-wav.json', 'utf8'));
const nodeImage = 'node:22.16.0-alpine3.22@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e';

assert.strictEqual((dockerfile.match(new RegExp(`FROM ${nodeImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')) || []).length, 2);
assert.match(dockerfile, /WORKDIR \/opt\/kurau/);
assert.match(dockerfile, /USER container/);
assert.match(dockerfile, /ENTRYPOINT \["\/sbin\/tini", "--", "\/entrypoint\.sh"\]/);
assert.match(dockerfile, /CMD \["node", "\/opt\/kurau\/src\/index\.js"\]/);

assert.match(entrypoint, /if \[ -n "\$\{STARTUP:-\}" \]/);
assert.match(entrypoint, /exec sh -lc "\$MODIFIED_STARTUP"/);
assert.match(entrypoint, /if \[ "\$#" -gt 0 \]/);
assert.match(entrypoint, /exec "\$@"/);
assert.match(entrypoint, /cd \/opt\/kurau/);
assert.match(entrypoint, /exec node \/opt\/kurau\/src\/index\.js/);
assert.ok(index.includes("require('dotenv').config({ path: process.env.KURAU_ENV_FILE || '/home/container/.env' });"));

assert.strictEqual(egg.startup_commands.Default, 'node /opt/kurau/src/index.js');
assert.ok(Object.values(egg.docker_images).some((image) => image.includes('ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.6')));

const sensitive = new Map(egg.variables.map((variable) => [variable.env_variable, variable]));
for (const env of ['TOKEN', 'LAVALINK_PASSWORD', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET']) {
    assert.strictEqual(sensitive.has(env), true, `${env} must be present for Pelican injection`);
    assert.strictEqual(sensitive.get(env).default_value, '');
    assert.strictEqual(sensitive.get(env).user_viewable, false);
}

assert.strictEqual(sensitive.get('LAVALINK_HOST').default_value, '');
assert.strictEqual(sensitive.get('LAVALINK_PORT').default_value, '2333');

console.log('kurau Pelican startup tests passed');
