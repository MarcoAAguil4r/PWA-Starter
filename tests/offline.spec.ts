import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const workerSource = readFileSync(resolve(root, "public/sw.js"), "utf8");
const origin = "https://pwa.synthetic";
const keyFor = (request: string | { url: string }) => new URL(typeof request === "string" ? request : request.url, origin).href;
const basicResponse = (body: string, init: ResponseInit = {}) => {
  const response = new Response(body, init);
  Object.defineProperty(response, "type", { value: "basic" });
  return response;
};

function createRuntime(fetchImpl: (request: Request | { url: string }) => Promise<Response>) {
  const stores = new Map<string, Map<string, Response>>();
  const handlers = new Map<string, (event: any) => void>();
  const caches = {
    async open(name: string) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name)!;
      return {
        async addAll() {},
        async put(request: string | { url: string }, response: Response) { entries.set(keyFor(request), response.clone()); },
        async match(request: string | { url: string }) { return entries.get(keyFor(request))?.clone(); }
      };
    },
    async match(request: string | { url: string }) {
      for (const entries of stores.values()) {
        const response = entries.get(keyFor(request));
        if (response) return response.clone();
      }
      return undefined;
    },
    async keys() { return [...stores.keys()]; },
    async delete(name: string) { return stores.delete(name); }
  };
  const self = {
    location: new URL(origin), clients: { async claim() {} }, addEventListener(type: string, handler: (event: any) => void) { handlers.set(type, handler); }, skipWaiting() {}
  };
  vm.runInNewContext(workerSource, { self, caches, fetch: fetchImpl, URL, Request, Response, console });
  return { caches, handlers };
}

async function runFetch(runtime: ReturnType<typeof createRuntime>, request: Request | { url: string; method: string; mode: string }) {
  let response: Promise<Response> | undefined;
  runtime.handlers.get("fetch")!({ request, respondWith(value: Promise<Response>) { response = Promise.resolve(value); } });
  assert.ok(response, `El worker debe interceptar ${request.url}`);
  return response;
}

const navigation = (path: string) => ({ url: `${origin}${path}`, method: "GET", mode: "navigate" });

{
  const runtime = createRuntime(async () => { throw new TypeError("synthetic offline"); });
  const response = await runFetch(runtime, new Request(`${origin}/icons/synthetic-missing.png`));
  assert.equal(response.status, 503, "un recurso estático sin red ni cache debe usar el fallback real");
  assert.equal(response.headers.get("X-Offline-Fallback"), "true");
  assert.match(await response.text(), /Sin conexión/);
}

{
  const runtime = createRuntime(async () => { throw new TypeError("synthetic navigation outage"); });
  const requested = navigation("/synthetic-incident-001");
  await (await runtime.caches.open("pwa-runtime-w03-v1")).put(requested, basicResponse("synthetic cached navigation"));
  const response = await runFetch(runtime, requested);
  assert.equal(response.status, 200, "un fallo de red de navegación debe recuperarse desde la cache solicitada");
  assert.equal(await response.text(), "synthetic cached navigation");
}

{
  let online = true;
  const runtime = createRuntime(async () => {
    if (!online) throw new TypeError("synthetic intermittent outage");
    return basicResponse(online ? "synthetic fresh v1" : "unreachable");
  });
  const requested = navigation("/synthetic-recovery");
  assert.equal(await (await runFetch(runtime, requested)).text(), "synthetic fresh v1");
  online = false;
  assert.equal(await (await runFetch(runtime, requested)).text(), "synthetic fresh v1", "sin red, navigation debe recuperar la última respuesta válida");
  online = true;
  const recovered = basicResponse("synthetic fresh v2");
  let recoveredOnce = false;
  const recoveredRuntime = createRuntime(async () => {
    if (!recoveredOnce) { recoveredOnce = true; return recovered; }
    throw new Error("not used");
  });
  const prior = await runtime.caches.open("pwa-runtime-w03-v1");
  const priorResponse = await prior.match(requested);
  await (await recoveredRuntime.caches.open("pwa-runtime-w03-v1")).put(requested, priorResponse!);
  assert.equal(await (await runFetch(recoveredRuntime, requested)).text(), "synthetic fresh v2", "al recuperar red, network-first debe entregar una respuesta fresca");
  assert.equal(await (await (await recoveredRuntime.caches.open("pwa-runtime-w03-v1")).match(requested))!.text(), "synthetic fresh v2");
}

{
  let first = true;
  const runtime = createRuntime(async () => {
    if (first) { first = false; return basicResponse("synthetic server failure", { status: 500 }); }
    throw new TypeError("synthetic retry outage");
  });
  const requested = navigation("/synthetic-invalid-response");
  const failedResponse = await runFetch(runtime, requested);
  assert.equal(failedResponse.status, 500, "la respuesta de red inválida se entrega, pero no debe persistirse");
  const cache = await runtime.caches.open("pwa-runtime-w03-v1");
  assert.equal(await cache.match(requested), undefined, "una respuesta HTTP no exitosa no debe corromper runtime cache");
  const fallback = await runFetch(runtime, requested);
  assert.ok(fallback, "un fallo de red sin cache válida debe producir el fallback offline, no undefined");
  assert.equal(fallback.status, 503, "sin una respuesta válida cacheada, el reintento fallido debe usar fallback, no datos corruptos");
}

console.log("offline.spec.ts: PASS (fallback, fallos de red, recuperación y protección de cache)");
