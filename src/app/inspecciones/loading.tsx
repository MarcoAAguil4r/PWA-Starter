import { LoadingState } from "../../components/loading-state";

export default function Loading() {
  return (
    <section aria-labelledby="inspections-loading-heading" className="content-section">
      <h2 id="inspections-loading-heading">Inspecciones recientes</h2>
      <LoadingState />
    </section>
  );
}