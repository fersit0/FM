# FM v3: diseño final

Este documento reemplaza a `DISENO-FM.md` y `DISENO-FM-v2.md`. La dirección visual ya está aprobada y existe en imágenes: la carpeta `referencia/` tiene los mockups que hay que igualar. Cuando el texto y la imagen no coincidan en algo visual, gana la imagen. Donde el código actual choque con esto, borra sin miedo: el horizonte, el módulo encendido, los degradados, las ilustraciones SVG y la paleta anterior se van.

## 0. Cómo trabajar

Haz todo de corrido, sin preguntarme. Commit al terminar cada bloque. Decisiones ambiguas: lo más simple, más plano y más fiel a los mockups; anótalo en `NOTAS-DISENO.md`.

- **A. Funciones críticas** (sección 9). Primero que funcione.
- **B. Sistema visual** (secciones 1 a 5): tokens, tipografía, círculo, controles.
- **C. Las cuatro pantallas con mockup** (sección 6): Inicio, Serie, Descanso, Resumen. Deben quedar prácticamente idénticas a `referencia/`.
- **D. Pantallas sin mockup** (sección 7): Calentamiento, Técnica, Historial, Ejercicios, Ajustes. Mismo lenguaje, extrapolado con disciplina.
- **E. El pez y el ícono** (sección 8).

Al final de C y de D: capturas a 390×844, ponlas junto a los mockups de `referencia/` y corrige hasta que se vean de la misma familia. Luego el checklist de la sección 11.

## 1. La idea

Industrial gráfico: un aparato tipo Braun compuesto como póster suizo. Color plano a pantalla completa, un círculo enorme como elemento firma, tipografía grotesca gigante, y un pez naïf que aparece poco.

Cada estado es una pantalla completa de un solo color. Pasar de serie a descanso se siente como cambiar de estación.

## 2. Color

Solo estos cuatro. Cero degradados, cero sombras, cero transparencias decorativas.

```css
:root {
  --rojo:   #FF3D00;  /* Rojo FM: rojizo e intenso */
  --tinta:  #121318;  /* negro con toque azul */
  --piedra: #E9E3D7;  /* claro cálido */
  --cobalto:#1E47E0;  /* contraste frío */
}
```

| Pantalla | Fondo | Texto y formas | Círculo | Botón principal |
|---|---|---|---|---|
| Inicio | tinta | piedra | rojo | rojo, texto tinta |
| Calentamiento | piedra | tinta | rojo | tinta, texto piedra |
| Serie | rojo | tinta | tinta, cifra en piedra | tinta, texto piedra |
| Descanso | cobalto | piedra | piedra, cifra en cobalto | contorno piedra |
| Resumen | tinta | piedra | rojo | rojo, texto tinta |
| Historial, Ejercicios, Ajustes, Técnica | tinta | piedra | rojo si aparece | rojo, texto tinta |

Texto secundario: el mismo color del texto al 60% de opacidad. Separadores: 1 px del color del texto al 12%. Nunca blanco puro ni negro puro. La barra de estado de iOS se adapta: clara sobre tinta y cobalto, oscura sobre rojo y piedra (`theme-color` y `apple-mobile-web-app-status-bar-style` se actualizan por pantalla).

## 3. Tipografía

La fuente del sistema de iPhone (SF Pro) en pesos altos y tracking apretado se ve prácticamente igual a los mockups. Úsala; no cargues fuentes externas.

```css
--sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
```

Medidas en puntos a 390 de ancho (los mockups están a 3x):

