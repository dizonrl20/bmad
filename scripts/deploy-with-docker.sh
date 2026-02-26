#!/usr/bin/env bash
# Easy deploy: build Docker image, run BMAD install + Clawthorn init, then print next steps.
# Usage: ./scripts/deploy-with-docker.sh [--directory /path/to/project]
# Run from the bmad repo root. If --directory is omitted, uses current directory as project.
set -e
BMAD_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BMAD_ROOT"

PROJECT_DIR="$BMAD_ROOT"
while [[ $# -gt 0 ]]; do
  case $1 in
    --directory)
      PROJECT_DIR="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

echo "=== BMAD + OpenClaw (Clawthorn) easy deploy ==="
echo "  BMAD repo: $BMAD_ROOT"
echo "  Project:   $PROJECT_DIR"
echo ""

echo "1. Building Docker image (bmad-cli:latest)..."
docker build -t bmad-cli:latest . || { echo "Docker build failed. Is Docker running?"; exit 1; }

echo ""
echo "2. Installing BMAD into project (openclaw tools)..."
docker run --rm -v "$PROJECT_DIR:/workspace" bmad-cli:latest install --directory /workspace --modules bmm --tools openclaw --yes || { echo "Install failed."; exit 1; }

echo ""
echo "3. Creating Clawthorn memory and spreadsheet..."
docker run --rm -v "$PROJECT_DIR:/workspace" --entrypoint node bmad-cli:latest scripts/init-clawthorn-memory.js --directory /workspace || { echo "Init failed."; exit 1; }

echo ""
echo "=== Next steps (do these on your machine) ==="
echo ""
echo "4. Paste your resume text into:"
echo "   $PROJECT_DIR/_bmad/_memory/resume-text.txt"
echo ""
echo "5. Copy OpenClaw skills (run from bmad repo):"
echo "   cp -r $BMAD_ROOT/docs/guidelines/openclaw/bmad-controller ~/.openclaw/workspace/skills/"
echo "   cp -r $BMAD_ROOT/docs/guidelines/openclaw/clawdette-orchestrator ~/.openclaw/workspace/skills/"
echo "   cp -r $BMAD_ROOT/docs/guidelines/openclaw/clawthorn-job-hunt ~/.openclaw/workspace/skills/"
echo ""
echo "6. Restart OpenClaw, then open this project folder:"
echo "   $PROJECT_DIR"
echo ""
echo "7. Ask for job-application help (e.g. apply for tester/automation jobs, track in spreadsheet)."
echo "   Application date/time: record in spreadsheet column 'Date attempted' when you successfully apply."
echo ""
echo "Optional: create .env from .env.example for LLM API keys. See docs/guidelines/llm-api-keys-guide.md"
echo "Full Docker guide: docs/guidelines/openclaw/DOCKER-RUN-BMAD-AND-OPENCLAW.md"
