import { BillingEvent, ResourceChangeEvent, DeploymentEvent, WorkloadMetric } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Universal Cloud Provider Interfaces
 */
export type CloudProviderType = 'SIMULATOR' | 'AWS' | 'AZURE' | 'GCP';

export interface RawAWSBillingRecord {
  lineItem_ResourceId: string;
  lineItem_ProductCode: string;
  lineItem_UsageStartDate: string;
  lineItem_UnblendedCost: number;
  product_region: string;
  resourceTags_user_Environment?: string;
  resourceTags_user_Application?: string;
  resourceTags_user_DeploymentId?: string;
}

export interface RawAzureCostRecord {
  resourceId: string;
  serviceName: string;
  usageDateTime: string;
  preTaxCost: number;
  resourceLocation: string;
  tags?: {
    Environment?: string;
    Application?: string;
    DeploymentId?: string;
  };
}

export interface RawGCPBillingRecord {
  resource_global_name: string;
  service_description: string;
  usage_start_time: string;
  cost: number;
  location_region: string;
  labels?: Array<{ key: string; value: string }>;
}

export interface CloudBillingProvider {
  providerType: CloudProviderType;
  providerName: string;
  fetchBillingEvents(): Promise<BillingEvent[]>;
  normalizeBillingRecord(raw: unknown): BillingEvent;
  testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}

export interface CloudResourceProvider {
  providerType: CloudProviderType;
  fetchResourceChanges(): Promise<ResourceChangeEvent[]>;
  normalizeResourceRecord(raw: unknown): ResourceChangeEvent;
}

export interface CloudDeploymentProvider {
  providerType: CloudProviderType;
  fetchDeployments(): Promise<DeploymentEvent[]>;
  normalizeDeploymentRecord(raw: unknown): DeploymentEvent;
}

export interface CloudWorkloadProvider {
  providerType: CloudProviderType;
  fetchWorkloadMetrics(): Promise<WorkloadMetric[]>;
  normalizeWorkloadRecord(raw: unknown): WorkloadMetric;
}

/**
 * Simulator Provider Implementation (Default synthetic testbed)
 */
export class SimulatorAdapter implements CloudBillingProvider, CloudResourceProvider, CloudDeploymentProvider, CloudWorkloadProvider {
  providerType: CloudProviderType = 'SIMULATOR';
  providerName = 'Synthetic Engine (FinOps Testbed)';

  async fetchBillingEvents(): Promise<BillingEvent[]> {
    const now = Date.now();
    return [
      {
        eventId: `sim-bil-${uuidv4().slice(0, 8)}`,
        timestamp: now - 3600000,
        service: 'Compute Engine',
        resourceId: 'GPU-TRANSCODER-07',
        resourceName: 'transcoder-worker-gpu-pool',
        region: 'us-east-1',
        environment: 'production',
        workloadType: 'video-transcoding',
        hourlyCost: 186.40,
        cumulativeCost: 1450.20,
        deploymentId: 'video-transcoder-v42',
      }
    ];
  }

  normalizeBillingRecord(raw: unknown): BillingEvent {
    return raw as BillingEvent;
  }

  async fetchResourceChanges(): Promise<ResourceChangeEvent[]> {
    return [];
  }

  normalizeResourceRecord(raw: unknown): ResourceChangeEvent {
    return raw as ResourceChangeEvent;
  }

  async fetchDeployments(): Promise<DeploymentEvent[]> {
    return [];
  }

  normalizeDeploymentRecord(raw: unknown): DeploymentEvent {
    return raw as DeploymentEvent;
  }

  async fetchWorkloadMetrics(): Promise<WorkloadMetric[]> {
    return [];
  }

  normalizeWorkloadRecord(raw: unknown): WorkloadMetric {
    return raw as WorkloadMetric;
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: true,
      latencyMs: 14,
      message: 'Simulator generator engine operational. Synthetic events ready for stream.'
    };
  }
}

