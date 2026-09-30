import type { Inspection } from "../data/inspections";
import {
  INSPECTION_DATABASE_NAME,
  INSPECTION_DATABASE_VERSION,
  INSPECTION_STORES,
  isInspectionConflict,
  isStoredInspection,
  isSyncOperation,
  upgradeInspectionDatabase,
  type InspectionConflict,
  type StoredInspection,
  type SyncOperation
} from "./schema";
import type { SyncQueueStore } from "../sync/queue";

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb-request-failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("indexeddb-transaction-failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("indexeddb-transaction-aborted"));
  });
}

export function openInspectionDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INSPECTION_DATABASE_NAME, INSPECTION_DATABASE_VERSION);
    request.onupgradeneeded = () => upgradeInspectionDatabase(request.result, request.transaction!);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb-open-failed"));
  });
}

/** Browser-backed store. It deliberately contains no remote transport logic. */
export class IndexedDbInspectionStore implements SyncQueueStore {
  constructor(private readonly database: IDBDatabase) {}

  async listInspections(): Promise<StoredInspection[]> {
    const transaction = this.database.transaction(INSPECTION_STORES.inspections, "readonly");
    const values = await requestResult(transaction.objectStore(INSPECTION_STORES.inspections).getAll());
    await transactionDone(transaction);
    return values.filter(isStoredInspection).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listConflicts(): Promise<InspectionConflict[]> {
    const transaction = this.database.transaction(INSPECTION_STORES.conflicts, "readonly");
    const values = await requestResult(transaction.objectStore(INSPECTION_STORES.conflicts).getAll());
    await transactionDone(transaction);
    return values.filter(isInspectionConflict);
  }

  async listOperations(): Promise<SyncOperation[]> {
    const transaction = this.database.transaction(INSPECTION_STORES.syncQueue, "readonly");
    const values = await requestResult(transaction.objectStore(INSPECTION_STORES.syncQueue).getAll());
    await transactionDone(transaction);
    return values.filter(isSyncOperation);
  }

  async getInspection(id: string): Promise<StoredInspection | null> {
    const transaction = this.database.transaction(INSPECTION_STORES.inspections, "readonly");
    const value = await requestResult(transaction.objectStore(INSPECTION_STORES.inspections).get(id));
    await transactionDone(transaction);
    return isStoredInspection(value) ? value : null;
  }

  async saveInspection(inspection: StoredInspection): Promise<void> { await this.put(INSPECTION_STORES.inspections, inspection); }
  async saveOperation(operation: SyncOperation): Promise<void> { await this.put(INSPECTION_STORES.syncQueue, operation); }
  async saveConflict(conflict: InspectionConflict): Promise<void> { await this.put(INSPECTION_STORES.conflicts, conflict); }

  async deleteOperation(idempotencyKey: string): Promise<void> {
    const transaction = this.database.transaction(INSPECTION_STORES.syncQueue, "readwrite");
    transaction.objectStore(INSPECTION_STORES.syncQueue).delete(idempotencyKey);
    await transactionDone(transaction);
  }

  private async put(storeName: string, value: StoredInspection | SyncOperation | InspectionConflict): Promise<void> {
    const transaction = this.database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(value);
    await transactionDone(transaction);
  }
}

export function createStoredInspection(inspection: Inspection, idempotencyKey: string, now: string): StoredInspection {
  return { id: inspection.id, inspection, syncStatus: "pending", localRevision: 1, serverRevision: null, baseServerRevision: null, updatedAt: now, idempotencyKey };
}
