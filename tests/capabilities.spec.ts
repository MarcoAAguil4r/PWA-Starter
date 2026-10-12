import assert from "node:assert/strict";
import {
  CameraCaptureError,
  capturePhoto,
  type CameraCaptureOptions
} from "../src/lib/device/camera.ts";
import {
  GeolocationCapabilityError,
  getCurrentCoordinates,
  type DeviceCoordinates
} from "../src/lib/device/geolocation.ts";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showLocalNotification,
  type NotificationCapabilityStatus
} from "../src/lib/notifications/client.ts";

// ---------------------------------------------------------------------------
// Helpers de entorno (mocks sin APIs reales del navegador)
// ---------------------------------------------------------------------------

function deferred<T = unknown>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function installNavigatorAndDocument(mocks: {
  getUserMedia?: () => Promise<MediaStream>;
  geolocation?: {
    getCurrentPosition: (
      success: PositionCallback,
      error?: PositionErrorCallback,
      options?: PositionOptions
    ) => void;
  };
}) {
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const tracks = [{ stopped: 0, stop() { this.stopped += 1; } }];
  const stream = { getTracks: () => tracks } as unknown as MediaStream;

  class MockVideo {
    readyState = 1;
    videoWidth = 1280;
    videoHeight = 720;
    muted = false;
    playsInline = false;
    srcObject: MediaStream | null = null;
    paused = false;
    addEventListener() {}
    removeEventListener() {}
    play() { return Promise.resolve(); }
    pause() { this.paused = true; }
  }

  class MockCanvas {
    width = 0;
    height = 0;
    getContext() {
      return { drawImage() {} };
    }
    toBlob(callback: BlobCallback, type?: string, quality?: number) {
      callback(new Blob(["synthetic-jpeg"], { type: type ?? "image/jpeg" }));
    }
  }

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: mocks.getUserMedia
        ? { getUserMedia: mocks.getUserMedia }
        : undefined,
      geolocation: mocks.geolocation
    }
  });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tag: string) {
        if (tag === "video") return new MockVideo();
        return new MockCanvas();
      }
    }
  });

  return {
    tracks,
    stream,
    restore() {
      if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
      else delete (globalThis as { navigator?: unknown }).navigator;
      if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
      else delete (globalThis as { document?: unknown }).document;
    }
  };
}

function installNotificationApi(permission: NotificationPermission | "missing") {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "Notification");
  if (permission === "missing") {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as { Notification?: unknown }).Notification;
  } else {
    const instances: Array<{ title: string; options?: NotificationOptions }> = [];
    class MockNotification {
      static permission: NotificationPermission = permission;
      static requestPermission = async () => {
        MockNotification.permission = "granted";
        return "granted" as NotificationPermission;
      };
      constructor(title: string, options?: NotificationOptions) {
        instances.push({ title, options });
      }
    }
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: MockNotification
    });
    return {
      instances,
      restore() {
        if (previous) Object.defineProperty(globalThis, "Notification", previous);
        else delete (globalThis as { Notification?: unknown }).Notification;
      }
    };
  }
  return {
    instances: [] as Array<{ title: string; options?: NotificationOptions }>,
    restore() {
      if (previous) Object.defineProperty(globalThis, "Notification", previous);
      else delete (globalThis as { Notification?: unknown }).Notification;
    }
  };
}

// ---------------------------------------------------------------------------
// Cámara
// ---------------------------------------------------------------------------

{
  // API ausente → unsupported
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {}
  });
  await assert.rejects(
    () => capturePhoto(),
    (error: unknown) => {
      assert.ok(error instanceof CameraCaptureError);
      assert.equal(error.code, "unsupported");
      return true;
    }
  );
  if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
  else delete (globalThis as { navigator?: unknown }).navigator;
}

{
  // Opciones inválidas
  await assert.rejects(
    () => capturePhoto({ quality: 1.5 }),
    (error: unknown) => {
      assert.ok(error instanceof CameraCaptureError);
      assert.equal(error.code, "invalid-options");
      return true;
    }
  );
  await assert.rejects(
    () => capturePhoto({ maxDimension: 0 }),
    (error: unknown) => {
      assert.ok(error instanceof CameraCaptureError);
      assert.equal(error.code, "invalid-options");
      return true;
    }
  );
}

{
  // Permiso denegado
  const browser = installNavigatorAndDocument({
    getUserMedia: async () => {
      const err = new Error("denied");
      err.name = "NotAllowedError";
      throw err;
    }
  });
  try {
    await assert.rejects(
      () => capturePhoto(),
      (error: unknown) => {
        assert.ok(error instanceof CameraCaptureError);
        assert.equal(error.code, "permission-denied");
        return true;
      }
    );
  } finally {
    browser.restore();
  }
}

{
  // Captura exitosa: Blob JPEG y tracks detenidos
  const browser = installNavigatorAndDocument({
    getUserMedia: async () => browser.stream
  });
  try {
    const blob = await capturePhoto({ quality: 0.85, maxDimension: 1280 });
    assert.ok(blob instanceof Blob);
    assert.equal(blob.type, "image/jpeg");
    assert.equal(browser.tracks[0].stopped, 1, "las pistas deben detenerse al terminar");
  } finally {
    browser.restore();
  }
}

