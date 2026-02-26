const providers = {
  gemini: {
    name: 'Google Gemini',
    base_url: 'https://generativelanguage.googleapis.com/v1beta',
    api_key_env: 'GEMINI_API_KEY',
    openai_compatible: false,
    embedding_model: 'text-embedding-004',
    models: [
      {
        id: 'gemini-2.5-pro',
        context_window: 1_000_000,
        free_tier: { rpm: 5, rpd: 100, tpm: 250_000 },
      },
      {
        id: 'gemini-2.5-flash',
        context_window: 1_000_000,
        free_tier: { rpm: 10, rpd: 250, tpm: 250_000 },
      },
      {
        id: 'gemini-2.5-flash-lite',
        context_window: 1_000_000,
        free_tier: { rpm: 15, rpd: 1000, tpm: 250_000 },
      },
    ],
  },
  groq: {
    name: 'Groq',
    base_url: 'https://api.groq.com/openai/v1',
    api_key_env: 'GROQ_API_KEY',
    openai_compatible: true,
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        context_window: 131_072,
        free_tier: { rpm: 30, rpd: 1000 },
      },
      {
        id: 'llama-4-scout-17b-16e-instruct',
        context_window: 131_072,
        free_tier: { rpm: 30, rpd: 1000 },
      },
      {
        id: 'qwen-qwq-32b',
        context_window: 131_072,
        free_tier: { rpm: 30, rpd: 1000 },
      },
    ],
  },
  mistral: {
    name: 'Mistral AI',
    base_url: 'https://api.mistral.ai/v1',
    api_key_env: 'MISTRAL_API_KEY',
    openai_compatible: true,
    models: [
      {
        id: 'mistral-large-latest',
        context_window: 128_000,
        free_tier: { rpm: 2, tokens_per_month: 1_000_000_000 },
      },
      {
        id: 'mistral-small-latest',
        context_window: 128_000,
        free_tier: { rpm: 2, tokens_per_month: 1_000_000_000 },
      },
    ],
  },
  deepseek: {
    name: 'DeepSeek',
    base_url: 'https://api.deepseek.com/v1',
    api_key_env: 'DEEPSEEK_API_KEY',
    openai_compatible: true,
    models: [
      {
        id: 'deepseek-chat',
        context_window: 128_000,
        free_tier: { free_tokens: 5_000_000 },
      },
      {
        id: 'deepseek-reasoner',
        context_window: 128_000,
        free_tier: { free_tokens: 5_000_000 },
      },
    ],
  },
  cerebras: {
    name: 'Cerebras',
    base_url: 'https://api.cerebras.ai/v1',
    api_key_env: 'CEREBRAS_API_KEY',
    openai_compatible: true,
    models: [
      {
        id: 'llama-3.3-70b',
        context_window: 131_072,
        free_tier: { rpm: 30, tokens_per_day: 1_000_000 },
      },
      {
        id: 'qwen-3-32b',
        context_window: 131_072,
        free_tier: { rpm: 30, tokens_per_day: 1_000_000 },
      },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    base_url: 'https://openrouter.ai/api/v1',
    api_key_env: 'OPENROUTER_API_KEY',
    openai_compatible: true,
    models: [
      {
        id: 'google/gemini-2.0-flash-exp:free',
        context_window: 1_000_000,
        free_tier: { rpm: 20, rpd: 50 },
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        context_window: 131_072,
        free_tier: { rpm: 20, rpd: 50 },
      },
    ],
  },
  github: {
    name: 'GitHub Models',
    base_url: 'https://models.inference.ai.azure.com',
    api_key_env: 'GITHUB_TOKEN',
    openai_compatible: true,
    models: [
      {
        id: 'gpt-4o',
        context_window: 128_000,
        free_tier: { rpm: 10, rpd: 50 },
      },
      {
        id: 'o3-mini',
        context_window: 128_000,
        free_tier: { rpm: 10, rpd: 50 },
      },
    ],
  },
  nvidia: {
    name: 'NVIDIA NIM',
    base_url: 'https://integrate.api.nvidia.com/v1',
    api_key_env: 'NVIDIA_API_KEY',
    openai_compatible: true,
    models: [
      {
        id: 'meta/llama-3.3-70b-instruct',
        context_window: 131_072,
        free_tier: { credits: 1000 },
      },
    ],
  },
  cohere: {
    name: 'Cohere',
    base_url: 'https://api.cohere.com/v2',
    api_key_env: 'COHERE_API_KEY',
    openai_compatible: false,
    embedding_model: 'embed-english-v3.0',
    models: [
      {
        id: 'command-r-plus',
        context_window: 128_000,
        free_tier: { rpm: 20, requests_per_month: 1000 },
      },
      {
        id: 'command-r',
        context_window: 128_000,
        free_tier: { rpm: 20, requests_per_month: 1000 },
      },
    ],
  },
  cloudflare: {
    name: 'Cloudflare Workers AI',
    base_url: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run',
    api_key_env: 'CLOUDFLARE_API_KEY',
    openai_compatible: false,
    extra_env: { CLOUDFLARE_ACCOUNT_ID: 'account_id' },
    models: [
      {
        id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        context_window: 131_072,
        free_tier: { neurons_per_day: 10_000 },
      },
    ],
  },
};

function getAllProviders() {
  return providers;
}

function getProvider(id) {
  return providers[id] || null;
}

function getProviderIds() {
  return Object.keys(providers);
}

function getDefaultModel(providerId) {
  const provider = providers[providerId];
  if (!provider || !provider.models.length) return null;
  return provider.models[0].id;
}

function formatFreeTier(freeTier) {
  if (!freeTier) return 'N/A';
  const parts = [];
  if (freeTier.rpm) parts.push(`${freeTier.rpm} RPM`);
  if (freeTier.rpd) parts.push(`${freeTier.rpd} RPD`);
  if (freeTier.tpm) parts.push(`${(freeTier.tpm / 1000).toFixed(0)}K TPM`);
  if (freeTier.tokens_per_month)
    parts.push(`${(freeTier.tokens_per_month / 1_000_000_000).toFixed(0)}B tok/mo`);
  if (freeTier.tokens_per_day)
    parts.push(`${(freeTier.tokens_per_day / 1_000_000).toFixed(0)}M tok/day`);
  if (freeTier.free_tokens) parts.push(`${(freeTier.free_tokens / 1_000_000).toFixed(0)}M free`);
  if (freeTier.credits) parts.push(`${freeTier.credits} credits`);
  if (freeTier.neurons_per_day)
    parts.push(`${(freeTier.neurons_per_day / 1000).toFixed(0)}K neurons/day`);
  if (freeTier.requests_per_month) parts.push(`${freeTier.requests_per_month} req/mo`);
  return parts.join(', ') || 'Free';
}

module.exports = {
  getAllProviders,
  getProvider,
  getProviderIds,
  getDefaultModel,
  formatFreeTier,
};
