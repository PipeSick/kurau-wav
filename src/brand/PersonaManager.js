const fs = require('fs');
const path = require('path');

function formatTemplate(template, args = []) {
    if (typeof template !== 'string') return template;
    let formatted = template;
    args.forEach((arg, index) => {
        formatted = formatted.replaceAll(`{${index}}`, String(arg));
    });
    return formatted;
}

function safeReadJson(filePath, fallback = {}) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return fallback;
    }
}

class PersonaManager {
    constructor({ profile, rootPath, config }) {
        this.profile = profile;
        this.config = config;
        this.rootPath = rootPath;
        this.lastVariant = new Map();
        this.lastEventAt = new Map();
        this.lastTenderAt = new Map();
        this.persona = safeReadJson(path.join(rootPath, 'src', 'brand', `${profile}.persona.json`), {});
    }

    validate() {
        const errors = [];
        if (!this.persona || typeof this.persona !== 'object') {
            errors.push('persona file must contain an object');
            return errors;
        }
        const messages = this.persona.messages || {};
        if (typeof messages !== 'object' || Array.isArray(messages)) {
            errors.push('persona.messages must be an object');
        }
        for (const [key, value] of Object.entries(messages)) {
            const variants = this.flattenVariants(value);
            if (!variants.length || variants.some((variant) => typeof variant.text !== 'string' || !variant.text.trim())) {
                errors.push(`persona.messages.${key} must be a non-empty string, array of strings, or tone object`);
            }
        }
        return errors;
    }

    flattenVariants(value) {
        if (typeof value === 'string') return [{ tone: 'natural', text: value }];
        if (Array.isArray(value)) return value.map((text) => ({ tone: 'natural', text }));
        if (!value || typeof value !== 'object') return [];

        return Object.entries(value).flatMap(([tone, entries]) => {
            const list = Array.isArray(entries) ? entries : [entries];
            return list.map((text) => ({ tone, text }));
        });
    }

    getToneWeights() {
        return {
            natural: 40,
            sarcastic: 30,
            foul: 20,
            tender: 10,
            ...(this.persona.toneWeights || {}),
        };
    }

    isTenderAllowed(guildId, context = {}) {
        if (context.allowTender) return true;
        const cooldownSeconds = Number(this.persona.tenderCooldownSeconds || 1800);
        if (cooldownSeconds <= 0) return true;

        const key = guildId || 'global';
        const last = this.lastTenderAt.get(key) || 0;
        return Date.now() - last >= cooldownSeconds * 1000;
    }

    noteTender(guildId) {
        this.lastTenderAt.set(guildId || 'global', Date.now());
    }

    pickVariant(variants, variantKey, guildId, context = {}) {
        let candidates = variants;
        if (!this.isTenderAllowed(guildId, context)) {
            candidates = candidates.filter((variant) => variant.tone !== 'tender');
        }
        if (!candidates.length) candidates = variants.filter((variant) => variant.tone !== 'tender');
        if (!candidates.length) candidates = variants;

        if (this.config.sarcasmLevel === 'low' || !this.config.variantsEnabled || candidates.length === 1) {
            return candidates[0];
        }

        const last = this.lastVariant.get(variantKey);
        const nonRepeated = candidates.filter((variant) => variant.text !== last);
        const pool = nonRepeated.length ? nonRepeated : candidates;

        if (pool.length === 1) {
            return pool[0];
        }

        const weights = this.getToneWeights();
        const tones = [...new Set(pool.map((variant) => variant.tone))];
        const total = tones.reduce((sum, tone) => sum + Math.max(0, Number(weights[tone] ?? 1)), 0);
        if (total <= 0) return pool[Math.floor(Math.random() * pool.length)] || pool[0];

        let cursor = Math.random() * total;
        let selectedTone = tones[0];
        for (const tone of tones) {
            cursor -= Math.max(0, Number(weights[tone] ?? 1));
            if (cursor <= 0) {
                selectedTone = tone;
                break;
            }
        }

        const tonePool = pool.filter((variant) => variant.tone === selectedTone);
        return tonePool[Math.floor(Math.random() * tonePool.length)] || tonePool[0] || pool[0];
    }

    getMessage(key, args = [], context = {}) {
        if (!this.config.personalityEnabled) return null;
        const messages = this.persona.messages || {};
        const value = messages[key];
        if (value === undefined) return null;

        const variants = this.flattenVariants(value);
        if (!variants.length) return null;

        let selectedVariant;
        const guildId = context.guildId || 'global';
        const variantKey = `${context.guildId || 'global'}:${key}`;
        selectedVariant = this.pickVariant(variants, variantKey, guildId, context);
        if (!selectedVariant) return null;

        this.lastVariant.set(variantKey, selectedVariant.text);
        if (selectedVariant.tone === 'tender') {
            this.noteTender(guildId);
        }

        return formatTemplate(selectedVariant.text, args);
    }

    getContextMessage(key, guildId = 'global', context = {}) {
        const contextMessages = this.persona.context || {};
        const value = contextMessages[key];
        const variants = this.flattenVariants(value);
        if (!variants.length) return null;

        const selected = this.pickVariant(variants, `${guildId}:context:${key}`, guildId, context);
        if (!selected) return null;
        this.lastVariant.set(`${guildId}:context:${key}`, selected.text);
        if (selected.tone === 'tender' || selected.text.includes('♡')) this.noteTender(guildId);
        return selected.text;
    }

    canSendEvent(eventName, guildId = 'global') {
        const cooldownMs = this.config.eventCooldownSeconds * 1000;
        if (cooldownMs <= 0) return true;

        const key = `${guildId}:${eventName}`;
        const now = Date.now();
        const last = this.lastEventAt.get(key) || 0;
        if (now - last < cooldownMs) return false;
        this.lastEventAt.set(key, now);
        return true;
    }

    getPresenceIdleMessages() {
        const presence = this.persona.presence || {};
        return Array.isArray(presence.idle) ? presence.idle.filter(Boolean) : [];
    }
}

module.exports = {
    PersonaManager,
    formatTemplate,
    safeReadJson,
};
