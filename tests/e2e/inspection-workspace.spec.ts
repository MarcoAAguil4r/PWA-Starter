import { expect, test, type Page } from "@playwright/test";

const databaseName = "pwa-inspections";

async function waitForWorkspace(page: Page) {
  await page.goto("/inspecciones");
  await expect(page.getByRole("heading", { name: "Registrar inspección sintética" })).toBeVisible();
  await expect(page.getByText(/Registros locales cargados|Modo sin conexión/)).toBeVisible();
}

async function waitForServiceWorkerReady(page: Page) {
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
}

async function inspectLocalState(page: Page) {
  return page.evaluate(async (name) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = <T>(storeName: string) => new Promise<T[]>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
    const [inspections, operations] = await Promise.all([read<{ inspection: { location: string }; syncStatus: string }>("inspections"), read("syncQueue")]);
    database.close();
    return { inspections, operations };
  }, databaseName);
}

async function completeCapture(page: Page, location: string) {
  await page.getByLabel("Ubicación").fill(location);
  await page.getByLabel("Responsable").fill("Personal sintético E2E");
  await page.getByLabel("Hallazgos").fill("2");
  await page.getByLabel("Resumen").fill("Captura sintética creada por una prueba E2E.");
  await page.getByRole("button", { name: "Guardar captura" }).click();
}

test("persiste offline tras recargar y sincroniza una sola operación remota", async ({ page, context }) => {
  const remoteOperations = new Map<string, { inspection: { id: string }; revision: number }>();
  let syncRequests = 0;
  await page.route("**/api/inspections/sync", async (route) => {
    syncRequests += 1;
    const operation = route.request().postDataJSON() as {
      idempotencyKey: string;
      inspectionId: string;
      payload: { id: string };
    };
    const existing = remoteOperations.get(operation.idempotencyKey);
    const remote = existing ?? { inspection: operation.payload, revision: 1 };
    remoteOperations.set(operation.idempotencyKey, remote);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, remote }) });
  });

  await waitForWorkspace(page);
  await waitForServiceWorkerReady(page);
  // A controlled, online reload stores this exact navigation in the worker runtime cache.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Registrar inspección sintética" })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await context.setOffline(true);
  const location = "Laboratorio E2E sin conexión";
  await completeCapture(page, location);
  await expect(page.getByText("Captura guardada sin conexión y marcada como pendiente.")).toBeVisible();
  await expect(page.locator("article.inspection-card").filter({ hasText: location })).toContainText("pending");
  await expect.poll(() => inspectLocalState(page)).toMatchObject({
    inspections: expect.arrayContaining([expect.objectContaining({ inspection: expect.objectContaining({ location }), syncStatus: "pending" })]),
    operations: [expect.anything()]
  });

  await page.reload();
  await expect(page.getByRole("heading", { name: "Registrar inspección sintética" })).toBeVisible();
  await expect(page.locator("article.inspection-card").filter({ hasText: location })).toContainText("pending");

  await context.setOffline(false);
  await expect(page.locator("article.inspection-card").filter({ hasText: location })).toContainText("synced");
  await expect.poll(() => inspectLocalState(page)).toMatchObject({ operations: [] });

  await page.getByRole("button", { name: "Sincronizar pendientes" }).click();
  await expect.poll(() => remoteOperations.size).toBe(1);
  expect(syncRequests).toBe(1);
});

test("el rechazo de cámara conserva disponible el registro sin fotografía", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: () => Promise.reject(new DOMException("denied by E2E fixture", "NotAllowedError"))
      }
    });
  });

  await waitForWorkspace(page);
  await page.getByRole("button", { name: "Capturar fotografía" }).click();
  await expect(page.locator('p[role="alert"]').filter({ hasText: "Se denegó el permiso de cámara" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Guardar captura" })).toBeEnabled();

  const location = "Laboratorio E2E cámara denegada";
  await completeCapture(page, location);
  await expect(page.locator("article.inspection-card").filter({ hasText: location })).toBeVisible();
});
