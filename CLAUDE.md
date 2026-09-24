# CLAUDE.md

Instrucciones para Claude Code en este proyecto. Léelas completas antes de tocar nada.

## Qué es esto

App personal de rutina de gym para un solo usuario. Toda la especificación está en `BRIEF.md`, incluyendo la identidad visual en el Anexo A. `BRIEF.md` manda sobre cualquier suposición tuya. Para todo lo visual (color, tipografía, componentes, movimiento) manda `DISENO-FM.md`; léelo antes de tocar cualquier pantalla. Si algo no está en el brief, pregunta antes de inventarlo.

## Stack (no cambiar)

- Vite + React + TypeScript.
- CSS propio con variables de diseño en `src/styles/tokens.css`. Sin Tailwind, sin librerías de componentes.
- Datos en IndexedDB con `idb`. Preferencias en localStorage.
- PWA con `vite-plugin-pwa`, estrategia `autoUpdate`, `registerType: 'autoUpdate'`, y un aviso discreto de "actualizada" cuando el service worker cambie.
- Deploy en GitHub Pages con GitHub Actions. Configurar `base` en `vite.config.ts` con el nombre del repo (`/gym-app/`). El workflow se dispara en cada push a `main`.
- Pedir `navigator.storage.persist()` al arrancar para que iOS no borre los datos.
- Wake Lock API durante una sesión activa.
- Todo el texto de la interfaz en español mexicano casual, con el tono de la sección 3 del brief.

## Cómo trabajar

- Vamos por fases (ver sección Fases). No empieces una fase sin que el usuario haya visto la anterior corriendo en la vista previa.
- Al arrancar cada fase, di en 5 líneas qué vas a hacer. Al terminar, levanta `npm run dev`, muestra la vista previa y haz commit con mensaje claro en español.
- Escribe pruebas mínimas para la lógica pura (alternancia de sesiones, cálculo de horario, regla de progresión, regla de 4 semanas). Esa lógica va en `src/logic/` sin depender de React, para poder probarla.
- Prueba la app con datos ficticios de 4 semanas (`src/dev/seed.ts`, activable con un query param `?seed=1`) para verificar progreso y progresión.
- El usuario no es programador. Explica en lenguaje normal, sin jerga innecesaria. Si necesitas que él haga algo (crear cuenta en GitHub, abrir una URL en el iPhone), dale los pasos exactos.
- No agregues funciones, pantallas ni ejercicios que no estén en el brief. Sección 13 del brief es lista de prohibidos.
- No uses dependencias que no sean necesarias. Si vas a agregar una, di por qué.
- Cuando algo se rompa, arregla solo eso. No refactorices de paso.

## Fases

1. Proyecto base, tokens de diseño, modelo de datos, lógica de semana y horario, pantalla Hoy funcionando con la hora real del teléfono.
2. Pantalla Sesión: un ejercicio por pantalla, registro de series, alternativas, cronómetro de descanso, sugerencia de peso, versión corta, resumen final. Pantalla Rutina (consulta).
3. Progreso: semanas, ejercicios, peso corporal, fotos. Exportar e importar JSON. Ajustes.
4. Identidad visual aplicada a todo según el Anexo A: estados de temperatura, historial como tráfico nocturno, tipografía, movimiento. Ilustraciones SVG por ejercicio.
5. PWA instalable, workflow de GitHub Pages, verificación en iPhone real (instalación, offline, Wake Lock, que no se pierdan datos al cerrar).

## Estructura sugerida

```
src/
  logic/        semana.ts, horario.ts, progresion.ts (puro, con tests)
  data/         db.ts, ejercicios.ts (contenido de la sección 7 del brief), tipos.ts
  screens/      Hoy.tsx, Sesion.tsx, Progreso.tsx, Rutina.tsx, Ajustes.tsx
  components/   
  styles/       tokens.css, base.css
  assets/       ilustraciones SVG
  dev/          seed.ts
```

## Verificación antes de dar por cerrada una fase

- `npm run build` pasa sin errores ni warnings de TypeScript.
- Las pruebas de `src/logic/` pasan.
- La vista previa se ve bien en ancho 390 px (iPhone).
- Nada del texto suena a frase motivacional.
