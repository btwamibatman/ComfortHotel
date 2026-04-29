# Incident Report & Postmortem Analysis

This document simulates an incident response scenario as per the requirements of Assignment 4.

---

## Part 1: Incident Report

### 1.1 Incident Summary
The Order Service experienced complete downtime due to a database connection failure. The service was unable to resolve point to its isolated PostgreSQL database, causing all incoming booking and checkout requests to fail with `500 Internal Server Error`.

### 1.2 Impact Assessment
- **Affected Services**: `order-service`
- **Downstream Impact**: Nginx API Gateway (`gateway`) returned `[error] 502 Bad Gateway` when users attempted to view or create orders via `/api/bookings`. 
- **User Impact**: Customers were unable to complete hotel bookings. Existing bookings could not be retrieved.

### 1.3 Severity Classification
**SEVERITY 1 (CRITICAL)**. Core business functionality (booking) was completely unavailable for all users. No workaround was immediately possible.

### 1.4 Timeline of Events (UTC)
- **10:00 AM** - A configuration management deployment triggered an update to the system.
- **10:01 AM** - `order-service` container was recreated and attempted to start.
- **10:02 AM** - Prometheus alert `BackendDownCritical` triggered as `order-service` healthcheck continuously failed and `/metrics` became unresponsive.
- **10:05 AM** - SRE Team paged via Grafana notifications.
- **10:07 AM** - SRE Team acknowledged the alert and began reviewing `docker logs comforthotel-order-service`.
- **10:10 AM** - Logs indicated `ENOTFOUND wrong-postgres-host`. Root cause identified in `docker-compose.yml` environment blocks.
- **10:15 AM** - Configuration patched. `docker compose up -d order-service` executed.
- **10:16 AM** - Healthchecks passed. Prometheus marked `up{job="order-service"} == 1`.
- **10:20 AM** - Full functionality restored. Incident resolved.

### 1.5 Root Cause Analysis
During a recent environment variable update, a typo was introduced in the `DATABASE_URL` for `order-service`. The hostname was inadvertently changed from `postgres-order` to `wrong-postgres-host`. Because Docker's internal DNS could not resolve this host, the Node.js application threw an `ENOTFOUND` exception and crashed, entering a crash-loop state.

### 1.6 Mitigation Steps
1. Investigated Docker container logs: `docker logs comforthotel-order-service`.
2. Verified error: `Error: getaddrinfo ENOTFOUND wrong-postgres-host`.
3. Corrected `DATABASE_URL` in `docker-compose.yml` to point to the correct internal container name `postgres-order`.
4. Recreated the container: `docker compose up -d order-service`.

### 1.7 Resolution Confirmation
- Confirmed `order-service` docker container status changed to `healthy`.
- Grafana dashboard showed active metrics flowing for `job="order-service"`.
- Tested the API route `GET /api/bookings` via the UI, confirming successful 200 responses.

---

## Part 2: Postmortem Analysis

### 2.1 Incident Overview
On April 29, 2026, the ComfortHotel booking system suffered a 20-minute outage localized to the Order Service. The root cause was a misconfigured database connection string deployed during a routine update. Due to effective healthchecks and Prometheus monitoring, the incident was automatically detected and mitigated swiftly.

### 2.2 Customer Impact
Approximately 20 minutes of booking downtime. Users interacting with the UI during this window received a general system error. An estimated 15 bookings failed to process based on Nginx `502` error logs.

### 2.3 Root Cause Analysis
The deployment pipeline lacks automated configuration validation. The invalid `DATABASE_URL` was injected into the build/deploy step without being validated against active Docker internal networks. The lack of a staging environment meant the error surfaced directly in production.

### 2.4 Detection and Response Evaluation
- **What went well:** The Docker `healthcheck` properly identified the unready state of the microservice, preventing bad traffic from being sent immediately. Prometheus properly scraped the failing target and fired alerts on time. Grafana dashboards provided immediate visual confirmation of the failure.
- **What went wrong:** The rollback process was manual. SRE engineers had to manually SSH into the server and run Docker commands instead of relying on a GitOps pipeline.

### 2.5 Resolution Summary
The SRE team identified the Node.js crash loop via Docker logs, spotted the incorrect PostgreSQL hostname, fixed the configuration file, and restarted the container manually. System restored fully.

### 2.6 Lessons Learned
1. Configuration changes must be tested in a CI/CD pipeline before reaching the production server.
2. Connection strings should be validated during the application startup phase using a fail-fast mechanism.
3. Our recent implementation of "Fault Isolation" (splitting PostgreSQL databases per service) proved valuable: *even though the order system was down, the Auth Service and underlying UI (App) remained online, allowing users to browse the site and login!*

### 2.7 Action Items

| Action Item | Owner | Priority | Status |
|-------------|-------|----------|--------|
| **1. Improve Deployment Reliability:** Implement automated Terraform / GitHub Actions CI/CD to syntax-check and validate `.env` variables before deployment. | DevOps Team | High | Not Started |
| **2. Address System Weaknesses:** Add a `dry-run` connection test script to the Docker entrypoint to fail fast with detailed connection debugging if the DB is unreachable. | Backend Team | Medium | Not Started |
| **3. Enhance Monitoring:** Add specific Prometheus alerts for Nginx `502 Bad Gateway` rates to detect when dependent microservices are dropping frontend traffic. | SRE Team | Medium | Not Started |
| **4. Reduce Future Risk:** Implement automated rollback in the CD pipeline if healthchecks do not report "healthy" within 2 minutes of a deployment. | DevOps Team | Low | Not Started |