# FM v2: rediseño y funciones

Este documento reemplaza por completo a `DISENO-FM.md`. La primera vuelta cumplió reglas pero se ve genérica y "vibe coded". Aquí está por qué y cómo se corrige. Donde este documento y el código actual choquen, gana este documento: borra sin miedo.

## 0. Cómo trabajar

Haz todo de corrido, sin detenerte a preguntarme. Commit al terminar cada bloque (A, B, C, D). Decisiones ambiguas: elige lo más simple y más nativo, y anótalo en `NOTAS-DISENO.md`.

Orden:
- **A. Funciones críticas** (sección 9): timer por hora de término, guardado de pesos, sesión que sobrevive a cerrar la app, pantalla encendida, Atajos. Primero que funcione.
- **B. Sistema visual nuevo** (secciones 2 a 6): tokens y componentes. Borra el módulo encendido, el degradado radial, el stepper dentro del bloque de color, la monoespaciada y las ilustraciones SVG de personas.
- **C. Pantallas** (sección 7).
- **D. Fotos y técnica** (sección 8).

Después de C y D, toma capturas a 390×844 y pásalas por el checklist de la sección 12. Si algo falla, corrígelo antes de cerrar.

## 1. Qué salió mal en la v1 (no repetir)

1. **Bloques gigantes de color.** El ámbar en superficie grande se ve amarillo mantequilla. Con degradado radial y brillo en el canto parece botón de 2012. El color nunca vuelve a llenar un bloque grande.
2. **Ilustraciones SVG de monitos.** Es la marca más obvia de app hecha por IA. Se eliminan todas.
3. **Home sin jerarquía.** Seis elementos distintos apilados, cada uno con su propio estilo.
4. **Escala de sintonía con marcas agrupadas.** Parece código de barras.
5. **Monoespaciada en el timer.** El cero cruzado se ve de terminal.
6. **Controles oscuros metidos dentro de bloques claros.** Contraste torpe, nada nativo.
7. **Filas donde el dato se parte en dos líneas** ("16 kg ×" / "8").

## 2. La idea visual nueva: el horizonte

La app es casi siempre oscura y tranquila. El esfuerzo no pinta cajas: **calienta el horizonte**. En la parte baja de la pantalla hay una luz difusa, como el resplandor de una ciudad de noche en el horizonte o el reflejo de una luz naranja en el piso. Esa luz cambia de color con la temperatura: se calienta serie por serie y se enfría en el descanso. Todo lo demás (números, texto, controles) vive encima, limpio, en crema sobre noche.

Esto es lo único "expresivo" de FM. El resto debe ser tan disciplinado como una app de Apple: tipografía del sistema bien usada, espacios generosos, controles grandes, cero decoración.

La referencia de calidad es la app Reloj, Fitness y Clima de iOS: números enormes y finos de peso, fondos oscuros con color atmosférico, controles sin adornos. FM se tiene que poder poner junto a ellas sin verse de otra liga.

## 3. Color

```css
:root {
  --noche:     #080B14;   /* fondo */
  --capa-1:    #10141F;   /* filas agrupadas, hojas */
  --capa-2:    #181D2B;   /* controles en reposo */
  --separador: rgba(242, 234, 219, 0.10); /* hairline 0.5px */

  --crema:     #F2EADB;   /* texto principal */
  --crema-2:   rgba(242, 234, 219, 0.60);
  --crema-3:   rgba(242, 234, 219, 0.32);
  --tinta:     #140F0B;   /* texto sobre botón encendido */

  /* temperatura: solo familia naranja, nada amarillo */
  --olivo:     #A4AE70;   /* calentamiento */
  --brasa-1:   #FF8A3D;   /* primera serie de trabajo */
  --brasa-2:   #FF6A1F;   /* series intermedias */
  --brasa-3:   #FF4A1C;   /* última serie */
  --teal:      #4FC3C9;   /* descanso */

  --estado:    var(--brasa-2);
}
```

| `data-temp` | `--estado` | Cuándo |
|---|---|---|
| `reposo` | `--brasa-2` al 35% de intensidad del horizonte | Hoy, historial |
| `calentamiento` | `--olivo` | Calentamiento |
| `trabajo` | `--brasa-1` | Primera serie de cada ejercicio |
| `fuerte` | `--brasa-2` | Intermedias |
| `ultima` | `--brasa-3` | Última serie |
| `descanso` | `--teal` | Entre series |
| `listo` | `--brasa-1` suave | Resumen |

