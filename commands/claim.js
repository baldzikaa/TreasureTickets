const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel, claimTicket, addStat } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim the current ticket'),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 1)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        if (ticket.claimer_id) {
            return interaction.reply({ content: `This ticket is already claimed by <@${ticket.claimer_id}>.`, ephemeral: true });
        }

        claimTicket.run(interaction.user.id, interaction.channel.id);
        addStat.run(interaction.user.id, interaction.guild.id, 'claim');

        const embed = new EmbedBuilder()
            .setTitle('🙋 Ticket Claimed')
            .setDescription(`This ticket has been claimed by <@${interaction.user.id}>.`)
            .setColor(0x57F287)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