/**
 * Mock AWS Provider (Transforms AWS CUR, CloudWatch, and CloudTrail)
 */
export class MockAWSAdapter implements CloudBillingProvider, CloudResourceProvider, CloudDeploymentProvider, CloudWorkloadProvider {
  providerType: CloudProviderType = 'AWS';
  providerName = 'Amazon Web Services (CUR & CloudWatch)';

  normalizeBillingRecord(raw: unknown): BillingEvent {
    const rec = raw as RawAWSBillingRecord;
    const ts = rec.lineItem_UsageStartDate ? new Date(rec.lineItem_UsageStartDate).getTime() : Date.now();
    return {
      eventId: `aws-cur-${uuidv4().slice(0, 8)}`,
      timestamp: ts,
      ingestionTime: Date.now(),
      source: 'AWS Cost & Usage Report (S3/Athena)',
      service: rec.lineItem_ProductCode || 'AmazonEC2',
      resourceId: rec.lineItem_ResourceId || 'i-07f89b41a9c1',
      resourceName: rec.lineItem_ResourceId ? rec.lineItem_ResourceId.split('/').pop() || rec.lineItem_ResourceId : 'ec2-p3-gpu-worker',
      region: rec.product_region || 'us-east-1',
      environment: rec.resourceTags_user_Environment || 'production',
      workloadType: 'gpu-accelerated-compute',
      hourlyCost: Number(rec.lineItem_UnblendedCost) || 0,
      cumulativeCost: (Number(rec.lineItem_UnblendedCost) || 0) * 12,
      deploymentId: rec.resourceTags_user_DeploymentId || undefined,
    };
  }

  async fetchBillingEvents(): Promise<BillingEvent[]> {
    const now = Date.now();
    const sampleAWSRecords: RawAWSBillingRecord[] = [
      {
        lineItem_ResourceId: 'arn:aws:ec2:us-east-1:123456789012:instance/i-0a88bf79b',
        lineItem_ProductCode: 'AmazonEC2',
        lineItem_UsageStartDate: new Date(now - 3600000).toISOString(),
        lineItem_UnblendedCost: 194.20,
        product_region: 'us-east-1',
        resourceTags_user_Environment: 'production',
        resourceTags_user_Application: 'media-transcoder',
        resourceTags_user_DeploymentId: 'deploy-aws-v42',
      },
      {
        lineItem_ResourceId: 'arn:aws:rds:us-east-1:123456789012:db:postgres-prod-master',
        lineItem_ProductCode: 'AmazonRDS',
        lineItem_UsageStartDate: new Date(now - 3600000).toISOString(),
        lineItem_UnblendedCost: 45.60,
        product_region: 'us-east-1',
        resourceTags_user_Environment: 'production',
        resourceTags_user_Application: 'user-db',
      }
    ];

    return sampleAWSRecords.map(r => this.normalizeBillingRecord(r));
  }

  async fetchResourceChanges(): Promise<ResourceChangeEvent[]> {
    return [
      {
        eventId: `aws-trail-${uuidv4().slice(0, 8)}`,
        timestamp: Date.now() - 3600000 - 15 * 60000,
        source: 'AWS CloudTrail (AutoScaling:UpdateAutoScalingGroup)',
        resourceId: 'arn:aws:ec2:us-east-1:123456789012:instance/i-0a88bf79b',
        resourceType: 'EC2 AutoScaling Group (p3.8xlarge)',
        changeType: 'DESIRED_CAPACITY_SCALE_OUT',
        previousValue: '2 instances',
        newValue: '8 instances',
        changedBy: 'iam:role/k8s-cluster-autoscaler',
      }
    ];
  }

  normalizeResourceRecord(raw: unknown): ResourceChangeEvent {
    return raw as ResourceChangeEvent;
  }

