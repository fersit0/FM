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

## Paso 3: resto de pantallas

- Barra de tres destinos: Hoy, Señal (antes Progreso) y Ejercicios (antes Rutina). Ajustes vive en una hoja que se abre desde el ícono arriba a la derecha de Hoy.
- Hoy: la letra de la sesión es la cifra héroe; el módulo lleva ámbar (`trabajo`) cuando alcanza la completa y azul en reposo cuando no. Si faltan más de 3 horas para la última pesa, el módulo muestra la hora tope en vez de una cifra de minutos absurda ("Antes de las 7, sin prisa").
- Lo que el brief exige y el spec no dibuja (X de 3 con los días, Lunes con Frida, domingo de rescate, regla de 4 semanas, "Salgo de la oficina a las") se quedó en Hoy como filas planas y botones secundarios, debajo del módulo, sin tarjetas. "Salgo a las" se despliega al tocar el texto.
- No hay logo "FM" ni espacio reservado (sección 15). El ícono provisional de la PWA es el cuadrado noche con la franja ámbar encendida.
- Señal: bandas por semana con luces (corta ámbar, completa naranja, bonus rojo, Frida olivo), debajo datos simples y la tendencia de peso por ejercicio en línea fina crema; las alternativas en crema-3. Peso corporal y fotos (que pide el brief) van al final de Señal, como filas planas.
- Ejercicios: filas planas con línea de 1 px; tocar abre la hoja con ilustración, técnica, errores y alternativas. Las reglas globales están en una hoja aparte ("Reglas").
- Se borró el sistema anterior completo: `src/styles`, fuentes empaquetadas (ahora fuente del sistema), tabs, tarjetas, tráfico con halo naranja, superficie de calor y el pez.
- Voz: sin mayúsculas sostenidas, sin puntos medios; separadores con coma.

## Resumen

Hecho: tokens FM, banco de componentes en `#diseno`, sesión guiada completa (calentamiento, ejercicio, descanso, cierre, resumen), Hoy, Señal, Ejercicios y Ajustes en hoja, hápticos y sonido con ajuste, ícono provisional. Capturas con Playwright para revisar cada pantalla (`scripts/capturas*.mjs`).

Pendiente:
- Probar en el iPhone real: si el truco del switch da háptico (iOS 18+), el dial con el dedo, el teclado numérico al tocar la cifra, `100dvh` y safe areas.
- Fotos duotono de los ejercicios cuando existan; hoy están las ilustraciones SVG.
- Incremento del dial por ejercicio (hoy 2.5 kg para todo).
- Fase 5 de CLAUDE.md: repo en GitHub, workflow de Pages y verificación de instalación y offline.

# Pase v2 (DISENO-FM-v2.md)

## Bloque A: funciones críticas

- Todos los temporizadores (descanso, calentamiento, cierre) guardan la hora de término en el estado persistido (`timerFin`, `descansoFin`) y la pantalla calcula lo que falta con `requestAnimationFrame` y al volver a la app (`useCuentaRegresiva`). Si se recarga a media cuenta, sigue exacto; si se vuelve tarde, dice "Terminó hace X".
- "Avísame" abre `shortcuts://run-shortcut?name=FM%20Descanso&input=text&text=<segundos>` y marca `avisado` para no duplicar el sonido. Falta probar en el iPhone si el nombre con espacio funciona; si no, cambiar `NOMBRE_ATAJO` en `src/lib/atajos.ts` a "FMDescanso".
- Al abrir la app con una sesión a medias aparece "Tienes una sesión a medias" con Seguir / Descartar (antes entraba directo).
- Las fotos base de free-exercise-db (licencia Unlicense, dominio público) se descargaron a `public/fotos/` reducidas a 900 px (31 fotos, 3 MB). Fuente: https://github.com/yuhonas/free-exercise-db

## Bloque B: sistema visual v2

