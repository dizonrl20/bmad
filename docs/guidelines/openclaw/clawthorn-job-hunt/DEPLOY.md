# Clawthorn — Deploy (local or Docker)

**One clean path:** Follow **Get started** in [openclaw-clawthorn-job-hunt.md](../../openclaw-clawthorn-job-hunt.md). It covers clone → install → `npm run clawthorn:init` → paste resume → copy skills → run OpenClaw.

## Quick reference

- **OpenClaw skills to install (orchestrator + Clawthorn):** See [openclaw-skills-to-install.md](../openclaw-skills-to-install.md). Install **bmad-controller**, **clawdette-orchestrator**, and **clawthorn-job-hunt** so OpenClaw can run the orchestrator and Clawthorn for job applications.
- **Init memory/spreadsheet:** From bmad repo: `npm run clawthorn:init` (or `npm run clawthorn:init -- --directory /path/to/project`). Creates CSV with columns: Job title, Company, Source, URL, Date attempted, Status, Notes.
- **Resume:** Paste your resume text into `_bmad/_memory/resume-text.txt` so Clawthorn can read it.
- **Trace back applications:** Spreadsheet is at `_bmad/_memory/job-applications.csv`. See [job-applications-spreadsheet-guide.md](job-applications-spreadsheet-guide.md).
- **Config:** `job-hunt-config.yaml` in this folder; override resume path with env `CLAWTHORN_RESUME_PATH` if needed (e.g. Docker).
- **Tools/Docker (Playwright, etc.):** See [tools-and-dependencies.md](tools-and-dependencies.md).
