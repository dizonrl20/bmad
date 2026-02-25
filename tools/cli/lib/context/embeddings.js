const { getActiveProvider } = require('../llm/llm-config');
const { EMBEDDING_DIM } = require('./db');

/**
 * Generate embeddings for text content.
 * Primary: use active LLM embedding endpoint. Fallback: local TF-IDF.
 */
async function generateEmbedding(projectDir, text) {
  try {
    const embedding = await apiEmbedding(projectDir, text);
    if (embedding) return embedding;
  } catch {
    // Fall through to local
  }
  return localEmbedding(text);
}

async function apiEmbedding(projectDir, text) {
  const { id, provider } = await getActiveProvider(projectDir);
  if (!provider) return null;

  const apiKey = process.env[provider.api_key_env];
  if (!apiKey) return null;

  if (id === 'gemini') {
    return geminiEmbedding(apiKey, text, provider.embedding_model || 'text-embedding-004');
  }

  if (provider.openai_compatible) {
    return openaiEmbedding(provider.base_url, apiKey, text);
  }

  return null;
}

async function geminiEmbedding(apiKey, text, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const values = data?.embedding?.values;
  if (!values) return null;
  return normalizeToLength(values, EMBEDDING_DIM);
}

async function openaiEmbedding(baseUrl, apiKey, text) {
  const res = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const values = data?.data?.[0]?.embedding;
  if (!values) return null;
  return normalizeToLength(values, EMBEDDING_DIM);
}

/**
 * Local TF-IDF based embedding (no API needed, works offline).
 * Generates a bag-of-words style vector with consistent dimensionality.
 */
function localEmbedding(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const embedding = new Float32Array(EMBEDDING_DIM);
  for (const word of words) {
    const hash = simpleHash(word);
    const idx = Math.abs(hash) % EMBEDDING_DIM;
    embedding[idx] += 1;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += embedding[i] * embedding[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < EMBEDDING_DIM; i++) embedding[i] /= norm;

  return Array.from(embedding);
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
}

function normalizeToLength(arr, targetLen) {
  if (arr.length === targetLen) return arr;
  if (arr.length > targetLen) return arr.slice(0, targetLen);
  const result = new Array(targetLen).fill(0);
  for (let i = 0; i < arr.length; i++) result[i] = arr[i];
  return result;
}

module.exports = { generateEmbedding, localEmbedding };
