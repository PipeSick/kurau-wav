const assert = require('assert');
const path = require('path');
const BrandingManager = require('../src/brand/BrandingManager');
const { ContextEventManager, SKIP_STREAK_LIMIT, TWO_HOURS_MS, LONG_SESSION_MS } = require('../src/brand/ContextEventManager');

const rootPath = path.join(__dirname, '..');
const branding = new BrandingManager({
    BRAND_PROFILE: 'kurau',
    KURAU_PERSONALITY_ENABLED: 'true',
    KURAU_VARIANTS_ENABLED: 'true',
}, { rootPath });

const approvedSkipStreak = new Set([
    'wn, ¿van a escuchar música o puro apretar siguiente?',
    'JAJAJA decídanse po, ctm.',
    'llevamos más canciones saltadas que escuchadas.',
    '¿les pongo ruido blanco mejor?',
    'ya, el próximo que salte una canción se va castigado.',
]);

let now = 1_000;
const manager = new ContextEventManager(branding, { now: () => now });
for (let index = 1; index < SKIP_STREAK_LIMIT; index += 1) {
    assert.strictEqual(manager.recordManualSkip('guild-a'), null);
}
const skipReaction = manager.recordManualSkip('guild-a');
assert.ok(approvedSkipStreak.has(skipReaction));
assert.strictEqual(manager.recordManualSkip('guild-b'), null, 'guild state should be independent');

const autoplayManager = new ContextEventManager(branding, { now: () => now });
assert.strictEqual(autoplayManager.recordAutoplayToggle('guild-a'), null);
now += 30_000;
assert.strictEqual(autoplayManager.recordAutoplayToggle('guild-a'), null);
now += 30_000;
assert.ok(autoplayManager.recordAutoplayToggle('guild-a'), 'third toggle in two minutes should react');

const longManager = new ContextEventManager(branding, { now: () => now });
longManager.startSession('guild-long');
now += TWO_HOURS_MS + 1;
const twoHourMessage = longManager.recordTrackStarted('guild-long');
assert.ok(twoHourMessage);
assert.strictEqual(longManager.getEmbedNote('guild-long'), twoHourMessage);

const farewellManager = new ContextEventManager(branding, { now: () => now });
farewellManager.startSession('guild-farewell');
now += LONG_SESSION_MS + 1;
const farewell = farewellManager.getQueueEndMessage('guild-farewell', 'fallback');
assert.notStrictEqual(farewell, 'fallback');

console.log('kurau context event tests passed');
