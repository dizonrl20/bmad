# Clone and run (Docker or device)

One-time setup so the repo runs by itself after clone.

## 1. Clone

```bash
git clone https://github.com/dizonrl20/bmad.git
cd bmad
git checkout develop
```

## 2. API keys (optional, for LLM/tokens/context)

```bash
cp .env.example .env
# Edit .env and add your API keys for the providers you use (Gemini, Groq, etc.)
```

The CLI loads `.env` from the current directory. For Docker, pass the file: `--env-file .env`.

## 3a. Run on this machine (Mac / PC / Linux)

```bash
npm install
node tools/cli/bmad-cli.js --help
# Install BMAD into another project:
node tools/cli/bmad-cli.js install --directory /path/to/your/project --modules bmm --tools cursor --yes
```

Or use the runner script (after `npm install`):

```bash
./run.sh --help
./run.sh install --directory /path/to/your/project --modules bmm --tools cursor --yes
```

## 3b. Run in Docker (Mac / PC with Docker Desktop)

```bash
docker build -t bmad-cli:latest .
# With API keys from .env:
docker run --rm --env-file .env bmad-cli:latest --help
docker run --rm --env-file .env -v /path/to/your/project:/workspace bmad-cli:latest install --directory /workspace --modules bmm --tools cursor --yes
```

With Docker Compose (from repo root):

```bash
docker-compose build
# Pass .env and mount your project (override default volume):
docker-compose run --rm --env-file .env -v /path/to/your/project:/workspace bmad install --directory /workspace --modules bmm --tools cursor --yes
```

## 4. Verify

- Local: `node tools/cli/bmad-cli.js llm list`
- Docker: `docker run --rm --env-file .env bmad-cli:latest llm list`

You only need API keys in `.env` if you use `bmad llm switch`, `bmad tokens`, or `bmad context` with embeddings.
