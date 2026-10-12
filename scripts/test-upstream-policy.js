const assert = require('assert');
const {
    compareStableTags,
    isStableTag,
    latestStableTag,
    shouldPrepareUpdate,
} = require('./upstream-policy');

assert.strictEqual(isStableTag('v2.11.1'), true);
assert.strictEqual(isStableTag('2.11.1'), false);
assert.strictEqual(isStableTag('v2.12.0-beta.1'), false);
assert.strictEqual(isStableTag('v2.12'), false);

assert.ok(compareStableTags('v2.12.0', 'v2.11.9') > 0);
assert.ok(compareStableTags('v10.0.0', 'v2.99.99') > 0);
assert.strictEqual(compareStableTags('v2.11.1', 'v2.11.1'), 0);

assert.strictEqual(latestStableTag(['v2.11.1', 'v2.12.0-beta.1', 'v2.10.9']), 'v2.11.1');
assert.strictEqual(latestStableTag(['foo', 'v3.0.0', 'v2.99.99']), 'v3.0.0');
assert.strictEqual(latestStableTag(['v3.0.0-rc.1', 'main']), null);

assert.strictEqual(shouldPrepareUpdate('v2.11.1', 'v2.11.1'), false);
assert.strictEqual(shouldPrepareUpdate('v2.11.1', 'v2.12.0'), true);
assert.strictEqual(shouldPrepareUpdate('v2.11.1', 'v2.12.0-beta.1'), false);
assert.strictEqual(shouldPrepareUpdate('v2.11.1', 'v2.10.0'), false);

console.log('kurau upstream policy tests passed');