**Dónde aparece el color de estado, y en ningún otro lado:** el horizonte, la aguja del dial de peso, el segmento actual de la barra de progreso, y el botón principal. Todo el texto es crema. Nunca amarillo, nunca `#FFB23E`, nunca blanco puro, nunca negro puro.

## 4. El horizonte (componente firma)

Una capa fija detrás del contenido, anclada abajo, que ocupa el 55% inferior de la pantalla:

```css
.horizonte {
  position: fixed; inset: auto 0 0 0; height: 55vh;
  pointer-events: none; z-index: 0;
  background:
    radial-gradient(140% 80% at 50% 115%,
      color-mix(in srgb, var(--estado) 55%, transparent) 0%,
      color-mix(in srgb, var(--estado) 18%, transparent) 45%,
      transparent 75%);
  transition: background 900ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

Encima, una segunda capa de grano muy fino (SVG `feTurbulence`, 4% de opacidad, `mix-blend-mode: overlay`) solo sobre el horizonte, para que la luz se sienta física y no degradado de plantilla.

Intensidad del horizonte por estado: reposo 35%, calentamiento 60%, trabajo 70%, fuerte 85%, última 100%, descanso 60%. Se controla con una variable `--intensidad` que multiplica la opacidad.

La transición entre estados dura 900 ms. Es la única animación que ocurre sin que el usuario toque algo.

## 5. Tipografía

Solo la fuente del sistema. Nada de monoespaciada en ningún lado.

```css
--sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
```

Escala basada en la de iOS, con dos tamaños extra para cifras:

| Rol | Tamaño / línea | Peso | Tracking |
|---|---|---|---|
| Cifra héroe (peso, timer) | 104 / 1 | 300 | -0.04em |
| Cifra media (reps, stats) | 44 / 1 | 400 | -0.03em |
| Título grande | 34 / 1.1 | 700 | -0.02em |
| Título | 22 / 1.2 | 600 | -0.01em |
| Cuerpo | 17 / 1.35 | 400 | -0.01em |
| Subtexto | 15 / 1.3 | 400 | 0 |
| Nota | 13 / 1.3 | 400 | 0 |

**La cifra héroe va en peso ligero (300), no en negritas.** Números enormes y delgados, como el Reloj de iOS. Eso solo ya cambia la app de "genérica" a "pro". Siempre `font-variant-numeric: tabular-nums`. Las unidades ("kg", "reps") en 17/400 `--crema-2`, pegadas a la línea base de la cifra.

Nada en mayúsculas sostenidas. Sin etiquetas encima de los títulos.

## 6. Componentes

### 6.1 Barra de progreso de sesión
Una fila de segmentos, uno por ejercicio, a lo ancho con 4 px de separación. Altura 3 px, radio 2. Terminados: `--crema` al 85%. Actual: fondo `--crema-3` y se llena de izquierda a derecha en `--estado` según series hechas. Pendientes: `--crema-3` al 40%. Nada de marcas agrupadas.

### 6.2 Dial de peso
Sin caja alrededor. Directo sobre el fondo:

```
            18
               kg
  ╵ ╵ ╵ ╵ │ ╵ ╵ ╵ ╵ ┃ ╵ ╵ ╵ ╵ │ ╵ ╵ ╵ ╵
       10                20
