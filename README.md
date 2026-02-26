# BMad Method

![BMad Method](banner-bmad-method.png)

[![Version](https://img.shields.io/npm/v/bmad-method?color=blue&label=version)](https://www.npmjs.com/package/bmad-method)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Discord](https://discord.gg/gk8jAdXWmj)](https://discord.gg/gk8jAdXWmj)

**Build More Architect Dreams** — An AI-driven agile development module for the BMad Method Module Ecosystem, the best and most comprehensive Agile AI Driven Development framework that has true scale-adaptive intelligence that adjusts from bug fixes to enterprise systems.

**100% free and open source.** No paywalls. No gated content. No gated Discord. We believe in empowering everyone, not just those who can pay for a gated community or courses.

## Why the BMad Method?

Traditional AI tools do the thinking for you, producing average results. BMad agents and facilitated workflows act as expert collaborators who guide you through a structured process to bring out your best thinking in partnership with the AI.

- **AI Intelligent Help** — Ask `/bmad-help` anytime for guidance on what's next
- **Scale-Domain-Adaptive** — Automatically adjusts planning depth based on project complexity
- **Structured Workflows** — Grounded in agile best practices across analysis, planning, architecture, and implementation
- **Specialized Agents** — 12+ domain experts (PM, Architect, Developer, UX, Scrum Master, and more)
- **Party Mode** — Bring multiple agent personas into one session to collaborate and discuss
- **Complete Lifecycle** — From brainstorming to deployment

[Learn more at **docs.bmad-method.org**](http://docs.bmad-method.org)

---

## This repository (dizonrl20/bmad)

This repo extends the upstream [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) with:

- **OpenClaw integration** — Guidelines and a BMAD controller skill so OpenClaw follows BMAD workflows, uses the same LLM config, and stays within free-tier token limits.
- **Multi-LLM switching** — `bmad llm` to list, switch, and test 10 free-tier providers (Gemini, Groq, Mistral, DeepSeek, Cerebras, OpenRouter, GitHub Models, NVIDIA NIM, Cohere, Cloudflare).
- **Token tracking** — `bmad tokens` to record and report usage (RPD/TPM) so you stay within free API limits; daily refresh and history.
- **AI discovery** — `bmad ai-discover` to cache and refresh the top 20 free/trial AI providers.
- **Context memory engine** — `bmad context` for vector-searchable context (store, search, sessions, export/import) so you don’t bloat prompts; works with BMAD and OpenClaw.
- **Learning modules** — Separate BMAD and OpenClaw learning so both adapt to the user (preferences, corrections, conventions). BMAD uses the context engine (namespace `learning`) and sidecars; OpenClaw uses `memory/openclaw-learning.md` and optional BMAD context namespace `user`.
- **Docker support** — Run BMAD CLI in a container on Mac or PC for a consistent environment.
- **Reusability** — Clone, install, and run locally or in Docker; no hardcoded user paths; suitable for pushing to your own Git (e.g. [dizonrl20/bmad](https://github.com/dizonrl20/bmad)).

---

## What's Next for BMad (upstream)

**V6 is here.** The BMad Method is evolving with Cross Platform Agent Team and Sub Agent inclusion, Skills Architecture, BMad Builder v1, Dev Loop Automation, and more.

**[Roadmap →](http://docs.bmad-method.org/roadmap/)**

---

## Prerequisites

- **Node.js** v20 or later ([nodejs.org](https://nodejs.org))
- **Git** (for cloning and pushing)
- **Optional:** Docker and Docker Compose (for containerized runs on Mac/PC)
- **Optional:** OpenClaw installed and configured if you use the OpenClaw integration

---

## Step-by-step: Implement and run

### 1. Clone the repository

```bash
git clone https://github.com/dizonrl20/bmad.git
cd bmad
```

To use the `develop` branch (extensions + learning + Docker + this README):

```bash
git fetch origin develop
git checkout develop
```

### 2. Install dependencies (local Mac or PC)

**On Mac (Terminal) or Windows (PowerShell / WSL):**

```bash
cd bmad
npm install
```

If you see optional dependency warnings for `better-sqlite3` or `sqlite-vec`, token tracking and context engine will still work; for full vector search in the context engine, ensure native build tools are available (e.g. Xcode Command Line Tools on Mac, build-essential on Linux).

**Verify:**

```bash
node tools/cli/bmad-cli.js --help
node tools/cli/bmad-cli.js llm list
```

### 3. Run BMAD in your project (local)

BMAD installs into a **target project**, not into the repo itself. From your own project directory:

```bash
cd /path/to/your/project
npx bmad-method install
```

Or run the CLI from this repo against a directory:

```bash
node /path/to/bmad/tools/cli/bmad-cli.js install --directory /path/to/your/project --modules bmm --tools cursor --yes
```

Follow the prompts (or use `--yes` and flags for non-interactive). This creates `_bmad/` and IDE config (e.g. `.cursor/commands`) in the target project.

**Optional — LLM and token setup in that project:**

```bash
cd /path/to/your/project
node /path/to/bmad/tools/cli/bmad-cli.js llm init
node /path/to/bmad/tools/cli/bmad-cli.js llm switch gemini
node /path/to/bmad/tools/cli/bmad-cli.js tokens refresh
```

Set the required env var for the chosen provider (e.g. `GEMINI_API_KEY`).

### 4. OpenClaw setup (optional)

If you use OpenClaw with BMAD:

1. Run BMAD install and select OpenClaw so stubs go to `.openclaw/skills`.
2. Copy the BMAD controller skill into OpenClaw’s workspace or project:
   - **User workspace:** `cp -r bmad/docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/`
   - **Project:** `cp -r bmad/docs/guidelines/openclaw/bmad-controller /path/to/your/project/.openclaw/skills/`
3. Restart or reload OpenClaw so it loads the skill.
4. Add the **session initialization rule** and **token-efficiency** rules from `docs/guidelines/openclaw-cost-optimization.md` to your OpenClaw agent system prompt.
5. Create `memory/openclaw-learning.md` (in OpenClaw workspace or `_bmad/_memory/`) so OpenClaw can record and load user preferences (see `docs/guidelines/openclaw-learning.md`).

### 5. Learning modules (BMAD + OpenClaw)

- **BMAD:** Store and retrieve learning (user preferences, project conventions, corrections) via the context engine:
  - `bmad context store user.preferences "Prefer concise summaries" --namespace learning`
  - Agents and workflows should run `bmad context search "<task>"` and use learning namespace entries. See [docs/guidelines/learning-bmad.md](docs/guidelines/learning-bmad.md).
- **OpenClaw:** Use `memory/openclaw-learning.md`; load it at session start and append user corrections and preferences. In BMAD projects you can also use `bmad context store ... --namespace user` for shared preferences. See [docs/guidelines/openclaw-learning.md](docs/guidelines/openclaw-learning.md).

### 6. Run with Docker (Mac or PC)

Use Docker when you want a consistent environment without installing Node locally.

**Build the image:**

```bash
cd bmad
docker build -t bmad-cli:latest .
```

**Run BMAD CLI (e.g. help or install into a project):**

```bash
# Help
docker run --rm bmad-cli:latest

# Install into a project (mount your project as /workspace)
docker run --rm -v /path/to/your/project:/workspace bmad-cli:latest install --directory /workspace --modules bmm --tools cursor --yes

# List LLM providers
docker run --rm bmad-cli:latest llm list

# Token refresh (must mount project that already has _bmad)
docker run --rm -v /path/to/your/project:/workspace -w /workspace bmad-cli:latest tokens refresh
```

**With Docker Compose:**

```bash
cd bmad
docker-compose build

# Install into current directory (mount as /workspace)
docker-compose run --rm -v "$(pwd)":/workspace bmad install --directory /workspace --modules bmm --yes

# Run other commands
docker-compose run --rm bmad llm list
```

On Windows (PowerShell), use a valid path for the volume, e.g. `-v C:\Users\You\myproject:/workspace`.

### 7. Reusability and pushing to Git

- **Clone and use:** Anyone can clone `https://github.com/dizonrl20/bmad`, checkout `develop`, run `npm install`, and use the CLI or Docker as above.
- **No hardcoded user paths:** Config uses `--directory` and env vars; `_bmad` and IDE configs are created in the target project.
- **Your own fork:** Fork or push to your repo (e.g. `dizonrl20/bmad`). To push this branch to a new `develop` branch:
  ```bash
  git checkout -b develop
  git add .
  git commit -m "Add OpenClaw integration, multi-LLM, tokens, context engine, learning modules, Docker, README"
  git remote set-url origin https://github.com/dizonrl20/bmad.git
  git push -u origin develop
  ```
  You can then merge `develop` into `main` from the GitHub UI or locally.

---

## Quick Start (summary)

**Prerequisites:** Node.js v20+

```bash
npx bmad-method install
```

Or with this repo after clone and `npm install`:

```bash
node tools/cli/bmad-cli.js install --directory /path/to/project
```

Follow the installer prompts, then open your AI IDE (Claude Code, Cursor, OpenClaw, etc.) in your project folder.

**Non-interactive (CI/CD):**

```bash
npx bmad-method install --directory /path/to/project --modules bmm --tools claude-code --yes
```

> **Not sure what to do?** Run `/bmad-help` in your IDE — it suggests what's next. Or: `bmad-help I just finished the architecture, what do I do next?`

---

## Modules

BMad Method extends with official modules. Available during installation or anytime after.

| Module | Purpose |
|--------|--------|
| **[BMad Method (BMM)](https://github.com/bmad-code-org/BMAD-METHOD)** | Core framework with 34+ workflows |
| **[BMad Builder (BMB)](https://github.com/bmad-code-org/bmad-builder)** | Create custom BMad agents and workflows |
| **[Test Architect (TEA)](https://github.com/bmad-code-org/tea)** | Risk-based test strategy and automation |
| **[Game Dev Studio (BMGD)](https://github.com/bmad-code-org/bmad-module-game-dev-studio)** | Game development workflows (Unity, Unreal, Godot) |
| **[Creative Intelligence Suite (CIS)](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite)** | Innovation, brainstorming, design thinking |

---

## Documentation

- [BMad Method Docs](http://docs.bmad-method.org) — Tutorials, guides, reference
- [Getting Started](http://docs.bmad-method.org/tutorials/getting-started/)
- [Upgrading to V6](http://docs.bmad-method.org/how-to/upgrade-to-v6/)
- **This repo:** [docs/guidelines/](docs/guidelines/) — OpenClaw guidelines, token efficiency, learning modules (BMAD + OpenClaw), cost/token preservation

---

## Community

- [Discord](https://discord.gg/gk8jAdXWmj) — Get help, share ideas
- [YouTube](https://www.youtube.com/@BMadCode) — Tutorials and podcast
- [GitHub Issues](https://github.com/bmad-code-org/BMAD-METHOD/issues) — Bug reports and feature requests
- [Discussions](https://github.com/bmad-code-org/BMAD-METHOD/discussions) — Community conversations

---

## Support BMad

BMad is free for everyone. If you'd like to support development:

- Star the repo
- [Buy Me a Coffee](https://buymeacoffee.com/bmad)
- Corporate sponsorship — DM on Discord

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

**BMad** and **BMAD-METHOD** are trademarks of BMad Code, LLC. See [TRADEMARK.md](TRADEMARK.md) for details.

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for contributor information.
