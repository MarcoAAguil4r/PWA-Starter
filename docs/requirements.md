# Requisitos del producto — documento del equipo

> Sustituyan las orientaciones por su análisis. Los ejemplos muestran el formato; pueden usar otros equivalentes. Los requisitos del producto futuro se documentan ahora y se implementarán en las semanas correspondientes. No hay una cantidad nueva obligatoria de requisitos.

## 1. Problema y contexto

Los técnicos de mantenimiento realizan rondas de inspección en laboratorios distribuidos en distintos edificios de la universidad, incluyendo zonas con cobertura celular deficiente o sin señal Wi-Fi, como  laboratorios químicos y áreas especializadas. Cuando un técnico detecta un hallazgo (por ejemplo, un equipo con falla o una condición de seguridad que atender) en una de esas zonas, no siempre puede registrarlo en el momento porque depende de una conexión activa. Esto provoca que los hallazgos se anoten después de memoria, en papel, o se pospongan hasta recuperar señal, lo que genera retrasos, registros incompletos y dificultad para dar seguimiento oportuno a equipos que requieren atención.

El producto busca resolver esa brecha: permitir que el registro y la consulta de inspecciones de mantenimiento no dependan de tener conexión en el instante exacto en que ocurre el hallazgo, y dar visibilidad centralizada del estado de los laboratorios tanto a quien hace la ronda como a quien supervisa desde una oficina.

Queda fuera de este producto:

Gestión de compras, repuestos o proveedores de mantenimiento.
Integración con sistemas institucionales de activos o directorios (Active Directory/LDAP).
Autenticación real de usuarios y control de accesos por rol (se documenta como requisito futuro; no se implementa esta semana).
Sincronización institucional persistente, compartida entre servidores/dispositivos, autenticación y sincronización en segundo plano siguen fuera del alcance actual. La Semana 5 implementa captura local en IndexedDB y un endpoint HTTP sintético en memoria para demostrar la cola, los reintentos y la política de conflictos; no es almacenamiento de producción.
Notificaciones push y reportes automatizados hacia terceros.

## 2. Usuarios y escenarios

Usuarios:

Técnico de mantenimiento: realiza las rondas físicas de inspección, revisa el estado de los equipos y registra hallazgos. Trabaja principalmente desde smartphone o tablet, con frecuencia en zonas de conectividad limitada.
Docente o encargado de laboratorio: usa el espacio en el día a día, consulta el estado de su laboratorio y puede reportar una incidencia que detecta fuera de una ronda formal. Accede desde tablet o laptop.
Auditor o administrador: revisa el histórico de inspecciones, valida que los hallazgos marcados como críticos hayan sido atendidos y da seguimiento general al programa de mantenimiento. Accede típicamente desde una computadora de escritorio con conexión estable.

Escenario 1 — con conexión estable

Situación inicial: el auditor abre la aplicación desde su computadora de escritorio en la oficina, con conexión de red estable.
Acción: consulta el listado de inspecciones recientes para identificar cuáles requieren atención.
Resultado esperado: la pantalla muestra las inspecciones disponibles —como las tres inspecciones sintéticas del starter actual— cada una con responsable, fecha, número de hallazgos y estado, de modo que el auditor puede distinguir de un vistazo cuáles necesitan seguimiento.

Escenario 2 — con conectividad intermitente

Situación inicial: un técnico de mantenimiento realiza una ronda de inspección en el edificio B de industriales en laboratorios químicos, una zona sin cobertura Wi-Fi ni señal celular estable.
Acción: durante la ronda detecta una falla en un equipo (por ejemplo, un extractor de gases) e intenta registrar el hallazgo en el formulario de inspección.
Resultado implementado en Semana 5: el registro sintético se guarda localmente en IndexedDB y queda marcado como `pending`; al recuperar conexión, se envía por HTTP al endpoint sintético y cambia a `synced` o `conflict`. La integración demuestra el flujo, pero el endpoint conserva estado solo mientras vive el proceso del servidor.

## 3. Requisitos funcionales

Describan acciones del producto vinculadas a sus escenarios. Cada requisito lleva identificador, acción, condición de aceptación y alcance temporal.

## 3. Requisitos funcionales

| ID | Acción del producto | Condición observable de aceptación | Ahora o futuro |
|---|---|---|---|
| RF-01 | Mostrar el listado de inspecciones registradas en la pantalla principal | Al abrir la aplicación se ven las tres inspecciones sintéticas del starter, cada una en su propia tarjeta | Semana 1 |
| RF-02 | Mostrar, por cada inspección, responsable, fecha, número de hallazgos y estado | En cada tarjeta del listado aparecen visibles los cuatro datos (ej. Técnico B, 2026-08-27, 2 hallazgos, "Requiere atención") | Semana 1 |
| RF-03 | Distinguir visualmente el estado de una inspección ("Sin incidencias" vs "Requiere atención") | La etiqueta de estado usa color y texto distintos según el caso, visible sin abrir el detalle | Semana 1 |
| RF-04 | Indicar un contador total de inspecciones registradas | La pantalla muestra el número total de registros (ej. "3 registros") junto al listado | Semana 1 |
| RF-05 | Registrar una inspección sintética mediante el formulario | Con datos válidos, la inspección aparece con los mismos valores y el formulario se limpia solo después de persistirla | Semana 5 |
| RF-06 | Guardar localmente una captura sin conexión | La inspección y su operación quedan en una transacción IndexedDB y se muestran como `pending`; sobreviven a recarga/cierre de pestaña | Semana 5 |
| RF-07 | Sincronizar pendientes al recuperar conexión | El evento `online` envía la operación al endpoint HTTP sintético; reintentos con la misma clave no crean un segundo registro y los conflictos conservan ambas versiones | Semana 5, endpoint sintético |
| RF-08 | Permitir que un auditor marque un hallazgo crítico como atendido | Al marcar un hallazgo como atendido, su estado cambia y queda visible en el historial de la inspección correspondiente | Futuro |

