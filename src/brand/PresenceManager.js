const { ActivityType } = require('discord.js');

class PresenceManager {
    constructor(client) {
        this.client = client;
        this.timer = null;
        this.index = 0;
    }

    start() {
        this.stop();
        const branding = this.client.branding;
        if (!branding?.config.presenceRotation) return;

        const intervalMs = branding.config.presenceIntervalSeconds * 1000;
        this.applyIdlePresence();
        this.timer = setInterval(() => this.applyIdlePresence(), intervalMs);
        if (typeof this.timer.unref === 'function') this.timer.unref();
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    applyIdlePresence() {
        if (!this.client.user) return;
        if (this.client.activePlayers?.size > 0) return;

        const messages = this.client.branding?.persona.getPresenceIdleMessages() || [];
        if (!messages.length) {
            this.client.user.setActivity(null);
            return;
        }

        const message = messages[this.index % messages.length];
        this.index += 1;
        this.client.user.setActivity(message, { type: ActivityType.Listening });
    }

    updateActivePresence() {
        if (!this.client.user) return;
        const activePlayers = Array.from(this.client.activePlayers.values());
        if (activePlayers.length === 0) {
            this.applyIdlePresence();
        } else if (activePlayers.length === 1) {
            this.client.user.setActivity(this.client.t('PLAYING_MUSIC_GENERIC'), { type: ActivityType.Listening });
        } else {
            this.client.user.setActivity(this.client.t('PLAYING_MUSIC_IN_SERVERS', activePlayers.length), { type: ActivityType.Listening });
        }
    }
}

module.exports = PresenceManager;
