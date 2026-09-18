export function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
    console.error("No se pudo registrar el service worker.", error);
  });
}
