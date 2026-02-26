# Clawthorn job-hunt — tools and dependencies

What the job-application flow needs on your machine or in Docker so OpenClaw and Clawthorn can run correctly.

---

## Required (always)

| Tool / dependency | Purpose |
|-------------------|---------|
| **Node.js** v20+ | BMAD CLI (bmad llm, bmad tokens, clawthorn:init). |
| **npm** | Install BMAD and run scripts. |
| **OpenClaw** | IDE where Clawthorn and Clawdette run; install separately. |
| **BMAD skills** | bmad-controller, clawdette-orchestrator, clawthorn-job-hunt — see openclaw-skills-to-install.md in the openclaw folder. |

No browser automation is required for the **guided** flow: you apply in your browser; Clawthorn guides and tracks.

---

## Optional (for future browser automation)

If you add **automated** job application (e.g. a script or OpenClaw tool that drives a browser):

| Tool | Purpose |
|------|---------|
| **Playwright** | Browser automation (Chromium/Firefox/WebKit) to open job sites, fill forms, click submit. Install in the project or in the Docker image. |
| **Chromium / Chrome** | Playwright typically installs Chromium; some setups use system Chrome. |

**When installed on Docker:** To use Playwright inside a container, the Docker image must install Playwright and its system dependencies. Example (in Dockerfile or install script):

```dockerfile
RUN npx playwright install chromium
RUN npx playwright install-deps chromium
```

Or in a setup script:

```bash
npm install -D playwright
npx playwright install chromium
npx playwright install-deps chromium
```

OpenClaw does not install Playwright by default. This doc is the reference: **if you add browser-based automation for job applications, install Playwright (and deps) in that environment** (local or Docker).

---

## Docker-specific

When running BMAD/OpenClaw in Docker:

1. **Base image** — Use the repo Dockerfile (Node 20+, BMAD CLI). It does not include Playwright unless you extend it.
2. **Env** — Pass .env with API keys: --env-file .env or env_file: .env in docker-compose.
3. **Resume path** — Set CLAWTHORN_RESUME_PATH to the path inside the container (e.g. /workspace/resume.pdf if the project is mounted at /workspace).
4. **Project mount** — Mount the project so _bmad/_memory/ (spreadsheet, resume-text.txt) is available.
5. **Optional Playwright** — If you add automation that uses Playwright, extend the image with the install commands above and any extra system libs your OS needs.

---

## Summary

- **Guided flow (no automation):** Node 20+, npm, OpenClaw, BMAD skills. No Playwright.
- **If you add browser automation:** Install Playwright (and playwright install + install-deps) in that environment; document it here or in your Dockerfile so OpenClaw/Docker setup knows to install those tools.
