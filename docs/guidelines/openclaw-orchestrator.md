# OpenClaw Orchestrator (Clawdette) and Subagents

OpenClaw can run an **orchestrator** that connects to the OpenClaw learning module and delegates work to **subagents** with persona names. The orchestrator and all subagents still follow BMAD. You can **manually** choose IDE and LLM, or let the orchestrator **pick the LLM** by token availability and provider ranking.

---

## Orchestrator: Clawdette

**Clawdette** is the orchestrator persona. She:

- **Connects to the OpenClaw learning module** — At session start and before delegating, she loads `memory/openclaw-learning.md` (and in BMAD projects, `bmad context search` with namespace `user` / `learning`) so all decisions respect learned preferences.
- **Delegates to subagents** — She assigns tasks to the named subagents below by role. She does not do the work herself; she routes and coordinates.
- **Follows BMAD** — For process, workflows, and "what next?", she uses BMAD (e.g. `/bmad-help`, workflow files under `_bmad/`). She never bypasses BMAD when the project is BMAD-enabled.
- **LLM selection** — If the user has not set a manual override, Clawdette can pick the active LLM by:
  1. Running `bmad tokens report` (or reading `_bmad/_config/tokens.sqlite` summary) to see which providers have remaining quota.
  2. Using `_bmad/_config/ai-discovery.json` or `bmad llm list` for provider ranking (free-tier quality).
  3. Choosing the highest-ranked provider that still has available tokens and running `bmad llm switch <provider> [model]`. If the user has set a manual choice, she leaves it unchanged.

---

## Subagents (persona names)

Each subagent has a distinct role. Clawdette routes work to them by task type. All subagents load and apply the same OpenClaw learning (and BMAD context when present) so behavior stays consistent.

| Persona    | Role                | Use for |
|------------|---------------------|--------|
| **Clawdette** | Orchestrator        | Routing, learning, LLM pick, BMAD coordination; does not perform task work. |
| **Clawrence** | Research & planning | Discovery, web search (Exa), specs, PRD/architecture context. |
| **Clawdia**   | Implementation     | Code, scripts, tests, refactors; follows BMAD dev-story/quick-dev when applicable. |
| **Clawton**   | Review & QA         | Code review, testing strategy, validation, adversarial checks. |
| **Clawra**    | Documentation      | Docs, README, comments, project-context; follows tech-writer standards when BMAD present. |

- **Naming:** Use these persona names in prompts and in learning (e.g. "Clawdia handles implementation; user prefers tabs").
- **Learning:** When a subagent receives user feedback, it is recorded in `memory/openclaw-learning.md` (and optionally `bmad context store ... --namespace user`) so Clawdette and others adapt next time.

---

## Connection to the learning module

- **Orchestrator (Clawdette)**  
  - On session start: load `memory/openclaw-learning.md`, and in BMAD projects run `bmad context search "user preferences"` (or similar) and apply results.  
  - Before delegating: pass relevant snippets from learning to the subagent (e.g. "user prefers concise responses").  
  - After a subagent reports feedback: append to `openclaw-learning.md` or store via `bmad context store` so the learning module stays up to date.

- **Subagents**  
  - Receive context from Clawdette that includes learning.  
  - When the user gives a correction or preference, report it back to Clawdette (or write one line to `openclaw-learning.md` / `bmad context store`) so the learning module is updated.

---

## Manual override: IDE and LLM

You are **not** required to use Claude Code. You can use OpenClaw, Cursor, or another supported IDE and still use this orchestrator design.

- **IDE (where you chat)**  
  - **Manual:** Use the tool you prefer: OpenClaw, Claude Code, Cursor, etc. BMAD install can target any of them via `--tools openclaw`, `--tools claude-code`, `--tools cursor`. Switch by re-running install with a different `--tools` or by editing the generated IDE config.  
  - No automatic switching of IDE; that is always your choice.

- **LLM (which model handles the request)**  
  - **Manual:** Set the active provider and model in `_bmad/_config/llm-config.yaml` (e.g. `active_provider`, `active_model`) or by running `bmad llm switch <provider> [model]`. Set env vars for the chosen provider (e.g. `GEMINI_API_KEY`).  
  - **Automatic (Clawdette):** If you allow it, Clawdette runs `bmad tokens report` and consults `ai-discovery.json` (or `bmad llm list`), then runs `bmad llm switch` to the best available provider by ranking and token availability. You can disable this by saying "use current LLM only" or by not giving her permission to run `bmad llm switch`.

---

## Clawdette LLM pick (token availability + ranking)

When Clawdette is allowed to choose the LLM:

1. **Token availability** — Run `bmad tokens report` (or equivalent read of token usage). For each provider, note remaining tokens / requests (or "unlimited").
2. **Ranking** — Use `_bmad/_config/ai-discovery.json` (top 20) or the order in `bmad llm list` (free-tier registry). Prefer higher-ranked providers when quota is similar.
3. **Choice** — Pick the highest-ranked provider that has sufficient remaining quota (e.g. not near daily limit). Run `bmad llm switch <provider> [model]`.
4. **Lock** — If the user says "stick to this model" or "manual only", stop auto-switching and use only the current `llm-config.yaml` until the user changes it.

---

## BMAD alignment

- Clawdette and all subagents **follow BMAD** when the project has `_bmad/`: load workflows and agents from BMAD, use `/bmad-help` for "what next?", and respect phases (plan → architecture → implementation).
- Implementation work (Clawdia) should use BMAD dev-story or quick-dev when applicable; documentation (Clawra) should follow BMAD tech-writer and project-context when present; review (Clawton) should align with BMAD code-review and adversarial review patterns.
- The learning module (openclaw-learning.md and BMAD context `user`/`learning`) is additive to BMAD, not a replacement.

---

## Summary

| Item            | Description |
|-----------------|-------------|
| **Clawdette**   | Orchestrator; connects to learning, delegates to subagents, follows BMAD, can pick LLM by tokens + rank. |
| **Subagents**   | Clawrence (research), Clawdia (implementation), Clawton (review), Clawra (documentation); persona names. |
| **Learning**    | Orchestrator loads openclaw-learning.md + BMAD context; subagents report back so learning stays updated. |
| **Manual IDE**  | You choose OpenClaw, Claude Code, Cursor, etc.; BMAD install supports all via `--tools`. |
| **Manual LLM**  | Set in llm-config.yaml or `bmad llm switch`; env vars for API keys. |
| **Auto LLM**    | Clawdette can run `bmad tokens report` + ranking and `bmad llm switch` when you allow it. |
