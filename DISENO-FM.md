# FM: sistema de diseño

Este documento manda sobre cualquier decisión visual que ya exista en el código. Si algo de la versión actual lo contradice, gana este documento y se quita lo que sobre. No toca la lógica de rutinas, registro ni cálculo de sesiones: solo cómo se ve, cómo se mueve y cómo se siente.

## 0. Cómo trabajar esto (léelo primero)

La primera versión quedó con cara de plantilla. Antes de cambiar nada, escribe en 5 o 6 líneas por qué la versión actual no cumple este documento (colores, tipografía, jerarquía, componentes). Luego trabaja en tres pasos y detente al final de cada uno para que yo revise:

1. **Tokens y banco de componentes.** Crea `src/design/tokens.css` con todo lo de las secciones 2 a 6 y una ruta `/diseno` que muestre cada componente de la sección 7 en todos sus estados y temperaturas. Toma capturas a 390×844 (Playwright si está disponible; si no, dime y yo las mando). Revisa las capturas contra el checklist de la sección 14 y corrige antes de enseñarme.
2. **Pantalla de sesión.** Rehaz solo la sesión guiada (sección 8.2 y 8.3) usando los componentes. Capturas, autocrítica, detente.
3. **Resto de pantallas.** Hoy, resumen, señal, ejercicio.

Regla de gasto: una pantalla bien hecha vale más que cinco a medias. No inventes pantallas ni funciones que no estén aquí.

## 1. La idea

FM es un instrumento personal para ir al gym, no un entrenador que grita ni un videojuego de puntos. La metáfora es sintonizar: cada serie sube la señal, la intensidad se ve como temperatura de color, el progreso se lee como una escala de radio.

La identidad es "retrofuturismo editorial cálido": un sistema serio que conserva la capacidad de jugar. Debe poder vivir en la pantalla de inicio junto a apps de Apple sin desentonar, y aun así no parecerse a ninguna.

Hay tres cosas que hacen a FM reconocible. Todo lo demás es callado y disciplinado:

1. **El módulo encendido.** Un bloque grande que parece acrílico esmerilado iluminado desde dentro con el color de la temperatura actual. Es el protagonista de cada pantalla importante.
2. **La escala de sintonía.** Una fila de marcas finas tipo dial de radio donde cada marca es una serie. La aguja avanza cuando terminas una serie. Sustituye barras de progreso y anillos.
3. **La temperatura.** La app completa cambia de color según el esfuerzo: se calienta dentro de cada ejercicio y se enfría en el descanso.

## 2. Color

### Tokens

```css
:root {
  /* base: noche, nunca negro puro */
  --noche:        #0A0E1C;  /* fondo de la app */
  --capa-1:       #111831;  /* superficies, filas, hojas */
  --capa-2:       #19223F;  /* superficies elevadas, controles en reposo */
  --linea:        rgba(239, 227, 204, 0.08); /* divisores de 1px, solo si hacen falta */

  /* texto: crema, nunca blanco puro */
  --crema:        #EFE3CC;  /* texto principal */
  --crema-2:      rgba(239, 227, 204, 0.62); /* texto secundario */
  --crema-3:      rgba(239, 227, 204, 0.36); /* terciario, marcas pendientes */

  --negro-calido: #15110E;  /* texto SOBRE superficies encendidas */

  /* temperatura */
  --olivo:        #9FAA68;  /* calentamiento, recuperación */
  --ambar:        #FFB23E;  /* trabajo, primeras series */
  --naranja:      #FF6A1F;  /* trabajo fuerte, series intermedias */
  --rojo:         #FF4A1C;  /* última serie del ejercicio */
  --teal:         #3FC1C9;  /* descanso entre series, luz fría */

  /* variable viva: la que usan los componentes */
  --estado: var(--crema);
}
```

### Temperatura

La app expone un solo estado (`data-temp` en el `<body>`) y los componentes leen `--estado`. Nunca se pinta un color de temperatura "a mano" en un componente.

