const prompts = require('../lib/prompts');
const {
  getAllProviders,
  getProviderIds,
  formatFreeTier,
} = require('../lib/llm/provider-registry');
const {
  readConfig,
  writeConfig,
  switchProvider,
  getActiveProvider,
  testProvider,
  getDefaultConfig,
} = require('../lib/llm/llm-config');

async function action(subcommand, args, options) {
  const projectDir = process.cwd();
  const sub = subcommand || 'status';

  try {
    switch (sub) {
      case 'list':
        await listProviders();
        break;
      case 'switch':
        await doSwitch(projectDir, args);
        break;
      case 'status':
        await showStatus(projectDir);
        break;
      case 'test':
        await doTest(projectDir);
        break;
      case 'init':
        await initConfig(projectDir);
        break;
      default:
        await prompts.log.warn(`Unknown subcommand: ${sub}. Use list, switch, status, test, or init.`);
    }
  } catch (err) {
    await prompts.log.error(err.message);
    if (process.env.BMAD_DEBUG) await prompts.log.message(err.stack);
    process.exit(1);
  }
}

async function listProviders() {
  const providers = getAllProviders();
  const color = await prompts.getColor();

  console.log('');
  console.log(color.bold('Available LLM Providers (Free Tier)'));
  console.log(color.dim('─'.repeat(80)));
  console.log(
    color.dim(
      padEnd('#', 4) +
        padEnd('Provider', 24) +
        padEnd('Model', 32) +
        'Free Tier',
    ),
  );
  console.log(color.dim('─'.repeat(80)));

  let rank = 1;
  for (const [id, provider] of Object.entries(providers)) {
    for (const model of provider.models) {
      const line =
        padEnd(String(rank), 4) +
        padEnd(provider.name, 24) +
        padEnd(model.id, 32) +
        formatFreeTier(model.free_tier);
      console.log(rank <= 3 ? color.green(line) : line);
      rank++;
    }
  }
  console.log('');
}

async function doSwitch(projectDir, args) {
  if (!args) {
    await prompts.log.warn('Usage: bmad llm switch <provider> [model]');
    await prompts.log.message('Providers: ' + getProviderIds().join(', '));
    return;
  }
  const parts = args.split(/\s+/);
  const providerId = parts[0];
  const modelId = parts[1] || undefined;
  const result = await switchProvider(projectDir, providerId, modelId);
  await prompts.log.success(`Switched to ${result.provider} / ${result.model}`);
}

async function showStatus(projectDir) {
  const color = await prompts.getColor();
  try {
    const { id, model, provider } = await getActiveProvider(projectDir);
    console.log('');
    console.log(color.bold('Active LLM Configuration'));
    console.log(color.dim('─'.repeat(50)));
    console.log(`  Provider:  ${color.green(provider?.name || id)}`);
    console.log(`  Model:     ${color.green(model)}`);
    if (provider) {
      const m = provider.models.find((x) => x.id === model);
      if (m) {
        console.log(`  Context:   ${(m.context_window / 1000).toFixed(0)}K tokens`);
        console.log(`  Free Tier: ${formatFreeTier(m.free_tier)}`);
      }
      const keySet = process.env[provider.api_key_env] ? 'SET' : 'NOT SET';
      console.log(`  API Key:   ${provider.api_key_env} = ${keySet}`);
    }
    console.log('');
  } catch {
    await prompts.log.warn('No LLM config found. Run "bmad llm init" to create one.');
  }
}

async function doTest(projectDir) {
  const { id } = await getActiveProvider(projectDir);
  await prompts.log.message(`Testing ${id}...`);
  const result = await testProvider(id);
  if (result.ok) {
    await prompts.log.success(`${id} is reachable (status: ${result.status})`);
  } else {
    await prompts.log.error(`${id} test failed: ${result.error || `HTTP ${result.status}`}`);
  }
}

async function initConfig(projectDir) {
  const config = getDefaultConfig();
  await writeConfig(projectDir, config);
  await prompts.log.success('Created llm-config.yaml with all 10 free-tier providers.');
  await prompts.log.message('Default: gemini / gemini-2.5-flash');
  await prompts.log.message('Switch with: bmad llm switch <provider> [model]');
}

function padEnd(str, len) {
  return String(str).padEnd(len);
}

module.exports = {
  command: 'llm',
  description: 'Manage LLM providers — list, switch, status, test, init',
  arguments: ['[subcommand]', '[args...]'],
  options: [],
  action: async (subcommand, args) => {
    const sub = subcommand || 'status';
    const extra = Array.isArray(args) ? args.join(' ') : args || '';
    await action(sub, extra);
  },
};
