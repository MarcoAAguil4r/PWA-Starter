import { InspectionList } from "../../components/inspection-list";
import { inspections } from "../../lib/data/inspections";

export const dynamic = "force-dynamic";

export default function InspectionsPage() {
  return (
    <section aria-labelledby="inspections-heading" className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Renderizado del lado del servidor</p>
          <h2 id="inspections-heading">Inspecciones recientes</h2>
        </div>
        <span className="count">{inspections.length} registros</span>
      </div>

      <InspectionList inspections={inspections} />
    </section>
  );
}