# BMAD–OpenClaw integration roadmap: unblocking and implementation

This document answers the blocking items OpenClaw identified when integrating BMAD: persona mapping, workflow translation, context management, LLM specialization (including paid APIs), file ingestion, learning, multi-agent orchestration, and configuration. It is written so Cursor AI (or OpenClaw) can translate BMAD principles into **concrete OpenClaw actions and configurations**.

---

## Phase 1: Understanding and configuring BMAD core concepts

### 1. BMAD agent persona mapping

**What blocks OpenClaw:** Lack of direct mapping/configuration for BMAD personas (PM, Architect, Developer, QA, Scrum Master, UX) within OpenClaw’s agent model.

**What this repo provides:** BMAD agent definitions live under `_bmad/bmm/agents/` (or equivalent after install): `pm.agent.yaml`, `architect.agent.yaml`, `dev.agent.yaml`, `qa.agent.yaml`, `sm.agent.yaml`, `ux-designer.agent.yaml`, `tech-writer.agent.yaml`, `analyst.agent.yaml`, `quick-flow-solo-dev.agent.yaml`. Each file has `persona` (role, identity, communication_style, principles) and `menu` (triggers and workflows).

**How OpenClaw can emulate BMAD personas:**

| BMAD persona | OpenClaw emulation | Concrete action |
|--------------|--------------------|------------------|
| **PM (Product Manager)** | Single session or spawned session with a **system prompt** built from the agent file. | **LOAD** `_bmad/bmm/agents/pm.agent.yaml` (or the installed path). **EXTRACT** `persona.role`, `persona.identity`, `persona.communication_style`, `persona.principles`. **SET** as system prompt (or session system prompt): “You are [name], [title]. [role]. [identity]. [communication_style]. [principles]. When the user invokes a menu item, LOAD and execute the workflow file from the menu exec path.” Stay in character until the user switches. |
| **Architect** | Same pattern: load `architect.agent.yaml`, extract persona, set as system prompt; menu triggers point to workflow files (e.g. create-architecture, implementation-readiness). | Load agent file → build system prompt → on trigger (e.g. “CA”, “create-architecture”) run the corresponding workflow file from `_bmad/`. |
| **Developer** | Same: load `dev.agent.yaml`, persona + principles; menu points to dev-story, code-review, quick-dev, etc. | Execute workflow steps (read step files, gather context, produce outputs). |
| **QA** | Load `qa.agent.yaml`; persona + menu (e.g. generate-e2e-tests, test strategy). | Embody QA persona; when user asks for tests or QA workflow, load and run the workflow from the menu. |
| **Scrum Master (SM)** | Load `sm.agent.yaml`; persona + menu (sprint planning, retrospective, status). | Embody SM; run sprint-planning, retrospective, or status workflows when triggered. |
| **UX Designer** | Load `ux-designer.agent.yaml`; persona + menu. | Same pattern: load → prompt → execute menu workflows. |
| **Tech Writer** | Load `tech-writer.agent.yaml` (+ sidecar `documentation-standards.md`); persona + menu. | Load agent and sidecar; apply doc standards when producing docs. |
| **Analyst** | Load `analyst.agent.yaml`; discovery, requirements. | Embody analyst; run analysis workflows when triggered. |

**If OpenClaw can spawn sub-agents/sessions:** For each BMAD persona, **spawn a dedicated session** with the system prompt set from that agent’s YAML. Pass in the project root and `_bmad` path so the sub-agent can load workflows. The **orchestrator (Clawdette)** can route “this is a PM task” → spawn or switch to PM session with PM system prompt; “this is architecture” → Architect session; etc.

**Example system prompt (PM, derived from agent file):**  
“You are John, Product Manager. Role: Product Manager specializing in collaborative PRD creation through user interviews, requirement discovery, and stakeholder alignment. Identity: Product management veteran with 8+ years… Communication: Asks WHY relentlessly… Principles: [principles]. When the user requests a menu item (e.g. Create PRD, Validate PRD), LOAD the workflow file from _bmad/bmm/workflows/… and execute each step. Do not mix personas.”

