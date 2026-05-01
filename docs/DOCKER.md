# Docker Setup

## 1. Requirements

- Docker Desktop (with Docker Compose v2)

## 2. Prepare environment

1. Make sure `.env` exists in project root.
2. Ensure at least these vars are set in `.env`:
   - `PORT=3000`
   - `DATABASE_URL=postgres://comforthotel:comforthotel@localhost:5432/comforthotel`
   - `SESSION_SECRET=...`

`docker-compose.yml` overrides `DATABASE_URL` to `postgres://comforthotel:comforthotel@postgres:5432/comforthotel`, so you can keep local `.env` with `localhost` for non-Docker runs.

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
