# Brief: app de rutina de gym (nombre por definir)

Versión 2. Sustituye la anterior completa. Incluye identidad visual (sección 3 y Anexo A) y la biblioteca de ejercicios con alternativas (sección 7).

## 1. Para quién es y para qué

App personal para un solo usuario (Fer, 23 años). Objetivo: bajar grasa conservando y subiendo músculo, con 3 sesiones de gym a la semana como meta y una cuarta opcional. Entrena en el gym de un club deportivo en León, Gto., entre semana en la noche, con hora tope fija porque cierran las regaderas a las 10 pm.

La app resuelve cuatro cosas y nada más:

1. Decirle qué sesión le toca hoy y si le alcanza el tiempo, sin que toque nada (lee fecha y hora del teléfono).
2. Guiarlo durante la sesión: un ejercicio por pantalla, ilustración, series, reps, técnica, peso sugerido, cronómetro de descanso, y alternativa a un toque si el equipo está ocupado o no está.
3. Registrar peso y reps por serie y decirle cuándo subir de peso.
4. Mostrar progreso: sesiones por semana, pesos por ejercicio, peso corporal semanal y foto cada dos semanas.

No es una app para el público. Sin login, sin backend, sin social, sin catálogo genérico. Todo vive en el teléfono.

Referencia de flujo: la sesión guiada de la app de Smart Fit (un ejercicio por pantalla, series y peso a un toque, te lleva al siguiente). De ahí se copia solo el flujo. No se copian promociones, retos, logros ni ruido.

## 2. Ruta técnica

- Web app instalable (PWA): manifest, service worker, funciona sin internet, se agrega a la pantalla de inicio del iPhone y abre en pantalla completa (`display: standalone`).
- Stack: Vite + React + TypeScript. CSS propio con variables. Sin librerías de UI.
- Datos en IndexedDB (`idb`). localStorage solo para preferencias.
- Exportar e importar respaldo JSON desde Ajustes.
- Deploy gratuito con HTTPS (Vercel o GitHub Pages).
- Probar en Safari iOS real: safe areas, `100dvh`, teclado numérico (`inputmode="decimal"`), rebote de scroll, "Añadir a pantalla de inicio", pantalla apagándose a media sesión (usar Wake Lock API cuando esté disponible).
- Reloj: todo cálculo de "qué toca" y "alcanzo" usa `Date.now()` del teléfono, zona horaria local.

## 3. Identidad visual y tono

La identidad completa está en el Anexo A, escrita por el usuario. Es obligatoria y manda sobre cualquier convención de "app fitness". Resumen operativo:

**Concepto.** Un instrumento personal que organiza el movimiento según el tiempo y la energía que hay hoy. Un sistema serio que conserva la capacidad de jugar. No un entrenador, no una red social, no un videojuego de puntos.

**Color.** Dark mode por default. Fondos de azul noche, navy y negro cálido (nunca negro puro ni azul genérico de app tech). Crema cálido donde hay que leer. Naranja como el elemento vivo: poca superficie, mucha intensidad. Teal solo como luz fría puntual. Olivo para recuperación.

La intensidad se expresa como temperatura de color y la interfaz entera cambia de estado:
- Reposo / descanso: azul oscuro
- Preparación / calentamiento: crema u olivo
- Trabajo moderado: ámbar
- Trabajo fuerte (series de trabajo): naranja saturado
- Pico (última serie, cierre de saco): rojo anaranjado puntual
Sin iconos de fuego. El progreso es una superficie que se llena o se calienta, no anillos.

**Historial como tráfico nocturno.** Las sesiones se ven como puntos de luz sobre fondo oscuro: duración = longitud, intensidad = saturación, descanso = espacio entre señales. Una semana sin cumplir es un intervalo más largo, no una racha rota.

**Forma.** Módulos grandes en vez de muchas tarjetas. Rectángulos redondeados sólidos, cápsulas, marcos oscuros que contienen color o luz. Retícula clara con una o dos rupturas deliberadas. Cada pantalla tiene un solo protagonista. Controles grandes, con peso, como de un objeto bien construido. Profundidad con color, no con sombras. Nada de glassmorphism, degradados de plantilla ni tarjetas flotando.

**Tipografía.** Sans serif clara, compacta, ligeramente geométrica (candidatas: Manrope, Sora, o la del sistema si se quiere cero dependencia). Números grandes y expresivos para peso y reps. Monoespaciada solo para tiempo y contadores (candidata: JetBrains Mono o SF Mono). Etiquetas pequeñas tipo catálogo. La personalidad no depende de una fuente retro.

