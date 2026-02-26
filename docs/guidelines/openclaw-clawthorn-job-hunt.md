# Clawthorn — Job Application Agent

Clawthorn is an OpenClaw **subagent** that helps you apply for jobs: he **guides** you with job-site links and tailoring, **tracks** every attempt in a spreadsheet, and **learns** from you when you teach him how a site works. **You** do the actual applying in your browser (login, forms, captchas); Clawthorn gives you the playbook and keeps the log.

---

## Get started (one-time setup)

Do this once. Then open OpenClaw and ask Clawthorn (or Clawdette) for job-application help.

### 1. Clone and install

```bash
git clone https://github.com/dizonrl20/bmad.git
cd bmad
npm install
```

### 2. Install BMAD into this repo (or your project)

From the bmad repo, install BMAD into the folder you’ll use as your “project” (this repo or another):

```bash
node tools/cli/bmad-cli.js install --directory . --modules bmm --tools openclaw --yes
```

Use `--directory /path/to/your/project` if your project is elsewhere.

### 3. Create Clawthorn memory and spreadsheet

From the **bmad repo** (so `npm` finds the script):

- If your project is the bmad repo itself (you used `--directory .` in step 2):
  ```bash
  cd bmad
  npm run clawthorn:init
  ```
- If your project is another folder:
  ```bash
  cd bmad
  npm run clawthorn:init -- --directory /path/to/your/project
  ```

This creates `_bmad/_memory/`, `job-applications.csv` (with header), and `resume-text.txt` (placeholder) in the project folder.

### 4. Put your resume where Clawthorn can read it

Open `_bmad/_memory/resume-text.txt` and **paste your resume text** (e.g. copy from Word/PDF or use a PDF-to-text tool). Clawthorn reads this file to tailor applications; he does not read the PDF directly.

Optional: set your resume PDF path in `docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml` (or env `CLAWTHORN_RESUME_PATH`) for reference.

### 5. Copy OpenClaw skills (orchestrator + Clawthorn for job applications)

OpenClaw must have these skills installed so it can run the orchestrator and Clawthorn. See **[openclaw-skills-to-install.md](openclaw/openclaw-skills-to-install.md)** for the full list and why each is needed. Copy the BMAD controller, Clawdette orchestrator, and Clawthorn job-hunt skill into OpenClaw:

```bash
# From the bmad repo root:
cp -r docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawdette-orchestrator ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/
```

If you use project-local skills:

```bash
cp -r docs/guidelines/openclaw/bmad-controller /path/to/your/project/.openclaw/skills/
cp -r docs/guidelines/openclaw/clawdette-orchestrator /path/to/your/project/.openclaw/skills/
cp -r docs/guidelines/openclaw/clawthorn-job-hunt /path/to/your/project/.openclaw/skills/
```

Restart or reload OpenClaw.

### 6. Run OpenClaw and start

1. Open your **project folder** (the one with `_bmad/`) in OpenClaw.
2. Ask for job-application help, e.g.: “I want to apply for tester and automation jobs. Use my resume and track applications in the spreadsheet.”
3. Clawthorn (or Clawdette delegating to Clawthorn) will use your config, resume text, and job-site URLs to guide you and update `_bmad/_memory/job-applications.csv`. You do the applying in the browser; he tracks and learns.

**Review the spreadsheet** (`_bmad/_memory/job-applications.csv`) whenever you can. Teach him how a site works so he can guide you better next time.

---

## What Clawthorn does (and doesn’t)

| He does | He doesn’t |
|--------|------------|
| Reads your resume from `_bmad/_memory/resume-text.txt` and config (goal, LinkedIn, GitHub). | Log into job sites or submit forms for you. |
| Gives you job-site links (Indeed, LinkedIn, Workday, GC Jobs, Ontario, St. Catharines, NRCan). | Bypass captchas or human verification. |
| Tracks every attempt in `job-applications.csv` (Applied / Failed / Blocked + notes). | Read your PDF resume directly (you paste text). |
| Learns from you (e.g. “On Workday do X then Y”) and stores it in learning. | Fetch your live LinkedIn profile (you can paste snippets). |
| Flags you when he can’t complete something so you can fix or teach. | |

---

## Spreadsheet columns (trace back what you applied for)

The spreadsheet is the place to **learn what you applied for** and which were successful. Each row = one application; **URL** and **Company** let you trace back.

