# ── Estágio build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npm run build

# ── Estágio runtime ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

# Apenas deps de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Artefatos compilados
COPY --from=builder /app/dist ./dist

# Arquivos de migração SQL (aplicados em runtime)
COPY --from=builder /app/drizzle ./drizzle

# Script de entrada: aplica migrações + seed (se banco vazio) + inicia servidor
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Volume para persistência do banco SQLite
VOLUME ["/data"]

ENV NODE_ENV=production
EXPOSE 3333

ENTRYPOINT ["./docker-entrypoint.sh"]