- Tokens en `src/design/tokens.css`. El color de estado solo vive en el horizonte, la aguja, el segmento actual y el botón principal.
- Horizonte: capa fija de 55vh con `--intensidad` por estado y grano en `overlay` al 4%, solo sobre el horizonte.
- Todo lo de la v1 que el spec señala se borró: módulo encendido, degradado radial, stepper en cápsula, escala de marcas, monoespaciada, ilustraciones SVG y su motor de poses.
- `#diseno` sigue existiendo con los componentes nuevos, solo para desarrollo y capturas.

## Bloque C: pantallas

- Hoy: "Cuerpo completo A/B" como título grande (el brief no pone nombre a las sesiones más allá de la letra). Duración estimada: completa "unos 65 min", corta 45, bonus 75.
- Lo que el brief pide y el spec saca del Home quedó así: Frida se marca tocando el punto del lunes; la regla de 4 semanas es una línea arriba del botón que abre una hoja Aceptar / Después; "Salgo de la oficina a las" vive en ajustes y, si tiene hora, el subtexto de Hoy dice "Sales a las 7:10. Alcanza completa." Domingo de rescate y bonus son una línea de subtexto.
- Sesión: "Cambiar" a una alternativa se hace desde la ficha de técnica (sección "Cambiar por"), así la fila de secundarios queda en Anterior, Técnica y Saltar. Descartar sesión está en la hoja del ✕.
- Descanso: al llegar a cero el botón pasa a "Siguiente serie" y el horizonte a la temperatura de la serie que sigue. Si el ejercicio ya se completó, "Siguiente ejercicio".
- Historial: peso corporal y fotos (que pide el brief) van en un grupo "Cuerpo" con dos filas que abren hojas; así la lista de semanas queda limpia.
- Ajustes: además de lo que lista el spec, se conservan horas tope, minutos de carretera y casa-club, día de pesaje y el interruptor de 4 series porque el brief los exige. La versión se muestra desde `vite.config.ts` (mismo número que package.json).

## Bloque D: fotos y técnica

- Fotos base: 31 imágenes de yuhonas/free-exercise-db (Unlicense, dominio público), reducidas a 900 px y JPEG 72 en `public/fotos/`. Mapa clave → archivo en `src/data/fotos.ts`. Alternativas sin foto exacta reutilizan la más parecida (militar de pie y neutro usan la de press sentado; rodillas dobladas y piso usan la de piernas en banco).
- Foto propia: "Tomar foto" en la ficha abre la cámara, se comprime a 1200 px JPEG 0.8 y se guarda en IndexedDB (store `fotosEjercicio`, versión 2 de la base). Sustituye a la base para ese ejercicio; "Quitar foto" regresa a la base. Las fotos propias no entran al respaldo JSON todavía.
- Tratamiento: `saturate(0.65)` y viñeta radial, radio 16. En la sesión la foto va 16:9 para caber sin scroll en 844 px; en la ficha, 4:3.
- Fichas de técnica de los 13 ejercicios en `src/data/fichas.ts` (qué trabaja, qué sentir, preparación, ejecución, errores con corrección, cómo escoger el peso, alternativa). Los pesos iniciales sugeridos son orientativos para alguien de 23 años que empieza; la regla de ajuste es la del brief. Las alternativas muestran la ficha corta del brief.
- Incremento del dial: 2.5 kg en todo menos elevaciones laterales (1 kg).

## Resumen del pase v2

Hecho: timers por hora de término que sobreviven recargas, Avísame con Atajos, sesión a medias con Seguir / Descartar, horizonte como única expresión de color, cifras 104/300, dial sin caja, stepper suelto, listas agrupadas, Hoy con una sola decisión, sesión completa, historial por semanas con puntos, ejercicios con ficha y foto propia, ajustes con instrucciones de Atajos.

Pendiente:
- Probar en el iPhone: atajo "FM Descanso" (si no abre, cambiar a "FMDescanso"), háptico del switch, cámara desde la ficha, safe areas.
- Fotos propias de las máquinas del club; incluirlas en el respaldo JSON.
- Fase 5 de CLAUDE.md: repo en GitHub y GitHub Pages.
