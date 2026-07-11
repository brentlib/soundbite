# Multi-stage build: compile the React client and the Express server separately,
# then ship a slim runtime that serves both from one Node process.

# ---- Stage 1: build the React client (Vite -> static files) ----
FROM node:22-slim AS client-build
WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: build the Express server (tsc -> dist/) ----
FROM node:22-slim AS server-build
WORKDIR /server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ---- Stage 3: runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production deps only (tsx and typescript are dev-only; we run compiled JS).
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Compiled server + built client.
COPY --from=server-build /server/dist ./dist
COPY --from=client-build /client/dist ./public

# server.ts serves the client from this path (skips serving when unset).
ENV CLIENT_DIST_PATH=/app/public
ENV PORT=8082
EXPOSE 8082

CMD ["node", "dist/server.js"]
