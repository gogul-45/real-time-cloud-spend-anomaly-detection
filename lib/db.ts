import fs from 'node:fs';
import path from 'node:path';

// Database file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'finops.db');
const JSON_BACKUP_PATH = path.join(DATA_DIR, 'finops_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory fallback if node:sqlite fails on certain runtimes
let sqliteDb: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite');
  sqliteDb = new DatabaseSync(DB_PATH);
  
  // Initialize SQLite tables
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS billing_events (
      eventId TEXT PRIMARY KEY,
      timestamp INTEGER,
      ingestionTime INTEGER,
      source TEXT,
      sequenceNumber INTEGER,
      service TEXT,
      resourceId TEXT,
      resourceName TEXT,
      region TEXT,
      environment TEXT,
      deploymentId TEXT,
      workloadType TEXT,
      hourlyCost REAL,
      cumulativeCost REAL
    );

    CREATE TABLE IF NOT EXISTS resource_events (
      eventId TEXT PRIMARY KEY,
      timestamp INTEGER,
      ingestionTime INTEGER,
      source TEXT,
      sequenceNumber INTEGER,
      resourceId TEXT,
      resourceType TEXT,
      changeType TEXT,
      previousValue TEXT,
      newValue TEXT,
      changedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS deployment_events (
      eventId TEXT PRIMARY KEY,
      deploymentId TEXT,
      timestamp INTEGER,
      ingestionTime INTEGER,
      source TEXT,
      sequenceNumber INTEGER,
      application TEXT,
      version TEXT,
      environment TEXT,
      owner TEXT,
      changeSummary TEXT
    );

    CREATE TABLE IF NOT EXISTS workload_metrics (
      eventId TEXT PRIMARY KEY,
      timestamp INTEGER,
      ingestionTime INTEGER,
      source TEXT,
      sequenceNumber INTEGER,
      workloadType TEXT,
      jobsPerHour REAL,
      activeStreams REAL,
      cpuUtilization REAL,
      gpuUtilization REAL,
      queueDepth REAL,
      processingTime REAL
    );

    CREATE TABLE IF NOT EXISTS anomalies (
      anomalyId TEXT PRIMARY KEY,
      onsetTime INTEGER,
      detectionTime INTEGER,
      resourceId TEXT,
      service TEXT,
      severity TEXT,
      anomalyScore REAL,
      compositeScore REAL,
      owner TEXT,
      notificationTime INTEGER,
      notificationStatus TEXT,
      status TEXT,
      recommendedAction TEXT,
      acknowledgedBy TEXT,
      acknowledgedAt INTEGER,
      evidenceJson TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_trail (
      auditId TEXT PRIMARY KEY,
      timestamp INTEGER,
      actor TEXT,
      role TEXT,
      anomalyId TEXT,
      action TEXT,
      previousState TEXT,
      newState TEXT,
      reason TEXT,
      evidenceReference TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      notificationId TEXT PRIMARY KEY,
      anomalyId TEXT,
      recipient TEXT,
      ownerTeam TEXT,
      channel TEXT,
      timestamp INTEGER,
      deliveryStatus TEXT,
      latencyMs INTEGER,
      title TEXT,
      message TEXT
    );

    CREATE TABLE IF NOT EXISTS stakeholder_feedback (
      id TEXT PRIMARY KEY,
      timestamp INTEGER,
      author TEXT,
      role TEXT,
      organization TEXT,
      q1 INTEGER,
      q2 INTEGER,
      q3 INTEGER,
      q4 INTEGER,
      q5 INTEGER,
      q6 INTEGER,
      q7 INTEGER,
      comments TEXT
    );
  `);
} catch (err) {
  console.warn('SQLite initialization note: using fallback file storage.', err);
}

export interface PersistentStoreData {
  billingEvents: any[];
  resourceEvents: any[];
  deploymentEvents: any[];
  workloadMetrics: any[];
  anomalies: any[];
  auditTrail: any[];
  notifications: any[];
  stakeholderFeedback: any[];
  settings: any;
}

export function saveStateToFile(data: PersistentStoreData) {
  try {
    fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing json backup:', err);
  }
}

export function loadStateFromFile(): PersistentStoreData | null {
  try {
    if (fs.existsSync(JSON_BACKUP_PATH)) {
      const content = fs.readFileSync(JSON_BACKUP_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading json backup:', err);
  }
  return null;
}

export { sqliteDb };
