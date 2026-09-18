# Estrategia de caché — Semana 3

## Objetivo

Mantener disponible el app shell de inspecciones cuando la conectividad falle, sin convertir el service worker en un almacén indiscriminado de datos. Esta entrega usa únicamente datos sintéticos y no implementa todavía una cola de sincronización.

## Nombres y versionado

- `pwa-precache-w03-v1`: recursos mínimos conocidos antes de instalar el worker.
- `pwa-runtime-w03-v1`: documentos y recursos estáticos obtenidos durante el uso.
- El cambio de `w03-v1` a una nueva versión crea cachés nuevas y permite eliminar las anteriores durante `activate`.
- La instalación solo activa una nueva versión si el precache completo termina correctamente; así una versión incompleta no reemplaza a la anterior.

## Precache

`public/sw.js` precachea `/`, `/manifest.webmanifest` y los dos iconos públicos. Son recursos del shell que se conocen de antemano y permiten recuperar la aplicación base sin red.

## Runtime cache

Se usa una estrategia **network first** para navegaciones: la respuesta fresca tiene prioridad y una copia válida queda disponible para el siguiente fallo de red. Para recursos estáticos de Next (`/_next/static/`), iconos y manifest se usa **cache first**, porque sus nombres o contenido son estables durante una versión desplegada.

Solo se consideran respuestas `200`, básicas y sin `Cache-Control: private` o `no-store`. Se aceptan únicamente peticiones `GET` del mismo origen. Las rutas `/api/`, peticiones mutantes, solicitudes cross-origin y respuestas privadas quedan fuera del runtime cache.

## Fallback offline

Ante un error de red en una navegación, se intenta primero la URL solicitada y luego `/`, que forma parte del precache. Si ninguno está disponible, el worker devuelve una respuesta HTML `503` explícita, sin almacenarla. Esto comunica la limitación sin presentar datos inventados como si fueran actuales.

## Ciclo de vida y actualización

- `install` prepara el precache; si falla, la versión nueva no se considera lista.
- `activate` elimina solo cachés antiguas con los prefijos propios de esta aplicación y reclama los clientes.
- No se fuerza `skipWaiting` durante una instalación normal. El mensaje `SKIP_WAITING` existe para una invalidación controlada desde una futura UI administrativa, no se envía automáticamente.
- No se eliminan cachés ajenas al prefijo `pwa-`.

## Límites y riesgos

Esta estrategia cachea la interfaz y recursos públicos, no inspecciones remotas, credenciales, tokens, respuestas de API ni información personal. La persistencia de formularios y la sincronización posterior quedan fuera de esta actividad y requieren IndexedDB, una política de conflictos y pruebas separadas.
