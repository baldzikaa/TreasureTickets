const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { resetStats } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats-reset')
        .setDescription('Reset all ticket stats for a staff member')
        .addUserOption(opt => opt.setName('user').setDescription('Staff member to reset stats for').setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 4)) {
            return interaction.reply({ content: 'You need Sr Admin+ permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        resetStats.run(user.id, interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle('🔄 Stats Reset')
            .setDescription(`All ticket stats for <@${user.id}> have been reset by <@${interaction.user.id}>.`)
            .setColor(0xFEE75C)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
