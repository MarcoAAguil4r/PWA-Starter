# ADR-001 — Decisión sobre la estrategia de aplicación

> ADR significa registro de decisión arquitectónica. Este documento explica la comparación, la elección y sus consecuencias. Es un documento del equipo; adapten los ejemplos al caso.

## Estado

Indiquen fecha y estado de la decisión: propuesta o aceptada por el equipo.

* **Fecha:** 06 Septiembre de 2026
* **Estado:** Aceptada por el equipo

## Contexto y restricciones

Resuman usuarios, conectividad, uso móvil, datos sintéticos y alcance del curso. Enlacen los escenarios o requisitos que influyen en la decisión.

El proyecto consiste en el desarrollo de una solución para la gestión de **inspecciones de seguridad y registro de mantenimiento de equipos** en los laboratorios universitarios.

### Factores clave del contexto:
1. **Conectividad intermitente:** Los laboratorios (físicos, químicos, áreas especializadas y sótanos) presentan zonas de baja cobertura celular o ausencia total de señal Wi-Fi. Los técnicos deben registrar inspecciones, checklist de seguridad y estados de equipos sin bloqueos de interfaz por falta de red.
2. **Heterogeneidad de dispositivos:** El personal de mantenimiento y docentes utilizan teléfonos inteligentes y tablets personales/institucionales (Android e iOS), mientras que los auditores y administradores acceden principalmente desde computadoras de escritorio y laptops.
3. **Restricciones del curso y stack:** El proyecto utiliza el starter base de **Next.js**. Se requiere optimizar el esfuerzo de desarrollo dentro del ciclo académico sin incurrir en costos de licencias de tiendas de aplicaciones o mantenimiento de múltiples bases de código independientes.
4. **Conjunto de datos sintéticos:** Las pruebas y validaciones iniciales operan con datos simulados de inventario de laboratorio, reduciendo el riesgo de exposición de información confidencial.

## Alternativas consideradas

Comparen PWA, web tradicional, app nativa y multiplataforma. Pueden usar una tabla con una columna por alternativa y filas de instalación, offline, distribución, costo de desarrollo, mantenimiento, acceso al dispositivo y riesgos.

Expliquen condiciones y límites: por ejemplo, «la operación offline requiere diseñar almacenamiento y sincronización; no aparece por usar React». Eviten puntuaciones sin justificación. No es obligatorio construir prototipos de las cuatro opciones.

| Criterio | PWA (Progressive Web App con Next.js) | Web Tradicional (SPA/SSR estándar) | App Nativa (Swift / Kotlin) | Multiplataforma Nativa (Flutter / React Native) |
|---|---|---|---|---|
| **Instalación** | Instalación directa desde el navegador (A2HS/Web App Manifest) en móvil y escritorio sin tiendas. | No instalable; acceso dependiente de navegador y URL activa. | Descarga e instalación obligatoria vía App Store / Google Play. | Descarga e instalación vía tiendas o distribución manual de binarios (APK/IPA). |
| **Soporte Offline** | Alto mediante Service Workers (Workbox / Cache API) e IndexedDB para almacenamiento local estructurado. | Nulo o deficiente; falla si la petición HTTP al servidor no responde. | Nativo y total (SQLite, CoreData, Room, Filesystem). | Nativo y total (SQLite, Hive, WatermelonDB). |
| **Distribución y Actualización** | Inmediata en el servidor web; el cliente actualiza el Service Worker en segundo plano. | Inmediata en servidor al desplegar. | Sujeta a tiempos de revisión y aprobación de Apple y Google. | Sujeta a revisión en tiendas (salvo actualizaciones dinámicas vía CodePush). |
| **Costo y Tiempo de Desarrollo** | **Bajo - Medio:** Una sola base de código en React/Next.js para web, tablets y móviles. | **Bajo:** Una sola base de código web. | **Muy Alto:** Dos proyectos separados (iOS y Android), diferentes lenguajes y habilidades. | **Medio - Alto:** Una sola base de código pero requiere configuración de entornos nativos y emuladores. |
| **Mantenimiento** | Unificado; lógica de negocio, UI y sincronización centralizadas. | Unificado, pero limitado a sesiones conectadas. | Duplicado; corrección de bugs y features por plataforma. | Unificado en lógica compartida, pero requiere mantener bindings nativos y versiones de SO. |
| **Acceso al Dispositivo** | Acceso suficiente (Cámara para QR/fotos, Georreferenciación, Almacenamiento local). | Restringido a APIs básicas del navegador. | Acceso total y de bajo nivel a hardware del dispositivo. | Acceso total y de bajo nivel mediante plugins y puentes nativos. |
| **Riesgos Principales** | Políticas restrictivas de almacenamiento y Service Workers en iOS/WebKit; límites de cuota de caché. | Inoperabilidad total en sótanos y zonas sin señal de la universidad. | Costos de cuentas de desarrollador y lentitud en entregables del curso. | Complejidad añadida de empaquetado nativo y desvío del stack acordado (Next.js). |

