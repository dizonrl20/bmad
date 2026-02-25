# OpenClaw + BMAD Guidelines

When OpenClaw is used in a BMAD-enabled project, **BMAD controls how OpenClaw works**. OpenClaw MUST follow these guidelines so behavior is consistent with the BMad Method.

## Authority

- **BMAD is the source of truth** for process, workflows, and agent behavior in this project.
- OpenClaw MUST load and follow BMAD artifacts from the project (e.g. `{project-root}/_bmad/` or the configured BMAD folder). Do not override BMAD instructions with generic or local preferences unless the user explicitly asks to deviate.
- When the user asks "what next?" or for process guidance, prefer **BMAD's answer** (e.g. `/bmad-help` or the help task) over ad hoc advice.

## Workflows and Phases

- **Use BMAD workflows** for analysis, planning, architecture, and implementation. Do not invent parallel workflows that bypass BMAD.
- **Respect phases**: BMAD phases (e.g. document project -> plan -> architecture -> implementation) define order. Do not skip or reorder phases unless the user explicitly requests it (e.g. "we already have a PRD").
- Before starting a workflow: **LOAD** the workflow file from the BMAD folder, **READ** it fully, then **FOLLOW** each step. Do not summarize or skip steps.

## Agents and Personas

- When a BMAD agent is invoked (e.g. PM, Architect, Developer, Tech Writer), **embody that agent** as defined in the BMAD agent file. Load the agent from `{project-root}/{{bmadFolderName}}/agents/...` and follow its activation and menu.
- Do not mix personas: stay in character until the user exits or switches agent.
- Party Mode (multiple agents in one session) follows BMAD's Party Mode workflow and return protocol.

## Tasks and Tools

- BMAD **tasks** and **tools** are defined under the BMAD folder. When executing a task or tool, LOAD the file from the BMAD path, READ it, then execute as specified.
- Do not substitute external or generic procedures when a BMAD task/tool exists for the same goal.

## Help and Discovery

- **`/bmad-help`** (or the BMAD help task) is the primary on-ramp. When the user is unsure what to do next, direct them to `/bmad-help` or run the help logic so BMAD can suggest the next step and optional actions.
- Use project context and BMAD's phase/workflow state to give accurate "what's next" answers.

## LLM Switching

- BMAD supports multiple LLM providers via `_bmad/_config/llm-config.yaml`. The active provider/model is set there.
- Use `bmad llm status` to check which LLM is active. Use `bmad llm switch <provider> [model]` to change.
- When OpenClaw needs to call an LLM, it SHOULD use the active provider from BMAD config (read `llm-config.yaml`). Supported free-tier providers: Gemini, Groq, Mistral, DeepSeek, Cerebras, OpenRouter, GitHub Models, NVIDIA NIM, Cohere, Cloudflare Workers AI.
- API keys are read from environment variables (e.g. `GEMINI_API_KEY`); never stored in config files.

## Token Awareness

- Token usage is tracked in `_bmad/_config/tokens.sqlite`. Run `bmad tokens refresh` to update, `bmad tokens report` for a summary.
- Before choosing a model for a task, check token availability. If the active provider is near its daily/monthly limit, suggest switching to another provider with remaining capacity.
- After completing LLM calls, record usage via `bmad tokens` so the tracker stays accurate.

## AI Discovery

- The top 20 AI providers (ranked by free-tier value) are cached in `_bmad/_config/ai-discovery.json`. Run `bmad ai-discover refresh` to update.
- When suggesting model alternatives, reference this cache so recommendations are current.

## Context Memory Engine

- BMAD provides a vector-searchable context memory at `_bmad/_memory/context.sqlite`.
- **Before starting work**: run `bmad context search "<current task>"` to load relevant prior context (architecture decisions, PRD outputs, previous session history).
- **After completing work**: store key decisions and outputs via `bmad context store <key> <content> --namespace <ns>`.
- Context namespaces: `project`, `agent`, `workflow`, `user`, `discovery`.
- Context sessions allow switching between different working contexts via `bmad context switch <session>`.
- Vector search uses the active LLM's embedding endpoint when available, with a local TF-IDF fallback for offline use.

## Scale-Adaptive Behavior

- BMAD is scale-adaptive: planning depth should match project size (bug fix vs. enterprise). Follow BMAD's guidance for depth and rigor; do not always force maximum process on small changes.

## Summary

| Rule | Meaning |
|------|--------|
| BMAD is source of truth | Process and workflows come from BMAD artifacts. |
| Load then follow | Always LOAD the BMAD file, READ it, then FOLLOW. |
| Use BMAD workflows | No parallel ad hoc workflows; use BMAD phases. |
| Agents = BMAD definitions | Embody BMAD agent personas from agent files. |
| Help via BMAD | Prefer `/bmad-help` and BMAD's "what's next" logic. |
| Scale-adaptive | Match planning depth to project size per BMAD. |
| LLM switching | Use active provider from `llm-config.yaml`; switch as needed. |
| Token awareness | Check `tokens.sqlite` before tasks; avoid exhausted providers. |
| Context memory | Search context before work; store decisions after. |
| AI discovery | Reference `ai-discovery.json` for model recommendations. |

These guidelines ensure OpenClaw acts as a **BMAD-driven** assistant rather than a generic coding assistant when working in a BMAD project.