  async fetchDeployments(): Promise<DeploymentEvent[]> {
    return [
      {
        eventId: `aws-deploy-${uuidv4().slice(0, 8)}`,
        deploymentId: 'deploy-aws-v42',
        timestamp: Date.now() - 3600000 - 22 * 60000,
        source: 'AWS CodeDeploy',
        application: 'media-transcoder',
        version: 'v4.2.0-rc3',
        environment: 'production',
        owner: 'media-platform-eng@company.com',
        changeSummary: 'Upgraded FFmpeg pipeline with AV1 multi-threaded GPU encoder flag',
      }
    ];
  }

  normalizeDeploymentRecord(raw: unknown): DeploymentEvent {
    return raw as DeploymentEvent;
  }

  async fetchWorkloadMetrics(): Promise<WorkloadMetric[]> {
    return [
      {
        eventId: `aws-cw-${uuidv4().slice(0, 8)}`,
        timestamp: Date.now() - 3600000,
        source: 'AWS CloudWatch Metrics',
        workloadType: 'media-transcoder',
        jobsPerHour: 1420,
        activeStreams: 280,
        cpuUtilization: 78.4,
        gpuUtilization: 94.2,
        queueDepth: 42,
        processingTime: 18.2,
      }
    ];
  }

  normalizeWorkloadRecord(raw: unknown): WorkloadMetric {
    return raw as WorkloadMetric;
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: true,
      latencyMs: 78,
      message: 'AWS S3 CUR Bucket [finops-cur-prod-us-east-1] connected. Athena partitions validated.'
    };
  }
}

/**
 * Mock Azure Provider (Transforms Azure Cost Management API & Azure Monitor)
 */
export class MockAzureAdapter implements CloudBillingProvider, CloudResourceProvider, CloudDeploymentProvider, CloudWorkloadProvider {
  providerType: CloudProviderType = 'AZURE';
  providerName = 'Microsoft Azure (Cost Management API)';

  normalizeBillingRecord(raw: unknown): BillingEvent {
    const rec = raw as RawAzureCostRecord;
    const ts = rec.usageDateTime ? new Date(rec.usageDateTime).getTime() : Date.now();
    return {
      eventId: `az-cost-${uuidv4().slice(0, 8)}`,
      timestamp: ts,
      ingestionTime: Date.now(),
      source: 'Azure Cost Management Export',
      service: rec.serviceName || 'Virtual Machines',
      resourceId: rec.resourceId || '/subscriptions/sub-1/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/vm-gpu-01',
      resourceName: rec.resourceId ? rec.resourceId.split('/').pop() || rec.resourceId : 'vm-gpu-cluster',
      region: rec.resourceLocation || 'eastus',
      environment: rec.tags?.Environment || 'production',
      workloadType: 'azure-aks-gpu',
      hourlyCost: Number(rec.preTaxCost) || 0,
      cumulativeCost: (Number(rec.preTaxCost) || 0) * 10,
      deploymentId: rec.tags?.DeploymentId || undefined,
    };
  }

  async fetchBillingEvents(): Promise<BillingEvent[]> {
    const now = Date.now();
    const sampleAzureRecords: RawAzureCostRecord[] = [
      {
        resourceId: '/subscriptions/1234-abcd/resourceGroups/rg-media-prod/providers/Microsoft.Compute/virtualMachines/vm-nc6s-v3',
        serviceName: 'Virtual Machines (NC6s_v3 Tesla V100)',
        usageDateTime: new Date(now - 3600000).toISOString(),
        preTaxCost: 178.90,
        resourceLocation: 'eastus',
        tags: {
          Environment: 'production',
          Application: 'video-rendering-azure',
          DeploymentId: 'azure-rel-42'
        }
      }
    ];
    return sampleAzureRecords.map(r => this.normalizeBillingRecord(r));
  }

