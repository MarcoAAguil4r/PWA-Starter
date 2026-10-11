export type GeolocationErrorCode =
  | "unsupported"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "aborted"
  | "invalid-options";

export class GeolocationCapabilityError extends Error {
  readonly code: GeolocationErrorCode;
  readonly cause?: unknown;

  constructor(
    code: GeolocationErrorCode,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = "GeolocationCapabilityError";
    this.code = code;
    this.cause = cause;
  }
}

export type GeolocationOptions = {
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
  signal?: AbortSignal;
};

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_TIMEOUT_MS = 60_000;

function validateOptions(options: GeolocationOptions): PositionOptions {
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maximumAge = options.maximumAgeMs ?? 0;
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > MAX_TIMEOUT_MS) {
    throw new GeolocationCapabilityError("invalid-options", `El tiempo límite debe ser un entero entre 1 y ${MAX_TIMEOUT_MS} ms.`);
  }
  if (!Number.isInteger(maximumAge) || maximumAge < 0) {
    throw new GeolocationCapabilityError("invalid-options", "La antigüedad máxima debe ser un entero igual o mayor que cero.");
  }
  return {
    enableHighAccuracy: options.enableHighAccuracy ?? false,
    timeout,
    maximumAge
  };
}

function mapPositionError(error: GeolocationPositionError): GeolocationCapabilityError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new GeolocationCapabilityError("permission-denied", "El usuario denegó el acceso a la ubicación.", error);
    case error.POSITION_UNAVAILABLE:
      return new GeolocationCapabilityError("unavailable", "El dispositivo no pudo determinar la ubicación.", error);
    case error.TIMEOUT:
      return new GeolocationCapabilityError("timeout", "La solicitud de ubicación excedió el tiempo límite.", error);
    default:
      return new GeolocationCapabilityError("unavailable", "No se pudo obtener la ubicación del dispositivo.", error);
  }
}

/**
 * Requests one location fix on explicit user action and returns only coordinates and accuracy.
 * The result is not persisted; aborting ignores a late browser callback.
 */
export async function getCurrentCoordinates(options: GeolocationOptions = {}): Promise<DeviceCoordinates> {
  const positionOptions = validateOptions(options);
  if (options.signal?.aborted) {
    throw new GeolocationCapabilityError("aborted", "La solicitud de ubicación fue interrumpida.");
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new GeolocationCapabilityError("unsupported", "Este navegador no ofrece geolocalización.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => options.signal?.removeEventListener("abort", onAbort);
    const rejectOnce = (error: GeolocationCapabilityError) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => rejectOnce(
      new GeolocationCapabilityError("aborted", "La solicitud de ubicación fue interrumpida.")
    );
    const succeed = (position: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    };

    options.signal?.addEventListener("abort", onAbort, { once: true });
    try {
      navigator.geolocation.getCurrentPosition(
        succeed,
        (error) => rejectOnce(mapPositionError(error)),
        positionOptions
      );
    } catch (cause) {
      rejectOnce(new GeolocationCapabilityError("unavailable", "No se pudo iniciar la solicitud de ubicación.", cause));
    }
  });
}