| Uso | Tamaño / línea | Peso | Tracking |
|---|---|---|---|
| Título de Inicio ("Cuerpo completo A") | 56 / 0.95 | 700 | -0.045em |
| "Listo." | 88 / 0.9 | 800 | -0.05em |
| "Descanso" | 56 / 1 | 700 | -0.045em |
| Nombre del ejercicio | 34 / 1.05 | 700 | -0.035em |
| Subtítulo ("Serie 2 de 3", "Hoy toca") | 24 / 1.2 | 400 | -0.02em |
| Cifra en círculo de Serie | escala con el círculo (ver 4) | 700 | -0.05em |
| Timer de Descanso | escala con el círculo | 500 | -0.04em |
| Cifras del Resumen | 56 / 1 | 700 | -0.04em |
| Reps del stepper | 56 / 1 | 700 | -0.04em |
| Etiquetas de unidades ("reps", "min") | 20 / 1 | 500 | -0.01em |
| Botón principal | 20 / 1 | 700 | -0.02em |
| Cuerpo (listas, técnica) | 17 / 1.35 | 400 | -0.01em |
| Nota | 15 / 1.3 | 400 | 0 |

Siempre `font-variant-numeric: tabular-nums` en cifras. Cero monoespaciada. Cero mayúsculas sostenidas. Margen lateral de 24 pt en todas las pantallas.

## 4. El círculo

Es el elemento firma. Siempre plano, siempre perfecto, siempre uno solo por pantalla. Diámetros en proporción al ancho de pantalla (W):

- **Inicio:** diámetro 0.62 W, centro en (0.83 W, 0.11 H). Queda cortado por la derecha y arriba, como en `pantallas-inicio.png`.
- **Serie:** centrado horizontalmente, su centro a 0.40 H. Diámetro según series hechas del ejercicio: `d = 0.48 W + (0.36 W × serieActual−1 / (totalSeries−1))`. Con 3 series: 0.48 W, 0.66 W, 0.84 W (ver `vista-series.png`). Si el ejercicio tiene una sola serie, 0.66 W. La cifra del peso mide el 42% del diámetro de alto y "kg" va pegado a su línea base, siempre dentro del círculo.
- **Descanso:** centrado, centro a 0.45 H. Arranca en 0.96 W y se encoge linealmente hasta 0.56 W cuando el tiempo llega a cero, como sol que se mete. La cifra del timer mide el 26% del diámetro inicial y no cambia de tamaño; si el círculo se hace más chico que la cifra, la cifra sigue siendo cobalto y queda recortada por el círculo con `clip-path`: el efecto es que el sol se come el número. Pruébalo; si no se lee bien, deja de encogerlo en 0.70 W.
- **Resumen:** centrado, diámetro 0.91 W, completo.
- **Calentamiento:** centrado, diámetro 0.80 W, rojo sobre piedra, con el timer en tinta dentro.

Animación del tamaño: 500 ms, `cubic-bezier(0.32, 0.72, 0, 1)`, sin rebote. En Descanso el encogimiento es continuo, calculado en cada frame desde la hora de término (sección 9.1).

## 5. Controles

**Dial de peso.** Como en `pantallas-serie-2.png`: regla horizontal de 0.86 W de ancho, marcas tinta de 4 pt de grosor con extremos redondeados; mayores cada 10 kg de 44 pt de alto con número de 24 pt debajo, menores cada 2.5 kg de 20 pt. Aguja fija al centro: línea de 6 pt de grosor, 50 pt de alto, con una bolita de 18 pt en la base. La regla se desliza con el dedo (scroll horizontal con `scroll-snap` por marca) mostrando siempre una ventana de 40 kg; el peso seleccionado es el que queda bajo la aguja y se refleja al instante en la cifra del círculo. Tick háptico por marca. Tocar la cifra del círculo abre teclado decimal. Incremento configurable por ejercicio (2.5 por defecto, 1 para mancuernas si el ejercicio lo indica).

**Stepper de reps.** Dos círculos tinta de 64 pt con − y + en piedra (trazo de 4 pt), la cifra al centro y "reps" debajo. Mantener presionado repite.

**Botón principal.** Ancho 0.88 W (centrado), alto 64 pt, cápsula completa, colores según la tabla de la sección 2. Presionado: escala 0.97 en 100 ms.

**Botones secundarios.** Cápsula de contorno de 2 pt del color del texto, alto 64 pt, como "+15 s" y "Saltar" en Descanso. O solo texto de 17 pt al 60% si es una acción menor.

