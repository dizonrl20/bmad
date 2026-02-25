---
name: bmad-controller
description: BMAD controls how OpenClaw works in this project. Load BMAD artifacts, manage LLM switching, track tokens, and use context memory.
metadata:
  openclaw:
    emoji: "📐"
    requires: {}
---

# BMAD Controller (OpenClaw)

When working in a project that contains BMAD (e.g. `_bmad/` or configured BMAD folder), OpenClaw MUST behave according to BMAD. This skill enforces that.

## Authority

- **BMAD is the source of truth** for process, workflows, and agents. Load workflow, agent, task, and tool definitions from the project BMAD folder. Do not override them with generic behavior.
- For "what next?" or process questions, use BMAD's guidance (e.g. the help task or `/bmad-help` logic).

## How to Follow BMAD

1. **Discover BMAD root**
   Look for `_bmad` (or the project's configured BMAD folder) at the project root.

2. **Workflows**
   For any BMAD workflow (e.g. create PRD, create architecture, implement):
   - LOAD the workflow file from `{project-root}/_bmad/...` (or the configured path).
   - READ the full contents.
   - FOLLOW each step in order. Do not skip or reorder unless the user explicitly asks.

3. **Agents**
   When a BMAD agent is invoked:
   - LOAD the agent file from the BMAD folder.
   - Embody that persona and follow its activation and menu until the user exits.

4. **Tasks and tools**
   LOAD the task or tool file from BMAD, READ it, then execute as specified.

5. **Help**
   When the user is unsure what to do next, run or suggest BMAD help (e.g. `/bmad-help` or the BMAD help task) so the next step is chosen by BMAD.

## LLM Switching

- Read `_bmad/_config/llm-config.yaml` to determine the active LLM provider and model.
- Use the active provider for all LLM calls. Switch with `bmad llm switch <provider> [model]`.
- Supported free-tier providers: Gemini, Groq, Mistral, DeepSeek, Cerebras, OpenRouter, GitHub Models, NVIDIA NIM, Cohere, Cloudflare Workers AI.
- API keys come from environment variables (e.g. `GEMINI_API_KEY`).

## Token Awareness

- Check `_bmad/_config/tokens.sqlite` (via `bmad tokens report`) before selecting a model.
- If the active provider is near its limit, recommend switching to another provider with remaining tokens.
- After LLM calls, update usage with `bmad tokens refresh`.

## AI Discovery

- The top 20 AI providers are cached in `_bmad/_config/ai-discovery.json`.
- Run `bmad ai-discover refresh` to update. Reference this cache when recommending alternatives.

## Context Memory

- Before starting a task, search for relevant prior context:
  `bmad context search "<task description>"`
- After completing work, store key decisions:
  `bmad context store <key> "<content>" --namespace <ns>`
- Namespaces: `project`, `agent`, `workflow`, `user`, `discovery`.
- Switch context sessions with `bmad context switch <session-name>`.
- Vector search uses the active LLM's embeddings; falls back to local TF-IDF offline.

## Full guidelines

For the complete rule set, read:

- **In-repo:** `docs/guidelines/openclaw-bmad-guidelines.md` (relative to project root).

Summary: **Load BMAD -> Read -> Follow. Use BMAD workflows and agents; manage LLMs via config; track tokens; search/store context.**
