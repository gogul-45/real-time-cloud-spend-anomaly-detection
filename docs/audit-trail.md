# Immutable Audit Trail & Compliance Specification

## Architecture
- **Append-Only Ledger**: Log records cannot be edited or purged through standard API endpoints.
- **Record Schema**:
  - `auditId`: UUID string.
  - `timestamp`: UTC epoch milliseconds.
  - `actor`: User or automated microservice identifier.
  - `role`: RBAC persona (`OPERATOR`, `FINOPS_ANALYST`, `SERVICE_OWNER`, `ADMIN`).
  - `anomalyId`: Associated incident reference.
  - `action`: Semantic descriptor (e.g., `Manual Override`, `Status Transition`, `Duplicate Event Dropped`).
  - `reason`: Operator-provided justification or automated diagnostic note.
- **Export Support**: Full audit trails can be exported on-demand as standard CSV for SOC2 or internal corporate FinOps compliance reviews.
