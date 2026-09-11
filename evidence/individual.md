# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

- Grupo 10B , equipo 1 
- Repositorio del equipo:https://github.com/MarcoAAguil4r/PWA-Starter.git

## Integrantes:

## David Aguilar Rodriguez 

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

### Evidencia individual de Semana 2 — David Aguilar Rodriguez

- **Contribución concreta:** Actualicé `tests/manifest.spec.mjs` para verificar el manifest real, los iconos públicos, los landmarks y navegación reales de `app-shell.tsx`, y los estados visuales de `inspection-list.tsx`. También actualicé `scripts/verify.mjs`, README y este registro de evidencia.
- **Decisión que puedo explicar:** La prueba se ajusta al contrato que el equipo implementó: comprueba las opciones de navegación existentes (`Inspecciones` y `Resumen (próximamente)`) y no exige una opción “Configuración” ni un skip link que no están en el shell. Así una falla señala una regresión real, no una expectativa inventada por la prueba.
- **Comandos ejecutados y resultado real observado:** `node --version` devolvió `v24.19.0`. `node tests/manifest.spec.mjs` terminó correctamente y reportó PASS para manifest/iconos, landmarks/navegación y estados visuales. Intenté en orden `npm ci`, `npm test`, `npm run build` y `npm run verify`, pero todos quedaron bloqueados porque PowerShell informó que `npm` no se reconoce como comando. También intenté `bash public-tests/check.sh`; Bash devolvió `CreateInstance/E_ACCESSDENIED`. Por ello no afirmo resultados de instalación, build, verify ni prueba pública.
- **Qué verifica y qué no verifica la prueba:** Verifica campos y rutas declarados en `src/app/manifest.ts`, la existencia física de ambos PNG, landmarks del shell, las dos opciones actuales de navegación y los mensajes/roles de los estados de carga, error y vacío. No verifica instalación en navegador, service worker, comportamiento offline, sincronización ni el aspecto visual en un dispositivo real.
- **Limitación encontrada:** El repositorio conserva `public/manifest.webmanifest` además de `src/app/manifest.ts`. Mi alcance no autoriza modificarlo; queda como hallazgo para el equipo porque puede producir dos fuentes de verdad. Además, este entorno no expone npm ni permite iniciar Bash, lo que impidió la validación completa solicitada.
- **Uso de IA:** Utilicé Codex como apoyo para inspeccionar los archivos reales, redactar pruebas deterministas y documentación, y ejecutar las comprobaciones disponibles. Revisé manualmente los textos, los patrones de las aserciones y la salida de los comandos; los resultados bloqueados se registran tal como ocurrieron.

## Marco Antonio Aguilar Castillo

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

### Evidencia individual de Semana 2

* **Estudiante:** Marco Antonio Aguilar Castillo
* **Commit SHA evaluado:** `6dc1f8748ab06bb765262516a498e7b95b9bd45b`
* **Contribución concreta:** Integré la configuración del manifest PWA en `src/app/manifest.ts`, verifiqué sus campos de instalación y moví los iconos sintéticos a `public/icons/`, que es la carpeta pública que Next.js expone en las rutas del manifest. También agregué las pruebas `tests/manifest.spec.mjs` y `tests/manifest.spec.ts`, y actualicé el comando `npm test` para ejecutar la prueba del manifest junto con la prueba existente del starter.
* **Decisión técnica que puedo explicar:** Mantener `src/app/manifest.ts` como fuente del manifest mediante el App Router de Next.js permite generar la ruta `/manifest.webmanifest` sin duplicar la configuración. Los iconos se mantienen en `public/icons/` porque los recursos referenciados por `/icons/...` deben existir en la carpeta pública de Next.js. Esta entrega configura la instalación, pero no afirma implementar service worker, sincronización ni funcionamiento offline.
* **Prueba que ejecuté y resultado:** Ejecuté `npm ci --ignore-scripts --no-audit --no-fund`, `npm test`, `npm run build`, `npm run verify` y `node scripts/verify.mjs --structure`. La instalación terminó correctamente; `starter.spec.mjs` y `manifest.spec.mjs` pasaron; el build de Next.js terminó correctamente y generó la ruta `/manifest.webmanifest`; `npm run verify` reportó `Verificación técnica: pass`; y la comprobación estructural terminó con `Estructura presente`.
* **Qué verifica la prueba y qué no verifica:** Las pruebas comprueban los campos principales del manifest, las rutas de los iconos y la existencia de los archivos PNG. El build verifica que Next.js compile y genere la ruta del manifest. Estas comprobaciones no validan todavía la navegación completa del app shell, los estados de carga/error/vacío ni la instalación real en todos los navegadores.
* **Limitación o fallo diagnosticado:** Los iconos inicialmente estaban en `src/public/icons`, una ubicación que no se publica como `/icons/...`; los moví a `public/icons/`. Además, el comando `bash public-tests/check.sh` no pudo ejecutarse en mi entorno Windows porque Bash no estaba instalado; ejecuté su equivalente multiplataforma `node scripts/verify.mjs --structure`. La integración completa aún depende de que se agregue `src/components/app-shell.tsx` y se resuelva el contrato del workflow sobre `public/manifest.webmanifest`.
* **Cambio que podría defender o modificar en vivo:** Puedo explicar y modificar el manifest, sus iconos y las pruebas que detectan campos faltantes, rutas incorrectas o archivos inexistentes. También puedo demostrar por qué la ruta `/manifest.webmanifest` se genera desde `src/app/manifest.ts` durante el build.
* **Uso declarado de IA:** Utilicé GitHub Copilot para revisar la estructura existente, identificar la ubicación incorrecta de los iconos, proponer la prueba del manifest y redactar esta evidencia. Revisé manualmente los cambios, ejecuté las pruebas, reinstalé las dependencias y confirmé el build antes de conservar la solución.

## Dulce Acevedo Miguel

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

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
