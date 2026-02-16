const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename the current ticket channel')
        .addStringOption(opt => opt.setName('name').setDescription('New name for the ticket').setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 1)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        const newName = interaction.options.getString('name').toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const oldName = interaction.channel.name;

        await interaction.channel.setName(newName);

        const embed = new EmbedBuilder()
            .setDescription(`✏️ Ticket renamed from **#${oldName}** to **#${newName}** by <@${interaction.user.id}>`)
            .setColor(0x5865F2)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
