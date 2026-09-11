import { inspections } from "../lib/data/inspections";
import { AppShell } from "../components/app-shell";
import { InspectionList } from "../components/inspection-list";

export default function HomePage() {
  return (
    <AppShell
      title="Inspecciones de laboratorio"
      description="Registro de mantenimiento para trabajar con conectividad intermitente. Los datos mostrados son sintéticos."
      statusLabel="Estado del starter: shell instalable · manifest configurado"
    >
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
    </AppShell>
  );
}
