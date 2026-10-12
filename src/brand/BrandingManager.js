const fs = require('fs');
const path = require('path');
const { colorToInt, loadBrandConfig } = require('./config');
const { PersonaManager, safeReadJson } = require('./PersonaManager');

function mergeObjects(base, overlay) {
    return {
        ...(base || {}),
        ...(overlay || {}),
    };
}

class BrandingManager {
    constructor(env = process.env, options = {}) {
        this.rootPath = options.rootPath || path.join(__dirname, '..', '..');
        this.config = loadBrandConfig(env);
        this.profile = this.config.profile;
        this.theme = safeReadJson(path.join(this.rootPath, 'src', 'brand', `${this.profile}.theme.json`), {});
        this.persona = new PersonaManager({
            profile: this.profile,
            rootPath: this.rootPath,
            config: this.config,
        });
        this.localeOverrides = this.loadLocaleOverrides();
    }

    loadLocaleOverrides() {
        const localeDir = path.join(this.rootPath, 'src', 'brand', 'locales');
        const overrides = new Map();
        if (!fs.existsSync(localeDir)) return overrides;

        for (const file of fs.readdirSync(localeDir).filter((name) => name.endsWith('.json'))) {
            const locale = file.replace(/\.json$/, '');
            overrides.set(locale, safeReadJson(path.join(localeDir, file), {}));
        }
        return overrides;
    }

    validate() {
        const errors = [];
        if (!this.theme || typeof this.theme !== 'object') {
            errors.push('theme must contain an object');
        }
        if (this.theme.color && !/^#[0-9a-fA-F]{6}$/.test(this.theme.color)) {
            errors.push('theme.color must be a #RRGGBB value');
        }
        errors.push(...this.persona.validate());
        return errors;
    }

    getTheme() {
        return this.theme;
    }

    getDisplayName() {
        return this.theme.displayName || 'kurau.wav';
    }

    getJapaneseName() {
        return this.theme.japaneseName || 'クラウ';
    }

    getColor() {
        return colorToInt(this.config.themeColor || this.theme.color || '#B45CFF');
    }

    getFooterText(suffix) {
        const base = this.theme.footer || `${this.getDisplayName()} - PipeSick`;
        return suffix ? `${base} | ${suffix}` : base;
    }

    getLocaleOverride(locale, key) {
        const exact = this.localeOverrides.get(locale);
        const base = this.localeOverrides.get(this.config.defaultLanguage);
        return (exact && Object.hasOwn(exact, key) ? exact[key] : undefined)
            ?? (base && Object.hasOwn(base, key) ? base[key] : undefined);
    }

    mergeCommandDescription(commandName, fallback) {
        const descriptions = this.theme.commandDescriptions || {};
        return descriptions[commandName] || fallback;
    }

    getLinks() {
        return mergeObjects({
            upstream: 'https://github.com/albertgmz/BeatDock',
            upstreamIssues: 'https://github.com/albertgmz/BeatDock/issues',
        }, this.theme.links || {});
    }

    message(key, args = [], context = {}) {
        return this.persona.getMessage(key, args, context);
    }

    contextMessage(key, guildId, context = {}) {
        return this.persona.getContextMessage(key, guildId, context);
    }

    canSendEvent(eventName, guildId) {
        return this.config.publicEventMessages && this.persona.canSendEvent(eventName, guildId);
    }
}

module.exports = BrandingManager;
