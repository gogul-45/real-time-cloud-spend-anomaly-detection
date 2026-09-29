# Event Processing & Ingestion Guarantees

## Ingestion Architecture

### 1. Idempotency Guarantees
Every event contains an immutable `eventId` (UUID). The ingestion layer checks incoming IDs against an in-memory hash set of recently processed IDs. Duplicate events are silently dropped from state mutation and recorded with a `Duplicate Event Dropped` audit entry.

### 2. Event-Time vs Ingestion-Time
Distributed networks frequently introduce variable transit delays. FinOps Sentinel separates:
- `timestamp`: The logical moment the event occurred at the cloud resource or CI/CD runner.
- `ingestionTime`: The moment the event reached the Sentinel reconciliation pipeline.
All statistical baselines, timelines, and anomaly evaluations sort events by `timestamp`, ensuring causal consistency.

### 3. Late Event Handling
Events arriving with timestamps older than the newest event in memory are accepted up to a configurable window (e.g. 4 hours). They are spliced into the chronological event buffer, dynamically updating baseline statistics.

### 4. Deterministic Event Replay
Operators can replay any time slice of historical events. Because scoring functions and baselines are pure functions of ordered event history, the resulting anomaly scores and attribution state remain 100% deterministic after replay.
