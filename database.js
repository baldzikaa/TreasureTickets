const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'tickets.db'));

db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT UNIQUE NOT NULL,
        guild_id TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        claimer_id TEXT,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        question_response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        closed_by TEXT,
        close_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS blacklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        added_by TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        UNIQUE(user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        UNIQUE(role_id, guild_id)
    );
`);

const createTicket = db.prepare(`
    INSERT INTO tickets (channel_id, guild_id, creator_id, type, question_response)
    VALUES (?, ?, ?, ?, ?)
`);

const getTicketByChannel = db.prepare(`
    SELECT * FROM tickets WHERE channel_id = ?
`);

const closeTicket = db.prepare(`
    UPDATE tickets SET status = 'closed', closed_at = CURRENT_TIMESTAMP, closed_by = ?, close_reason = ?
    WHERE channel_id = ?
`);

const claimTicket = db.prepare(`
    UPDATE tickets SET claimer_id = ? WHERE channel_id = ?
`);

const updateTicketType = db.prepare(`
    UPDATE tickets SET type = ? WHERE channel_id = ?
`);

const addBlacklist = db.prepare(`
    INSERT OR REPLACE INTO blacklist (user_id, guild_id, reason, added_by, expires_at)
    VALUES (?, ?, ?, ?, ?)
`);

const removeBlacklist = db.prepare(`
    DELETE FROM blacklist WHERE user_id = ? AND guild_id = ?
`);

const getBlacklist = db.prepare(`
    SELECT * FROM blacklist WHERE user_id = ? AND guild_id = ?
`);

const getAllBlacklisted = db.prepare(`
    SELECT * FROM blacklist WHERE guild_id = ?
`);

const addStat = db.prepare(`
    INSERT INTO stats (user_id, guild_id, action) VALUES (?, ?, ?)
`);

const getStats = db.prepare(`
    SELECT action, timestamp FROM stats WHERE user_id = ? AND guild_id = ?
`);

const resetStats = db.prepare(`
    DELETE FROM stats WHERE user_id = ? AND guild_id = ?
`);

const addReview = db.prepare(`
    INSERT INTO reviews (ticket_id, user_id, guild_id, rating, feedback)
    VALUES (?, ?, ?, ?, ?)
`);

const addTicketPermission = db.prepare(`
    INSERT OR REPLACE INTO ticket_permissions (role_id, guild_id, level) VALUES (?, ?, ?)
`);

const removeTicketPermission = db.prepare(`
    DELETE FROM ticket_permissions WHERE role_id = ? AND guild_id = ?
`);

const getTicketPermissions = db.prepare(`
    SELECT * FROM ticket_permissions WHERE guild_id = ?
`);

module.exports = {
    db,
    createTicket,
    getTicketByChannel,
    closeTicket,
    claimTicket,
    updateTicketType,
    addBlacklist,
    removeBlacklist,
    getBlacklist,
    getAllBlacklisted,
    addStat,
    getStats,
    resetStats,
    addReview,
    addTicketPermission,
    removeTicketPermission,
    getTicketPermissions,
};
