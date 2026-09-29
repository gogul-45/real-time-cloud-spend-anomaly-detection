import { NextResponse } from 'next/server';

export async function GET() {
  const openapiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'FinOps Sentinel — Cloud Spend Anomaly Detection & Response API',
      version: '1.0.0',
      description: 'Production-ready REST API for real-time cloud billing ingestion, multi-signal anomaly detection, incident response, and governance.',
      contact: {
        name: 'FinOps Platform Engineering',
        email: 'finops-eng@cloudsentinel.io'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Primary FinOps Sentinel API'
      }
    ],
    paths: {
      '/health': {
        get: {
          summary: 'System Health & Readiness Probe',
          description: 'Returns health status of the detection engine, ingestion pipeline, database, and system memory.',
          responses: {
            '200': {
              description: 'System is healthy and operational'
            }
          }
        }
      },
      '/metrics': {
        get: {
          summary: 'Prometheus Metrics Exposition',
          description: 'Returns real-time telemetry, detection latencies, and active counters in Prometheus text format or JSON.',
          parameters: [
            {
              name: 'format',
              in: 'query',
              schema: { type: 'string', enum: ['prometheus', 'json'] }
            }
          ],
          responses: {
            '200': {
              description: 'Metrics exposition output'
            }
          }
        }
      },
      '/dashboard': {
        get: {
          summary: 'Dashboard Telemetry & KPIs',
          description: 'Returns spend rates, active anomalies, detection latencies, and recent stream events.'
        }
      },
      '/anomalies': {
        get: {
          summary: 'List Detected Anomalies',
          description: 'Returns list of all active and resolved cost anomalies with evidence and attribution.'
        }
      },
      '/events': {
        get: {
          summary: 'Query Ingested Domain Events',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['billing', 'resource', 'deployment', 'workload', 'all'] } }
          ]
        },
        post: {
          summary: 'Ingest Real-Time Event',
          description: 'Ingests billing, scaling, or deployment events with idempotency and watermark validation.'
        }
      },
      '/simulate': {
        post: {
          summary: 'Simulate Scenario Injection',
          description: 'Injects synthetic runaway GPU leak, legitimate scaling, out-of-order arrival, or delayed billing.'
        }
      },
      '/override': {
        post: {
          summary: 'Execute FinOps Manual Override',
          description: 'Approve, reject, or acknowledge an automated containment action with an audit trail.'
        }
      },
      '/adapters': {
        get: {
          summary: 'Query Active Cloud Provider Adapter',
          description: 'Returns active provider (AWS, Azure, GCP, Simulator) and test connection latency.'
        },
        post: {
          summary: 'Switch Active Cloud Adapter',
          description: 'Switches the provider between AWS CUR, Azure Cost API, GCP BigQuery, or Simulator.'
        }
      },
      '/monitoring': {
        get: {
          summary: 'Detector Health & Concept Drift',
          description: 'Returns statistical drift KS tests, ROC calibration points, and SLA conformance.'
        }
      },
      '/reports/rca': {
        get: {
          summary: 'Generate Root Cause Analysis (RCA) Post-Mortem',
          parameters: [
            { name: 'id', in: 'query', schema: { type: 'string' } },
            { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'markdown'] } }
          ]
        }
      },
      '/governance': {
        get: {
          summary: 'Data Retention Policies & PII Masking Status'
        },
        post: {
          summary: 'Trigger Retention Purge Simulation or PII Masking'
        }
      }
    }
  };

  return NextResponse.json(openapiSpec);
}
