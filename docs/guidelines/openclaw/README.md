# OpenClaw + BMAD

BMAD controls how OpenClaw works in a BMAD project via **guidelines** and an optional **controller skill**.

## Guidelines

- **[OpenClaw–BMAD guidelines](../openclaw-bmad-guidelines.md)** — Canonical rules: BMAD is source of truth, load-then-follow workflows/agents, use `/bmad-help`, scale-adaptive behavior.

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

## Summary

| Item | Purpose |
|------|--------|
| `openclaw-bmad-guidelines.md` | Rules that define “BMAD controls OpenClaw”. |
| `bmad-controller/SKILL.md` | AgentSkills-compatible skill that enforces those rules. |
| Installer (OpenClaw selected) | Writes BMAD workflow/command stubs to `.openclaw/skills`. |

After setup, OpenClaw will follow BMAD workflows, agents, and help when working in this project.