| `data-temp` | `--estado` | Cuándo |
|---|---|---|
| `reposo` | `--crema` (módulo en `--capa-2` con luz tenue azul) | Hoy, historial, fuera de sesión |
| `calentamiento` | `--olivo` | Series de calentamiento |
| `trabajo` | `--ambar` | Primera serie de trabajo de cada ejercicio |
| `fuerte` | `--naranja` | Series intermedias |
| `ultima` | `--rojo` | Última serie del ejercicio |
| `descanso` | `--teal` al 70% | Temporizador entre series |
| `listo` | `--ambar` suave sobre `--capa-1` | Resumen al terminar |

Así cada ejercicio se calienta de ámbar a rojo y el descanso lo enfría. La transición entre temperaturas dura 700 ms y es lo único que se anima "solo".

### Reglas de color

El color de temperatura ocupa poca superficie y mucha intensidad: el módulo encendido, la aguja, el botón principal y nada más. Fuera del módulo, la pantalla es noche y crema. El texto sobre una superficie encendida siempre es `--negro-calido`, nunca blanco. Prohibido `#FFFFFF`, `#000000`, grises neutros de Tailwind (`slate`, `zinc`, `gray`) y cualquier degradado decorativo. Contraste mínimo de 4.5:1 para texto normal.

## 3. Luz y material

La luz es la firma. Los materiales de referencia son acrílico esmerilado, plástico mate y lacado. No hay glassmorphism en tarjetas, no hay sombras grises, no hay reflejos de caramelo.

**Módulo encendido** (el único lugar donde hay "efecto"):

```css
.modulo {
  background:
    radial-gradient(120% 90% at 50% 35%,
      color-mix(in oklch, var(--estado) 88%, white 12%) 0%,
      var(--estado) 55%,
      color-mix(in oklch, var(--estado) 78%, black 22%) 100%);
  border-radius: 32px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22),   /* canto superior del acrílico */
              inset 0 -1px 0 rgba(0, 0, 0, 0.18);
  color: var(--negro-calido);
  transition: background 700ms var(--ease-luz);
}
```

Detrás del módulo, en el fondo de la página, una luz que se derrama: un `radial-gradient` de `--estado` al 14% de opacidad, amplio y difuso, como luz que sale del acrílico hacia la habitación. No es sombra, es luz.

**Grano:** una capa fija de ruido (SVG `feTurbulence` como data URI) sobre el fondo `--noche` al 3% de opacidad, `pointer-events: none`. Solo en el fondo, nunca encima del texto ni del módulo.

**Superficies normales** (`--capa-1`, `--capa-2`): color plano, sin borde ni sombra. Se separan del fondo por el cambio de tono. Un borde de 1px `--linea` solo cuando dos superficies iguales se tocan.

## 4. Tipografía

Fuente del sistema, para que se sienta nativa en iPhone:

```css
--sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
--mono: ui-monospace, "SF Mono", Menlo, monospace;
```

La personalidad no sale de la fuente sino de la escala: números enormes, apretados y pesados contra texto pequeño y tranquilo.

| Rol | Tamaño / interlínea | Peso | Tracking | Uso |
|---|---|---|---|---|
| Cifra héroe | 96 / 0.9 | 700 | -0.045em | Peso en kg, letra de la rutina |
| Cifra grande | 56 / 0.95 | 650 | -0.035em | Reps, minutos disponibles |
| Título | 28 / 1.1 | 650 | -0.02em | Nombre del ejercicio |
| Cuerpo | 17 / 1.35 | 400 | -0.01em | Texto general |
| Secundario | 15 / 1.3 | 500 | 0 | Detalles, "Serie 2 de 4" |
| Etiqueta | 13 / 1.2 | 500 | 0.01em | Etiquetas de datos, en `--crema-2` |
| Tiempo | 17 a 64 | 500 | 0 | Temporizadores, en `--mono` |

Todas las cifras con `font-variant-numeric: tabular-nums` para que no bailen al cambiar. Las unidades ("kg", "reps", "min") van al lado de la cifra en tamaño de etiqueta, alineadas a la línea base, en `--crema-2` o con opacidad 0.6 sobre el módulo.

Nada en mayúsculas sostenidas. Nada de etiquetitas encima de cada título. La monoespaciada solo para tiempos, no para etiquetas.

## 5. Layout

Base de diseño 390×844, probado también en 430×932. Respeta `env(safe-area-inset-*)`.

