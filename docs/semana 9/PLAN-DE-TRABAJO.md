# Semana 9: organización y reparto de actividades

## Alcance y estructura

La actividad continúa la PWA existente y debe completarse dentro de la semana 9. El equipo trabaja sobre datos exclusivamente sintéticos; no se deben agregar secretos, tokens ni datos personales reales. Esta carpeta conserva el contrato, la rúbrica, las instrucciones y el material de referencia de la actividad. Los entregables del producto se crean en las rutas indicadas aquí, no dentro de `docs/semana 9/`.

| Entregable | Ubicación del producto |
| --- | --- |
| Modelo de amenazas y controles | `docs/threat-model.md` |
| Inventario de datos y finalidades | `docs/privacy-data-inventory.md` |
| Controles reutilizables de seguridad | `src/lib/security/` |
| Pruebas de seguridad y privacidad | `tests/security.spec.ts` |
| Política para rastreadores | `public/robots.txt` |
| Instrucciones, supuestos y evidencia de ejecución | `README.md` |
| Workflow activo de feedback | `.github/workflows/week-09-w09-security-privacy.yml` |
| Copia de referencia del workflow | `docs/semana 9/.github/workflows/week-09-w09-security-privacy.yml` |
| Evidencia individual de la actividad | `docs/semana 9/evidence/individual.md` y una sección por integrante en `evidence/individual.md` |
| Reportes de verificación | `reports/` y artefactos publicados por CI |

El workflow que GitHub ejecuta está en `.github/workflows/`. La copia incluida en esta carpeta semanal solo pertenece al paquete de referencia. No creen archivos vacíos para satisfacer los criterios de aceptación.

## Rama de trabajo

La rama de esta actividad es **`week9-marco`**. Se creó desde la versión actualizada de `origin/main`; no trabajen directamente sobre `main`.

Para publicar la rama de integración cuando el equipo esté listo:

```bash
git push -u origin week9-marco
```

Los demás integrantes actualizan sus referencias y cambian a la rama compartida:

```bash
git fetch origin
git switch week9-marco
git pull --ff-only origin week9-marco
```

Coordinen los cambios antes de editar archivos compartidos, integren cambios pequeños y ejecuten las verificaciones antes de entregar. Si el docente solicita ramas individuales, mantengan `week9-marco` como rama de integración y acuerden las ramas auxiliares antes de empezar.

## Reparto entre tres integrantes

El reparto usa el equipo identificado en la planificación previa. Cada persona debe explicar sus decisiones, registrar evidencia propia y revisar el trabajo de otra persona; el número de archivos no sustituye la responsabilidad por una parte verificable del comportamiento.

### Integrante 1 · Marco Antonio Aguilar Castillo

- Analizar los activos, límites de confianza, actores, amenazas y controles de la PWA; crear `docs/threat-model.md`.
- Implementar, en coordinación con el Integrante 2, las validaciones reutilizables y los valores seguros por defecto dentro de `src/lib/security/`.
- Acordar contratos de entrada, salida y errores antes de que las pruebas dependan de ellos.
- Aportar casos de prueba para entradas válidas, inválidas y límites de confianza en `tests/security.spec.ts`.
- Registrar decisiones, una prueba ejecutada y una limitación en su evidencia individual.

**Criterio de cierre:** el modelo conecta cada amenaza relevante con un control y evidencia; las validaciones rechazan entradas no permitidas sin introducir secretos ni datos reales.

### Integrante 2 · David Aguilar Rodríguez

- Identificar los datos sintéticos, finalidades, persistencia, retención y exposición de cada flujo; crear `docs/privacy-data-inventory.md`.
- Revisar los flujos existentes de almacenamiento y transporte, y coordinar con el Integrante 1 los controles necesarios de mínimo privilegio y privacidad.
- Documentar las decisiones y límites de almacenamiento, HTTPS y CSP en los documentos de la actividad y el `README.md`, según corresponda.
- Aportar casos de prueba en `tests/security.spec.ts` para los controles de privacidad y los fallbacks relevantes.
- Revisar el modelo de amenazas del Integrante 1 para confirmar que los controles descritos corresponden al comportamiento real.

**Criterio de cierre:** el inventario identifica datos, finalidad y manejo sin incluir PII; las medidas documentadas coinciden con la implementación y tienen pruebas o una limitación explícita.

### Integrante 3 · Dulce Acevedo Miguel

- Crear `public/robots.txt` con una política explícita y adecuada para la aplicación.
- Completar `tests/security.spec.ts` con pruebas deterministas de los controles acordados; usar datos sintéticos y comprobar tanto casos permitidos como rechazados.
- Incorporar el workflow de Semana 9 a `.github/workflows/` y verificar que instala, compila, prueba y publica los reportes esperados. Conservar la copia de referencia bajo `docs/semana 9/.github/workflows/`.
- Actualizar `README.md` con ejecución, supuestos y comandos reales de verificación; comprobar que `make verify` (o su equivalente documentado) cubre los cambios.
- Coordinar la integración de evidencias y resultados de CI, y revisar el inventario de privacidad del Integrante 2.

**Criterio de cierre:** las pruebas corren en local y CI; una etapa obligatoria fallida hace fallar el workflow; los reportes corresponden al commit evaluado.

## Integración y entrega común

1. Al iniciar, confirmen responsables y contratos de integración, especialmente validación, almacenamiento, CSP y formato de errores.
2. Cada integrante implementa y prueba su parte con datos sintéticos; antes de integrar, una persona distinta revisa los cambios y ejecuta al menos una prueba relacionada.
3. Mantengan coherentes el modelo de amenazas, el inventario, los controles implementados, las pruebas y el `README.md`. No reporten como verificado un control que no se haya probado.
4. Desde la raíz del repositorio, ejecuten `npm ci` y `make verify`; ejecuten también `bash "docs/semana 9/public-tests/check.sh"`. Resuelvan cualquier fallo antes de entregar.
5. Cada persona completa `docs/semana 9/evidence/individual.md` y su sección en `evidence/individual.md` con su contribución, decisión defendible, prueba ejecutada, limitación y commit SHA final.
6. Abran el pull request o entreguen el commit indicado por el LMS antes del cierre de la semana. Incluyan el enlace o SHA evaluado y el reporte de CI.
