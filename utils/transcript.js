async function generateTranscript(channel) {
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        allMessages.push(...messages.values());
        lastId = messages.last().id;

        if (messages.size < 100) break;
    }

    allMessages.reverse();

    let transcript = `Transcript for #${channel.name}\n`;
    transcript += `Generated at ${new Date().toUTCString()}\n`;
    transcript += '═'.repeat(60) + '\n\n';

    for (const msg of allMessages) {
        const time = msg.createdAt.toUTCString();
        const author = `${msg.author.tag} (${msg.author.id})`;
        transcript += `[${time}] ${author}\n`;

        if (msg.content) {
            transcript += `${msg.content}\n`;
        }

        if (msg.attachments.size > 0) {
            for (const att of msg.attachments.values()) {
                transcript += `[Attachment: ${att.name} - ${att.url}]\n`;
            }
        }

        if (msg.embeds.length > 0) {
            transcript += `[${msg.embeds.length} embed(s)]\n`;
        }

        transcript += '\n';
    }

    return Buffer.from(transcript, 'utf-8');
}

module.exports = { generateTranscript };
