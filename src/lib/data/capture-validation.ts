export type CaptureFields = {
  location: unknown;
  inspector: unknown;
  summary: unknown;
  findings: unknown;
};

export type ValidCapture = {
  location: string;
  inspector: string;
  summary: string;
  findings: number;
};

export type CaptureValidation =
  | { valid: true; value: ValidCapture }
  | { valid: false; reason: "required" | "length" | "findings" };

export function validateCaptureFields(fields: CaptureFields): CaptureValidation {
  if (
    typeof fields.location !== "string" ||
    typeof fields.inspector !== "string" ||
    typeof fields.summary !== "string"
  ) {
    return { valid: false, reason: "required" };
  }

  const location = fields.location.trim();
  const inspector = fields.inspector.trim();
  const summary = fields.summary.trim();

  if (!location || !inspector || !summary) {
    return { valid: false, reason: "required" };
  }

  if (location.length > 120 || inspector.length > 120 || summary.length > 500) {
    return { valid: false, reason: "length" };
  }

  const findings =
    typeof fields.findings === "string" && fields.findings.trim() !== ""
      ? Number(fields.findings)
      : fields.findings;

  if (typeof findings !== "number" || !Number.isSafeInteger(findings) || findings < 0) {
    return { valid: false, reason: "findings" };
  }

  return {
    valid: true,
    value: { location, inspector, summary, findings }
  };
}
