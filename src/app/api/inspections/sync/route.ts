import { isSyncOperation } from "../../../../lib/storage/schema";
import { inspectionSyncServer } from "../../../../lib/sync/synthetic-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, retryable: false, reason: "invalid-json" }, { status: 400 });
  }

  if (!isSyncOperation(body)) {
    return Response.json({ ok: false, retryable: false, reason: "invalid-sync-operation" }, { status: 400 });
  }

  const result = inspectionSyncServer.apply(body);
  if (!result.ok && !result.retryable) {
    return Response.json(result, { status: 409 });
  }

  return Response.json(result, { status: result.ok ? 200 : 503 });
}