**Deliverable for Cursor/OpenClaw:** A small script or skill that **reads** `_bmad/bmm/agents/*.agent.yaml` and **outputs** a ready-to-use system prompt per agent (and optionally the list of menu triggers → workflow paths) so OpenClaw can configure sessions or sub-agents.

---

### 2. BMAD workflow translation into OpenClaw action sequences

**What blocks OpenClaw:** Abstract BMAD workflows; need concrete, executable steps (OpenClaw actions, tool calls, agent interactions) per lifecycle stage.

**BMAD lifecycle (high level):** Document project → Plan (PRD, validate) → Solution (architecture, epics/stories, implementation readiness) → Implementation (dev-story, code-review, sprint, retrospective). Plus quick flows (quick-spec, quick-dev) for small scope.

**Concrete OpenClaw action sequence per stage:**

| Stage | BMAD workflow(s) | OpenClaw actions / tool usage |
|-------|-------------------|-------------------------------|
| **Document project** | document-project, generate-project-context | 1. **read_file** workflow.md + steps. 2. **list_dir** project root (or paths from workflow). 3. **read_file** key files (or run a scan); **write** project-overview, source-tree, or project-context.md to `_bmad-output/` or path specified by workflow. 4. Use **bmad context store** for key findings (namespace `project`). |
| **Analysis / discovery** | analyst workflows, create-prd | 1. Load analyst or PM agent (persona prompt). 2. **read_file** workflow steps. 3. **web_search** or Exa (requirements, market); **read_file** existing PRD/docs. 4. **write** PRD or analysis artifact. 5. **bmad context store** decisions (namespace `workflow` or `project`). |
| **Planning** | create-prd, validate-prd, epics-stories | 1. Load PM agent. 2. Load workflow step files in order. 3. **read_file** PRD, **write** epics/stories or validation report. 4. **bmad context search** “PRD epics” to reuse. |
| **Architecture** | create-architecture, implementation-readiness | 1. Load Architect agent. 2. **read_file** workflow + steps. 3. **read_file** PRD, existing code (target dirs). 4. **write** architecture doc; **bmad context store** architecture decisions. 5. Implementation-readiness: **read_file** PRD, UX, architecture, epics; **write** readiness checklist. |
| **Implementation** | dev-story, code-review, quick-dev | 1. Load Developer agent. 2. **read_file** dev-story workflow + step files. 3. **bmad context search** “current story architecture” to get scope. 4. **read_file** relevant source files. 5. **write** or **search_replace** code; run tests (exec). 6. Code-review workflow: **read_file** code-review steps; **read_file** changed files; **write** review comments. |
| **Testing** | qa-generate-e2e-tests, test strategy | 1. Load QA agent. 2. **read_file** QA workflow steps. 3. **read_file** code under test. 4. **write** test files or strategy doc. |
| **Small change (bug fix / small feature)** | quick-dev, quick-spec | 1. Load quick-flow-solo-dev or Developer. 2. **read_file** quick-dev workflow (step-01-mode-detection → context-gathering → execute → self-check → adversarial-review → resolve). 3. **bmad context search** “recent changes” or scope. 4. **read_file** / **search_replace** minimal files; **exec** tests. |

**Adaptability (bug fix vs large feature):**  
- **Small:** Use **quick-dev** or **quick-spec**; fewer steps; **bmad context search** with narrow query; limit **read_file** to a few paths.  
- **Large:** Use full **document-project → plan → architecture → implementation**; run each workflow’s steps in order; store outputs in `_bmad-output/` and **bmad context store** at each phase so the next phase can **bmad context search** and **read_file** prior artifacts.

**Deliverable:** A **workflow-runner** checklist (or skill) that, for a given workflow name, lists: (1) which agent to load, (2) ordered list of step files to read, (3) which tools to use (read_file, write, bmad context search/store, exec, web_search), (4) where to write outputs. OpenClaw then executes that sequence.

