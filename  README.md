# Event Platform

## Description

A microservices-based platform for collecting, processing, and analyzing events from Facebook and TikTok.  
Built with Express, Drizzle ORM, PostgreSQL, NATS, Prometheus, and Grafana.

---

## Getting Started

1. **Install Docker and Docker Compose**
2. **Start all services:**
   ```bash
   docker compose up --build
   ```
3. **Access Services:**

- Gateway: http://localhost:3000
- Reporter: http://localhost:3003
  - **GET `/reports/events`** - returns aggregated event statistics with optional filters:
    - `from` and `to` (time range)
    - `source` (Facebook or Tiktok)
    - `funnelStage` (top or bottom)
    - `eventType` (specific event type)
  - **GET `/reports/revenue`** - returns aggregated revenue data from transactional events (e.g., Facebook's `checkout.complete` or Tiktok's `purchase`) with filters:
    - `from` and `to`
    - `source`
    - (optionally) `campaignId`
  - **GET `/reports/demographics`** - returns user demographic data with filters:
    - `from`end and `to`
    - `source`
- Prometheus: http://prometheus:9090
- Grafana: http://localhost:3001 (login/password: admin/admin)

---

## Services

- **gateway** — receives events and publishes them to NATS
- **fb-collector** — processes Facebook events and stores them in PostgreSQL
- **ttk-collector** — processes TikTok events and stores them in PostgreSQL
- **reporter** — provides analytics APIs
- **prometheus** — monitoring
- **grafana** — dashboards

---\*\*

## Scaling

- The gateway and collectors can be horizontally scaled:
  ```yaml
  # docker-compose.yml
  fb-collector:
    deploy:
      replicas: 2
  ```

---

## Metrics

- Each service exposes a /metrics endpoint for Prometheus
- Custom metrics include: processed/failed events, HTTP requests

---

## Healthchecks

- `/health` — endpoint to check service status
