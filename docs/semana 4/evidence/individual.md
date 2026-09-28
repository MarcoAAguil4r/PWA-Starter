# Evidencia individual — Semana 4

- Estudiante: David Aguilar Rodriguez.
- Commit SHA evaluado: se registrará al entregar el commit final, para no inventar un SHA antes de crearlo.
- Decisión técnica que puedo explicar: conservar `/inspecciones` como Server Component dinámico para entregar el listado y usar el detalle como Client Component para demostrar carga y estado local basado en el parámetro de la ruta.
- Prueba que ejecuté y resultado: `node tests/rendering.spec.ts` terminó correctamente y reportó `PASS` para SSR, CSR, carga, contenido, inexistente y navegación.
- Limitación o fallo diagnosticado: la prueba es un contrato de código y no una prueba E2E; no mide hidratación en un navegador. El check público de Semana 4 debe excluir el texto del contrato al buscar posibles credenciales.
- Cambio que podría defender o modificar en vivo: la prueba `tests/rendering.spec.ts`, su integración en `package.json`, la decisión SSR/CSR y el workflow de Semana 4.
- Uso declarado de IA (herramienta, propósito, validación): utilicé Codex para inspeccionar el repositorio, redactar pruebas y documentación, y contrastar las aserciones contra las rutas y datos reales; revisé manualmente el diff y la salida de cada comando disponible.

* Estudiante: Dulce Acevedo.
* Commit SHA evaluado: se registrará al entregar el commit final, para no inventar un SHA antes de crearlo.
* Decisión técnica que puedo explicar: implementar la ruta dinámica `/inspecciones/[id]` para mostrar el detalle de una inspección y utilizar comportamiento del lado del cliente para manejar los estados de carga, error, inspección encontrada e inspección inexistente. La implementación contempla los identificadores `inspection-001`, `inspection-002` y `inspection-003`, además de un identificador inexistente, y mantiene la navegación entre el listado y el detalle evitando inconsistencias entre servidor y cliente.
* Archivo principal trabajado: `src/app/inspecciones/[id]/page.tsx`.
* Prueba que ejecuté y resultado: no se registra aquí un resultado de ejecución que no pueda ser comprobado mediante la evidencia disponible. Las validaciones deben corresponder únicamente a los comandos y resultados realmente ejecutados durante la entrega.
* Limitación o fallo diagnosticado: la validación de la vista de detalle depende de las pruebas y verificaciones disponibles en el proyecto; una prueba basada en código no sustituye una prueba E2E realizada en un navegador y no permite por sí sola medir comportamiento real de hidratación o rendimiento.
* Cambio que podría defender o modificar en vivo: la ruta `src/app/inspecciones/[id]/page.tsx`, el manejo de los estados de la vista de detalle, la interacción CSR y la navegación entre `/inspecciones` y `/inspecciones/[id]`.
* Uso declarado de IA (herramienta, propósito, validación): utilicé Codex como apoyo para revisar la estructura del repositorio y la implementación correspondiente al Integrante 2; la contribución se contrastó con la asignación de Semana 4 y con los archivos existentes del proyecto, evitando atribuir como propio el trabajo correspondiente a otros integrantes.

## Marco Antonio Aguilar Castillo (GitHub: MarcoAAguil4r)

- **Commit asociado:** [`580bdbb0f856e3aa37151d3960cd796e600ae52a`](https://github.com/MarcoAAguil4r/PWA-Starter/commit/580bdbb0f856e3aa37151d3960cd796e600ae52a).
- **Contribución comprobable:** Implementé `/inspecciones` como Server Component dinámico y reutilicé los datos sintéticos. También agregué el estado de carga de la ruta y el componente compartido `LoadingState`.
- **Decisión técnica que puedo explicar:** El listado es contenido de solo lectura, así que SSR entrega las inspecciones en el HTML inicial sin requerir interacción cliente en esa ruta. `dynamic = "force-dynamic"` hace explícito el renderizado por solicitud.
- **Validación de esta revisión asistida:** `npm ci --ignore-scripts --no-audit --no-fund` y `make verify` terminaron correctamente en Node `v22.22.0`; pasaron la suite configurada, el build de producción y la medición de cinco respuestas por ruta. Los valores vigentes se guardan en `reports/rendering-metrics.json` y el resultado técnico en `reports/verification.json`. El escaneo equivalente del check público pasó con PowerShell; el script Bash no se ejecutó localmente porque este entorno no dispone de Bash. No se ha confirmado una corrida remota de GitHub Actions.
- **Limitación identificada:** La medición HTTP local no representa Core Web Vitals ni el tiempo de hidratación. La fuente sintética no activa por sí sola el camino de error del detalle, y las pruebas de contrato no reemplazan una prueba E2E de navegador.
- **Cambio que puedo defender o modificar:** `src/app/inspecciones/page.tsx`, `src/app/inspecciones/loading.tsx` y `src/components/loading-state.tsx`.
- **Uso de IA:** GitHub Copilot apoyó esta revisión de requisitos e historial y la redacción de esta evidencia. Antes de entregar, debo revisar el texto y poder explicar personalmente la decisión y sus límites.
