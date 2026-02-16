const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission, getPermissionLevel, getPermissionName } = require('../utils/permissions');
const { getStats } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketstats')
        .setDescription('View ticket statistics for a staff member')
        .addUserOption(opt => opt.setName('user').setDescription('Staff member to check').setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 2)) {
            return interaction.reply({ content: 'You need Mod+ permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }

        const permLevel = getPermissionLevel(member);
        const allStats = getStats.all(user.id, interaction.guild.id);

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const monthAgo = new Date(now.getTime() - 30 * 86400000);

        const weekly = { claims: 0, closes: 0 };
        const monthly = { claims: 0, closes: 0 };
        const allTime = { claims: 0, closes: 0 };

        for (const stat of allStats) {
            const ts = new Date(stat.timestamp);

            if (stat.action === 'claim') {
                allTime.claims++;
                if (ts >= monthAgo) monthly.claims++;
                if (ts >= weekAgo) weekly.claims++;
            } else if (stat.action === 'close') {
                allTime.closes++;
                if (ts >= monthAgo) monthly.closes++;
                if (ts >= weekAgo) weekly.closes++;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`📊 Ticket Stats — ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🔰 Permission Level', value: `${permLevel.name} (Level ${permLevel.level})`, inline: false },
                { name: '📅 Weekly', value: `Claimed: **${weekly.claims}**\nClosed: **${weekly.closes}**`, inline: true },
                { name: '📆 Monthly', value: `Claimed: **${monthly.claims}**\nClosed: **${monthly.closes}**`, inline: true },
                { name: '📈 All Time', value: `Claimed: **${allTime.claims}**\nClosed: **${allTime.closes}**`, inline: true },
            )
            .setColor(0x5865F2)
            .setTimestamp()
            .setFooter({ text: 'TreasureMC Ticket System' });

        await interaction.reply({ embeds: [embed] });
    },
};
