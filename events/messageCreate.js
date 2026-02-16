const config = require('../config');
const { hasPermission } = require('../utils/permissions');

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase().trim();

        if (config.pingRoles[content]) {
            const roleId = config.pingRoles[content];
            const member = message.member;

            if (!member || !hasPermission(member, 1)) return;

            message.channel.send(`<@&${roleId}>`);
        }
    },
};
