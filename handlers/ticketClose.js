const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const config = require('../config');
const { getTicketByChannel, closeTicket, addStat } = require('../database');
const { hasPermission } = require('../utils/permissions');
const { generateTranscript } = require('../utils/transcript');

async function handleCloseButton(interaction) {
    if (!hasPermission(interaction.member, 1)) {
        return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('🔒 Close Ticket')
        .setDescription('Are you sure you want to close this ticket?')
        .setColor(0xED4245);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
}

async function handleCloseConfirm(interaction) {
    await performClose(interaction, interaction.user.id, null);
}

async function handleCloseCancel(interaction) {
    await interaction.message.delete().catch(() => { });
    await interaction.deferUpdate().catch(() => { });
}

async function performClose(interaction, closerId, reason) {
    const ticket = getTicketByChannel.get(interaction.channel.id);
    if (!ticket) {
        return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
    }

    if (ticket.status === 'closed') {
        return interaction.reply({ content: 'This ticket is already closed.', ephemeral: true });
    }

    await interaction.deferUpdate().catch(() => { });

    const transcript = await generateTranscript(interaction.channel);

    closeTicket.run(closerId, reason, interaction.channel.id);
    addStat.run(closerId, interaction.guild.id, 'close');

    const logChannel = interaction.guild.channels.cache.get(config.channels.ticketLogs);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .addFields(
                { name: 'Ticket', value: `#${interaction.channel.name}`, inline: true },
                { name: 'Closed By', value: `<@${closerId}>`, inline: true },
                { name: 'Created By', value: `<@${ticket.creator_id}>`, inline: true },
                { name: 'Type', value: ticket.type, inline: true },
            )
            .setColor(0xED4245)
            .setTimestamp();

        if (reason) logEmbed.addFields({ name: 'Reason', value: reason });

        const attachment = new AttachmentBuilder(transcript, { name: `transcript-${interaction.channel.name}.txt` });
        await logChannel.send({ embeds: [logEmbed], files: [attachment] });
    }

    try {
        const creator = await interaction.client.users.fetch(ticket.creator_id).catch(() => null);
        if (creator) {
            const dmEmbed = new EmbedBuilder()
                .setTitle('🔒 Ticket Closed')
                .setDescription(`Your ticket **#${interaction.channel.name}** has been closed.${reason ? `\n\n**Reason:** ${reason}` : ''}`)
                .setColor(0xED4245)
                .setTimestamp();
            await creator.send({ embeds: [dmEmbed] }).catch(() => { });
        }
    } catch (e) { }

    setTimeout(async () => {
        await interaction.channel.delete().catch(() => { });
    }, 3000);
}

module.exports = { handleCloseButton, handleCloseConfirm, handleCloseCancel, performClose };