Rejilla de 4 pt. Margen lateral 20 px. Espaciados permitidos: 4, 8, 12, 16, 20, 24, 32, 48, 64.

Alineación a la izquierda por defecto. Solo se centra lo que es un instrumento (el dial de peso, el temporizador).

Jerarquía de radios, no un radio para todo:

| Elemento | Radio |
|---|---|
| Módulo encendido | 32 |
| Superficies y hojas | 24 |
| Controles (dial, stepper) | 20 |
| Botón principal | cápsula completa |
| Fotos | 20 |
| Chips pequeños | 12 |

Cada pantalla tiene un solo protagonista. El botón principal siempre en la zona del pulgar, pegado abajo, a 16 px del safe area. Todo lo de una serie se hace con una mano.

## 6. Movimiento

```css
--ease-peso: cubic-bezier(0.22, 0.8, 0.24, 1);  /* paneles, cosas con masa */
--ease-luz:  cubic-bezier(0.4, 0, 0.2, 1);       /* cambios de color y luz */
--t-toque: 90ms;  --t-control: 180ms;  --t-panel: 360ms;  --t-luz: 700ms;
```

Sin rebote, sin overshoot, sin resortes elásticos. Lo que se mueve:

La temperatura cambia en 700 ms. La aguja de la escala se desliza a la siguiente marca en 360 ms al terminar una serie. El cambio de ejercicio desliza el contenido horizontalmente en 360 ms con `--ease-peso`, como un panel con peso. Al presionar un control, escala a 0.98 y baja el brillo en 90 ms. Las cifras de peso cambian sin animación de conteo.

No hay entradas con fade-up en cada sección, ni confeti, ni pulsos, ni brillos. Con `prefers-reduced-motion`, todo pasa a cortes o fundidos de 120 ms.

## 7. Componentes

### 7.1 Módulo encendido
Bloque grande, radio 32, luz de la sección 3. Contiene la información principal de la pantalla en `--negro-calido`. Padding 24. Solo hay uno por pantalla.

### 7.2 Escala de sintonía
Fila horizontal que ocupa el ancho, 28 px de alto. Cada serie de la sesión es una marca vertical de 1.5 px. Las marcas se agrupan por ejercicio con un hueco de 8 px entre grupos. Hechas: `--crema`, 14 px. Pendientes: `--crema-3`, 10 px. Actual: la aguja, 3 px de ancho, 24 px de alto, color `--estado`, con un leve resplandor del mismo color. Al terminar una serie, la aguja se desliza a la siguiente marca. Va arriba en la sesión, debajo del botón de cerrar. Es el único indicador de progreso de la sesión.

### 7.3 Dial de peso
El control más importante y el más satisfactorio. Una regla horizontal que se arrastra con el dedo bajo una aguja fija al centro. Marcas por incremento del equipo (2.5 kg por defecto, configurable por ejercicio): menores de 12 px, cada 5 kg de 20 px, cada 10 kg de 28 px con el número pequeño debajo. Se implementa con un scroller horizontal y `scroll-snap`. Cada vez que cruza una marca, la cifra héroe de arriba se actualiza y hay un tick háptico (sección 9). Tocar la cifra abre el teclado numérico (`inputmode="decimal"`) como alternativa. Arranca en el peso de la vez pasada.

### 7.4 Stepper de reps
Cápsula `--capa-2` con menos, cifra grande y más. Botones de 56×56. Mantener presionado repite cada 120 ms tras 400 ms. Arranca en las reps objetivo.

### 7.5 Botón principal
Ancho completo, 60 px de alto, cápsula, fondo `--estado`, texto `--negro-calido` 17/600. Dice exactamente lo que hace: "Serie hecha", "Empezar", "Terminar sesión". Sin flechas ni íconos.

### 7.6 Botón secundario
Texto `--crema-2` 15/500 sin fondo, o cápsula `--capa-2` si necesita área. Nunca compite con el principal.

### 7.7 Temporizador de descanso
El módulo encendido se enfría a teal y el contenido cambia a una cuenta regresiva en `--mono` 64 px. Debajo, una línea fina que se vacía de derecha a izquierda. Botones: "+15 s" y "Saltar". Al llegar a cero: háptico, sonido opcional, y el botón principal dice "Siguiente serie".

