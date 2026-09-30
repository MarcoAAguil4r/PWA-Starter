import type { RemoteInspection, StoredInspection, SyncOperation } from "../storage/schema";
import type { ConflictDecision } from "./conflict-policy";

export interface SyncQueueStore {
  listOperations(): Promise<SyncOperation[]>;
  saveOperation(operation: SyncOperation): Promise<void>;
  deleteOperation(idempotencyKey: string): Promise<void>;
  getInspection(inspectionId: string): Promise<StoredInspection | null>;
  saveInspection(inspection: StoredInspection): Promise<void>;
}

export type SyncTransportResult =
  | { ok: true; remote: RemoteInspection }
  | { ok: false; retryable: boolean; reason: string };

export interface SyncTransport {
  send(operation: SyncOperation): Promise<SyncTransportResult>;
}

export interface RetryPolicy {
  maxAttempts: number;
}

export type ResolveConflict = (
  local: StoredInspection,
  remote: RemoteInspection,
  detectedAt: string
) => ConflictDecision;

export const DEFAULT_RETRY_POLICY: RetryPolicy = { maxAttempts: 5 };

export type QueueOutcome =
  | { idempotencyKey: string; kind: "synced" }
  | { idempotencyKey: string; kind: "already-applied" }
  | { idempotencyKey: string; kind: "conflict" }
  | { idempotencyKey: string; kind: "retry-scheduled"; attempts: number }
  | { idempotencyKey: string; kind: "abandoned"; reason: string };

export async function enqueueOperation(
  store: SyncQueueStore,
  operation: SyncOperation
): Promise<"enqueued" | "duplicate"> {
  const existing = await store.listOperations();
  if (existing.some((pending) => pending.idempotencyKey === operation.idempotencyKey)) {
    return "duplicate";
  }
  await store.saveOperation(operation);
  return "enqueued";
}

export async function processPendingOperations(
  store: SyncQueueStore,
  transport: SyncTransport,
  resolveConflict: ResolveConflict,
  now: () => string,
  retryPolicy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<QueueOutcome[]> {
  const pending = await store.listOperations();
  const ordered = [...pending].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const outcomes: QueueOutcome[] = [];

  for (const operation of ordered) {
    const local = await store.getInspection(operation.inspectionId);
    if (!local) {
      await store.deleteOperation(operation.idempotencyKey);
      outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "abandoned", reason: "missing-local-inspection" });
      continue;
    }

    const result = await transport.send(operation);

    if (!result.ok) {
      const nextAttempts = operation.attempts + 1;
      if (!result.retryable || nextAttempts >= retryPolicy.maxAttempts) {
        await store.deleteOperation(operation.idempotencyKey);
        outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "abandoned", reason: result.reason });
        continue;
      }
      await store.saveOperation({ ...operation, attempts: nextAttempts });
      outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "retry-scheduled", attempts: nextAttempts });
      continue;
    }

    const decision = resolveConflict(local, result.remote, now());

    if (decision.kind === "already-applied") {
      await store.saveInspection({
        ...local,
        syncStatus: "synced",
        serverRevision: decision.remote.revision,
        baseServerRevision: decision.remote.revision
      });
      await store.deleteOperation(operation.idempotencyKey);
      outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "already-applied" });
      continue;
    }

    if (decision.kind === "apply-local") {
      const confirmedRevision = decision.expectedServerRevision !== null ? decision.expectedServerRevision + 1 : local.localRevision;
      await store.saveInspection({
        ...local,
        syncStatus: "synced",
        serverRevision: confirmedRevision,
        baseServerRevision: confirmedRevision
      });
      await store.deleteOperation(operation.idempotencyKey);
      outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "synced" });
      continue;
    }

    if (decision.kind === "ignore-stale-response") {
      outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "retry-scheduled", attempts: operation.attempts });
      continue;
    }

    await store.saveInspection({ ...local, syncStatus: "conflict" });
    await store.deleteOperation(operation.idempotencyKey);
    outcomes.push({ idempotencyKey: operation.idempotencyKey, kind: "conflict" });
  }

  return outcomes;
}
