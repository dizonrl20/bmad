# Clawthorn — Job Application Agent

Clawthorn is an OpenClaw **subagent** that helps you apply for jobs. He navigates job boards, uses your resume and profiles, tracks every attempt in a **spreadsheet**, and **flags** you when he cannot complete an application so you can review and teach him.

---

## What Clawthorn does

- **Navigates:** Indeed, LinkedIn, Workday, [Government of Canada Jobs (GC Jobs)](https://psjobs-emploisfp.psc-cfp.gc.ca/psrs-srfp/applicant/page2440?fromMenu=true), Ontario jobs, local St. Catharines jobs, [NRCan (Natural Resources Canada)](https://natural-resources.canada.ca/careers).
- **Uses your assets:** Resume (PDF), [LinkedIn profile](https://www.linkedin.com/in/rodlesterdizon/), [GitHub demo repo](https://github.com/dizonrl20/accessibility) — configured in `docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml`.
- **Goal:** Apply for **tester and automation** roles; target **stable jobs** (e.g. government, enterprise). Resume and LinkedIn are scanned to align applications with your experience.
- **Spreadsheet:** One place to review what was applied for, what succeeded, and what failed or had issues. You review this list whenever you can.
- **Teachable:** You show him how to apply on a given site; he records it in learning and follows it next time.
- **Flags:** When he cannot successfully apply (captcha, login, unsupported flow), he adds a row to the spreadsheet and flags you.

---

## Setup

1. **Install BMAD** in your project (or use the repo that has this branch).
2. **Copy the Clawthorn skill and config** into OpenClaw (same way as bmad-controller / clawdette-orchestrator):
   - `cp -r docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/`
   - Or project: `cp -r docs/guidelines/openclaw/clawthorn-job-hunt /path/to/project/.openclaw/skills/`
3. **Resume path:** Config contains a default path. On another machine or Docker, set `CLAWTHORN_RESUME_PATH` to the path of your resume PDF (e.g. in a mounted volume).
4. **Spreadsheet:** Config points to `_bmad/_memory/job-applications.csv`. On first run, Clawthorn (or you) should create that file with the header row: `Job title,Source,URL,Date attempted,Status,Notes`. A template is in `clawthorn-job-hunt/job-applications-template.csv`.

---

## Spreadsheet columns

| Column         | Description |
|----------------|-------------|
| Job title      | Role + company/source |
| Source         | Indeed / LinkedIn / Workday / GC Jobs / Ontario / St. Catharines / NRCan / Other |
| URL            | Job posting link |
| Date attempted | When the application was attempted |
| Status         | **Applied** (submitted), **Failed** (could not submit), **Blocked** (e.g. captcha, login) |
| Notes          | What went wrong or what you need to do |

You review this list regularly; Clawthorn only appends rows.

---

## Delegation (Clawdette)

When the user asks for job-application help, **Clawdette** delegates to **Clawthorn**. She does not do the applications herself. She routes: "Job applications and tracking → Clawthorn."

---

## Deploy (local or Docker)

This branch (`develop-job-app`) is intended to be deployed on a local machine or in Docker so Clawthorn can run there.

- **Local:** Clone repo, checkout `develop-job-app`, run OpenClaw (or your runner) with this project; ensure resume path and `_bmad/_memory/job-applications.csv` are set.
- **Docker:** Mount the project (with `_bmad/` and config), set `CLAWTHORN_RESUME_PATH` to the resume path inside the container (e.g. `/workspace/resume.pdf`), and run the job-hunt workflow. The spreadsheet path in config is relative to the project root.

---

## Config reference

See `docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml` for:

- `resume_path` — PDF path (override with `CLAWTHORN_RESUME_PATH`).
- `linkedin_url`, `github_demo_repo` — Profile and demo project.
- `goal` — Career target (tester/automation, stable jobs).
- `job_sites` — URLs for each board.
- `spreadsheet_path` — Where to write the application log (CSV).
