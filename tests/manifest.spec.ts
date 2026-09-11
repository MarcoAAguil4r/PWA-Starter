import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = readFileSync(resolve(root, "src/app/manifest.ts"), "utf8");

assert.match(manifest, /name:\s*"Inspecciones de laboratorio"/);
assert.match(manifest, /short_name:\s*"Inspecciones"/);
assert.match(manifest, /start_url:\s*"\/"/);
assert.match(manifest, /scope:\s*"\/"/);
assert.match(manifest, /display:\s*"standalone"/);
assert.match(manifest, /lang:\s*"es-MX"/);
assert.match(manifest, /src:\s*"\/icons\/icon-192x192\.png"/);
assert.match(manifest, /src:\s*"\/icons\/icon-512x512\.png"/);
assert.ok(existsSync(resolve(root, "public/icons/icon-192x192.png")));
assert.ok(existsSync(resolve(root, "public/icons/icon-512x512.png")));
