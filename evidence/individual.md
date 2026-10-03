# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

| Dato | Información |
| --- | --- |
| Grupo | 10B, equipo 1 |
| Repositorio | [PWA-Starter](https://github.com/MarcoAAguil4r/PWA-Starter.git) |

## Semana 1

### Marco Antonio Aguilar Castillo

- **Mi contribución concreta y enlace:**
  Redacción de las secciones "5. Datos ficticios que usarán y datos reales excluidos" y "6. Criterios de aceptación de Semana 1" en `docs/requirements.md`. Asimismo, elaboré el registro de decisión arquitectónica con base al dialogo entre el equipo en `docs/decision-record.md` (ADR-001), estructurando la comparativa de estrategias de aplicación (PWA vs. Web tradicional vs. Nativa vs. Multiplataforma), la justificación técnica de la PWA sobre Next.js para escenarios con conectividad intermitente en laboratorios, sus riesgos asociados y el plan de validación futura.
  Enlace al commit: https://github.com/MarcoAAguil4r/PWA-Starter/commit/3aa445c

- **Decisión que puedo explicar y por qué:**
  La elección de una Progressive Web App (PWA) con Next.js como la estrategia arquitectónica adecuada frente a una aplicación nativa o web tradicional. Puedo explicar que la PWA resuelve la problemática de conectividad intermitente en laboratorios y sótanos mediante almacenamiento local .

- **Comando o prueba proporcionada que ejecuté:**
  `npm ci`, `npm run dev` y `npm test`.

- **Resultado real que observé:**
  - `npm ci`: Instaló todos los paquetes correctamente usando el lockfile sin errores.
  - `npm run dev`: Levantó el servidor de desarrollo en `http://localhost:3000`, mostrando las 3 inspecciones sintéticas del starter en el navegador.
  - `npm test`: El archivo `starter.spec.mjs` arrojó resultado **PASS**

- **Qué verifica esa prueba y qué no verifica:**
  Verifica que la estructura base del starter está intacta, que los módulos y rutas requeridas están presentes y que el proyecto compila correctamente bajo los estándares del framework.
  NO verifica la validez del contenido de los documentos de requisitos o arquitectura (`docs/requirements.md`, `docs/decision-record.md`), ni comprueba el funcionamiento de capacidades PWA avanzadas , ya que son funcionalidades reservadas para semanas posteriores.

- **Limitación, dificultad o riesgo que identifiqué:**
  La decisión de usar PWA delega la persistencia offline al navegador; sin embargo, las restricciones de cuotas de almacenamiento y políticas de ciclo de vida de WebKi representan un riesgo de depuración de caché si las inspecciones locales no se sincronizan oportunamente o si se adjuntan fotografías pesadas sin compresión previa en el cliente.

- **Uso de IA:**
  Utilicé Gemini como asistente para estructurar la comparativa técnica del ADR y organizar la redacción de los criterios de aceptación y especificaciones de datos sintéticos. Realicé revisión crítica, ajuste contextual y validación manual de todo el contenido para asegurar su coherencia con el alcance del proyecto.

### Dulce Acevedo Miguel

- **Mi contribución concreta y enlace:**
  Redacción de las secciones "3. Requisitos funcionales" y "4. Requisitos no funcionales" en `docs/requirements.md`. Definí 8 requisitos funcionales (RF-01 a RF-08) vinculados a los dos escenarios ya definidos por el equipo, y los 6 requisitos no funcionales (reproducibilidad, accesibilidad, seguridad, privacidad, rendimiento y offline futuro) con su condición, método de comprobación y momento de validación.
  Enlace al commit: https://github.com/MarcoAAguil4r/PWA-Starter/commit/9bbd722.

- **Decisión que puedo explicar y por qué:**
  Marqué los RF-05 a RF-08 (registro de hallazgos, guardado local, sincronización automática y marcar hallazgo como atendido) como "Futuro" y no como implementados en Semana 1, porque el starter actual solo muestra las tres inspecciones sintéticas en modo de solo lectura —no existe todavía un formulario de captura— y la actividad indica explícitamente que no se exige implementar offline, sincronización ni formularios nuevos esta semana. Documentarlos así deja clara su relación con el Escenario 2 sin afirmar una funcionalidad que aún no existe.

- **Comando o prueba proporcionada que ejecuté:**
  `npm ci` y `npm run verify`.

- **Resultado real que observé:**
  - `npm ci`: Instaló 28 paquetes correctamente usando el lockfile, con 2 vulnerabilidades de severidad alta reportadas por npm audit (propias de las dependencias del starter, no modificadas por mí).
  - `npm run verify`: Ejecutó primero `npm test`, que corrió `tests/starter.spec.mjs` con resultado **PASS**. Después ejecutó `next build`, que compiló exitosamente con Next.js 14.2.35, generó las 4 páginas estáticas del proyecto (`/` y `/_not-found`) y terminó con el mensaje "Verificación técnica: pass. Revisión académica: pendiente." El reporte se guardó en `reports/verification.json`.

- **Qué verifica esa prueba y qué no verifica:**
  `npm run verify` comprueba que el proyecto instala, que la prueba proporcionada del starter pasa y que el proyecto compila correctamente para producción. NO evalúa si mis requisitos funcionales o no funcionales están bien redactados, son completos o son coherentes con los escenarios del equipo — eso se revisa por lectura del documento, no por el resultado técnico del comando.

- **Limitación, dificultad o riesgo que identifiqué:**
  Los requisitos no funcionales de rendimiento que propuse (ej. tiempo de carga con 100 registros) son cifras ilustrativas, no mediciones reales, porque el starter aún no maneja datos dinámicos ni un volumen real de inspecciones; quedan sujetas a validarse cuando esa funcionalidad exista.

- **Uso de IA:**
  Utilicé Claude.ai como apoyo para redactar y dar formato a los requisitos funcionales y no funcionales, a partir de la información que yo misma proporcioné (el problema, los escenarios y usuarios ya definidos por mi equipo, y lo observado al correr el starter en `localhost:3000`). Revisé cada requisito antes de incluirlo para verificar que correspondiera a lo que realmente muestra el starter y a los escenarios acordados, y decidí yo misma cuáles marcar como "Semana 1" vs "Futuro" según el alcance real de la actividad.

### David Aguilar Rodriguez

- **Mi contribución concreta y enlace:** 
  Redacción de las secciones "1. Problema y contexto" y "2. Usuarios y escenarios" en `docs/requirements.md`. Definí los límites del producto, los roles de usuario (Técnico, Docente, Auditor) y el escenario de conectividad intermitente para técnicos en zonas sin señal.
  Enlace al commit: https://github.com/MarcoAAguil4r/PWA-Starter/commit/832ea98

- **Decisión que puedo explicar y por qué:** 
  El equipo documentó la funcionalidad offline como requisito futuro (Escenario 2) en lugar de implementarla en la Semana 1. Puedo explicar que, aunque Next.js no incluye offline por defecto, planificarlo mediante Service Workers e IndexedDB es esencial para resolver el problema real de los técnicos en sótanos y laboratorios sin cobertura, sin bloquear la entrega inicial del starter.

- **Comando o prueba proporcionada que ejecuté:** 
  `npm ci`, `npm run dev` y `npm test`.

- **Resultado real que observé:** 
  - `npm ci`: Instaló 36 paquetes correctamente usando el lockfile sin errores.
  - `npm run dev`: Levantó el servidor de desarrollo en `http://localhost:3000`, mostrando las 3 inspecciones sintéticas del starter en el navegador.
  - `npm test`: El archivo `starter.spec.mjs` arrojó resultado **PASS**, confirmando que la estructura base del proyecto es correcta.

- **Qué verifica esa prueba y qué no verifica:**
  Verifica que la estructura de archivos del starter está intacta, que las dependencias están instaladas correctamente y que el proyecto base funciona.
  NO verifica la calidad del contenido de los documentos de requisitos, ni implementa funcionalidad PWA real como offline, service workers o sincronización (esos son requisitos de semanas futuras).

- **Limitación, dificultad o riesgo que identifiqué:**
  El escenario de conectividad intermitente que describí requiere implementación de Service Workers, IndexedDB y cola de sincronización que no se construyen en esta entrega. Riesgo: los usuarios podrían esperar que la app funcione offline inmediatamente cuando aún es solo un requisito documentado.

- **Uso de IA:**
  Utilicé Claude.ai como asistente para estructurar y pulir la redacción inicial de los escenarios y la evidencia. Realicé verificación, ajuste y validación humana posterior de todo el contenido para asegurar que refleje fielmente la realidad y los límites de nuestro proyecto.

## Semana 2

### David Aguilar Rodriguez

- **Estudiante:** David Aguilar Rodriguez
- **Contribución concreta:** Actualicé `tests/manifest.spec.mjs` para verificar el manifest real, los iconos públicos, los landmarks y navegación reales de `app-shell.tsx`, y los estados visuales de `inspection-list.tsx`. También actualicé `scripts/verify.mjs`, README y este registro de evidencia.
- **Decisión que puedo explicar:** La prueba se ajusta al contrato que el equipo implementó: comprueba las opciones de navegación existentes (`Inspecciones` y `Resumen (próximamente)`) y no exige una opción “Configuración” ni un skip link que no están en el shell. Así una falla señala una regresión real, no una expectativa inventada por la prueba.
- **Comandos ejecutados y resultado real observado:** `node --version` devolvió `v24.19.0`. `node tests/manifest.spec.mjs` terminó correctamente y reportó PASS para manifest/iconos, landmarks/navegación y estados visuales. Intenté en orden `npm ci`, `npm test`, `npm run build` y `npm run verify`, pero todos quedaron bloqueados porque PowerShell informó que `npm` no se reconoce como comando. También intenté `bash public-tests/check.sh`; Bash devolvió `CreateInstance/E_ACCESSDENIED`. Por ello no afirmo resultados de instalación, build, verify ni prueba pública.
- **Qué verifica y qué no verifica la prueba:** Verifica campos y rutas declarados en `src/app/manifest.ts`, la existencia física de ambos PNG, landmarks del shell, las dos opciones actuales de navegación y los mensajes/roles de los estados de carga, error y vacío. No verifica instalación en navegador, service worker, comportamiento offline, sincronización ni el aspecto visual en un dispositivo real.
- **Limitación encontrada:** El repositorio conserva `public/manifest.webmanifest` además de `src/app/manifest.ts`. Mi alcance no autoriza modificarlo; queda como hallazgo para el equipo porque puede producir dos fuentes de verdad. Además, este entorno no expone npm ni permite iniciar Bash, lo que impidió la validación completa solicitada.
- **Uso de IA:** Utilicé Codex como apoyo para inspeccionar los archivos reales, redactar pruebas deterministas y documentación, y ejecutar las comprobaciones disponibles. Revisé manualmente los textos, los patrones de las aserciones y la salida de los comandos; los resultados bloqueados se registran tal como ocurrieron.


### Marco Antonio Aguilar Castillo

- **Estudiante:** Marco Antonio Aguilar Castillo
* **Commit SHA evaluado:** se registrará después del commit final de esta integración.
* **Contribución concreta:** Integré la configuración del manifest PWA en `src/app/manifest.ts`, verifiqué sus campos de instalación y moví los iconos sintéticos a `public/icons/`, que es la carpeta pública que Next.js expone en las rutas del manifest. También agregué las pruebas `tests/manifest.spec.mjs` y `tests/manifest.spec.ts`, y actualicé el comando `npm test` para ejecutar la prueba del manifest junto con la prueba existente del starter.
* **Decisión técnica que puedo explicar:** Mantener `src/app/manifest.ts` como fuente del manifest mediante el App Router de Next.js permite generar la ruta `/manifest.webmanifest` sin duplicar la configuración. Los iconos se mantienen en `public/icons/` porque los recursos referenciados por `/icons/...` deben existir en la carpeta pública de Next.js. Esta entrega configura la instalación, pero no afirma implementar service worker, sincronización ni funcionamiento offline.
* **Prueba que ejecuté y resultado:** Ejecuté `npm ci --ignore-scripts --no-audit --no-fund`, `npm test`, `npm run build`, `npm run verify` y `node scripts/verify.mjs --structure`. La instalación terminó correctamente; `starter.spec.mjs` y `manifest.spec.mjs` pasaron; el build de Next.js terminó correctamente y generó la ruta `/manifest.webmanifest`; `npm run verify` reportó `Verificación técnica: pass`; y la comprobación estructural terminó con `Estructura presente`.
* **Qué verifica la prueba y qué no verifica:** Las pruebas comprueban los campos principales del manifest, las rutas de los iconos y la existencia de los archivos PNG. El build verifica que Next.js compile y genere la ruta del manifest. Estas comprobaciones no validan todavía la navegación completa del app shell, los estados de carga/error/vacío ni la instalación real en todos los navegadores.
* **Limitación o fallo diagnosticado:** Los iconos inicialmente estaban en `src/public/icons`, una ubicación que no se publica como `/icons/...`; los moví a `public/icons/`. Además, el comando `bash public-tests/check.sh` no pudo ejecutarse en mi entorno Windows porque Bash no estaba instalado; ejecuté su equivalente multiplataforma `node scripts/verify.mjs --structure`. El archivo público del manifest se conserva como espejo exigido por la actividad y `manifest.ts` permanece como fuente de configuración.
* **Cambio que podría defender o modificar en vivo:** Puedo explicar y modificar el manifest, sus iconos y las pruebas que detectan campos faltantes, rutas incorrectas o archivos inexistentes. También puedo demostrar por qué la ruta `/manifest.webmanifest` se genera desde `src/app/manifest.ts` durante el build.
* **Uso declarado de IA:** Utilicé GitHub Copilot para revisar la estructura existente, identificar la ubicación incorrecta de los iconos, proponer la prueba del manifest y redactar esta evidencia. Revisé manualmente los cambios, ejecuté las pruebas, reinstalé las dependencias y confirmé el build antes de conservar la solución.

### Dulce Acevedo Miguel

- **Estudiante:** Dulce Acevedo Miguel
- **Commit SHA evaluado:** `fe12e0565fd6ff51d477681db370d3a318ae462b`
- **Contribución concreta:** Implementé `src/components/app-shell.tsx` como estructura reusable del shell (header, navegación, main, footer con landmarks accesibles), separé la lista de inspecciones en `src/components/inspection-list.tsx` con los 4 estados requeridos (carga, error, vacío, éxito), y refactoricé `src/app/page.tsx` para usarlos conservando el diseño original. También corregí un `@ts-expect-error` innecesario en `src/app/layout.tsx` que rompía `npm run build`, agregué `public/manifest.webmanifest` como archivo estático requerido por el workflow, y limpié `public-tests/check.sh` que había quedado con contenido duplicado.
- **Decisión que puedo explicar:** Extraje el shell a un componente separado en vez de dejar toda la estructura en `page.tsx`, para que sea reusable. El enlace de navegación "Resumen" se dejó como texto no clicable (`aria-disabled`) en vez de un `<a href="/resumen">` real, porque esa ruta no existe todavía y un enlace roto generaba un 404 confirmado con pruebas manuales.
- **Comandos ejecutados y resultado real observado:** `npm test` (`starter.spec.mjs: PASS`, `manifest.spec.mjs: PASS`), `npm run build` (compiló sin errores, generó `/`, `/_not-found` y `/manifest.webmanifest`), `npm run verify` (`Verificación técnica: pass`). También probé manualmente navegación por teclado y diseño responsive con las DevTools del navegador.
- **Qué verifica y qué no verifica:** Las pruebas y el build confirman que el código compila y que el texto exigido por `starter.spec.mjs` sigue presente. No verifican automáticamente accesibilidad por teclado, comportamiento responsive, ni que los 4 estados de `InspectionList` se vean correctamente - eso lo revisé manualmente, sin prueba automatizada todavía.
- **Limitación encontrada:** Al mover el título fuera de `page.tsx`, rompí inicialmente `starter.spec.mjs` (buscaba el texto literal ahí); lo resolví pasando el texto como props en vez de modificar la prueba base. Los 4 estados de `InspectionList` existen en el componente, pero la página solo fuerza el estado "éxito" con datos estáticos - no hay todavía fuente de datos real para demostrar los otros 3 en vivo.
- **Uso de IA:** Utilicé Claude (Anthropic) para generar el código inicial de `app-shell.tsx` e `inspection-list.tsx` a partir de la estructura y estilos ya existentes, y para diagnosticar por qué se rompió `starter.spec.mjs` tras el refactor. Revisé manualmente cada archivo y corrí las pruebas hasta confirmar que pasaban, decidiendo yo misma cómo resolver el conflicto del texto.

## Semana 3

### Marco Antonio Aguilar Castillo

- **Commit SHA evaluado:** `03f4d4bc731b4aee8febba81a3e4aa06c05c5651`.
- **Contribución concreta:** Corregí el fallback de navegación en `public/sw.js` para esperar la coincidencia de `/` antes de decidir entre caché y respuesta 503. Integré los specs de Semana 3 en `package.json`, actualicé el requisito a Node 22.18 para ejecutar TypeScript nativamente, agregué sus artefactos al chequeo estructural de `scripts/verify.mjs` y al check público, y actualicé el workflow para ejecutar el mismo `npm test` con esa versión de Node.
- **Decisión técnica que puedo explicar:** Mantener el fallback como respuesta HTML 503 cuando no exista ni la navegación solicitada ni `/` en caché evita devolver `undefined` ante una caída de red. Los specs TypeScript se ejecutan directamente con Node, sin agregar un runner o dependencia adicional, y se encadenan después de las pruebas de Semanas 1 y 2 para conservar su cobertura.
- **Pruebas ejecutadas y resultado real:** `npm ci`, `npm test`, `npm run build`, `make verify` y `node scripts/verify.mjs --structure` terminaron correctamente con Node v22.22.0 y npm 10.9.4. Los dos specs de Semana 3 reportaron PASS; el check Bash se reserva para GitHub Actions porque este entorno Windows no tiene Bash.
- **Limitación pendiente:** No se ejecutó una prueba E2E en navegador para registro, activación/espera de una actualización o la interfaz offline. Los specs de Node emitieron una advertencia de tipo de módulo, sin afectar el resultado.
- **Uso declarado de IA:** Utilicé Codex para auditar el flujo existente, localizar la causa del fallback, preparar cambios mínimos de integración y revisar resultados. Validé manualmente el diff y ejecuté las comprobaciones de Node disponibles.

### David Aguilar Rodríguez 

Contribución concreta: Creé tests/service-worker.spec.ts y tests/offline.spec.ts. Las pruebas ejecutan el contenido real de public/sw.js en un entorno aislado en memoria con Cache Storage, eventos y respuestas de red sintéticas; no modifican el worker ni usan red, credenciales o datos reales.
Decisión técnica que puedo explicar: Modelé el contrato observable del worker actual, en vez de imponer otra estrategia: instalación/precache atómico, cache-first para iconos estáticos, network-first para navegaciones, limpieza de cachés pwa-* obsoletos y clients.claim(). Una versión nueva se simula exclusivamente en memoria para verificar que el ciclo install/activate invalida las cachés de la versión anterior.
Pruebas ejecutadas y resultado real:
node tests/service-worker.spec.ts: PASS — instalación, precache, runtime cache, actualización e invalidación.
node tests/offline.spec.ts: PASS — fallback offline, recuperación de navegaciones y protección contra respuestas HTTP no cacheables.
npm test: PASS — ejecuta las pruebas base, de manifest y los dos specs de Semana 3.
npm run build: PASS — Next.js 14.2.35 compila sin errores, genera páginas estáticas correctamente.
Qué cubren y qué no cubren: Cubren el comportamiento de caché y recuperación del worker con respuestas, fallos y versiones sintéticos y deterministas. No sustituyen una prueba E2E en un navegador real ni prueban el registro visual del worker. Tampoco afirman sincronización de formularios o datos de inspecciones, porque el worker no la implementa.
Limitación pendiente: Las pruebas son de unidad/integración aislada y no sustituyen una prueba E2E en navegador para el registro visual, activación o actualización del worker. El workflow ejecuta la suite completa y comprueba los artefactos de Semana 3.
Uso declarado de IA: Utilicé Codex para inspeccionar el contrato existente, proponer el entorno aislado de pruebas y redactar las aserciones y esta evidencia. Validación humana: revisé manualmente el flujo del worker

### Dulce Acevedo Miguel

- **Commit SHA evaluado:** `03f4d4bc731b4aee8febba81a3e4aa06c05c5651`.
- **Contribución concreta:** Audité y actualicé `docs/cache-strategy.md`, `README.md`, `public-tests/README.md` y `tests/README.md` para describir el Service Worker, la cobertura offline, las pruebas y sus límites reales. Añadí esta evidencia sin modificar el worker, el registro, las pruebas, scripts ni workflows.
- **Decisión documental que puedo explicar:** Documenté el fallback de navegación con respuesta 503 cuando no existe ni la URL solicitada ni `/` en caché. También distinguí recuperación de solicitudes de sincronización de datos, que el proyecto no implementa.
- **Prueba o validación ejecutada y resultado real:** Con Node `v22.22.0` y npm `10.9.4`, `npm ci`, `npm test`, `npm run build` y `make verify` terminaron correctamente. Los specs de Semana 3 pasaron; el check Bash se ejecuta en CI porque este entorno Windows no tiene Bash.
- **Qué valida y qué no valida:** La revisión comparó la documentación con `public/sw.js`, `register-service-worker.ts`, el componente de registro, los specs, `package.json`, `scripts/verify.mjs` y el workflow de Semana 3. No sustituye una prueba E2E en navegador y no valida sincronización, porque no existe esa capacidad.
- **Limitación o hallazgo para integración:** No hay prueba E2E de navegador para registro, activación/espera de una actualización o la interfaz offline. El check público y el workflow ya incluyen los artefactos de Semana 3.
- **Uso declarado de IA:** Utilicé Codex como apoyo para inspeccionar los archivos, contrastar el comportamiento y estructurar la documentación. Revisé manualmente cada afirmación contra el código y la salida de los comandos antes de incorporarla.

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.

## Semana 4

### Marco Antonio Aguilar Castillo (GitHub: MarcoAAguil4r)

- **Commit asociado a mi contribución:** [`580bdbb0f856e3aa37151d3960cd796e600ae52a`](https://github.com/MarcoAAguil4r/PWA-Starter/commit/580bdbb0f856e3aa37151d3960cd796e600ae52a). El commit implementa `/inspecciones` como Server Component dinámico, reutiliza los datos sintéticos y agrega el estado de carga de la ruta y `LoadingState`.
- **Decisión que puedo explicar:** El listado de solo lectura se renderiza por solicitud en servidor para entregar su contenido en el HTML inicial. La ruta de detalle resuelve su identificador y estado en un Client Component.
- **Validación de esta revisión asistida:** `npm ci --ignore-scripts --no-audit --no-fund` y `make verify` terminaron correctamente en Node `v22.22.0`. Pasaron la suite, el build de producción y cinco solicitudes medidas por ruta después de una solicitud de calentamiento. Los reportes son `reports/verification.json` y `reports/rendering-metrics.json`; la última medición se registra en este último. El escaneo equivalente del check público pasó con PowerShell; el script Bash no se ejecutó localmente porque este entorno no dispone de Bash. No se ha confirmado una corrida remota de GitHub Actions.
- **Alcance y limitación:** La medición HTTP local informa mediana de respuesta y bytes del HTML inicial; no equivale a Core Web Vitals ni mide hidratación en navegador. Las pruebas son de contrato y no sustituyen E2E o una revisión con lector de pantalla.
- **Cambio que puedo defender o modificar:** `src/app/inspecciones/page.tsx`, `src/app/inspecciones/loading.tsx`, `src/components/loading-state.tsx` y la decisión SSR del listado.
- **Uso de IA:** GitHub Copilot apoyó la revisión de requisitos, la instrumentación de medición, las pruebas y la redacción de esta evidencia. Debo revisar el resultado y poder explicar personalmente las decisiones antes de entregar.

## Semana 4

### Marco Antonio Aguilar Castillo (GitHub: MarcoAAguil4r)

- **Commit asociado:** [`580bdbb0f856e3aa37151d3960cd796e600ae52a`](https://github.com/MarcoAAguil4r/PWA-Starter/commit/580bdbb0f856e3aa37151d3960cd796e600ae52a).
- **Contribución comprobable:** Implementé `/inspecciones` como Server Component dinámico, reutilizando las inspecciones sintéticas. También agregué el estado de carga de la ruta y el componente compartido `LoadingState`, junto con los artefactos iniciales de la actividad.
- **Decisión técnica que puedo explicar:** Mantener el listado en servidor permite entregar las inspecciones en el HTML inicial sin convertir esa ruta en Client Component. `dynamic = "force-dynamic"` hace explícito que el listado se renderiza por solicitud; `loading.tsx` presenta el estado de espera de la ruta.
- **Validación del repositorio actual:** `make verify` ejecuta la suite, el build de producción y la medición repetible de cinco respuestas HTTP por ruta. El reporte guarda la mediana de duración y los bytes del HTML inicial. El check público Bash requiere Bash; la corrida remota de GitHub Actions debe confirmarse antes de entregar.
- **Limitación identificada:** La duración HTTP local no representa Core Web Vitals ni el tiempo de hidratación. La fuente del detalle es sintética, por lo que su camino de error no se activa en el flujo normal; las pruebas de contrato no sustituyen una prueba E2E de hidratación.
- **Cambio que puedo explicar o modificar:** La ruta `src/app/inspecciones/page.tsx`, el estado de carga `src/app/inspecciones/loading.tsx` y `src/components/loading-state.tsx`, incluidos el uso de SSR y los datos sintéticos.
- **Uso de IA:** GitHub Copilot se utilizó en esta revisión para contrastar los requisitos con el código e historial y redactar esta evidencia. Antes de entregar, debo revisar el texto y poder explicar personalmente la decisión y sus límites.

## Semana 5

### Marco Antonio Aguilar (3523110229)
- **Commit asociado:** `f42a3610a81c42b7b25a9e0c7f4d95040a03e627`.
- **Contribución concreta:** Definí el esquema versionado de IndexedDB, validadores y política de conflictos; después integré la escritura atómica de inspección/cola, un endpoint HTTP sintético idempotente, reintentos con backoff, el formulario de captura y pruebas de IndexedDB realista con `fake-indexeddb`. Actualicé la documentación, los checks públicos y la evidencia.
- **Decisión técnica que puedo explicar:** Una captura y su operación se confirman en la misma transacción IndexedDB. El endpoint compara `baseServerRevision`, aplica claves idempotentes y conserva la versión local y remota en conflictos. Una revisión obsoleta no puede hacer retroceder la revisión local.
- **Pruebas ejecutadas y resultado real:** `npm ci --ignore-scripts --no-audit --no-fund` terminó correctamente. `node tests/sync.spec.ts` pasó los casos de rollback/reapertura, validación, servidor sintético, deduplicación, reintentos y conflictos. `make verify` terminó con `Verificación técnica: pass`: suite, build, escaneo de secretos, check público y medición SSR/CSR pasaron. En navegador, la captura offline quedó `pending` y pasó automáticamente a `synced` al reconectar, sin alerta falsa. Node emitió advertencias `MODULE_TYPELESS_PACKAGE_JSON` en specs TypeScript, sin afectar los resultados.
- **Alcance y limitación:** El endpoint HTTP guarda sus revisiones e idempotency keys en memoria del proceso; demuestra el intercambio cliente-servidor, pero no sustituye un backend/base de datos persistente en producción. La UI muestra conflictos, pero aún no permite resolverlos manualmente.
- **Uso de IA:** GitHub Copilot apoyó cambios en esquema, store, cola, endpoint, formulario, pruebas, checks y documentación. Debo revisar el resultado, ejecutar la verificación final y poder explicar/modificar las decisiones antes de entregar.

## Dulce Acevedo Miguel

- **Estudiante:** Dulce Acevedo Miguel
- **Commit SHA evaluado:** `2c4ceae645baeb261acf615af5f4321f548d0c28`
- **Contribución concreta:** Implementé `src/lib/sync/queue.ts` — la cola de sincronización idempotente sobre los contratos de Marco (`schema.ts`, `conflict-policy.ts`). Incluye `enqueueOperation()` (deduplicación por `idempotencyKey`) y `processPendingOperations()` (reintentos con límite, recuperación tras recargar, y protección ante respuestas fuera de orden delegando en `resolveInspectionConflict`). Amplié `tests/sync.spec.ts` con 9 casos de comportamiento de la cola (dedup, sincronización exitosa, ya-aplicado, conflicto real, respuesta obsoleta, reintentos, fallo no recuperable, límite de reintentos, recuperación tras recarga) usando un transporte sintético (`createSyntheticTransport`), y agregué la sección "Cola de sincronización" en `docs/sync-policy.md` documentando estas decisiones.
- **Decisión que puedo explicar:** Diseñé `processPendingOperations()` para recibir `resolveConflict` como parámetro en vez de importar `resolveInspectionConflict` directamente dentro de `queue.ts`. Esto evita un conflicto real entre dos entornos de este proyecto: el build de Next (bundler, que rechaza la extensión `.ts` en imports dentro de `src/`) y la ejecución directa con `node` en las pruebas (que exige extensión explícita para resolver imports de valor). De paso, deja la cola más fácil de probar sin mocks, porque las pruebas inyectan la función real de `conflict-policy.ts`.
- **Prueba que ejecuté y resultado:** `node tests/sync.spec.ts` → 2 líneas `PASS` (la suite original de Marco más mis 9 casos nuevos de la cola). `npm run build` → compila sin errores. `npm test` → sigue pasando igual que antes de mi cambio (confirmando que no rompí nada existente). Nota: `npm test` todavía no incluye `sync.spec.ts` en su script — eso corresponde a la integración final del Integrante 3.
- **Qué verifica y qué no verifica:** Mis pruebas verifican el comportamiento de la cola (persistencia, dedup, reintentos, recuperación, orden) usando un store en memoria y un transporte sintético con respuestas programadas. No verifican una integración real contra IndexedDB en el navegador ni contra un backend real — no existe todavía ninguno de los dos en el proyecto, y el adaptador sintético está documentado explícitamente como tal, no como un servicio real.
- **Limitación encontrada:** Al ejecutar el archivo por primera vez me topé con que Node no podía resolver el import de `conflict-policy` desde `queue.ts` bajo ninguna combinación de extensión que no rompiera al mismo tiempo el build de Next — lo identifiqué probando ambos entornos por separado y resolví con inyección de dependencia en vez de un import directo. También tuve un problema de que el archivo quedó vacío tras guardarlo con Notepad (probable problema de codificación al pegar texto largo con comentarios); lo resolví reescribiéndolo con `Set-Content -Encoding utf8` desde PowerShell.
- **Uso de IA:** Utilicé Claude (Anthropic) para diseñar `queue.ts` a partir de los contratos ya definidos por mi compañero (`schema.ts`, `conflict-policy.ts`) y los requisitos de la actividad, y para diagnosticar tanto el conflicto de resolución de módulos como el problema del archivo vacío. Ejecuté yo misma cada prueba y el build repetidamente hasta confirmar que pasaban, y decidí yo misma el diseño de inyección de dependencia como solución.

### David Aguilar Rodríguez 

- **Commit SHA evaluado:** `72b46b2c20b6eb321b879feb112fad441b125ac8`
- **Contribución concreta:** Integré `IndexedDbInspectionStore`, `InspectionWorkspace` y el transporte sintético determinista. La pantalla captura y valida inspecciones, conserva registros y operaciones en IndexedDB, muestra `pending`/`synced`/`conflict`, procesa al evento `online` y evita sincronizaciones simultáneas por pestaña. También incorporé `tests/sync.spec.ts` a `npm test`, el workflow de Semana 5, el check público al verificador y la documentación. Corregí la integración para conservar el listado SSR de `inspections` en `/inspecciones`; el componente cliente sólo presenta capturas nuevas y no duplica los registros iniciales.
- **Decisión técnica que puedo explicar:** El store del navegador implementa el contrato `SyncQueueStore` en vez de cambiar la cola existente. El único cambio de contrato fue `saveConflict()`: antes, una decisión de conflicto sólo marcaba el registro local y eliminaba la operación; ahora persiste ambos snapshots antes de hacerlo. El adaptador remoto sigue explícitamente sintético, no se presenta como backend.
- **Pruebas ejecutadas y resultado real:** La ejecución de integración posterior a la corrección SSR reportó PASS para `starter.spec.mjs`, `manifest.spec.mjs`, `service-worker.spec.ts`, `offline.spec.ts`, `rendering.spec.ts` y `sync.spec.ts`; `npm.cmd run build`, `measure:rendering`, `npm.cmd run verify` y el contrato público de Semana 5 también terminaron correctamente. `reports/verification.json` registró `Verificación técnica: pass. Revisión académica: pendiente.` Además, `git diff --check` terminó con código 0.
- **Limitación o bloqueo diagnosticado:** El transporte sintético no sincroniza entre dispositivos y no existe una interfaz para resolver manualmente un conflicto. Los avisos `MODULE_TYPELESS_PACKAGE_JSON` de Node en specs TypeScript no afectan las pruebas ni el build; no se modificó `package.json` sólo para ocultarlos.
- **Cambio que puedo defender o modificar en vivo:** La persistencia IndexedDB y el flujo `online → processPendingOperations`, incluida la protección de concurrencia y la conservación de conflictos.
- **Uso declarado de IA:** Utilicé Codex para auditar el repositorio, integrar los contratos existentes, redactar documentación y revisar el diff. Revisé los cambios y registré las verificaciones bloqueadas tal como ocurrieron.
