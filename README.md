# ComfortHotel

ComfortHotel is a Dockerized hotel booking system with a web interface, separate backend services, PostgreSQL databases, Nginx gateway, and monitoring.

The project is built around a simple hotel workflow:

- browse rooms;
- create bookings;
- manage staff/admin access;
- receive contact requests;
- monitor the running services.

## Services

The application runs as a set of containers:

| Service | Purpose |
| --- | --- |
| `gateway` | Public Nginx entrypoint |
| `app` | Main Express app and EJS pages |
| `auth-service` | Login, logout, sessions |
| `product-service` | Room data |
| `order-service` | Booking data |
| `chat-service` | Contact requests |
| `prometheus` | Metrics collection |
| `grafana` | Monitoring dashboards |

Each backend service uses its own PostgreSQL database container, so service data is isolated.

## Tech Stack

- Node.js
- Express
- EJS
- PostgreSQL
- Docker Compose
- Nginx
- Prometheus
- Grafana
- Terraform

## Run with Docker

Create `.env` from the example file:

```bash
cp .env.example .env
```

Edit the secrets in `.env`, then start the stack:

```bash
docker compose up --build -d
```

Open:

- `http://localhost` - application
- `http://localhost:9090` - Prometheus
- `http://localhost:3001` - Grafana

Grafana default login:

```text
admin / admin
```

## Environment

The main variables are listed in `.env.example`.

For a normal Docker run, set at least:

```text
DB_PASSWORD=
SESSION_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
MANAGER_USERNAME=
MANAGER_PASSWORD=
```

Optional user credentials are also supported:

```text
USER_USERNAME=
USER_PASSWORD=
USER_EMAIL=
USER_FULL_NAME=
```

## Commands

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f gateway
docker compose restart grafana
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to remove saved database and Grafana volumes.

## Local Development

The main app can also run directly with Node.js:

```bash
npm install
npm start
```

For local Node mode, PostgreSQL and service URLs must be configured manually in `.env`.

## Project Layout

```text
ComfortHotel/
|-- database/          database init scripts
|-- docs/              reports and extra documentation
|-- monitoring/        Prometheus and Grafana config
|-- nginx/             Nginx gateway config
|-- public/            static files
|-- scripts/           helper scripts
|-- services/          auth, product, order, chat services
|-- src/               main app source
|-- terraform/         infrastructure files
|-- views/             EJS pages
|-- docker-compose.yml
|-- Dockerfile.backend
|-- Dockerfile.frontend
`-- server.js
```

## Documentation

- [Docker setup](docs/DOCKER.md)
- [Incident report](docs/INCIDENT_REPORT.md)
- [Terraform deployment](terraform/DEPLOYMENT.md)