**Movimiento.** Rítmico y físico: una luz que se enciende, un panel que se desliza con peso, una superficie que cambia de temperatura. 150 a 250 ms con easing con inercia. Nada de rebotes gratuitos, confeti ni brillos. Vibración solo para acciones importantes (serie guardada, fin de descanso, fin de sesión).

**Tono.** Directo, observador, cálido sin ser maternal, humor seco. Español mexicano casual. Ejemplos correctos: "Te toca B", "Tienes 18 minutos. Alcanza para algo bueno", "Hoy no alcanzó. Mañana es martes". Incorrectos: "¡Vamos, campeón!", "Desbloquea tu mejor versión", cualquier frase motivacional.

**Ilustración.** Plana, contornos oscuros, formas simples, textura de impresión sutil. Una anomalía pequeña y juguetona está permitida en momentos reservados (pantalla vacía, fin de una semana cumplida), no en cada pantalla. Ver sección 10.

**Lo que no es.** Gym bro negro y rojo, neón azul sobre negro, wellness beige, Dribbble genérico, mascota cute en todos lados, AI slop. Si algo se ve como salido de un solo prompt, está mal.

## 4. Lógica de la semana

- La semana empieza en lunes.
- Meta: 3 sesiones. La cuarta es bonus.
- Tres tipos de sesión:
  - **Lunes con Frida**: pierna en otro gym con la rutina de ella. La app no la guía, solo se marca como hecha. Cuenta para la meta. No siempre ocurre.
  - **Sesión A** y **Sesión B**: las propias, de cuerpo completo (sección 7).
- Alternancia: la siguiente sesión propia es la que NO se hizo la última vez, sin importar el día. La de Frida no afecta la alternancia.
- La pantalla principal abre ya resuelta: "Te toca A", sesiones de esta semana X/3, y el estado de tiempo de hoy (sección 5). Sin preguntar nada.
- Domingo de rescate: si el jueves en la noche va en 1 o 2, la app lo dice ese jueves y el domingo en la mañana ("Vas en 2. Domingo antes de las 3 pm").
- Cuarto día: con 3 cumplidas, la siguiente sesión aparece como bonus con cierre de 20 min.
- Semana cumplida = 3 sesiones. La no cumplida solo se muestra como intervalo más largo en el historial.
- Calentar antes y cerrar con cardio son parte de la sesión, no pasos opcionales, pero si el usuario los salta la sesión igual cuenta.

## 5. Regla de horario (automática)

Tope duro: última pesa a las 9:10 pm.

La app calcula sola con la hora actual:
- Si son las 8:05 pm o antes → "Alcanza la completa" (60 a 70 min).
- Entre 8:05 y 8:25 pm → "Alcanza la corta" (45 min). La sesión se abre en versión corta.
- Después de 8:25 pm → "Hoy ya no. Descanso." Sin regaño. Si el usuario abre una sesión de todas formas, la app lo deja pero la arranca en corta.
- Antes de las 7 pm (fin de semana o día libre): completa.

Extra opcional en Hoy: "Salgo de la oficina a las ___" → la app suma 60 min de carretera + 30 min casa-club (configurables) y contesta completa / corta / no. Es la única entrada manual de tiempo.

## 6. Cómo se hace cada serie (reglas globales, visibles en la app)

- Esfuerzo: terminar cada serie con 1 o 2 repeticiones guardadas. Si la última salió fácil, el peso era chico. Si no llegaste al mínimo del rango, era grande.
- Peso inicial (primera vez de cada ejercicio): elegir un peso con el que el tope del rango salga con 2 guardadas. Si hay duda, empezar más ligero; la app sube rápido en dos sesiones.
- Serie de aproximación: en el primer ejercicio de cada sesión, una serie ligera (mitad del peso, 10 reps) que no se registra. En los demás no hace falta.
- Descanso: el que marca cada ejercicio. Sin cel entre series; la app muestra el cronómetro grande.
- Dolor: molestia muscular es normal; dolor agudo en una articulación (hombro, codo, rodilla, espalda baja) no. Si aparece, cambiar a la alternativa ese día y anotarlo. No se aguanta.
- Semana pesada: si dos semanas seguidas se llega muerto, la siguiente se hacen 2 series por ejercicio con el mismo peso y se retoma. La app lo ofrece, no lo impone.

## 7. Biblioteca de ejercicios