### 7.8 Barra inferior
Tres destinos: Hoy, Señal, Ejercicios. Fondo `--noche` al 80% con `backdrop-filter: blur(20px)`, es el único blur permitido. Ícono lineal de 1.75 px más texto de 11 px. Activo en `--crema`, inactivo en `--crema-3`. Se oculta durante la sesión.

### 7.9 Hoja
Para detalle de técnica y ajustes. Sube desde abajo, `--capa-1`, radio 24 arriba, asa de 36×5 px `--crema-3`.

## 8. Pantallas

### 8.1 Hoy

```
 FM                               jue 24 sep

 Hoy toca
 B                                  (cifra héroe, crema)
 Pierna y hombro

 ┌────────────────────────────────────────┐
 │  52 min                                │  módulo encendido
 │  Tienes hasta las 8:40.                │  (ámbar si alcanza,
 │  Alcanza completa.                     │   crema si no alcanza)
 └────────────────────────────────────────┘

 La vez pasada                               (etiqueta crema-2)
 Sentadilla        60 kg × 8
 Press militar     30 kg × 10
 Zancadas          16 kg × 12

 [              Empezar              ]
```

Si no alcanza el tiempo: "Tienes 34 min. No alcanza completa, te dejo lo esencial." y la sesión se recorta. La lista de "la vez pasada" son filas planas sin tarjetas, separadas por espacio.

### 8.2 Sesión: ejercicio

```
 ✕                                    3 de 6
 ┃┃┃┃  ┃┃┃┃  ┃┃▌┃  ┃┃┃  ┃┃┃  ┃┃┃             escala de sintonía

 Press militar                                título
 Serie 2 de 4                                 secundario

 ┌──────────────────────┐
 │   foto duotono 4:3   │                     tocar abre técnica
 └──────────────────────┘

 ┌────────────────────────────────────────┐
 │  32.5 kg                               │  módulo encendido
 │  ╷ ╷ ┃ ╷ ╷ ╷ ▲ ╷ ╷ ╷ ┃ ╷ ╷             │  dial de peso
 │   −        10 reps        +            │  stepper
 └────────────────────────────────────────┘

 [            Serie hecha            ]
```

El módulo lleva la temperatura de la serie actual. Si ya toca subir de peso, una línea arriba del módulo: "La vez pasada hiciste 12 en todas. Toca subir." y el dial arranca ya con el incremento.

### 8.3 Sesión: descanso
Misma estructura; el módulo pasa a temporizador (7.7) y se enfría a teal. Arriba del módulo, el siguiente paso: "Sigue: serie 3, 32.5 kg".

### 8.4 Resumen
Temperatura `listo`. Una frase y pocos datos, sin medallas:

```
 Listo.
 Pierna hecha. Mañana te vas a acordar.

 48 min      6 ejercicios      22 series
 Subiste en press militar (+2.5 kg).

 [              Cerrar              ]
```

### 8.5 Señal (historial)
Fondo noche. Cada semana es una banda horizontal; cada sesión es un punto de luz sobre ella. Duración = largo del trazo, intensidad = saturación del color (ámbar a rojo), descanso = espacio entre puntos. Como tráfico nocturno visto con exposición larga. Debajo, datos simples: sesiones del mes, tendencia de peso por ejercicio en una línea fina. Una semana con poca actividad solo se ve con menos luz. Nunca "perdiste tu racha".

Vacío: "Todavía no hay señal. La primera sesión la enciende."

### 8.6 Ejercicio (detalle y técnica)
Hoja con foto duotono grande, nombre, músculos principales, 3 o 4 puntos de técnica en frases cortas, errores comunes y alternativas. Ordenado como ficha de catálogo, sin tarjetas anidadas.

## 9. Hápticos y sonido

**Realidad técnica:** Safari en iPhone no soporta `navigator.vibrate`. Existe un truco conocido en iOS 18 o más reciente: activar por código un `<label>` ligado a un `<input type="checkbox" switch>` oculto hace que el sistema dé un tap háptico ligero. Crea `src/lib/haptics.ts` que use `navigator.vibrate` si existe (Android), si no el truco del switch, y que falle en silencio si ninguno funciona. Solo hay un tipo de tap, así que la intensidad se comunica con patrones. Es probable que solo funcione dentro de un toque del usuario; verifícalo en el iPhone real y, donde no funcione, usa sonido. Debe haber un ajuste para apagarlos.

