# Deploying Under /v2

Public URL:

```text
https://vlab.amrita.edu/v2/
```

The institutional Nginx must strip `/v2` before proxying to the VM. Docker Nginx should continue to serve the application at `/`, `/api/`, `/files/`, and `/socket.io/`.

## Environment

Use these production values when building and running the stack:

```env
FRONTEND_URL=https://vlab.amrita.edu/v2
CORS_ORIGINS=
VITE_API_URL=/v2/api
VITE_FILES_URL=/v2/files
VITE_SOCKET_PATH=/v2/socket.io
```

Rebuild the frontend after changing any `VITE_*` value:

```bash
docker compose up -d --build
```

## Institutional Proxy

Use [nginx-institutional-v2.conf](./nginx-institutional-v2.conf) as the `/v2` location template. The important behavior is:

```text
/v2/api/users -> http://10.0.0.69/api/users
/v2/socket.io/ -> http://10.0.0.69/socket.io/
/v2/assets/... -> http://10.0.0.69/assets/...
```

If `curl -Ik https://vlab.amrita.edu/v2/` shows `Server: Apache`, use [apache-institutional-v2.conf](./apache-institutional-v2.conf) instead, or make sure Apache forwards `/v2/` to the Nginx layer that contains the `/v2/` proxy.

## Deployment Checklist

- Apply the institutional Nginx `/v2/` location and `map $http_upgrade $connection_upgrade` in the `http {}` context.
- Ensure `proxy_pass http://10.0.0.69/;` includes the trailing slash so `/v2/` is stripped.
- Set `FRONTEND_URL=https://vlab.amrita.edu/v2` for backend CORS and email links.
- Set `VITE_API_URL=/v2/api`, `VITE_FILES_URL=/v2/files`, and `VITE_SOCKET_PATH=/v2/socket.io` before building the frontend image.
- Rebuild and restart the Docker stack.
- Do not add `/v2` locations to Docker Nginx; it receives stripped paths from the institutional proxy.

## Validation Checklist

Institutional proxy:

```bash
curl -Ik https://vlab.amrita.edu/v2/
curl -Ik https://vlab.amrita.edu/v2/api/users
curl -Ik https://vlab.amrita.edu/v2/api/health
curl -Ik https://vlab.amrita.edu/v2/assets/
```

Remote VM:

```bash
curl -I http://10.0.0.69/
curl -I http://10.0.0.69/api/users
curl -I http://10.0.0.69/api/health
curl -I http://10.0.0.69/health
```

Docker:

```bash
docker compose exec frontend nginx -t
docker compose restart frontend
docker compose logs -f frontend
docker compose logs -f backend
```

If your deployed compose file renames the frontend service to `nginx`, use:

```bash
docker compose exec nginx nginx -t
docker compose restart nginx
docker compose logs -f nginx
docker compose logs -f backend
```