Formato por ejercicio: cómo ubicar el equipo, colocación, técnica, errores, y tres alternativas con el mismo patrón de movimiento: **sin banco/máquina**, **equipo ocupado** y **para cuando el peso ya no alcanza**. Cada alternativa lleva su propio registro de peso. En la sesión, "Cambiar" abre las alternativas de ese ejercicio y el cambio queda anotado.

Regla para elegir alternativa: primero la que use el mismo equipo, luego la que use mancuernas, luego la de peso corporal. Nunca se salta el patrón; si no hay forma de empujar horizontal, se hacen lagartijas, no se salta el pecho.

### Calentamiento y cierre (ambas sesiones)

- Abrir: elíptica 7 min, ritmo en el que puedes platicar. Corta: 4 min. Si la elíptica está ocupada: caminadora inclinada 7 min o saco suave.
- Cerrar: elíptica o saco, 12 a 15 min. Saco: 4 rounds de 2 min con 1 de descanso. Corta: 5 min. Bonus: 20 min.

### Sesión A

**A1. Press de banca plano con mancuernas** · 3 × 8-10 · descanso 90 s
Ubicar: cualquier banco plano libre; se lleva las mancuernas al banco.
Colocación: sentado en la orilla con las mancuernas sobre los muslos, impulsar una a la vez con la rodilla al acostarse. Pies firmes, espalda alta pegada, omóplatos juntos y abajo.
Técnica: bajar en 2 segundos hasta que los codos queden a la altura del pecho o poco más abajo; empujar hasta arriba sin chocar las mancuernas. Codos a unos 45° del cuerpo.
Errores: rebotar abajo, arquear la espalda baja de más, subir hacia la cara, abrir codos a 90°.
Alternativas:
- Sin banco: press en el piso con mancuernas (acostado en el piso, mismas reps; la amplitud es menor y es más seguro para el hombro).
- Ocupado: máquina de press de pecho sentado (asiento con respaldo, dos manijas a la altura del pecho que se empujan al frente; ajustar el asiento para que las manijas queden a la altura de los pezones), 3 × 10-12.
- Sin mancuernas suficientemente pesadas: lagartijas con los pies sobre el banco, 3 × al tope con 2 guardadas.

**A2. Jalón al pecho en polea** · 3 × 10-12 · descanso 75 s
Ubicar: torre alta con asiento, cojines para trabar las rodillas y una barra ancha colgando arriba. Es la misma estación que tiene la polea baja para remo.
Colocación: rodillas trabadas bajo el cojín, agarre un poco más ancho que los hombros, palmas al frente. Pecho arriba, inclinación mínima hacia atrás.
Técnica: jalar la barra hasta la parte alta del pecho llevando los codos abajo y atrás; pausa corta; soltar controlado hasta estirar del todo.
Errores: jalar detrás de la nuca, columpiarse, jalar con los brazos en vez de con los codos, no estirar arriba.
Alternativas:
- Sin máquina: remo con mancuerna a una mano apoyando rodilla y mano en el banco (espalda plana, jalar el codo hacia la cadera), 3 × 10-12 por lado.
- Ocupado: dominadas asistidas si hay máquina (plataforma para las rodillas con contrapeso), 3 × 8-10; si no, la alternativa de arriba.
- Cuando el peso ya no alcanza: dominadas asistidas con menos contrapeso.

**A3. Sentadilla goblet** · 3 × 10-12 · descanso 90 s
Ubicar: una mancuerna; hacerla frente a un espejo si se puede.
Colocación: mancuerna vertical pegada al pecho, sujeta por la cabeza de arriba con las dos manos. Pies al ancho de hombros, puntas un poco hacia afuera.
Técnica: bajar como si te sentaras, rodillas siguiendo la dirección de los pies, hasta que los muslos queden al menos paralelos. Pecho arriba, talones pegados. Subir empujando el piso.
Errores: talones despegándose, rodillas cerrándose hacia adentro, encorvarse, bajar poco.
Alternativas:
- Peso no alcanza (la mancuerna más pesada ya sale fácil): pasar a prensa de pierna (ver B3) o sentadilla con dos mancuernas a los costados, 3 × 10-12.
- Sin mancuernas libres: sentadilla a un banco con peso corporal, bajando hasta tocar el banco sin sentarse, 3 × 15.
- Rodilla molesta: prensa con recorrido corto.

