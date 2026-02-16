const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getTicketByChannel } = require('../database');
const { hasPermission } = require('../utils/permissions');
const { performClose } = require('./ticketClose');

const activeTimers = new Map();

async function sendCloseRequest(interaction, reason) {
    const ticket = getTicketByChannel.get(interaction.channel.id);
    if (!ticket) {
        return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('🔔 Close Request')
        .setDescription(`<@${interaction.user.id}> has requested to close this ticket.\n\nThis ticket will be automatically closed <t:${Math.floor((Date.now() + 7200000) / 1000)}:R> if no response is given.${reason ? `\n\n**Reason:** ${reason}` : ''}`)
        .setColor(0xFEE75C)
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('closerequest_confirm').setLabel('Close Now').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('closerequest_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({ content: `<@${ticket.creator_id}>`, embeds: [embed], components: [row] });

    const timer = setTimeout(async () => {
        activeTimers.delete(interaction.channel.id);
        try {
            const fakeInteraction = {
                channel: interaction.channel,
                guild: interaction.guild,
                client: interaction.client,
                user: interaction.user,
                deferUpdate: async () => { },
                reply: async (opts) => interaction.channel.send(typeof opts === 'string' ? opts : opts),
            };
            await performClose(fakeInteraction, interaction.user.id, reason || 'Auto-closed: No response to close request');
        } catch (e) {
            console.error('Auto-close error:', e);
        }
    }, 7200000);

    activeTimers.set(interaction.channel.id, timer);
}

async function handleCloseRequestConfirm(interaction) {
    const timer = activeTimers.get(interaction.channel.id);
    if (timer) {
        clearTimeout(timer);
        activeTimers.delete(interaction.channel.id);
    }
    await performClose(interaction, interaction.user.id, 'Close request confirmed');
}

async function handleCloseRequestCancel(interaction) {
    const timer = activeTimers.get(interaction.channel.id);
    if (timer) {
        clearTimeout(timer);
        activeTimers.delete(interaction.channel.id);
    }

    await interaction.message.delete().catch(() => { });

    const embed = new EmbedBuilder()
        .setDescription('Close request has been cancelled.')
        .setColor(0x57F287);

    await interaction.reply({ embeds: [embed] });
}

module.exports = { sendCloseRequest, handleCloseRequestConfirm, handleCloseRequestCancel };