```

Cifra héroe centrada arriba. Debajo, la regla: marcas de 1 px en `--crema-3`, cada 5 kg de 1.5 px en `--crema-2` con el número pequeño (13 px) debajo. La aguja fija al centro: 2 px de ancho, 36 px de alto, color `--estado`, con un resplandor de 8 px del mismo color. Los bordes de la regla se desvanecen con una máscara lineal (transparente en el 12% de cada lado). Arrastre con `scroll-snap`, tick háptico por marca, incremento por ejercicio (2.5 por defecto; 1 para mancuernas si el ejercicio lo indica). Tocar la cifra abre teclado decimal.

### 6.3 Stepper de reps
Tres piezas sueltas en una fila, sin cápsula que las encierre: botón circular de 56 px `--capa-2` con "−", la cifra media en el centro con "reps" al lado, botón circular "+". Mantener presionado repite.

### 6.4 Botón principal
Ancho completo, 56 px, radio 16 (no cápsula), fondo `--estado`, texto 17/600 `--tinta`. Estado presionado: escala 0.97 y brillo 0.9 en 100 ms. Encima del horizonte, así que se ve como si la luz saliera de él.

### 6.5 Botones secundarios
Texto 17/400 `--crema-2` sin fondo, área táctil de 44 px mínimo. Si hay varios, en fila con separación generosa. Nunca más de tres visibles.

### 6.6 Listas agrupadas
Estilo "inset grouped" de iOS para ajustes, técnica e historial: bloque `--capa-1` radio 12, filas de 52 px, separadores hairline de 0.5 px `--separador` con sangría de 16 px a la izquierda. El dato a la derecha nunca se parte en dos líneas: `white-space: nowrap` y el nombre se trunca con elipsis si hace falta.

### 6.7 Hoja
Sube desde abajo con dos alturas (media y completa), `--capa-1`, radio 12 arriba, asa 36×5. Fondo detrás oscurecido al 50%.

### 6.8 Barra inferior
Tres destinos: Hoy, Historial, Ejercicios. Fondo `--noche` al 72% con blur 24 px, hairline arriba. Íconos lineales de 1.5 px (lucide está bien), activo `--crema`, inactivo `--crema-3`. Se oculta en sesión.

## 7. Pantallas

### 7.1 Hoy
Una sola decisión: empezar.

```
 jue 24 sep                              ⚙

 Hoy toca
 Cuerpo completo A                       título grande
 7 ejercicios, unos 50 min               subtexto crema-2

 1  Press de banca con mancuernas   16 kg
 2  Jalón al pecho                  42 kg
 3  Sentadilla goblet               18 kg
 4  Press militar sentado           12 kg
 5  Curl con barra Z                17 kg
 ...                                     lista numerada simple,
                                         sin caja, 17/400,
                                         peso a la derecha crema-2

 L  M  M  J  V  S  D                     semana: 7 puntos de 6 px,
 ●  ○  ○  ◉  ○  ○  ○                     hecho crema, hoy anillo

 [          Empezar          ]           botón principal
 ~~~~~~~~~ horizonte en reposo ~~~~~~~~~
```

Todo lo demás sale de la pantalla principal:
- El aviso de "cuatro semanas cumplidas, pasar a 4 series" aparece como **una sola línea** arriba del botón ("Ya toca pasar a 4 series.") que al tocarla abre una hoja con Aceptar / Después.
- "Lunes con Frida" se marca en el punto del lunes de la semana (el punto hecho) y en el historial, no como chip.
- "Salgo de la oficina a las" pasa a la hoja de ajustes o se pregunta al tocar "unos 50 min". Si ya se sabe la hora, el subtexto dice "Sales a las 7:10. Alcanza completa."

### 7.2 Calentamiento
Título "Calentamiento", subtexto con la indicación. Timer en cifra héroe centrado, sin caja. Horizonte olivo. Botón "Empezar calentamiento". Alternativa (máquina ocupada) como nota 15 px crema-2 debajo del timer.

### 7.3 Ejercicio

```
 ✕                                       3 de 7
 ▬▬▬ ▬▬▬ ▬▬░ ─── ─── ─── ───             barra de segmentos

 Sentadilla goblet                       título
 Serie 1 de 3, 10 a 12 reps              subtexto

 ┌──────────────────────────────────┐
 │                                  │    foto real, radio 16,
 │            foto 4:3              │    ancho completo,
 │                                  │    tocar = técnica
 └──────────────────────────────────┘

                 18 kg                   dial de peso (6.2)
    ╵ ╵ ╵ │ ╵ ╵ ┃ ╵ ╵ │ ╵ ╵ ╵

       (−)      12 reps      (+)         stepper (6.3)

 Anterior       Técnica        Saltar    secundarios

 [          Serie hecha          ]
 ~~~~~~~~~~~~ horizonte caliente ~~~~~~~~~~~~
