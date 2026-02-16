const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel } = require('../database');
const { sendCloseRequest } = require('../handlers/closeRequest');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closerequest')
        .setDescription('Request to close the ticket with a 2-hour auto-close')
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for closing').setRequired(false)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 1)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        const reason = interaction.options.getString('reason');
        await sendCloseRequest(interaction, reason);
    },
};
