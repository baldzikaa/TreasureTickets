const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../config');
const { getBlacklist } = require('../database');

async function sendPanel(channel) {
    const embed = new EmbedBuilder()
        .setTitle('🎫 TreasureMC Support')
        .setDescription('Welcome to TreasureMC Support!\nPlease select the appropriate category below to create a ticket.\n\n' +
            '📩 **General Support** — General questions or issues\n' +
            '💳 **Billing Support** — Payment or billing issues\n' +
            '⚖️ **Punishment Appeal** — Appeal a punishment\n' +
            '🐛 **Bug Reports** — Report a bug\n' +
            '🚨 **Player Reports** — Report a player\n' +
            '🛡️ **Staff Reports** — Report a staff member')
        .setColor(0x2B2D31)
        .setFooter({ text: 'TreasureMC Ticket System' })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_general').setLabel('General Support').setEmoji('📩').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_billing').setLabel('Billing Support').setEmoji('💳').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_appeal').setLabel('Punishment Appeal').setEmoji('⚖️').setStyle(ButtonStyle.Secondary),
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_bug').setLabel('Bug Reports').setEmoji('🐛').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_player').setLabel('Player Reports').setEmoji('🚨').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_staff').setLabel('Staff Reports').setEmoji('🛡️').setStyle(ButtonStyle.Secondary),
    );

    await channel.send({ embeds: [embed], components: [row1, row2] });
}

async function handlePanelButton(interaction) {
    const type = interaction.customId.replace('ticket_', '');
    const panelInfo = config.panelTypes[type];
    if (!panelInfo) return;

    const blacklistEntry = getBlacklist.get(interaction.user.id, interaction.guild.id);
    if (blacklistEntry) {
        const now = new Date();
        if (!blacklistEntry.expires_at || new Date(blacklistEntry.expires_at) > now) {
            const expiry = blacklistEntry.expires_at ? `<t:${Math.floor(new Date(blacklistEntry.expires_at).getTime() / 1000)}:R>` : 'Permanent';
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('❌ Blacklisted - You are blacklisted from creating tickets.')
                    .setDescription(`You are blacklisted from creating tickets.\n\n**Reason:** ${blacklistEntry.reason}\n**Expires:** ${expiry}`)
                    .setColor(0xED4245)],
                ephemeral: true,
            });
        }
    }

    const modal = new ModalBuilder()
        .setCustomId(`ticket_modal_${type}`)
        .setTitle(`${panelInfo.label}`);

    const input = new TextInputBuilder()
        .setCustomId('ticket_question')
        .setLabel(panelInfo.question.substring(0, 45))
        .setPlaceholder(panelInfo.question)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1024);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
}

module.exports = { sendPanel, handlePanelButton };


