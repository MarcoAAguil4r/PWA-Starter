# Decisión de renderizado: Semana 4

## Decisión y alcance

`/inspecciones` es una ruta SSR: `src/app/inspecciones/page.tsx` no declara `"use client"`, importa el arreglo sintético compartido y usa `dynamic = "force-dynamic"`. El listado y sus tres tarjetas se generan en el servidor para cada solicitud.

`/inspecciones/[id]` es una ruta CSR: declara `"use client"`, obtiene `id` con `useParams` y, dentro de `useEffect`, resuelve el arreglo sintético después de 300 ms. Esto permite observar el estado de carga y cambiar de detalle sin trasladar el estado de interacción al servidor.

Ambas rutas trabajan exclusivamente con `src/lib/data/inspections.ts`; no hay API, datos personales ni fuente remota.

## Comparación

| Aspecto | Listado SSR (`/inspecciones`) | Detalle CSR (`/inspecciones/[id]`) |
| --- | --- | --- |
| Motivo | El contenido inicial es una lista de solo lectura y puede entregarse ya renderizado. | Demuestra estado local, carga y resolución del parámetro de ruta en cliente. |
| Ventaja esperada | El HTML inicial contiene los datos y no necesita JavaScript para que la lista sea legible. | El usuario recibe una señal de carga y el componente puede gestionar interacción/estado local. |
| Límite | Con datos remotos, el servidor debe poder obtenerlos en cada solicitud. | El contenido final depende de descargar e hidratar JavaScript; aparece un intervalo de carga intencional. |
| Complejidad | Baja: composición de datos y tarjetas. | Mayor: estado, efecto, limpieza del temporizador y ramas para encontrado/no encontrado/error. |
| Carga | No se midió una métrica de rendimiento. Técnicamente se espera contenido útil inicial en la respuesta SSR. | No se midió una métrica de rendimiento. El código programa una espera sintética de 300 ms antes de mostrar el detalle. |
| Accesibilidad | Los enlaces de tarjeta llevan al detalle y el listado usa estructura de artículos. | La carga usa `role="status"` y `aria-live="polite"`; el estado inexistente comunica el problema y ofrece el enlace “Volver al listado”. |

## Hydration mismatch

El listado evita el riesgo principal al no depender de valores variables de cliente durante su renderizado. En el detalle, el primer render determinista es `cargando`; la búsqueda usa el mismo módulo de datos sintéticos sólo después de montar el componente. No se usan fechas actuales, aleatoriedad, almacenamiento del navegador ni respuestas remotas que pudieran hacer distinto el HTML inicial y el primer render del cliente.

Si los datos pasan a ser remotos, la decisión deberá revisarse: se debe definir una fuente de verdad única para servidor y cliente, serializar datos estables y manejar la carga/error real. El estado `error` actual es defensivo, pero la fuente sintética no tiene una operación que pueda fallar de forma independiente.

## Evidencia y límites

`tests/rendering.spec.ts` verifica por contrato de código que la lista es Server Component dinámico, conserva las tres inspecciones (`inspection-001`, `inspection-002`, `inspection-003`), enlaza al detalle y expone su `loading.tsx`. También verifica que el detalle es Client Component, muestra carga, busca por parámetro, contempla inexistente (por ejemplo, `id-inexistente`), conserva una rama de error y permite volver al listado. La prueba se integra en `npm test`.

Esa evidencia es estática y determinista: detecta regresiones de los contratos anteriores, pero no sustituye un E2E en navegador ni mide LCP, TTI, accesibilidad con lector de pantalla o una hidratación real. `npm run build`, cuando esté disponible en un entorno con npm, aporta la comprobación complementaria de compilación de Next.js.
