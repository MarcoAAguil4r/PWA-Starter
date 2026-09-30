"use client";

import { LoadingState } from "./loading-state";
import type { Inspection } from "../lib/data/inspections";
import type { InspectionSyncStatus } from "../lib/storage/schema";

type ListInspection = Inspection & { syncStatus?: InspectionSyncStatus };
type ListState = "cargando" | "error" | "vacio" | "exito";

interface Props {
  inspections: ListInspection[];
  state?: ListState;
  onRetry?: () => void;
}

export function InspectionList({ inspections, state = "exito", onRetry }: Props) {
  if (state === "cargando") {
    return <LoadingState label="Cargando inspecciones" />;
  }

  if (state === "error") {
    return (
      <div role="alert" className="state-error">
        <p>No se pudieron cargar las inspecciones.</p>
        <button type="button" onClick={onRetry ?? (() => window.location.reload())}>
          Reintentar
        </button>
      </div>
    );
  }

  if (state === "vacio" || inspections.length === 0) {
    return <p className="state-empty">No hay inspecciones registradas todavía.</p>;
  }

  return (
    <div className="inspection-grid">
      {inspections.map((inspection) => (
        <article className="inspection-card" key={inspection.id}>
          <div className="card-topline">
            <span className={`badge badge-${inspection.status}`}>{inspection.statusLabel}</span>
            <span className={`sync-status sync-${inspection.syncStatus ?? "synced"}`}>{inspection.syncStatus ?? "synced"}</span>
          </div>
          <h3>
  	        <a href={`/inspecciones/${inspection.id}`}>{inspection.location}</a>
	        </h3>
          <p>{inspection.summary}</p>
          <p className="muted">{inspection.date}</p>
          <dl>
            <div>
              <dt>Responsable</dt>
              <dd>{inspection.inspector}</dd>
            </div>
            <div>
              <dt>Hallazgos</dt>
              <dd>{inspection.findings}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
