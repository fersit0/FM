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

# Pase v3 (fm-assets/DISENO-FM-v3.md)

Reemplaza a v1 y v2. Los mockups de `fm-assets/referencia/` son el objetivo; se borraron horizonte, degradados, tokens anteriores, `#diseno` y las ilustraciones.

## Bloques A y B
- Sesión a medias: ya no hay pantalla intermedia; Inicio muestra "Seguir sesión" y debajo "Descartar".
- Un solo estado en `body[data-pantalla]` (inicio, tinta, calentamiento, serie, descanso, resumen) que fija fondo, texto, círculo y botón según la tabla de la sección 2, y actualiza `theme-color`.
- Los colores derivados (texto al 60%, 40%, 25%, separador al 12%) se declaran en `body` y en `.hoja` para que se calculen con el texto de cada pantalla.
- Dial: 21 px por marca de 2.5 kg, así la regla de 0.86 W muestra justo 40 kg. Los números van cada 10 kg.

## Bloque C
- Círculo de Serie: 0.48 W, 0.66 W, 0.84 W con 3 series; con 4 series (regla de 4 semanas) el tamaño se interpola igual. Con más de 2 dígitos en el peso la cifra se reduce (90%, 80%, 68%) para que "kg" quede siempre dentro.
- Descanso: el círculo se encoge de 0.96 W a 0.56 W calculado en cada frame desde la hora de término; la cifra no cambia de tamaño y la recorta el círculo. No hizo falta detener el encogimiento en 0.70 W: "0:00" cabe en 0.56 W a 390 de ancho.
- Ajustes se abre desde un texto "Ajustes" arriba a la derecha de Inicio (la barra solo lleva tres textos, como pide el spec).
- La lista de ejercicios de Inicio se abre tocando el subtítulo "6 ejercicios, unos 65 min".
- "Cambiar" a una alternativa sigue dentro de la ficha de técnica ("Cambiar por"). La hoja del ✕ trae además la versión de la sesión (completa, corta, bonus, ligera) porque el brief la exige.
- Cierre (cardio final del brief) usa la misma pantalla que Calentamiento, en piedra.
- Ejercicios sin peso (plancha, elevación de piernas, lagartijas): el círculo muestra los segundos o las reps y no hay dial.

## Bloques D y E
- Técnica: foto a sangre 4:3 en blanco y negro con contraste 1.1; desde Ejercicios lleva arriba la gráfica de línea de 3 pt con el último punto rojo. Pez `concentrado` junto a "Qué debes sentir".
- Historial: peso corporal y fotos (brief) siguen en dos filas al final que abren hojas. Vacío con pez `dormido`.
- Pez `picaro` aparece junto al subtítulo de Inicio cuando la sesión se recorta por falta de tiempo. Pez `confundido` queda pendiente: hoy el error de guardado es solo una línea de texto.
- Ícono: `fm-assets/icono/` copiado a `public/` y referido en manifest y head; `theme_color` y `background_color` en `#121318`.
- Versión 0.3.0.

Pendiente: probar en el iPhone el atajo "FM Descanso", el háptico del switch, la cámara desde la ficha y cómo se ve el recorte del número en el descanso; incluir fotos propias en el respaldo; fase 5 (GitHub Pages).

# Publicar, completar y blindar

## Publicar
- `.github/workflows/deploy.yml` publica en GitHub Pages en cada push a `main` (corre pruebas, build y despliega `dist/`). No hay `gh` ni sesión de GitHub en esta Mac: el repo lo crea el usuario y el primer push va con las instrucciones del mensaje final. URL esperada: `https://<usuario>.github.io/gym-app/`.
- Actualización: `registerType: 'prompt'`. Cuando hay service worker nuevo, Inicio muestra "Hay versión nueva. Toca para actualizar." y al tocar se activa y recarga. Los datos viven en IndexedDB y localStorage, así que no se pierden. Sustituye al aviso automático "actualizada" de CLAUDE.md por pedido explícito del usuario.
- Offline: el service worker precachea todo (js, css, html, png, jpg de fotos, pez e íconos) y responde `index.html` a cualquier ruta.