```

Si toca subir de peso, una línea 15 px arriba del dial: "La vez pasada hiciste 12 en todas. Sube a 20." y el dial ya arranca en 20. Si hay serie de aproximación, una línea igual: "Antes, una de aproximación con 8 kg, 10 reps. No se registra."

Si la foto hace que no quepa todo en 844 px de alto, la foto se reduce a 16:9, nunca se hace scroll en esta pantalla.

### 7.4 Descanso
Misma pantalla, la foto se va y queda:

```
 ✕                                       3 de 7
 ▬▬▬ ▬▬▬ ▬▬░ ─── ─── ─── ───

 Descanso
 Sigue: serie 2, 18 kg, 10 a 12 reps

                  1:12                   cifra héroe centrada
        ──────────────────               línea que se vacía

   −15 s        +15 s        Avísame     secundarios

 [          Saltar descanso          ]   botón en teal
 ~~~~~~~~~~~~ horizonte teal ~~~~~~~~~~~~
```

Al llegar a cero: la cifra cambia a "Va", háptico, sonido, y el botón dice "Siguiente serie" en `--brasa-1`. Si el usuario regresa tarde a la app: "Terminó hace 40 s." en lugar de la cifra.

### 7.5 Resumen

```
 Listo.                                  título grande
 A hecha. Mañana te vas a acordar.       cuerpo crema-2

 48 min        7 ejercicios    21 series cifras medias en fila,
                                         etiqueta 13 px debajo

 Subiste en jalón al pecho, +2.5 kg.     lista agrupada si hubo
                                         subidas; si no, una línea
                                         "Hoy sostuviste los pesos."

 [          Cerrar          ]
 ~~~~~~~~~~~ horizonte listo ~~~~~~~~~~~
