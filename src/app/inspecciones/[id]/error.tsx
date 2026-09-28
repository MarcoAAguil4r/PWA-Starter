"use client";

export default function InspectionDetailError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section aria-labelledby="inspection-error-heading" className="content-section" role="alert">
      <h2 id="inspection-error-heading">No se pudo cargar la inspección</h2>
      <p>Ocurrió un problema al mostrar el detalle.</p>
      <button type="button" onClick={reset}>Reintentar</button>
      <a href="/inspecciones">Volver al listado</a>
    </section>
  );
}