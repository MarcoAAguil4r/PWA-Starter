import type { RemoteInspection, SyncOperation } from "../storage/schema";
import type { SyncTransportResult } from "./queue";

type AppliedOperation = {
  fingerprint: string;
  result: SyncTransportResult;
};

export class InMemoryInspectionSyncServer {
  private readonly inspections = new Map<string, RemoteInspection>();
  private readonly operations = new Map<string, AppliedOperation>();

  apply(operation: SyncOperation): SyncTransportResult {
    const fingerprint = JSON.stringify([
      operation.inspectionId,
      operation.payload,
      operation.baseServerRevision
    ]);
    const previous = this.operations.get(operation.idempotencyKey);

    if (previous) {
      return previous.fingerprint === fingerprint
        ? previous.result
        : { ok: false, retryable: false, reason: "idempotency-key-reused" };
    }

    const current = this.inspections.get(operation.inspectionId);
    if ((current?.revision ?? null) !== operation.baseServerRevision) {
      if (!current) {
        return { ok: false, retryable: false, reason: "remote-inspection-not-found" };
      }

      const result: SyncTransportResult = { ok: true, remote: current };
      this.operations.set(operation.idempotencyKey, { fingerprint, result });
      return result;
    }

    const remote: RemoteInspection = {
      inspection: operation.payload,
      revision: (current?.revision ?? 0) + 1
    };
    const result: SyncTransportResult = { ok: true, remote };
    this.inspections.set(operation.inspectionId, remote);
    this.operations.set(operation.idempotencyKey, { fingerprint, result });
    return result;
  }

  getInspection(inspectionId: string): RemoteInspection | null {
    return this.inspections.get(inspectionId) ?? null;
  }
}

type SyncGlobal = typeof globalThis & {
  __inspectionSyncServer?: InMemoryInspectionSyncServer;
};

const globalForSync = globalThis as SyncGlobal;

export const inspectionSyncServer =
  globalForSync.__inspectionSyncServer ??= new InMemoryInspectionSyncServer();