const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Leave a review for your ticket experience'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('review_modal')
            .setTitle('Ticket Review');

        const ratingInput = new TextInputBuilder()
            .setCustomId('review_rating')
            .setLabel('Rating (1-5)')
            .setPlaceholder('Enter a number between 1 and 5')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(1);

        const feedbackInput = new TextInputBuilder()
            .setCustomId('review_feedback')
            .setLabel('Feedback')
            .setPlaceholder('Tell us about your experience')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(1024);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ratingInput),
            new ActionRowBuilder().addComponents(feedbackInput),
        );

        await interaction.showModal(modal);
    },
};
