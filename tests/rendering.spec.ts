import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const listPage = read("src/app/inspecciones/page.tsx");
const detailPage = read("src/app/inspecciones/[id]/page.tsx");
const listError = read("src/app/inspecciones/error.tsx");
const detailError = read("src/app/inspecciones/[id]/error.tsx");
const measurementScript = read("scripts/measure-rendering.mjs");
const packageJson = JSON.parse(read("package.json"));
const listComponent = read("src/components/inspection-list.tsx");
const loadingPage = read("src/app/inspecciones/loading.tsx");
const data = read("src/lib/data/inspections.ts");

assert.doesNotMatch(listPage, /^\s*["']use client["']/m, "/inspecciones debe mantenerse como Server Component.");
assert.match(listPage, /dynamic\s*=\s*["']force-dynamic["']/, "/inspecciones debe renderizar los datos por solicitud.");
assert.match(listPage, /<InspectionList inspections=\{inspections\}/, "La lista SSR debe recibir las inspecciones sintéticas.");
assert.match(loadingPage, /<LoadingState\b/, "La ruta de listado debe exponer un estado de carga.");
assert.match(listError, /role="alert"/, "El listado debe exponer un estado de error accesible.");
assert.match(listError, /onClick=\{reset\}/, "El error del listado debe permitir reintentar.");
assert.match(listError, /Volver al inicio|Volver a inspecciones/, "El error del listado debe ofrecer navegación de recuperación.");
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
assert.match(detailPage, /catch\s*\{[\s\S]*setState\("error"\)/, "Un fallo al resolver el detalle debe activar el estado de error.");
assert.match(detailPage, /retryCount\]\)/, "El reintento local debe volver a ejecutar la carga del detalle.");
assert.match(detailPage, /setRetryCount\(\(count\) => count \+ 1\)/, "El estado de error local debe ofrecer un reintento funcional.");
assert.match(detailError, /role="alert"/, "El detalle debe exponer un estado de error accesible.");
assert.match(detailError, /onClick=\{reset\}/, "El error del detalle debe permitir reintentar.");
assert.equal(packageJson.scripts["measure:rendering"], "node scripts/measure-rendering.mjs", "La medición repetible debe tener un comando npm.");
assert.match(measurementScript, /sampleCount = 5/, "La medición debe repetir las solicitudes una cantidad fija de veces.");
assert.match(measurementScript, /medianResponseMs/, "La medición debe reportar latencia mediana.");
assert.match(measurementScript, /initialHtmlBytes/, "La medición debe reportar el tamaño del HTML inicial.");
assert.match(measurementScript, /rendering-metrics\.json/, "La medición debe guardar un artefacto reproducible.");

console.log("rendering.spec.ts: PASS (contrato SSR, CSR, carga, contenido, inexistente y navegación)");
