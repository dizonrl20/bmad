# BMAD — runs on Node 20+ (Mac/PC via Docker)
# Use this image to run BMAD CLI in a consistent environment.
FROM node:20-alpine

WORKDIR /app

# Copy package files (use npm install if no lockfile)
COPY package.json ./
COPY tools/bmad-npx-wrapper.js ./tools/

# Install production deps only for smaller image; optional deps (better-sqlite3, sqlite-vec) may need build tools
RUN npm install --omit=dev --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# Copy full repo so CLI and configs are available
COPY . .

# Default: run BMAD CLI help
ENTRYPOINT ["node", "tools/cli/bmad-cli.js"]
CMD ["--help"]
