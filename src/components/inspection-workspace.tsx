"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { inspections as seedInspections, type Inspection } from "../lib/data/inspections";
import { InspectionList } from "./inspection-list";
import { createStoredInspection, IndexedDbInspectionStore, openInspectionDatabase } from "../lib/storage/inspection-store";
import type { InspectionConflict, StoredInspection } from "../lib/storage/schema";
import { enqueueOperation, processPendingOperations } from "../lib/sync/queue";
import { resolveInspectionConflict } from "../lib/sync/conflict-policy";
import { createSyntheticTransport } from "../lib/sync/synthetic-transport";

const isoNow = () => new Date().toISOString();

function makeKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `synthetic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function InspectionWorkspace() {
  const storeRef = useRef<IndexedDbInspectionStore | null>(null);
  const transportRef = useRef(createSyntheticTransport());
  const syncingRef = useRef(false);
  const [records, setRecords] = useState<StoredInspection[]>([]);
  const [conflicts, setConflicts] = useState<InspectionConflict[]>([]);
  const [message, setMessage] = useState("Cargando registros locales…");
  const [error, setError] = useState<string | null>(null);
  const capturedRecords = records.filter((record) => !seedInspections.some((seed) => seed.id === record.id));

  const refresh = useCallback(async () => {
    const store = storeRef.current;
    if (!store) return;
    setRecords(await store.listInspections());
    setConflicts(await store.listConflicts());
  }, []);

  const synchronize = useCallback(async () => {
    const store = storeRef.current;
    if (!store || syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setError(null);
    try {
      const outcomes = await processPendingOperations(store, transportRef.current, resolveInspectionConflict, isoNow);
      if (outcomes.length) setMessage(`Sincronización terminada: ${outcomes.map((item) => item.kind).join(", ")}.`);
      await refresh();
    } catch (cause) {
      setError(`No se perdió ninguna operación: la cola local se conserva. Error recuperable: ${cause instanceof Error ? cause.message : "transporte o almacenamiento"}.`);
    } finally {
      syncingRef.current = false;
    }
  }, [refresh]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const database = await openInspectionDatabase();
        if (!active) { database.close(); return; }
        const store = new IndexedDbInspectionStore(database);
        storeRef.current = store;
        if ((await store.listInspections()).length === 0) {
          await Promise.all(seedInspections.map((inspection, index) => store.saveInspection({
            id: inspection.id, inspection, syncStatus: "synced", localRevision: 0,
            serverRevision: index + 1, baseServerRevision: index + 1, updatedAt: isoNow(), idempotencyKey: `seed-${inspection.id}`
          })));
        }
        await refresh();
        setMessage(navigator.onLine ? "Registros locales cargados. La conexión está disponible." : "Modo sin conexión: las nuevas capturas quedarán pendientes.");
        if (navigator.onLine) await synchronize();
      } catch (cause) {
        setError(`No se pudo abrir IndexedDB: ${cause instanceof Error ? cause.message : "error desconocido"}.`);
      }
    })();
    const online = () => { setMessage("Conexión recuperada; procesando cola local…"); void synchronize(); };
    window.addEventListener("online", online);
    return () => { active = false; window.removeEventListener("online", online); };
  }, [refresh, synchronize]);

  async function capture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const location = String(form.get("location") ?? "").trim();
    const inspector = String(form.get("inspector") ?? "").trim();
    const summary = String(form.get("summary") ?? "").trim();
    const findings = Number(form.get("findings"));
    if (!location || !inspector || !summary || !Number.isSafeInteger(findings) || findings < 0) {
      setError("Complete ubicación, responsable y resumen; los hallazgos deben ser un entero igual o mayor que cero.");
      return;
    }
    const store = storeRef.current;
    if (!store) { setError("El almacenamiento local aún no está listo."); return; }
    const inspection: Inspection = { id: `inspection-${makeKey()}`, location, inspector, summary, findings, date: new Date().toISOString().slice(0, 10), status: findings ? "attention" : "ok", statusLabel: findings ? "Requiere atención" : "Sin incidencias" };
    const key = makeKey();
    try {
      const record = createStoredInspection(inspection, key, isoNow());
      await store.saveInspection(record);
      await enqueueOperation(store, { idempotencyKey: key, inspectionId: inspection.id, payload: inspection, baseServerRevision: null, createdAt: record.updatedAt, attempts: 0 });
      await refresh();
      event.currentTarget.reset();
      setError(null);
      setMessage(navigator.onLine ? "Captura guardada localmente; sincronizando…" : "Captura guardada sin conexión y marcada como pendiente.");
      await synchronize();
    } catch (cause) {
      setError(`La captura no se confirmó: ${cause instanceof Error ? cause.message : "error de almacenamiento"}. Revise IndexedDB e intente de nuevo.`);
    }
  }

  return <>
    <form className="capture-form" onSubmit={capture} aria-describedby="capture-help">
      <h3>Registrar inspección sintética</h3>
      <p id="capture-help" className="muted">Se guarda primero en este navegador. No ingrese datos personales reales.</p>
      <label>Ubicación <input name="location" required maxLength={120} /></label>
      <label>Responsable <input name="inspector" required maxLength={120} /></label>
      <label>Hallazgos <input name="findings" type="number" min="0" step="1" required /></label>
      <label>Resumen <textarea name="summary" required maxLength={500} /></label>
      <button type="submit">Guardar captura</button>
      <button type="button" onClick={() => void synchronize()}>Sincronizar pendientes</button>
    </form>
    <p role="status" className="sync-message">{message}</p>
    {error && <div role="alert" className="state-error"><p>{error}</p><button type="button" onClick={() => { setError(null); void synchronize(); }}>Reintentar</button></div>}
    {capturedRecords.length > 0 && <section aria-labelledby="local-captures-heading">
      <h3 id="local-captures-heading">Capturas locales</h3>
      <InspectionList inspections={capturedRecords.map((record) => ({ ...record.inspection, syncStatus: record.syncStatus }))} />
    </section>}
    {conflicts.length > 0 && <section className="conflict-list" aria-labelledby="conflicts-heading"><h3 id="conflicts-heading">Conflictos conservados</h3>{conflicts.map((conflict) => <article key={conflict.conflictId}><p>Inspección {conflict.inspectionId}: versión local {conflict.localRevision} y remota {conflict.remoteRevision} preservadas.</p><p className="muted">Local: {conflict.localSnapshot.summary} / Remota: {conflict.remoteSnapshot.summary}</p></article>)}</section>}
  </>;
}