---

### 3. Context management strategy (BMAD-aligned, no prompt bloat)

**What blocks OpenClaw:** Need for robust, scalable context retrieval (not stuffing full history or all files into prompts).

**What this repo provides:**

- **BMAD context engine:** `bmad context search "<query>"` returns relevant snippets from `_bmad/_memory/context.sqlite` (vector + optional TF-IDF). Namespaces: `project`, `agent`, `workflow`, `user`, `learning`, `discovery`. **Before starting work:** run `bmad context search "<current task>"` and inject only the returned snippets into the prompt. **After work:** `bmad context store <key> "<content>" --namespace <ns>`.
- **OpenClaw memory:** `memory_search()` / `memory_get()` for OpenClaw’s own memory. Session init: load only SOUL.md, USER.md, IDENTITY.md, memory/YYYY-MM-DD.md, memory/openclaw-learning.md; do **not** auto-load MEMORY.md or full history. Use memory_search on demand and memory_get for the snippet.

**Smart context retrieval strategy:**

1. **On session start:** Load only the minimal set (SOUL, USER, IDENTITY, memory/YYYY-MM-DD, memory/openclaw-learning). Optionally run **bmad context search "user preferences"** and **bmad context search "project overview"** and add those snippets to the initial context (not full docs).
2. **Before a workflow or task:** Run **bmad context search "<task description>"** (e.g. “architecture decisions”, “PRD scope”, “current sprint story”). Inject only the top N results into the prompt.
3. **When user asks about project/code:** Prefer **bmad context search** + targeted **read_file** for the specific path. Do not **read_file** entire tree.
4. **Indexing project files:** BMAD does not ship a “readAllFiles” index in this repo. To align with BMAD: (a) use **document-project** or **generate-project-context** workflow to produce a project-context.md or scan report; (b) store key findings in **bmad context store** with namespace `project`; (c) thereafter use **bmad context search** for semantic retrieval. If OpenClaw has a readAllFiles or QMD-style index, **ingest** only summaries or key entities into BMAD context (or a separate index) so that **bmad context search** and that index stay the single source of “what to pull” instead of raw full-file paste.

**Deliverable:** Document (or skill rule) that states: “Before any BMAD workflow or user question about the project: call bmad context search with a short query; inject only the returned snippets; use read_file only for paths identified as relevant.”

---

### 4. LLM specialization (including paid API access)

**What blocks OpenClaw:** No defined tiered model assignment when paid APIs (e.g. Gemini Pro, Claude 3 Opus, GPT-4 Turbo) are available; API keys and cost control.

**Tiered model assignment (BMAD-aligned):**

| Task type / agent | Suggested model tier | Rationale |
|-------------------|----------------------|-----------|
| **Orchestrator (Clawdette)** | Fast / cheap (e.g. Gemini Flash, Groq) | Routing and delegation; minimal reasoning. |
| **Research, planning (Clawrence, PM, Analyst)** | Balanced (e.g. Claude Sonnet, Gemini Pro) | Discovery, PRD, requirements. |
| **Architecture (Architect)** | High (e.g. Claude Opus, GPT-4, Gemini Pro) | Complex design, trade-offs. |
| **Implementation (Clawdia, Developer)** | High or balanced | Code generation, refactors. |
| **Review / QA (Clawton, QA)** | Balanced or high | Code review, test design. |
| **Documentation (Clawra, Tech Writer)** | Balanced | Clear writing. |
| **Simple tasks (quick-dev, small edits)** | Fast / cheap | Preserve quota. |

**How to implement in OpenClaw:**

