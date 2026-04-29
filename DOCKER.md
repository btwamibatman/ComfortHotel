# Docker Setup

## 1. Requirements

- Docker Desktop (with Docker Compose v2)

## 2. Prepare environment

1. Make sure `.env` exists in project root.
2. Ensure at least these vars are set in `.env`:
   - `PORT=3000`
   - `MONGO_DB_NAME=...`
   - `SESSION_SECRET=...`
   - admin/manager credentials (if you use bootstrap scripts)

`docker-compose.yml` overrides `MONGO_URI` to `mongodb://mongo:27017`, so you can keep local `.env` with `localhost` for non-Docker runs.

The Docker runtime uses Nginx as the public entrypoint. EJS templates are still rendered by the Express backend; Nginx proxies browser requests to the backend container.

## 3. Build and start

```bash
docker compose up --build -d
```

Open:
- http://localhost
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## 4. First-time DB bootstrap (optional but recommended)

```bash
docker compose exec app node init-users.js
docker compose exec app node seed-bookings.js
```

## 5. Useful commands

```bash
docker compose logs -f gateway
docker compose logs -f app
docker compose down
docker compose down -v
```

- `down` keeps MongoDB volume.
- `down -v` removes MongoDB data as well.

## 6. Monitoring dashboard

Grafana is preconfigured with:
- Prometheus data source (`http://prometheus:9090`)
- Dashboard: `Hotel Booking System Monitoring`

Default Grafana login:
- user: `admin`
- password: `admin`

If the dashboard does not appear immediately, restart Grafana:

```bash
docker compose restart grafana
```
