import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const workerSource = readFileSync(resolve(root, "public/sw.js"), "utf8");
const origin = "https://pwa.synthetic";
const precacheUrls = ["/", "/manifest.webmanifest", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

const keyFor = (request: string | { url: string }) => new URL(typeof request === "string" ? request : request.url, origin).href;
const basicResponse = (body: string, init: ResponseInit = {}) => {
  const response = new Response(body, init);
  Object.defineProperty(response, "type", { value: "basic" });
  return response;
};

function createRuntime(source = workerSource, fetchImpl: (request: Request | { url: string }) => Promise<Response>) {
  const stores = new Map<string, Map<string, Response>>();
  const handlers = new Map<string, (event: any) => void>();
  const clients = { claims: 0, async claim() { this.claims += 1; } };
  let skipped = 0;
  const caches = {
    async open(name: string) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name)!;
      return {
        async addAll(urls: string[]) {
          const downloaded: [string, Response][] = [];
          for (const url of urls) {
            const request = new Request(new URL(url, origin));
            const response = await fetchImpl(request);
            if (!response.ok) throw new TypeError(`Precache falló para ${url}`);
            downloaded.push([keyFor(request), response.clone()]);
          }
          for (const [key, response] of downloaded) entries.set(key, response);
        },
        async put(request: string | { url: string }, response: Response) { entries.set(keyFor(request), response.clone()); },
        async match(request: string | { url: string }) { return entries.get(keyFor(request))?.clone(); }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name: string) { return stores.delete(name); },
    async match(request: string | { url: string }) {
      for (const entries of stores.values()) {
        const response = entries.get(keyFor(request));
        if (response) return response.clone();
      }
      return undefined;
    }
  };
  const self = {
    location: new URL(origin), clients,
    addEventListener(type: string, handler: (event: any) => void) { handlers.set(type, handler); },
    skipWaiting() { skipped += 1; }
  };
  vm.runInNewContext(source, { self, caches, fetch: fetchImpl, URL, Request, Response, console });
  return { caches, clients, handlers, stores, get skipped() { return skipped; } };
}

async function runLifecycle(runtime: ReturnType<typeof createRuntime>, type: "install" | "activate") {
  const pending: Promise<unknown>[] = [];
  runtime.handlers.get(type)!({ waitUntil(value: Promise<unknown>) { pending.push(Promise.resolve(value)); } });
  await Promise.all(pending);
}

async function runFetch(runtime: ReturnType<typeof createRuntime>, request: Request | { url: string; method: string; mode: string }) {
  let response: Promise<Response> | undefined;
  runtime.handlers.get("fetch")!({ request, respondWith(value: Promise<Response>) { response = Promise.resolve(value); } });
  assert.ok(response, `El worker debe interceptar ${request.url}`);
  return response;
}

{
  const downloaded: string[] = [];
  const runtime = createRuntime(workerSource, async (request) => {
    downloaded.push(new URL(request.url).pathname);
    return basicResponse(`synthetic precache: ${request.url}`);
  });
  await runLifecycle(runtime, "install");
  const cache = await runtime.caches.open("pwa-precache-w03-v1");
  assert.deepEqual(downloaded, precacheUrls, "install debe descargar exactamente los recursos del precache real");
  for (const url of precacheUrls) assert.ok(await cache.match(url), `${url} debe quedar disponible después de install`);
}

{
  const runtime = createRuntime(workerSource, async (request) => {
    if (new URL(request.url).pathname === "/icons/icon-512x512.png") throw new TypeError("synthetic precache outage");
    return basicResponse("synthetic precache response");
  });
  await assert.rejects(runLifecycle(runtime, "install"), /synthetic precache outage/);
  const cache = await runtime.caches.open("pwa-precache-w03-v1");
  for (const url of precacheUrls) assert.equal(await cache.match(url), undefined, "un precache incompleto no debe conservar recursos parciales");
}

{
  let networkCalls = 0;
  const runtime = createRuntime(workerSource, async () => {
    networkCalls += 1;
    if (networkCalls > 1) throw new TypeError("synthetic static outage");
    return basicResponse("synthetic runtime asset");
  });
  const request = new Request(`${origin}/icons/synthetic-runtime.png`);
  assert.equal(await (await runFetch(runtime, request)).text(), "synthetic runtime asset");
  assert.equal(await (await runFetch(runtime, request)).text(), "synthetic runtime asset");
  assert.equal(networkCalls, 1, "un recurso estático cacheado debe usar la estrategia cache-first");
  const runtimeCache = await runtime.caches.open("pwa-runtime-w03-v1");
  assert.ok(await runtimeCache.match(request), "la respuesta estática válida debe quedar en runtime cache");
}

{
  const runtime = createRuntime(workerSource, async () => basicResponse("synthetic version response"));
  await (await runtime.caches.open("pwa-precache-w03-old")).put("/synthetic-old", basicResponse("old"));
  await (await runtime.caches.open("pwa-runtime-w03-old")).put("/synthetic-old", basicResponse("old"));
  await (await runtime.caches.open("foreign-synthetic-cache")).put("/synthetic", basicResponse("keep"));
  await runLifecycle(runtime, "activate");
  assert.deepEqual(await runtime.caches.keys(), ["foreign-synthetic-cache"], "activate debe invalidar sólo caches obsoletos propios");
  assert.equal(runtime.clients.claims, 1, "activate debe reclamar los clientes");
}

{
  const upgradedSource = workerSource.replace('const CACHE_VERSION = "w03-v1";', 'const CACHE_VERSION = "w03-synthetic-v2";');
  assert.notEqual(upgradedSource, workerSource, "la prueba debe poder simular una nueva versión del worker");
  const runtime = createRuntime(upgradedSource, async () => basicResponse("synthetic upgraded precache"));
  await (await runtime.caches.open("pwa-precache-w03-v1")).put("/", basicResponse("old shell"));
  await (await runtime.caches.open("pwa-runtime-w03-v1")).put("/synthetic", basicResponse("old runtime"));
  await runLifecycle(runtime, "install");
  await runLifecycle(runtime, "activate");
  assert.ok((await runtime.caches.keys()).includes("pwa-precache-w03-synthetic-v2"));
  assert.ok(!(await runtime.caches.keys()).includes("pwa-precache-w03-v1"), "una versión nueva debe retirar su precache anterior");
  assert.ok(!(await runtime.caches.keys()).includes("pwa-runtime-w03-v1"), "una versión nueva debe retirar su runtime cache anterior");
}

console.log("service-worker.spec.ts: PASS (instalación, precache, runtime, actualización e invalidación)");
