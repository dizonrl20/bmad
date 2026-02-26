const { getAllProviders } = require('../llm/provider-registry');
const { readConfig } = require('../llm/llm-config');
const { openDb, upsertUsage, saveDailySnapshot, getTodayUsage, getUsageHistory } = require('./db');

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function refreshTokens(projectDir) {
  const config = await readConfig(projectDir);
  const providers = getAllProviders();
  const db = openDb(projectDir);
  const date = today();
  const results = [];

  for (const [id, provider] of Object.entries(providers)) {
    const providerConfig = config.providers?.[id];
    if (providerConfig && providerConfig.enabled === false) continue;

    const apiKey = process.env[provider.api_key_env];

    for (const model of provider.models) {
      let tokens_used = 0;
      let tokens_available = null;
      let requests_used = 0;
      let requests_available = null;

      if (model.free_tier) {
        if (model.free_tier.tpm) tokens_available = model.free_tier.tpm * 60 * 24;
        else if (model.free_tier.tokens_per_day) tokens_available = model.free_tier.tokens_per_day;
        else if (model.free_tier.tokens_per_month) tokens_available = model.free_tier.tokens_per_month;
        else if (model.free_tier.free_tokens) tokens_available = model.free_tier.free_tokens;

        if (model.free_tier.rpd) requests_available = model.free_tier.rpd;
        else if (model.free_tier.requests_per_month) requests_available = model.free_tier.requests_per_month;
      }

      // Try to get actual usage from provider API if key is set
      if (apiKey && id === 'gemini') {
        try {
          const usage = await fetchGeminiUsage(apiKey);
          if (usage) {
            tokens_used = usage.tokens_used || 0;
            requests_used = usage.requests_used || 0;
          }
        } catch {
          // Fall back to stored values
        }
      }

      const record = {
        provider: id,
        model: model.id,
        date,
        tokens_used,
        tokens_available,
        requests_used,
        requests_available,
      };

      upsertUsage(db, record);
      results.push({
        ...record,
        provider_name: provider.name,
        api_key_set: !!apiKey,
      });
    }
  }

  saveDailySnapshot(db, date, results);
  db.close();
  return results;
}

async function fetchGeminiUsage(_apiKey) {
  // Gemini doesn't have a direct usage API for free tier;
  // usage is tracked locally via token counting on each call.
  return null;
}

function getTokenStatus(projectDir) {
  const db = openDb(projectDir);
  const rows = getTodayUsage(db, today());
  db.close();
  return rows;
}

function getTokenHistory(projectDir, days = 7) {
  const db = openDb(projectDir);
  const rows = getUsageHistory(db, days);
  db.close();
  return rows;
}

function recordUsage(projectDir, provider, model, tokensIn, tokensOut) {
  const db = openDb(projectDir);
  const date = today();
  const existing = db
    .prepare('SELECT * FROM token_usage WHERE provider = ? AND model = ? AND date = ?')
    .get(provider, model, date);

  const totalTokens = tokensIn + tokensOut;
  upsertUsage(db, {
    provider,
    model,
    date,
    tokens_used: (existing?.tokens_used || 0) + totalTokens,
    tokens_available: existing?.tokens_available,
    requests_used: (existing?.requests_used || 0) + 1,
    requests_available: existing?.requests_available,
  });
  db.close();
}

module.exports = { refreshTokens, getTokenStatus, getTokenHistory, recordUsage, today };
