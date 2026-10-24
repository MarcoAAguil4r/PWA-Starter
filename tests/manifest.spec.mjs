import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import manifestDefinition from "../src/app/manifest.ts";

const root = resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const manifest = manifestDefinition();

assert.equal(manifest.name, "Inspecciones de laboratorio");
assert.equal(manifest.short_name, "Inspecciones");
assert.equal(manifest.start_url, "/");
assert.equal(manifest.scope, "/");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.lang, "es-MX");
assert.deepEqual(
  manifest.icons.map(({ src }) => src),
  ["/icons/icon-192x192.png", "/icons/icon-512x512.png"]
);

const validateManifest = (value) => {
  assert.ok(value.start_url, "El manifest debe tener start_url.");
  assert.equal(value.display, "standalone", "El manifest debe usar display standalone.");
  for (const icon of value.icons) {
    assert.ok(existsSync(resolve(root, "public", icon.src.slice(1))), `Debe existir ${icon.src}.`);
  }
};

assert.equal(manifest.description, "Registro de mantenimiento para inspecciones de laboratorio.");
assert.match(manifest.theme_color, /^#[0-9a-fA-F]{6}$/);
assert.match(manifest.background_color, /^#[0-9a-fA-F]{6}$/);
for (const icon of manifest.icons) {
  assert.ok(existsSync(resolve(root, "public", icon.src.slice(1))), `Debe existir ${icon.src}.`);
}
validateManifest(manifest);

assert.throws(() => validateManifest({ display: "standalone", icons: [] }), /start_url/);
assert.throws(() => validateManifest({ start_url: "/", display: "browser", icons: [] }), /standalone/);
assert.throws(
  () => validateManifest({ start_url: "/", display: "standalone", icons: [{ src: "/icons/missing.png" }] }),
  /missing\.png/
);
console.log("manifest.spec.mjs: PASS (casos negativos)");

console.log("manifest.spec.mjs: PASS (manifest e iconos)");

const shell = read("src/components/app-shell.tsx");
const layout = read("src/app/layout.tsx");
assert.match(layout, /<AppShell\b/, "El layout debe incorporar el shell principal.");
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