{
  // AbortSignal antes de iniciar
  const browser = installNavigatorAndDocument({
    getUserMedia: async () => browser.stream
  });
  try {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      () => capturePhoto({ signal: controller.signal }),
      (error: unknown) => {
        assert.ok(error instanceof CameraCaptureError);
        assert.equal(error.code, "aborted");
        return true;
      }
    );
  } finally {
    browser.restore();
  }
}

console.log("capabilities.spec.ts: PASS (cámara — unsupported, opciones, permiso, captura, abort)");

// ---------------------------------------------------------------------------
// Geolocalización
// ---------------------------------------------------------------------------

{
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {}
  });
  await assert.rejects(
    () => getCurrentCoordinates(),
    (error: unknown) => {
      assert.ok(error instanceof GeolocationCapabilityError);
      assert.equal(error.code, "unsupported");
      return true;
    }
  );
  if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
  else delete (globalThis as { navigator?: unknown }).navigator;
}

{
  await assert.rejects(
    () => getCurrentCoordinates({ timeoutMs: 0 }),
    (error: unknown) => {
      assert.ok(error instanceof GeolocationCapabilityError);
      assert.equal(error.code, "invalid-options");
      return true;
    }
  );
}

{
  // Éxito: solo latitude, longitude, accuracy
  const coords: DeviceCoordinates = { latitude: 18.46, longitude: -97.39, accuracy: 12 };
  const browser = installNavigatorAndDocument({
    geolocation: {
      getCurrentPosition(success) {
        success({
          coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition);
      }
    }
  });
  try {
    const result = await getCurrentCoordinates();
    assert.deepEqual(result, coords);
    assert.equal(Object.keys(result).sort().join(","), "accuracy,latitude,longitude");
  } finally {
    browser.restore();
  }
}

{
  // Permiso denegado
  const browser = installNavigatorAndDocument({
    geolocation: {
      getCurrentPosition(_success, error) {
        error?.({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: "User denied"
        } as GeolocationPositionError);
      }
    }
  });
  try {
    await assert.rejects(
      () => getCurrentCoordinates(),
      (error: unknown) => {
        assert.ok(error instanceof GeolocationCapabilityError);
        assert.equal(error.code, "permission-denied");
        return true;
      }
    );
  } finally {
    browser.restore();
  }
}

{
  // AbortSignal
  const browser = installNavigatorAndDocument({
    geolocation: {
      getCurrentPosition() {
        // nunca responde
      }
    }
  });
  try {
    const controller = new AbortController();
    const pending = getCurrentCoordinates({ signal: controller.signal });
    controller.abort();
    await assert.rejects(
      () => pending,
      (error: unknown) => {
        assert.ok(error instanceof GeolocationCapabilityError);
        assert.equal(error.code, "aborted");
        return true;
      }
    );
  } finally {
    browser.restore();
  }
}

console.log("capabilities.spec.ts: PASS (geolocalización — unsupported, opciones, éxito, permiso, abort)");

// ---------------------------------------------------------------------------
// Notificaciones locales
// ---------------------------------------------------------------------------

{
  const env = installNotificationApi("missing");
  try {
    assert.equal(getNotificationPermission(), "unsupported");
    const requested = await requestNotificationPermission();
    assert.equal(requested.status, "unsupported");
    assert.equal(requested.permission, "unsupported");
    assert.match(requested.message, /no admite notificaciones/i);

    const shown = showLocalNotification("Título", { body: "Cuerpo" });
    assert.equal(shown.status, "unsupported");
  } finally {
    env.restore();
  }
}

{
  const env = installNotificationApi("denied");
  try {
    assert.equal(getNotificationPermission(), "denied");
    const requested = await requestNotificationPermission();
    assert.equal(requested.status, "permission-denied");
    const shown = showLocalNotification("Guardada", { body: "Local" });
    assert.equal(shown.status, "permission-denied");
    assert.equal(env.instances.length, 0, "no debe crear Notification sin permiso");
  } finally {
    env.restore();
  }
}

{
  const env = installNotificationApi("granted");
  try {
    assert.equal(getNotificationPermission(), "granted");
    const shown = showLocalNotification("Inspección guardada", {
      body: "Laboratorio sintético",
      tag: "inspection-saved-test"
    });
    assert.equal(shown.status, "shown");
    assert.equal(env.instances.length, 1);
    assert.equal(env.instances[0].title, "Inspección guardada");
    assert.equal(env.instances[0].options?.tag, "inspection-saved-test");
  } finally {
    env.restore();
  }
}

{
  const env = installNotificationApi("default");
  try {
    const status: NotificationCapabilityStatus = getNotificationPermission();
    assert.equal(status, "default");
    const requested = await requestNotificationPermission();
    assert.equal(requested.status, "permission-granted");
    assert.equal(requested.permission, "granted");
  } finally {
    env.restore();
  }
}

console.log("capabilities.spec.ts: PASS (notificaciones — unsupported, denied, granted, request)");
console.log("capabilities.spec.ts: PASS (completo)");
