# kurau.wav Personality Catalog

Source of truth integrated from `KURAU_PERSONALITY_SPEC.md` v1.0.

## Distribution

Eligible tone groups are selected approximately as:

- Natural: 40 %
- Sarcastic: 30 %
- Foul: 20 %
- Tender: 10 %

The selector first chooses the tone group and then a phrase inside that tone. Tender phrases have a 30 minute cooldown per guild unless the event explicitly allows a tender long-session farewell.

## Runtime Files

- `src/brand/kurau.persona.json`: approved phrases and context catalogs.
- `src/brand/PersonaManager.js`: tone selection, antirepetition, tender cooldown.
- `src/brand/ContextEventManager.js`: skip streaks, autoplay toggle spam, long sessions, session farewell.
- `src/LanguageManager.js`: routes BeatDock message keys into the branding layer.

## Integrated Events

- `SONG_ADDED`
- `SONG_ADDED_NEXT`
- `SEARCH_TRACK_ADDED`
- `SONG_SKIPPED`
- `PAUSED`
- `RESUMED`
- `AUTOPLAY_ENABLED`
- `AUTOPLAY_DISABLED`
- `AUTOPLAY_REQUESTER`
- `QUEUE_ENDED`
- `NO_RESULTS`
- `LAVALINK_UNAVAILABLE`
- `LAVALINK_TIMEOUT`
- `PLAYBACK_UNAVAILABLE`
- `TRACK_UNPLAYABLE`
- `GENERIC_ERROR`
- `LEFT_EMPTY`

## Contextual Reactions

- Five consecutive manual skips in one session.
- Three effective autoplay toggles inside two minutes.
- Two hours of active musical session, excluding paused time.
- Long-session farewell after at least one hour.
- Tender phrase cooldowns per guild.

## Non-Goals

- No public message for every track.
- No invented musical analysis.
- No cruel personal attacks.
- No production deployment or GHCR publication from this package.
