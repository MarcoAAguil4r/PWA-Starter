"use client";

export default function InspectionsError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section aria-labelledby="inspections-error-heading" className="content-section" role="alert">
      <h2 id="inspections-error-heading">No se pudieron cargar las inspecciones</h2>
      <p>Ocurrió un problema al mostrar el listado.</p>
      <button type="button" onClick={reset}>Reintentar</button>
      <a href="/">Volver al inicio</a>
    </section>
  );
}