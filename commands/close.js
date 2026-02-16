const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel } = require('../database');
const { performClose } = require('../handlers/ticketClose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close the current ticket')
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for closing the ticket').setRequired(false)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 1)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        const reason = interaction.options.getString('reason');

        await interaction.deferReply();
        const embed = new EmbedBuilder()
            .setTitle('🔒 Closing Ticket')
            .setDescription('This ticket will be closed in a few seconds...')
            .setColor(0xED4245);
        await interaction.editReply({ embeds: [embed] });

        await performClose(interaction, interaction.user.id, reason);
    },
};
