# ==============================================================================
# CritHit Backend API — Multi-stage Production Dockerfile (apps/api)
# Monorepo: Turborepo + NestJS 10 + Prisma ORM + PostgreSQL
# ==============================================================================

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl dumb-init
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN npm ci --ignore-scripts || npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/api
RUN npx prisma generate

WORKDIR /app
RUN npx turbo build --filter=@crithit/api...

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN apk add --no-cache openssl dumb-init

RUN addgroup --system --gid 1001 crithitgroup && \
    adduser --system --uid 1001 crithituser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

USER crithituser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

CMD ["dumb-init", "node", "apps/api/dist/main.js"]
