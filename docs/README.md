# Índice de documentación

## Documentos del proyecto

- [Requisitos del producto](requirements.md)
- [Registro de decisiones técnicas](decision-record.md)
- [Estrategia de caché offline](cache-strategy.md)
- [Decisión de renderizado SSR/CSR](rendering-decision.md)
- [Política de persistencia y conflictos de Semana 5](sync-policy.md)

## Paquetes de actividades

Cada carpeta semanal conserva el contrato, la rúbrica y la evidencia de esa entrega. Sus checks, plantillas y workflows son material de referencia y evaluación; no son archivos sobrantes.

- [Semana 2: shell y manifest](semana%202/README.md)
- [Semana 3: service worker y offline](semana%203/README.md)
- [Semana 4: SSR y CSR](semana%204/README.md)
- [Semana 5: persistencia y sincronización](semana%205/README.md)

Los workflows que GitHub ejecuta deben estar directamente en `.github/workflows/` desde la raíz. Las copias bajo `docs/semana N/.github/workflows/` pertenecen al paquete de actividad y no se ejecutan desde esa ubicación.

## Evidencia

La evidencia individual consolidada del equipo está en [../evidence/individual.md](../evidence/individual.md). Se conserva una sección por integrante y semana; los SHA se registran después de integrar los cambios correspondientes.