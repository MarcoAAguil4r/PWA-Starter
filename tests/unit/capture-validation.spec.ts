import assert from "node:assert/strict";
import { validateCaptureFields } from "../../src/lib/data/capture-validation.ts";

const validCapture = {
  location: "  Laboratorio sintético  ",
  inspector: " Técnica de prueba ",
  summary: " Revisión de equipo sintético. ",
  findings: "2"
};

assert.deepEqual(validateCaptureFields(validCapture), {
  valid: true,
  value: {
    location: "Laboratorio sintético",
    inspector: "Técnica de prueba",
    summary: "Revisión de equipo sintético.",
    findings: 2
  }
});

assert.deepEqual(
  validateCaptureFields({ ...validCapture, location: "   " }),
  { valid: false, reason: "required" }
);
assert.deepEqual(
  validateCaptureFields({ ...validCapture, findings: "-1" }),
  { valid: false, reason: "findings" }
);
assert.deepEqual(
  validateCaptureFields({ ...validCapture, findings: "1.5" }),
  { valid: false, reason: "findings" }
);
assert.deepEqual(
  validateCaptureFields({ ...validCapture, findings: "9007199254740992" }),
  { valid: false, reason: "findings" }
);
assert.deepEqual(
  validateCaptureFields({ ...validCapture, summary: "x".repeat(501) }),
  { valid: false, reason: "length" }
);

console.log("capture-validation.spec.ts: PASS (normalización y entradas inválidas)");
