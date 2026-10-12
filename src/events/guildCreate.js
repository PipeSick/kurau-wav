const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const logger = require('../utils/logger');
const { brandColor } = require('../utils/brandEmbed');

function findWelcomeChannel(guild) {
    if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages)) {
        return guild.systemChannel;
    }

    return guild.channels.cache
        .filter(ch => ch.type === ChannelType.GuildText && ch.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.SendMessages))
        .sort((a, b) => a.position - b.position)
        .first();
}

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild) {
        const { client } = guild;
        const lang = client.defaultLanguage;

        const channel = findWelcomeChannel(guild);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(brandColor(client))
            .setTitle(client.languageManager.get(lang, 'WELCOME_TITLE'))
            .setDescription(client.languageManager.get(lang, 'WELCOME_DESCRIPTION'))
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: client.branding?.getFooterText('BeatDock v2.11.1 base') || 'kurau.wav' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('BeatDock upstream')
                    .setStyle(ButtonStyle.Link)
                    .setURL(client.branding?.getLinks().upstream || 'https://github.com/albertgmz/BeatDock')
            );

        try {
            await channel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            logger.warn(`Could not send welcome message in ${guild.name}: ${error.message}`);
        }
    },
};
