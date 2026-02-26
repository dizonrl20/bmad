# Clawthorn — Deploy (local or Docker)

This folder and branch `develop-job-app` are for deploying the job-application agent on a local machine or in Docker.

## Branch: develop-job-app

- Contains: Clawthorn skill, config with your resume path / LinkedIn / GitHub / goal, spreadsheet template, and orchestrator updates.
- **Commit and push** (run in a normal terminal; Cursor’s git may inject options that break commit):
  ```bash
  cd /path/to/bmad
  git checkout develop-job-app
  git add docs/guidelines/openclaw-clawthorn-job-hunt.md docs/guidelines/openclaw/clawthorn-job-hunt/ docs/guidelines/openclaw-orchestrator.md docs/guidelines/openclaw/README.md docs/guidelines/openclaw/clawdette-orchestrator/SKILL.md
  git commit -m "feat: add Clawthorn job-application agent"
  git push bmad develop-job-app
  ```

## Local

1. Clone or pull repo, checkout `develop-job-app`.
2. Copy skill: `cp -r docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/`
3. Set resume path in `job-hunt-config.yaml` or env `CLAWTHORN_RESUME_PATH`.
4. Create `_bmad/_memory/job-applications.csv` with header: `Job title,Source,URL,Date attempted,Status,Notes` (or copy from `job-applications-template.csv`).

## Docker

1. Build from repo root (same Dockerfile as main).
2. Mount project dir so `_bmad/_memory/` and config are available.
3. Set `CLAWTHORN_RESUME_PATH` to resume path inside container (e.g. `/workspace/resume.pdf`).
4. Run OpenClaw (or your runner) inside the container with the mounted project.
