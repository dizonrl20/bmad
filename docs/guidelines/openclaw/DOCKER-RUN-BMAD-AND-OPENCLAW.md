# Running BMAD and OpenClaw (with Clawthorn) on Docker — full guide

This document explains **exactly** how to run this project once you pull it into Docker: what runs in the container, what runs on your machine, and how to get to a working setup with OpenClaw and the Clawthorn job-application flow.

---

## Important: what runs where

| Component | Where it runs | Why |
|-----------|----------------|-----|
| **BMAD CLI** (install, llm, tokens, clawthorn:init) | **Inside Docker** | The image contains Node and the BMAD repo; you run commands via `docker run`. |
| **OpenClaw** (the IDE) | **On your machine (host)** | OpenClaw is a desktop application. You install and run it on your Mac/PC; it is not a service inside the container. |
| **Your project folder** | **On the host, mounted into Docker** | You clone or copy the bmad repo to a folder on your machine. You mount that folder into the container as `/workspace` so the CLI can write `_bmad/` and run init there. OpenClaw then opens that same folder. |

So: **Docker runs the BMAD CLI**. **You run OpenClaw on your computer** and point it at the project folder that already has `_bmad/` and skills set up via the container.

---

## Prerequisites

- **Docker** (Docker Desktop on Mac/Windows, or Docker Engine on Linux). Docker must be running.
- **Git** (to clone the repo).
- **OpenClaw** installed on your machine (separate download/install).
- Optional: **.env** with API keys (copy from `.env.example`) if you use `bmad llm` or tokens.

---

## Step-by-step: pull project and run on Docker

### 1. Clone the project on your machine

```bash
git clone https://github.com/dizonrl20/bmad.git
cd bmad
git checkout develop-job-app
```

Use the branch that has Clawthorn and the job-app flow (e.g. `develop-job-app` or `main`).

### 2. (Optional) API keys for LLM

```bash
cp .env.example .env
# Edit .env and add keys for the providers you use. See docs/guidelines/llm-api-keys-guide.md
```

You will pass `.env` into the container when running CLI commands that need keys.

### 3. Build the Docker image

From the **bmad repo root** (the folder that contains `Dockerfile`):

```bash
docker build -t bmad-cli:latest .
```

This builds the image with Node 20, BMAD CLI, and optional deps (e.g. better-sqlite3). One-time per repo change.

### 4. Install BMAD into the project (this repo as project)

Use the bmad repo itself as the “project” so that `_bmad/` is created inside it. Mount the repo path into the container as `/workspace`:

**Mac/Linux:**

```bash
docker run --rm -v "$(pwd)":/workspace bmad-cli:latest install --directory /workspace --modules bmm --tools openclaw --yes
```

**Windows (PowerShell):**

```bash
docker run --rm -v "${PWD}:/workspace" bmad-cli:latest install --directory /workspace --modules bmm --tools openclaw --yes
```

If you use another folder as your project, replace `$(pwd)` / `${PWD}` with that path (e.g. `/path/to/myproject`).

### 5. Create Clawthorn memory and spreadsheet (via Docker)

Same mount; run the init script that lives in the image. Override the entrypoint so we run Node with the init script:

**Mac/Linux:**

```bash
docker run --rm -v "$(pwd)":/workspace --entrypoint node bmad-cli:latest scripts/init-clawthorn-memory.js --directory /workspace
```

**Windows (PowerShell):**

```bash
docker run --rm -v "${PWD}:/workspace" --entrypoint node bmad-cli:latest scripts/init-clawthorn-memory.js --directory /workspace
```

This creates `_bmad/_memory/`, `job-applications.csv` (with columns: Job title, Company, Source, URL, Date attempted, Status, Notes), and `resume-text.txt`. **Date attempted** is the application date/time (when you successfully applied; record date and time there).

### 6. Paste resume and optional config (on your machine)

- Open `_bmad/_memory/resume-text.txt` and paste your resume text.
- Optional: set `CLAWTHORN_RESUME_PATH` when running any CLI in Docker if your PDF path inside the container is different, or edit `docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml` (resume_path, goal, etc.).

### 7. Copy OpenClaw skills (on your machine)

OpenClaw runs on the host and needs the skills in its skills folder. From the bmad repo root:

```bash
cp -r docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawdette-orchestrator ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/
```

Restart or reload OpenClaw so it loads them. See [openclaw-skills-to-install.md](openclaw-skills-to-install.md).

### 8. Run OpenClaw and start (on your machine)

1. Open **OpenClaw** (the app on your computer).
2. Open the **project folder** — the bmad repo folder that now contains `_bmad/` (and `_bmad/_memory/job-applications.csv`, `resume-text.txt`).
3. Ask for job-application help (e.g. “I want to apply for tester and automation jobs. Use my resume and track applications in the spreadsheet.”). Clawthorn (via Clawdette) will guide you and update the spreadsheet; you do the applying in the browser.

### 9. Later: run more CLI commands via Docker

With the same mount and optional `--env-file .env`:

```bash
# From bmad repo root (Mac/Linux)
docker run --rm -v "$(pwd)":/workspace --env-file .env bmad-cli:latest llm list
docker run --rm -v "$(pwd)":/workspace -w /workspace bmad-cli:latest tokens refresh
```

---

## Using Docker Compose

From the bmad repo root:

```bash
docker-compose build
```

Default compose mounts `.` as `/workspace`. To install BMAD and init Clawthorn:

```bash
docker-compose run --rm bmad install --directory /workspace --modules bmm --tools openclaw --yes
docker-compose run --rm --entrypoint node bmad scripts/init-clawthorn-memory.js --directory /workspace
```

Uncomment `env_file: .env` in `docker-compose.yml` if you want to load API keys. Then still do steps 6–8 on the host (resume, copy skills, run OpenClaw).

---

## Paths summary

| Item | Location |
|------|----------|
| Project (bmad repo with _bmad) | On host, e.g. `~/bmad` or `C:\Users\You\bmad` |
| Mount in Docker | `-v /host/path/to/bmad:/workspace` |
| _bmad/_memory/job-applications.csv | In project folder; **Date attempted** = application date/time when you applied successfully |
| _bmad/_memory/resume-text.txt | In project folder |
| OpenClaw skills | Copied to `~/.openclaw/workspace/skills/` (or project `.openclaw/skills/`) from project’s `docs/guidelines/openclaw/` |
| .env | In project (repo) root; passed into container with `--env-file .env` when needed |

---

## Troubleshooting

- **Permission errors in container:** On Linux, if files created in `_bmad/` are owned by root, fix with `chown` on the host or run the container with a user that matches your host user.
- **OpenClaw doesn’t see skills:** Ensure you restarted/reloaded OpenClaw after copying into `~/.openclaw/workspace/skills/` (or project `.openclaw/skills/`).
- **Resume not found:** Clawthorn reads `_bmad/_memory/resume-text.txt` (paste text there). PDF path in config is for reference only unless you have a tool that attaches the file.

For tools and optional Playwright when you add automation, see [clawthorn-job-hunt/tools-and-dependencies.md](clawthorn-job-hunt/tools-and-dependencies.md).
