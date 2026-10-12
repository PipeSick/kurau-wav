const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const dotenv = require('dotenv');

const envFile = path.join(os.tmpdir(), `kurau-env-priority-${process.pid}.env`);

try {
    fs.writeFileSync(envFile, [
        'TOKEN=file',
        'LAVALINK_PASSWORD=file',
        '',
    ].join('\n'));

    process.env.TOKEN = 'env';
    dotenv.config({ path: envFile });
    assert.strictEqual(process.env.TOKEN, 'env');

    delete process.env.LAVALINK_PASSWORD;
    dotenv.config({ path: envFile });
    assert.strictEqual(process.env.LAVALINK_PASSWORD, 'file');
} finally {
    fs.rmSync(envFile, { force: true });
    delete process.env.TOKEN;
    delete process.env.LAVALINK_PASSWORD;
}

console.log('kurau environment priority tests passed');
