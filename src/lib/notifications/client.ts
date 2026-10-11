export type NotificationCapabilityStatus =
  | "checking"
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

export type NotificationResult = {
  status: "shown" | "permission-granted" | "permission-default" | "permission-denied" | "unsupported" | "failed";
  permission: NotificationCapabilityStatus;
  message: string;
};

export type LocalNotificationOptions = {
  body: string;
  tag?: string;
};

function hasNotificationApi(): boolean {
  return typeof Notification !== "undefined";
}

export function getNotificationPermission(): NotificationCapabilityStatus {
  try {
    return hasNotificationApi() ? Notification.permission : "unsupported";
  } catch {
    return "unsupported";
  }
}

/** Call only from an explicit user gesture, never during rendering or module load. */
export async function requestNotificationPermission(): Promise<NotificationResult> {
  const permission = getNotificationPermission();
  if (permission === "unsupported") {
    return { status: "unsupported", permission, message: "Este navegador no admite notificaciones. Los avisos seguirán visibles en la aplicación." };
  }
  if (permission === "granted") {
    return { status: "permission-granted", permission, message: "Las notificaciones ya están habilitadas." };
  }
  if (permission === "denied") {
    return { status: "permission-denied", permission, message: "Las notificaciones están bloqueadas en el navegador. Los avisos seguirán visibles en la aplicación." };
  }

  try {
    const nextPermission = await Notification.requestPermission();
    if (nextPermission === "granted") {
      return { status: "permission-granted", permission: nextPermission, message: "Notificaciones habilitadas." };
    }
    if (nextPermission === "denied") {
      return { status: "permission-denied", permission: nextPermission, message: "No se concedió permiso para notificaciones. Los avisos seguirán visibles en la aplicación." };
    }
    return { status: "permission-default", permission: nextPermission, message: "El permiso de notificaciones permanece pendiente." };
  } catch {
    return { status: "failed", permission: getNotificationPermission(), message: "No se pudo solicitar el permiso de notificaciones. Los avisos seguirán visibles en la aplicación." };
  }
}

export function showLocalNotification(title: string, options: LocalNotificationOptions): NotificationResult {
  const permission = getNotificationPermission();
  if (permission === "unsupported") {
    return { status: "unsupported", permission, message: "Este navegador no admite notificaciones. Los avisos siguen visibles en la aplicación." };
  }
  if (permission !== "granted") {
    return { status: permission === "denied" ? "permission-denied" : "permission-default", permission, message: "No hay permiso para mostrar una notificación; el aviso permanece visible en la aplicación." };
  }
  try {
    new Notification(title, { body: options.body, tag: options.tag });
    return { status: "shown", permission, message: "Notificación mostrada." };
  } catch {
    return { status: "failed", permission, message: "No se pudo mostrar la notificación; el aviso permanece visible en la aplicación." };
  }
}
