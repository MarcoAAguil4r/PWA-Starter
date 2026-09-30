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

// ---------------------------------------------------------------------------
// Integrante 2 — cola de sincronización (src/lib/sync/queue.ts)
// ---------------------------------------------------------------------------

const {
  enqueueOperation,
  processPendingOperations
} = await import("../src/lib/sync/queue.ts");

function fakeQueueStore(
  seedInspections: StoredInspection[] = [],
  seedOperations: SyncOperation[] = []
) {
  const inspections = new Map(seedInspections.map((item) => [item.id, item]));
  const operations = new Map(seedOperations.map((item) => [item.idempotencyKey, item]));
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
    }
  };
  return { store, inspections, operations };
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
  const { store, inspections, operations } = fakeQueueStore(
    [storedInspection({ inspection: { ...inspection, summary: "Cambio local sintético." } })],
    [pendingOperation()]
  );
  const transport = createSyntheticTransport([{ ok: true, remote: { inspection: remoteChanged, revision: 5 } }]);
  const outcomes = await processPendingOperations(store, transport, resolveInspectionConflict, fixedNow);
  assert.equal(outcomes[0].kind, "conflict");
  assert.equal(operations.size, 0);
  assert.equal(inspections.get(inspection.id)?.syncStatus, "conflict");
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
  assert.equal(outcomes[0].kind, "retry-scheduled");
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