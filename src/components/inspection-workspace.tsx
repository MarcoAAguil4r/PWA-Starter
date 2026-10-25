"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { inspections as seedInspections, type Inspection } from "../lib/data/inspections";
import { validateCaptureFields } from "../lib/data/capture-validation";
import { InspectionList } from "./inspection-list";
import { createStoredInspection, IndexedDbInspectionStore, openInspectionDatabase } from "../lib/storage/inspection-store";
import type { InspectionConflict, StoredInspection } from "../lib/storage/schema";
import { processPendingOperations, retryDelayMs } from "../lib/sync/queue";
import { resolveInspectionConflict } from "../lib/sync/conflict-policy";
import { createSyntheticTransport } from "../lib/sync/synthetic-transport";
import { getNotificationPermission, requestNotificationPermission, showLocalNotification, type NotificationCapabilityStatus } from "../lib/notifications/client";
import { CameraCaptureError, capturePhoto } from "../lib/device/camera";

const isoNow = () => new Date().toISOString();

function makeKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `synthetic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function InspectionWorkspace() {
  const storeRef = useRef<IndexedDbInspectionStore | null>(null);
  const transportRef = useRef(createSyntheticTransport());
  const syncingRef = useRef(false);
  const syncRequestedRef = useRef(false);
  const captureInProgressRef = useRef(false);
  const photoCaptureControllerRef = useRef<AbortController | null>(null);
  const photoCaptureVersionRef = useRef(0);
  const lastNotifiedCaptureKeyRef = useRef<string | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const [records, setRecords] = useState<StoredInspection[]>([]);
  const [conflicts, setConflicts] = useState<InspectionConflict[]>([]);
  const [message, setMessage] = useState("Cargando registros locales…");
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationCapabilityStatus>("checking");
  const [notificationMessage, setNotificationMessage] = useState("Comprobando la disponibilidad de notificaciones…");
  const [photoEvidence, setPhotoEvidence] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState("No se ha capturado evidencia fotográfica.");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const capturedRecords = records.filter((record) => !seedInspections.some((seed) => seed.id === record.id));

  useEffect(() => {
    if (!photoEvidence) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoEvidence);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoEvidence]);

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    setNotificationPermission(result.permission);
    setNotificationMessage(result.message);
  }

  function notifyCapture(inspection: Inspection, captureKey: string) {
    if (lastNotifiedCaptureKeyRef.current === captureKey) return;
    lastNotifiedCaptureKeyRef.current = captureKey;
    try {
      const result = showLocalNotification("Inspección guardada", {
        body: `La inspección de ${inspection.location} quedó guardada localmente.`,
        tag: `inspection-saved-${captureKey}`
      });
      setNotificationPermission(result.permission);
      setNotificationMessage(result.message);
    } catch {
      setNotificationMessage("No se pudo mostrar la notificación; la inspección continúa guardada localmente.");
    }
  }

  async function capturePhotoEvidence() {
    if (isCapturing || photoCaptureControllerRef.current) return;
    const controller = new AbortController();
    const captureVersion = ++photoCaptureVersionRef.current;
    photoCaptureControllerRef.current = controller;
    setIsCapturing(true);
    setPhotoError(null);
    setPhotoMessage("Abriendo la cámara para capturar evidencia…");
    try {
      const photo = await capturePhoto({
        facingMode: "environment",
        quality: 0.85,
        maxDimension: 1280,
        signal: controller.signal
      });
      if (captureVersion !== photoCaptureVersionRef.current) return;
      setPhotoEvidence(photo);
      setPhotoMessage("Evidencia fotográfica capturada. Se conserva solo en memoria y no se enviará ni guardará.");
    } catch (cause) {
      if (captureVersion !== photoCaptureVersionRef.current) return;
      if (cause instanceof CameraCaptureError) {
        switch (cause.code) {
          case "aborted":
            setPhotoMessage("La captura de evidencia se canceló.");
            break;
          case "permission-denied":
            setPhotoError("Se denegó el permiso de cámara. Puede registrar la inspección sin fotografía.");
            break;
          case "unsupported":
          case "unavailable":
            setPhotoError("La cámara no está disponible en este dispositivo o navegador. Puede registrar la inspección sin fotografía.");
            break;
          default:
            setPhotoError(`No se pudo capturar la evidencia: ${cause.message}`);
        }
      } else {
        setPhotoError("Ocurrió un error inesperado al capturar la evidencia. Puede registrar la inspección sin fotografía.");
      }
    } finally {
      if (captureVersion === photoCaptureVersionRef.current) {
        if (photoCaptureControllerRef.current === controller) photoCaptureControllerRef.current = null;
        setIsCapturing(false);
      }
    }
  }

  function releasePhotoEvidence(message: string) {
    photoCaptureVersionRef.current += 1;
    photoCaptureControllerRef.current?.abort();
    photoCaptureControllerRef.current = null;
    setIsCapturing(false);
    setPhotoEvidence(null);
    setPhotoError(null);
    setPhotoMessage(message);
  }

  function cancelPhotoCapture() {
    if (!photoCaptureControllerRef.current) return;
    releasePhotoEvidence("La captura de evidencia se canceló.");
  }

  function discardPhotoEvidence() {
    releasePhotoEvidence("La evidencia fotográfica fue descartada.");
  }

  const refresh = useCallback(async () => {
    const store = storeRef.current;
    if (!store) return;
    setRecords(await store.listInspections());
    setConflicts(await store.listConflicts());
  }, []);

  useEffect(() => {
    const permission = getNotificationPermission();
    setNotificationPermission(permission);
    setNotificationMessage(permission === "granted"
      ? "Las notificaciones están habilitadas."
      : "Los avisos de cambios se muestran aquí mientras las notificaciones del navegador no estén habilitadas.");
  }, []);

  const synchronize = useCallback(async () => {
    const store = storeRef.current;
    if (!store) return;
    if (syncingRef.current) {
      syncRequestedRef.current = true;
      return;
    }
    if (!navigator.onLine) return;
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    syncingRef.current = true;
    setError(null);
    try {
      const outcomes = await processPendingOperations(store, transportRef.current, resolveInspectionConflict, isoNow);
      if (outcomes.length) setMessage(`Sincronización terminada: ${outcomes.map((item) => item.kind).join(", ")}.`);
      const retry = outcomes.find((item) => item.kind === "retry-scheduled");
      if (retry?.kind === "retry-scheduled" && navigator.onLine) {
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = null;
          window.dispatchEvent(new Event("online"));
        }, retryDelayMs(retry.attempts));
      }
      await refresh();
    } catch (cause) {
      setError(`No se perdió ninguna operación: la cola local se conserva. Error recuperable: ${cause instanceof Error ? cause.message : "transporte o almacenamiento"}.`);
    } finally {
      syncingRef.current = false;
      const shouldRunAgain = syncRequestedRef.current;
      syncRequestedRef.current = false;
      if (shouldRunAgain && navigator.onLine) {
        window.queueMicrotask(() => window.dispatchEvent(new Event("online")));
      }
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
    return () => {
      active = false;
      window.removeEventListener("online", online);
      if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current);
      photoCaptureVersionRef.current += 1;
      photoCaptureControllerRef.current?.abort();
      photoCaptureControllerRef.current = null;
      storeRef.current?.close();
    };
  }, [refresh, synchronize]);

  async function capture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (captureInProgressRef.current) return;
    captureInProgressRef.current = true;
    const formElement = event.currentTarget;
    try {
      const form = new FormData(formElement);
      const validation = validateCaptureFields({
        location: form.get("location"),
        inspector: form.get("inspector"),
        summary: form.get("summary"),
        findings: form.get("findings")
      });
      if (!validation.valid) {
        if (validation.reason === "length") {
          setError("Ubicación y responsable deben tener máximo 120 caracteres; el resumen, máximo 500.");
          return;
        }
        setError("Complete ubicación, responsable y resumen; los hallazgos deben ser un entero igual o mayor que cero.");
        return;
      }
      const { location, inspector, summary, findings } = validation.value;
      const store = storeRef.current;
      if (!store) { setError("El almacenamiento local aún no está listo."); return; }
      const inspection: Inspection = { id: `inspection-${makeKey()}`, location, inspector, summary, findings, date: new Date().toISOString().slice(0, 10), status: findings ? "attention" : "ok", statusLabel: findings ? "Requiere atención" : "Sin incidencias" };
      const key = makeKey();
      const record = createStoredInspection(inspection, key, isoNow());
      try {
        await store.saveCapture(record, { idempotencyKey: key, inspectionId: inspection.id, payload: inspection, baseServerRevision: null, createdAt: record.updatedAt, attempts: 0 });
      } catch (cause) {
        setError(`No se pudo guardar la captura; no se confirmó el cambio. ${cause instanceof Error ? cause.message : "Error de almacenamiento"}. Revise IndexedDB e intente de nuevo.`);
        return;
      }
      releasePhotoEvidence("La inspección se guardó localmente. La evidencia temporal se liberó; no fue adjuntada ni almacenada.");
      formElement.reset();
      setError(null);
      setMessage(navigator.onLine ? "Captura guardada localmente; sincronizando…" : "Captura guardada sin conexión y marcada como pendiente.");
      notifyCapture(inspection, key);
      try {
        await refresh();
      } catch (cause) {
        setError(`La captura quedó guardada localmente, pero no se pudo actualizar la vista: ${cause instanceof Error ? cause.message : "error de lectura"}.`);
        return;
      }
      await synchronize();
    } catch (cause) {
      setError(`No se pudo preparar la captura: ${cause instanceof Error ? cause.message : "error de validación"}.`);
    } finally {
      captureInProgressRef.current = false;
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
      <section aria-labelledby="photo-evidence-heading">
        <h4 id="photo-evidence-heading">Evidencia fotográfica opcional</h4>
        <p className="muted">La fotografía se mantiene únicamente en memoria durante esta sesión; no se adjunta a la inspección, no se guarda y no se sincroniza.</p>
        <button type="button" onClick={() => void capturePhotoEvidence()} disabled={isCapturing}>
          Capturar fotografía
        </button>
        {isCapturing && <button type="button" onClick={cancelPhotoCapture}>Cancelar captura</button>}
        {photoEvidence && <button type="button" onClick={discardPhotoEvidence}>Descartar evidencia</button>}
        {photoPreviewUrl && (
          // La imagen es un Blob temporal local; no requiere el optimizador remoto de Next.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreviewUrl} alt="Vista previa de la evidencia fotográfica capturada" />
        )}
        <p role="status" className="muted">{photoMessage}</p>
        {photoError && <p role="alert" className="state-error">{photoError}</p>}
      </section>
      <button type="submit">Guardar captura</button>
      <button type="button" onClick={() => void synchronize()}>Sincronizar pendientes</button>
      <button type="button" onClick={() => void enableNotifications()}>
        {notificationPermission === "granted" ? "Notificaciones habilitadas" : "Habilitar notificaciones"}
      </button>
    </form>
    <p role="status" className="sync-message">{message}</p>
    <p role="status" className="muted">Notificaciones: {notificationPermission === "checking" ? "comprobando disponibilidad" : notificationPermission}. {notificationMessage}</p>
    {error && <div role="alert" className="state-error"><p>{error}</p><button type="button" onClick={() => { setError(null); void synchronize(); }}>Reintentar</button></div>}
    {capturedRecords.length > 0 && <section aria-labelledby="local-captures-heading">
      <h3 id="local-captures-heading">Capturas locales</h3>
      <InspectionList inspections={capturedRecords.map((record) => ({ ...record.inspection, syncStatus: record.syncStatus }))} />
    </section>}
    {conflicts.length > 0 && <section className="conflict-list" aria-labelledby="conflicts-heading"><h3 id="conflicts-heading">Conflictos conservados</h3>{conflicts.map((conflict) => <article key={conflict.conflictId}><p>Inspección {conflict.inspectionId}: versión local {conflict.localRevision} y remota {conflict.remoteRevision} preservadas.</p><p className="muted">Local: {conflict.localSnapshot.summary} / Remota: {conflict.remoteSnapshot.summary}</p></article>)}</section>}
  </>;
}
