# Comfort Hotel - SRE Microservices Project

Comfort Hotel is a hotel booking system implemented as a containerized microservices application for an End Term SRE project. The project demonstrates Docker Compose, Docker Swarm, Kubernetes, Terraform, Ansible, Prometheus, Grafana, incident response, and capacity planning practices in one distributed system.

Site link: https://hotel.y-not-devs.com

## Project Scope

The project is built as a production-style distributed application with automated deployment, monitoring, and operational recovery practices.

It includes:

- containerized application services;
- local deployment with Docker Compose;
- clustered deployment with Docker Swarm and Kubernetes;
- reproducible infrastructure configuration with Terraform;
- automated server setup and application deployment with Ansible;
- service health checks, metrics collection, and dashboards;
- reliability targets for availability, latency, errors, and request success;
- failure simulation with documented recovery steps;
- scaling configuration through resource limits, replicas, and autoscaling.

## Infrastructure Coverage

| Requirement | Implementation | Evidence |
|---|---|---|
| Distributed microservices system | ComfortHotel services, gateway, isolated databases, metrics exporter | `services/`, `docker-compose.yml` |
| Docker environment setup | Full stack with Docker Compose | `docker-compose.yml`, `docs/DOCKER.md` |
| Docker Swarm orchestration | Stack and scaling overlays | `docker-compose.swarm.yml`, `docker-compose.swarm-scale.yml` |
| Kubernetes orchestration | Namespace, ConfigMaps, Secrets, StatefulSets, Deployments, Services, HPA | `k8s/` |
| Terraform provisioning | Google Cloud VM, network, firewall rules, static IP | `terraform/` |
| Ansible automation | Docker installation, `.env` rendering, Compose deployment, optional HTTPS | `ansible/` |
| SLI/SLO design | Availability, latency, error rate, request success rate | `docs/SLI_SLO.md` |
| Monitoring | Prometheus, Grafana, cAdvisor, service metrics | `monitoring/` |
| Alerting | Service down, high error rate, missing metrics, CPU scaling candidate | `monitoring/alert_rules.yml` |
| Incident response | Simulated Order Service database failure and postmortem | `docker-compose.incident.yml`, `docs/INCIDENT_REPORT.md` |
| Capacity planning | Resource profiles, Swarm scaling, Kubernetes HPA | `docker-compose.resources.yml`, `docker-compose.swarm-scale.yml`, `k8s/order-service-hpa.yml` |

## Architecture

```text
User
  |
  v
Nginx Gateway
  |
  v
Main App
  |
  +--> Auth Service --------> PostgreSQL App DB
  +--> Product Service -----> PostgreSQL Product DB
  +--> Order Service -------> PostgreSQL Order DB
  +--> Chat Service --------> PostgreSQL Chat DB

Observability:
Prometheus -> service /metrics, cAdvisor, Docker metrics exporter
Grafana    -> dashboards and SLO visualization

Infrastructure:
Terraform  -> Google Cloud VM, network, firewall, static IP
Ansible    -> Docker installation, environment configuration, deployment

Orchestration:
Docker Compose -> local full-stack deployment
Docker Swarm   -> replicated service deployment
Kubernetes     -> declarative deployment, self-healing, HPA
```

## Main Components

| Component | Role |
|---|---|
| `main-app` | User-facing web application and booking UI |
| `auth-service` | Authentication, sessions, admin/staff login |
| `product-service` | Room catalog and product-style data |
| `order-service` | Booking and order management |
| `chat-service` | Contact/message workflow |
| `gateway` | Nginx public entrypoint and API routing |
| `docker-metrics-exporter` | Docker runtime metrics for observability |
| PostgreSQL containers | Isolated persistent data stores per service |
| Prometheus | Metrics collection and alert evaluation |
| Grafana | Dashboards and SLO visualization |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend rendering | EJS |
| Gateway | Nginx |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |
| Orchestration | Docker Swarm, Kubernetes |
| Infrastructure as Code | Terraform with Google Cloud provider |
| Configuration management | Ansible |
| Monitoring | Prometheus, Grafana, cAdvisor |

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose
- Optional for cloud deployment: Terraform, Google Cloud CLI, Ansible
- Optional for Kubernetes: Minikube or another Kubernetes cluster

### 2. Configure Environment

Copy the example environment file and set the required secrets:

```bash
cp .env.example .env
```

Important variables include:

- `DB_PASSWORD`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `MANAGER_USERNAME`
- `MANAGER_PASSWORD`
- alert notification variables for Alertmanager

### 3. Run Full Stack Locally

```bash
docker compose up --build -d
```

Application URLs:

| Service | URL |
|---|---|
| Web application | `http://localhost` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3001` |
| cAdvisor | `http://localhost:8080` |
| Alertmanager | `http://localhost:9093` |

