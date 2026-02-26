const path = require('node:path');
const fs = require('fs-extra');
const prompts = require('../lib/prompts');
const engine = require('../lib/context/engine');

async function action() {
  const projectDir = process.cwd();
  const sub = process.argv[3] || 'list';

  try {
    switch (sub) {
      case 'store':
        await doStore(projectDir);
        break;
      case 'search':
        await doSearch(projectDir);
        break;
      case 'list':
        await doList(projectDir);
        break;
      case 'switch':
        await doSwitch(projectDir);
        break;
      case 'sessions':
        await doSessions(projectDir);
        break;
      case 'export':
        await doExport(projectDir);
        break;
      case 'import':
        await doImport(projectDir);
        break;
      default:
        await prompts.log.warn(
          `Unknown subcommand: ${sub}. Use store, search, list, switch, sessions, export, or import.`,
        );
    }
  } catch (err) {
    await prompts.log.error(err.message);
    if (process.env.BMAD_DEBUG) await prompts.log.message(err.stack);
    process.exit(1);
  }
}

async function doStore(projectDir) {
  const key = process.argv[4];
  // Collect content args, stopping at option flags
  const contentParts = [];
  for (let i = 5; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) break;
    contentParts.push(process.argv[i]);
  }
  const content = contentParts.join(' ');
  if (!key || !content) {
    await prompts.log.warn('Usage: bmad context store <key> <content> [--namespace <ns>]');
    return;
  }
  const nsIdx = process.argv.indexOf('--namespace');
  const namespace = nsIdx > -1 ? process.argv[nsIdx + 1] : 'default';

  const result = await engine.store(projectDir, key, content, namespace);
  await prompts.log.success(
    `Stored context "${key}" (id: ${result.contextId}) in session "${result.session}", namespace "${namespace}".`,
  );
}

async function doSearch(projectDir) {
  const color = await prompts.getColor();
  const query = process.argv.slice(4).join(' ');
  if (!query) {
    await prompts.log.warn('Usage: bmad context search <query> [--top N]');
    return;
  }
  const topIdx = process.argv.indexOf('--top');
  const topK = topIdx > -1 ? Number.parseInt(process.argv[topIdx + 1], 10) : 5;

  const results = await engine.search(projectDir, query, topK);
  if (results.length === 0) {
    await prompts.log.warn('No matching contexts found.');
    return;
  }

  console.log('');
  console.log(color.bold(`Search Results for: "${query}"`));
  console.log(color.dim('─'.repeat(70)));
  for (const [i, r] of results.entries()) {
    const dist = r.distance !== undefined ? ` (distance: ${r.distance.toFixed(4)})` : '';
    console.log(color.green(`  ${i + 1}. [${r.namespace}] ${r.key}`) + color.dim(dist));
    const preview = r.content?.slice(0, 120).replace(/\n/g, ' ');
    console.log(`     ${preview}${r.content?.length > 120 ? '...' : ''}`);
    console.log('');
  }
}

async function doList(projectDir) {
  const color = await prompts.getColor();
  const nsIdx = process.argv.indexOf('--namespace');
  const namespace = nsIdx > -1 ? process.argv[nsIdx + 1] : 'all';

  const { session, contexts } = engine.list(projectDir, namespace);
  console.log('');
  console.log(color.bold(`Contexts — Session: ${session.name}`));
  console.log(color.dim('─'.repeat(70)));

  if (contexts.length === 0) {
    console.log('  (no contexts stored yet)');
  } else {
    console.log(
      color.dim(pad('ID', 6) + pad('Namespace', 14) + pad('Key', 24) + pad('Updated', 22) + 'Size'),
    );
    console.log(color.dim('─'.repeat(70)));
    for (const ctx of contexts) {
      console.log(
        pad(String(ctx.id), 6) +
          pad(ctx.namespace, 14) +
          pad(ctx.key, 24) +
          pad(ctx.updated_at, 22) +
          `${ctx.content.length} chars`,
      );
    }
  }
  console.log('');
}

async function doSwitch(projectDir) {
  const name = process.argv[4];
  if (!name) {
    await prompts.log.warn('Usage: bmad context switch <session-name>');
    return;
  }
  const session = engine.switchContext(projectDir, name);
  await prompts.log.success(`Switched to context session: "${session.name}" (id: ${session.id})`);
}

async function doSessions(projectDir) {
  const color = await prompts.getColor();
  const sessions = engine.sessions(projectDir);
  console.log('');
  console.log(color.bold('Context Sessions'));
  console.log(color.dim('─'.repeat(50)));
  for (const s of sessions) {
    const active = s.active ? color.green(' (active)') : '';
    console.log(`  ${s.id} — ${s.name}${active}`);
    if (s.description) console.log(`    ${color.dim(s.description)}`);
  }
  console.log('');
}

async function doExport(projectDir) {
  const data = engine.exportData(projectDir);
  const outPath = path.join(projectDir, '_bmad', '_memory', 'context-export.json');
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
  await prompts.log.success(`Exported ${data.contexts.length} contexts to ${outPath}`);
}

async function doImport(projectDir) {
  const filePath = process.argv[4];
  if (!filePath) {
    await prompts.log.warn('Usage: bmad context import <file.json>');
    return;
  }
  const absPath = path.resolve(filePath);
  if (!(await fs.pathExists(absPath))) {
    await prompts.log.error(`File not found: ${absPath}`);
    return;
  }
  const data = JSON.parse(await fs.readFile(absPath, 'utf8'));
  const count = engine.importData(projectDir, data);
  await prompts.log.success(`Imported ${count} contexts.`);
}

function pad(str, len) {
  return String(str).padEnd(len);
}

module.exports = {
  command: 'context',
  description: 'Context memory engine — store, search, list, switch, sessions, export, import',
  arguments: ['[subcommand]', '[args...]'],
  options: [
    ['--namespace <ns>', 'Context namespace (default: "default")'],
    ['--top <n>', 'Number of search results (default: 5)'],
  ],
  action: async (subcommand, _args, options) => {
    if (subcommand) process.argv[3] = subcommand;
    if (options?.namespace) {
      process.argv.push('--namespace', options.namespace);
    }
    if (options?.top) {
      process.argv.push('--top', options.top);
    }
    await action();
  },
};