- **Model override per session:** If OpenClaw supports a “model” or “provider” override when starting a session or spawning a sub-agent, set it from a small config (e.g. `_bmad/_config/llm-tier.yaml` or env): e.g. `orchestrator_model: gemini-2.5-flash`, `architecture_model: claude-3-5-sonnet`, `implementation_model: gpt-4-turbo`. OpenClaw reads that and sets the model for that session.
- **Using BMAD’s llm-config today:** BMAD has `_bmad/_config/llm-config.yaml` (active_provider, active_model). OpenClaw can **read** that file and use that model for the current session. To support tiers, extend the repo with an optional `llm-tier.yaml` that maps task-type or agent to provider/model; OpenClaw (or Clawdette) reads it and switches before delegating (e.g. run `bmad llm switch <provider> <model>` before handing off to Architect).
- **API keys:** Keep keys in `.env` (or OpenClaw’s secure storage); never in committed config. Load via dotenv or OpenClaw env. **Billing alerts:** Use provider dashboards or webhooks; this repo does not implement billing.

**Deliverable:** (1) Optional `_bmad/_config/llm-tier.yaml` (or doc) that maps agent/task-type → provider/model. (2) Rule for OpenClaw/Clawdette: “Before delegating to agent X, read llm-tier; if defined, run bmad llm switch to that provider/model (or set session model override).”

---

## Phase 2: File ingestion and triggers

### 5. BMAD-compliant file ingestion (readAllFiles alignment)

**What blocks OpenClaw:** Moving beyond raw file read to summarization, index, and BMAD-relevant filtering.

**BMAD-compliant ingestion:**

- **Content:** Prefer **summaries or key entities** for ingestion, not full file content. Options: (a) run BMAD’s **document-project** or **generate-project-context** workflow and ingest the **output** (project-context.md, overview) into **bmad context store** (namespace `project`) or into OpenClaw’s index; (b) if OpenClaw has readAllFiles, post-process: extract file path, language, and a short summary (e.g. “exports function X, imports Y”) and store that in BMAD context or a searchable index.
- **Index:** BMAD’s context engine is the semantic index for “project knowledge.” Populate it via **bmad context store** with keys like `project.structure`, `project.module.X`, or run generate-project-context and store the generated summary. Then **bmad context search** is the single retrieval path.
- **Exclusion / inclusion:** Exclude `node_modules`, `.git`, `_bmad` (or include only `_bmad` for workflow/agent definitions). For BMAD-specific filtering: **include** `_bmad/**/*.yaml`, `_bmad/**/*.md` when the task is “workflow or agent”; **include** source dirs (e.g. `src/`, `lib/`) when the task is “implementation or architecture.”

**Deliverable:** Rule set: “When building project context for BMAD, (1) run document-project or generate-project-context and store output in context; (2) or run readAllFiles with exclusions (node_modules, .git), then summarize per file and bmad context store key excerpts; (3) never paste full codebase into prompt; use bmad context search for retrieval.”

---

### 6. When to trigger file reading / indexing

**What blocks OpenClaw:** When and how to trigger readAllFiles or project scan in a BMAD workflow.

**Triggers:**

- **Proactively:** At the **start of the “architecture” stage** — run generate-project-context or document-project (or readAllFiles + summarize) so that architecture decisions have a current view of the codebase. At the **start of “implementation”** for a story — run **bmad context search** for that story/scope and **read_file** only the files referenced in the search or in the story.
- **On-demand:** When the user asks “what’s in this project?” or “how does X work?” — run **bmad context search** first; if insufficient, run a **targeted** read_file (or limited readAllFiles on a subdirectory) and optionally **bmad context store** the new finding.
- **Background:** Optional. A scheduled or nightly job could run generate-project-context and update context.sqlite; OpenClaw then always searches fresh context. Not required for minimal setup.

**Scope adaptively:** For **small task** (bug fix): **bmad context search** “recent changes” or “file X”; **read_file** only the 1–3 relevant files. For **large task** (new feature): run document-project or generate-project-context for the repo (or relevant subtree), then proceed with workflow steps.

**Deliverable:** Add to workflow-runner checklist: “At architecture stage: run generate-project-context (or equivalent) and store in context. At implementation: bmad context search for story scope; read_file only returned or story-listed paths.”