Useful checks:

```bash
docker compose ps
docker compose logs -f gateway
docker compose logs -f order-service
```

## Docker Swarm Deployment

Initialize Swarm and deploy the stack:

```bash
docker swarm init
docker stack deploy -c docker-compose.swarm.yml comforthotel
```

For horizontal scaling demonstration:

```bash
docker compose -f docker-compose.yml -f docker-compose.swarm-scale.yml config > docker-stack.generated.yml
docker stack deploy --resolve-image never -c docker-stack.generated.yml comforthotel
```

## Kubernetes Deployment

The Kubernetes manifests are stored in `k8s/`.

Apply the manifests:

```bash
kubectl apply -f k8s/00-namespace.yml
kubectl apply -f k8s/01-configmaps.yml
kubectl apply -f k8s/02-secrets.yml
kubectl apply -f k8s/03-postgres.yml
kubectl apply -f k8s/04-microservices.yml
kubectl apply -f k8s/05-gateway.yml
kubectl apply -f k8s/order-service-hpa.yml
```

Check status:

```bash
kubectl get deploy,statefulset,svc,hpa,pods -n comforthotel
```

See `k8s/README.md` for image build instructions and Minikube usage.

## Terraform Infrastructure

Terraform provisions the Google Cloud infrastructure:

- static public IP;
- VPC network;
- firewall rules for web, SSH, Prometheus, and Grafana access;
- Ubuntu VM for application deployment.

Validate and apply:

```bash
terraform -chdir=terraform init
terraform -chdir=terraform validate
terraform -chdir=terraform apply
```

See `terraform/DEPLOYMENT.md` for full deployment instructions.

## Ansible Automation

Ansible configures the Terraform-created VM and deploys the application stack.

Run the full playbook:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbooks/site.yml
```

The playbooks install Docker, copy or clone the project, render `.env`, validate Docker Compose configuration, and start the stack. Optional HTTPS deployment with Let's Encrypt is documented in `ansible/README.md`.

## Monitoring And SLOs

Each application service exposes:

- `/health` for health checks;
- `/metrics` for Prometheus scraping.

Prometheus scrapes:

- `main-app`;
- `auth-service`;
- `product-service`;
- `order-service`;
- `chat-service`;
- cAdvisor;
- Docker metrics exporter.

Defined SLO targets:

| SLO | Target |
|---|---|
| Availability | >= 99% |
| P95 latency | <= 200 ms |
| Error rate | <= 1% |
| Request success rate | >= 99% |

Detailed SLI/SLO definitions are in `docs/SLI_SLO.md`.

## Incident Simulation

The incident scenario simulates an Order Service failure caused by an invalid database configuration.

Start the incident:

```bash
docker compose -f docker-compose.yml -f docker-compose.incident.yml up -d
```

Check the failure:

```bash
docker compose ps order-service
docker compose logs order-service
```

Recover:

```bash
docker compose up -d order-service
```

The incident report and postmortem are documented in `docs/INCIDENT_REPORT.md`.

## Capacity Planning

The project includes multiple scaling strategies:

- Docker Compose resource reservations and limits in `docker-compose.resources.yml`;
- Docker Swarm replica scaling in `docker-compose.swarm-scale.yml`;
- Kubernetes HPA for `order-service` in `k8s/order-service-hpa.yml`;
- Prometheus CPU alert for identifying scaling candidates.

The main expected bottlenecks are the Order Service and PostgreSQL databases because booking operations are stateful and write-heavy.

## Documentation

| Document | Purpose |
|---|---|
| `docs/SLI_SLO.md` | SLI/SLO design and Prometheus queries |
| `docs/INCIDENT_REPORT.md` | Incident response and postmortem |
| `docs/DOCKER.md` | Docker setup notes |
| `docs/commands.md` | Operational commands and demo notes |
| `terraform/DEPLOYMENT.md` | Cloud provisioning instructions |
| `ansible/README.md` | Server automation instructions |
| `k8s/README.md` | Kubernetes deployment instructions |

## Verification Commands

```bash
docker compose config --quiet
terraform -chdir=terraform validate
docker compose up --build -d
docker compose ps
```

If Ansible is installed:

```bash
ansible-playbook -i ansible/inventory.example.ini ansible/playbooks/site.yml --syntax-check
```

If Kubernetes is configured:

```bash
kubectl apply --dry-run=client -f k8s
```

## Submission

Final deliverable: upload only the PDF report with the GitHub repository link.

The PDF should include:

- GitHub repository URL;
- architecture overview;
- Docker Compose evidence;
- Docker Swarm evidence;
- Kubernetes evidence;
- Terraform and Ansible evidence;
- Prometheus targets and Grafana dashboard screenshots;
- incident simulation and recovery evidence;
- postmortem summary.