**A4. Press militar sentado con mancuernas** · 3 × 8-10 · descanso 90 s
Ubicar: banco con respaldo ajustable, ponerlo casi vertical (un clic antes de 90°).
Colocación: mancuernas a la altura de las orejas, palmas al frente, espalda baja pegada, abdomen apretado.
Técnica: empujar hacia arriba hasta estirar sin trabar los codos; bajar controlado a la altura de las orejas. Las mancuernas suben en línea, no hacia adelante.
Errores: arquear la espalda, bajar de más, impulso con las piernas.
Alternativas:
- Sin banco con respaldo: press militar de pie con mancuernas, mismas reps, un poco menos de peso, glúteos y abdomen apretados.
- Ocupado: máquina de press de hombro (asiento con manijas a la altura de los hombros que se empujan hacia arriba), 3 × 10.
- Hombro molesto: press con agarre neutro (palmas mirándose), mismo rango.

**A5. Curl con barra Z** · 2 × 10-12 · descanso 60 s
Ubicar: barra Z (la ondulada corta) con discos, o las fijas si el gym las tiene.
Técnica: de pie, codos pegados y quietos, subir doblando solo los codos, apretar arriba, bajar en 2 segundos hasta estirar.
Errores: balancear, codos hacia adelante, no bajar completo.
Alternativas:
- Sin barra: curl alternado con mancuernas, 2 × 10-12 por brazo.
- Ocupado: curl en polea baja con barra recta, misma estación del jalón.

**A6. Extensión de tríceps en polea alta** · 2 × 12 · descanso 60 s
Ubicar: la polea alta de la torre del jalón, con barra recta corta o cuerda.
Técnica: de pie, codos pegados a los costados; empujar hasta estirar, subir controlado hasta que los antebrazos queden paralelos al piso. Solo se mueven los antebrazos.
Errores: abrir codos, inclinarse y empujar con el cuerpo.
Alternativas:
- Sin polea: extensión sobre la cabeza con una mancuerna a dos manos, sentado en banco con respaldo, 2 × 12.
- Ocupado: fondos en banco (manos en la orilla del banco, pies al frente, bajar doblando codos), 2 × 12-15.

**A7. Plancha** · 3 × 40 s · descanso 45 s
Técnica: antebrazos en el piso, codos bajo los hombros, cuerpo en línea recta, glúteos y abdomen apretados, mirada al piso, respirar.
Errores: cadera caída o levantada, contener la respiración.
Alternativas: plancha con rodillas apoyadas (misma duración) si no se sostiene; dead bug (boca arriba, extender brazo y pierna contrarios sin despegar la espalda baja), 3 × 10 por lado, si el piso está ocupado o sucio.

### Sesión B

**B1. Press inclinado con mancuernas** · 3 × 10 · descanso 90 s
Ubicar: banco con respaldo ajustable a 30° (uno o dos clics arriba de plano). Más de 45° ya es hombro.
Colocación y técnica: igual que A1, bajando hasta la parte alta del pecho y empujando arriba y un poco atrás.
Errores: banco muy inclinado, codos abiertos, rebotar.
Alternativas:
- Sin banco ajustable: press plano (A1) ese día.
- Ocupado: máquina de press inclinado si existe; si no, lagartijas con los pies en el banco, 3 × al tope con 2 guardadas.

**B2. Remo sentado en polea baja** · 3 × 10-12 · descanso 75 s
Ubicar: la polea baja de la torre del jalón, con el agarre en V (dos manijas juntas). Hay gyms que tienen una máquina de remo aparte con plataforma para los pies; sirve igual.
Colocación: pies en la plataforma o firmes en el piso, rodillas apenas dobladas, espalda recta, brazos estirados al frente.
Técnica: jalar el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos; pausa; soltar controlado hasta estirar sin encorvarse.
Errores: mecerse con el torso, encoger hombros, jalar hacia el pecho alto.
Alternativas:
- Sin polea: remo con mancuerna a una mano apoyado en banco (ver A2 alternativa), 3 × 10-12 por lado.
- Ocupado: máquina de remo con pecho apoyado (asiento, cojín al frente donde se apoya el pecho, manijas que se jalan), 3 × 10-12.
- Peso no alcanza en polea: mismo ejercicio con pausa de 2 segundos atrás.

