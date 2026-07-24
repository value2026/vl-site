# ============================================================
# Frontend Dockerfile — Development Mode (Vite Dev Server)
# ============================================================

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite dev server default port
EXPOSE 5173

# Run Vite dev server bound to 0.0.0.0 for container access
CMD ["npm", "run", "dev", "--", "--host"]
