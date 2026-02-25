const path = require('node:path');
const fs = require('fs-extra');

const DB_FILENAME = 'context.sqlite';
const EMBEDDING_DIM = 384;

let Database;
function getDatabase() {
  if (!Database) {
    try {
      Database = require('better-sqlite3');
    } catch {
      throw new Error('better-sqlite3 is required. Run: npm install better-sqlite3');
    }
  }
  return Database;
}

function loadVecExtension(db) {
  try {
    const sqliteVec = require('sqlite-vec');
    sqliteVec.load(db);
    return true;
  } catch {
    return false;
  }
}

function getDbPath(projectDir) {
  return path.join(projectDir, '_bmad', '_memory', DB_FILENAME);
}

function openDb(projectDir) {
  const DB = getDatabase();
  const dbPath = getDbPath(projectDir);
  fs.ensureDirSync(path.dirname(dbPath));
  const db = new DB(dbPath);
  db.pragma('journal_mode = WAL');

  const hasVec = loadVecExtension(db);
  initSchema(db, hasVec);
  return { db, hasVec };
}

function initSchema(db, hasVec) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contexts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      namespace TEXT DEFAULT 'default',
      key TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_ctx_session ON contexts(session_id);
    CREATE INDEX IF NOT EXISTS idx_ctx_namespace ON contexts(namespace);
    CREATE INDEX IF NOT EXISTS idx_ctx_key ON contexts(key);
  `);

  if (hasVec) {
    try {
      db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS context_embeddings USING vec0(
          context_id INTEGER PRIMARY KEY,
          embedding FLOAT[${EMBEDDING_DIM}]
        );
      `);
    } catch {
      // vec0 table may already exist with different schema; ignore
    }
  }

  // Ensure a default session exists
  const defaultSession = db.prepare('SELECT id FROM sessions WHERE id = ?').get('default');
  if (!defaultSession) {
    db.prepare('INSERT INTO sessions (id, name, description, active) VALUES (?, ?, ?, 1)').run(
      'default',
      'Default',
      'Default context session',
    );
  }
}

function getActiveSession(db) {
  return db.prepare('SELECT * FROM sessions WHERE active = 1').get() || { id: 'default', name: 'Default' };
}

function switchSession(db, sessionName) {
  let session = db.prepare('SELECT * FROM sessions WHERE name = ? OR id = ?').get(sessionName, sessionName);
  if (!session) {
    const id = sessionName.toLowerCase().replace(/\s+/g, '-');
    db.prepare('INSERT INTO sessions (id, name, active) VALUES (?, ?, 0)').run(id, sessionName);
    session = { id, name: sessionName };
  }
  db.prepare('UPDATE sessions SET active = 0').run();
  db.prepare('UPDATE sessions SET active = 1 WHERE id = ?').run(session.id);
  return session;
}

function listSessions(db) {
  return db.prepare('SELECT * FROM sessions ORDER BY active DESC, name').all();
}

function storeContext(db, { session_id, namespace, key, content, metadata }) {
  const metaJson = metadata ? JSON.stringify(metadata) : null;
  const existing = db
    .prepare('SELECT id FROM contexts WHERE session_id = ? AND namespace = ? AND key = ?')
    .get(session_id, namespace, key);

  let contextId;
  if (existing) {
    db.prepare(
      `UPDATE contexts SET content = ?, metadata_json = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(content, metaJson, existing.id);
    contextId = existing.id;
  } else {
    const result = db
      .prepare('INSERT INTO contexts (session_id, namespace, key, content, metadata_json) VALUES (?, ?, ?, ?, ?)')
      .run(session_id, namespace, key, content, metaJson);
    contextId = result.lastInsertRowid;
  }
  return contextId;
}

function storeEmbedding(db, contextId, embedding) {
  try {
    const buf = new Float32Array(embedding).buffer;
    db.prepare('INSERT OR REPLACE INTO context_embeddings (context_id, embedding) VALUES (?, ?)').run(
      contextId,
      Buffer.from(buf),
    );
  } catch {
    // sqlite-vec not available or error; skip
  }
}

function vectorSearch(db, queryEmbedding, topK = 5) {
  try {
    const buf = new Float32Array(queryEmbedding).buffer;
    const rows = db
      .prepare(
        `SELECT context_id, distance
         FROM context_embeddings
         WHERE embedding MATCH ?
         ORDER BY distance
         LIMIT ?`,
      )
      .all(Buffer.from(buf), topK);

    const contextIds = rows.map((r) => r.context_id);
    if (contextIds.length === 0) return [];

    const placeholders = contextIds.map(() => '?').join(',');
    const contexts = db
      .prepare(`SELECT * FROM contexts WHERE id IN (${placeholders})`)
      .all(...contextIds);

    return rows.map((r) => {
      const ctx = contexts.find((c) => c.id === r.context_id);
      return { ...ctx, distance: r.distance };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function listContexts(db, sessionId, namespace) {
  let query = 'SELECT * FROM contexts WHERE session_id = ?';
  const params = [sessionId];
  if (namespace && namespace !== 'all') {
    query += ' AND namespace = ?';
    params.push(namespace);
  }
  query += ' ORDER BY updated_at DESC';
  return db.prepare(query).all(...params);
}

function exportContexts(db, sessionId) {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  const contexts = db.prepare('SELECT * FROM contexts WHERE session_id = ?').all(sessionId);
  return { session, contexts };
}

function importContexts(db, data) {
  const { session, contexts } = data;
  if (session) {
    const existing = db.prepare('SELECT id FROM sessions WHERE id = ?').get(session.id);
    if (!existing) {
      db.prepare('INSERT INTO sessions (id, name, description, active) VALUES (?, ?, ?, 0)').run(
        session.id,
        session.name,
        session.description || '',
      );
    }
  }
  let count = 0;
  for (const ctx of contexts || []) {
    storeContext(db, {
      session_id: ctx.session_id,
      namespace: ctx.namespace,
      key: ctx.key,
      content: ctx.content,
      metadata: ctx.metadata_json ? JSON.parse(ctx.metadata_json) : null,
    });
    count++;
  }
  return count;
}

module.exports = {
  openDb,
  getDbPath,
  getActiveSession,
  switchSession,
  listSessions,
  storeContext,
  storeEmbedding,
  vectorSearch,
  listContexts,
  exportContexts,
  importContexts,
  EMBEDDING_DIM,
};