---

## Phase 3: Learning and user adaptation

### 7. User preference learning (BMAD + OpenClaw)

**What blocks OpenClaw:** Bridging OpenClaw learning with BMAD’s learning modules.

**Mapping:**

| Learning need | Where to store | Where to read |
|---------------|----------------|----------------|
| **OpenClaw-specific** (UI, tooling, conversation style) | `memory/openclaw-learning.md` | Session init: load openclaw-learning.md. |
| **BMAD-shared** (workflow preferences, agent preferences, project conventions) | `bmad context store <key> "<content>" --namespace user` or `--namespace learning` | **bmad context search** “user preferences” or “learning”; at workflow start and before delegating. |
| **Per-agent preferences** | `_bmad/_memory/<agent>-sidecar/` (e.g. tech-writer-sidecar) or **bmad context store** with key `learning.<agent>.<topic>` | Load sidecar file when embodying that agent; or **bmad context search** “learning <agent>”. |

**Capture:** When the user corrects a workflow step or says “I prefer X for architecture,” the active agent should: (1) append a line to **memory/openclaw-learning.md** (for OpenClaw-wide), and (2) **bmad context store** a short summary with namespace **user** or **learning** (e.g. `bmad context store user.architecture "Prefer minimal diagrams" --namespace learning`). So BMAD agents and OpenClaw both see it next time via **bmad context search** and openclaw-learning.md.

**Deliverable:** Rule in bmad-controller and Clawdette skill: “On user correction or preference: (1) append to memory/openclaw-learning.md; (2) bmad context store with namespace user or learning. On session start and before workflow: bmad context search ‘user preferences’ and apply; load openclaw-learning.md.”

---

## Phase 4: Orchestration and configuration

### 8. Multi-agent orchestration (Party Mode / Clawdette)

**What blocks OpenClaw:** Robust multi-agent coordination (orchestrator delegating to specialized agents, dependency management, synthesis).

**Pattern:**

- **Orchestrator (Clawdette):** One “controller” session or agent that: (1) loads **memory/openclaw-learning.md** and **bmad context search "user preferences"**; (2) decides which sub-agent or persona is needed (PM, Architect, Developer, QA, Clawrence, Clawdia, Clawton, Clawra, Clawthorn); (3) either **spawns** a sub-session with that agent’s system prompt and passes the task, or **switches** the current session to that persona and runs the workflow; (4) receives the sub-agent’s output and can synthesize or pass back to the user; (5) on user feedback, updates learning (openclaw-learning.md + bmad context store).
- **Delegation:** “This is a PRD task” → spawn/switch to PM (load pm.agent.yaml persona) and run create-prd workflow. “This is architecture” → spawn/switch to Architect and run create-architecture. “This is implementation” → spawn/switch to Developer and run dev-story. “This is job applications” → delegate to Clawthorn (load clawthorn-job-hunt skill).
- **Dependencies:** Workflow order is fixed by BMAD (document → plan → architecture → implementation). Orchestrator checks that prior artifacts exist (e.g. PRD before architecture); if not, suggests running the prior workflow first. No parallel dependency engine in this repo; orchestration is sequential per BMAD phases.
- **Synthesis:** After a sub-agent returns (e.g. “Architecture doc written”), orchestrator can **read_file** the output and **bmad context store** a short summary so the next phase can **bmad context search** it. Optionally present a short summary to the user.

**Example flow — “Refactor module X according to BMAD principles”:**  
(1) Clawdette receives request. (2) **bmad context search** “module X architecture”; **read_file** workflow quick-dev or code-review. (3) Delegate to Developer: set Developer persona, run quick-dev (context-gathering → execute → self-check → adversarial-review). (4) Developer (or Clawdia) **read_file** module X, **search_replace** refactors, **exec** tests. (5) Output returned to Clawdette; Clawdette **bmad context store** “Refactored module X” and reports to user.

