const DEFAULT_COLOR = '#B45CFF';

function parseBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
    return fallback;
}

function parseInteger(value, fallback, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) return fallback;
    return parsed;
}

function normalizeColor(value, fallback = DEFAULT_COLOR) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toUpperCase() : fallback;
}

function colorToInt(color) {
    const normalized = normalizeColor(color);
    return Number.parseInt(normalized.slice(1), 16);
}

function loadBrandConfig(env = process.env) {
    const sarcasmLevel = String(env.KURAU_SARCASM_LEVEL || 'medium').trim().toLowerCase();
    const safeSarcasmLevel = ['low', 'medium', 'high'].includes(sarcasmLevel) ? sarcasmLevel : 'medium';

    return {
        profile: env.BRAND_PROFILE || 'kurau',
        defaultLanguage: env.DEFAULT_LANGUAGE || 'es',
        personalityEnabled: parseBoolean(env.KURAU_PERSONALITY_ENABLED, true),
        variantsEnabled: parseBoolean(env.KURAU_VARIANTS_ENABLED, true),
        publicEventMessages: parseBoolean(env.KURAU_PUBLIC_EVENT_MESSAGES, false),
        presenceRotation: parseBoolean(env.KURAU_PRESENCE_ROTATION, true),
        themeColor: normalizeColor(env.KURAU_THEME_COLOR || DEFAULT_COLOR),
        sarcasmLevel: safeSarcasmLevel,
        eventCooldownSeconds: parseInteger(env.KURAU_EVENT_COOLDOWN_SECONDS, 300, { min: 0, max: 86400 }),
        presenceIntervalSeconds: parseInteger(env.KURAU_PRESENCE_INTERVAL_SECONDS, 900, { min: 60, max: 86400 }),
    };
}

module.exports = {
    DEFAULT_COLOR,
    colorToInt,
    loadBrandConfig,
    normalizeColor,
    parseBoolean,
    parseInteger,
};
