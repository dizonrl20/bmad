const prompts = require('../lib/prompts');
const { refreshDiscovery, readCache, getBuiltinProviders } = require('../lib/discovery/scanner');

async function action() {
  const projectDir = process.cwd();
  const sub = process.argv[3] || 'show';
  const formatArg = process.argv.indexOf('--format');
  const format = formatArg > -1 ? process.argv[formatArg + 1] : 'table';

  try {
    switch (sub) {
      case 'show':
        await showDiscovery(projectDir, format);
        break;
      case 'refresh':
        await doRefresh(projectDir, format);
        break;
      default:
        await prompts.log.warn(`Unknown subcommand: ${sub}. Use show or refresh.`);
    }
  } catch (err) {
    await prompts.log.error(err.message);
    if (process.env.BMAD_DEBUG) await prompts.log.message(err.stack);
    process.exit(1);
  }
}

async function showDiscovery(projectDir, format) {
  let data = await readCache(projectDir);
  if (!data) {
    data = {
      last_updated: 'built-in (run "bmad ai-discover refresh" to update)',
      top_providers: getBuiltinProviders(),
    };
  }
  renderOutput(data, format);
}

async function doRefresh(projectDir, format) {
  await prompts.log.message('Scanning AI provider sources...');
  const data = await refreshDiscovery(projectDir);
  await prompts.log.success(`Discovery cache updated: ${data.top_providers.length} providers.`);
  renderOutput(data, format);
}

function renderOutput(data, format) {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    case 'md':
      renderMarkdown(data);
      break;
    default:
      renderTable(data);
  }
}

async function renderTable(data) {
  const color = await prompts.getColor();
  console.log('');
  console.log(color.bold('Top 20 AI Providers'));
  console.log(color.dim(`Last updated: ${data.last_updated}`));
  console.log(color.dim('─'.repeat(100)));
  console.log(
    color.dim(
      pad('#', 4) +
        pad('Provider', 26) +
        pad('Free?', 7) +
        pad('Highlight', 40) +
        'API Type',
    ),
  );
  console.log(color.dim('─'.repeat(100)));

  for (const p of data.top_providers) {
    const line =
      pad(String(p.rank), 4) +
      pad(p.name, 26) +
      pad(p.free_tier ? 'YES' : 'trial', 7) +
      pad(p.highlight, 40) +
      (p.api_compatible || '');
    console.log(p.free_tier ? color.green(line) : color.yellow(line));
  }
  console.log('');
}

function renderMarkdown(data) {
  console.log(`# Top 20 AI Providers\n`);
  console.log(`*Last updated: ${data.last_updated}*\n`);
  console.log('| # | Provider | Free? | Highlight | API |');
  console.log('|---|----------|-------|-----------|-----|');
  for (const p of data.top_providers) {
    console.log(
      `| ${p.rank} | [${p.name}](${p.url}) | ${p.free_tier ? 'Yes' : 'Trial'} | ${p.highlight} | ${p.api_compatible || ''} |`,
    );
  }
}

function pad(str, len) {
  return String(str).padEnd(len);
}

module.exports = {
  command: 'ai-discover',
  description: 'Discover top 20 AI providers — show, refresh',
  arguments: ['[subcommand]'],
  options: [['--format <format>', 'Output format: table, json, md', 'table']],
  action: async (subcommand, options) => {
    if (subcommand) process.argv[3] = subcommand;
    await action();
  },
};