## Semana y progresión
- Los lunes Inicio muestra "¿Fuiste con Frida?" con "Sí, fui"; desaparece al marcarlo. El punto del lunes sigue siendo tocable.
- Historial tiene "Fui este día": fecha (hasta hoy) y qué hiciste (A, B o Frida); crea una sesión terminada sin series a las 7:30 pm de ese día.
- Progresión: nueva sugerencia `quedarse` cuando la última vez alguna serie no llegó al mínimo del rango ("Quédate en X o baja"). Subir y bajar siguen las reglas del brief.

## Alternativas
- Menú ✕ → "Cambiar por alternativa": lista original y alternativas con foto chica, caso y último peso. Tocar el nombre la usa en esta sesión (registro propio); "Usar siempre esta" la deja en la rutina (`settings.reemplazos`). Un cambio en la sesión siempre gana sobre el reemplazo permanente.
- En Ejercicios, las alternativas de la ficha abren su propia ficha (contenido del brief, foto y gráfica).
- El brief da 2 a 4 alternativas por ejercicio; no se inventaron más (sección 13 del brief).

## Fotos, revisadas una por una (fm-assets no trae fotos; base: free-exercise-db, Unlicense)

| Ejercicio o alternativa | Archivo | Coincide |
|---|---|---|
| A1 Press de banca plano con mancuernas | Dumbbell_Bench_Press | Sí |
| A1 Press en el piso | Dumbbell_Floor_Press | Sí |
| A1 Máquina de press de pecho / B1 máquina inclinado | Leverage_Chest_Press / Leverage_Incline_Chest_Press | Sí |
| A1, B1 Lagartijas con pies en banco | Push-Ups_With_Feet_Elevated | Sí |
| A2 Jalón al pecho | Wide-Grip_Lat_Pulldown | Sí |
| A2, B2 Remo con mancuerna a una mano | One-Arm_Dumbbell_Row | Sí |
| A2 Dominadas asistidas (ambas) | Band_Assisted_Pull-Up | Sí (asistencia con liga, no máquina) |
| A3 Sentadilla goblet / B3 goblet | Goblet_Squat | Sí (con pesa rusa) |
| A3, B3 Prensa (y recorrido corto) | Leg_Press | Sí |
| A3, B3 Sentadilla con dos mancuernas | Dumbbell_Squat | Sí |
| A3, B3 Sentadilla a un banco | Bodyweight_Squat | Sí (sin banco en la foto) |
| A4 Press militar sentado / agarre neutro | Dumbbell_Shoulder_Press | Sí |
| A4 Press militar de pie | Dumbbell_Shoulder_Press | No (sentado): sin foto |
| A4 Máquina de press de hombro | Machine_Shoulder_Military_Press | Sí |
| A5 Curl con barra Z | EZ-Bar_Curl | Sí |
| A5, B5 Curl alternado | Dumbbell_Alternate_Bicep_Curl | Sí |
| A5 Curl en polea baja | Standing_Biceps_Cable_Curl | Sí |
| A6 Extensión de tríceps en polea | Triceps_Pushdown | Sí |
| A6 Extensión sobre la cabeza | Seated_Triceps_Press | Sí |
| A6 Fondos en banco | Bench_Dips | Sí |
| A7 Plancha y plancha con rodillas | Plank | No (la foto es una postura de rodillas): sin foto |
| A7, B6 Dead bug | Dead_Bug | Sí |
| B1 Press inclinado | Incline_Dumbbell_Press | Sí |
| B2 Remo sentado en polea (y con pausa) | Seated_Cable_Rows | Sí |
| B2 Remo con pecho apoyado | Leverage_Iso_Row | Sí |
| B4 Elevaciones laterales | Side_Lateral_Raise | Sí |
| B4 Laterales sentado | Seated_Side_Lateral_Raise | Sí |
| B4 Laterales en polea | Cable_Seated_Lateral_Raise | No (sentado y no se ve el gesto): sin foto |
| B5 Curl martillo | Hammer_Curls | Sí |
| B5 Curl con cuerda | Cable_Hammer_Curls_-_Rope_Attachment | Sí |
| B6 Elevación de piernas en banco | Flat_Bench_Lying_Leg_Raise | Sí |
| B6 En el piso / rodillas dobladas | Flat_Bench_Lying_Leg_Raise | No (en banco): sin foto |

