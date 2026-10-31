import { isSyncOperation } from "../../../../lib/storage/schema";
import { parseBoundedJsonRequest } from "../../../../lib/security/input-validation";
import { inspectionSyncServer } from "../../../../lib/sync/synthetic-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBoundedJsonRequest(request);
  if (!parsed.ok) {
    const status = parsed.reason === "payload-too-large" ? 413 : 400;
    return Response.json({ ok: false, retryable: false, reason: parsed.reason }, { status });
  }

  if (!isSyncOperation(parsed.value)) {
    return Response.json({ ok: false, retryable: false, reason: "invalid-sync-operation" }, { status: 400 });
  }

  const result = inspectionSyncServer.apply(parsed.value);
  if (!result.ok && !result.retryable) {
    return Response.json(result, { status: 409 });
  }

  return Response.json(result, { status: result.ok ? 200 : 503 });
}