export const SECURITY_INPUT_LIMITS = {
  inspectionId: 128,
  location: 120,
  inspector: 120,
  statusLabel: 80,
  summary: 500,
  idempotencyKey: 200
} as const;

export function isBoundedText(value: unknown, maxLength: number): value is string {
  return (
    Number.isSafeInteger(maxLength) &&
    maxLength > 0 &&
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

export const MAX_SYNC_REQUEST_BYTES = 16 * 1024;

export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "invalid-json" | "payload-too-large" };

export async function parseBoundedJsonRequest(request: Request): Promise<BoundedJsonResult> {
  if (!request.body) return { ok: false, reason: "invalid-json" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_SYNC_REQUEST_BYTES) {
      await reader.cancel();
      return { ok: false, reason: "payload-too-large" };
    }

    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
}
