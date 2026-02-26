# Feasibility and implementation review — BMAD and OpenClaw

This document is an honest assessment of how the BMAD and OpenClaw implementation in this project works, what is feasible, and how to actually run and deploy it (Docker or machine).

---

## 1. What this repo actually implements

### BMAD (this repo)

| Component | Implementation | Feasibility |
|-----------|----------------|-------------|
| **CLI** (`tools/cli/bmad-cli.js`) | Real Node app: install, llm, tokens, context, status, uninstall, ai-discover. | **Works.** Run with `node tools/cli/bmad-cli.js` or via Docker. |
| **Install** | Copies files into a target directory: `_bmad/` (workflows, agents, config), IDE stubs (e.g. `.cursor/commands`, `.openclaw/skills`). Writes `llm-config.yaml`, etc. | **Works.** Requires target path; no hardcoded user paths. |
| **LLM switch / tokens** | Reads/writes `_bmad/_config/llm-config.yaml`, optional SQLite for tokens. Uses env vars for API keys; dotenv loads `.env`. | **Works** if Node + deps (and optional better-sqlite3) are present. |
| **Context engine** | Optional: `_bmad/_memory/context.sqlite`, vector search via better-sqlite3 + sqlite-vec. | **Works** when optional deps build; otherwise CLI still runs, context commands may fail. |
| **Workflows and agents** | Stored as files under `_bmad/` (YAML, markdown). **No execution engine in this repo.** | **Document-driven.** OpenClaw (or another IDE) is told via guidelines/skills to *read* these files and follow them. BMAD does not “run” workflows by itself; it provides the content. |

So: **BMAD in this repo = CLI + installed file tree + guidelines that tell OpenClaw (or another IDE) how to use that tree.** Feasibility for “running BMAD” = CLI and install work; “following BMAD” depends on the IDE (OpenClaw) actually loading and following the skills/guidelines.

### OpenClaw integration

| Component | Implementation | Feasibility |
|-----------|----------------|-------------|
| **Guidelines** | Markdown docs: openclaw-bmad-guidelines, orchestrator, cost-optimization, learning, Clawthorn job-hunt. | **Docs are clear.** OpenClaw must be configured to use them (e.g. system prompt or skill load). |
| **Skills** | bmad-controller, clawdette-orchestrator, clawthorn-job-hunt: SKILL.md (and config YAML) in `docs/guidelines/openclaw/`. | **Skills are defined.** User (or setup) must **copy** them into OpenClaw’s skills directory. OpenClaw’s behavior depends on how it interprets these skills. |
| **Orchestrator (Clawdette)** | Delegation rules and subagent roles (Clawrence, Clawdia, Clawton, Clawra, Clawthorn) are in the skill and orchestrator doc. | **Defined.** Works to the extent OpenClaw routes prompts and follows the skill text. |
| **Clawthorn (job applications)** | Skill + config YAML + spreadsheet CSV + resume-text file. Instructions: read config, read resume-text, update CSV, daily cap, no double-apply, application date in “Date attempted”. | **Guided flow is feasible:** user applies in browser; Clawthorn (via OpenClaw) can read/write files if OpenClaw has file access. **Full auto-apply (fill forms, submit)** is **not** implemented; would require browser automation (e.g. Playwright) and is out of scope here. |

### Docker

| Component | Implementation | Feasibility |
|-----------|----------------|-------------|
| **Dockerfile** | Node 20 Alpine, build deps for optional native modules, BMAD CLI as entrypoint. | **Builds and runs.** Tested on Mac/PC with Docker Desktop. |
| **Who runs where** | **CLI runs in container.** OpenClaw runs **on the host.** Project folder is on host and mounted into container so install/init write `_bmad/` there. | **Feasible and documented.** See [DOCKER-RUN-BMAD-AND-OPENCLAW.md](openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md). |

---

## 2. Realistic assessment

- **You can run the BMAD CLI reliably** (install, llm, tokens, init) on your machine or in Docker. The repo and Dockerfile support that.
- **You can get a “BMAD + OpenClaw” setup** by: installing BMAD into a project, copying the three skills into OpenClaw, and opening that project in OpenClaw. Whether OpenClaw *behaves* exactly as the skills describe depends on OpenClaw’s own implementation, not on this repo.
- **Clawthorn job-app flow** is feasible as a **guided** flow: you apply in the browser; the agent (via OpenClaw) uses the spreadsheet, resume text, and config to guide and track. Application date is in “Date attempted”; include time when you successfully apply. No browser automation here.
- **Easy deploy:** A script can build the image, run install + clawthorn:init in the container with a mounted project, and print the next steps (copy skills, paste resume, run OpenClaw). That gives you a single path that “builds itself” on Docker or the machine (see below).

---

## 3. How to implement (concrete)

1. **On a machine (no Docker):** Clone repo → `npm install` → `node tools/cli/bmad-cli.js install --directory <project>` → `npm run clawthorn:init -- --directory <project>` → paste resume → copy skills to OpenClaw → run OpenClaw, open project.
2. **On Docker:** Clone repo → `docker build -t bmad-cli:latest .` → run install and init with `-v <project>:/workspace` (and optional `--env-file .env`) → same resume + copy skills + OpenClaw on host. Full steps: [DOCKER-RUN-BMAD-AND-OPENCLAW.md](openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md).
3. **Easy deploy script:** Run `./scripts/deploy-with-docker.sh` (or equivalent) from the repo; it builds the image, runs install and clawthorn:init for the current directory (or a given path), then prints exactly what to do next (resume, skills, OpenClaw). That satisfies “easy to deploy and build itself on Docker or the machine.”

---

## 4. What is not in scope (honest)

- **Automated job application (click, fill, submit)** — Not implemented. Would require browser automation (e.g. Playwright) and possibly site-specific logic; also ToS/captcha considerations.
- **OpenClaw running inside Docker** — OpenClaw is a desktop IDE; we do not run it in the container. The container runs only the BMAD CLI.
- **Guarantee that OpenClaw follows every skill line-by-line** — We provide the skills; OpenClaw’s behavior is determined by its own design.

---

## 5. Summary

| Goal | Feasible? | How |
|------|-----------|-----|
| Run BMAD CLI (install, llm, tokens, init) | Yes | Node or Docker; see README and RUN.md. |
| Use BMAD + OpenClaw (guidelines + skills) | Yes | Install BMAD, copy skills, open project in OpenClaw. |
| Clawthorn: guide + track applications, application date in spreadsheet | Yes | Resume text, config, CSV with Date attempted (application date/time); user applies in browser. |
| Run everything via Docker | Yes | CLI in Docker; OpenClaw on host; project mounted; see DOCKER-RUN-BMAD-AND-OPENCLAW.md. |
| One-command / easy deploy | Yes | Use the deploy script (e.g. deploy-with-docker.sh) that builds and inits, then follow printed steps. |
| Full auto-apply to job sites | No | Not in this repo; would need separate automation (e.g. Playwright) and design. |

This review reflects the current implementation. For the exact Docker flow and path names, always refer to [DOCKER-RUN-BMAD-AND-OPENCLAW.md](openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md) and the [Get started](openclaw-clawthorn-job-hunt.md#get-started-one-time-setup) section of the Clawthorn doc.

For **what blocks OpenClaw** from fully applying BMAD (personas, workflows, context, LLM specialization, file ingestion, learning, orchestration, config) and **concrete actions to unblock it**, see [BMAD–OpenClaw integration roadmap](openclaw/BMAD-OPENCLAW-INTEGRATION-ROADMAP.md).