**B3. Prensa de pierna** · 3 × 12 · descanso 90 s
Ubicar: máquina grande con asiento reclinado y una plataforma metálica inclinada arriba para los pies, con palancas de seguridad a los lados. Se cargan discos en los brazos laterales.
Colocación: pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados al asiento. Soltar los seguros con las piernas ya estiradas.
Técnica: bajar controlado hasta unos 90° en las rodillas; empujar sin trabar las rodillas arriba.
Errores: despegar la cadera del asiento (bajar de más), trabar rodillas, bajar poco, no poner los seguros al terminar.
Alternativas:
- No se ubica o está ocupada: sentadilla goblet (A3), 3 × 10-12.
- Peso no alcanza en goblet: sentadilla con dos mancuernas a los costados.
- Sin nada libre: sentadilla a un banco con peso corporal, 3 × 15-20.

**B4. Elevaciones laterales** · 3 × 12-15 · descanso 60 s
Ubicar: mancuernas ligeras (empezar con las que parezcan poca cosa).
Técnica: de pie, mancuernas a los costados, codos apenas doblados, subir a los lados hasta la altura de los hombros, bajar en 2 segundos.
Errores: impulso, pasar de los hombros, encoger hombros.
Alternativas:
- Impulso incontrolable: hacerlas sentado en la orilla del banco.
- Sin mancuernas chicas: en polea baja a una mano, cruzando el cable frente al cuerpo, 3 × 12-15 por lado.

**B5. Curl martillo** · 2 × 12 · descanso 60 s
Técnica: palmas mirándose todo el recorrido, codos pegados, subir, apretar, bajar controlado.
Alternativas: curl con cuerda en polea baja, 2 × 12; curl alternado con mancuernas si no hay polea.

**B6. Elevación de piernas acostado** · 3 × 12 · descanso 45 s
Ubicar: banco plano, acostado boca arriba, manos agarrando el banco detrás de la cabeza.
Técnica: espalda baja pegada, subir las piernas casi estiradas hasta la vertical, bajar controlado sin que la espalda baja se despegue.
Errores: arquear la espalda, bajar con impulso.
Alternativas: en el piso con las manos bajo los glúteos; elevación de rodillas dobladas si cuesta; dead bug (A7) si no hay banco ni piso limpio.

### Versión corta (45 min)

Calentamiento 4 min, ejercicios 1 a 4 de la sesión con 2 series cada uno, cierre 5 min. Cuenta completa. Se activa sola por horario o a mano.

## 8. Registro y progresión

- Por serie: peso y reps, teclado numérico, peso precargado con el de la última vez en ese ejercicio (o su alternativa, cada uno con su historial).
- **Doble progresión:** si la última vez se alcanzó el tope del rango en todas las series, la app sugiere subir de peso y lo muestra con el color de estado "fuerte". El salto lo captura el usuario (siguiente par de mancuernas, siguiente placa).
- Si no se alcanzó el tope: repetir peso.
- Si dos sesiones seguidas bajaron las reps con el mismo peso: sugerir bajar un escalón, sin comentario.
- **Regla de las 4 semanas:** al acumular 4 semanas cumplidas, la app propone pasar A1, A2, B1 y B2 de 3 a 4 series. Aceptar o posponer.
- Cronómetro de descanso: arranca solo al guardar una serie con el tiempo del ejercicio; saltable; vibración y beep corto al terminar.
- Fin de sesión: resumen en una pantalla (tiempo, series, ejercicios donde subió de peso, alternativas usadas) y botón "Terminar". Sin calificaciones.

## 9. Progreso

- Semana actual: X/3 con los días marcados.
- Historial de semanas como tráfico nocturno (sección 3).
- Por ejercicio: peso máximo por sesión, últimas 12 sesiones; alternativas en línea aparte.
- Peso corporal: una vez por semana en ayunas, mismo día (default domingo). Gráfica de 12 semanas. Sin meta de peso.
- Foto: cada 2 semanas, misma ropa, de frente. Blob en IndexedDB, cuadrícula con fecha. La app recuerda cuándo toca.

## 10. Ilustraciones

- Nada sacado de internet.
- Una ilustración por ejercicio y por alternativa: SVG plano, contorno oscuro, dos posiciones (inicio y final) en el mismo cuadro, cuerpo simplificado sin cara detallada, sobre el fondo oscuro de la app con el color de estado como acento. Generarlas desde Claude Code como SVG o con un generador de imagen y luego vectorizar.
- Después, opcional: fotos del usuario en el club con el mismo encuadre.

## 11. Pantallas

