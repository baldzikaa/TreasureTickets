const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission, getPermissionLevel } = require('../utils/permissions');
const { addBlacklist, removeBlacklist, getBlacklist, getAllBlacklisted } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Manage ticket blacklist')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Blacklist a user from creating tickets')
                .addUserOption(opt => opt.setName('user').setDescription('User to blacklist').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for blacklist').setRequired(true))
                .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 1d, 7d, 30d, permanent)').setRequired(true)),
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a user from the blacklist')
                .addUserOption(opt => opt.setName('user').setDescription('User to unblacklist').setRequired(true)),
        )
        .addSubcommand(sub =>
            sub.setName('check')
                .setDescription('Check a user\'s blacklist status')
                .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true)),
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all blacklisted users'),
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (['add', 'remove'].includes(subcommand)) {
            if (!hasPermission(interaction.member, 3)) {
                return interaction.reply({ content: 'You need Admin+ permission to use this command.', ephemeral: true });
            }
        } else {
            if (!hasPermission(interaction.member, 1)) {
                return interaction.reply({ content: 'You need Staff+ permission to use this command.', ephemeral: true });
            }
        }

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            const duration = interaction.options.getString('duration');

            let expiresAt = null;
            if (duration.toLowerCase() !== 'permanent') {
                const match = duration.match(/^(\d+)([dhm])$/);
                if (!match) {
                    return interaction.reply({ content: 'Invalid duration format. Use `1d`, `7d`, `30d`, `1h`, or `permanent`.', ephemeral: true });
                }
                const amount = parseInt(match[1]);
                const unit = match[2];
                const ms = unit === 'd' ? amount * 86400000 : unit === 'h' ? amount * 3600000 : amount * 60000;
                expiresAt = new Date(Date.now() + ms).toISOString();
            }

            addBlacklist.run(user.id, interaction.guild.id, reason, interaction.user.id, expiresAt);

            const embed = new EmbedBuilder()
                .setTitle('🚫 User Blacklisted')
                .addFields(
                    { name: 'User', value: `<@${user.id}> (${user.id})`, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Blacklisted By', value: `<@${interaction.user.id}>`, inline: true },
                )
                .setColor(0xED4245)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');
            const existing = getBlacklist.get(user.id, interaction.guild.id);

            if (!existing) {
                return interaction.reply({ content: 'That user is not blacklisted.', ephemeral: true });
            }

            removeBlacklist.run(user.id, interaction.guild.id);

            const embed = new EmbedBuilder()
                .setTitle('✅ User Unblacklisted')
                .setDescription(`<@${user.id}> has been removed from the blacklist by <@${interaction.user.id}>.`)
                .setColor(0x57F287)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'check') {
            const user = interaction.options.getUser('user');
            const entry = getBlacklist.get(user.id, interaction.guild.id);

            if (!entry) {
                const embed = new EmbedBuilder()
                    .setTitle('📋 Blacklist Check')
                    .setDescription(`<@${user.id}> is **not** blacklisted.`)
                    .setColor(0x57F287)
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const now = new Date();
            const expired = entry.expires_at && new Date(entry.expires_at) <= now;

            if (expired) {
                removeBlacklist.run(user.id, interaction.guild.id);
                const embed = new EmbedBuilder()
                    .setTitle('📋 Blacklist Check')
                    .setDescription(`<@${user.id}> was blacklisted but it has expired. They have been removed.`)
                    .setColor(0x57F287)
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const timeRemaining = entry.expires_at
                ? `<t:${Math.floor(new Date(entry.expires_at).getTime() / 1000)}:R>`
                : 'Permanent';

            const embed = new EmbedBuilder()
                .setTitle('📋 Blacklist Check')
                .addFields(
                    { name: 'User', value: `<@${user.id}>`, inline: true },
                    { name: 'Reason', value: entry.reason, inline: true },
                    { name: 'Expires', value: timeRemaining, inline: true },
                    { name: 'Blacklisted By', value: `<@${entry.added_by}>`, inline: true },
                    { name: 'Blacklisted At', value: `<t:${Math.floor(new Date(entry.added_at).getTime() / 1000)}:f>`, inline: true },
                )
                .setColor(0xED4245)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'list') {
            const entries = getAllBlacklisted.all(interaction.guild.id);

            if (entries.length === 0) {
                return interaction.reply({ content: 'No users are currently blacklisted.', ephemeral: true });
            }

            const now = new Date();
            const activeEntries = entries.filter(e => !e.expires_at || new Date(e.expires_at) > now);

            if (activeEntries.length === 0) {
                return interaction.reply({ content: 'No users are currently blacklisted.', ephemeral: true });
            }

            const list = activeEntries.map((e, i) => {
                const expiry = e.expires_at ? `<t:${Math.floor(new Date(e.expires_at).getTime() / 1000)}:R>` : 'Permanent';
                return `**${i + 1}.** <@${e.user_id}> — ${e.reason} (${expiry})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('🚫 Blacklisted Users')
                .setDescription(list)
                .setColor(0xED4245)
                .setFooter({ text: `${activeEntries.length} blacklisted user(s)` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