- La foto propia siempre gana y ahora viaja en el respaldo JSON (`fotosEjercicio`).

## Nunca trabarse
- ✕ siempre visible en sesión (por encima del panel). "Terminar sesión" guarda aunque haya 0 series.
- `ErrorBoundary` en la raíz: "Algo falló. Tu sesión está guardada." con "Volver al inicio"; los errores se guardan en `localStorage['gym-app:errores']` (últimos 20).
- Al cargar, los registros dañados o de versiones viejas se filtran sin borrar el resto; los ajustes se completan con los valores por defecto.
- Pruebas de punta a punta en `e2e/flujos.spec.mjs` (`npm run e2e`, contra el servidor de desarrollo): sesión completa, saltar todo, alternativa y "usar siempre", recargar a medio descanso, retomar sesión a medias, terminar con 0 series, lunes con Frida, registrar un día pasado, exportar e importar, actualizar versión. Las 10 pasan.

# Uso real en el iPhone: layout, unidades, fotos, deshacer

## Layout
- Serie, Descanso, Calentamiento y Resumen son columnas flexibles de 100dvh con safe areas: arriba encabezado y avisos, en medio el círculo (diámetro del spec acotado al espacio disponible, medido con ResizeObserver), abajo dial, stepper y botón. Nada se posiciona con coordenadas fijas; Inicio conserva su círculo cortado arriba a la derecha.
- Título del ejercicio: baja de 34 a 26 pt de uno en uno hasta caber en dos líneas.
- Textos secundarios sobre rojo al 80% (`--texto-2-pct`).
- `e2e/layout.spec.mjs` abre calentamiento, serie 1, descanso, serie 2, serie completa y resumen en 375×667, 390×844, 393×852 y 430×932 con el nombre más largo (A1) y aviso activo, y comprueba que ninguna caja se cruza, nada sale de la pantalla, nada se corta y la pantalla no hace scroll.

## Kilos y libras
- Unidad principal por ejercicio: poleas, máquinas, prensa, jalón y dominadas en lb; mancuernas, barras y peso corporal en kg. Se cambia tocando la unidad dentro del círculo y se guarda en `settings.unidades`.
- El círculo muestra la cifra en la unidad principal y debajo, al 70%, la equivalencia. Incrementos: lb 5, kg 2.5, laterales 1.
- Cada serie guarda `peso` y `unidad` exactos además de `pesoKg` (solo para comparar). Historial, listas y gráficas muestran la unidad principal de cada ejercicio.

## Peso inicial y dial
- Sin registro previo, el peso arranca en un valor razonable por ejercicio (`src/logic/unidades.ts`, tabla `INICIAL_KG`) redondeado a la rejilla del dial, con "Primera vez: empieza con este y ajusta."
- La regla lleva una marca de relleno extra a cada lado para que el 0 y el último número nunca se corten.

## Fotos y técnica
- Cada foto base ahora tiene inicio y final (archivos `X.jpg` y `X-2.jpg`); alternan cada segundo con fundido; tocar pausa y etiqueta "Inicio" / "Final". Las segundas imágenes se revisaron una por una: todas coinciden con su ejercicio. `Plank-2` sí es una plancha, así que plancha usa esa sola imagen. Sin foto siguen press militar de pie, laterales en polea y las elevaciones en piso o con rodillas.
- Fotos propias: "Tomar foto de mi máquina (inicio)" y "Tomar foto de final"; se animan igual y viajan en el respaldo.
- "Ver videos" abre YouTube con "<ejercicio> técnica". La foto animada chica va junto al título en Serie y abre la técnica.

## Deshacer
- "Serie guardada. Deshacer" (5 s) borra la serie y regresa con los mismos valores; "Descanso saltado" y "Ejercicio saltado" también se deshacen 5 s.
- Menú ✕ → "Series de hoy": editar peso y reps o borrar. Historial: cada serie de una sesión se edita o borra, y "Borrar sesión".
- "Terminar sesión" y "Descartar sesión" piden confirmación. Pruebas en `e2e/deshacer.spec.mjs`.
