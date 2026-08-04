# ============================================================
# Frontend Dockerfile — Production (Nginx + Vite Build)
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
ARG VITE_API_URL=/v2/api
ARG VITE_FILES_URL=/v2/files
ARG VITE_SOCKET_PATH=/v2/socket.io
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
