const path = require('node:path');
const fs = require('fs-extra');

const CACHE_FILENAME = 'ai-discovery.json';
const SOURCES = [
  'https://awesomeagents.ai/tools/free-ai-inference-providers-2026/',
  'https://free-llm.com/',
];

const BUILTIN_TOP20 = [
  { rank: 1, name: 'Google Gemini', url: 'https://ai.google.dev', free_tier: true, highlight: '250K TPM, 1M context, multimodal', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'], pricing: 'free', api_compatible: 'google' },
  { rank: 2, name: 'Groq', url: 'https://groq.com', free_tier: true, highlight: '30 RPM, 1K RPD, ~180 tok/s', models: ['llama-3.3-70b-versatile', 'llama-4-scout', 'qwen-qwq-32b'], pricing: 'free', api_compatible: 'openai' },
  { rank: 3, name: 'Mistral AI', url: 'https://mistral.ai', free_tier: true, highlight: '1B tokens/month', models: ['mistral-large-latest', 'mistral-small-latest'], pricing: 'free', api_compatible: 'openai' },
  { rank: 4, name: 'DeepSeek', url: 'https://deepseek.com', free_tier: true, highlight: '5M free tokens, very cheap after', models: ['deepseek-chat', 'deepseek-reasoner'], pricing: 'free', api_compatible: 'openai' },
  { rank: 5, name: 'Cerebras', url: 'https://cerebras.ai', free_tier: true, highlight: '1M tokens/day, 30 RPM', models: ['llama-3.3-70b', 'qwen-3-32b'], pricing: 'free', api_compatible: 'openai' },
  { rank: 6, name: 'OpenRouter', url: 'https://openrouter.ai', free_tier: true, highlight: '50 RPD free, 24+ models', models: ['gemini-2.0-flash-exp:free', 'llama-3.3-70b:free'], pricing: 'free', api_compatible: 'openai' },
  { rank: 7, name: 'GitHub Models', url: 'https://github.com/marketplace/models', free_tier: true, highlight: '50-150 RPD, GPT-4o & o3', models: ['gpt-4o', 'o3-mini'], pricing: 'free', api_compatible: 'openai' },
  { rank: 8, name: 'NVIDIA NIM', url: 'https://build.nvidia.com', free_tier: true, highlight: '1K free credits', models: ['meta/llama-3.3-70b-instruct'], pricing: 'free', api_compatible: 'openai' },
  { rank: 9, name: 'Cohere', url: 'https://cohere.com', free_tier: true, highlight: '20 RPM, 1K req/month', models: ['command-r-plus', 'command-r'], pricing: 'free', api_compatible: 'cohere' },
  { rank: 10, name: 'Cloudflare Workers AI', url: 'https://developers.cloudflare.com/workers-ai', free_tier: true, highlight: '10K neurons/day', models: ['@cf/meta/llama-3.3-70b'], pricing: 'free', api_compatible: 'cloudflare' },
  { rank: 11, name: 'HuggingFace Inference', url: 'https://huggingface.co/inference-api', free_tier: true, highlight: '300+ models, small monthly credits', models: ['various'], pricing: 'free', api_compatible: 'openai' },
  { rank: 12, name: 'Together AI', url: 'https://together.ai', free_tier: true, highlight: '$5 free credits on signup', models: ['llama-3.3-70b', 'qwen-2.5-72b'], pricing: 'trial', api_compatible: 'openai' },
  { rank: 13, name: 'Fireworks AI', url: 'https://fireworks.ai', free_tier: true, highlight: '$1 free credits', models: ['llama-3.3-70b', 'qwen-2.5-72b'], pricing: 'trial', api_compatible: 'openai' },
  { rank: 14, name: 'Anthropic (Claude)', url: 'https://anthropic.com', free_tier: false, highlight: '$5 free API credits on signup', models: ['claude-sonnet-4', 'claude-haiku-3.5'], pricing: 'trial', api_compatible: 'anthropic' },
  { rank: 15, name: 'OpenAI', url: 'https://openai.com', free_tier: false, highlight: '$5 free credits (new accounts)', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'], pricing: 'trial', api_compatible: 'openai' },
  { rank: 16, name: 'SambaNova', url: 'https://sambanova.ai', free_tier: true, highlight: 'Free tier with Llama models', models: ['llama-3.3-70b'], pricing: 'free', api_compatible: 'openai' },
  { rank: 17, name: 'Lepton AI', url: 'https://lepton.ai', free_tier: true, highlight: '$10 free credits', models: ['llama-3.3-70b'], pricing: 'trial', api_compatible: 'openai' },
  { rank: 18, name: 'Perplexity', url: 'https://perplexity.ai', free_tier: false, highlight: 'Search-augmented AI, $5 credit', models: ['sonar-pro', 'sonar'], pricing: 'trial', api_compatible: 'openai' },
  { rank: 19, name: 'Alibaba Qwen', url: 'https://dashscope.aliyun.com', free_tier: true, highlight: '1M free tokens', models: ['qwen-max', 'qwen-plus'], pricing: 'free', api_compatible: 'openai' },
  { rank: 20, name: 'xAI (Grok)', url: 'https://x.ai', free_tier: false, highlight: '$25 free API credits/month', models: ['grok-3', 'grok-3-mini'], pricing: 'trial', api_compatible: 'openai' },
];

function getCachePath(projectDir) {
  return path.join(projectDir, '_bmad', '_config', CACHE_FILENAME);
}

async function readCache(projectDir) {
  const cachePath = getCachePath(projectDir);
  if (await fs.pathExists(cachePath)) {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'));
  }
  return null;
}

async function writeCache(projectDir, data) {
  const cachePath = getCachePath(projectDir);
  await fs.ensureDir(path.dirname(cachePath));
  await fs.writeFile(cachePath, JSON.stringify(data, null, 2), 'utf8');
}

async function refreshDiscovery(projectDir) {
  let providers = [...BUILTIN_TOP20];

  // Try to fetch live data from sources
  for (const source of SOURCES) {
    try {
      const res = await fetch(source, { signal: AbortSignal.timeout(10_000) });
      if (res.ok) {
        const html = await res.text();
        const scraped = parseProviders(html, source);
        if (scraped.length > 0) {
          providers = mergeProviders(providers, scraped);
        }
      }
    } catch {
      // Fall back to built-in data silently
    }
  }

  // Re-rank by free tier quality
  providers.sort((a, b) => {
    if (a.free_tier && !b.free_tier) return -1;
    if (!a.free_tier && b.free_tier) return 1;
    return a.rank - b.rank;
  });
  providers = providers.slice(0, 20).map((p, i) => ({ ...p, rank: i + 1 }));

  const result = {
    last_updated: new Date().toISOString(),
    top_providers: providers,
    sources: SOURCES,
  };

  await writeCache(projectDir, result);
  return result;
}

function parseProviders(html, _source) {
  // Basic extraction: look for provider names and tier info in HTML
  // Real scraping would use a DOM parser; this is a best-effort approach
  const providerNames = BUILTIN_TOP20.map((p) => p.name);
  const found = [];
  for (const name of providerNames) {
    if (html.includes(name)) {
      const existing = BUILTIN_TOP20.find((p) => p.name === name);
      if (existing) found.push({ ...existing, verified: true });
    }
  }
  return found;
}

function mergeProviders(base, scraped) {
  const merged = [...base];
  for (const s of scraped) {
    const idx = merged.findIndex((m) => m.name === s.name);
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...s };
    } else {
      merged.push(s);
    }
  }
  return merged;
}

function getBuiltinProviders() {
  return BUILTIN_TOP20;
}

module.exports = { refreshDiscovery, readCache, writeCache, getCachePath, getBuiltinProviders, SOURCES };
