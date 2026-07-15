# ============================================================
# Backend Dockerfile — Production (Node.js 20 Alpine)
# ============================================================

FROM node:20-alpine AS base

# Install system deps needed by Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# ── Install dependencies ──────────────────────────────────────
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# ── Copy source ───────────────────────────────────────────────
COPY src ./src/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

# Run DB migrations + seed + start
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/server.js"]
