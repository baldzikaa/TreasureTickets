const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { addReview, getTicketByChannel } = require('../database');

async function handleReviewModal(interaction) {
    const rating = parseInt(interaction.fields.getTextInputValue('review_rating'));
    const feedback = interaction.fields.getTextInputValue('review_feedback');

    if (isNaN(rating) || rating < 1 || rating > 5) {
        return interaction.reply({ content: 'Rating must be a number between 1 and 5.', ephemeral: true });
    }

    const ticket = getTicketByChannel.get(interaction.channel.id);
    const ticketId = ticket ? ticket.id : null;

    addReview.run(ticketId, interaction.user.id, interaction.guild.id, rating, feedback);

    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    const embed = new EmbedBuilder()
        .setTitle('📝 Review Submitted')
        .setDescription(`Thank you for your feedback!`)
        .addFields(
            { name: 'Rating', value: stars, inline: true },
            { name: 'Reviewer', value: `<@${interaction.user.id}>`, inline: true },
        )
        .setColor(0x57F287)
        .setTimestamp();

    if (feedback) embed.addFields({ name: 'Feedback', value: feedback });

    await interaction.reply({ embeds: [embed] });

    const logChannel = interaction.guild.channels.cache.get(config.channels.ticketLogs);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('📝 New Review')
            .addFields(
                { name: 'Rating', value: stars, inline: true },
                { name: 'Reviewer', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Ticket', value: interaction.channel.name, inline: true },
            )
            .setColor(0xFEE75C)
            .setTimestamp();
        if (feedback) logEmbed.addFields({ name: 'Feedback', value: feedback });
        await logChannel.send({ embeds: [logEmbed] });
    }
}

module.exports = { handleReviewModal };
