module.exports = {
    categories: {
        'General Support': '1449560619236982904',
        'Punishment Appeals': '1449560621908496404',
        'Billing Support': '1449560623896592545',
        'Bug Reports': '1469820082606571683',
        'Player Reports': '1469819984111997200',
        'Staff Reports': '1469820027514392638',
    },

    channels: {
        ticketLogs: '1426291562295459850',
        ticketPanel: '1450066933436252210',
    },

    roles: {
        staffTeam: '1421909596900954162',
        helper: '1422466770878333051',
        jrMod: '1422466818542403645',
        mod: '1422466789924667473',
        srMod: '1422472013880234054',
        admin: '1422466832815751259',
        srAdmin: '1422466862473809991',
        dev: '1421910092688920760',
        manager: '1421910130122948671',
        owner: '1421909422640201878',
    },

    permissionLevels: {
        '1421909596900954162': { level: 1, name: 'Staff' },
        '1422466770878333051': { level: 1, name: 'Helper' },
        '1422466818542403645': { level: 1, name: 'Jr Mod' },
        '1422466789924667473': { level: 2, name: 'Mod' },
        '1422472013880234054': { level: 2, name: 'Sr Mod' },
        '1422466832815751259': { level: 3, name: 'Admin' },
        '1422466862473809991': { level: 4, name: 'Sr Admin' },
        '1421910092688920760': { level: 3, name: 'Dev' },
        '1421910130122948671': { level: 5, name: 'Manager' },
        '1421909422640201878': { level: 5, name: 'Owner' },
    },

    pingRoles: {
        '!helper': '1422466770878333051',
        '!jrmod': '1422466818542403645',
        '!mod': '1422466789924667473',
        '!srmod': '1422472013880234054',
        '!admin': '1422466832815751259',
        '!sradmin': '1422466862473809991',
        '!dev': '1421910092688920760',
        '!manager': '1421910130122948671',
        '!owner': '1421909422640201878',
    },

    panelTypes: {
        'general': {
            label: 'General Support',
            emoji: '📩',
            category: '1449560619236982904',
            question: 'Please describe your issue in detail.',
            color: 0x5865F2,
        },
        'billing': {
            label: 'Billing Support',
            emoji: '💳',
            category: '1449560623896592545',
            question: 'Please describe your billing issue in detail.',
            color: 0x57F287,
        },
        'appeal': {
            label: 'Punishment Appeal',
            emoji: '⚖️',
            category: '1449560621908496404',
            question: 'What punishment are you appealing and why should it be lifted?',
            color: 0xFEE75C,
        },
        'bug': {
            label: 'Bug Reports',
            emoji: '🐛',
            category: '1469820082606571683',
            question: 'Please describe the bug you encountered. Include steps to reproduce it.',
            color: 0xED4245,
        },
        'player': {
            label: 'Player Reports',
            emoji: '🚨',
            category: '1469819984111997200',
            question: 'Which player are you reporting and what did they do?',
            color: 0xEB459E,
        },
        'staff': {
            label: 'Staff Reports',
            emoji: '🛡️',
            category: '1469820027514392638',
            question: 'Which staff member are you reporting and what happened?',
            color: 0xE67E22,
            adminOnly: true,
        },
    },
};