1. **Hoy** (protagonista: la sesión que toca). Arriba: "Te toca A", estado de tiempo de hoy en color de temperatura, X/3. Botón grande "Empezar". Botón chico "Lunes con Frida: hecho". Entrada opcional "Salgo a las ___".
2. **Sesión** (pantalla completa, sin tabs). Un ejercicio por pantalla: ilustración grande, nombre, series con peso y reps, sugerencia, cronómetro. Botones: "Cambiar" (alternativas), "Técnica" (hoja deslizable con ubicación, colocación, técnica y errores), siguiente / anterior. Cambio a corta discreto. Wake Lock activo.
3. **Progreso**. Semanas, ejercicios, peso corporal, fotos.
4. **Rutina**. Consulta de A y B con todo el detalle de la sección 7 y sus alternativas. No editable en v1.
5. **Ajustes**. Horas tope, minutos carretera y casa-club, día de pesaje, exportar/importar, tema (dark default, claro en crema si se quiere).

## 12. Modelo de datos

- `exercise`: id, nombre, sesión (A/B), orden, ubicar, colocación, técnica[], errores[], series, repsMin, repsMax, descansoSeg, alternativas[] (cada una con id propio y misma estructura), ilustración.
- `session`: id, fecha, tipo (A/B/FRIDA), versión (completa/corta/bonus), inicio, fin, terminada.
- `setLog`: sessionId, exerciseId (o alternativaId), numSerie, pesoKg, reps.
- `bodyweight`: fecha, kg.
- `photo`: fecha, blob.
- `settings`: horaTope (21:10), horaCompleta (20:05), horaCorta (20:25), minCarretera (60), minCasaClub (30), diaPesaje, seriesExtra (bool), tema.

## 13. Lo que NO hay que hacer

- No agregar ejercicios fuera de la sección 7. En especial no pájaros (reverse fly), remo de pie con barra, peso muerto ni press francés.
- No onboarding largo, tutoriales, rachas con fuego, badges, frases motivacionales ni push en v1.
- No cuenta, correo ni permisos innecesarios.
- No "semana no cumplida" como regaño.
- No look de plantilla: nada que contradiga el Anexo A.

## 14. Criterios de que quedó bien

- Se instala desde Safari y abre sin barra de navegación; funciona sin internet.
- Al abrir dice qué sesión toca y si hay tiempo, sin tocar nada.
- Registrar una serie: dos toques y un número.
- Cambiar a una alternativa: un toque, y el peso de esa alternativa se recuerda por separado.
- Con datos de prueba de 4 semanas, se disparan bien la sugerencia de subir peso y la regla de 4 semanas.
- No se pierde nada al cerrar Safari ni al reiniciar.
- La pantalla no se apaga a media sesión.
- Puesta junto a una captura de Dribbble, no se parece.

---

# Anexo A: Mi identidad visual (texto del usuario, aplicar tal cual)

Antes de proponerme cualquier diseño, interfaz, imagen, personaje u objeto, quiero que entiendas cómo veo las cosas. Mi estética se puede resumir como **retrofuturismo editorial cálido**: nostalgia tecnológica filtrada por diseño contemporáneo, con surrealismo cotidiano, gráfica naïf, dark mode y humor seco. No es un género cerrado ni un disfraz de época. Es una combinación personal que tiene que sentirse coherente.

La frase que mejor lo resume es: **un sistema serio que conserva la capacidad de jugar.**

## De dónde viene

Soy ingeniero. Pienso en sistemas, categorías, retículas y relaciones, y disfruto traducir información compleja a algo claro. Pero siento el color, la música, la luz y los objetos con mucha intensidad. Mi identidad está justo en que esas dos cosas no están separadas. No quiero que la claridad implique esterilidad ni que la personalidad implique caos.

Por eso todo lo que me gusta vive en tensiones: precisión y juego, profundidad y energía, geometría y vida orgánica, tecnología e intimidad, abundancia y criterio, nostalgia y futuro, buen gusto y tontería. Puedo apreciar una composición muy sofisticada y también un sol chueco con patitas dibujado a mano. Ese humor es lo que evita que la estética se vuelva pretenciosa.

Me gusta lo cálido pero no lo cursi, lo tecnológico pero no lo corporativo, lo juguetón pero no lo infantil, lo tierno pero tratado de forma adulta, cool y editorial.

## Las tres capas de época

No quiero retro literal. Cada época aporta algo específico y todo tiene que pasar por un filtro contemporáneo.

**De los 70** tomo la materialidad y la forma: curvas largas y continuas, cápsulas, domos, arcos, superficies lacadas, madera oscura, textiles densos, acrílico, cromo, interiores cálidos y habitables. La sensación de un futuro doméstico imaginado con optimismo. No quiero cascos espaciales, planetas, tipografía de ciencia ficción ni que algo parezca tienda de muebles setenteros.

