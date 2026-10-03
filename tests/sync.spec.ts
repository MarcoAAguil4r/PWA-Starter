import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  INSPECTION_STORES,
  isInspection,
  isInspectionConflict,
  isRemoteInspection,
  isStoredInspection,
  isSyncOperation,
  upgradeInspectionDatabase
} from "../src/lib/storage/schema.ts";
import { resolveInspectionConflict } from "../src/lib/sync/conflict-policy.ts";
import { InMemoryInspectionSyncServer } from "../src/lib/sync/synthetic-server.ts";
import { IndexedDbInspectionStore, openInspectionDatabase } from "../src/lib/storage/inspection-store.ts";
import type { Inspection } from "../src/lib/data/inspections.ts";
import type { InspectionConflict, RemoteInspection, StoredInspection, SyncOperation } from "../src/lib/storage/schema.ts";

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
assert.equal(isStoredInspection(storedInspection({ updatedAt: "2026-02-31T12:00:00.000Z" })), false);
assert.equal(isStoredInspection(storedInspection({ updatedAt: "2026-01-01T00:00:00+14:30" })), false);
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
assert.equal(isRemoteInspection({ inspection, revision: 1 }), true);
assert.equal(isRemoteInspection({ inspection, revision: -1 }), false);

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

const indexedDb = await openInspectionDatabase();
const indexedStore = new IndexedDbInspectionStore(indexedDb);
const atomicInspection: Inspection = { ...inspection, id: "inspection-atomic-001" };
const atomicRecord = storedInspection({
  id: atomicInspection.id,
  inspection: atomicInspection,
  idempotencyKey: "operation-atomic-001"
});
const atomicOperation: SyncOperation = {
  idempotencyKey: atomicRecord.idempotencyKey,
  inspectionId: atomicInspection.id,
  payload: atomicInspection,
  baseServerRevision: null,
  createdAt: timestamp,
  attempts: 0
};
await indexedStore.saveCapture(atomicRecord, atomicOperation);
assert.equal((await indexedStore.getInspection(atomicInspection.id))?.syncStatus, "pending");
assert.equal((await indexedStore.listOperations()).length, 1);

const rollbackInspection: Inspection = { ...inspection, id: "inspection-atomic-rollback-001" };
const rollbackRecord = storedInspection({
  id: rollbackInspection.id,
  inspection: rollbackInspection,
  idempotencyKey: atomicRecord.idempotencyKey
});
await assert.rejects(
  indexedStore.saveCapture(rollbackRecord, { ...atomicOperation, inspectionId: rollbackInspection.id, payload: rollbackInspection })
);
assert.equal(await indexedStore.getInspection(rollbackInspection.id), null, "el fallo al encolar debe revertir también la inspección");
assert.equal((await indexedStore.listOperations()).length, 1, "la operación original debe mantenerse intacta");
indexedDb.close();
const reopenedDatabase = await openInspectionDatabase();
const reopenedStore = new IndexedDbInspectionStore(reopenedDatabase);
assert.equal((await reopenedStore.getInspection(atomicInspection.id))?.syncStatus, "pending");
assert.equal((await reopenedStore.listOperations())[0]?.idempotencyKey, atomicOperation.idempotencyKey);
reopenedDatabase.close();

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
assert.equal(
  resolveInspectionConflict(storedInspection(), staleRemote, timestamp).kind,
  "ignore-stale-response",
  "un payload coincidente no debe hacer retroceder una revisión confirmada"
);
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

const server = new InMemoryInspectionSyncServer();
const serverOperation = {
  idempotencyKey: "server-operation-001",
  inspectionId: inspection.id,
  payload: inspection,
  baseServerRevision: null,
  createdAt: timestamp,
  attempts: 0
};
const serverFirstResult = server.apply(serverOperation);
assert.equal(serverFirstResult.ok, true);
if (serverFirstResult.ok) {
  assert.equal(serverFirstResult.remote.revision, 1);
  assert.equal(isRemoteInspection(serverFirstResult.remote), true);
}
assert.deepEqual(server.apply(serverOperation), serverFirstResult, "repetir la misma clave devuelve la respuesta original");
const reusedKey = server.apply({
  ...serverOperation,
  payload: { ...inspection, summary: "Payload diferente con la misma clave." }
});
assert.deepEqual(reusedKey, { ok: false, retryable: false, reason: "idempotency-key-reused" });