```

"Descartar sesión" va dentro de la hoja del ✕, no en el resumen.

### 7.6 Historial
Lista de semanas. Cada semana es una fila: a la izquierda las fechas, a la derecha 7 puntos (hecho, no hecho, lunes con Frida marcado con el mismo punto). Tocar una semana muestra sus sesiones. Tocar una sesión muestra ejercicio por ejercicio con pesos y reps de cada serie. Arriba, un solo dato grande: sesiones del mes. Una semana incompleta simplemente tiene menos puntos llenos, sin texto de culpa.

Por ejercicio (desde Ejercicios o tocando uno en una sesión): una gráfica de línea fina de 1.5 px en crema del peso usado en el tiempo, con el último punto en `--brasa-2`. Nada más.

### 7.7 Ejercicios
Lista agrupada por rutina (A1, A2, B1, B2) con nombre y último peso. Tocar abre la ficha de técnica (sección 8).

### 7.8 Ajustes (hoja)
Lista agrupada: hora de salida de la oficina, sonido, hápticos, configurar aviso con Atajos (con instrucciones paso a paso), exportar respaldo, importar respaldo, versión.

## 8. Fotos y técnica

### 8.1 Fotos
Elimina todas las ilustraciones SVG de personas. Dos fuentes, en este orden:

1. **Foto propia.** En la ficha de cada ejercicio, "Tomar foto" abre la cámara (`<input type="file" accept="image/*" capture="environment">`). La foto se comprime a 1200 px de lado largo en JPEG 0.8 y se guarda en IndexedDB. Así puedo fotografiar la máquina real de mi gym.
2. **Foto de base.** Para arrancar, usa las imágenes del repositorio `yuhonas/free-exercise-db` en GitHub. Verifica su licencia antes de usarlas; si permite uso libre, descarga al repo solo las de mis ejercicios (no hotlink) y anota la fuente en `NOTAS-DISENO.md`. Si no encuentras un ejercicio, deja la ficha sin foto y con el botón de tomar una.

Tratamiento de todas las fotos: desaturadas al 35%, un leve oscurecimiento hacia los bordes, radio 16. Así fotos de fuentes distintas se ven de la misma familia sin volverse un filtro artístico.

### 8.2 Técnica
Cada ejercicio de mis rutinas tiene esta ficha, escrita en español mexicano, directa, frases cortas:

- **Qué trabaja:** músculos principales y secundarios.
- **Qué debes sentir:** dónde se siente cuando se hace bien y qué señal indica que otra parte está trabajando de más.
- **Preparación:** ajuste de máquina o banco, agarre, postura inicial.
- **Ejecución:** 3 a 5 pasos cortos, incluyendo respiración y tempo.
- **Errores comunes:** 2 a 4, cada uno con cómo corregirlo.
- **Cómo escoger el peso:** con qué peso empezar si es la primera vez y la regla de ajuste: si terminas la última serie con más de 2 reps de sobra, sube; si no llegas al mínimo del rango, baja.
- **Alternativa:** qué hacer si la máquina está ocupada.

Se muestra como hoja en tamaño completo: foto arriba, luego las secciones como lista agrupada con títulos de 22 px. Sin tarjetas anidadas.

## 9. Funciones críticas

### 9.1 Timer que nunca falla
Ningún timer cuenta con `setInterval` sumando segundos. Al iniciar un descanso se guarda `finDescanso = Date.now() + segundos * 1000` en el estado persistido. La pantalla calcula lo que falta con `finDescanso - Date.now()` en cada frame (`requestAnimationFrame`) y al volver a la app (`visibilitychange`). Si me salgo a otra app, bloqueo el cel o la app se recarga, al volver el timer está exacto. Igual para el calentamiento y la duración total de la sesión.

### 9.2 Aviso con Atajos
En la pantalla de descanso, el botón "Avísame" abre:

```
shortcuts://run-shortcut?name=FM%20Descanso&input=text&text=<segundos restantes>
```

En Ajustes, una sección "Aviso de descanso" explica cómo crear el atajo: abrir Atajos, nuevo atajo llamado exactamente "FM Descanso", acción "Iniciar temporizador" usando la entrada del atajo como segundos. Así el timer nativo de iOS suena aunque esté en otra app o con el cel bloqueado. Guarda en el estado que se usó "Avísame" para no duplicar el sonido de la app. Prueba que el nombre con espacio funcione; si falla, usa "FMDescanso".

### 9.3 Guardado
Cada serie se guarda en IndexedDB en el momento en que toco "Serie hecha", no al final de la sesión. La sesión en curso se guarda completa en cada cambio: si cierro la app a medias, al abrirla aparece "Tienes una sesión a medias" con Seguir / Descartar. Pide `navigator.storage.persist()` al iniciar. El peso de cada ejercicio precarga el último usado. En Ajustes, exportar e importar respaldo en JSON.

### 9.4 Pantalla encendida
Durante la sesión, pide `navigator.wakeLock.request('screen')` y vuelve a pedirlo al regresar a la app. Si no está disponible, no pasa nada.

### 9.5 Hápticos y sonido
Mantén `src/lib/haptics.ts`. Eventos: tick del dial, serie hecha, fin de descanso (si la app está abierta), fin de sesión. Nada más. Sonido de fin de descanso con Web Audio: dos notas cortas y cálidas, solo si la app está visible.

## 10. Movimiento

Curva única `cubic-bezier(0.32, 0.72, 0, 1)` (la de las hojas de iOS). Hojas 420 ms. Cambio de ejercicio: el contenido sale a la izquierda y entra el siguiente en 380 ms. Cifras: al cambiar de serie, el número hace un fundido corto de 150 ms. Horizonte 900 ms. Sin rebotes, sin confeti, sin entradas escalonadas. `prefers-reduced-motion`: solo fundidos.

## 11. Voz

Directa, humor seco, español mexicano casual. Botones dicen lo que hacen. Nada de "¡Vamos!", "¡Increíble!", emojis ni frases motivacionales. Errores dicen qué pasó y qué hacer: "No se guardó la serie. Toca para reintentar."

## 12. Checklist final

Revisa cada captura:

- ¿Hay algún bloque grande relleno de color de estado? Quítalo. El color solo va en horizonte, aguja, segmento actual y botón.
- ¿Algo se ve amarillo? Está mal.
- ¿La cifra héroe es enorme y delgada (300)?
- ¿Hay monoespaciada en algún lado? Quítala.
- ¿Queda alguna ilustración SVG de persona? Quítala.
- ¿Algún dato se parte en dos líneas?
- ¿El Home tiene una sola cosa importante?
- ¿La pantalla de ejercicio cabe sin scroll en 390×844?
- ¿El timer sigue exacto si recargas la página a media cuenta?
- ¿Una serie guardada sigue ahí después de recargar?
- Puesta junto a capturas del Reloj o Fitness de iOS, ¿se ve de la misma liga? Si dudas, no.

## Fuera de este pase

Mascota, ícono definitivo y logo. No dejes espacio reservado para ellos.
