# OpenClaw Token Efficiency (Free-Tier Preservation)

Use these guidelines so OpenClaw stays within **free API limits**: consume fewer tokens per request and per session, and avoid burning quota on heartbeats or bloated context. Same techniques whether you use Gemini, Groq, Kimi, or any other free-tier provider.

---

## 1. Local search instead of stuffing prompts (~95% token reduction)

**Problem:** Sending entire docs in every prompt burns through free-tier token limits (RPD, TPM, tokens/month) quickly.

**Solution:** Index your knowledge base with BM25 and vector search. Query locally, then send only the relevant snippets to OpenClaw.

- **QMD skill** — Indexes markdown with BM25 + vector search; you query and send only retrieved snippets. Add via: send the QMD skill GitHub link to OpenClaw and it can wrap it as a skill.
- **BMAD context engine** — In BMAD projects, use `bmad context search "<query>"` to pull relevant context from `_bmad/_memory/context.sqlite` and inject only those results into the prompt. Do not load full memory files.

**Rule:** Never auto-load whole docs or full MEMORY.md. Use local search (QMD or `bmad context search`) on demand and send only the retrieved snippets so your free quota lasts.

---

## 2. Session initialization rule (~90% context token reduction)

**Problem:** OpenClaw can load ~50KB of history on every message (2–3M tokens/session). On WhatsApp/Telegram etc. that burns through free daily/monthly limits fast.

**Solution:** Add a session initialization rule to the agent system prompt so each session loads a minimal set of files and does not auto-load history.

**Session initialization rule — add to OpenClaw agent system prompt:**

```
SESSION INITIALIZATION RULE:

On every session start:
1. Load ONLY these files:
   - SOUL.md
   - USER.md
   - IDENTITY.md
   - memory/YYYY-MM-DD.md (if it exists)
   - memory/openclaw-learning.md (if it exists; see docs/guidelines/openclaw-learning.md)

2. DO NOT auto-load:
   - MEMORY.md
   - Session history
   - Prior messages
   - Previous tool outputs

3. When user asks about prior context:
   - Use memory_search() on demand
   - Pull only the relevant snippet with memory_get()
   - Do not load the whole file

4. At end of session, update memory/YYYY-MM-DD.md with:
   - What you worked on
   - Decisions made
   - Leads generated
   - Blockers
   - Next steps
```

After this, sessions start with ~8KB instead of ~50KB. Combine with local search (QMD or BMAD context) so you stay within free-tier limits.

---

## 3. Free web search with Exa.ai

**Problem:** Web search behind paid APIs consumes budget; for 24/7 bots you want search without burning paid or scarce free credits.

**Solution:** Use **Exa.ai** for free web search. Setup (~30 seconds):

1. Go to [exa.ai](https://exa.ai) → Developer docs.
2. Find **Exa MCP** → Enable all → copy the MCP link.
3. In OpenClaw chat: "Wrap this MCP up into a skill" and paste the link.

OpenClaw can then search the web for free. Use this for recent events and research.

---

## 4. Model routing (right model for the task)

**Problem:** Using a single heavy model for everything (autocomplete, syntax, simple Q&A) wastes free quota. Most daily requests don't need the biggest model.

**Solution:** Route by task so lightweight requests use lightweight models and you preserve quota for hard tasks.

- **BMAD:** Use `bmad llm switch <provider>` and `bmad tokens report` to pick the free-tier provider that still has headroom. Rotate Gemini, Groq, Mistral, DeepSeek, etc. as limits approach.
- **Open Router / Claw Router (optional):** If you use them, set auto-route so simple tasks hit free or cheap models, and only hard problems use heavier models. Open Router has a free tier (e.g. 50 RPD).

**Configuration:** In BMAD projects, `_bmad/_config/llm-config.yaml` and `bmad llm status` define the active provider. Switch when `bmad tokens report` shows a provider near its limit.

---

## 5. Route heartbeats to a free local LLM

**Problem:** OpenClaw sends periodic heartbeat checks. By default these can use your configured API; for 24/7 agents that's thousands of calls per month and burns free-tier quota for no benefit.

**Solution:** Route heartbeat checks to a **free local LLM** (e.g. **Ollama** with Llama 3.2 3B).

- Install Ollama: [ollama.ai](https://ollama.ai) or e.g. `curl -fsSL https://ollama.com/install.sh | sh`.
- Run a small model: `ollama run llama3.2:3b` (or similar).
- Reconfigure OpenClaw to use Ollama (or another local endpoint) for heartbeats only.

**Example config direction (ask OpenClaw to update its config):**  
Set heartbeat/model checks to use the local Ollama endpoint instead of the main API. Then verify with a prompt like: "Confirm that heartbeat checks use the local LLM and do not consume API quota."

Result: heartbeats consume zero API tokens so your free quota is reserved for real work.

---

## 6. Kimi K 2.5 as an optional primary model

**Why:** Strong capability with a free trial; useful as another free-tier-style option when you want to reduce load on other free APIs.

**Setup (under 5 minutes):**

1. Go to [kimy.com](https://kimy.com) → log in → Start free trial (7 days free after ID verification).
2. Go to [kimy.com/code](https://kimy.com/code) → Console → create API key.
3. Ensure OpenClaw is updated (e.g. 2026.1.30 or later) so Kimi K 2.5 appears in agents.
4. Run `openclaw onboard` and when prompted, under **Moonshot / Kimi Coding**, paste the API key.
5. Run `openclaw tui` to use the assistant on Kimi K 2.5.

Use as default or as one of the models you rotate via BMAD/OpenClaw config.

---

## Summary table

| Area              | Do this                                      | Avoid this                          |
|-------------------|-----------------------------------------------|-------------------------------------|
| Knowledge/docs    | Local search (QMD, `bmad context search`)     | Pasting full docs into every prompt |
| Session start     | Load only SOUL.md, USER.md, IDENTITY.md, memory/YYYY-MM-DD.md | Auto-loading MEMORY.md + full history |
| Web search        | Exa.ai MCP as skill                           | Paid or scarce-credit search APIs   |
| Model choice      | Use BMAD `llm` + `tokens report`; rotate free-tier providers. Optionally Open Router / Claw Router auto-route. | Single heavy model for everything   |
| Heartbeats        | Local LLM (Ollama, etc.)                      | Using API for heartbeat checks     |
| Primary model     | Free-tier providers in BMAD registry; optionally Kimi K 2.5 (free trial). | Burning quota on every request      |

These guidelines are for use with the BMAD controller skill and the main OpenClaw+BMAD guidelines so OpenClaw stays BMAD-aligned and within free-tier limits.
