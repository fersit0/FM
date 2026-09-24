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

## Paso 2: sesión

- Ilustraciones: no hay fotos de los ejercicios, así que las ilustraciones SVG que ya existían se quedan en duotono (sombras noche, luces crema), radio 20, 4:3, y tocarlas abre la técnica. Cuando haya fotos del club se cambian por el mismo marco.
- La escala de sintonía solo cuenta series de ejercicios; calentamiento y cierre son pasos con temporizador en olivo (`calentamiento`) y no llevan marca.
- El ✕ abre una hoja con "Seguir después", "Terminar sesión" y la versión (completa, corta, bonus, ligera). Así no hay menú de tres puntos ni botones extra en la pantalla.
- El botón "Técnica" se quitó de la fila: la ilustración ya la abre. Quedan Anterior, Cambiar y Saltar como secundarios.
- Durante el descanso el botón principal dice "Siguiente serie" pero se activa al llegar a cero; antes está "Saltar" en el módulo.
- El dial tiene incrementos de 2.5 kg fijos (el brief no define incrementos por ejercicio). Un peso guardado fuera de la rejilla (14 kg) se respeta hasta que se toca el dial.
- Temperatura por serie: la primera es `trabajo`, las intermedias `fuerte`, la última `ultima`; con 2 series va directo de ámbar a rojo.
- Se quitó el pez con tenis del resumen (sección 13: sin personajes en este pase).
