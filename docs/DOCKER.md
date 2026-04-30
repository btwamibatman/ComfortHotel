# Docker Setup

## 1. Requirements

- Docker Desktop (with Docker Compose v2)

## 2. Prepare environment

1. Make sure `.env` exists in project root.
2. Ensure at least these vars are set in `.env`:
   - `PORT=3000`
   - `DATABASE_URL=...`
   - `SESSION_SECRET=...`

`docker-compose.yml` now uses separate PostgreSQL containers per service, so local `.env` values can still point to `localhost` for non-Docker runs while Docker networking keeps the services isolated.

The Docker runtime uses Nginx as the public entrypoint. EJS templates are still rendered by the Express backend; Nginx proxies browser requests to the backend container.

## 3. Build and start

```bash
docker compose up --build -d
```

Open:
- http://localhost
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## 4. Useful commands

```bash
docker compose logs -f gateway
docker compose logs -f app
docker compose down
docker compose down -v
```

- `down` keeps PostgreSQL volume.
- `down -v` removes PostgreSQL data as well.

Each backend service now has its own PostgreSQL container and volume, so one database failure does not take down the others.

## 5. Monitoring dashboard

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
