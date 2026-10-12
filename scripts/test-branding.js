const assert = require('assert');
const path = require('path');
const BrandingManager = require('../src/brand/BrandingManager');
const LanguageManager = require('../src/LanguageManager');
const { loadBrandConfig, normalizeColor } = require('../src/brand/config');

const rootPath = path.join(__dirname, '..');

function createBranding(env = {}) {
    return new BrandingManager({
        BRAND_PROFILE: 'kurau',
        DEFAULT_LANGUAGE: 'es',
        KURAU_PERSONALITY_ENABLED: 'true',
        KURAU_VARIANTS_ENABLED: 'true',
        KURAU_PUBLIC_EVENT_MESSAGES: 'false',
        KURAU_PRESENCE_ROTATION: 'true',
        KURAU_THEME_COLOR: '#B45CFF',
        KURAU_EVENT_COOLDOWN_SECONDS: '300',
        ...env,
    }, { rootPath });
}

const branding = createBranding();
assert.deepStrictEqual(branding.validate(), []);
assert.strictEqual(branding.getDisplayName(), 'kurau.wav');
assert.strictEqual(branding.getColor(), 0xB45CFF);
assert.strictEqual(normalizeColor('nope'), '#B45CFF');

const language = new LanguageManager(branding);
const approvedSongAdded = new Set([
    '♫ ya, anotada.',
    '✦ a la cola, como corresponde.',
    '♫ ahí quedó, wn.',
    'ya po, que suene.',
    'aer qué maravilla pusiste ahora...',
    'otra más pal sufrimiento colectivo.',
    'confío en tu criterio. lamentablemente.',
    'ya ctm, ahí está tu canción.',
    'a la fila, wn. no te desesperís.',
    '♡ esta me tinca. buena elección.',
]);
assert.ok(approvedSongAdded.has(language.get('es', 'SONG_ADDED', 'test track')));
assert.match(language.get('es', 'PLAYER_TITLE'), /kurau\.wav/);
assert.strictEqual(language.get('es', 'MISSING_KEY_FOR_TEST'), 'MISSING_KEY_FOR_TEST');

const first = branding.message('SONG_SKIPPED', [], { guildId: 'g1' });
const second = branding.message('SONG_SKIPPED', [], { guildId: 'g1' });
assert.notStrictEqual(first, second, 'variants should avoid immediate repetition when possible');

const weightedBranding = createBranding();
const originalRandom = Math.random;
Math.random = () => 0.01;
assert.strictEqual(weightedBranding.message('SONG_ADDED', [], { guildId: 'weighted-a' }), '♫ ya, anotada.');
Math.random = () => 0.55;
assert.ok([
    'aer qué maravilla pusiste ahora...',
    'otra más pal sufrimiento colectivo.',
    'confío en tu criterio. lamentablemente.',
].includes(weightedBranding.message('SONG_ADDED', [], { guildId: 'weighted-b' })));
Math.random = () => 0.75;
assert.ok([
    'ya ctm, ahí está tu canción.',
    'a la fila, wn. no te desesperís.',
].includes(weightedBranding.message('SONG_ADDED', [], { guildId: 'weighted-c' })));
Math.random = originalRandom;

assert.strictEqual(branding.canSendEvent('sessionStarted', 'g1'), false);
const publicBranding = createBranding({ KURAU_PUBLIC_EVENT_MESSAGES: 'true', KURAU_EVENT_COOLDOWN_SECONDS: '60' });
assert.strictEqual(publicBranding.canSendEvent('sessionStarted', 'g1'), true);
assert.strictEqual(publicBranding.canSendEvent('sessionStarted', 'g1'), false);

const disabled = createBranding({ KURAU_PERSONALITY_ENABLED: 'false' });
assert.strictEqual(disabled.message('SONG_ADDED', ['x']), null);

const lowSarcasm = createBranding({ KURAU_SARCASM_LEVEL: 'low' });
const lowFirst = lowSarcasm.message('SONG_SKIPPED', [], { guildId: 'g1' });
const lowSecond = lowSarcasm.message('SONG_SKIPPED', [], { guildId: 'g1' });
assert.strictEqual(lowFirst, lowSecond, 'low sarcasm should prefer the stable neutral variant');

const badConfig = loadBrandConfig({
    KURAU_THEME_COLOR: 'purple',
    KURAU_SARCASM_LEVEL: 'maximum',
    KURAU_EVENT_COOLDOWN_SECONDS: '-1',
});
assert.strictEqual(badConfig.themeColor, '#B45CFF');
assert.strictEqual(badConfig.sarcasmLevel, 'medium');
assert.strictEqual(badConfig.eventCooldownSeconds, 300);

console.log('kurau branding tests passed');
