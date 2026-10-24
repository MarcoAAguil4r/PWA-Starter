import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { IndexedDbInspectionStore, openInspectionDatabase, createStoredInspection } from "../../src/lib/storage/inspection-store.ts";
import { resolveInspectionConflict } from "../../src/lib/sync/conflict-policy.ts";
import { enqueueOperation, processPendingOperations } from "../../src/lib/sync/queue.ts";
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
    request.onblocked = () => resolve();
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

// 2) Reintentar la misma sincronización no crea duplicados
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

  // Encolar de nuevo la misma clave (reintento local) → duplicate
  assert.equal(await enqueueOperation(store, op), "duplicate");
  assert.equal((await store.listOperations()).length, 1);

  // Transporte fixture: primera respuesta OK
  let sendCount = 0;
  const transport = {
    async send() {
      sendCount += 1;
      return { ok: true as const, remote: { inspection, revision: 1 } };
    }
  };

  const first = await processPendingOperations(store, transport, resolveInspectionConflict, () => now);
  assert.equal(first.length, 1);
  assert.ok(
    first[0].kind === "synced" || first[0].kind === "already-applied",
    `resultado inesperado: ${first[0].kind}`
  );
  assert.equal(sendCount, 1);
  assert.equal((await store.getInspection(inspection.id))?.syncStatus, "synced");
  assert.equal((await store.listOperations()).length, 0);

  // Reencolar y procesar otra vez no debe dejar una segunda inspección ni cola sucia
  const again = createStoredInspection(
    { ...inspection, summary: "No debe duplicar en servidor local" },
    key,
    "2026-10-23T19:05:00.000Z"
  );
  // saveCapture usa add(); misma id fallaría. Comprobamos idempotencia en cola:
  assert.equal(await enqueueOperation(store, op), "enqueued");
  const second = await processPendingOperations(store, transport, resolveInspectionConflict, () => now);
  assert.equal(second.length, 1);
  // already-applied o synced según política; no debe crecer la lista de inspecciones
  const all = await store.listInspections();
  const sameId = all.filter((item) => item.id === inspection.id);
  assert.equal(sameId.length, 1, "no debe haber inspecciones duplicadas por reintento");
});

console.log("offline-sync.spec.ts: PASS (persistencia offline + sin duplicados al reintentar)");
