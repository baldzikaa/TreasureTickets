const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to the current ticket')
        .addUserOption(opt => opt.setName('user').setDescription('User to add').setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 3)) {
            return interaction.reply({ content: 'You need Admin+ permission to use this command.', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        await interaction.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true,
        });

        const embed = new EmbedBuilder()
            .setDescription(`➕ <@${user.id}> has been added to this ticket by <@${interaction.user.id}>.`)
            .setColor(0x57F287)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
