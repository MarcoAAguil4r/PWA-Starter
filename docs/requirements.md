# Requisitos del producto — documento del equipo

> Sustituyan las orientaciones por su análisis. Los ejemplos muestran el formato; pueden usar otros equivalentes. Los requisitos del producto futuro se documentan ahora y se implementarán en las semanas correspondientes. No hay una cantidad nueva obligatoria de requisitos.

## 1. Problema y contexto

Los técnicos de mantenimiento realizan rondas de inspección en laboratorios distribuidos en distintos edificios de la universidad, incluyendo zonas con cobertura celular deficiente o sin señal Wi-Fi, como  laboratorios químicos y áreas especializadas. Cuando un técnico detecta un hallazgo (por ejemplo, un equipo con falla o una condición de seguridad que atender) en una de esas zonas, no siempre puede registrarlo en el momento porque depende de una conexión activa. Esto provoca que los hallazgos se anoten después de memoria, en papel, o se pospongan hasta recuperar señal, lo que genera retrasos, registros incompletos y dificultad para dar seguimiento oportuno a equipos que requieren atención.

El producto busca resolver esa brecha: permitir que el registro y la consulta de inspecciones de mantenimiento no dependan de tener conexión en el instante exacto en que ocurre el hallazgo, y dar visibilidad centralizada del estado de los laboratorios tanto a quien hace la ronda como a quien supervisa desde una oficina.

Queda fuera de este producto:

Gestión de compras, repuestos o proveedores de mantenimiento.
Integración con sistemas institucionales de activos o directorios (Active Directory/LDAP).
Autenticación real de usuarios y control de accesos por rol (se documenta como requisito futuro; no se implementa esta semana).
Funcionalidad offline y sincronización real (manifest, service worker, cola de sincronización): se describe como capacidad futura en la sección de escenarios y requisitos, pero no se construye en esta entrega.
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
Resultado esperado (capacidad futura, no implementada esta semana): el registro del hallazgo se guarda localmente en el dispositivo del técnico y queda marcado como "pendiente de sincronización"; al recuperar conexión, se sincroniza automáticamente con el servidor sin que el técnico tenga que volver a capturarlo ni pierda la información levantada en campo.

## 3. Requisitos funcionales

Describan acciones del producto vinculadas a sus escenarios. Cada requisito lleva identificador, acción, condición de aceptación y alcance temporal.

| ID | Acción del producto | Condición observable de aceptación | Ahora o futuro |
|---|---|---|---|
| RF-01 (ejemplo, adaptar) | Mostrar los registros sintéticos del starter | Al abrir la página se ven las tres inspecciones proporcionadas | Semana 1 |

Un requisito como «gestionar inspecciones» necesita precisar qué acción y qué resultado se observarán. Agreguen los requisitos que cubran sus escenarios sin inventar que ya están implementados.

## 4. Requisitos no funcionales

Describan reproducibilidad, accesibilidad, seguridad, privacidad, rendimiento y operación offline futura. Para cada uno indiquen condición, método de comprobación y momento de validación. Declaren los supuestos de cualquier umbral propuesto.

Ejemplo: «En una copia limpia, con las versiones declaradas de Node y npm, `npm ci` y `npm run verify` terminan con código 0» (reproducibilidad actual).

Ejemplo de meta futura: «Con 100 registros sintéticos en el dispositivo de prueba declarado, el listado aparece en menos de 2 segundos; se medirá en cinco ejecuciones bajo la conexión definida». Esa cifra es ilustrativa, no un umbral impuesto ni un resultado ya medido.

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
 