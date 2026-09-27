# Evidencia individual — Semana 4

- Estudiante: David Aguilar Rodriguez.
- Commit SHA evaluado: se registrará al entregar el commit final, para no inventar un SHA antes de crearlo.
- Decisión técnica que puedo explicar: conservar `/inspecciones` como Server Component dinámico para entregar el listado y usar el detalle como Client Component para demostrar carga y estado local basado en el parámetro de la ruta.- Prueba que ejecuté y resultado: `node tests/rendering.spec.ts` terminó correctamente y reportó `PASS` para SSR, CSR, carga, contenido, inexistente y navegación. - Limitación o fallo diagnosticado: la prueba es un contrato de código y no una prueba E2E; no mide métricas de carga ni realiza hidratación en un navegador. El check público de Semana 4 también puede dar un falso negativo porque busca palabras de credenciales dentro de sus propios documentos de contrato.- Cambio que podría defender o modificar en vivo: la prueba `tests/rendering.spec.ts`, su integración en `package.json`, la decisión SSR/CSR y el workflow de Semana 4.
- Uso declarado de IA (herramienta, propósito, validación): utilicé Codex para inspeccionar el repositorio, redactar pruebas y documentación, y contrastar las aserciones contra las rutas y datos reales; revisé manualmente el diff y la salida de cada comando disponible.

