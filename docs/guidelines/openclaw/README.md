# OpenClaw + BMAD

BMAD controls how OpenClaw works in a BMAD project via **guidelines** and an optional **controller skill**.

## Guidelines

- **[OpenClaw–BMAD guidelines](../openclaw-bmad-guidelines.md)** — Canonical rules: BMAD is source of truth, load-then-follow workflows/agents, use `/bmad-help`, scale-adaptive behavior.
- **[OpenClaw token efficiency (free-tier preservation)](../openclaw-cost-optimization.md)** — Local search (QMD / BMAD context), session init rule, Exa.ai, model routing, heartbeat to local LLM, Kimi K 2.5. Keeps usage within free API limits.
- **[OpenClaw orchestrator (Clawdette)](../openclaw-orchestrator.md)** — Orchestrator persona (Clawdette) connected to the learning module; subagents (Clawrence, Clawdia, Clawton, Clawra, Clawthorn); manual IDE/LLM override; Clawdette can pick LLM by token availability and ranking when allowed.
- **[Clawthorn job-hunt](../openclaw-clawthorn-job-hunt.md)** — Job-application subagent: navigate Indeed, LinkedIn, Workday, GC Jobs, Ontario, St. Catharines, NRCan; track applications in a spreadsheet; flag failures; teachable by user.

## BMAD controller skill

The `bmad-controller` skill teaches OpenClaw to follow those guidelines and load BMAD from the project.

**Install the skill (pick one):**

1. **Project-local (if OpenClaw supports project skills)**  
   Run BMAD install and select OpenClaw. BMAD installs workflow/command stubs into `.openclaw/skills`. Then copy this folder into that tree:
   ```bash
   cp -r docs/guidelines/openclaw/bmad-controller .openclaw/skills/
   ```

2. **User workspace (recommended)**  
   Copy the skill into your OpenClaw workspace so it applies to all BMAD projects:
   ```bash
   cp -r docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/
   ```
   Restart or reload OpenClaw so it picks up the new skill.

## Clawdette orchestrator skill

The `clawdette-orchestrator` skill adds the orchestrator persona (Clawdette) and subagent roles (Clawrence, Clawdia, Clawton, Clawra, Clawthorn), connected to the OpenClaw learning module. Install alongside bmad-controller:

```bash
cp -r docs/guidelines/openclaw/clawdette-orchestrator ~/.openclaw/workspace/skills/
cp -r docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/
# or project-local: cp -r docs/guidelines/openclaw/clawdette-orchestrator .openclaw/skills/
#                    cp -r docs/guidelines/openclaw/clawthorn-job-hunt .openclaw/skills/
```

Reload OpenClaw. You can manually set IDE (OpenClaw, Claude Code, Cursor) and LLM; or allow Clawdette to pick the LLM by token availability and provider ranking (see openclaw-orchestrator.md).

## Summary

| Item | Purpose |
|------|--------|
| `openclaw-bmad-guidelines.md` | Rules that define “BMAD controls OpenClaw”. |
| `openclaw-orchestrator.md` | Clawdette orchestrator, subagent personas, learning link, manual/auto LLM. |
| `bmad-controller/SKILL.md` | AgentSkills-compatible skill that enforces BMAD + token rules. |
| `clawdette-orchestrator/SKILL.md` | Orchestrator skill: Clawdette + subagents, learning, LLM pick. |
| `clawthorn-job-hunt/SKILL.md` | Job-application agent: resume, LinkedIn, GitHub; spreadsheet tracking; teachable. |
| Installer (OpenClaw selected) | Writes BMAD workflow/command stubs to `.openclaw/skills`. |

After setup, OpenClaw will follow BMAD workflows and can use Clawdette to orchestrate subagents and (optionally) choose LLM by tokens and ranking.
