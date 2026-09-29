import { BillingEvent, ResourceChangeEvent, DeploymentEvent, WorkloadMetric } from '@/types';

export interface IngestionResult<T> {
  success: boolean;
  status: 'ACCEPTED' | 'DUPLICATE_REJECTED' | 'WATERMARK_REJECTED' | 'INVALID_PAYLOAD';
  event?: T;
  dedupHash?: string;
  error?: string;
}

export class EventIngestionPipeline {
  private deduplicationCache: Set<string> = new Set();
  private lateEventWatermarkMs: number;

  constructor(maxLateHours = 24) {
    this.lateEventWatermarkMs = maxLateHours * 3600 * 1000;
  }

  /**
   * Generates a deterministic idempotency hash from event attributes
   */
  private generateEventHash(event: { eventId?: string; timestamp?: number; resourceId?: string; hourlyCost?: number }): string {
    if (event.eventId) return event.eventId;
    return `${event.timestamp || 0}-${event.resourceId || 'anon'}-${event.hourlyCost || 0}`;
  }

  /**
   * Ingest and validate a billing event
   */
  public ingestBilling(event: Partial<BillingEvent>, currentClock = Date.now()): IngestionResult<BillingEvent> {
    if (!event.resourceId || !event.timestamp || typeof event.hourlyCost !== 'number' || event.hourlyCost < 0) {
      return {
        success: false,
        status: 'INVALID_PAYLOAD',
        error: 'Validation failed: resourceId, timestamp, and positive hourlyCost are required.'
      };
    }

    const hash = this.generateEventHash(event);
    if (this.deduplicationCache.has(hash)) {
      return {
        success: false,
        status: 'DUPLICATE_REJECTED',
        dedupHash: hash,
        error: `Idempotency violation: Event [${hash}] has already been ingested.`
      };
    }

    // Check watermark (allow delayed events up to watermark threshold, but reject prehistoric data)
    if (currentClock - event.timestamp > this.lateEventWatermarkMs) {
      return {
        success: false,
        status: 'WATERMARK_REJECTED',
        error: `Watermark violation: Event timestamp is older than ${this.lateEventWatermarkMs / 3600000}h limit.`
      };
    }

    this.deduplicationCache.add(hash);

    const normalized: BillingEvent = {
      eventId: event.eventId || `bil-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: event.timestamp,
      ingestionTime: Date.now(),
      service: event.service || 'UnknownService',
      resourceId: event.resourceId,
      resourceName: event.resourceName || event.resourceId,
      region: event.region || 'us-east-1',
      environment: event.environment || 'production',
      deploymentId: event.deploymentId,
      workloadType: event.workloadType || 'generic-compute',
      hourlyCost: event.hourlyCost,
      cumulativeCost: event.cumulativeCost || event.hourlyCost,
      source: event.source || 'ingest-api',
    };

    return {
      success: true,
      status: 'ACCEPTED',
      event: normalized,
      dedupHash: hash
    };
  }

  public getCacheSize(): number {
    return this.deduplicationCache.size;
  }

  public clearCache(): void {
    this.deduplicationCache.clear();
  }
}

export const globalIngestionPipeline = new EventIngestionPipeline();
