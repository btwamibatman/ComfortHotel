
# Comfort Hotel (Microservices Architecture)

An enterprise-grade hotel booking system refactored into a microservices architecture using Node.js, Docker, Nginx, and Terraform. Features high availability, fault isolation, monitoring, and structured incident response.

## Features

- **Microservices Architecture**: Functionality distributed across `main-app`, `auth-service`, `order-service`, `product-service`, and `chat-service`.
- **Fault-Isolation**: Each microservice uses its own dedicated PostgreSQL database container.
- **API Gateway**: Nginx routing internal traffic and serving as the primary entry point.
- **Infrastructure as Code**: Terraform configurations to deploy resources to Google Cloud.
- **Observability**: Built-in metrics scraping with Prometheus and system dashboards via Grafana.
- **Role-based Authentication**: Session-based auth via PostgreSQL store (`connect-pg-simple`).

## Tech Stack

| Layer | Technology |
|---|---|
| Programming | Node.js, Express.js |
| Databases | PostgreSQL (5 isolated instances) |
| Reverse Proxy | Nginx Gateway |
| Orchestration | Docker & Docker Compose |
| Infrastructure| Terraform (Google Cloud Provider) |
| Monitoring    | Prometheus & Grafana |

## Getting Started

### 1. Prerequisites
- Docker and Docker Compose installed.
- (Optional) Terraform CLI / Google Cloud CLI for cloud deployment.

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```

### 3. Launch the Complete Stack
Start the web app, microservices, databases, and monitoring stack in detached mode:
```bash
docker compose up --build -d
```

### 4. Endpoints
- **Main Web UI**: `http://localhost` (Port 80)
- **Grafana Dashboard**: `http://localhost:3001`
- **Prometheus Metrics**: `http://localhost:9090`

## Reports & Documentation
- **[Incident Response & Postmortem (Assignment 4)](docs/INCIDENT_REPORT.md)** 
- **[Terraform Deployment Guide (Assignment 5)](terraform/DEPLOYMENT.md)**
- **[Database Fault Isolation Architecture](DOCKER.md)**

## Simulating an Incident
To test the monitoring stack, you can introduce a simulated database connection failure to the Order Service:
```bash
docker compose -f docker-compose.yml -f docker-compose.incident.yml up -d
```
MANAGER_PASSWORD=your_password
MANAGER_EMAIL=manager@comforthotel.local
MANAGER_FULL_NAME=Hotel Manager
```

### 3. Start the main app locally

```bash
cd services/main-app
npm start
```

## Application URLs

| Route | URL |
|---|---|
| Public site | `http://localhost:3000` |
| Admin login | `http://localhost:3000/admin/login` |
| Staff login | `http://localhost:3000/staff/login` |

## Authentication and Security

This project uses session-based authentication. User credentials are verified with `bcrypt`, sessions are stored in PostgreSQL, and session IDs are transmitted via secure cookies configured with `HttpOnly`, `Secure` (production only), and `SameSite=Strict`. This helps protect the application against common attacks such as XSS and CSRF.

## Booking Model

Each booking contains the following fields: room name, room type, guest name, guest email, guest phone, check-in date, check-out date, stay duration, number of guests, total price, special requests, and booking status.

## API Overview

**Authentication**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/admin/login` | Login as admin |
| POST | `/auth/logout` | Logout |
| GET | `/api/auth/status` | Check auth status |

**Bookings**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| POST | `/api/bookings` | Create booking *(protected)* |
| PUT | `/api/bookings/:id` | Update booking *(protected)* |
| DELETE | `/api/bookings/:id` | Delete booking *(protected)* |

## Validation

The application validates email format, phone format, check-in and check-out date logic, and guest count range. It returns appropriate HTTP status codes: `200`, `201`, `400`, `401`, `403`, `404`, and `500`.

## Project Structure

```
ComfortHotel/
|-- docker-compose.yml
|-- docker-compose.*.yml
|-- Dockerfile.frontend
|-- database/
|   `-- init.sql
|-- docs/
|-- monitoring/
|-- nginx/
|-- scripts/
|-- services/
|   |-- main-app/
|   |   |-- Dockerfile
|   |   |-- package.json
|   |   |-- server.js
|   |   |-- src/
|   |   |-- views/
|   |   `-- public/
|   |-- auth-service/
|   |-- product-service/
|   |-- order-service/
|   `-- chat-service/
`-- terraform/
```
## Production Notes

Before deploying to production, make sure to:

- Set a strong `SESSION_SECRET`
- Use a production PostgreSQL database
- Enable HTTPS
- Set `NODE_ENV=production`
