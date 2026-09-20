const CACHE_VERSION = "w03-v1";
const PRECACHE_NAME = `pwa-precache-${CACHE_VERSION}`;
const RUNTIME_NAME = `pwa-runtime-${CACHE_VERSION}`;
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

const isSameOrigin = (url) => url.origin === self.location.origin;
const isNavigation = (request) => request.mode === "navigate";
const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname === "/manifest.webmanifest";

const isCacheableResponse = (response) => {
  if (!response || response.status !== 200 || response.type !== "basic") return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cacheControl);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("pwa-precache-") ||
                cacheName.startsWith("pwa-runtime-")
            )
            .filter((cacheName) => ![PRECACHE_NAME, RUNTIME_NAME].includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || !isSameOrigin(url) || url.pathname.startsWith("/api/")) return;

  if (isNavigation(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStatic(request));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(RUNTIME_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    const fallbackResponse = await caches.match("/");
    return cachedResponse || fallbackResponse || offlineFallback();
  }
}

async function cacheFirstStatic(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(RUNTIME_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback();
  }
}

function offlineFallback() {
  return new Response(
    "<!doctype html><html lang=\"es-MX\"><meta charset=\"utf-8\"><title>Sin conexión</title><body><h1>Sin conexión</h1><p>No hay una versión disponible para esta solicitud.</p></body></html>",
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "X-Offline-Fallback": "true" } }
  );
}