**Barra de navegación.** Solo en Inicio, Historial y Ejercicios. Tres textos, sin íconos: "Hoy", "Historial", "Ejercicios", 15 pt, 600, activo en piedra, inactivos al 40%, sobre tinta, alineados a la izquierda con 24 pt de separación, pegada abajo respetando el safe area. Se oculta en sesión.

## 6. Pantallas con mockup

### 6.1 Inicio (`pantallas-inicio.png`)
Igual al mockup: círculo rojo cortado arriba a la derecha, bloque de texto abajo a la izquierda ("Hoy toca" / nombre de la rutina / "7 ejercicios, unos 50 min"), botón "Empezar". Lo que el mockup no muestra se integra sin romper la composición:

- **Semana:** siete puntos de 8 pt en fila arriba a la izquierda, bajo la barra de estado. Hecho: piedra. Pendiente: piedra al 25%. Hoy: anillo piedra. El lunes con Frida cuenta como hecho.
- **Lista de ejercicios:** al tocar "7 ejercicios, unos 50 min" se abre una hoja tinta con la lista numerada y el último peso de cada uno.
- **Tiempo disponible:** si ya se sabe la hora de salida, el subtítulo dice "Sales a las 7:10. Alcanza completa." o "No alcanza completa, te dejo lo esencial."
- **Aviso de 4 semanas:** una línea de 17 pt en rojo sobre el botón ("Ya toca pasar a 4 series."); al tocarla, hoja con Aceptar / Después.
- **Sesión a medias:** si existe, el botón dice "Seguir sesión" y debajo un texto chico "Descartar".

### 6.2 Serie (`pantallas-serie-1/2/3.png`)
Igual al mockup: nombre del ejercicio, "Serie 2 de 3", círculo con peso, dial, stepper, botón "Serie hecha". Arriba a la derecha, a la altura de la barra de estado más 8 pt, "3 de 7" en 15 pt al 60%, y a la izquierda un ✕ de 24 pt. El ✕ abre una hoja con: Ver técnica, Ejercicio anterior, Saltar ejercicio, Terminar sesión, Descartar sesión.

- A la derecha del subtítulo "Serie 2 de 3", un texto "Técnica" 17 pt subrayado al 60% que abre la ficha (7.2).
- Si toca subir de peso, una línea 17 pt bajo el subtítulo: "La vez pasada hiciste 12 en todas. Sube a 20." y el dial ya arranca en 20.
- Si hay serie de aproximación: "Antes, una de aproximación con 8 kg, 10 reps. No se registra."
- Sin foto en esta pantalla. El círculo es el protagonista. Sin pez.
- Todo cabe sin scroll en 390×844; si no cabe, reduce el círculo máximo, nunca el dial ni el botón.

### 6.3 Descanso (`pantallas-descanso.png`)
Igual al mockup: "Descanso", círculo piedra con el timer en cobalto, "Sigue: serie 3, 18 kg", botones "+15 s" y "Saltar".

- Debajo de "Sigue:", un texto 17 pt al 60%: "Avísame aunque me salga" que dispara el atajo (9.2).
- El pez `tirado-descansando` de 88 pt aparece sentado sobre el borde inferior izquierdo del círculo.
- Al llegar a cero: el círculo ya llegó a su mínimo, la cifra cambia a "Va", háptico, sonido, y los dos botones se sustituyen por un botón principal piedra con texto cobalto "Siguiente serie".
- Si regreso tarde a la app: "Terminó hace 40 s." en lugar de la cifra.

### 6.4 Resumen (`pantallas-resumen.png`)
Igual al mockup: "Listo.", frase, círculo rojo, tres cifras, botón "Cerrar". El pez `orgulloso` de 96 pt parado sobre el borde superior derecho del círculo. Si hubo subidas de peso, en lugar de la frase fija: "Subiste en jalón al pecho, +2.5 kg." Si no, "A hecha. Mañana te vas a acordar."

## 7. Pantallas sin mockup

