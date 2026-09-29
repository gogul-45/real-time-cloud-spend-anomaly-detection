# Containerization & CI/CD Pipeline Documentation

## 1. Containerization Architecture (Docker)

FinOps Sentinel employs a **multi-stage production Docker build** using Node.js Alpine base images to minimize image footprint and maximize security.

### Multi-Stage Pipeline Stages:
1. **`deps` Stage**:
   - Copies `package.json` and lockfiles.
   - Installs dependencies with clean caching.
2. **`builder` Stage**:
   - Compiles TypeScript and runs Next.js production packaging (`npm run build`).
   - Generates optimized static assets and minified server-side artifacts.
3. **`runner` Stage**:
   - Employs a hardened minimal Alpine Linux environment.
   - Creates a dedicated non-root user (`nextjs:nodejs`, UID/GID 1001) to prevent container escape exploits.
   - Configures native Docker health check probes against `/api/health`.

### Compose Orchestration (`docker-compose.yml`)
- Automates container lifecycle, environment variable injection, and persistent volume mounting for SQLite database storage (`finops-data`).

## 2. Continuous Integration & Deployment (CI/CD)

The GitHub Actions workflow (`.github/workflows/ci.yml`) triggers on pull requests and pushes to `main`.

### Pipeline Jobs:
1. **`lint-and-typecheck`**:
   - Executes ESLint to prevent regression of React hook dependencies and strict TypeScript typing.
2. **`unit-and-integration-tests`**:
   - Executes `node tests/run-tests.mjs` verifying:
     - Rolling baseline calculations
     - Z-score outlier detection
     - Workload elasticity disparity
     - Composite ensemble score fusion
     - Idempotency deduplication
     - Chronological sorting
     - Cloud adapter normalizers
     - PII masking
     - Detection (<5s) and notification (<15s) latency SLAs
3. **`build-and-package`**:
   - Compiles Next.js production build to ensure bundle integrity.
