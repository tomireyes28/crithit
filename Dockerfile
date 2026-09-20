# ==============================================================================
# CritHit Backend API — Multi-stage Production Dockerfile
# Monorepo: Turborepo + NestJS 10 + Prisma ORM + PostgreSQL
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Stage: Node.js 20 Alpine con utilidades de sistema
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl dumb-init
WORKDIR /app

# ------------------------------------------------------------------------------
# 2. Dependencies Stage: Instalación limpia de dependencias npm
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copiar manifiestos del monorepo
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Instalar dependencias completas del workspace
RUN npm ci --ignore-scripts || npm install

# ------------------------------------------------------------------------------
# 3. Builder Stage: Generación de Prisma Client y compilación
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma para Linux
WORKDIR /app/apps/api
RUN npx prisma generate

# Compilar paquete compartido y aplicación NestJS
WORKDIR /app
RUN npx turbo build --filter=@crithit/api...

# ------------------------------------------------------------------------------
# 4. Production Runner Stage: Imagen final ligera y segura
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# OpenSSL requerido por el query engine de Prisma
RUN apk add --no-cache openssl dumb-init

# Usuario no privilegiado para seguridad
RUN addgroup --system --gid 1001 crithitgroup && \
    adduser --system --uid 1001 crithituser

# Copiar dependencias y artefactos compilados
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

USER crithituser

EXPOSE 4000

# Health check nativo de Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

# Inicio del proceso mediante dumb-init para gestión adecuada de señales SIGTERM/SIGINT
CMD ["dumb-init", "node", "apps/api/dist/main.js"]
