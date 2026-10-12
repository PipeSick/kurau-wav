const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { requirePlayer } = require('../utils/interactionHelpers');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa o reanuda la reproduccion.'),
    async execute(interaction) {
        const { client } = interaction;

        const player = await requirePlayer(interaction);
        if (!player) return;

        logger.cmd(`/pause by ${interaction.user.tag} in #${interaction.channel.name} (Guild: ${interaction.guild.name})`);

        if (player.paused) {
            await player.resume();
            client.contextEvents?.resumeSession(interaction.guild.id);
            return interaction.reply({ 
                content: client.languageManager.get(client.defaultLanguage, 'RESUMED'), 
                flags: MessageFlags.Ephemeral
            });
        } else {
            await player.pause();
            client.contextEvents?.pauseSession(interaction.guild.id);
            return interaction.reply({ 
                content: client.languageManager.get(client.defaultLanguage, 'PAUSED'), 
                flags: MessageFlags.Ephemeral
            });
        }
    },
}; 
