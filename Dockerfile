# BMAD — runs on Node 20+ (Mac/PC via Docker)
# Use this image to run BMAD CLI in a consistent environment.
FROM node:20-alpine

WORKDIR /app

# Build tools so optionalDependencies (better-sqlite3, sqlite-vec) compile
RUN apk add --no-cache python3 make g++

# Copy package files (use npm install if no lockfile)
COPY package.json ./

# Install production deps; optional native deps build in this stage
RUN npm install --omit=dev

# Copy full repo so CLI and configs are available
COPY . .

# Default: run BMAD CLI help
ENTRYPOINT ["node", "tools/cli/bmad-cli.js"]
CMD ["--help"]
