# ---- Stage 1: builder ----
# Installs full dependency tree (incl. devDependencies) — needed to run
# tests/build tooling — but none of this ships in the final image.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only manifest files first so `npm ci` is cached and skipped on
# rebuilds unless package.json/package-lock.json actually change.
COPY package.json package-lock.json ./
RUN npm ci

# Now bring in the actual source.
COPY . .

# ---- Stage 2: production ----
# Clean slate — only what's needed to run the app ends up here.
FROM node:20-alpine AS production

# Run as a non-root user rather than the container default (root).
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install ONLY production dependencies — no jest, no babel, no nodemon.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bring in only the source directories the app actually needs at runtime.
COPY --from=builder /app/src ./src
COPY --from=builder /app/models ./models

# Own the app directory as the non-root user, then switch to it.
RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
EXPOSE 5000

# Periodically hit our own health endpoint (see #4) to confirm the app is
# actually serving traffic and connected to the DB — not just that the
# process happens to still be running.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Run node directly — NOT "npm start" — so SIGTERM reaches our graceful
# shutdown handler (server.js) directly as PID 1, instead of being eaten
# by an intermediate npm process.
CMD ["node", "src/server.js"]