### Consideraciones sobre límites técnicos:
* El soporte offline **no se obtiene de manera automática por usar React o Next.js**; requiere una arquitectura intencional que combine interceptación de red con Service Workers, persistencia local transitoria (IndexedDB / LocalStorage) y una cola de peticiones para su posterior sincronización.
* Las limitaciones de iOS (WebKit) respecto al tiempo de retención de caché y cuotas de almacenamiento exigen un diseño cuidadoso en la serialización de registros de inspección y fotos.

## Decisión

Justifiquen la estrategia PWA fijada para el curso con las restricciones del caso. Pueden señalar cuándo otra alternativa sería preferible. Mantengan el starter Next.js para esta entrega; comparar no significa cambiar de stack ni implementar las cuatro opciones.

Se decide implementar una **Progressive Web App (PWA)** basada en **Next.js**.

### Justificación:
1. **Resuelve la conectividad intermitente:** Permite instalar un Service Worker para cachear la interfaz de usuario (App Shell) y registrar inspecciones localmente durante recorridos en áreas sin señal.
2. **Despliegue unificado y multiplataforma:** Ofrece experiencia tipo aplicación móvil en smartphones sin los costos de publicación en tiendas, permitiendo además el acceso administrativo en escritorio desde la misma URL.
3. **Alineación con el starter Next.js:** Permite aprovechar las capacidades de renderizado, optimización y ecosistema React sin fragmentar el equipo de desarrollo en tecnologías móviles nativas adicionales.



## Consecuencias y riesgos

Relacionen beneficios, costos, riesgos y mitigaciones con la decisión. Ejemplo de razonamiento: «Conservar datos en el dispositivo permite continuidad sin conexión, pero exige manejar conflictos al reconectar». Desarrollen su propio análisis.

### Beneficios (Positivos):
* **Continuidad operativa:** Los técnicos completan checklists y reportes de mantenimiento en áreas sin red.
* **Velocidad de iteración:** Las correcciones y nuevas funcionalidades se despliegan instantáneamente en el servidor.
* **Reducción de fricción de adopción:** Los usuarios no requieren credenciales de tiendas de aplicaciones ni descargas pesadas.

### Costos y Desafíos (Negativos):
* **Complejidad de sincronización:** Exige implementar colas de despacho local (*Outbox pattern*) y resolución de conflictos al recuperar conectividad (ej. si dos técnicos editan el estado del mismo equipo simultáneamente).
* **Gestión de almacenamiento local:** Es necesario limitar el peso de las fotografías de evidencia adjuntas para evitar sobrepasar los límites de almacenamiento del navegador.

### Mitigaciones:
* Implementar compresión de imágenes en el cliente antes de almacenarlas en IndexedDB.
* Diseñar marcas temporales (*timestamps*) e identificadores únicos locales (UUIDs) para cada reporte de inspección con el fin de resolver colisiones mediante la estrategia *Last-Write-Wins* o revisión manual de auditoría.

## Validación

Expliquen qué prueba o medición permitiría revisar sus supuestos en semanas posteriores. No afirmen haber validado sincronización, permisos u offline si aún no lo implementaron.

La validez de los supuestos arquitectónicos de este ADR se comprobará en las semanas posteriores mediante las siguientes pruebas planificadas:

1. **Prueba de ciclo de vida offline:** Simular desconexión de red en DevTools (modo *Offline*), completar un formulario de inspección con datos sintéticos y verificar que la información persista al recargar la página.
2. **Auditoría de PWA con Lighthouse:** Alcanzar una puntuación aceptable en las categorías de PWA, Best Practices y Performance en emulación móvil.
3. **Prueba de reanudación y sincronización:** Restablecer la conexión tras la captura local y comprobar que el Service Worker procese la cola de peticiones pendientes hacia el backend sin pérdida de datos.

## Actualización — Semana 2: configuración y alcance actual

Se mantiene **Next.js** y el App Router como base del proyecto. `src/app/manifest.ts` es la fuente única de configuración y genera `/manifest.webmanifest`. El archivo `public/manifest.webmanifest` se conserva únicamente como espejo estático exigido por el contrato de entrega; no se edita de forma independiente y debe coincidir con el manifest generado. Así se evita tratar ambos archivos como fuentes de verdad.

El shell de la interfaz se separó de `page.tsx` en `src/components/app-shell.tsx`. Esta separación concentra los landmarks de la página y la navegación principal sin alterar los datos sintéticos ni la pantalla principal.

Esta decisión no implica funcionalidades offline reales: todavía no se implementan service worker, almacenamiento o sincronización. Esas capacidades requieren trabajo posterior y validación específica, como se describe en las limitaciones de este ADR.
