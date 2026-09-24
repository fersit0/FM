# Notas del pase de diseño (DISENO-FM.md)

Decisiones tomadas sin preguntar, con la opción más simple y limpia.

## Paso 1: tokens y banco de componentes

- Los tokens viven en `src/design/tokens.css`; los componentes en `src/components/fm/` con prefijo de clase `fm-` para no chocar con el CSS anterior mientras se reemplaza.
- El banco de componentes se abre con `#diseno` al final de la URL (la app no usa router; un hash evita rutas nuevas en el service worker). Se puede fijar la temperatura con `?temp=fuerte#diseno`.
- `descanso` = teal mezclado al 70% con capa-2; `listo` = ámbar mezclado al 72% con capa-1. Ambos con texto negro cálido y contraste de sobra.
- En `reposo` el botón principal queda crema con texto negro cálido (la única superficie encendida fuera del módulo).
- El dial se apaga hacia los bordes con un degradado del propio color del módulo: comunica foco, no es decoración.
- Capturas: `node scripts/capturas.mjs '#diseno' diseno` con Playwright (dependencia de desarrollo, solo para las capturas que pide la sección 0). Se guardan en `capturas/` (ignorada por git).
- Hápticos en `src/lib/haptics.ts`: `navigator.vibrate` si existe, si no el truco del `<input type="checkbox" switch>`. Falta verificarlo en el iPhone real.