**Deliverable:** Orchestration rule set: “Clawdette loads learning and context search; routes by task type to BMAD persona or Claw* subagent; spawns or switches with persona prompt; runs workflow steps; stores summary in context; updates learning on feedback.”

---

### 9. Configuration management (loading BMAD config in OpenClaw)

**What blocks OpenClaw:** How BMAD configs (llm-config.yaml, job-hunt-config.yaml, workflow choices) are loaded and applied; secure API keys.

**Mechanism:**

- **Where configs live:** After install, BMAD writes `_bmad/_config/llm-config.yaml` (active_provider, active_model). Clawthorn uses `docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml` (or a copy in the project). Workflow lists live under `_bmad/` (e.g. workflow-manifest.csv).
- **How OpenClaw loads them:** (1) **read_file** `_bmad/_config/llm-config.yaml` at session start (or when about to call an LLM) to get active provider/model. (2) If using tiered models, **read_file** an optional `_bmad/_config/llm-tier.yaml` (if we add it) to get per-agent model. (3) For job applications, **read_file** `job-hunt-config.yaml` from the clawthorn-job-hunt folder (or from project path). (4) Workflow list: **read_file** `_bmad/_config/workflow-manifest.csv` or list_dir `_bmad/bmm/workflows/`.
- **User-editable:** Yes. These YAML/CSV files are in the project (or in the repo under docs/guidelines). User can edit them; OpenClaw re-reads on next load or at start of each workflow.
- **API keys:** Never in config files. Stored in `.env` (gitignored) or OpenClaw’s secure storage. OpenClaw (or the process running BMAD CLI) loads .env via dotenv or env_file; `bmad llm` and context engine use `process.env.GEMINI_API_KEY` etc. So: **provide** keys via .env or OpenClaw env; **do not** put them in llm-config or job-hunt-config.

**Deliverable:** Rule: “On session start and before LLM/task: read_file _bmad/_config/llm-config.yaml for active model; read_file job-hunt-config.yaml when handling job-app tasks. API keys only from environment, never from committed files.”

---

## Summary: unblocking checklist

| # | Blocking item | Concrete action for OpenClaw/Cursor |
|---|----------------|-------------------------------------|
| 1 | Persona mapping | Load `_bmad/bmm/agents/*.agent.yaml`; build system prompt from persona; set per session or sub-agent. Optionally spawn session per persona. |
| 2 | Workflow translation | For each workflow: (1) which agent, (2) ordered step files, (3) tools (read_file, write, bmad context search/store, exec). Small scope → quick-dev/quick-spec; large → full phase sequence. |
| 3 | Context management | Use **bmad context search** before work; inject only snippets. Use **bmad context store** after. Session init: minimal load; memory_search on demand. No full-doc paste. |
| 4 | LLM specialization | Optional llm-tier.yaml (agent → model). Clawdette reads it and runs bmad llm switch (or sets session model) before delegating. API keys in .env only. |
| 5 | File ingestion | Prefer document-project/generate-project-context output → bmad context store. Or readAllFiles → summarize → store. Exclude node_modules, .git. |
| 6 | File read triggers | Architecture stage: run generate-project-context; store. Implementation: bmad context search + read_file only relevant paths. On-demand for user questions. |
| 7 | Learning | Store: openclaw-learning.md + bmad context store (namespace user/learning). Read: session init + bmad context search “user preferences” before workflow. |
| 8 | Orchestration | Clawdette: load learning + context; route to persona/subagent; spawn or switch with persona prompt; run workflow; store summary; update learning on feedback. |
| 9 | Config management | read_file llm-config.yaml, job-hunt-config.yaml, workflow manifest when needed. API keys from env only. |

This roadmap is the bridge between BMAD’s abstract principles and OpenClaw’s executable actions. Implement the “Deliverable” items in skills, scripts, or docs so OpenClaw can run BMAD-driven workflows with clear, step-by-step behavior.
