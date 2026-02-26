const path = require('node:path');
const fs = require('fs-extra');
const yaml = require('yaml');
const { getProvider, getDefaultModel, getAllProviders } = require('./provider-registry');

const CONFIG_FILENAME = 'llm-config.yaml';

function getConfigPath(projectDir) {
  return path.join(projectDir, '_bmad', '_config', CONFIG_FILENAME);
}

async function readConfig(projectDir) {
  const configPath = getConfigPath(projectDir);
  if (!(await fs.pathExists(configPath))) {
    return getDefaultConfig();
  }
  const raw = await fs.readFile(configPath, 'utf8');
  return yaml.parse(raw) || getDefaultConfig();
}

async function writeConfig(projectDir, config) {
  const configPath = getConfigPath(projectDir);
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeFile(configPath, yaml.stringify(config, { lineWidth: 120 }), 'utf8');
}

function getDefaultConfig() {
  return {
    active_provider: 'gemini',
    active_model: 'gemini-2.5-flash',
    providers: buildProviderConfig(),
  };
}

function buildProviderConfig() {
  const all = getAllProviders();
  const config = {};
  for (const [id, provider] of Object.entries(all)) {
    config[id] = {
      name: provider.name,
      base_url: provider.base_url,
      api_key_env: provider.api_key_env,
      enabled: true,
      models: provider.models.map((m) => ({
        id: m.id,
        context_window: m.context_window,
        free_tier: m.free_tier,
      })),
    };
    if (provider.extra_env) config[id].extra_env = provider.extra_env;
  }
  return config;
}

async function switchProvider(projectDir, providerId, modelId) {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}. Use "bmad llm list" to see available providers.`);
  }

  const model = modelId || getDefaultModel(providerId);
  const validModel = provider.models.find((m) => m.id === model);
  if (!validModel) {
    const available = provider.models.map((m) => m.id).join(', ');
    throw new Error(`Unknown model "${model}" for ${provider.name}. Available: ${available}`);
  }

  const config = await readConfig(projectDir);
  config.active_provider = providerId;
  config.active_model = model;
  await writeConfig(projectDir, config);
  return { provider: provider.name, model };
}

async function getActiveProvider(projectDir) {
  const config = await readConfig(projectDir);
  const provider = getProvider(config.active_provider);
  return {
    id: config.active_provider,
    model: config.active_model,
    provider,
    config,
  };
}

async function testProvider(providerId) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  const apiKey = process.env[provider.api_key_env];
  if (!apiKey) {
    return { ok: false, error: `Missing env var: ${provider.api_key_env}` };
  }

  try {
    if (provider.openai_compatible) {
      const res = await fetch(`${provider.base_url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000),
      });
      return { ok: res.ok, status: res.status };
    }

    if (providerId === 'gemini') {
      const res = await fetch(
        `${provider.base_url}/models?key=${apiKey}`,
        { signal: AbortSignal.timeout(10_000) },
      );
      return { ok: res.ok, status: res.status };
    }

    return { ok: true, status: 'untested (no test endpoint)' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  readConfig,
  writeConfig,
  getConfigPath,
  getDefaultConfig,
  switchProvider,
  getActiveProvider,
  testProvider,
};
