import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const manifest = read("src/app/manifest.ts");

const manifestFields = [
  ["name", /name:\s*"Inspecciones de laboratorio"/],
  ["short_name", /short_name:\s*"Inspecciones"/],
  ["description", /description:\s*"Registro de mantenimiento para inspecciones de laboratorio\."/],
  ["start_url", /start_url:\s*"\/"/],
  ["scope", /scope:\s*"\/"/],
  ["display", /display:\s*"standalone"/],
  ["theme_color", /theme_color:\s*"#[0-9a-fA-F]{6}"/],
  ["background_color", /background_color:\s*"#[0-9a-fA-F]{6}"/],
  ["lang", /lang:\s*"es-MX"/],
];

for (const [field, pattern] of manifestFields) {
  assert.match(manifest, pattern, `El manifest debe declarar ${field}.`);
}

for (const size of [192, 512]) {
  const icon = `icon-${size}x${size}.png`;
  assert.match(manifest, new RegExp(`src:\\s*"/icons/${icon.replace(".", "\\.")}"`), `El manifest debe referenciar ${icon}.`);
  assert.ok(existsSync(resolve(root, "public/icons", icon)), `Debe existir public/icons/${icon}.`);
}

console.log("manifest.spec.mjs: PASS (manifest e iconos)");

const shell = read("src/components/app-shell.tsx");
for (const landmark of ["header", "main", "footer"]) {
  assert.match(shell, new RegExp(`<${landmark}\\b`), `El shell debe incluir <${landmark}>.`);
}
const navigationLabel = shell.match(/<nav[^>]*aria-label=["']([^"']+)["']/);
assert.ok(navigationLabel, "El shell debe incluir una navegación con aria-label.");

const navContents = shell.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? "";
assert.match(navContents, /Inspecciones/, "La navegación debe incluir la opción existente ‘Inspecciones’.");
assert.match(navContents, /Resumen \(próximamente\)/, "La navegación debe incluir la opción existente ‘Resumen (próximamente)’.");
console.log(`manifest.spec.mjs: PASS (landmarks y navegación: ${navigationLabel[1]})`);

const components = resolve(root, "src/components");
const stateFile = readdirSync(components)
  .filter((file) => file.endsWith(".tsx"))
  .find((file) => {
    const content = readFileSync(resolve(components, file), "utf8");
    return /Cargando inspecciones/.test(content) && /Reintentar/.test(content);
  });

assert.ok(stateFile, "Debe existir un componente con los estados de inspecciones.");
const states = readFileSync(resolve(components, stateFile), "utf8");
assert.match(states, /Cargando inspecciones/, "Debe incluir el texto del estado de carga.");
assert.match(states, /No se pudieron cargar las inspecciones\./, "Debe incluir un mensaje comprensible para el estado de error.");
assert.match(states, /Reintentar/, "El estado de error debe ofrecer una opción para reintentar.");
assert.match(states, /No hay inspecciones registradas todavía\./, "Debe incluir el mensaje del estado vacío.");
assert.match(states, /role=["'](?:status|alert)["']|aria-live|<svg\b/, "Los estados deben comunicar significado además del color.");
console.log(`manifest.spec.mjs: PASS (estados visuales en ${stateFile})`);
