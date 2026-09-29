/**
 * Prometheus-compatible Metrics Registry for FinOps Sentinel
 */
export interface MetricCounter {
  name: string;
  help: string;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricGauge {
  name: string;
  help: string;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricHistogram {
  name: string;
  help: string;
  buckets: number[];
  counts: number[];
  sum: number;
  count: number;
}

class MetricsRegistry {
  private counters: Map<string, MetricCounter> = new Map();
  private gauges: Map<string, MetricGauge> = new Map();
  private startTime = Date.now();

  constructor() {
    this.initDefaultMetrics();
  }

  private initDefaultMetrics() {
    this.setGauge('finops_app_uptime_seconds', 'Uptime of FinOps Sentinel in seconds', 0);
    this.setGauge('finops_active_anomalies_count', 'Current number of active detected anomalies', 0);
    this.setGauge('finops_critical_anomalies_count', 'Current number of critical severity anomalies', 0);
    this.setGauge('finops_hourly_spend_rate_dollars', 'Current total monitored hourly cloud spend rate in USD', 0);
    this.setGauge('finops_detection_latency_seconds', 'Mean detection latency SLA measurement', 4.2);
    this.setGauge('finops_notification_latency_seconds', 'Mean notification dispatch latency in seconds', 12.5);
    this.setGauge('finops_model_drift_index', 'Concept drift coefficient calculated against baseline (0.0 - 1.0)', 0.12);
    
    this.incrementCounter('finops_events_ingested_total', 0);
    this.incrementCounter('finops_anomalies_detected_total', 0);
    this.incrementCounter('finops_overrides_executed_total', 0);
    this.incrementCounter('finops_notifications_dispatched_total', 0);
  }

  public incrementCounter(name: string, increment = 1, help = ''): void {
    const existing = this.counters.get(name) || {
      name,
      help: help || name,
      value: 0
    };
    existing.value += increment;
    this.counters.set(name, existing);
  }

  public setGauge(name: string, help: string, value: number): void {
    this.gauges.set(name, { name, help, value });
  }

  public exportPrometheusFormat(): string {
    const lines: string[] = [];
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    this.setGauge('finops_app_uptime_seconds', 'Uptime of FinOps Sentinel in seconds', uptimeSec);

    // Export Counters
    for (const [name, c] of this.counters.entries()) {
      lines.push(`# HELP ${name} ${c.help}`);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name} ${c.value}`);
    }

    // Export Gauges
    for (const [name, g] of this.gauges.entries()) {
      lines.push(`# HELP ${name} ${g.help}`);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name} ${g.value}`);
    }

    return lines.join('\n') + '\n';
  }

  public getSummaryJson() {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const counters: Record<string, number> = {};
    const gauges: Record<string, number> = {};

    this.counters.forEach((v, k) => { counters[k] = v.value; });
    this.gauges.forEach((v, k) => { gauges[k] = v.value; });
    gauges['finops_app_uptime_seconds'] = uptimeSec;

    return {
      uptimeSec,
      counters,
      gauges,
      timestamp: Date.now()
    };
  }
}

export const globalMetrics = new MetricsRegistry();
