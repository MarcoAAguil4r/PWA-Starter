import type { SyncTransport, SyncTransportResult } from "./queue";
import { isRemoteInspection, type SyncOperation } from "../storage/schema";

function isTransportResult(value: unknown): value is SyncTransportResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;
  if (result.ok === true) return isRemoteInspection(result.remote);
  return result.ok === false && typeof result.retryable === "boolean" && typeof result.reason === "string";
}

/** HTTP adapter for the deterministic in-process server used by this project. */
export function createSyntheticTransport(fetchImpl: typeof fetch = fetch): SyncTransport {
  return {
    async send(operation: SyncOperation): Promise<SyncTransportResult> {
      try {
        const response = await fetchImpl("/api/inspections/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operation)
        });
        const result: unknown = await response.json().catch(() => null);

        if (isTransportResult(result)) return result;
        return {
          ok: false,
          retryable: response.status >= 500 || response.status === 429,
          reason: "invalid-sync-response"
        };
      } catch {
        return { ok: false, retryable: true, reason: "network-unavailable" };
      }
    }
  };
}
