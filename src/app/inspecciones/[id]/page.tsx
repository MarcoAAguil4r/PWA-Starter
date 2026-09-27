"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LoadingState } from "../../../components/loading-state";
import { inspections, type Inspection } from "../../../lib/data/inspections";

type LoadState = "cargando" | "error" | "encontrada" | "no-encontrada";

export default function InspectionDetailPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>("cargando");
  const [inspection, setInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    setState("cargando");
    const timer = setTimeout(() => {
      const found = inspections.find((item) => item.id === params.id);
      if (found) {
        setInspection(found);
        setState("encontrada");
      } else {
        setState("no-encontrada");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [params.id]);

  if (state === "cargando") {
    return <LoadingState label="Cargando inspección..." />;
  }

  if (state === "no-encontrada") {
    return (
      <section aria-labelledby="detail-heading" className="content-section">
        <h2 id="detail-heading">Inspección no encontrada</h2>
        <p>No existe una inspección con el identificador "{params.id}".</p>
        <a href="/inspecciones">← Volver al listado</a>
      </section>
    );
  }

  if (state === "error" || !inspection) {
    return (
      <section role="alert" className="content-section">
        <p>No se pudo cargar la inspección.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="detail-heading" className="content-section">
      <a href="/inspecciones">← Volver al listado</a>
      <h2 id="detail-heading">{inspection.location}</h2>
      <span className={`badge badge-${inspection.status}`}>{inspection.statusLabel}</span>
      <p>{inspection.summary}</p>
      <dl>
        <div>
          <dt>Responsable</dt>
          <dd>{inspection.inspector}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{inspection.date}</dd>
        </div>
        <div>
          <dt>Hallazgos</dt>
          <dd>{inspection.findings}</dd>
        </div>
      </dl>
    </section>
  );
}