# Reparto de actividades · Semana 8

La semana se divide en tres frentes de trabajo de alcance equivalente. Antes de comenzar, sustituyan «Integrante 1/2/3» por los nombres del equipo vigente. Cada integrante debe documentar su contribución en `evidence/individual.md` y poder explicar una parte del flujo común.

## Antes de trabajar

- Crear y usar la rama de la semana **`week8-marco`** para los cambios de esta actividad.
- No trabajar directamente en `main`/`master`. Integrar los cambios por el flujo de revisión del equipo.
- Partir de la PWA existente; no crear otra aplicación. Usar únicamente datos sintéticos y estado aislado para las pruebas.
- Coordinar los cambios compartidos para evitar conflictos y no integrar defectos de prueba.

## Integrante 1 · diagnóstico, estrategia y validación

- Ejecutar la PWA antes de modificarla y registrar qué funciona, qué falla y cualquier bloqueo que afecte los escenarios solicitados.
- Revisar la estructura existente de la aplicación y las pruebas para proponer capas y evitar duplicar funcionalidades o configuraciones.
- Crear `docs/test-strategy.md` con la matriz riesgo–prueba, la justificación de cada capa y los límites del diagnóstico.
- Implementar pruebas unitarias de una regla de validación de captura, con datos válidos e inválidos y aserciones sobre el resultado.
- Documentar en `README.md` los requisitos, versión de Node, instalación, arranque y comandos exactos de comprobación, coordinándose con quienes configuren las pruebas y CI.
- Completar su sección de semana 8 en `evidence/individual.md` con enlaces y resultados reales.

**Criterio de cierre:** el diagnóstico es reproducible; la estrategia relaciona los cuatro riesgos solicitados con pruebas; la regla de validación queda cubierta por una prueba ejecutable.

## Integrante 2 · cola, integración y regresión controlada

- Implementar pruebas unitarias de una regla de cola o idempotencia, incluyendo casos válidos e inválidos.
- Implementar pruebas de integración que comprueben que una inspección guardada sin conexión persiste y que reintentar la misma sincronización no crea duplicados.
- Controlar entradas y respuesta remota mediante fixtures, y limpiar los datos entre casos.
- Coordinar con el Integrante 3 los comportamientos que debe exponer la aplicación para que sus E2E comprueben el flujo real.
- En una rama temporal, introducir un defecto controlado (por ejemplo, omitir la protección de duplicados), ejecutar la prueba que debe fallar, registrar la evidencia y restaurar la solución. No integrar la rama defectuosa.
- Completar su sección de semana 8 en `evidence/individual.md`, enlazando las pruebas y la evidencia de fallo y recuperación.

**Criterio de cierre:** las pruebas unitarias y de integración comprueban comportamiento, no solo existencia de funciones; la evidencia muestra el fallo provocado y la recuperación sin dejar el defecto integrado.

## Integrante 3 · E2E, CI y reportes

- Implementar E2E desde la interfaz para el flujo crear → guardar sin conexión → recargar → reconectar → sincronizar una sola vez.
- Añadir el caso en que una capacidad del dispositivo está denegada o ausente y aun así se puede completar la captura. Simular las APIs cuando sea necesario; no depender de permisos físicos.
- Configurar o actualizar el workflow equivalente de CI para instalar dependencias y ejecutar lint, comprobación de tipos, compilación y pruebas. Evitar duplicar workflows si ya existe uno equivalente.
- Asegurar que los resultados y la cobertura se publiquen como artefactos incluso cuando falle una prueba, y que una etapa obligatoria fallida haga fallar CI.
- Ejecutar y enlazar los resultados reales de CI de la versión final; actualizar el README con el arranque del servidor E2E y los comandos efectivos, en coordinación con el Integrante 1.
- Completar su sección de semana 8 en `evidence/individual.md` con los escenarios, resultados y enlaces.

**Criterio de cierre:** ambos escenarios E2E son ejecutables; CI verifica las etapas requeridas y conserva los reportes; el enlace corresponde al SHA final integrado.

## Revisión común y entrega

1. Cada integrante revisa el frente de otra persona y ejecuta al menos una prueba del flujo común.
2. El equipo confirma que la estrategia, los tests, la aplicación y el workflow describen el mismo comportamiento y usan datos sintéticos.
3. Antes de entregar, comprobar que no se integró el defecto controlado, que el README y `evidence/individual.md` están actualizados y que CI terminó para el SHA final.
4. Cada integrante entrega por separado en Classroom el mismo repositorio y SHA final, junto con su evidencia personal y los enlaces a los documentos y reportes.
