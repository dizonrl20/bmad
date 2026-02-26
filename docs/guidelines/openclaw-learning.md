# OpenClaw Learning Module

OpenClaw learns and adapts to the user separately from BMAD: conversation style, preferred tools, and what works in practice. This module defines where and how OpenClaw records and uses that learning.

## Where OpenClaw stores learning

- **Dedicated learning file (recommended)** — `memory/openclaw-learning.md` in the OpenClaw workspace (e.g. `~/.openclaw/workspace/memory/openclaw-learning.md`) or, in a BMAD project, `_bmad/_memory/openclaw-learning.md`. Create it if it doesn’t exist.
- **Session memory** — Continue using `memory/YYYY-MM-DD.md` for daily session summary; at end of session, append any **reusable** preferences or patterns to `openclaw-learning.md` so future sessions load them.
- **BMAD context engine (optional)** — For BMAD projects, OpenClaw can also store learning via `bmad context store <key> "<content>" --namespace user` so BMAD agents and OpenClaw share user preferences.

## What to record (OpenClaw learning)

- **User corrections** — When the user corrects a response (tone, format, tool choice), add a short rule to openclaw-learning.md.
- **Preferred tools and flows** — Which MCPs, skills, or workflows the user uses most or asked to use by default.
- **Style** — Response length, formality, use of bullets vs paragraphs, etc.
- **What worked** — After a successful task, one-line note (e.g. "User prefers running tests with npm run test:unit").

## Session initialization (load learning)

- In the OpenClaw agent system prompt, extend the session initialization rule to load the learning file when present:
  - Load ONLY: SOUL.md, USER.md, IDENTITY.md, memory/YYYY-MM-DD.md (if exists), **memory/openclaw-learning.md (if exists)**.
- So at session start OpenClaw loads the learning file and applies it for that session. No need to load full MEMORY.md or full history.

## How OpenClaw uses learning

- Read `openclaw-learning.md` at session start and follow the rules and preferences listed.
- When the user gives explicit feedback or a correction, append a concise line or bullet to `openclaw-learning.md` (and optionally update BMAD context with `bmad context store` in a BMAD project).
- Prefer short, actionable entries so the file stays scannable and token-efficient.

## Separation from BMAD learning

- **BMAD learning** — Project/workflow/agent preferences, conventions, architecture decisions. Stored in BMAD context namespace `learning` or agent sidecars. Used by BMAD workflows and agents.
- **OpenClaw learning** — Conversation and tooling preferences, style, what worked in chat. Stored in openclaw-learning.md (and optionally BMAD context namespace `user`). Used by OpenClaw at session start.

Both can coexist: BMAD learns project-level patterns; OpenClaw learns user interaction patterns. In a BMAD project, OpenClaw can read BMAD learning via `bmad context search` and add its own entries to the same context store with namespace `user` for shared reuse.
