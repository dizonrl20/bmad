const prompts = require('../lib/prompts');
const { refreshTokens, getTokenStatus, getTokenHistory, today } = require('../lib/tokens/tracker');

async function action() {
  const projectDir = process.cwd();
  const sub = process.argv[3] || 'show';

  try {
    switch (sub) {
      case 'show':
        await showTokens(projectDir);
        break;
      case 'refresh':
        await doRefresh(projectDir);
        break;
      case 'history':
        await showHistory(projectDir);
        break;
      case 'report':
        await showReport(projectDir);
        break;
      default:
        await prompts.log.warn(`Unknown subcommand: ${sub}. Use show, refresh, history, or report.`);
    }
  } catch (err) {
    await prompts.log.error(err.message);
    if (process.env.BMAD_DEBUG) await prompts.log.message(err.stack);
    process.exit(1);
  }
}

async function showTokens(projectDir) {
  const color = await prompts.getColor();
  const rows = getTokenStatus(projectDir);
  if (!rows.length) {
    await prompts.log.warn('No token data yet. Run "bmad tokens refresh" first.');
    return;
  }

  console.log('');
  console.log(color.bold(`Token Usage — ${today()}`));
  console.log(color.dim('─'.repeat(90)));
  console.log(
    color.dim(
      pad('Provider', 18) +
        pad('Model', 32) +
        pad('Used', 12) +
        pad('Available', 14) +
        pad('Req Used', 10) +
        'Req Avail',
    ),
  );
  console.log(color.dim('─'.repeat(90)));

  for (const row of rows) {
    const avail = row.tokens_available ? fmtNum(row.tokens_available) : 'unlimited';
    const reqAvail = row.requests_available ? String(row.requests_available) : 'unlimited';
    const line =
      pad(row.provider, 18) +
      pad(row.model, 32) +
      pad(fmtNum(row.tokens_used), 12) +
      pad(avail, 14) +
      pad(String(row.requests_used), 10) +
      reqAvail;
    const pct = row.tokens_available ? row.tokens_used / row.tokens_available : 0;
    console.log(pct > 0.8 ? color.red(line) : pct > 0.5 ? color.yellow(line) : line);
  }
  console.log('');
}

async function doRefresh(projectDir) {
  await prompts.log.message('Refreshing token data from all providers...');
  const results = await refreshTokens(projectDir);
  await prompts.log.success(`Refreshed ${results.length} model entries for ${today()}.`);
  await showTokens(projectDir);
}

async function showHistory(projectDir) {
  const color = await prompts.getColor();
  const daysArg = process.argv[4] ? Number.parseInt(process.argv[4], 10) : 7;
  const rows = getTokenHistory(projectDir, daysArg);
  if (!rows.length) {
    await prompts.log.warn('No history. Run "bmad tokens refresh" to start collecting data.');
    return;
  }

  console.log('');
  console.log(color.bold(`Token Usage History — Last ${daysArg} days`));
  console.log(color.dim('─'.repeat(80)));
  console.log(
    color.dim(
      pad('Date', 14) + pad('Provider', 18) + pad('Model', 28) + pad('Tokens', 12) + 'Requests',
    ),
  );
  console.log(color.dim('─'.repeat(80)));
  for (const row of rows) {
    console.log(
      pad(row.date, 14) +
        pad(row.provider, 18) +
        pad(row.model, 28) +
        pad(fmtNum(row.tokens_used), 12) +
        String(row.requests_used),
    );
  }
  console.log('');
}

async function showReport(projectDir) {
  const color = await prompts.getColor();
  const rows = getTokenStatus(projectDir);
  if (!rows.length) {
    await prompts.log.warn('No data. Run "bmad tokens refresh" first.');
    return;
  }

  console.log('');
  console.log(color.bold('Token Availability Report'));
  console.log(color.dim('─'.repeat(70)));

  const byProvider = {};
  for (const row of rows) {
    if (!byProvider[row.provider]) byProvider[row.provider] = [];
    byProvider[row.provider].push(row);
  }

  for (const [provider, models] of Object.entries(byProvider)) {
    console.log(color.bold(`\n  ${provider}`));
    for (const m of models) {
      const remaining = m.tokens_available ? m.tokens_available - m.tokens_used : null;
      const pct = m.tokens_available ? ((m.tokens_used / m.tokens_available) * 100).toFixed(1) : 0;
      const bar = m.tokens_available ? makeBar(m.tokens_used / m.tokens_available) : '[unlimited]';
      const status = remaining !== null ? `${fmtNum(remaining)} remaining (${pct}% used)` : 'unlimited';
      console.log(`    ${m.model}`);
      console.log(`      ${bar} ${status}`);
    }
  }
  console.log('');
}

function makeBar(pct) {
  const filled = Math.round(pct * 20);
  const empty = 20 - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function fmtNum(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

module.exports = {
  command: 'tokens',
  description: 'Track token usage — show, refresh, history, report',
  arguments: ['[subcommand]', '[args...]'],
  options: [],
  action: async (subcommand) => {
    // Override process.argv[3] with commander's parsed subcommand
    if (subcommand) process.argv[3] = subcommand;
    await action();
  },
};
