const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from the current ticket')
        .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 3)) {
            return interaction.reply({ content: 'You need Admin+ permission to use this command!', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        if (user.id === ticket.creator_id) {
            return interaction.reply({ content: 'You cannot remove the ticket creator!', ephemeral: true });
        }

        await interaction.channel.permissionOverwrites.delete(user.id);

        const embed = new EmbedBuilder()
            .setDescription(`➖ <@${user.id}> has been removed from this ticket by <@${interaction.user.id}>!`)
            .setColor(0xED4245)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

