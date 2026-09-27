import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const listPage = read("src/app/inspecciones/page.tsx");
const detailPage = read("src/app/inspecciones/[id]/page.tsx");
const listComponent = read("src/components/inspection-list.tsx");
const loadingPage = read("src/app/inspecciones/loading.tsx");
const data = read("src/lib/data/inspections.ts");

assert.doesNotMatch(listPage, /^\s*["']use client["']/m, "/inspecciones debe mantenerse como Server Component.");
assert.match(listPage, /dynamic\s*=\s*["']force-dynamic["']/, "/inspecciones debe renderizar los datos por solicitud.");
assert.match(listPage, /<InspectionList inspections=\{inspections\}/, "La lista SSR debe recibir las inspecciones sintéticas.");
assert.match(loadingPage, /<LoadingState\b/, "La ruta de listado debe exponer un estado de carga.");
assert.match(listComponent, /href=\{`\/inspecciones\/\$\{inspection\.id\}`\}/, "Cada tarjeta debe enlazar al detalle correspondiente.");

for (const [id, location] of [["inspection-001", "Laboratorio de Redes"], ["inspection-002", "Laboratorio de Electrónica"], ["inspection-003", "Laboratorio de Software"]]) {
  assert.match(data, new RegExp(`id: "${id}"`), `Debe existir ${id} en los datos sintéticos.`);
  assert.match(data, new RegExp(`location: "${location}"`), `${id} debe conservar su contenido de listado.`);
}

assert.match(detailPage, /^\s*["']use client["']/m, "El detalle debe ser un Client Component.");
assert.match(detailPage, /useParams<\{ id: string \}>\(\)/, "El detalle debe leer el identificador de la ruta.");
assert.match(detailPage, /setTimeout\(/, "El detalle debe comunicar su carga asíncrona simulada.");
assert.match(detailPage, /<LoadingState label="Cargando inspección\.\.\."\s*\/>/, "El detalle debe mostrar carga antes del contenido.");
assert.match(detailPage, /inspections\.find\(\(item\) => item\.id === params\.id\)/, "El detalle debe buscar la inspección solicitada.");
assert.match(detailPage, /Inspección no encontrada/, "Un identificador inexistente debe tener un estado explícito.");
assert.match(detailPage, /No existe una inspección con el identificador/, "El estado inexistente debe explicar el problema.");
assert.match(detailPage, /href="\/inspecciones"/, "El detalle debe permitir volver al listado.");
assert.match(detailPage, /state === "error" \|\| !inspection/, "El detalle debe conservar un estado de error defensivo.");

console.log("rendering.spec.ts: PASS (contrato SSR, CSR, carga, contenido, inexistente y navegación)");
