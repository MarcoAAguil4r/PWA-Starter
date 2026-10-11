export type CameraCaptureErrorCode =
  | "unsupported"
  | "permission-denied"
  | "unavailable"
  | "aborted"
  | "invalid-options"
  | "capture-failed";

export class CameraCaptureError extends Error {
  readonly code: CameraCaptureErrorCode;
  readonly cause?: unknown;

  constructor(
    code: CameraCaptureErrorCode,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = "CameraCaptureError";
    this.code = code;
    this.cause = cause;
  }
}

export type CameraCaptureOptions = {
  facingMode?: "user" | "environment";
  quality?: number;
  maxDimension?: number;
  signal?: AbortSignal;
};

function errorName(error: unknown): string {
  if (typeof error === "object" && error !== null && "name" in error && typeof error.name === "string") {
    return error.name;
  }
  return "";
}

function mapCameraError(error: unknown): CameraCaptureError {
  switch (errorName(error)) {
    case "NotAllowedError":
    case "SecurityError":
      return new CameraCaptureError("permission-denied", "El navegador denegó el acceso a la cámara.", error);
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return new CameraCaptureError("unavailable", "No se encontró una cámara compatible.", error);
    case "AbortError":
      return new CameraCaptureError("aborted", "La captura de cámara fue interrumpida.", error);
    default:
      return new CameraCaptureError("capture-failed", "No se pudo capturar la evidencia con la cámara.", error);
  }
}

function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

function waitForCameraStream(request: Promise<MediaStream>, signal: AbortSignal): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new CameraCaptureError("aborted", "La captura de cámara fue interrumpida."));
    };

    signal.addEventListener("abort", onAbort, { once: true });
    request.then((stream) => {
      if (settled || signal.aborted) {
        stopStream(stream);
        onAbort();
        return;
      }
      settled = true;
      cleanup();
      resolve(stream);
    }, (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(mapCameraError(error));
    });
    if (signal.aborted) onAbort();
  });
}

function waitWithAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      cleanup();
      reject(new CameraCaptureError("aborted", "La captura de cámara fue interrumpida."));
    };

    signal.addEventListener("abort", onAbort, { once: true });
    operation.then((value) => {
      cleanup();
      if (signal.aborted) onAbort();
      else resolve(value);
    }, (error: unknown) => {
      cleanup();
      if (signal.aborted) onAbort();
      else reject(error);
    });
    if (signal.aborted) onAbort();
  });
}

function waitForVideoMetadata(video: HTMLVideoElement, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new CameraCaptureError("capture-failed", "No se pudo leer el video de la cámara."));
    };
    const onAbort = () => {
      cleanup();
      reject(new CameraCaptureError("aborted", "La captura de cámara fue interrumpida."));
    };

    if (signal?.aborted) {
      reject(new CameraCaptureError("aborted", "La captura de cámara fue interrumpida."));
      return;
    }

    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });

    if (video.readyState >= 1) onLoaded();
  });
}

function validateOptions(options: CameraCaptureOptions): Required<Pick<CameraCaptureOptions, "facingMode" | "quality" | "maxDimension">> {
  const quality = options.quality ?? 0.85;
  const maxDimension = options.maxDimension ?? 1280;
  if (!Number.isFinite(quality) || quality <= 0 || quality > 1) {
    throw new CameraCaptureError("invalid-options", "La calidad de imagen debe ser mayor que 0 y como máximo 1.");
  }
  if (!Number.isInteger(maxDimension) || maxDimension < 1 || maxDimension > 4096) {
    throw new CameraCaptureError("invalid-options", "La dimensión máxima debe ser un entero entre 1 y 4096 píxeles.");
  }
  return {
    facingMode: options.facingMode ?? "environment",
    quality,
    maxDimension
  };
}

/**
 * Captures one compressed image on explicit user action and releases the camera immediately.
 * The returned Blob stays in memory; this helper does not persist or upload it.
 */
export async function capturePhoto(options: CameraCaptureOptions = {}): Promise<Blob> {
  const { facingMode, quality, maxDimension } = validateOptions(options);
  if (options.signal?.aborted) {
    throw new CameraCaptureError("aborted", "La captura de cámara fue interrumpida.");
  }
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new CameraCaptureError("unsupported", "Este navegador no ofrece acceso a la cámara.");
  }
  if (typeof document === "undefined") {
    throw new CameraCaptureError("unsupported", "La cámara solo está disponible en el navegador.");
  }

  let stream: MediaStream | null = null;
  let video: HTMLVideoElement | null = null;
  const captureController = new AbortController();
  const abortCapture = () => captureController.abort();
  options.signal?.addEventListener("abort", abortCapture, { once: true });

  try {
    stream = await waitForCameraStream(
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode } }
      }),
      captureController.signal
    );
    video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await Promise.all([
      waitWithAbort(video.play(), captureController.signal),
      waitForVideoMetadata(video, captureController.signal)
    ]);
    if (options.signal?.aborted) {
      throw new CameraCaptureError("aborted", "La captura de cámara fue interrumpida.");
    }
    if (!video.videoWidth || !video.videoHeight) {
      throw new CameraCaptureError("capture-failed", "La cámara no entregó un cuadro válido.");
    }

    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new CameraCaptureError("capture-failed", "No se pudo preparar la imagen de evidencia.");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const encoding = new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new CameraCaptureError("capture-failed", "El navegador no pudo codificar la imagen."));
      }, "image/jpeg", quality);
    });
    return await waitWithAbort(encoding, captureController.signal);
  } catch (error) {
    if (error instanceof CameraCaptureError) throw error;
    throw mapCameraError(error);
  } finally {
    captureController.abort();
    options.signal?.removeEventListener("abort", abortCapture);
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    if (stream) stopStream(stream);
  }
}
