# Architecture & System Design — FinOps Sentinel

## 1. High-Level Architecture Overview
FinOps Sentinel is an event-driven cloud spend anomaly detection and response platform architected specifically for media streaming and transcode workloads with high elasticity.

The system decouples ingestion from detection and containment:
1. **Telemetry & Meter Ingestion**: Collects billing streams, cluster autoscaling events, GitHub Actions CI/CD release events, and workload telemetry metrics.
2. **Deterministic Reconciliation Layer**: Enforces idempotency via UUID hashing, re-orders events according to logical `event_time`, and reconciles late arrivals into an in-memory chronological buffer.
3. **Multi-Signal Detection Engine**: Runs Rule-based, Statistical (Z-score & EWMA), Workload Elasticity, and Resource-Scaling detectors, synthesizing a Composite Anomaly Score (0.0 to 1.0).
4. **Root-Cause Attribution & Forecasting**: Correlates deployments within a configurable $\pm 15$ minute window, attributes cost across fleet resources, and generates short-term excess burn forecasts (1h, 6h, 24h).
5. **Human-in-the-Loop Decision Layer**: Dispatches multi-channel alerts (Slack, Email, Dashboard) and enforces non-destructive containment through manual overrides backed by an immutable audit trail.
