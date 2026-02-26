#!/usr/bin/env bash
# Clone-and-run helper: from repo root, run BMAD CLI (run npm install first if needed).
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "Running npm install..."
  npm install
fi
exec node tools/cli/bmad-cli.js "$@"
