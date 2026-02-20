const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View detailed information about all ticket system commands.'),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 1)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📖 TreasureMC Ticket System — Help')
            .setColor(0x2B2D31)
            .addFields(
                {
                    name: '👥 Everyone',
                    value: '`/review` — Leave a review for your ticket experience!',
                    inline: false,
                },
                {
                    name: '🔧 Staff+',
                    value: [
                        '`/claim` — Claim the current ticket',
                        '`/close [reason]` — Close the current ticket',
                        '`/closerequest [reason]` — Request to close (2hr auto-close)',
                        '`/rename <name>` — Rename the current ticket',
                        '`/switchpanel <type>` — Switch ticket to a different type',
                        '`/blacklist check <user>` — Check blacklist status',
                        '`/blacklist list` — List all blacklisted users',
                        '`/help` — View this help menu',
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '🛡️ Mod+',
                    value: '`/ticketstats <user>` — View ticket statistics',
                    inline: false,
                },
                {
                    name: '⚔️ Admin+',
                    value: [
                        '`/add <user>` — Add a user to the current ticket',
                        '`/remove <user>` — Remove a user from the current ticket',
                        '`/blacklist add <user> <reason> <duration>` — Blacklist a user',
                        '`/blacklist remove <user>` — Remove from blacklist',
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '👑 Sr Admin+',
                    value: [
                        '`/ticket send [channel]` — Send the ticket panel',
                        '`/stats-reset <user>` — Reset a staff member\'s stats',
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '🏆 Manager+',
                    value: [
                        '`/ticket-permissions add <role> <level>` — Add a role to ticket system',
                        '`/ticket-permissions list` — List all ticket permissions',
                        '`/ticket-permissions remove <role>` — Remove a role',
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '📢 Ping Roles',
                    value: '`!helper` `!jrmod` `!mod` `!srmod` `!admin` `!sradmin` `!dev` `!manager` `!owner`',
                    inline: false,
                },
            )
            .setFooter({ text: 'TreasureMC Ticket System' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

