# ============================================================
# Frontend Dockerfile — Node.js 20 (Alpine) + Vite dev server
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

EXPOSE 5173

# Start Vite dev server, bound to 0.0.0.0 so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
