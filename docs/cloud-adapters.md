# Cloud Provider Adapters Documentation

## 1. Overview
In enterprise cloud environments, FinOps teams manage multi-cloud infrastructure spanning Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Each provider utilizes distinct billing formats, delivery mechanisms, and resource tagging conventions.

FinOps Sentinel decouples detection and response logic from provider idiosyncrasies by introducing an abstraction layer (`lib/adapters/cloud-providers.ts`).

## 2. Common Provider Interfaces
Every provider implements four core contracts:
- `CloudBillingProvider`: Ingests and normalizes raw cloud invoice and usage meters.
- `CloudResourceProvider`: Normalizes autoscaling, node pool mutation, and VM provisioning events.
- `CloudDeploymentProvider`: Connects CI/CD release events (AWS CodeDeploy, Azure DevOps, Cloud Deploy) to resource pools.
- `CloudWorkloadProvider`: Normalizes application performance and throughput metrics (CloudWatch, Azure Monitor, GCP Cloud Monitoring).

## 3. Implementations

### AWS Adapter (`MockAWSAdapter`)
- **Ingestion Stream**: S3 Cost and Usage Report (CUR) partitioned in Athena.
- **Resource Tracking**: CloudTrail events (`AutoScaling:UpdateAutoScalingGroup`).
- **Telemetry**: Amazon CloudWatch metrics for EC2 and GPU instances.
- **Mapping**:
  - `lineItem_ProductCode` $\rightarrow$ `service`
  - `lineItem_ResourceId` $\rightarrow$ `resourceId`
  - `lineItem_UnblendedCost` $\rightarrow$ `hourlyCost`
  - `resourceTags_user_Environment` $\rightarrow$ `environment`

### Azure Adapter (`MockAzureAdapter`)
- **Ingestion Stream**: Azure Cost Management Details API exports.
- **Resource Tracking**: Azure Activity Logs (`Microsoft.Compute/virtualMachineScaleSets/write`).
- **Telemetry**: Azure Monitor host metrics.
- **Mapping**:
  - `serviceName` $\rightarrow$ `service`
  - `resourceId` $\rightarrow$ `resourceId`
  - `preTaxCost` $\rightarrow$ `hourlyCost`
  - `resourceLocation` $\rightarrow$ `region`

### GCP Adapter (`MockGCPAdapter`)
- **Ingestion Stream**: Google Cloud Billing export to BigQuery (`gcp_billing_export_v1`).
- **Resource Tracking**: Cloud Audit Logs (`compute.instances.insert`).
- **Telemetry**: Google Cloud Monitoring GKE metric descriptors.
- **Mapping**:
  - `service_description` $\rightarrow$ `service`
  - `resource_global_name` $\rightarrow$ `resourceId`
  - `cost` $\rightarrow$ `hourlyCost`
  - `location_region` $\rightarrow$ `region`

### Simulator Adapter (`SimulatorAdapter`)
- Generates high-velocity reproducible scenarios for testing, stress-testing, and demonstration.