## 4. Requisitos no funcionales

**Reproducibilidad (ahora).** En una copia limpia del repositorio, con Node 22.18+ y npm 10+ declarados, `npm ci` seguido de `make verify` termina con código de salida 0. Se comprueba localmente y en GitHub Actions antes de reportar el SHA final.

**Accesibilidad (ahora).** Las etiquetas de estado ("Sin incidencias", "Requiere atención") no dependen únicamente del color para transmitir su significado, ya que van acompañadas de texto; el contraste de texto sobre fondo cumple una relación mínima aproximada de 4.5:1 (referencia WCAG AA). Se comprueba con inspección manual y la herramienta de contraste de DevTools, al revisar la interfaz existente esta semana.

**Seguridad (Semana 5, validación básica).** El formulario valida campos obligatorios, límites de longitud y hallazgos enteros no negativos; el esquema valida fechas, timestamps, revisiones y consistencia de identificadores. No se afirma sanitización de contenido enriquecido ni protección de autenticación, que no forman parte de este formulario sintético.

**Privacidad (ahora y futuro).** La aplicación no muestra ni almacena datos personales reales de estudiantes, docentes o personal; únicamente usa los identificadores, nombres de laboratorio y correos institucionales ficticios declarados en la sección 5. Se comprueba revisando el código y los datos de prueba antes de cada commit.

**Rendimiento (futuro; cifra ilustrativa, no medida aún).** Con 100 registros sintéticos cargados, se propone que el listado de inspecciones se renderice en menos de 2 segundos bajo una conexión 4G simulada. Se medirá con la pestaña Performance de DevTools en cinco ejecuciones bajo la misma conexión, cuando se implemente la carga dinámica de datos (no aplica a los datos fijos de Semana 1).

**Offline (Semana 5).** Una captura sin conexión persiste con su operación en una transacción IndexedDB; al recuperar red se procesa con idempotency key, reintentos acotados y protección de revisiones fuera de orden. Se verifica con `tests/sync.spec.ts` y una prueba de navegador. El servidor sintético es en memoria; no garantiza persistencia remota tras reiniciar o escalar el servidor.

## 5. Datos sintéticos y límites

Indiquen qué campos ficticios usa la aplicación y qué información real excluyen. No incluyan datos reales de estudiantes ni credenciales. La identificación académica de los integrantes se registra solo en la evidencia del repositorio privado y Classroom.

### Datos Ficticios Utilizados
Para el desarrollo y pruebas de la plataforma se utilizarán exclusivamente conjuntos de datos sintéticos representativos del entorno universitario:
* **Catálogo de Laboratorios y Espacios:** Nombres simulados (ej. *Laboratorio de Química Orgánica Q-102*, *Lab de Cómputo Multiplataforma L-05*), ubicaciones por edificio/planta ficticios y responsables asignados con identificadores simulados.
* **Inventario de Equipos y Activos:** Equipos de prueba con números de serie generados artificialmente (ej. *AUT-EQ-9812*), marcas, modelos, estados operativos (*Operativo*, *Requiere Calibración*, *Baja*) y fechas de mantenimiento simuladas.
* **Usuarios y Credenciales:** Cuentas de prueba para roles de Técnico de Mantenimiento, Docente/Encargado de Laboratorio y Auditor de Seguridad con correos de dominio institucional ficticio (ej. `tecnico.test@universidad.edu.mx`).
* **Registros de Inspección y Fallas:** Reportes de incidentes, listas de verificación de seguridad, bitácoras de mantenimiento preventivo/correctivo y fotografías de muestra libres de derechos.

### Datos Reales Excluidos
Por directivas de privacidad, seguridad institucional y alcance del proyecto, queda estrictamente fuera del sistema:
* **Credenciales de Acceso Institucional:** Contraseñas reales, tokens activos de SSO universitario o accesos a directorios activos corporativos (Active Directory / LDAP institucional).
* **Información Personalmente Identificable (PII) Real:** Nombres completos reales, números de teléfono, correos personales o números de empleado/estudiante reales.
* **Inventario Crítico / Clasificado:** Datos reales de sustancias químicas restringidas, material biológico peligroso o planos clasificados de infraestructura universitaria.
* **Firmas Digitales / Métricas Oficiales:** Firmas oficiales con validez legal o registros de auditorías estatales/nacionales reales.



## 6. Criterios de aceptación de la Semana 1

Relacionen cada entrega actual con una inspección o comando. Distingan la comprobación técnica del juicio sobre contenido.

Ejemplos: prueba del starter → `npm test`; build → `npm run build`; requisitos verificables → revisión del documento; comparación de alternativas → revisión de `docs/decision-record.md`. No afirmen que `npm run verify` valida la calidad del análisis.


 prueba del starter → `npm test`; 
 instalación limpia y rapida de dependencias → `npm ci`;
 build → `npm run build`; 
 requisitos verificables → revisión del documento; 
 comparación de alternativas → revisión de `docs/decision-record.md`. 
 
