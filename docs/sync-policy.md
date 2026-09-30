# Política de persistencia y conflictos

## Contrato local

La base IndexedDB se llama `pwa-inspections` y comienza en la versión 1. `upgradeInspectionDatabase()` crea tres stores:

| Store | Clave | Uso |
| --- | --- | --- |
| `inspections` | `id` | Inspección y metadatos locales/remotos de revisión y sincronización. |
| `syncQueue` | `idempotencyKey` | Operación pendiente, payload sintético, revisión base, fecha y contador de intentos. |
| `conflicts` | `conflictId` | Copias local y remota que requieren conservarse cuando ambas divergen. |

Al abrir la base, la capa de almacenamiento debe llamar a `upgradeInspectionDatabase(request.result, request.transaction)` desde `onupgradeneeded`. La revisión local es un entero creciente por inspección. `baseServerRevision` identifica la versión remota sobre la que se hizo la edición; la revisión del servidor debe ser monotónica. Los timestamps sirven para auditoría, no para decidir cuál edición gana, porque los relojes de dispositivos pueden diferir.

Los validadores `isInspection`, `isStoredInspection`, `isSyncOperation` e `isInspectionConflict` comprueban los datos que cruzan la frontera de persistencia. Solo se usan registros sintéticos; no se guardan credenciales ni datos personales reales.

## Idempotencia y reintentos

Cada operación de escritura conserva su `idempotencyKey` estable durante todos los reintentos. El transporte remoto debe tratar dos solicitudes con la misma clave como una sola operación y devolver el resultado original. No se genera una clave nueva al reintentar. La implementación de la cola define el calendario y el límite de reintentos; la clave y el payload deben persistirse antes de iniciar una solicitud.

## Resolución de conflictos

`resolveInspectionConflict()` aplica estas reglas en orden:

1. Si el payload remoto ya coincide con el local, lo trata como aplicado. Esto cubre la respuesta perdida seguida de un reintento idempotente.
2. Si la respuesta remota tiene una revisión anterior a `baseServerRevision`, la ignora como respuesta fuera de orden.
3. Si la revisión remota coincide con `baseServerRevision`, permite enviar el cambio local con esa revisión como precondición.
4. Si la revisión remota avanzó, el servidor prevalece como versión canónica y se devuelve un `InspectionConflict` con ambas copias y sus revisiones. La copia local no se descarta: debe persistirse en `conflicts` y marcarse para resolución explícita posterior.

No se fusionan campos automáticamente ni se comparan relojes. Esta política evita sobrescribir silenciosamente una edición remota y evita perder el borrador local. La interfaz o el operador podrá decidir posteriormente si descarta o vuelve a aplicar la copia local, siempre contra la revisión remota más reciente.

## Límites de esta integración

La aplicación usa `IndexedDbInspectionStore` en el navegador: las capturas y la cola sobreviven a la recarga, y el evento `online` vuelve a procesar la cola. Un cerrojo en memoria evita dos procesos de sincronización simultáneos en la misma pestaña. Los errores de IndexedDB o transporte se muestran como recuperables y la operación no se elimina antes de una confirmación, conflicto o abandono explícito.

El transporte es `createSyntheticTransport()`: un adaptador determinista sólo para la demo y pruebas locales; **no es un backend ni sincroniza entre dispositivos**. El límite de reintentos es 5 y los errores no recuperables se abandonan explícitamente. La resolución de conflicto persiste el `InspectionConflict` con ambos snapshots antes de marcar el registro local como `conflict`. No hay aún UI para resolver ese conflicto ni reintento con espera exponencial entre intentos.


## Cola de sincronización (Integrante 2)

`src/lib/sync/queue.ts` consume los tipos y la política de conflictos definidos arriba sin importarlos directamente como dependencia de valor: `processPendingOperations()` recibe `resolveConflict` como parámetro (inyección de dependencia). Esto evita un conflicto real entre dos entornos de ejecución de este proyecto — el build de Next (bundler, sin extensión `.ts` en imports dentro de `src/`) y la ejecución directa con `node` en las pruebas (que sí exige extensión explícita para resolver imports de valor) — y de paso hace la cola más fácil de probar sin mocks: las pruebas inyectan la función real de `conflict-policy.ts`.

**Persistencia de pendientes:** `SyncQueueStore` es una interfaz abstracta (IndexedDB en el navegador, un Map en memoria en pruebas). `processPendingOperations()` nunca guarda su propio estado fuera de ese store, por lo que una operación pendiente sobrevive a un cierre de pestaña: una nueva llamada sobre el mismo store persistente retoma exactamente donde quedó.

**Deduplicación:** `enqueueOperation()` verifica `idempotencyKey` antes de guardar; una clave repetida no crea una segunda entrada en la cola.

**Reintentos:** cada operación lleva su contador `attempts`. Un fallo marcado como `retryable` incrementa el contador y deja la operación pendiente; al alcanzar `maxAttempts` (5 por defecto) se abandona explícitamente en vez de reintentar indefinidamente. Un fallo no retryable (por ejemplo, un error de validación) se abandona de inmediato.

**Protección ante respuestas fuera de orden:** las operaciones se procesan en orden de `createdAt`. Cuando `resolveInspectionConflict` clasifica una respuesta como `ignore-stale-response` (revisión remota anterior a la ya confirmada), la cola no toca el estado local ni retira la operación — se ignora la respuesta obsoleta y la operación sigue pendiente para la siguiente ronda.

**Integración de interfaz:** `InspectionWorkspace` abre IndexedDB, siembra sólo los tres ejemplos sintéticos iniciales cuando la base está vacía y desde entonces representa los registros persistidos. El formulario valida los datos antes de crear una operación con clave idempotente estable. `tests/sync.spec.ts` usa un adaptador programable y el adaptador de la interfaz es también sintético; ninguno debe confundirse con un backend real.
