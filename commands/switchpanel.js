const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const { hasPermission } = require('../utils/permissions');
const { getTicketByChannel, updateTicketType } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('switchpanel')
        .setDescription('Switch the current ticket to a different type')
        .addStringOption(opt =>
            opt.setName('type')
                .setDescription('New ticket type')
                .setRequired(true)
                .addChoices(
                    { name: 'General Support', value: 'general' },
                    { name: 'Billing Support', value: 'billing' },
                    { name: 'Punishment Appeal', value: 'appeal' },
                    { name: 'Bug Reports', value: 'bug' },
                    { name: 'Player Reports', value: 'player' },
                    { name: 'Staff Reports', value: 'staff' },
                ),
        ),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 1)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const ticket = getTicketByChannel.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        const newType = interaction.options.getString('type');
        const panelInfo = config.panelTypes[newType];

        if (ticket.type === newType) {
            return interaction.reply({ content: 'This ticket is already that type.', ephemeral: true });
        }

        await interaction.channel.setParent(panelInfo.category, { lockPermissions: false });
        updateTicketType.run(newType, interaction.channel.id);

        const embed = new EmbedBuilder()
            .setTitle('🔄 Panel Switched')
            .setDescription(`Ticket type has been changed to **${panelInfo.label}** by <@${interaction.user.id}>`)
            .setColor(panelInfo.color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
