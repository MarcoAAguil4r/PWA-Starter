import type { Inspection } from "../data/inspections";
import type { InspectionConflict, RemoteInspection, StoredInspection } from "../storage/schema";

export type ConflictDecision =
  | { kind: "apply-local"; expectedServerRevision: number | null }
  | { kind: "already-applied"; remote: RemoteInspection }
  | { kind: "ignore-stale-response"; remote: RemoteInspection }
  | { kind: "preserve-conflict"; remote: RemoteInspection; conflict: InspectionConflict };

function sameInspection(left: Inspection, right: Inspection): boolean {
  return (
    left.id === right.id &&
    left.location === right.location &&
    left.date === right.date &&
    left.inspector === right.inspector &&
    left.status === right.status &&
    left.statusLabel === right.statusLabel &&
    left.findings === right.findings &&
    left.summary === right.summary
  );
}

export function resolveInspectionConflict(
  local: StoredInspection,
  remote: RemoteInspection,
  detectedAt: string
): ConflictDecision {
  if (local.baseServerRevision !== null && remote.revision < local.baseServerRevision) {
    return { kind: "ignore-stale-response", remote };
  }

  if (sameInspection(local.inspection, remote.inspection)) {
    return { kind: "already-applied", remote };
  }

  if (local.baseServerRevision === remote.revision) {
    return { kind: "apply-local", expectedServerRevision: remote.revision };
  }

  return {
    kind: "preserve-conflict",
    remote,
    conflict: {
      conflictId: `${local.id}:${local.localRevision}:${remote.revision}`,
      inspectionId: local.id,
      localSnapshot: local.inspection,
      remoteSnapshot: remote.inspection,
      localRevision: local.localRevision,
      expectedServerRevision: local.baseServerRevision,
      remoteRevision: remote.revision,
      detectedAt
    }
  };
}