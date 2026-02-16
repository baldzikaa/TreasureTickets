const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { addTicketPermission, removeTicketPermission, getTicketPermissions } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-permissions')
        .setDescription('Manage ticket system permissions')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a role to the ticket system')
                .addRoleOption(opt => opt.setName('role').setDescription('Role to add').setRequired(true))
                .addIntegerOption(opt =>
                    opt.setName('level')
                        .setDescription('Permission level (1-5)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(5),
                ),
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all roles with ticket permissions'),
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a role from the ticket system')
                .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true)),
        ),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 5)) {
            return interaction.reply({ content: 'You need Manager+ permission to use this command.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const role = interaction.options.getRole('role');
            const level = interaction.options.getInteger('level');

            addTicketPermission.run(role.id, interaction.guild.id, level);

            const levelNames = { 1: 'Staff', 2: 'Mod', 3: 'Admin', 4: 'Sr Admin', 5: 'Manager' };

            const embed = new EmbedBuilder()
                .setTitle('✅ Permission Added')
                .setDescription(`<@&${role.id}> has been added with permission level **${levelNames[level]}** (${level}).`)
                .setColor(0x57F287)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'list') {
            const perms = getTicketPermissions.all(interaction.guild.id);

            if (perms.length === 0) {
                return interaction.reply({ content: 'No custom ticket permissions configured.', ephemeral: true });
            }

            const levelNames = { 1: 'Staff', 2: 'Mod', 3: 'Admin', 4: 'Sr Admin', 5: 'Manager' };
            const list = perms.map(p => `<@&${p.role_id}> — **${levelNames[p.level] || 'Unknown'}** (Level ${p.level})`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('📋 Ticket Permissions')
                .setDescription(list)
                .setColor(0x5865F2)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
            const role = interaction.options.getRole('role');
            removeTicketPermission.run(role.id, interaction.guild.id);

            const embed = new EmbedBuilder()
                .setTitle('❌ Permission Removed')
                .setDescription(`<@&${role.id}> has been removed from the ticket system.`)
                .setColor(0xED4245)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }
    },
};
