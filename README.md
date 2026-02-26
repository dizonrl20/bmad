# BMad Method

![BMad Method](banner-bmad-method.png)

[![Version](https://img.shields.io/npm/v/bmad-method?color=blue&label=version)](https://www.npmjs.com/package/bmad-method)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Discord](https://discord.gg/gk8jAdXWmj)](https://discord.gg/gk8jAdXWmj)

**Build More Architect Dreams** — An AI-driven agile development module for the BMad Method Module Ecosystem, the best and most comprehensive Agile AI Driven Development framework that has true scale-adaptive intelligence that adjusts from bug fixes to enterprise systems.

**100% free and open source.** No paywalls. No gated content. No gated Discord. We believe in empowering everyone, not just those who can pay for a gated community or courses.

---

## New here? Glossary (read this first)

| Term | What it means |
|------|----------------|
| **BMAD** | This framework: workflows (step-by-step guides), agents (AI “personas” like PM, Architect, Developer), and rules so you and the AI build software in a structured way. You install it **into your project** (not into this repo). |
| **This repo (dizonrl20/bmad)** | A version of BMAD that adds OpenClaw support, multiple free LLMs, token tracking, Docker, and more. You **clone this repo** to get the installer and CLI; then you run the installer **against your own project folder** so that project gets BMAD. |
| **LLM** | Large Language Model — the AI that answers (e.g. Gemini, Groq, Claude). This repo lets you **switch** between many **free-tier** LLMs and **track** how many tokens you use so you stay within free limits. |
| **OpenClaw** | An AI coding assistant (like Cursor or Claude Code). This repo provides **guidelines and skills** so OpenClaw follows BMAD and uses the same LLM and token settings. OpenClaw is **separate software** you install; we just teach it how to work with BMAD. |
| **Clawdette / Clawrence / Clawdia / Clawton / Clawra / Clawthorn** | OpenClaw “claw” agents: **Clawdette** coordinates; **Clawrence** research/planning; **Clawdia** code; **Clawton** review/QA; **Clawra** docs; **Clawthorn** job applications (Indeed, LinkedIn, GC Jobs, etc.). See [OpenClaw orchestrator](docs/guidelines/openclaw-orchestrator.md) and [Clawthorn job-hunt](docs/guidelines/openclaw-clawthorn-job-hunt.md). |
| **Install** | Running `bmad install` (or the installer) **copies** BMAD workflows, agents, and config **into your project** (creates `_bmad/` and IDE config like `.cursor/commands`). You run install **from** this repo **with** `--directory /path/to/your/project`. |
| **Token tracking** | Recording how many API calls/tokens you use per provider so you don’t exceed free limits. Use `bmad tokens refresh` and `bmad tokens report`. |
| **.env** | A file (you create it from `.env.example`) where you put your **API keys** for each LLM provider (Gemini, Groq, etc.). The CLI loads it automatically. Never commit `.env` to Git. |

**Quick decision guide:**  
- **“I just want BMAD in my project”** → Clone this repo, run `npm install`, then `node tools/cli/bmad-cli.js install --directory /path/to/my/project`.  
- **“I want to run everything in Docker”** → See [RUN.md](RUN.md).  
- **“I use OpenClaw and want it to follow BMAD”** → After install, copy the OpenClaw skills and add the rules from the docs; see [OpenClaw setup](#4-openclaw-setup-optional) below.

---

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

Before you start, have these ready:

| What | Why |
|------|-----|
| **Node.js v20 or later** | The BMAD CLI is a Node app. [Download](https://nodejs.org) if you don’t have it. Check with `node -v`. |
| **Git** | To clone this repo. Check with `git --version`. |
| **Docker (optional)** | Only if you want to run the CLI in a container instead of installing Node on your machine. See [RUN.md](RUN.md). |
| **OpenClaw (optional)** | Only if you use OpenClaw as your AI IDE and want it to follow BMAD. Install OpenClaw separately. |
| **API keys (optional)** | Only if you want to use `bmad llm switch`, token tracking, or context engine. Copy [.env.example](.env.example) to `.env` and add keys for the providers you use. |

---

## Step-by-step: Implement and run

### 1. Clone the repository

**What this does:** Downloads this repo to your computer so you can run the BMAD installer and CLI.

```bash
git clone https://github.com/dizonrl20/bmad.git
cd bmad
```

**If you want the branch with all extensions (OpenClaw, Docker, multi-LLM, this README):**

```bash
git fetch origin develop
git checkout develop
```

You only need to do this once. After that, `cd bmad` is enough.

---

### 2. Install dependencies (local Mac or PC)

**What this does:** Installs the Node packages the CLI needs (and optional ones for token/context). Run this **inside the bmad repo folder**.

**On Mac:** Open Terminal. **On Windows:** Use PowerShell or [WSL](https://docs.microsoft.com/en-us/windows/wsl/install).

```bash
cd bmad
npm install
```

**If you see warnings about `better-sqlite3` or `sqlite-vec`:** The main CLI still works. Token tracking and the context engine need `better-sqlite3`. On Mac, install Xcode Command Line Tools (`xcode-select --install`). On Linux, install `build-essential`. Or use the [Docker image](#6-run-with-docker-mac-or-pc), which already includes build tools.

**Check that it worked:**

```bash
node tools/cli/bmad-cli.js --help
node tools/cli/bmad-cli.js llm list
```

You should see the help text and a table of LLM providers. If you get “command not found” for `node`, install Node.js v20+ first.

### 3. Run BMAD in your project (local)

**What this does:** Puts BMAD **into the folder where your app or code lives** (your “target project”). That folder will get a `_bmad/` directory (workflows, agents, config) and IDE config (e.g. `.cursor/commands`). You do **not** install BMAD into the bmad repo itself — you install it into your real project.

**Option A — From your project folder (easiest if you have npx):**

```bash
cd /path/to/your/project
npx bmad-method install
```

**Option B — From the bmad repo, point at your project:**

```bash
node /path/to/bmad/tools/cli/bmad-cli.js install --directory /path/to/your/project --modules bmm --tools cursor --yes
```

Replace `/path/to/your/project` with the real path (e.g. `~/my-app` or `C:\Users\You\my-app`).  
- `--modules bmm` = install the core BMAD module.  
- `--tools cursor` = add Cursor commands; use `openclaw` or `claude-code` if you use those.  
- `--yes` = skip interactive prompts (good for scripts).

After install, open your **project folder** in your IDE (Cursor, OpenClaw, etc.). You should see `_bmad/` and IDE-specific config. In Cursor you can type `/bmad-help` for “what’s next?”.

**Optional — LLM and token setup in that project:**

If you want to switch LLMs and track tokens **in that project**:

```bash
cd /path/to/your/project
node /path/to/bmad/tools/cli/bmad-cli.js llm init
node /path/to/bmad/tools/cli/bmad-cli.js llm switch gemini
node /path/to/bmad/tools/cli/bmad-cli.js tokens refresh
```

Set the required env var for the provider you chose (e.g. `GEMINI_API_KEY` in your shell or in a `.env` file in the project). See [.env.example](.env.example) for all provider variable names.

### 4. OpenClaw setup (optional)

**Only do this if you use OpenClaw** as your AI assistant and want it to follow BMAD and use the same LLM/token settings.

1. Run BMAD install and choose **OpenClaw** so stubs go to `.openclaw/skills` in your project.
2. Copy the BMAD controller and (optionally) the Clawdette orchestrator skill so OpenClaw knows how to follow BMAD and delegate to claw agents:
   - **User workspace:**  
     `cp -r bmad/docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/`  
     `cp -r bmad/docs/guidelines/openclaw/clawdette-orchestrator ~/.openclaw/workspace/skills/`
   - **Project-only:**  
     `cp -r bmad/docs/guidelines/openclaw/bmad-controller /path/to/your/project/.openclaw/skills/`  
     `cp -r bmad/docs/guidelines/openclaw/clawdette-orchestrator /path/to/your/project/.openclaw/skills/`
3. Restart or reload OpenClaw so it loads the skills.
4. Add the **session initialization** and **token-efficiency** rules from [openclaw-cost-optimization.md](docs/guidelines/openclaw-cost-optimization.md) to your OpenClaw agent system prompt.
5. Create `memory/openclaw-learning.md` (in OpenClaw workspace or `_bmad/_memory/`) so OpenClaw can save and load your preferences. See [openclaw-learning.md](docs/guidelines/openclaw-learning.md).

**LLM for OpenClaw agents:** Use **stronger free LLMs** (e.g. Gemini 2.5 Pro, DeepSeek, Groq 70B) for research/code/review/docs/job-app agents (Clawrence, Clawdia, Clawton, Clawra, Clawthorn) and **lighter free LLMs** (e.g. Gemini Flash Lite, Groq) for the orchestrator (Clawdette) so you save tokens and maximize work done by the claw agents. Details: [OpenClaw orchestrator — LLM tier by agent](docs/guidelines/openclaw-orchestrator.md#llm-tier-by-agent-maximize-tokens-delegate-wisely).

### 5. Learning modules (BMAD + OpenClaw)

- **BMAD:** Store and retrieve learning (user preferences, project conventions, corrections) via the context engine:
  - `bmad context store user.preferences "Prefer concise summaries" --namespace learning`
  - Agents and workflows should run `bmad context search "<task>"` and use learning namespace entries. See [docs/guidelines/learning-bmad.md](docs/guidelines/learning-bmad.md).
- **OpenClaw:** Use `memory/openclaw-learning.md`; load it at session start and append user corrections and preferences. In BMAD projects you can also use `bmad context store ... --namespace user` for shared preferences. See [docs/guidelines/openclaw-learning.md](docs/guidelines/openclaw-learning.md).

### 6. Run with Docker (Mac or PC)

**What this does:** Runs the BMAD CLI inside a container so you don’t need Node installed on your machine. You still need Docker Desktop (or Docker Engine) installed and running.

**Build the image (one time, from the bmad repo):**

```bash
cd bmad
docker build -t bmad-cli:latest .
```

**Run the CLI:**

```bash
# Show help
docker run --rm bmad-cli:latest

# Install BMAD into a project (replace /path/to/your/project with your real path)
docker run --rm -v /path/to/your/project:/workspace bmad-cli:latest install --directory /workspace --modules bmm --tools cursor --yes

# List LLM providers
docker run --rm bmad-cli:latest llm list

# Use your API keys from .env (optional)
docker run --rm --env-file .env bmad-cli:latest llm list

# Token refresh (mount the project that already has _bmad)
docker run --rm -v /path/to/your/project:/workspace -w /workspace bmad-cli:latest tokens refresh
```

**Windows (PowerShell):** Use a real path for the volume, e.g. `-v C:\Users\You\myproject:/workspace`.

**With Docker Compose (from bmad repo root):**

```bash
docker-compose build
docker-compose run --rm bmad llm list
# Install into another folder (override volume):
docker-compose run --rm -v /path/to/your/project:/workspace bmad install --directory /workspace --modules bmm --yes
```

More one-command examples: [RUN.md](RUN.md).

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

**Prerequisites:** Node.js v20+. Optional: copy [.env.example](.env.example) to `.env` and add API keys if you use LLM switch or tokens.

```bash
# From your project folder (if you have npx):
npx bmad-method install

# Or from the bmad repo after clone + npm install:
node tools/cli/bmad-cli.js install --directory /path/to/project
```

Follow the prompts (or add `--modules bmm --tools cursor --yes` to skip them). Then open your **project folder** in your AI IDE (Cursor, OpenClaw, Claude Code, etc.).

**API keys:** Copy [.env.example](.env.example) to `.env` in the bmad repo or your project, add your keys (e.g. `GEMINI_API_KEY=...`), and the CLI will load them. Never commit `.env`.

**Non-interactive (scripts/CI):**

```bash
npx bmad-method install --directory /path/to/project --modules bmm --tools claude-code --yes
```

> **Not sure what to do next?** In your project, run `/bmad-help` in the IDE — it suggests the next step. Or ask: “I just finished the architecture, what do I do next?”

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

## Troubleshooting

| Problem | What to try |
|--------|----------------|
| **`node: command not found`** | Install Node.js v20+ from [nodejs.org](https://nodejs.org). Restart the terminal. |
| **`npm install` fails on `better-sqlite3`** | The rest of the CLI still works. For token/context: on Mac run `xcode-select --install`; on Linux install `build-essential`; or use the [Docker](#6-run-with-docker-mac-or-pc) image. |
| **“Cannot find module” when running the CLI** | Run `npm install` from **inside the bmad repo** (the folder that contains `package.json`). |
| **Install says “directory not found”** | Use the **full path** to your project in `--directory` (e.g. `--directory /Users/you/myapp` or `C:\Users\You\myapp`). |
| **No `/bmad-help` or BMAD commands in my IDE** | Install was run against a **different** folder. Open your **project folder** (the one that has `_bmad/`) in the IDE. Re-run install with `--directory` pointing at that folder and `--tools cursor` (or your IDE). |
| **LLM switch / tokens don’t work** | Set the API key for that provider: copy [.env.example](.env.example) to `.env`, add the key (e.g. `GEMINI_API_KEY=your_key`), and run the CLI from the same folder or pass `--env-file .env` in Docker. |
| **Docker build fails** | Make sure Docker Desktop (or Docker Engine) is running. On Mac/Windows, use the latest Docker Desktop. |
| **OpenClaw doesn’t follow BMAD** | Copy the skills into `.openclaw/skills` (see [OpenClaw setup](#4-openclaw-setup-optional)), reload OpenClaw, and add the cost-optimization rules to your agent prompt. |

Still stuck? See [RUN.md](RUN.md) for minimal clone-and-run steps, or ask in [Discord](https://discord.gg/gk8jAdXWmj).

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
