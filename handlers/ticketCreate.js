const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../config');
const { createTicket } = require('../database');

async function handleModalSubmit(interaction) {
    const type = interaction.customId.replace('ticket_modal_', '');
    const panelInfo = config.panelTypes[type];
    if (!panelInfo) return;

    await interaction.deferReply({ ephemeral: true });

    const response = interaction.fields.getTextInputValue('ticket_question');
    const guild = interaction.guild;
    const user = interaction.user;

    const ticketName = `${type}-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    const permissionOverwrites = [
        {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
        },
        {
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory],
        },
    ];

    if (panelInfo.adminOnly) {
        permissionOverwrites.push({
            id: config.roles.admin,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
        });
        permissionOverwrites.push({
            id: config.roles.srAdmin,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
        });
        permissionOverwrites.push({
            id: config.roles.manager,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
        });
        permissionOverwrites.push({
            id: config.roles.owner,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
        });
        permissionOverwrites.push({
            id: config.roles.dev,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
        });
    } else {
        permissionOverwrites.push({
            id: config.roles.staffTeam,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
        });
    }

    let ticketChannel;
    try {
        ticketChannel = await guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: panelInfo.category,
            permissionOverwrites,
        });
    } catch (error) {
        console.error('Error creating ticket channel:', error);
        return interaction.editReply({ content: 'Failed to create ticket channel. Please contact an administrator.' });
    }

    createTicket.run(ticketChannel.id, guild.id, user.id, type, response);

    const welcomeEmbed = new EmbedBuilder()
        .setTitle(`${panelInfo.emoji} ${panelInfo.label}`)
        .setDescription(`Welcome <@${user.id}>!\n\nA staff member will be with you shortly.\nPlease provide as much detail as possible about your issue.`)
        .addFields(
            { name: '📝 Response', value: response },
            { name: '👤 Created By', value: `<@${user.id}>`, inline: true },
            { name: '📂 Type', value: panelInfo.label, inline: true },
        )
        .setColor(panelInfo.color)
        .setTimestamp()
        .setFooter({ text: 'TreasureMC Ticket System' });

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setEmoji('🙋').setStyle(ButtonStyle.Success),
    );

    await ticketChannel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed], components: [actionRow] });

    const logChannel = guild.channels.cache.get(config.channels.ticketLogs);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('📩 Ticket Created')
            .addFields(
                { name: 'User', value: `<@${user.id}> (${user.id})`, inline: true },
                { name: 'Type', value: panelInfo.label, inline: true },
                { name: 'Channel', value: `<#${ticketChannel.id}>`, inline: true },
            )
            .setColor(0x57F287)
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }

    await interaction.editReply({ content: `Your ticket has been created: <#${ticketChannel.id}>` });
}

module.exports = { handleModalSubmit };
