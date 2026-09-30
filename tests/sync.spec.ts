import assert from "node:assert/strict";
import {
  INSPECTION_STORES,
  isInspection,
  isInspectionConflict,
  isStoredInspection,
  isSyncOperation,
  upgradeInspectionDatabase
} from "../src/lib/storage/schema.ts";
import { resolveInspectionConflict } from "../src/lib/sync/conflict-policy.ts";
import type { Inspection } from "../src/lib/data/inspections.ts";
import type { StoredInspection } from "../src/lib/storage/schema.ts";

const timestamp = "2026-09-29T12:00:00.000Z";
const inspection: Inspection = {
  id: "inspection-synthetic-001",
  location: "Laboratorio sintético",
  date: "2026-09-29",
  inspector: "Técnica sintética",
  status: "attention",
  statusLabel: "Requiere atención",
  findings: 1,
  summary: "Hallazgo sintético de prueba."
};

function storedInspection(overrides: Partial<StoredInspection> = {}): StoredInspection {
  return {
    id: inspection.id,
    inspection,
    syncStatus: "pending",
    localRevision: 2,
    serverRevision: 4,
    baseServerRevision: 4,
    updatedAt: timestamp,
    idempotencyKey: "operation-synthetic-001",
    ...overrides
  };
}

function fakeDatabase() {
  const stores = new Map<string, { keyPath: string; indexes: Map<string, string> }>();
  const makeStore = (name: string, keyPath: string) => {
    const metadata = { keyPath, indexes: new Map<string, string>() };
    stores.set(name, metadata);
    return {
      indexNames: { contains: (index: string) => metadata.indexes.has(index) },
      createIndex: (index: string, path: string) => metadata.indexes.set(index, path)
    };
  };
  const database = {
    objectStoreNames: { contains: (name: string) => stores.has(name) },
    createObjectStore: (name: string, options: { keyPath: string }) => makeStore(name, options.keyPath)
  };
  const transaction = {
    objectStore: (name: string) => {
      const metadata = stores.get(name);
      assert.ok(metadata, `El object store ${name} debe existir`);
      return {
        indexNames: { contains: (index: string) => metadata.indexes.has(index) },
        createIndex: (index: string, path: string) => metadata.indexes.set(index, path)
      };
    }
  };

  return { database, transaction, stores };
}

assert.equal(isInspection(inspection), true);
assert.equal(isInspection({ ...inspection, findings: -1 }), false);
assert.equal(isInspection({ ...inspection, date: "2026-02-31" }), false);
assert.equal(isStoredInspection(storedInspection()), true);
assert.equal(isStoredInspection(storedInspection({ id: "different-id" })), false);
assert.equal(isStoredInspection(storedInspection({ updatedAt: "yesterday" })), false);
assert.equal(
  isSyncOperation({
    idempotencyKey: "operation-synthetic-001",
    inspectionId: inspection.id,
    payload: inspection,
    baseServerRevision: 4,
    createdAt: timestamp,
    attempts: 0
  }),
  true
);

const { database, transaction, stores } = fakeDatabase();
upgradeInspectionDatabase(database as unknown as IDBDatabase, transaction as unknown as IDBTransaction);
assert.deepEqual([...stores.keys()], [
  INSPECTION_STORES.inspections,
  INSPECTION_STORES.syncQueue,
  INSPECTION_STORES.conflicts
]);
assert.equal(stores.get(INSPECTION_STORES.inspections)?.keyPath, "id");
assert.equal(stores.get(INSPECTION_STORES.syncQueue)?.keyPath, "idempotencyKey");
assert.equal(stores.get(INSPECTION_STORES.conflicts)?.keyPath, "conflictId");
assert.equal(stores.get(INSPECTION_STORES.inspections)?.indexes.has("syncStatus"), true);

const unchangedRemote = { inspection, revision: 4 };
assert.deepEqual(resolveInspectionConflict(storedInspection(), unchangedRemote, timestamp), {
  kind: "already-applied",
  remote: unchangedRemote
});

const editedInspection = { ...inspection, summary: "Cambio local sintético." };
const localEdit = storedInspection({ inspection: editedInspection });
assert.deepEqual(resolveInspectionConflict(localEdit, { inspection, revision: 4 }, timestamp), {
  kind: "apply-local",
  expectedServerRevision: 4
});

const staleRemote = { inspection, revision: 3 };
assert.deepEqual(resolveInspectionConflict(localEdit, staleRemote, timestamp), {
  kind: "ignore-stale-response",
  remote: staleRemote
});

const changedRemoteInspection = { ...inspection, summary: "Cambio remoto sintético." };
const decision = resolveInspectionConflict(localEdit, { inspection: changedRemoteInspection, revision: 5 }, timestamp);
assert.equal(decision.kind, "preserve-conflict");
if (decision.kind === "preserve-conflict") {
  assert.equal(decision.conflict.localSnapshot.summary, "Cambio local sintético.");
  assert.equal(decision.conflict.remoteSnapshot.summary, "Cambio remoto sintético.");
  assert.equal(isInspectionConflict(decision.conflict), true);
}

console.log("sync.spec.ts: PASS (schema, validación y política de conflictos)");