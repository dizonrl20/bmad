# LLM API keys — per-provider guide

This guide explains how to get and set an API key for each LLM provider used by BMAD and OpenClaw. Keys are stored in a **`.env`** file (copy from [.env.example](../.env.example)); the CLI loads them automatically. **Never commit `.env`** to Git.

---

## Quick setup

1. Copy the example file: `cp .env.example .env`
2. For each provider you want to use, get a key (links below) and set it in `.env`, e.g. `GEMINI_API_KEY=your_key_here`
3. Run from the project or repo root so the CLI can load `.env`, or in Docker use `--env-file .env`

---

## Per-provider: env var and how to get the key

| Provider | Env variable | Where to get the key |
|----------|--------------|------------------------|
| **Google Gemini** | `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) — create an API key for Generative Language API. |
| **Groq** | `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) — create an API key. |
| **Mistral AI** | `MISTRAL_API_KEY` | [Mistral Console](https://console.mistral.ai/api-keys/) — create an API key. |
| **DeepSeek** | `DEEPSEEK_API_KEY` | [DeepSeek Platform](https://platform.deepseek.com/) — API keys in account. |
| **Cerebras** | `CEREBRAS_API_KEY` | [Cerebras Console](https://cloud.cerebras.ai/) — generate an API key. |
| **OpenRouter** | `OPENROUTER_API_KEY` | [OpenRouter Keys](https://openrouter.ai/keys) — create a key (use for multiple models). |
| **GitHub Models** | `GITHUB_TOKEN` | GitHub → Settings → Developer settings → [Personal access tokens](https://github.com/settings/tokens). Use a PAT with `read:packages` or the scope required by [GitHub Models](https://models.github.com/). |
| **NVIDIA NIM** | `NVIDIA_API_KEY` | [NVIDIA Build](https://build.nvidia.com/) — get API key for NIM. |
| **Cohere** | `COHERE_API_KEY` | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) — create an API key. |
| **Cloudflare Workers AI** | `CLOUDFLARE_API_KEY` | [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Overview. You also need **Account ID**: set `CLOUDFLARE_ACCOUNT_ID` in `.env`. |

---

## .env format

In your `.env` (same folder as `.env.example` or project root):

```env
# Only set the ones you use
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
DEEPSEEK_API_KEY=your_deepseek_key
# Cloudflare needs both:
CLOUDFLARE_API_KEY=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

Leave a variable empty or omit it if you don’t use that provider. The CLI and OpenClaw use whichever provider is active in `_bmad/_config/llm-config.yaml` (set via `bmad llm switch <provider>`).

---

## Docker

Pass the file into the container so the CLI can use the keys:

```bash
docker run --rm --env-file .env bmad-cli:latest llm list
```

In docker-compose, uncomment or add `env_file: .env` under the service.

---

## Security

- **Do not commit `.env`** — it is in `.gitignore`.
- Do not paste keys in chat or in config files that are committed.
- Rotate keys if they are exposed.
