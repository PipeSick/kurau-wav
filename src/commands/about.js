const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { version } = require('../../package.json');
const os = require('os');
const logger = require('../utils/logger');
const { brandColor } = require('../utils/brandEmbed');

const BASE_BEATDOCK_VERSION = '2.11.1';

// Helper to format uptime from milliseconds to a readable string
function formatUptime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let uptime = '';
    if (days > 0) uptime += `${days}d `;
    if (hours > 0) uptime += `${hours}h `;
    if (minutes > 0) uptime += `${minutes}m `;
    uptime += `${seconds}s`;

    return uptime.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Displays detailed information about kurau.wav.'),
    async execute(interaction) {
        const { client } = interaction;
        const lang = client.defaultLanguage;

        logger.cmd(`/about by ${interaction.user.tag} in #${interaction.channel.name} (Guild: ${interaction.guild.name})`);

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        

                const links = client.branding?.getLinks() || {};
                const embed = new EmbedBuilder()

                    .setColor(brandColor(client))

                    .setTitle(client.languageManager.get(lang, 'ABOUT_TITLE'))

                    .setDescription(client.languageManager.get(lang, 'ABOUT_DESCRIPTION'))

                    .setThumbnail(client.user.displayAvatarURL())

                    .addFields(

                        { 

                            name: 'General',

                            value: `**kurau.wav:** \`v${version}\`\n**BeatDock base:** \`v${BASE_BEATDOCK_VERSION}\`\n**Servidores:** \`${client.guilds.cache.size}\`\n**Sesiones activas:** \`${client.activePlayers.size}\``,

                            inline: true 

                        },

                                        { 

                                            name: 'Latencia',

                                            value: `**API:** \`${client.ws.ping === -1 ? 'midiendo...' : `${Math.round(client.ws.ping)}ms`}\``,

                                            inline: true 

                                        },

                        { 

                            name: 'Sistema',

                            value: `**Uptime:** \`${formatUptime(client.uptime)}\`\n**Node.js:** \`${process.version}\`\n**Platform:** \`${os.platform()}\``, 

                            inline: false

                        }

                    )            .setFooter({ text: client.branding?.getFooterText('BeatDock v2.11.1 base') || 'kurau.wav' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('BeatDock upstream')
                    .setStyle(ButtonStyle.Link)
                    .setURL(links.upstream || 'https://github.com/albertgmz/BeatDock')
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setLabel('Upstream issues')
                    .setStyle(ButtonStyle.Link)
                    .setURL(links.upstreamIssues || 'https://github.com/albertgmz/BeatDock/issues')
                    .setEmoji('🐛')
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};
