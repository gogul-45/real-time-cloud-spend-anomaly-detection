# Real-Time Cloud Spend Anomaly Detection & Response System

> **70% Project Milestone Implementation**  
> An event-driven FinOps platform prototype designed for media streaming platforms with variable workloads.

---

## 1. Project Overview

Traditional cloud budget alerts operate on 24-hour or monthly batch billing reports. By the time an engineering team receives a notification, thousands of dollars in rogue autoscaler expansions or runaway compute have already been burned.

**FinOps Sentinel** continuously correlates 4 real-time data streams:
1. Hourly Cloud Billing Meters
2. Cluster Autoscaling & Resource Mutation Events
3. CI/CD Application Deployments
4. Application Workload & Telemetry Metrics

Using a multi-signal ensemble combining rule-based baselines, statistical outlier analysis (Z-score & EWMA), and workload elasticity modeling, the system flags cost anomalies in **under 5 seconds** and dispatches actionable root-cause evidence in **under 15 seconds**.

---

## 2. Architecture & Technology Stack

* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
* **State & Reconciliation Engine**: Zustand in-memory deterministic event bus with idempotency filtering and chronological sorting
* **Persistence**: Dual-layer architecture with Node.js SQLite (`data/finops.db`) and file-backed state replication
* **RBAC Context**: Simulated enterprise authorization personas (Operator, FinOps Analyst, Service Owner, Admin)
* **Testing**: Automated in-browser test runner (`/tests`) and standalone CLI verification suite (`tests/run-tests.mjs`)

---

## 3. End-to-End Demonstration Scenario (Section 32)

The system is pre-loaded with a realistic media platform benchmark scenario:
* **Resource**: `GPU-TRANSCODER-07`
* **Application**: `video-transcoder`
* **Deployment**: `video-transcoder-v42`
* **Accountable Owner**: `Media Processing Team`
* **Historical Baseline**: `$72.00/hour`
* **Actual Ingested Rate**: `$186.00/hour` (+158%)
* **Resource Allocation**: `8 → 22` NVIDIA A10G GPU nodes
* **Workload Growth**: `+12%` (1,200 → 1,344 jobs/hour)
* **GPU Utilization**: Rose to 91% due to queue backlog, despite massive capacity over-allocation
* **Composite Anomaly Score**: `0.94` (**CRITICAL**)
* **Projected 6-Hour Excess Cost**: **$732.00**

---

## 4. Key 70% Features

1. **Advanced Detection Ensemble**:
   - **Detector A**: Rule-based baseline percentage deviation.
   - **Detector B**: Statistical outlier detection (Z-score & EWMA).
   - **Detector C**: Workload-aware elasticity (detecting cost surging 13.2x faster than jobs).
   - **Composite Score**: Weighted multi-signal fusion (0.0 to 1.0).

2. **Root-Cause Correlation & Attribution**:
   - $\pm 15$ minute correlation window linking deployment commit to autoscaler scale-out.
   - Causal visual timeline from deployment to multi-channel notification.
   - Resource, service, deployment, and cloud region cost attribution breakdown.

3. **Short-Term Forecasting & What-If Analysis**:
   - Linear regression and EWMA cost forecasts for 1h, 6h, and 24h horizons.
   - Interactive `/what-if` modeling page allowing operators to simulate savings from replica caps and rollbacks.

4. **Incident Lifecycle & Non-Destructive Containment**:
   - Status transitions (`DETECTED` → `INVESTIGATING` → `ACKNOWLEDGED` → `ACTION_PROPOSED` → `APPROVED` → `RESOLVED`).
   - Human-in-the-loop manual override with mandatory technical justification.
   - Append-only immutable audit trail with actor role logging.

5. **Empirical Benchmarking & Sensitivity Analysis**:
   - 20 synthetic scenarios evaluated dynamically across Rule, Statistical, Workload, and Ensemble models.
   - Interactive threshold slider (0.50 to 0.90) dynamically recalculating Precision, Recall, F1, FPR, and FNR.

6. **Failure Test Center**:
   - 10 interactive resilience tests verifying idempotency, delayed deployment metadata, out-of-order event sorting, and legitimate sports broadcast surges.

7. **Stakeholder Validation & Performance Benchmark**:
   - 7-factor structured evaluation questionnaire with aggregated ratings.
   - Performance test generating 1k to 25k continuous events with actual measured throughput (events/sec).

---

## 5. Quick Start Instructions

### Prerequisites
* Node.js 18, 20, or 22
* npm or bun

### Exact Installation Command
```bash
npm install
```

### Exact Run Command
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Test Suite
```bash
node tests/run-tests.mjs
```
Or open `/tests` directly in the running web application.

---

## 6. Demo Roles & Credentials

No external credentials required. Use the **Role Selector** dropdown in the top navigation header to test different RBAC personas:
* **Operator**: Can acknowledge incidents, investigate root cause, and apply manual overrides.
* **FinOps Analyst**: Can tune detection thresholds, view analytics, and inspect unit costs.
* **Service Owner**: Can review team-owned alerts and approve deployment rollbacks.
* **Admin**: Unrestricted access to all configuration, settings, and replay tools.

---

## 7. 70% Milestone Completed

| Requirement | Status | Evidence in Application |
|---|---|---|
| Advanced anomaly detection | Completed | Detector comparison on `/experiments` & `/` |
| Root-cause correlation | Completed | Causal timeline on `/anomalies/[id]` |
| Forecasting | Completed | Forecast cards on `/anomalies/[id]` & `/` |
| What-if analysis | Completed | Interactive simulator on `/what-if` |
| Failure handling | Completed | 10 automated test cases on `/failure-tests` |
| FP/FN analysis | Completed | 20 benchmark scenarios on `/experiments` |
| Stakeholder validation | Completed | 7-factor evaluation on `/validation` |
| Persistence | Completed | SQLite / file storage in `lib/db.ts` & `data/` |
| Audit trail | Completed | Append-only audit table on `/audit` |
| Manual override | Completed | Human-in-the-loop modal on `/anomalies/[id]` |
| Performance testing | Completed | High-throughput benchmark on `/performance` |

---
*FinOps Sentinel — Prototype built for academic demonstration and research purposes.*
