const path = require('node:path');
const fs = require('fs-extra');

const DB_FILENAME = 'tokens.sqlite';

let Database;
function getDatabase() {
  if (!Database) {
    try {
      Database = require('better-sqlite3');
    } catch {
      throw new Error(
        'better-sqlite3 is required for token tracking. Run: npm install better-sqlite3',
      );
    }
  }
  return Database;
}

function getDbPath(projectDir) {
  return path.join(projectDir, '_bmad', '_config', DB_FILENAME);
}

function openDb(projectDir) {
  const DB = getDatabase();
  const dbPath = getDbPath(projectDir);
  fs.ensureDirSync(path.dirname(dbPath));
  const db = new DB(dbPath);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      date TEXT NOT NULL,
      tokens_used INTEGER DEFAULT 0,
      tokens_available INTEGER,
      requests_used INTEGER DEFAULT 0,
      requests_available INTEGER,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      snapshot_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_usage_date ON token_usage(date);
    CREATE INDEX IF NOT EXISTS idx_usage_provider ON token_usage(provider, date);
  `);
}

function upsertUsage(db, { provider, model, date, tokens_used, tokens_available, requests_used, requests_available }) {
  const existing = db
    .prepare('SELECT id FROM token_usage WHERE provider = ? AND model = ? AND date = ?')
    .get(provider, model, date);

  if (existing) {
    db.prepare(
      `UPDATE token_usage
       SET tokens_used = ?, tokens_available = ?, requests_used = ?, requests_available = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
    ).run(tokens_used, tokens_available, requests_used, requests_available, existing.id);
  } else {
    db.prepare(
      `INSERT INTO token_usage (provider, model, date, tokens_used, tokens_available, requests_used, requests_available)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(provider, model, date, tokens_used, tokens_available, requests_used, requests_available);
  }
}

function saveDailySnapshot(db, date, snapshot) {
  db.prepare(
    `INSERT OR REPLACE INTO daily_snapshot (date, snapshot_json) VALUES (?, ?)`,
  ).run(date, JSON.stringify(snapshot));
}

function getTodayUsage(db, date) {
  return db.prepare('SELECT * FROM token_usage WHERE date = ? ORDER BY provider').all(date);
}

function getUsageHistory(db, days) {
  return db
    .prepare(
      `SELECT * FROM token_usage WHERE date >= date('now', '-' || ? || ' days') ORDER BY date DESC, provider`,
    )
    .all(days);
}

function getSnapshots(db, days) {
  return db
    .prepare(
      `SELECT * FROM daily_snapshot WHERE date >= date('now', '-' || ? || ' days') ORDER BY date DESC`,
    )
    .all(days);
}

module.exports = { openDb, getDbPath, upsertUsage, saveDailySnapshot, getTodayUsage, getUsageHistory, getSnapshots };