  async fetchResourceChanges(): Promise<ResourceChangeEvent[]> {
    return [
      {
        eventId: `az-act-${uuidv4().slice(0, 8)}`,
        timestamp: Date.now() - 3600000 - 18 * 60000,
        source: 'Azure Activity Log (Microsoft.Compute/virtualMachineScaleSets/write)',
        resourceId: '/subscriptions/1234-abcd/resourceGroups/rg-media-prod/providers/Microsoft.Compute/virtualMachines/vm-nc6s-v3',
        resourceType: 'Azure VMSS (Standard_NC6s_v3)',
        changeType: 'VMSS_SCALE_OUT',
        previousValue: '3 nodes',
        newValue: '9 nodes',
        changedBy: 'azure-sp-k8s-autoscaler@tenant.onmicrosoft.com',
      }
    ];
  }

  normalizeResourceRecord(raw: unknown): ResourceChangeEvent {
    return raw as ResourceChangeEvent;
  }

  async fetchDeployments(): Promise<DeploymentEvent[]> {
    return [
      {
        eventId: `az-pipe-${uuidv4().slice(0, 8)}`,
        deploymentId: 'azure-rel-42',
        timestamp: Date.now() - 3600000 - 25 * 60000,
        source: 'Azure DevOps Pipelines',
        application: 'video-rendering-azure',
        version: 'release-2026.09.28',
        environment: 'production',
        owner: 'finops-azure-core@enterprise.com',
        changeSummary: 'Scaled rendering worker pool for high bitrate 4K video encoding',
      }
    ];
  }

  normalizeDeploymentRecord(raw: unknown): DeploymentEvent {
    return raw as DeploymentEvent;
  }

  async fetchWorkloadMetrics(): Promise<WorkloadMetric[]> {
    return [
      {
        eventId: `az-mon-${uuidv4().slice(0, 8)}`,
        timestamp: Date.now() - 3600000,
        source: 'Azure Monitor Metrics',
        workloadType: 'video-rendering-azure',
        jobsPerHour: 1380,
        activeStreams: 260,
        cpuUtilization: 72.1,
        gpuUtilization: 91.5,
        queueDepth: 35,
        processingTime: 19.5,
      }
    ];
  }

  normalizeWorkloadRecord(raw: unknown): WorkloadMetric {
    return raw as WorkloadMetric;
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: true,
      latencyMs: 92,
      message: 'Azure Resource Graph & Cost Details API (EA enrollment #49102) connected.'
    };
  }
}

/**
 * Mock GCP Provider (Transforms GCP Cloud Billing BigQuery Export & Cloud Monitoring)
 */
export class MockGCPAdapter implements CloudBillingProvider, CloudResourceProvider, CloudDeploymentProvider, CloudWorkloadProvider {
  providerType: CloudProviderType = 'GCP';
  providerName = 'Google Cloud Platform (BigQuery Billing Export)';

  normalizeBillingRecord(raw: unknown): BillingEvent {
    const rec = raw as RawGCPBillingRecord;
    const ts = rec.usage_start_time ? new Date(rec.usage_start_time).getTime() : Date.now();
    const envLabel = rec.labels?.find(l => l.key === 'env')?.value || 'production';
    const deployLabel = rec.labels?.find(l => l.key === 'deploy_id')?.value;
    return {
      eventId: `gcp-bq-${uuidv4().slice(0, 8)}`,
      timestamp: ts,
      ingestionTime: Date.now(),
      source: 'GCP Cloud Billing Export (BigQuery: gcp_billing_export_v1)',
      service: rec.service_description || 'Compute Engine',
      resourceId: rec.resource_global_name || '//compute.googleapis.com/projects/finops-prod/zones/us-central1-a/instances/gpu-worker-pool',
      resourceName: rec.resource_global_name ? rec.resource_global_name.split('/').pop() || rec.resource_global_name : 'gke-gpu-node-pool',
      region: rec.location_region || 'us-central1',
      environment: envLabel,
      workloadType: 'gcp-gke-gpu',
      hourlyCost: Number(rec.cost) || 0,
      cumulativeCost: (Number(rec.cost) || 0) * 14,
      deploymentId: deployLabel || undefined,
    };
  }

