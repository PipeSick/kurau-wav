const assert = require('assert');
const PresenceManager = require('../src/brand/PresenceManager');

function createClient(overrides = {}) {
    const activityCalls = [];
    return {
        activePlayers: new Map(),
        branding: {
            config: {
                presenceRotation: true,
                presenceIntervalSeconds: 60,
            },
            persona: {
                getPresenceIdleMessages: () => ['mezclando ruido bonito', 'vigilando la cola'],
            },
        },
        user: {
            setActivity: (name, options) => activityCalls.push({ name, options }),
        },
        t: (key, ...args) => `${key}${args.length ? `:${args.join(',')}` : ''}`,
        activityCalls,
        ...overrides,
    };
}

const idleClient = createClient();
const idlePresence = new PresenceManager(idleClient);
idlePresence.applyIdlePresence();
idlePresence.applyIdlePresence();
assert.strictEqual(idleClient.activityCalls[0].name, 'mezclando ruido bonito');
assert.strictEqual(idleClient.activityCalls[1].name, 'vigilando la cola');

const activeClient = createClient();
activeClient.activePlayers.set('guild-a', {});
new PresenceManager(activeClient).updateActivePresence();
assert.strictEqual(activeClient.activityCalls[0].name, 'PLAYING_MUSIC_GENERIC');

const multiClient = createClient();
multiClient.activePlayers.set('guild-a', {});
multiClient.activePlayers.set('guild-b', {});
new PresenceManager(multiClient).updateActivePresence();
assert.strictEqual(multiClient.activityCalls[0].name, 'PLAYING_MUSIC_IN_SERVERS:2');

const disabledClient = createClient({
    branding: {
        config: {
            presenceRotation: false,
            presenceIntervalSeconds: 60,
        },
        persona: {
            getPresenceIdleMessages: () => ['no deberia sonar'],
        },
    },
});
const disabledPresence = new PresenceManager(disabledClient);
disabledPresence.start();
assert.strictEqual(disabledPresence.timer, null);
assert.strictEqual(disabledClient.activityCalls.length, 0);

const timerClient = createClient();
const timerPresence = new PresenceManager(timerClient);
timerPresence.start();
assert.ok(timerPresence.timer, 'presence start should create a timer when enabled');
timerPresence.stop();
assert.strictEqual(timerPresence.timer, null, 'presence stop should clear timer');

console.log('kurau presence tests passed');
