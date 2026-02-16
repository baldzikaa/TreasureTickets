const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { sendPanel } = require('../handlers/ticketPanel');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket management')
        .addSubcommand(sub =>
            sub.setName('send')
                .setDescription('Send the ticket panel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send the panel to').setRequired(false)),
        ),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 4)) {
            return interaction.reply({ content: 'You need Sr Admin+ permission to use this command.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'send') {
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            await sendPanel(channel);
            await interaction.reply({ content: `Ticket panel sent to <#${channel.id}>.`, ephemeral: true });
        }
    },
};
