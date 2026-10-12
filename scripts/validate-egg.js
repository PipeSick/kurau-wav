const fs = require('fs');
const path = require('path');

const eggPath = path.join(__dirname, '..', 'pelican', 'egg-kurau-wav.json');
const egg = JSON.parse(fs.readFileSync(eggPath, 'utf8'));
const errors = [];

for (const field of ['meta', 'name', 'uuid', 'docker_images', 'startup_commands', 'config', 'scripts', 'variables']) {
    if (!(field in egg)) errors.push(`missing ${field}`);
}

if (egg.meta?.version !== 'PLCN_v3') errors.push('meta.version must be PLCN_v3');
for (const [name, image] of Object.entries(egg.docker_images || {})) {
    const isLocal = image.startsWith('~');
    const isDigestPinned = /^ghcr\.io\/[^/]+\/kurau-wav@sha256:[a-f0-9]{64}$/.test(image);
    const isVersionTaggedGhcr = /^ghcr\.io\/[^/]+\/kurau-wav:v\d+\.\d+\.\d+-kurau\.\d+$/.test(image);
    if (!isLocal && !isDigestPinned && !isVersionTaggedGhcr) {
        errors.push(`remote image ${name} must use GHCR version tag or immutable digest`);
    }
    if (image.includes(':latest')) errors.push(`image ${name} must not use latest`);
}

for (const key of ['files', 'startup', 'logs']) {
    try {
        JSON.parse(egg.config[key]);
    } catch (error) {
        errors.push(`config.${key} is not valid JSON: ${error.message}`);
    }
}

const seen = new Set();
for (const variable of egg.variables || []) {
    if (!variable.env_variable) errors.push(`variable missing env_variable: ${variable.name}`);
    if (seen.has(variable.env_variable)) errors.push(`duplicate variable ${variable.env_variable}`);
    seen.add(variable.env_variable);
    if (!Array.isArray(variable.rules) || variable.rules.length === 0) {
        errors.push(`variable ${variable.env_variable} missing rules`);
    }
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}

console.log('kurau Pelican egg validation passed');
