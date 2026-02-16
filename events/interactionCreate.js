const { InteractionType } = require('discord.js');
const { handlePanelButton } = require('../handlers/ticketPanel');
const { handleModalSubmit } = require('../handlers/ticketCreate');
const { handleCloseButton, handleCloseConfirm, handleCloseCancel } = require('../handlers/ticketClose');
const { handleClaimButton } = require('../handlers/ticketClaim');
const { handleCloseRequestConfirm, handleCloseRequestCancel } = require('../handlers/closeRequest');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);
                const reply = { content: 'An error occurred while executing this command.', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
            return;
        }

        if (interaction.isButton()) {
            const id = interaction.customId;

            if (id.startsWith('ticket_')) {
                await handlePanelButton(interaction);
                return;
            }

            if (id === 'close_ticket') {
                await handleCloseButton(interaction);
                return;
            }

            if (id === 'close_confirm') {
                await handleCloseConfirm(interaction);
                return;
            }

            if (id === 'close_cancel') {
                await handleCloseCancel(interaction);
                return;
            }

            if (id === 'claim_ticket') {
                await handleClaimButton(interaction);
                return;
            }

            if (id === 'closerequest_confirm') {
                await handleCloseRequestConfirm(interaction);
                return;
            }

            if (id === 'closerequest_cancel') {
                await handleCloseRequestCancel(interaction);
                return;
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('ticket_modal_')) {
                await handleModalSubmit(interaction);
                return;
            }

            if (interaction.customId === 'review_modal') {
                const { handleReviewModal } = require('../handlers/reviewHandler');
                await handleReviewModal(interaction);
                return;
            }
        }
    },
};