**De finales de los 90 y principios de los 2000** tomo la tecnología con personalidad: gadgets, plástico translúcido de color, la época GameCube y Nintendo, aparatos que parecían objetos con carácter y no herramientas neutras, robots pequeños, pantallas que se sentían personales. No quiero un disfraz Y2K ni vaporwave.

**De los 2020** tomo la manera de componer: diseño editorial contemporáneo, Pinterest bien curado, gráfica indie, recortes tipo Matisse, serigrafía, doodles, símbolos simples, moda con referencias vintage, dark mode, grano fotográfico. Esta capa es la que le da orden y actualidad a las otras dos.

## Color

Mi color es el naranja, pero no como color de marca puesto en todos lados. Es el elemento vivo: calor, actividad, presencia, música, cuerpo, ciudad, luz. Tiene que sentirse como algo que se enciende. Me gustan sus variantes quemadas, coral, mandarina, ámbar y rojo anaranjado.

El naranja funciona porque vive dentro de fondos fríos y profundos. Los azules son el espacio mental: azul noche, navy, cobalto, ultramar, petróleo. Tienen que sentirse densos, atmosféricos y nocturnos, nunca como el azul genérico de app tecnológica. El teal o cyan aparece como luz fría puntual, agua o pantalla.

Luego hay colores de apoyo con funciones claras. El crema cálido es claridad, lectura y respiro. El negro cálido, café muy oscuro o negro azulado sirve para marcos y estructura. El verde olivo o vegetal habla de cuerpo, recuperación y equilibrio. Como acentos ocasionales: amarillo solar, rosa cálido, violeta eléctrico o violeta sucio, y plata o gris metálico muy puntual.

Prefiero dark mode casi siempre. Como proporción aproximada: mayoría de azul profundo y negro cálido, crema donde hay que leer, y el naranja en poca superficie pero con mucha intensidad. Los acentos se reservan para momentos especiales. Cada color tiene una función, nada aparece sólo porque se ve bonito.

## Forma

Prefiero siluetas claras e ideas simples antes que exceso de detalle. Rectángulos redondeados con proporciones sólidas, cuerpos compactos, cápsulas, círculos, arcos, marcos oscuros que contienen color o luz, módulos grandes en lugar de muchas tarjetas pequeñas. Retículas claras con una o dos rupturas deliberadas, pequeñas asimetrías intencionales y contraste entre geometría controlada y algo orgánico, como una planta vista como masa o sombra.

Las cosas tienen que parecer diseñadas como un objeto completo, no como componentes genéricos juntados dentro de una tarjeta. Una interfaz puede componerse como un interior: una masa principal, zonas de actividad, pausas y recorridos.

## Material y luz

La luz es probablemente lo más importante. No ilumina parejo: atraviesa, rebota, colorea, recorta y revela. Me gustan los espacios oscuros donde existe una luz pequeña pero suficiente.

Los materiales que me atraen son los que transforman la luz: acrílico translúcido, vidrio coloreado, plástico moldeado, cromo, superficies lacadas, papel impreso, pantallas luminosas. En digital eso se traduce en bloques de color superpuestos, transparencias delimitadas, bordes oscuros, reflejos mínimos, grano muy sutil y profundidad construida con color, no con sombras genéricas. Nada de glassmorphism por todos lados ni tarjetas borrosas flotando sobre degradados.

## Imperfección humana

Quiero que las cosas tengan alma. Me gusta la pincelada, el acrílico, la impresión, el grano, la fotografía encontrada, el Photoshop amateur bien resuelto, el desgaste controlado, una línea ligeramente irregular o un gesto inesperado. Prefiero una imperfección con carácter a una perfección sin alma, siempre sin sacrificar claridad.

## Tipografía

La base es una sans serif clara, compacta y ligeramente geométrica, sin exagerar lo futurista. Se acompaña con números grandes y expresivos, una monoespaciada sólo para datos como tiempo o repeticiones, etiquetas pequeñas con sensación de catálogo, y a lo mucho un gesto tipográfico raro en títulos. La personalidad no debe depender de una fuente retro.

## Imagen y fotografía

Ciudad nocturna, luces desenfocadas por velocidad, tráfico en exposición larga, reflejos, agua intensamente azul con puntos cálidos, color proyectado sobre piel o superficies, plantas como masas o sombras, interiores vividos, detalles cotidianos convertidos en composiciones abstractas, textura analógica, cuerpos reales en acción recortados de forma gráfica. Encuadres editoriales, cercanos y un poco extraños. Nada aspiracional ni publicitario.

