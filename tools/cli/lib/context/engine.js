const {
  openDb,
  getActiveSession,
  switchSession: dbSwitchSession,
  listSessions: dbListSessions,
  storeContext: dbStoreContext,
  storeEmbedding,
  vectorSearch: dbVectorSearch,
  listContexts: dbListContexts,
  exportContexts: dbExportContexts,
  importContexts: dbImportContexts,
} = require('./db');
const { generateEmbedding, localEmbedding } = require('./embeddings');

async function store(projectDir, key, content, namespace = 'default', metadata = null) {
  const { db, hasVec } = openDb(projectDir);
  const session = getActiveSession(db);

  const contextId = dbStoreContext(db, {
    session_id: session.id,
    namespace,
    key,
    content,
    metadata,
  });

  if (hasVec) {
    let embedding;
    try {
      embedding = await generateEmbedding(projectDir, `${key} ${content}`);
    } catch {
      embedding = localEmbedding(`${key} ${content}`);
    }
    storeEmbedding(db, contextId, embedding);
  }

  db.close();
  return { contextId, session: session.name };
}

async function search(projectDir, query, topK = 5) {
  const { db, hasVec } = openDb(projectDir);

  if (hasVec) {
    let embedding;
    try {
      embedding = await generateEmbedding(projectDir, query);
    } catch {
      embedding = localEmbedding(query);
    }
    const results = dbVectorSearch(db, embedding, topK);
    db.close();
    if (results.length > 0) return results;
  }

  // Fallback: keyword search
  const session = getActiveSession(db);
  const all = dbListContexts(db, session.id, 'all');
  db.close();

  const queryLower = query.toLowerCase();
  const scored = all
    .map((ctx) => {
      const text = `${ctx.key} ${ctx.content}`.toLowerCase();
      let score = 0;
      for (const word of queryLower.split(/\s+/)) {
        if (text.includes(word)) score++;
      }
      return { ...ctx, score, distance: score > 0 ? 1 / score : 999 };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

function list(projectDir, namespace) {
  const { db } = openDb(projectDir);
  const session = getActiveSession(db);
  const contexts = dbListContexts(db, session.id, namespace || 'all');
  db.close();
  return { session, contexts };
}

function switchContext(projectDir, sessionName) {
  const { db } = openDb(projectDir);
  const session = dbSwitchSession(db, sessionName);
  db.close();
  return session;
}

function sessions(projectDir) {
  const { db } = openDb(projectDir);
  const result = dbListSessions(db);
  db.close();
  return result;
}

function exportData(projectDir) {
  const { db } = openDb(projectDir);
  const session = getActiveSession(db);
  const data = dbExportContexts(db, session.id);
  db.close();
  return data;
}

function importData(projectDir, data) {
  const { db } = openDb(projectDir);
  const count = dbImportContexts(db, data);
  db.close();
  return count;
}

module.exports = { store, search, list, switchContext, sessions, exportData, importData };
