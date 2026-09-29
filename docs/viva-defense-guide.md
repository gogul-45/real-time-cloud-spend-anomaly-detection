# College Project Defense & Viva Voce Preparation Guide

## Project Title
**Real-Time Cloud Spend Anomaly Detection & Automated Incident Response System**

---

### Question 1: What is the core problem statement, and why is existing cloud tooling inadequate?
**Answer:**
Existing cloud cost tooling like AWS Cost Explorer and Azure Cost Management suffers from a critical 24-to-48-hour data lag. In elastic cloud architectures, runaway loops, unconstrained auto-scalers, or misconfigured microservice deployments can generate thousands of dollars in wasted compute before any alert is raised. Our system ingests billing, autoscaling, deployment, and workload streams in real time, detecting anomalies in under 5 seconds.

---

### Question 2: Why do simple threshold-based alerts generate excessive false alarms?
**Answer:**
Cloud spend is not static; it fluctuates naturally with customer traffic (e.g., e-commerce flash sales or live streaming events). Simple threshold alerts trigger whenever spend rises, treating legitimate business growth as an anomaly. Our system solves this with Detector C (Workload-Aware Elasticity), which compares cost growth against job/stream throughput. If jobs increase by 140% and cost rises by 145%, the unit cost remains steady, avoiding false alarms.

---

### Question 3: How does your tri-detector ensemble fuse predictions?
**Answer:**
The system combines:
1. **Rule-Based Detector A** (evaluating absolute and percentage cost surges).
2. **Statistical Detector B** (Z-Score outlier evaluation and EWMA divergence).
3. **Workload-Aware Detector C** (elasticity disparity analysis).
These individual outputs are normalized into $[0, 1]$ confidence scores and weighted alongside deployment and autoscaling proximity into a Composite Anomaly Score:
$$S_{\text{composite}} = 0.20 S_{\text{rule}} + 0.25 S_{\text{stat}} + 0.25 S_{\text{workload}} + 0.15 S_{\text{resource}} + 0.15 S_{\text{deployment}}$$
Composite scores $\ge 0.90$ are flagged as CRITICAL.

---

### Question 4: How does the system handle duplicate or late-arriving events?
**Answer:**
1. **Idempotency**: Every arriving event is hashed using its attributes $(t, \text{resourceId}, \text{cost})$ or unique provider ID. Duplicate arrivals are rejected without updating accumulators.
2. **Late Events**: A sliding watermark window buffers and re-orders events chronologically before computing rolling baseline statistics, preventing out-of-order data corruption.

---

### Question 5: Why is human-in-the-loop manual override required?
**Answer:**
Unsupervised automatic termination can cause catastrophic outages if a critical database or production service is mistakenly killed. By proposing containment actions and requiring approval from an authenticated operator (with an append-only SOX 404 audit log), the system ensures high financial safety and enterprise compliance.
