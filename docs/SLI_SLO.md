# SLI/SLO Design

This document defines the service reliability indicators and objectives used by the ComfortHotel SRE implementation.

## Service Scope

The SLOs apply to the user-facing booking flow served through the Nginx gateway and the main backend services:

- `main-app`
- `auth-service`
- `product-service`
- `order-service`
- `chat-service`
- `gateway`

Supporting components such as PostgreSQL, Prometheus, Grafana, cAdvisor, and the Docker metrics exporter are monitored because they affect reliability, but the main SLO evaluation is based on user-facing HTTP behavior.

## SLIs

| SLI | Definition | Implementation |
|---|---|---|
| Availability | Percentage of monitored services that are reachable and healthy | Prometheus `up` metric and Docker/Kubernetes health checks |
| Latency | 95th percentile HTTP request duration | Prometheus histogram `http_request_duration_seconds_bucket` |
| Error rate | Percentage of HTTP requests returning `5xx` responses | Prometheus counters `http_requests_total` and service-prefixed request counters |
| Request success rate | Percentage of successful requests for the booking flow | Grafana SLO panel using booking request success over a 30-day window |

## SLOs

| SLO | Target |
|---|---|
| Availability | >= 99% |
| P95 latency | <= 200 ms |
| Error rate | <= 1% |
| Request success rate | >= 99% |

## Prometheus Queries

Availability:

```promql
avg(up{job=~"backend|product-service|order-service|chat-service|auth-service"})
```

P95 latency:

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

Main application error rate:

```promql
100 * (
  sum(rate(http_requests_total{status_code=~"5.."}[5m]))
  /
  clamp_min(sum(rate(http_requests_total[5m])), 0.001)
)
```

Booking success rate:

```promql
1 - (
  sum(rate(http_requests_total{route=~"/api/bookings.*",status_code=~"5.."}[30d]))
  /
  clamp_min(sum(rate(http_requests_total{route=~"/api/bookings.*"}[30d])), 0.001)
)
```

## Existing Implementation

- Express services expose `/health` and `/metrics`.
- Prometheus scrapes `main-app`, `auth-service`, `product-service`, `order-service`, and `chat-service`.
- Grafana includes request rate, error rate, latency, service health, resource usage, and booking success SLO panels.
- Alert rules detect service downtime, high `5xx` rate, missing metrics, and CPU-based scaling candidates.

The `ServiceHighErrorRateWarning` alert currently uses a warning threshold above 5%. The project SLO target remains <= 1%; the higher alert threshold is used to reduce noise during demo and incident simulation.
