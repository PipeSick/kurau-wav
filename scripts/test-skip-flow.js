const assert = require('assert');
const skipCommand = require('../src/commands/skip');
const interactionCreate = require('../src/events/interactionCreate');
const { ContextEventManager, SKIP_STREAK_LIMIT } = require('../src/brand/ContextEventManager');

function createContextEvents() {
    let now = 10_000;
    const manager = new ContextEventManager({
        contextMessage: (key) => key === 'skipStreak' ? 'CTX_SKIP_STREAK' : null,
    }, { now: () => now });
    manager.advance = (ms) => {
        now += ms;
    };
    return manager;
}

function createPlayer() {
    return {
        voiceChannelId: 'voice-1',
        repeatMode: 'off',
        queue: {
            tracks: [{ id: 'next-1' }, { id: 'next-2' }],
            current: { id: 'current' },
        },
        skipCalls: 0,
        async skip() {
            this.skipCalls += 1;
        },
    };
}

function createInteraction(player, contextEvents) {
    const replies = [];
    const client = {
        defaultLanguage: 'es',
        autoplayEnabled: new Map(),
        contextEvents,
        languageManager: {
            get: (_lang, key) => key === 'SONG_SKIPPED' ? 'SKIPPED' : key,
        },
        lavalink: {
            getPlayer: () => player,
        },
        lavalinkConnectionManager: {
            isAvailable: () => true,
        },
    };

    return {
        client,
        guild: { id: 'guild-1', name: 'Guild' },
        channel: { id: 'channel-1', name: 'music' },
        user: { tag: 'tester#0001' },
        member: { voice: { channel: { id: 'voice-1' } } },
        async reply(payload) {
            replies.push(payload);
            return payload;
        },
        replies,
    };
}

async function runSlashSkipFiveTimes() {
    const contextEvents = createContextEvents();
    const player = createPlayer();
    const interaction = createInteraction(player, contextEvents);

    for (let index = 0; index < SKIP_STREAK_LIMIT; index += 1) {
        await skipCommand.execute(interaction);
    }

    assert.strictEqual(player.skipCalls, SKIP_STREAK_LIMIT);
    assert.strictEqual(interaction.replies.filter((reply) => reply.content.includes('CTX_SKIP_STREAK')).length, 1);
    assert.strictEqual(interaction.replies.at(-1).content, 'SKIPPED\nCTX_SKIP_STREAK');
}

async function runButtonSkipFiveTimes() {
    const contextEvents = createContextEvents();
    const player = createPlayer();
    const interaction = createInteraction(player, contextEvents);

    for (let index = 0; index < SKIP_STREAK_LIMIT; index += 1) {
        await interactionCreate.handlePlayerInteraction(interaction, 'skip');
    }

    assert.strictEqual(player.skipCalls, SKIP_STREAK_LIMIT);
    assert.strictEqual(interaction.replies.filter((reply) => reply.content.includes('CTX_SKIP_STREAK')).length, 1);
    assert.strictEqual(interaction.replies.at(-1).content, 'SKIPPED\nCTX_SKIP_STREAK');
}

async function naturalTrackEndResetsTheStreak() {
    const contextEvents = createContextEvents();
    const player = createPlayer();
    const interaction = createInteraction(player, contextEvents);

    for (let index = 0; index < SKIP_STREAK_LIMIT - 1; index += 1) {
        await skipCommand.execute(interaction);
    }

    contextEvents.recordTrackFinished('guild-1');
    contextEvents.recordTrackStarted('guild-1');

    await skipCommand.execute(interaction);
    assert.strictEqual(interaction.replies.some((reply) => reply.content.includes('CTX_SKIP_STREAK')), false);

    for (let index = 0; index < SKIP_STREAK_LIMIT - 1; index += 1) {
        await skipCommand.execute(interaction);
    }
    assert.strictEqual(interaction.replies.filter((reply) => reply.content.includes('CTX_SKIP_STREAK')).length, 1);
}

(async () => {
    await runSlashSkipFiveTimes();
    await runButtonSkipFiveTimes();
    await naturalTrackEndResetsTheStreak();
    console.log('kurau skip flow tests passed');
    process.exit(0);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
