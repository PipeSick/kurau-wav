const assert = require('assert');
const path = require('path');

const commandNames = ['play', 'search', 'queue', 'skip', 'pause', 'autoplay'];

for (const name of commandNames) {
    const command = require(path.join('..', 'src', 'commands', `${name}.js`));
    const json = command.data.toJSON();
    assert.strictEqual(json.name, name);
    assert.ok(json.description && json.description.length > 0, `${name} should have a description`);
    assert.strictEqual(typeof command.execute, 'function', `${name} should export execute()`);
}

function baseInteraction(player) {
    const replies = [];
    return {
        client: {
            defaultLanguage: 'es',
            autoplayEnabled: new Map(),
            t: (key) => key,
            languageManager: {
                get: (_lang, key) => key,
            },
            lavalink: {
                getPlayer: () => player,
            },
            lavalinkConnectionManager: {
                isAvailable: () => true,
            },
        },
        guild: { id: 'guild-1', name: 'Guild' },
        channel: { id: 'channel-1', name: 'music' },
        user: { tag: 'tester#0001' },
        member: { voice: { channel: { id: 'voice-1' } } },
        reply: async (payload) => {
            replies.push(payload);
            return payload;
        },
        replies,
    };
}

(async () => {
    const pause = require('../src/commands/pause');
    const pausedPlayer = {
        paused: true,
        voiceChannelId: 'voice-1',
        resumeCalled: false,
        resume() {
            this.resumeCalled = true;
        },
    };
    const pauseInteraction = baseInteraction(pausedPlayer);
    await pause.execute(pauseInteraction);
    assert.strictEqual(pausedPlayer.resumeCalled, true);
    assert.strictEqual(pauseInteraction.replies[0].content, 'RESUMED');

    const activePlayer = {
        paused: false,
        voiceChannelId: 'voice-1',
        pauseCalled: false,
        pause() {
            this.pauseCalled = true;
        },
    };
    const activeInteraction = baseInteraction(activePlayer);
    await pause.execute(activeInteraction);
    assert.strictEqual(activePlayer.pauseCalled, true);
    assert.strictEqual(activeInteraction.replies[0].content, 'PAUSED');

    const autoplay = require('../src/commands/autoplay');
    const autoplayPlayer = {
        voiceChannelId: 'voice-1',
        repeatMode: 'track',
        setRepeatModeCalledWith: null,
        setRepeatMode(mode) {
            this.setRepeatModeCalledWith = mode;
        },
    };
    const autoplayInteraction = baseInteraction(autoplayPlayer);
    await autoplay.execute(autoplayInteraction);
    assert.strictEqual(autoplayInteraction.client.autoplayEnabled.get('guild-1'), true);
    assert.strictEqual(autoplayPlayer.setRepeatModeCalledWith, 'off');
    assert.strictEqual(autoplayInteraction.replies[0].content, 'AUTOPLAY_ENABLED');

    const skip = require('../src/commands/skip');
    const skipPlayer = {
        voiceChannelId: 'voice-1',
        queue: { tracks: [{ info: { title: 'next' } }] },
        skipped: false,
        async skip() {
            this.skipped = true;
        },
    };
    const skipInteraction = baseInteraction(skipPlayer);
    await skip.execute(skipInteraction);
    assert.strictEqual(skipPlayer.skipped, true);
    assert.strictEqual(skipInteraction.replies[0].content, 'SONG_SKIPPED');

    const play = require('../src/commands/play');
    const playInteraction = {
        ...baseInteraction(null),
        member: { voice: { channel: null } },
        options: {
            getString: () => 'test',
            getBoolean: () => false,
        },
    };
    await play.execute(playInteraction);
    assert.strictEqual(playInteraction.replies[0].content, 'NOT_IN_VOICE');

    const search = require('../src/commands/search');
    const searchInteraction = {
        ...baseInteraction(null),
        member: { voice: { channel: null } },
        options: {
            getString: () => 'test',
        },
    };
    await search.execute(searchInteraction);
    assert.strictEqual(searchInteraction.replies[0].content, 'NOT_IN_VOICE');

    console.log('kurau command regression tests passed');
    process.exit(0);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