Todas en tinta con texto piedra, margen de 24 pt, títulos grandes a la izquierda en el estilo de "Listo." (56 pt, 700), listas planas con separadores de 1 px, sin tarjetas.

### 7.1 Calentamiento
Fondo piedra. "Calentamiento" arriba en tinta 56 pt. Subtítulo con la indicación ("Elíptica 7 min, ritmo en el que puedes platicar."). Círculo rojo centrado de 0.80 W con el timer en tinta dentro. Nota 15 pt con la alternativa si la máquina está ocupada. Botón tinta "Empezar calentamiento", luego "Ya terminé".

### 7.2 Técnica (hoja a pantalla completa)
Fondo tinta. Foto arriba a ancho completo, radio 0, proporción 4:3, en blanco y negro con contraste subido un 10% (`filter: grayscale(1) contrast(1.1)`), así fotos de distintas fuentes se ven de una familia. Debajo, nombre del ejercicio 34 pt y las secciones con título 20 pt 700 y texto 17 pt:
Qué trabaja, Qué debes sentir, Preparación, Ejecución, Errores comunes, Cómo escoger el peso, Alternativa (contenido en 9.6).
Botón "Tomar foto de mi máquina" al final. El pez `concentrado` de 72 pt junto al título "Qué debes sentir".

### 7.3 Historial
Título "Historial". Arriba, una cifra de 88 pt con las sesiones del mes y "sesiones en septiembre" debajo. Luego la lista de semanas: fechas a la izquierda, siete puntos a la derecha como en Inicio. Tocar una semana muestra sus sesiones; tocar una sesión, cada ejercicio con peso y reps por serie. Vacío: pez `dormido` de 120 pt y "Todavía no hay señal. La primera sesión la enciende."

### 7.4 Ejercicios
Título "Ejercicios". Lista agrupada por rutina (A1, A2, B1, B2) con subtítulos 15 pt al 60%. Cada fila: nombre 17 pt y último peso a la derecha, nunca partido en dos líneas. Tocar abre Técnica con, arriba de la foto, una gráfica de línea de 3 pt en piedra del peso usado en el tiempo, último punto como círculo rojo de 12 pt.

### 7.5 Ajustes (hoja)
Hora de salida de la oficina, sonido, hápticos, "Aviso de descanso" con instrucciones del atajo, exportar respaldo, importar respaldo, versión. Pez `saludando` de 72 pt al final junto a la versión.

## 8. El pez y el ícono

### 8.1 Archivos
`pez/` trae nueve PNG transparentes de 512×512, ya recortados y centrados: `concentrado`, `esforzandose`, `cansado`, `tirado-descansando`, `picaro`, `orgulloso`, `confundido`, `dormido`, `saludando`. Cópialos a `public/pez/`. Son rojo `#FF3D00` exacto.

### 8.2 Reglas
- Máximo un pez por pantalla, entre 72 y 120 pt.
- Nunca sobre fondo rojo (desaparece) y nunca en la pantalla de Serie.
- Usos fijos: Descanso `tirado-descansando`, Resumen `orgulloso`, Historial vacío `dormido`, Técnica `concentrado`, Ajustes `saludando`, errores (no se guardó, sin conexión al importar) `confundido`, sesión recortada por falta de tiempo `picaro` junto al subtítulo de Inicio.
- Al aparecer, entra con un fundido y un desplazamiento de 8 pt hacia arriba en 300 ms. Nada más. No baila, no rebota.

### 8.3 Ícono
`icono/` trae `icon-1024`, `icon-512`, `icon-192`, `apple-touch-icon` (180) y `favicon-32`. Úsalos en el manifest y en el `<head>`. `theme_color` y `background_color` del manifest: `#121318`.

## 9. Funciones críticas

### 9.1 Timer que nunca falla
Ningún timer suma segundos con `setInterval`. Al iniciar un descanso se guarda `finDescanso = Date.now() + segundos * 1000` en el estado persistido. Lo que falta se calcula como `finDescanso - Date.now()` en cada `requestAnimationFrame` y en `visibilitychange`. Si me salgo a otra app, bloqueo el cel o la app se recarga, al volver el timer está exacto. Igual para el calentamiento y la duración total de la sesión.

