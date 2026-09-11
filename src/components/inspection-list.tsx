"use client";

import type { inspections as InspectionsType } from "../lib/data/inspections";

type Inspection = (typeof InspectionsType)[number];
type ListState = "cargando" | "error" | "vacio" | "exito";

interface Props {
  inspections: Inspection[];
  state?: ListState;
  onRetry?: () => void;
}

export function InspectionList({ inspections, state = "exito", onRetry }: Props) {
  if (state === "cargando") {
    return <p role="status">Cargando inspecciones…</p>;
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
            <span className="muted">{inspection.date}</span>
          </div>
          <h3>{inspection.location}</h3>
          <p>{inspection.summary}</p>
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
