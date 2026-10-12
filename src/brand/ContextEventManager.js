const SKIP_STREAK_LIMIT = 5;
const SKIP_STREAK_COOLDOWN_MS = 15 * 60 * 1000;
const AUTOPLAY_TOGGLE_LIMIT = 3;
const AUTOPLAY_TOGGLE_WINDOW_MS = 2 * 60 * 1000;
const AUTOPLAY_TOGGLE_COOLDOWN_MS = 20 * 60 * 1000;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const LONG_SESSION_MS = 60 * 60 * 1000;

class ContextEventManager {
    constructor(branding, options = {}) {
        this.branding = branding;
        this.now = options.now || (() => Date.now());
        this.sessions = new Map();
    }

    getSession(guildId) {
        if (!this.sessions.has(guildId)) {
            this.sessions.set(guildId, {
                startedAt: null,
                activeSince: null,
                pausedAt: null,
                pausedMs: 0,
                skipStreak: 0,
                lastSkipStreakAt: 0,
                autoplayToggleTimes: [],
                lastAutoplaySpamAt: 0,
                twoHoursSent: false,
                embedNote: null,
            });
        }
        return this.sessions.get(guildId);
    }

    startSession(guildId) {
        const session = this.getSession(guildId);
        if (!session.startedAt) {
            const now = this.now();
            session.startedAt = now;
            session.activeSince = now;
        }
    }

    pauseSession(guildId) {
        const session = this.getSession(guildId);
        if (!session.pausedAt) session.pausedAt = this.now();
    }

    resumeSession(guildId) {
        const session = this.getSession(guildId);
        if (session.pausedAt) {
            session.pausedMs += this.now() - session.pausedAt;
            session.pausedAt = null;
        }
    }

    getActiveMs(guildId) {
        const session = this.getSession(guildId);
        if (!session.startedAt) return 0;
        const pendingPause = session.pausedAt ? this.now() - session.pausedAt : 0;
        return Math.max(0, this.now() - session.startedAt - session.pausedMs - pendingPause);
    }

    recordTrackStarted(guildId) {
        this.startSession(guildId);
        const session = this.getSession(guildId);
        if (!session.twoHoursSent && this.getActiveMs(guildId) >= TWO_HOURS_MS) {
            session.twoHoursSent = true;
            session.embedNote = this.branding.contextMessage('sessionTwoHours', guildId, { allowTender: true });
            return session.embedNote;
        }
        return null;
    }

    getEmbedNote(guildId) {
        return this.getSession(guildId).embedNote;
    }

    recordTrackFinished(guildId) {
        const session = this.getSession(guildId);
        session.skipStreak = 0;
    }

    recordManualSkip(guildId) {
        const session = this.getSession(guildId);
        this.startSession(guildId);
        session.skipStreak += 1;

        if (session.skipStreak < SKIP_STREAK_LIMIT) return null;
        const now = this.now();
        if (session.lastSkipStreakAt && now - session.lastSkipStreakAt < SKIP_STREAK_COOLDOWN_MS) return null;
        session.lastSkipStreakAt = now;
        session.skipStreak = 0;
        return this.branding.contextMessage('skipStreak', guildId);
    }

    recordAutoplayToggle(guildId) {
        const session = this.getSession(guildId);
        const now = this.now();
        session.autoplayToggleTimes = session.autoplayToggleTimes
            .filter((timestamp) => now - timestamp <= AUTOPLAY_TOGGLE_WINDOW_MS);
        session.autoplayToggleTimes.push(now);

        if (session.autoplayToggleTimes.length < AUTOPLAY_TOGGLE_LIMIT) return null;
        if (session.lastAutoplaySpamAt && now - session.lastAutoplaySpamAt < AUTOPLAY_TOGGLE_COOLDOWN_MS) return null;
        session.lastAutoplaySpamAt = now;
        session.autoplayToggleTimes = [];
        return this.branding.contextMessage('autoplayToggleSpam', guildId);
    }

    getQueueEndMessage(guildId, fallbackMessage) {
        const activeMs = this.getActiveMs(guildId);
        if (activeMs >= LONG_SESSION_MS) {
            return this.branding.contextMessage('longSessionFarewell', guildId, { allowTender: true }) || fallbackMessage;
        }
        return fallbackMessage;
    }

    clearGuild(guildId) {
        this.sessions.delete(guildId);
    }

    destroy() {
        this.sessions.clear();
    }
}

module.exports = {
    AUTOPLAY_TOGGLE_LIMIT,
    AUTOPLAY_TOGGLE_WINDOW_MS,
    ContextEventManager,
    LONG_SESSION_MS,
    SKIP_STREAK_LIMIT,
    TWO_HOURS_MS,
};
