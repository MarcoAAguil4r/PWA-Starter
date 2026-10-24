import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { IndexedDbInspectionStore, openInspectionDatabase, createStoredInspection } from "../../src/lib/storage/inspection-store.ts";
import { resolveInspectionConflict } from "../../src/lib/sync/conflict-policy.ts";
import { enqueueOperation, processPendingOperations } from "../../src/lib/sync/queue.ts";
import { InMemoryInspectionSyncServer } from "../../src/lib/sync/synthetic-server.ts";
import type { Inspection } from "../../src/lib/data/inspections.ts";
import type { SyncOperation } from "../../src/lib/storage/schema.ts";
import { INSPECTION_DATABASE_NAME } from "../../src/lib/storage/schema.ts";

const now = "2026-10-23T19:00:00.000Z";

function syntheticInspection(id: string): Inspection {
  return {
    id,
    location: "Lab integración sintético",
    date: "2026-10-23",
    inspector: "Integrante 2",
    status: "attention",
    statusLabel: "Requiere atención",
    findings: 1,
    summary: "Guardado sin conexión (fixture)."
  };
}

async function resetDatabase(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(INSPECTION_DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("deleteDatabase failed"));
    // No tratar onblocked como éxito: la BD aún no se eliminó.
    request.onblocked = () => {
      reject(new Error("deleteDatabase blocked — cierra conexiones abiertas antes de resetear"));
    };
  });
}

async function withStore<T>(fn: (store: IndexedDbInspectionStore) => Promise<T>): Promise<T> {
  await resetDatabase();
  const db = await openInspectionDatabase();
  const store = new IndexedDbInspectionStore(db);
  try {
    return await fn(store);
  } finally {
    store.close();
    await resetDatabase();
  }
}

// 1) Guardar sin conexión: persiste inspección + operación en IndexedDB
await withStore(async (store) => {
  const inspection = syntheticInspection("inspection-offline-001");
  const key = "idem-offline-001";
  const record = createStoredInspection(inspection, key, now);
  const op: SyncOperation = {
    idempotencyKey: key,
    inspectionId: inspection.id,
    payload: inspection,
    baseServerRevision: null,
    createdAt: now,
    attempts: 0
  };

  await store.saveCapture(record, op);

  const saved = await store.getInspection(inspection.id);
  const ops = await store.listOperations();

  assert.ok(saved, "la inspección debe persistir sin red");
  assert.equal(saved.syncStatus, "pending");
  assert.equal(ops.length, 1);
  assert.equal(ops[0].idempotencyKey, key);
});

// 2) Sincronización + reintento: el servidor simulado aplica una sola vez
await withStore(async (store) => {
  const inspection = syntheticInspection("inspection-offline-002");
  const key = "idem-offline-002";
  const record = createStoredInspection(inspection, key, now);
  const op: SyncOperation = {
    idempotencyKey: key,
    inspectionId: inspection.id,
    payload: inspection,
    baseServerRevision: null,
    createdAt: now,
    attempts: 0
  };

  await store.saveCapture(record, op);
  assert.equal(await enqueueOperation(store, op), "duplicate");
  assert.equal((await store.listOperations()).length, 1);

  // Servidor en memoria con registro por idempotencyKey (fixture remoto)
  const server = new InMemoryInspectionSyncServer();
  let sendCount = 0;
  const transport = {
    async send(operation: SyncOperation) {
      sendCount += 1;
      return server.apply(operation);
    }
  };

  const first = await processPendingOperations(
    store,
    transport,
    resolveInspectionConflict,
    () => now
  );
  assert.equal(first.length, 1);
  assert.ok(
    first[0].kind === "synced" || first[0].kind === "already-applied",
    `primer resultado inesperado: ${first[0].kind}`
  );
  assert.equal(sendCount, 1);
  assert.equal((await store.getInspection(inspection.id))?.syncStatus, "synced");
  assert.equal((await store.listOperations()).length, 0);

  // Una sola inspección remota tras el primer envío
  const remoteAfterFirst = server.getInspection(inspection.id);
  assert.ok(remoteAfterFirst, "el servidor debe conservar la inspección");
  assert.equal(remoteAfterFirst.revision, 1);

  // Reintento con la misma clave: vuelve a encolar y procesar
  assert.equal(await enqueueOperation(store, op), "enqueued");
  const second = await processPendingOperations(
    store,
    transport,
    resolveInspectionConflict,
    () => now
  );
  assert.equal(second.length, 1);
  assert.equal(sendCount, 2, "el reintento puede reenviar, pero el servidor no duplica");

  // Servidor: misma revisión, una sola entrada remota
  const remoteAfterRetry = server.getInspection(inspection.id);
  assert.ok(remoteAfterRetry);
  assert.equal(remoteAfterRetry.revision, 1, "reintentar no debe subir la revisión otra vez");
  assert.deepEqual(remoteAfterRetry.inspection, inspection);

  // Local: una sola inspección, cola vacía
  const all = await store.listInspections();
  assert.equal(all.filter((item) => item.id === inspection.id).length, 1);
  assert.equal((await store.listOperations()).length, 0);
});

console.log("offline-sync.spec.ts: PASS (persistencia offline + servidor idempotente sin duplicados)");
