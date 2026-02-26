# OpenClaw — skills to install

When you set up OpenClaw with this repo, **install these skills** so the orchestrator (Clawdette) and the job-application agent (Clawthorn) work. Copy each skill folder into OpenClaw’s skills directory (see commands below).

---

## For BMAD + orchestrator + job applications

Install **all three** so OpenClaw can coordinate and do job-application tracking:

| Skill folder | Purpose |
|--------------|---------|
| **bmad-controller** | Teaches OpenClaw to follow BMAD (workflows, agents, LLM config, token rules). |
| **clawdette-orchestrator** | Adds Clawdette; she delegates to subagents (Clawrence, Clawdia, Clawton, Clawra, **Clawthorn**). |
| **clawthorn-job-hunt** | Job-application agent: resume, spreadsheet, job sites, daily cap, no double-apply. |

---

## Install commands

From the **bmad repo root** (adjust paths if your repo is elsewhere).

**User workspace (all projects):**

```bash
cp -r docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawdette-orchestrator ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/
```

**Project-only (single project):**

```bash
cp -r docs/guidelines/openclaw/bmad-controller /path/to/your/project/.openclaw/skills/
cp -r docs/guidelines/openclaw/clawdette-orchestrator /path/to/your/project/.openclaw/skills/
cp -r docs/guidelines/openclaw/clawthorn-job-hunt /path/to/your/project/.openclaw/skills/
```

Then **restart or reload OpenClaw** so it loads the new skills.

---

## Job applications only

If you only want job-application help (Clawthorn) and already have BMAD + Clawdette:

- You still need **clawdette-orchestrator** (so Clawdette can delegate to Clawthorn) and **clawthorn-job-hunt**.
- Recommended: install all three (bmad-controller, clawdette-orchestrator, clawthorn-job-hunt) for a consistent setup.

---

## File locations in this repo

| What | Path in repo |
|------|----------------|
| BMAD controller skill | `docs/guidelines/openclaw/bmad-controller/` |
| Clawdette orchestrator skill | `docs/guidelines/openclaw/clawdette-orchestrator/` |
| Clawthorn job-hunt skill | `docs/guidelines/openclaw/clawthorn-job-hunt/` |

After copying, OpenClaw will see them in `~/.openclaw/workspace/skills/` or `<project>/.openclaw/skills/`.