## Ilustración y personajes

Me atraen objetos o personajes con una sola anomalía memorable: un pez con tenis, un robot pequeño viviendo en una computadora, una bolsa transparente con un pez, un objeto cotidiano ligeramente surrealista. Ilustración plana con contornos oscuros, formas simples, textura de impresión, símbolos ingenuos. Surrealismo pequeño y cotidiano, nunca épico.

Tengo afinidad con peces, agua, bolsas transparentes, reflejos, bolas disco, robots pequeños, animalitos, objetos tecnológicos y transparencias. Pero no deben aparecer juntos como collage de "cosas que representan a Fer" ni usarse como stickers. Sólo cuando realmente mejoran el concepto. Si se quitan todas esas referencias literales, lo que se diseñe tiene que seguir sintiéndose mío.

## Movimiento y sonido

El movimiento debe ser rítmico, físico y preciso: una luz que se enciende, una cinta que avanza, una aguja que encuentra una frecuencia, un aparato que despierta, una superficie que cambia de temperatura, paneles que se deslizan con peso. Inercia y cadencia. Nada de rebotes elásticos gratuitos, confeti, explosiones o brillos de casino.

Si hay sonido: golpes sintéticos cálidos, clics mecánicos, bajos suaves, señales cortas. Nada de campanitas zen ni fanfarrias de videojuego. La vibración confirma acciones importantes, no premia cada toque.

## Tono y lenguaje

Directo, observador, cálido sin ser maternal, con humor seco, casual y un poco absurdo. Nada de frases motivacionales, espiritualidad algorítmica ni promesas de transformación. Algo como "Tienes 18 minutos. Alcanza para algo bueno" o "Hoy vienes bajo de energía. Le bajamos, no lo cancelamos" está en el tono correcto. "¡Vamos, campeón!" o "Desbloquea tu mejor versión" no.

## Lo que no soy

Minimalismo beige de wellness, gym bro negro y rojo, tecnología de azul neón sobre negro, cyberpunk, steampunk, vaporwave por defecto, armaduras sci-fi, estética Marvel, Pixar genérico, Funko, mascota corporativa cute, anime genérico, render 3D demasiado pulido, hiperrealismo innecesario, iluminación cinematográfica genérica, exceso de greebles, paneles, costuras y reflejos, maximalismo de elementos flotantes sin jerarquía, ilustración adorable aplicada a todo, e interfaces que parecen salidas de un solo prompt de Dribbble. En general, cualquier cosa que huela a AI slop o a diseño hecho para demostrar que es creativo.

## Aplicado a la app de ejercicio (en proceso)

Todavía sin nombre, ícono ni mascota definidos. La idea es que se sienta como un instrumento personal que organiza el movimiento según el tiempo, la energía y el espacio que realmente tengo hoy. No un entrenador que grita, no una red social, no un videojuego de puntos.

La intensidad se expresa como temperatura de color: reposo en azul oscuro, preparación en crema u olivo, actividad moderada en ámbar, esfuerzo alto en naranja saturado, picos en rojo anaranjado puntual. La interfaz entera cambia de estado, sin iconos de fuego. El progreso es una superficie que se llena o calienta, no anillos por default. El historial puede leerse como tráfico nocturno: sesiones como puntos de luz, duración como longitud, intensidad como saturación, recuperación como espacio entre señales. No se castiga romper rachas, sólo hay un intervalo más largo. La recuperación tiene su propio estado visual, apagado y cálido, sin lenguaje de culpa. Cada pantalla tiene un solo protagonista, los controles son grandes y táctiles como de un objeto bien construido, y los momentos más raros o juguetones se reservan para que conserven su efecto.

## Reglas finales

La calidez viene de la luz, no de la decoración. El color comunica estado. El maximalismo está en la composición total, no en el ruido. La nostalgia vive en proporciones, materiales y ritmo, no en objetos retro. La personalidad se expresa con comportamiento y lenguaje. Cada animación comunica algo o se elimina. Más concepto, silueta y personalidad; menos detalle gratuito. Si dudas entre algo más complejo o más simple, elige lo más simple y mejor diseñado.

La prueba definitiva: algo hecho para mí debería sentirse como una imagen que yo habría guardado en Pinterest antes de saber que estaba hecha para mí. No tiene que representar todos mis gustos, tiene que poder existir por sí mismo y después encajar perfectamente conmigo.
