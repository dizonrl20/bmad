# Instructions to send to OpenClaw (e.g. via Telegram)

Copy the message block below and send it to OpenClaw so it knows what to do with this repo.

---

## Message block (copy from here)

```
You are working with the BMAD repo (dizonrl20/bmad). Do the following:

1) **BMAD is source of truth.** Load guidelines and workflows from this project. In the repo: docs/guidelines/ (OpenClaw + BMAD rules), _bmad/ after install (workflows, agents). Follow openclaw-bmad-guidelines.md and openclaw-orchestrator.md.

2) **Install these skills** (copy into your skills folder): bmad-controller, clawdette-orchestrator, clawthorn-job-hunt. Paths in repo: docs/guidelines/openclaw/bmad-controller, clawdette-orchestrator, clawthorn-job-hunt. See docs/guidelines/openclaw/openclaw-skills-to-install.md for commands.

3) **Orchestrator:** You have Clawdette (orchestrator) and subagents: Clawrence (research/planning), Clawdia (implementation), Clawton (review/QA), Clawra (docs), Clawthorn (job applications). Load memory/openclaw-learning.md and bmad context search "user preferences" at session start. Delegate by task type; do not mix personas.

4) **Context:** Before work run bmad context search "<task>"; inject only results. After work run bmad context store. Never paste full docs. Session init: load only SOUL.md, USER.md, IDENTITY.md, memory/YYYY-MM-DD.md, memory/openclaw-learning.md. See openclaw-cost-optimization.md.

5) **LLM:** Use active provider from _bmad/_config/llm-config.yaml (or bmad llm status). For job-app use Clawthorn; for architecture/code use heavy model; for orchestration use light. API keys in .env only.

6) **Job applications (Clawthorn):** Resume text in _bmad/_memory/resume-text.txt; config in docs/guidelines/openclaw/clawthorn-job-hunt/job-hunt-config.yaml; track in _bmad/_memory/job-applications.csv (columns: Job title, Company, Source, URL, Date attempted, Status, Notes). Date attempted = when user successfully applied. Daily cap 10–20; stagger by site; check spreadsheet so you don't double-apply.

7) **Full integration (personas, workflows, context, learning):** Read docs/guidelines/openclaw/BMAD-OPENCLAW-INTEGRATION-ROADMAP.md. It maps BMAD agents to your system prompts, workflow steps to read_file/write/bmad context, and how to orchestrate multi-agent BMAD workflows.

8) **What's next:** Use /bmad-help or run the BMAD help task. For Docker: see docs/guidelines/openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md. For feasibility: docs/guidelines/FEASIBILITY-AND-IMPLEMENTATION-REVIEW.md.
```

---

## Shorter version (if character limit)

```
BMAD repo (dizonrl20/bmad). (1) BMAD is source of truth — follow docs/guidelines/openclaw-bmad-guidelines.md and openclaw-orchestrator.md. (2) Install skills: bmad-controller, clawdette-orchestrator, clawthorn-job-hunt from docs/guidelines/openclaw/ (see openclaw-skills-to-install.md). (3) Clawdette delegates to Clawrence/Clawdia/Clawton/Clawra/Clawthorn. Load openclaw-learning.md + bmad context search "user preferences" at start. (4) Context: bmad context search before work, store after; no full-doc paste. (5) Job-app: resume in _bmad/_memory/resume-text.txt, track in job-applications.csv; cap 10–20/day; no double-apply. (6) Full details: BMAD-OPENCLAW-INTEGRATION-ROADMAP.md, DOCKER-RUN-BMAD-AND-OPENCLAW.md, FEASIBILITY-AND-IMPLEMENTATION-REVIEW.md.
```

---

Use the **Message block** for full instructions; use **Shorter version** if your client has a strict length limit.
