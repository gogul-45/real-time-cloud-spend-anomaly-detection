# Data Model Specification

## Core Entities

### BillingEvent
- `eventId`: UUID unique string.
- `timestamp`: Logical event epoch millisecond.
- `ingestionTime`: Arrival epoch millisecond at reconciliation layer.
- `service`: Cloud provider service category (e.g., "GPU Compute", "Cloud CDN").
- `resourceId`: Cluster or instance identifier (e.g., `GPU-TRANSCODER-07`).
- `hourlyCost`: Dollar rate per hour.
- `cumulativeCost`: Running day-to-date expenditure.
- `workloadType`: Workload classification (e.g., `video-transcoding`).

### ResourceChangeEvent
- `eventId`: UUID identifier.
- `timestamp`: Event timestamp.
- `resourceId`: Resource ID.
- `resourceType`: Infrastructure category (e.g., `NVIDIA-A10G-Cluster`).
- `changeType`: Mutation type (e.g., `Autoscaler Scale-Out`).
- `previousValue`: State before mutation (e.g., `8`).
- `newValue`: State after mutation (e.g., `22`).
- `changedBy`: Actor or automated service (e.g., `autoscaler-service`).

### DeploymentEvent
- `deploymentId`: Release identifier (e.g., `video-transcoder-v42`).
- `application`: Microservice name.
- `version`: Release tag or semver.
- `owner`: Responsible team (e.g., `Media Processing Team`).
- `changeSummary`: Pull request or commit description.

### Anomaly
- `anomalyId`: Deterministic incident ID (`ANOM-...`).
- `onsetTime`: Estimated time of abnormal spend divergence.
- `detectionTime`: Timestamp when anomaly score breached threshold.
- `severity`: `NORMAL` | `WARNING` | `HIGH` | `CRITICAL`.
- `compositeScore`: Normalized $[0, 1]$ ensemble confidence score.
- `evidence`: Complete evidence object with scorecard, timeline, attribution, and forecasts.
- `status`: Incident lifecycle state.