| Evento | Patrón |
|---|---|
| Cruzar una marca del dial de peso | 1 tap (máximo uno cada 40 ms) |
| Serie hecha | 1 tap |
| Terminar un ejercicio | 2 taps separados 110 ms |
| Fin del descanso | 2 taps, o sonido si no hay gesto |
| Terminar sesión | 3 taps lentos, 160 ms |

Nada de háptico en navegación, pestañas ni botones secundarios. La vibración confirma, no premia.

**Sonido** (apagado por defecto, ajuste para prenderlo): sintetizado con Web Audio, sin archivos. Fin de descanso: dos notas cortas y cálidas, onda senoidal con ataque suave. Serie hecha: un clic mecánico corto. Nada de campanitas ni fanfarrias.

## 10. Fotos de ejercicios

Todas en duotono para que fotos de distintas fuentes se vean de una sola familia: sombras en `--noche`, luces en `--crema`. Se hace con un filtro SVG `feColorMatrix` o con escala de grises más dos capas con `mix-blend-mode`. Radio 20, proporción 4:3, sin borde. Si un ejercicio no tiene foto, no se pone un ícono de relleno: se omite el espacio.

## 11. Íconos

Mínimos. Solo navegación, cerrar, ajustes y los signos del stepper. Lineales, trazo 1.75 px, esquinas redondeadas, en `--crema-2`. Ningún ícono decorativo, ningún emoji, nada de fuego, rayos, trofeos ni medallas.

## 12. Voz

Directa, observadora, humor seco, español mexicano casual. Frases cortas en minúscula inicial normal (sentence case). Los botones dicen lo que pasa y el mismo verbo se sostiene en todo el flujo.

| Sí | No |
|---|---|
| Tienes 18 minutos. Alcanza para algo bueno. | ¡Vamos, campeón! |
| Hoy toca B. | ¡Es día de pierna! 💪 |
| La vez pasada hiciste 12 en todas. Toca subir. | ¡Supera tus límites! |
| Listo. Pierna hecha. | ¡Increíble trabajo! |
| Semana con menos señal. | Perdiste tu racha. |
| No se guardó la serie. Toca para reintentar. | ¡Ups! Algo salió mal. |

## 13. Prohibido

El look de Tailwind por defecto (`slate-800`, `rounded-xl` en todo, `shadow-md`), tarjetas dentro de tarjetas, la pantalla cortada en cajitas iguales, anillos de progreso, degradados morados o de plantilla, glassmorphism en tarjetas, sombras grises, blanco o negro puros, mayúsculas sostenidas, etiquetas tipo eyebrow encima de cada título, flechas "→" en botones, textos separados con puntos medios, emojis, confeti, íconos de fuego, frases motivacionales, pantallas de bienvenida o onboarding que nadie pidió, y cualquier mascota o personaje (va en otro pase).

## 14. Checklist antes de enseñarme

Revisa cada captura contra esto y corrige lo que falle:

- ¿Hay un solo protagonista en la pantalla?
- ¿El color de temperatura aparece solo en el módulo, la aguja y el botón principal?
- ¿Todo el texto es crema o negro cálido, nada blanco puro?
- ¿Las cifras son tabulares y de verdad grandes contra el resto?
- ¿El botón principal está en la zona del pulgar y dice lo que hace?
- ¿Se puede registrar una serie completa con una mano y en menos de 3 toques?
- ¿Hay algo que parezca componente de plantilla o dashboard SaaS? Quítalo.
- ¿Hay alguna decoración que no comunique estado? Quítala.
- ¿Se ve como una app de Apple con carácter, o como un template? Si dudas, es template.

## 15. Fuera de este pase

Mascota, ícono de app y logo "FM" se definen después, cuando la interfaz ya tenga forma. No dejes espacios reservados para ellos. Mientras, el ícono de la PWA puede ser un cuadrado `--noche` con una franja horizontal de acrílico ámbar encendido al centro (el mismo tratamiento del módulo), sin texto.