const updatedPayload = { ...inspection, summary: "Actualización remota sintética." };
const updateResult = server.apply({
  ...serverOperation,
  idempotencyKey: "server-operation-002",
  payload: updatedPayload,
  baseServerRevision: 1
});
assert.equal(updateResult.ok, true);
if (updateResult.ok) assert.equal(updateResult.remote.revision, 2);

const staleWrite = server.apply({
  ...serverOperation,
  idempotencyKey: "server-operation-stale",
  payload: { ...inspection, summary: "Edición concurrente sintética." },
  baseServerRevision: 1
});
assert.equal(staleWrite.ok, true);
if (staleWrite.ok) {
  assert.equal(staleWrite.remote.revision, 2);
  assert.equal(staleWrite.remote.inspection.summary, "Actualización remota sintética.");
}

console.log("sync.spec.ts: PASS (schema, validación y política de conflictos)");

// ---------------------------------------------------------------------------
// Integrante 2 — cola de sincronización (src/lib/sync/queue.ts)
// ---------------------------------------------------------------------------

const {
  enqueueOperation,
  processPendingOperations,
  retryDelayMs
} = await import("../src/lib/sync/queue.ts");

assert.equal(retryDelayMs(1), 1_000);
assert.equal(retryDelayMs(2), 2_000);
assert.equal(retryDelayMs(8), 30_000);

function fakeQueueStore(
  seedInspections: StoredInspection[] = [],
  seedOperations: SyncOperation[] = []
) {
  const inspections = new Map(seedInspections.map((item) => [item.id, item]));
  const operations = new Map(seedOperations.map((item) => [item.idempotencyKey, item]));
  const conflicts = new Map<string, InspectionConflict>();
  const store = {
    async listOperations() {
      return [...operations.values()];
    },
    async saveOperation(operation: SyncOperation) {
      operations.set(operation.idempotencyKey, operation);
    },
    async deleteOperation(key: string) {
      operations.delete(key);
    },
    async getInspection(id: string) {
      return inspections.get(id) ?? null;
    },
    async saveInspection(item: StoredInspection) {
      inspections.set(item.id, item);
    },
    async saveConflict(conflict: InspectionConflict) {
      conflicts.set(conflict.conflictId, conflict);
    }
  };
  return { store, inspections, operations, conflicts };
}

// Adaptador sintético para pruebas: NO es un backend real, solo reproduce
// respuestas programadas para validar el comportamiento de la cola.
function createSyntheticTransport(script: Array<{ ok: true; remote: RemoteInspection } | { ok: false; retryable: boolean; reason: string }>) {
  let call = 0;
  return {
    async send() {
      const result = script[Math.min(call, script.length - 1)];
      call += 1;
      return result;
    }
  };
}

const fixedNow = () => "2026-09-29T13:00:00.000Z";

function pendingOperation(overrides: Partial<SyncOperation> = {}): SyncOperation {
  return {
    idempotencyKey: "operation-queue-001",
    inspectionId: inspection.id,
    payload: inspection,
    baseServerRevision: 4,
    createdAt: "2026-09-29T12:30:00.000Z",
    attempts: 0,
    ...overrides
  };
}

// Deduplicación: encolar dos veces la misma idempotencyKey no crea dos entradas.
{
  const { store, operations } = fakeQueueStore();
  const op = pendingOperation();
  assert.equal(await enqueueOperation(store, op), "enqueued");
  assert.equal(await enqueueOperation(store, op), "duplicate");
  assert.equal(operations.size, 1);
}