| Column         | Description |
|----------------|-------------|
| Job title      | Role / position |
| Company        | Employer or posting source |
| Source         | Indeed / LinkedIn / Workday / GC Jobs / Ontario / St. Catharines / NRCan / Other |
| URL            | Full job posting link (reopen and avoid double-apply) |
| Date attempted | **Application date and time** — when you submitted (for Status=Applied, when you successfully applied). Use YYYY-MM-DD and time (e.g. HH:MM) so you can trace back. |
| Status         | **Applied** (submitted), **Failed** (could not submit), **Blocked** (e.g. captcha, login) |
| Notes          | What went wrong or what you need to do |

Full guide: **[clawthorn-job-hunt/job-applications-spreadsheet-guide.md](openclaw/clawthorn-job-hunt/job-applications-spreadsheet-guide.md)**.

---

## Daily limits and no double applications

- **10–20 applications per day** — Config sets `daily_application_cap` (e.g. 20) and `daily_application_min` (e.g. 10). Clawthorn will not suggest or track more than the cap per calendar day.
- **Stagger by site** — He won’t do many applications for the same site (e.g. Indeed) in one go; he spreads across sites and time so applications aren’t all at once for one site.
- **No double applications** — Before suggesting or logging an application, he checks the spreadsheet: if the job **URL** (or same job title + company + source) is already there, he skips and tells you “Already applied.” So the spreadsheet is the source of truth for what you’ve already applied to.

## Config reference

`docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml`:

- `resume_path` — PDF path (override with `CLAWTHORN_RESUME_PATH`).
- `resume_text_path` — Path to resume text file (default `_bmad/_memory/resume-text.txt`). Clawthorn reads this.
- `linkedin_url`, `github_demo_repo`, `goal` — Your profile and career target.
- `job_sites` — URLs for each board.
- `spreadsheet_path` — Where to log applications (default `_bmad/_memory/job-applications.csv`).
- `daily_application_cap`, `daily_application_min` — Max and min applications per day (e.g. 20 and 10).
- `stagger_by_site` — If true, spread applications across sites; don’t do many from one site at once.

---

## Delegation (Clawdette)

When you ask for job-application help, **Clawdette** delegates to **Clawthorn**. She doesn’t do the applications; she routes you to him.

---

## Deploy (local or Docker)

- **Local:** After the steps above, run OpenClaw from your project folder. Resume text and spreadsheet are under `_bmad/_memory/`.
- **Docker (full guide):** See **[openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md](openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md)** for step-by-step: pull project, build image, run install and Clawthorn init in the container, then run OpenClaw on your machine and copy skills.
- **Easy deploy (script):** From the bmad repo root, run `./scripts/deploy-with-docker.sh` (or `./scripts/deploy-with-docker.sh --directory /path/to/project`). This builds the Docker image, runs install and Clawthorn init, then prints the next steps (paste resume, copy skills, run OpenClaw). So the project “builds itself” on Docker; you complete the rest on the host.
- For optional browser automation (e.g. Playwright), see **[clawthorn-job-hunt/tools-and-dependencies.md](openclaw/clawthorn-job-hunt/tools-and-dependencies.md)**.

---

## Related files and guides (contextual names)

| File | Purpose |
|------|---------|
| **[llm-api-keys-guide.md](llm-api-keys-guide.md)** | How to add API keys per LLM (Gemini, Groq, etc.); .env and Docker. |
| **[openclaw/openclaw-skills-to-install.md](openclaw/openclaw-skills-to-install.md)** | Which OpenClaw skills to install for orchestrator and Clawthorn job applications. |
| **[openclaw/clawthorn-job-hunt/job-applications-spreadsheet-guide.md](openclaw/clawthorn-job-hunt/job-applications-spreadsheet-guide.md)** | Spreadsheet columns, how to trace back what you applied for and which were successful. |
| **[openclaw/clawthorn-job-hunt/tools-and-dependencies.md](openclaw/clawthorn-job-hunt/tools-and-dependencies.md)** | Required vs optional tools (Playwright, etc.); what to install when running on Docker. |
| **openclaw/clawthorn-job-hunt/job-hunt-config.yaml** | Your resume path, LinkedIn, GitHub, goal, job sites, daily cap, spreadsheet path. |
| **openclaw/clawthorn-job-hunt/SKILL.md** | Clawthorn agent instructions (what he does, spreadsheet format, daily cap, no double-apply). |
| **openclaw/clawthorn-job-hunt/DEPLOY.md** | Short deploy reference (init, resume, skills, config). |
| **openclaw/clawthorn-job-hunt/job-applications-template.csv** | CSV header template (Job title, Company, Source, URL, Date attempted, Status, Notes). **Date attempted** = application date/time (when you successfully applied). |
| **openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md** | Full guide: run BMAD and OpenClaw (Clawthorn) on Docker after you pull the project. |
| **FEASIBILITY-AND-IMPLEMENTATION-REVIEW.md** | Honest assessment of what works, what does not, and how to implement. |
