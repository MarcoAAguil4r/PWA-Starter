import assert from "node:assert/strict";
import { enqueueOperation, retryDelayMs, type SyncQueueStore } from "../../src/lib/sync/queue.ts";
import type { Inspection } from "../../src/lib/data/inspections.ts";
import type { StoredInspection, SyncOperation } from "../../src/lib/storage/schema.ts";

const timestamp = "2026-10-23T18:00:00.000Z";

const inspection: Inspection = {
  id: "inspection-unit-queue-001",
  location: "Laboratorio sintético unitario",
  date: "2026-10-23",
  inspector: "Técnica unitaria",
  status: "ok",
  statusLabel: "Sin hallazgos críticos",
  findings: 0,
  summary: "Captura sintética para prueba de cola."
};

function operation(overrides: Partial<SyncOperation> = {}): SyncOperation {
  return {
    idempotencyKey: "op-unit-001",
    inspectionId: inspection.id,
    payload: inspection,
    baseServerRevision: null,
    createdAt: timestamp,
    attempts: 0,
    ...overrides
  };
}

function memoryStore(seed: SyncOperation[] = []): SyncQueueStore & { ops: Map<string, SyncOperation> } {
  const ops = new Map(seed.map((item) => [item.idempotencyKey, item]));
  return {
    ops,
    async listOperations() {
      return [...ops.values()];
    },
    async saveOperation(op: SyncOperation) {
      ops.set(op.idempotencyKey, op);
    },
    async deleteOperation(key: string) {
      ops.delete(key);
    },
    async getInspection() {
      return null;
    },
    async saveInspection(_item: StoredInspection) {},
    async saveConflict() {}
  };
}

// Regla de reintento: backoff acotado
assert.equal(retryDelayMs(1), 1_000);
assert.equal(retryDelayMs(2), 2_000);
assert.equal(retryDelayMs(3), 4_000);
assert.equal(retryDelayMs(8), 30_000);
assert.equal(retryDelayMs(0), 1_000);

// Caso válido: primera vez encola
{
  const store = memoryStore();
  const op = operation();
  assert.equal(await enqueueOperation(store, op), "enqueued");
  assert.equal(store.ops.size, 1);
  assert.equal(store.ops.get(op.idempotencyKey)?.inspectionId, inspection.id);
}

// Caso inválido / idempotencia: misma clave no duplica
{
  const store = memoryStore();
  const op = operation();
  assert.equal(await enqueueOperation(store, op), "enqueued");
  assert.equal(await enqueueOperation(store, op), "duplicate");
  assert.equal(await enqueueOperation(store, { ...op, attempts: 3 }), "duplicate");
  assert.equal(store.ops.size, 1);
}

// Clave distinta sí se encola
{
  const store = memoryStore();
  assert.equal(await enqueueOperation(store, operation({ idempotencyKey: "op-a" })), "enqueued");
  assert.equal(await enqueueOperation(store, operation({ idempotencyKey: "op-b" })), "enqueued");
  assert.equal(store.ops.size, 2);
}

console.log("queue-idempotency.spec.ts: PASS (retryDelayMs, enqueued, duplicate, claves distintas)");
