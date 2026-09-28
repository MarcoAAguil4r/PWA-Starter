# Decisión de renderizado: Semana 4

## Decisión y alcance

`/inspecciones` es una ruta SSR: `src/app/inspecciones/page.tsx` no declara `"use client"`, importa el arreglo sintético compartido y usa `dynamic = "force-dynamic"`. El listado y sus tres tarjetas se generan en el servidor para cada solicitud.

`/inspecciones/[id]` usa un Client Component para resolver el identificador en el cliente: declara `"use client"`, obtiene `id` con `useParams` y, dentro de `useEffect`, busca en el arreglo sintético después de 300 ms. Next.js también prerenderiza el HTML inicial de los Client Components; aquí ese HTML muestra la carga, y el detalle aparece tras hidratarse y ejecutar el efecto.

Ambas rutas trabajan exclusivamente con `src/lib/data/inspections.ts`; no hay API, datos personales ni fuente remota.

## Comparación

| Aspecto | Listado SSR (`/inspecciones`) | Detalle CSR (`/inspecciones/[id]`) |
| --- | --- | --- |
| Motivo | El contenido inicial es una lista de solo lectura y puede entregarse ya renderizado. | Demuestra estado local, carga y resolución del parámetro de ruta en cliente. |
| Ventaja esperada | El HTML inicial contiene los datos y no necesita JavaScript para que la lista sea legible. | El usuario recibe una señal de carga y el componente puede gestionar interacción/estado local. |
| Límite | Con datos remotos, el servidor debe poder obtenerlos en cada solicitud. | El contenido final depende de descargar e hidratar JavaScript; aparece un intervalo de carga intencional. |
| Complejidad | Baja: composición de datos y tarjetas. | Mayor: estado, efecto, limpieza del temporizador y ramas para encontrado/no encontrado/error. |
| Carga | Se mide el tamaño del HTML inicial y la mediana del tiempo de respuesta HTTP local. | Se mide el tamaño del HTML inicial de carga y la mediana del tiempo de respuesta HTTP local; la demora sintética posterior es de 300 ms. |
| Error / recuperación | El error boundary comunica el fallo con `role="alert"`, permite reintentar y ofrece volver al inicio. | La resolución local captura excepciones; el error boundary comunica el fallo, permite reintentar y volver al listado. |
| Accesibilidad | Los enlaces de tarjeta llevan al detalle; el listado usa estructura de artículos y los errores son anunciados como alertas. | La carga usa `role="status"` y `aria-live="polite"`; el estado inexistente explica el problema y ofrece volver al listado. |

## Medición repetible

Después de un build de producción, `npm run measure:rendering` levanta el handler de Next.js en un puerto local efímero y consulta ambas rutas. Para cada una hace una solicitud de calentamiento y cinco solicitudes medidas, valida HTTP 200 y el contenido inicial esperado, y guarda la mediana de duración HTTP (`medianResponseMs`) y los bytes de HTML (`initialHtmlBytes`) en `reports/rendering-metrics.json`. `make verify` ejecuta este paso automáticamente después del build y adjunta las métricas a `reports/verification.json`.

El tamaño HTML es repetible para el mismo build. La duración cambia según el equipo y la carga local; mide la respuesta HTTP completa, no LCP, TTI ni pintura del navegador. La ruta CSR sirve su HTML de carga inicial, no el tiempo hasta que el detalle termina de hidratarse. Los números son comparables solo con el mismo entorno, versión de Node, build y protocolo.

## Hydration mismatch

El listado evita el riesgo principal al no depender de valores variables de cliente durante su renderizado. En el detalle, el primer render determinista es `cargando`; la búsqueda usa el mismo módulo de datos sintéticos sólo después de montar el componente. No se usan fechas actuales, aleatoriedad, almacenamiento del navegador ni respuestas remotas que pudieran hacer distinto el HTML inicial y el primer render del cliente. Los error boundaries de ambos segmentos ofrecen recuperación ante excepciones de renderizado; el detalle además captura errores de resolución local.

Si los datos pasan a ser remotos, la decisión deberá revisarse: se debe definir una fuente de verdad única para servidor y cliente, serializar datos estables y manejar la carga/error real. El estado `error` actual es defensivo, pero la fuente sintética no tiene una operación que pueda fallar de forma independiente.

## Evidencia y límites

`tests/rendering.spec.ts` verifica por contrato que la lista es Server Component dinámico, conserva las tres inspecciones (`inspection-001`, `inspection-002`, `inspection-003`), enlaza al detalle y expone su `loading.tsx` y error boundary recuperable. También verifica que el detalle usa resolución cliente, muestra carga, busca por parámetro, contempla inexistente (por ejemplo, `id-inexistente`), captura error, expone su error boundary y permite volver al listado. Comprueba además el comando y los campos del instrumento de medición. La prueba se integra en `npm test`.

Las pruebas de contrato son estáticas y deterministas: detectan regresiones estructurales, pero no sustituyen un E2E en navegador ni validan hidratación real, lector de pantalla o Core Web Vitals. El build y la medición HTTP son complementarios, no una prueba visual o de accesibilidad asistiva.
