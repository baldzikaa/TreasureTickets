const config = require('../config');

function getPermissionLevel(member) {
    let highest = 0;
    let name = 'None';

    for (const [roleId, info] of Object.entries(config.permissionLevels)) {
        if (member.roles.cache.has(roleId) && info.level > highest) {
            highest = info.level;
            name = info.name;
        }
    }

    return { level: highest, name };
}

function hasPermission(member, requiredLevel) {
    const { level } = getPermissionLevel(member);
    return level >= requiredLevel;
}

function getPermissionName(level) {
    const names = {
        1: 'Staff',
        2: 'Mod',
        3: 'Admin',
        4: 'Sr Admin',
        5: 'Manager',
    };
    return names[level] || 'Unknown';
}

module.exports = { getPermissionLevel, hasPermission, getPermissionName };
