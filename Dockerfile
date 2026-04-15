# Stage 1: Build
FROM node:22-alpine AS builder
# Note: vulnerabilities in this stage do not affect the runtime image —
# the builder is discarded after npm run build.

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve
# nginxinc/nginx-unprivileged runs as non-root (uid 101) — mitigates container escape CVEs.
# Pinned to 1.27 to prevent silent base image changes on rebuild.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback: all routes → index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
