# Entrega final · Semana 9

## Identificación de la entrega

- **Actividad:** w09-security-privacy — Modelo de amenazas y privacidad aplicada.
- **Repositorio:** [MarcoAAguil4r/PWA-Starter](https://github.com/MarcoAAguil4r/PWA-Starter).
- **Rama integrada:** `main`.
- **Commit evaluado:** [`4e508066455b5d7fcf672dfc0aeb020093bec5f0`](https://github.com/MarcoAAguil4r/PWA-Starter/commit/4e508066455b5d7fcf672dfc0aeb020093bec5f0).
- **Etiqueta de entrega:** [`week-09-final`](https://github.com/MarcoAAguil4r/PWA-Starter/tree/week-09-final).
- **Fecha de verificación y entrega:** 1 de noviembre de 2026.

La etiqueta apunta al commit integrado en `main` que se verificó para esta entrega. Este archivo documenta la referencia de evaluación; su propio commit de documentación es posterior.

## Artefactos entregados

- Modelo de amenazas: [`docs/threat-model.md`](../threat-model.md).
- Inventario de datos y finalidades: [`docs/privacy-data-inventory.md`](../privacy-data-inventory.md).
- Validación de seguridad: [`src/lib/security/input-validation.ts`](../../src/lib/security/input-validation.ts).
- Pruebas: [`tests/security.spec.ts`](../../tests/security.spec.ts).
- Política de robots: [`public/robots.txt`](../../public/robots.txt).
- Evidencia individual: [`evidence/individual.md`](evidence/individual.md) y [`evidence/individual.md`](../../evidence/individual.md).
- Verificación y feedback CI: [workflow de Semana 9](../../.github/workflows/week-09-w09-security-privacy.yml).

## Verificación realizada

Sobre el commit evaluado se ejecutaron localmente:

| Comando | Resultado |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS |
| `npm test` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run verify` | PASS — pruebas, build, checks públicos de Semanas 5, 6 y 9, escaneo de secretos y métrica de renderizado |
| `npm run test:e2e` | PASS — 2 escenarios |
| `git diff --check` | PASS |

El check público de Semana 9 terminó con `PUBLIC_OK`. Node mostró advertencias `MODULE_TYPELESS_PACKAGE_JSON` en algunas pruebas TypeScript; no provocaron fallos.

## Evidencia y límites

La implementación valida los campos de inspección, limita a 16 KiB el cuerpo JSON del endpoint de sincronización y rechaza los cuerpos sobredimensionados antes de parsearlos. Las pruebas incluyen entradas válidas, campos fuera de límite, JSON malformado y cuerpo excesivo. El modelo de amenazas y el inventario documentan los riesgos residuales: el demo no ofrece autenticación, el almacenamiento local no está cifrado y HTTPS/CSP deben confirmarse en el entorno de despliegue. Los datos de la actividad son sintéticos.

La revisión académica y la calificación corresponden al evaluador y no se infieren de los resultados técnicos.
