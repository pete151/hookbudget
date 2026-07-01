# syntax=docker/dockerfile:1

# ──────────────────────────────────────────────────────────────────────────
# HookBudget — image de production (Next.js standalone + Prisma).
# Multi-étages : dépendances → build → runner minimal.
# ──────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1) Dépendances (cache)
FROM base AS deps
COPY package.json package-lock.json ./
# Le schéma est nécessaire au `postinstall` (prisma generate).
COPY prisma ./prisma
RUN npm ci

# 2) Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Active la sortie standalone (utilisée par l'étage runner ci-dessous).
ENV BUILD_STANDALONE=true
RUN npx prisma generate
RUN npm run build

# 3) Runner (image finale)
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Sortie standalone (voir next.config.ts → output: "standalone")
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Schéma Prisma + migrations pour `prisma migrate deploy` au démarrage.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