  async fetchBillingEvents(): Promise<BillingEvent[]> {
    const now = Date.now();
    const sampleGCPRecords: RawGCPBillingRecord[] = [
      {
        resource_global_name: '//compute.googleapis.com/projects/prod-ai/zones/us-central1-a/instances/a2-highgpu-1g',
        service_description: 'Compute Engine (NVIDIA A100 Tensor Core GPU)',
        usage_start_time: new Date(now - 3600000).toISOString(),
        cost: 182.50,
        location_region: 'us-central1',
        labels: [
          { key: 'env', value: 'production' },
          { key: 'app', value: 'video-transcoder' },
          { key: 'deploy_id', value: 'gcp-rel-v42' },
        ]
      }
    ];
    return sampleGCPRecords.map(r => this.normalizeBillingRecord(r));
  }

  async fetchResourceChanges(): Promise<ResourceChangeEvent[]> {
    return [
      {
        eventId: `gcp-audit-${uuidv4().slice(0, 8)}`,
        timestamp: Date.now() - 3600000 - 16 * 60000,
        source: 'GCP Cloud Audit Logs (compute.instances.insert)',
        resourceId: '//compute.googleapis.com/projects/prod-ai/zones/us-central1-a/instances/a2-highgpu-1g',
        resourceType: 'GKE NodePool (a2-highgpu-1g)',
        changeType: 'GKE_AUTOSCALER_NODE_ADD',
        previousValue: '2 nodes',
        newValue: '8 nodes',
        changedBy: 'serviceAccount:gke-cluster-autoscaler@prod-ai.iam.gserviceaccount.com',
      }
    ];
  }

  normalizeResourceRecord(raw: unknown): ResourceChangeEvent {
    return raw as ResourceChangeEvent;
  }

  async fetchDeployments(): Promise<DeploymentEvent[]> {
    return [
      {
        eventId: `gcp-cd-${uuidv4().slice(0, 8)}`,
        deploymentId: 'gcp-rel-v42',
        timestamp: Date.now() - 3600000 - 24 * 60000,
        source: 'Cloud Build / Cloud Deploy',
        application: 'video-transcoder',
        version: 'v4.2.0-gcp',
        environment: 'production',
        owner: 'transcoding-sre@company.com',
        changeSummary: 'Enabled real-time 4K A100 GPU transcoding pipeline for live events',
      }
    ];
  }

  normalizeDeploymentRecord(raw: unknown): DeploymentEvent {
    return raw as DeploymentEvent;
  }

  async fetchWorkloadMetrics(): Promise<WorkloadMetric[]> {
    return [
      {
        eventId: `gcp-mon-${uuidv4().slice(0, 8)}`,
        timestamp: Date.now() - 3600000,
        source: 'GCP Cloud Monitoring',
        workloadType: 'video-transcoder',
        jobsPerHour: 1410,
        activeStreams: 275,
        cpuUtilization: 76.5,
        gpuUtilization: 93.8,
        queueDepth: 40,
        processingTime: 18.8,
      }
    ];
  }

  normalizeWorkloadRecord(raw: unknown): WorkloadMetric {
    return raw as WorkloadMetric;
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: true,
      latencyMs: 64,
      message: 'Google Cloud BigQuery billing export [finops-prod.billing.gcp_billing_export] verified.'
    };
  }
}

/**
 * Universal Adapter Registry
 */
export const cloudAdapters: Record<CloudProviderType, CloudBillingProvider & CloudResourceProvider & CloudDeploymentProvider & CloudWorkloadProvider> = {
  SIMULATOR: new SimulatorAdapter(),
  AWS: new MockAWSAdapter(),
  AZURE: new MockAzureAdapter(),
  GCP: new MockGCPAdapter(),
};

export function getCloudAdapter(type: CloudProviderType) {
  return cloudAdapters[type] || cloudAdapters.SIMULATOR;
}
