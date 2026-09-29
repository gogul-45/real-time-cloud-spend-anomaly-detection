# Observability, Prometheus Metrics & Health Probes

## 1. Overview
Production cloud software requires comprehensive observability. FinOps Sentinel provides built-in metrics exposition and health probes designed for Kubernetes, Prometheus, and Grafana stacks.

## 2. Health & Readiness Probes (`/api/health`)
Provides JSON status for orchestrators (Kubernetes liveness/readiness probes):
- **Detection Engine Health**: Active anomaly count and detector status.
- **Ingestion Queue**: Queue status and total events ingested.
- **Database Status**: Persistence driver and connection state.
- **Notification Subsystem**: Pending alerts and supported channels.
- **System Memory**: Resident Set Size (RSS) and heap allocations.

## 3. Prometheus Metrics Exposition (`/api/metrics`)
Standard Prometheus text format exposing:
- `finops_events_ingested_total` (Counter): Total billing events ingested.
- `finops_anomalies_detected_total` (Counter): Cumulative anomalies identified.
- `finops_active_anomalies_count` (Gauge): Current open anomalies.
- `finops_critical_anomalies_count` (Gauge): Critical severities requiring action.
- `finops_hourly_spend_rate_dollars` (Gauge): Total instantaneous monitored cloud spend.
- `finops_detection_latency_seconds` (Gauge): Rolling detection latency SLA measurement.
- `finops_model_drift_index` (Gauge): Kolmogorov-Smirnov distribution shift metric.

## 4. Concept Drift & Model Health (`/api/monitoring`)
- Evaluates statistical divergence between historical 30-day baselines and current 24-hour runtime windows.
- Computes KS-test statistics and p-values to flag when infrastructure usage patterns have permanently changed, recommending baseline re-calibration.
