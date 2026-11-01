import assert from "node:assert/strict";
import {
  isBoundedText,
  MAX_SYNC_REQUEST_BYTES,
  parseBoundedJsonRequest,
  SECURITY_INPUT_LIMITS
} from "../src/lib/security/input-validation.ts";
import { isInspection } from "../src/lib/storage/schema.ts";

const validInspection = {
  id: "inspection-synthetic-001",
  location: "Laboratorio sintético",
  date: "2026-10-28",
  inspector: "Técnica de prueba",
  status: "ok",
  statusLabel: "Sin incidencias",
  findings: 0,
  summary: "Inspección sintética para probar validaciones."
};

assert.equal(isBoundedText("dato sintético", 20), true);
assert.equal(isBoundedText("   ", 20), false);
assert.equal(isBoundedText("texto demasiado largo", 5), false);
assert.equal(isBoundedText("texto", 0), false);

assert.equal(isInspection(validInspection), true);
assert.equal(
  isInspection({ ...validInspection, location: "L".repeat(SECURITY_INPUT_LIMITS.location + 1) }),
  false
);
assert.equal(
  isInspection({ ...validInspection, summary: "S".repeat(SECURITY_INPUT_LIMITS.summary + 1) }),
  false
);
assert.equal(
  isInspection({ ...validInspection, inspector: "I".repeat(SECURITY_INPUT_LIMITS.inspector) }),
  true
);
assert.equal(isInspection({ ...validInspection, date: "2026-02-30" }), false);
assert.equal(isInspection({ ...validInspection, status: "unknown" }), false);
assert.equal(isInspection({ ...validInspection, findings: -1 }), false);
assert.equal(isInspection({ ...validInspection, findings: 0.5 }), false);
assert.equal(isInspection({ ...validInspection, statusLabel: "" }), false);

const validJsonRequest = new Request("https://example.test/sync", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ synthetic: true })
});
assert.deepEqual(await parseBoundedJsonRequest(validJsonRequest), {
  ok: true,
  value: { synthetic: true }
});

const malformedJsonRequest = new Request("https://example.test/sync", {
  method: "POST",
  body: "{invalid"
});
assert.deepEqual(await parseBoundedJsonRequest(malformedJsonRequest), {
  ok: false,
  reason: "invalid-json"
});

const oversizedRequest = new Request("https://example.test/sync", {
  method: "POST",
  body: JSON.stringify({ payload: "x".repeat(MAX_SYNC_REQUEST_BYTES) })
});
assert.deepEqual(await parseBoundedJsonRequest(oversizedRequest), {
  ok: false,
  reason: "payload-too-large"
});

// isInspection es un predicado de forma: actualmente tolera propiedades adicionales.
// No las elimina ni esta aceptación demuestra minimización o saneamiento de datos.
assert.equal(isInspection({ ...validInspection, email: "persona@ejemplo.com" }), true);
// El flujo de captura sólo construye los campos del formulario, pero cualquier
// frontera que reciba objetos arbitrarios debe decidir explícitamente qué hacer
// con propiedades extra antes de persistirlas.
assert.equal(
  isInspection({
    id: "x",
    location: "Lab",
    date: "2026-10-28",
    inspector: "Sintético",
    status: "ok",
    statusLabel: "Ok",
    findings: 0,
    summary: "ok",
    password: "secreto"
  }),
  true
);

// Límites de idempotency / textos vacíos ya cubiertos; refuerzo de summary vacío
assert.equal(isInspection({ ...validInspection, summary: "   " }), false);
assert.equal(isInspection({ ...validInspection, inspector: "" }), false);

// Parser: cuerpo vacío o no JSON
const emptyBody = new Request("https://example.test/sync", { method: "POST", body: "" });
const emptyResult = await parseBoundedJsonRequest(emptyBody);
assert.equal(emptyResult.ok, false);

console.log("security.spec.ts: PASS (límites de texto, esquema de inspección y JSON acotado)");