// Sincronización exitosa: hay una edición local real y la revisión remota
// coincide con baseServerRevision (nadie más cambió el dato mientras tanto),
// así que el cambio local se aplica y la operación sale de la cola.
{
  const editedLocally = { ...inspection, summary: "Cambio local sintético para envío." };
  const { store, inspections, operations } = fakeQueueStore(
    [storedInspection({ inspection: editedLocally })],
    [pendingOperation()]
  );
  const transport = createSyntheticTransport([{ ok: true, remote: { inspection, revision: 4 } }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "synced");
  assert.equal(operations.size, 0);
  assert.equal(inspections.get(inspection.id)?.syncStatus, "synced");
}

// Caso "already-applied": la respuesta remota ya coincide con el local (por
// ejemplo, una respuesta anterior se perdió y esta es la confirmación tardía
// de la misma operación idempotente). También debe salir limpio de la cola.
{
  const { store, inspections, operations } = fakeQueueStore(
    [storedInspection()],
    [pendingOperation()]
  );
  const transport = createSyntheticTransport([{ ok: true, remote: { inspection, revision: 4 } }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "already-applied");
  assert.equal(operations.size, 0);
  assert.equal(inspections.get(inspection.id)?.syncStatus, "synced");
}

// Conflicto real: el servidor avanzó con un cambio distinto. Se preserva el
// conflicto y se saca la operación de la cola (queda marcada, no perdida).
{
  const remoteChanged = { ...inspection, summary: "Cambio remoto sintético." };
  const { store, inspections, operations, conflicts } = fakeQueueStore(
    [storedInspection({ inspection: { ...inspection, summary: "Cambio local sintético." } })],
    [pendingOperation()]
  );
  const transport = createSyntheticTransport([{ ok: true, remote: { inspection: remoteChanged, revision: 5 } }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "conflict");
  assert.equal(operations.size, 0);
  assert.equal(inspections.get(inspection.id)?.syncStatus, "conflict");
  assert.equal(conflicts.size, 1, "ambas versiones deben persistirse en conflicts");
}

// Respuesta fuera de orden: hay una edición local pendiente y llega una
// revisión remota anterior a la ya confirmada (baseServerRevision). Se ignora
// sin tocar el estado local; la operación permanece pendiente.
{
  const editedLocally = { ...inspection, summary: "Cambio local sintético para envío." };
  const { store, inspections, operations } = fakeQueueStore(
    [storedInspection({ inspection: editedLocally })],
    [pendingOperation()]
  );
  const transport = createSyntheticTransport([{ ok: true, remote: { inspection, revision: 2 } }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "stale-response");
  assert.equal(operations.size, 1, "la operación debe seguir pendiente");
  assert.equal(inspections.get(inspection.id)?.syncStatus, "pending", "el estado local no debe modificarse");
}

// Reintentos: un fallo retryable incrementa attempts y deja la operación en la
// cola; una siguiente ronda (simulando reconexión) la completa.
{
  const editedLocally = { ...inspection, summary: "Cambio local sintético para envío." };
  const { store, operations } = fakeQueueStore(
    [storedInspection({ inspection: editedLocally })],
    [pendingOperation({ attempts: 0 })]
  );
  const transport = createSyntheticTransport([
    { ok: false, retryable: true, reason: "network-timeout" },
    { ok: true, remote: { inspection, revision: 4 } }
  ]);
  const firstPass = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(firstPass[0].kind, "retry-scheduled");
  assert.equal(operations.get("operation-queue-001")?.attempts, 1);

  const secondPass = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(secondPass[0].kind, "synced");
  assert.equal(operations.size, 0);
}

// Fallo no recuperable: se abandona de inmediato, sin reintentar indefinidamente.
{
  const { store, operations } = fakeQueueStore(
    [storedInspection()],
    [pendingOperation()]
  );
  const transport = createSyntheticTransport([{ ok: false, retryable: false, reason: "validation-error" }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "abandoned");
  assert.equal(operations.size, 0);
}

// Límite de reintentos: tras alcanzar maxAttempts, se abandona aunque sea retryable.
{
  const { store, operations } = fakeQueueStore(
    [storedInspection()],
    [pendingOperation({ attempts: 4 })]
  );
  const transport = createSyntheticTransport([{ ok: false, retryable: true, reason: "network-timeout" }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow, { maxAttempts: 5 });
  assert.equal(outcomes[0].kind, "abandoned");
  assert.equal(operations.size, 0);
}

// Recuperación tras recargar: la operación pendiente vive solo en el store, no
// en memoria del proceso. Una llamada nueva a processPendingOperations sobre
// el mismo store (simulando una nueva carga de la pestaña) retoma el trabajo.
{
  const editedLocally = { ...inspection, summary: "Cambio local sintético para envío." };
  const { store, operations } = fakeQueueStore(
    [storedInspection({ inspection: editedLocally })],
    [pendingOperation({ attempts: 3 })]
  );
  // "Recarga": nada se reutiliza salvo el store, como pasaría con una IndexedDB real.
  const transportAfterReload = createSyntheticTransport([{ ok: true, remote: { inspection, revision: 4 } }]);
  const outcomes = await processPendingOperations(store, transportAfterReload, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "synced");
  assert.equal(operations.size, 0);
}

console.log("sync.spec.ts: PASS (cola de sincronización — dedup, conflicto, fuera de orden, reintentos, recuperación)");