### 9.2 Aviso con Atajos
"Avísame aunque me salga" abre `shortcuts://run-shortcut?name=FM%20Descanso&input=text&text=<segundos restantes>`. En Ajustes, "Aviso de descanso" explica: abrir Atajos, crear un atajo llamado exactamente "FM Descanso" con la acción "Iniciar temporizador" usando la entrada del atajo como segundos. Guarda que se usó para no duplicar el sonido de la app. Si el nombre con espacio falla, usa "FMDescanso" y actualiza las instrucciones.

### 9.3 Guardado
Cada serie se guarda en IndexedDB al tocar "Serie hecha". La sesión en curso se guarda completa en cada cambio y sobrevive a cerrar la app. `navigator.storage.persist()` al iniciar. El peso de cada ejercicio precarga el último usado. Exportar e importar respaldo JSON en Ajustes.

### 9.4 Pantalla encendida
En sesión, `navigator.wakeLock.request('screen')`, y se vuelve a pedir al regresar a la app. Si no existe, no pasa nada.

### 9.5 Hápticos y sonido
Mantén `src/lib/haptics.ts`. Eventos: tick del dial, serie hecha, fin de descanso (si la app está abierta), fin de sesión. Sonido de fin de descanso con Web Audio: dos notas cortas y cálidas, solo con la app visible.

### 9.6 Fotos y contenido de técnica
Elimina todas las ilustraciones SVG de personas.
- **Foto propia:** "Tomar foto de mi máquina" usa `<input type="file" accept="image/*" capture="environment">`, comprime a 1200 px en JPEG 0.8 y guarda en IndexedDB. Tiene prioridad sobre cualquier otra.
- **Foto base:** usa imágenes del repo `yuhonas/free-exercise-db`. Verifica la licencia; si permite uso libre, descarga al repo solo las de mis ejercicios y anota la fuente. Si falta alguno, sin foto y con el botón visible.
- **Contenido:** para cada ejercicio de mis rutinas, en español mexicano directo y frases cortas: qué trabaja; qué debes sentir y qué señal indica que otra parte trabaja de más; preparación; ejecución en 3 a 5 pasos con respiración y tempo; 2 a 4 errores comunes con su corrección; cómo escoger el peso (con cuánto empezar la primera vez y la regla: si terminas la última serie con más de 2 reps de sobra, sube; si no llegas al mínimo del rango, baja); alternativa si la máquina está ocupada.

## 10. Movimiento

Una sola curva: `cubic-bezier(0.32, 0.72, 0, 1)`.
- Cambio de pantalla entre estados (serie a descanso, descanso a serie): el color de fondo cambia con un fundido de 350 ms y el círculo anima su tamaño y posición en 500 ms. Es el momento más satisfactorio de la app; que se sienta como cambiar de estación.
- Cambio de ejercicio: el contenido sale a la izquierda y entra el siguiente en 380 ms.
- Hojas: suben en 420 ms.
- Sin rebotes, confeti ni entradas escalonadas. `prefers-reduced-motion`: solo fundidos.

## 11. Checklist final

- Junto a los mockups de `referencia/`, ¿se ven de la misma familia? Si dudas, no.
- ¿Hay algún degradado, sombra o color fuera de los cuatro? Quítalo.
- ¿Hay un solo círculo por pantalla?
- ¿El "kg" queda dentro del círculo en las tres tallas?
- ¿La pantalla de Serie cabe sin scroll en 390×844?
- ¿Algún pez sobre fondo rojo o en Serie? Quítalo.
- ¿Queda alguna ilustración SVG de persona, monoespaciada o mayúsculas sostenidas? Quítala.
- ¿Algún dato se parte en dos líneas?
- ¿El timer sigue exacto si recargas a media cuenta?
- ¿Una serie guardada sigue ahí después de recargar?
