# Real-Time Cloud Spend Anomaly Detection & Response System

## Project Overview

A prototype for a near real-time cloud spend anomaly detection system tailored for a media platform dealing with highly variable workloads (live streaming, video transcoding, etc.). 

Traditional cloud budget alerts are typically calculated daily or monthly, resulting in delayed notifications. By the time an alert is received, a significant amount of money may have been wasted due to runaway scaling, redundant resources, or unauthorized deployments.

This system monitors multiple continuous data streams (billing, resources, deployments, and workloads), detects cost anomalies instantly using statistical baselining, attributes the spike to specific resources and deployments, and notifies an accountable owner with actionable evidence in seconds rather than hours.

This represents the **35% project milestone**.

## Architecture

The system is a full-stack Next.js web application implementing an event-driven architecture pattern:

*   **Frontend**: React (Next.js App Router), Tailwind CSS, Recharts for data visualization.
*   **State Management & Engine**: Zustand store containing an in-memory event bus and reconciliation layer.
*   **Data Ingestion**: Processes 4 streams:
    *   Hourly Billing Stream
    *   Resource Change Events
    *   Deployment Events
    *   Workload Metrics
*   **Detection Engine**: Calculates a rolling statistical baseline (using standard deviation/z-score and percentage increases).
*   **Attribution Engine**: Correlates billing anomalies with recent resource scaling and application deployments.

## Technology Stack

*   React 19
*   Next.js 15 (App Router)
*   TypeScript
*   Tailwind CSS (v4)
*   Zustand (State Management)
*   Recharts (Data Visualization)
*   Lucide React (Icons)
*   date-fns (Date manipulation)

## How to Install and Run

1.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

2.  **Run the development server:**
    \`\`\`bash
    npm run dev
    \`\`\`
    The application will be available at \`http://localhost:3000\`.

## 35% Milestone Achieved

This prototype fully demonstrates:
*   Real-time event ingestion simulation.
*   Rolling baseline calculation (Z-score and Percentage difference).
*   Attribution of anomalies to specific resources and deployments.
*   Evidence generation (comparing resource growth vs workload growth).
*   Simulated owner notification.
*   Manual override workflow with a persistent Audit Trail.
*   Resilience testing against edge cases (duplicates, delayed events, out-of-order events).
*   Experiment tracking (TP/FP/TN/FN).

## Demonstration Flow (Demo Instructions)

1.  Open the application. The **Dashboard** is pre-loaded with 24 hours of normal synthetic background data, followed by a sudden CRITICAL anomaly at the end of the timeline.
2.  Observe the KPI cards showing the latency metrics (< 5s detection, < 30s notification) vs the baseline (60 mins).
3.  Click "Investigate" on the CRITICAL anomaly in the Recent Anomalies table.
4.  On the **Anomaly Details** page, review the Explanation, identifying that GPU scaling increased 4x, but workload only increased by 19%.
5.  Click **Manual Override**, enter a reason, and approve the recommended rollback action.
6.  Navigate to the **Audit Trail** to see the immutable record of your decision.
7.  Navigate to the **Event Stream** and use the **Data Ingestion Simulator** to inject a cost spike live and watch the system react in real time.
8.  Navigate to **Failure Tests** to run distributed-system edge-case simulations (Duplicate events, delayed events).

## Detection Methodology

The system uses a rolling 24-hour historical window. For every incoming billing event, it calculates the mean ($\mu$) and standard deviation ($\sigma$) of the previous 24 hours for that specific resource.
*   **Z-Score**: $z = (x - \mu) / \sigma$
*   **Percentage Increase**: $p = ((x - \mu) / \mu) * 100$

An event is flagged as **CRITICAL** if $p > 100\%$ AND $z > 2.0$. Configurable thresholds determine HIGH and WARNING severities.

## Edge-Case Handling

*   **Duplicate Events**: Events are uniquely identified by a UUID. The ingestion layer checks for existing IDs and drops duplicates.
*   **Delayed/Out-of-Order Events**: The store sorts events by their logical \`timestamp\` rather than arrival time, ensuring that delayed resource changes correctly correlate with subsequent billing events.

## Future Extension (Remaining 65%)

For the remaining project milestones, this prototype will be extended with:
*   Real cloud provider billing API integration (e.g., AWS Cost Explorer API, GCP Cloud Billing API).
*   Kafka/PubSub event streaming instead of in-memory ingestion.
*   Persistent production database (PostgreSQL/Cloud SQL).
*   Advanced ML-based anomaly detection (Isolation Forests or Autoencoders) instead of simple Z-score.
*   Real notification integrations (Slack, PagerDuty, Email).
*   Authentication and Role-Based Access Control (RBAC).
