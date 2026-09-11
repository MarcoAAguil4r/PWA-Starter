import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const page = await readFile(resolve(root, "src/app/page.tsx"), "utf8");
const layout = await readFile(resolve(root, "src/app/layout.tsx"), "utf8");

assert.equal(packageJson.scripts.build, "next build");
assert.match(layout, /Inspecciones de laboratorio/);
assert.match(layout, /sintéticos/i);
assert.match(page, /<InspectionList inspections=\{inspections\}/);
console.log("starter.spec.mjs: PASS");
