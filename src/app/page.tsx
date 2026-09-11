import { inspections } from "../lib/data/inspections";
import { InspectionList } from "../components/inspection-list";

export default function HomePage() {
  return (
    <section aria-labelledby="inspections-heading" className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Datos de demostración</p>
          <h2 id="inspections-heading">Inspecciones recientes</h2>
        </div>
        <span className="count">{inspections.length} registros</span>
      </div>

      <InspectionList inspections={inspections} />
    </section>
  );
}
