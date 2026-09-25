

Detecté además un riesgo de evaluación que conviene dejar señalado: el check público busca palabras como `token`, `secret` o `password` en todo el repositorio, pero el propio material de Semana 4 las menciona en su contrato. Haré una comprobación puntual de esas coincidencias para distinguir un fallo real del proyecto de una limitación del script antes de cerrar la propuesta.

Searched for regex `api[_-]?key|secret|password|token`, 43 results

## Análisis de Semana 4



### Archivos que permanecen en `docs/semana 4`

Estos archivos deben conservarse como contrato y referencia de la actividad:

- `ASSIGNMENT.md`: requisitos, rúbrica y criterios de aceptación.
- `README.md`: instrucciones de ejecución.
- `evaluation.json`: evaluación automática y comandos esperados.
- evidence/individual.md: plantilla de evidencia individual.
- public-tests/check.sh: verificación pública.
- public-tests/README.md.
- tests/README.md.
- `.github/workflows/week-04-w04-csr-ssr.yml`: workflow de evaluación.

No conviene borrar ni mover estos archivos.

### Archivos existentes que se mantienen en el proyecto



Los datos deben continuar siendo sintéticos.

### Archivos nuevos esperados en la raíz

La actividad solicita:

- `src/app/inspecciones/page.tsx`
- `src/app/inspecciones/[id]/page.tsx`
- `src/components/loading-state.tsx`
- `docs/rendering-decision.md`
- `tests/rendering.spec.ts`
- Actualización de `README.md`
- Reporte generado en `verification.json`

Además, el workflow debe estar disponible en:

- `.github/workflows/week-04-w04-csr-ssr.yml`

Actualmente solo existe dentro de `docs/semana 4/.github/workflows`, pero GitHub Actions espera encontrarlo en `workflows` desde la raíz.

## División entre tres integrantes

### Integrante 1: ruta SSR y base de datos

Responsabilidades:

- Crear `src/app/inspecciones/page.tsx`.
- Implementar el listado como Server Component.
- Reutilizar `inspections.ts`.
- Definir la estructura común de una inspección.
- Crear `src/components/loading-state.tsx`.
- Preparar los estados de carga, error y contenido.
- Comprobar que no exista `use client` en la ruta SSR.
- Entregar un commit funcional.

Criterio de entrega:

```bash
npm run build
```

Debe compilar correctamente y la ruta `/inspecciones` debe mostrar datos sintéticos renderizados desde el servidor.

### Integrante 2: ruta de detalle e interacción CSR

Responsabilidades:

- Crear `src/app/inspecciones/[id]/page.tsx`.
- Implementar el detalle de una inspección.
- Agregar interacción del lado del cliente.
- Cubrir los estados:
  - carga;
  - error;
  - inspección encontrada;
  - inspección inexistente.
- Mantener navegación accesible entre listado y detalle.
- Evitar hydration mismatch.
- Validar identificadores como `inspection-001`, `inspection-002` e `inspection-003`.

Criterio de entrega:

Debe funcionar:

```text
/inspecciones
/inspecciones/inspection-001
/inspecciones/id-inexistente
```

La segunda ruta debe demostrar interacción cliente y recuperación ante error.

### Integrante 3: pruebas, documentación e integración

Responsabilidades:

- Crear `tests/rendering.spec.ts`.
- Probar la existencia y comportamiento de las rutas CSR y SSR.
- Verificar estados de carga, error y contenido.
- Actualizar el script `test` en `package.json` para incluir la nueva prueba.
- Crear `docs/rendering-decision.md`.
- Documentar:
  - por qué una ruta usa SSR;
  - por qué otra usa CSR;
  - ventajas y límites;
  - impacto esperado en carga;
  - accesibilidad;
  - complejidad;
  - riesgos de hydration mismatch.
- Actualizar `README.md` con ejecución y evidencia.
- Copiar el workflow a `.github/workflows/week-04-w04-csr-ssr.yml`.
- Ejecutar la verificación completa.
- Completar la evidencia de cada integrante en `individual.md`.

Criterio de entrega:

```bash
npm ci
npm test
npm run build
make verify
bash docs/semana\ 4/public-tests/check.sh
```

## Orden de trabajo

1. Integrante 1 termina la ruta SSR y entrega su commit.
2. Integrante 2 parte de ese commit y crea la ruta de detalle interactiva.
3. Integrante 3 integra las pruebas, documentación, workflow y ejecuta la validación final.

Cada integrante debe recibir:

- SHA del commit anterior.
- Archivos modificados.
- Comandos ejecutados.
- Limitaciones o problemas encontrados.

## Riesgos detectados

El `check.sh` de Semana 4 busca palabras como `token`, `secret` o `password` en todo el repositorio. Sin embargo, el propio material de evaluación contiene esas palabras, por ejemplo en `ASSIGNMENT.md` y `evaluation.json`. Esto puede provocar un falso fallo del check público.

También debe revisarse que `tests/rendering.spec.ts` quede incluido en `npm test`; actualmente el script solo ejecuta las pruebas anteriores.

No realicé cambios en los archivos; este resultado corresponde al análisis y la distribución recomendada.