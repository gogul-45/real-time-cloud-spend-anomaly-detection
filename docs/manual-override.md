# Human-in-the-Loop Manual Override Design

## 1. Principles
- **No Autonomous Destruction**: Automated cloud FinOps tools that terminate instances automatically risk causing severe customer-facing outages if an anomaly turns out to be legitimate high traffic.
- **Explainable Evidence Delivery**: The system surfaces the recommended containment plan (e.g., "Rollback video-transcoder-v42 and clamp max autoscaler replicas to 12") along with expected savings ($\$114/\text{hr}$) and risk level.
- **Operator Attribution**: Overrides require the operator to confirm their technical justification. The action transitions the anomaly lifecycle to `APPROVED` and records an immutable audit log.
