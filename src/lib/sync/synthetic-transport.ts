import type { SyncTransport, SyncTransportResult } from "./queue";
import type { SyncOperation } from "../storage/schema";

/** Deterministic in-browser test double; it is not a production backend. */
export function createSyntheticTransport(): SyncTransport {
  const applied = new Map<string, SyncTransportResult>();
  let revision = 0;
  return {
    async send(operation: SyncOperation): Promise<SyncTransportResult> {
      const previous = applied.get(operation.idempotencyKey);
      if (previous) return previous;
      revision += 1;
      const result: SyncTransportResult = { ok: true, remote: { inspection: operation.payload, revision } };
      applied.set(operation.idempotencyKey, result);
      return result;
    }
  };
}
