const { EmbedBuilder } = require('discord.js');

function createBrandEmbed(client) {
    const embed = new EmbedBuilder();
    const branding = client?.branding;
    if (branding) {
        embed.setColor(branding.getColor());
    } else {
        embed.setColor(0xB45CFF);
    }
    return embed;
}

function brandColor(client) {
    return client?.branding?.getColor?.() || 0xB45CFF;
}

module.exports = {
    brandColor,
    createBrandEmbed,
};
