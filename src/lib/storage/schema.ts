import type { Inspection } from "../data/inspections";

export const INSPECTION_DATABASE_NAME = "pwa-inspections";
export const INSPECTION_DATABASE_VERSION = 1;

export const INSPECTION_STORES = {
  inspections: "inspections",
  syncQueue: "syncQueue",
  conflicts: "conflicts"
} as const;

export type InspectionSyncStatus = "pending" | "synced" | "conflict";

export type StoredInspection = {
  id: string;
  inspection: Inspection;
  syncStatus: InspectionSyncStatus;
  localRevision: number;
  serverRevision: number | null;
  baseServerRevision: number | null;
  updatedAt: string;
  idempotencyKey: string;
};

export type SyncOperation = {
  idempotencyKey: string;
  inspectionId: string;
  payload: Inspection;
  baseServerRevision: number | null;
  createdAt: string;
  attempts: number;
};

export type RemoteInspection = {
  inspection: Inspection;
  revision: number;
};

export type InspectionConflict = {
  conflictId: string;
  inspectionId: string;
  localSnapshot: Inspection;
  remoteSnapshot: Inspection;
  localRevision: number;
  expectedServerRevision: number | null;
  remoteRevision: number;
  detectedAt: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isRevision = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

const isTimestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  (() => {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
    if (!match || !isCalendarDate(match[1]) || Number.isNaN(Date.parse(value))) return false;

    const [, , hour, minute, second, , offsetHour = "0", offsetMinute = "0"] = match;
    const offsetHours = Number(offsetHour);
    const offsetMinutes = Number(offsetMinute);
    return Number(hour) <= 23 && Number(minute) <= 59 && Number(second) <= 59 &&
      offsetHours <= 14 && offsetMinutes <= 59 && (offsetHours < 14 || offsetMinutes === 0);
  })();

const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
};

export function isInspection(value: unknown): value is Inspection {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.location) &&
    isCalendarDate(value.date) &&
    isNonEmptyString(value.inspector) &&
    (value.status === "ok" || value.status === "attention") &&
    typeof value.statusLabel === "string" &&
    Number.isSafeInteger(value.findings) &&
    (value.findings as number) >= 0 &&
    typeof value.summary === "string"
  );
}

export function isStoredInspection(value: unknown): value is StoredInspection {
  if (!isRecord(value) || !isInspection(value.inspection)) return false;

  return (
    value.id === value.inspection.id &&
    (value.syncStatus === "pending" || value.syncStatus === "synced" || value.syncStatus === "conflict") &&
    isRevision(value.localRevision) &&
    (value.serverRevision === null || isRevision(value.serverRevision)) &&
    (value.baseServerRevision === null || isRevision(value.baseServerRevision)) &&
    isTimestamp(value.updatedAt) &&
    isNonEmptyString(value.idempotencyKey)
  );
}

export function isSyncOperation(value: unknown): value is SyncOperation {
  if (!isRecord(value) || !isInspection(value.payload)) return false;

  return (
    isNonEmptyString(value.idempotencyKey) &&
    value.inspectionId === value.payload.id &&
    (value.baseServerRevision === null || isRevision(value.baseServerRevision)) &&
    isTimestamp(value.createdAt) &&
    Number.isSafeInteger(value.attempts) &&
    (value.attempts as number) >= 0
  );
}

export function isInspectionConflict(value: unknown): value is InspectionConflict {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.conflictId) &&
    isNonEmptyString(value.inspectionId) &&
    isInspection(value.localSnapshot) &&
    value.localSnapshot.id === value.inspectionId &&
    isInspection(value.remoteSnapshot) &&
    value.remoteSnapshot.id === value.inspectionId &&
    isRevision(value.localRevision) &&
    (value.expectedServerRevision === null || isRevision(value.expectedServerRevision)) &&
    isRevision(value.remoteRevision) &&
    isTimestamp(value.detectedAt)
  );
}

function ensureIndex(store: IDBObjectStore, name: string, keyPath: string): void {
  if (!store.indexNames.contains(name)) {
    store.createIndex(name, keyPath, { unique: false });
  }
}

function getOrCreateStore(
  database: IDBDatabase,
  transaction: IDBTransaction,
  name: string,
  keyPath: string
): IDBObjectStore {
  return database.objectStoreNames.contains(name)
    ? transaction.objectStore(name)
    : database.createObjectStore(name, { keyPath });
}

export function upgradeInspectionDatabase(database: IDBDatabase, transaction: IDBTransaction): void {
  const inspections = getOrCreateStore(database, transaction, INSPECTION_STORES.inspections, "id");
  ensureIndex(inspections, "syncStatus", "syncStatus");
  ensureIndex(inspections, "updatedAt", "updatedAt");

  const queue = getOrCreateStore(database, transaction, INSPECTION_STORES.syncQueue, "idempotencyKey");
  ensureIndex(queue, "inspectionId", "inspectionId");
  ensureIndex(queue, "createdAt", "createdAt");

  const conflicts = getOrCreateStore(database, transaction, INSPECTION_STORES.conflicts, "conflictId");
  ensureIndex(conflicts, "inspectionId", "inspectionId");
  ensureIndex(conflicts, "detectedAt", "detectedAt");
}

export function isRemoteInspection(value: unknown): value is RemoteInspection {
  return isRecord(value) && isInspection(value.inspection) && isRevision(value.revision);
}