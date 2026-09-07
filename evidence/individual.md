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

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
