# RUTINA-FINAL.md · versión 7 (28 oct 2026)

Para Claude Code. Este archivo es la única fuente de verdad de la rutina de FM y lo autoriza Fer. Sustituye a la versión 6 y a todas las anteriores. Sale de dos cambios en la vida de Fer: ahora entrena en la mañana, y con Frida a veces hace pierna y a veces torso, sin aviso. Las sesiones A, B y C no cambian, salvo la nueva "A sin pierna". Donde choque con BRIEF.md, NOTAS o cualquier otra cosa en el repo, manda este archivo. En CLAUDE.md debe seguir la línea: "La rutina, los ejercicios, las alternativas y las fotos salen de RUTINA-FINAL.md".

## 0. Prompt para pegarle a Code

```
Lee RUTINA-FINAL.md (versión 7) en la raíz del proyecto; reemplaza a la v6. Cambió el horario (gym en la mañana) y Frida ahora es pierna o torso según la semana; A, B y C se quedan igual, salvo la nueva "A sin pierna". Parte de la rama pulido (todavía no está en main) y crea la rama mananas. Lo que no cambia se queda: no rehagas nada del pulido ni de la sección 15. Orden: 1) horario de mañana y noche de la sección 3, en src/logic con pruebas; 2) Frida con tipo, sesiones base, A sin pierna y elección de sesión de la sección 2, en src/logic con pruebas (la tabla de ejemplos va completa como pruebas); 3) registro con mañana o noche y "¿Vas en la noche?"; 4) Tu semana en Hoy y los avisos. Commits chicos en la rama y no hagas push sin preguntarme. Al final dime qué cambió, hasta qué hora alcanza la completa y la corta en la mañana y en la noche para A, A sin pierna, B y C según tu cálculo, y enséñame capturas a 390 px de: Hoy martes 6:45 am, Hoy martes 8:30 am sin nada registrado, Hoy lunes en la noche al tocar "Fui con Frida", Tu semana con Frida pierna, Hoy jueves 9:30 pm con el aviso del viernes, y la sesión A sin pierna.
```

## 1. Qué cambia contra lo que hay en la app

- **Gym en la mañana.** Martes y jueves en la mañana en el club. El viernes solo si la semana va corta. El domingo, rescate. La noche (martes a sábado) es el respaldo si no fue en la mañana. El lunes en la mañana hace cardio y en la noche va con Frida a Smart Fit. El miércoles descansa.
- **Horario del club** (clubbritania.org): lunes 7:00 a 11:00; martes a sábado 6:00 a 21:30; domingo 6:00 a 19:00.
- **Versión según la hora, mañana y noche** (sección 3). En la mañana: calentamiento de 5 min, sin cierre de cardio, última pesa ideal 7:40 y tope 8:15, porque a las 8:40 sale del club a la chamba y necesita 25 min de baño.
- **Frida con tipo.** "Fui con Frida" pregunta qué hicieron: Pierna o Torso (espalda, hombro y bíceps, la rutina de la app de ella). Cambia de semana a semana; puede ser cualquier día, en la mañana o en la noche.
- **A sin pierna** (sección 4b) en semanas en que Frida ya fue pierna. **C también es la extra** en esas semanas.
- **Registro con mañana o noche** y tarjeta "¿Vas en la noche?" cuando la mañana se pasó sin sesión.
- **Tu semana en Hoy:** una tira de lunes a domingo con lo hecho y lo que falta, que se recalcula sola. Aviso el jueves en la noche para el viernes. "Pesas extra" es como Fer llama a sus alarmas del viernes; úsalo tal cual.
- **Se quita:** la última pesa única de las 21:10, "a las 22:00 cierran el agua", "en domingo o antes de las 7 pm, siempre completa" y el miércoles como día de gym.

## 2. Semana, registro y elección de sesión

**La semana de Fer:**

| Día | Qué hace | Qué muestra FM |
|---|---|---|
| Lunes | Cardio 25 min en el club en la mañana; Frida en la noche | Mañana: "Hoy: cardio tranqui 25 min y sauna · en la noche, Frida". Noche: Frida |
| Martes | Pesas en la mañana | La sesión que toca |
| Miércoles | Descanso | "Descanso". Si Fer toca Empezar igual, va la que toca y cuenta |
| Jueves | Pesas en la mañana | La sesión que toca |
| Viernes | Sauna; pesas solo si falta una | La que toca si la semana va en menos de 3; si no, "Semana completa · hoy sauna" con opción de extra |
| Sábado | Libre | Nada; si registra algo, cuenta |
| Domingo | Rescate si falta | Como la v6 |

Meta: 3 sesiones por semana; cuentan `FRIDA`, A, B y C. `CASA` no cuenta. Máximo una sesión de club por día, más Frida si cae el mismo día.

**Frida** (en `src/logic`, con pruebas):
1. Día planeado: el lunes, salvo que Fer lo mueva con "Mover Frida", como en la v6.
2. "Fui con Frida" abre dos botones grandes, **Pierna** y **Torso**, sin uno marcado de antemano. Se guarda en la sesión `FRIDA` como `fridaTipo: 'pierna' | 'torso'`, con su nota opcional como hoy. En Historial se puede cambiar y la semana se recalcula.
3. Las `FRIDA` viejas sin tipo cuentan como torso.
4. "No hubo" o "Esta semana no hay": semana sin Frida, como en la v6.
5. Si el día planeado se acaba sin respuesta, Hoy pregunta "¿Fuiste con Frida el lunes?" con Pierna, Torso, "Se movió a…" y "No hubo".

**Sesiones base de cada semana:**
- Frida pierna: `FRIDA`, A y B. La A sale como A sin pierna (sección 4b) si la `FRIDA` pierna ya está registrada antes de esa A. Si Frida se registra como pierna después de una A con pierna, no se cambia nada.
- Frida torso, o Frida planeada para más adelante y todavía sin tipo: `FRIDA`, A y B.
- Sin Frida: C, A y B.

**Elección de la sesión de club** (en `src/logic`, con pruebas):
1. Faltan las base que no se han hecho. Si faltan varias, el orden es C → A → B.
2. Sin espalda dos días seguidos: si ayer hubo `FRIDA` torso o C, hoy no se ofrece B ni C mientras falte A. `FRIDA` pierna no bloquea nada. Si Frida está planeada para mañana y no tiene tipo, cuenta como torso.
3. Extra, cuando ya van las tres base: si la semana tuvo `FRIDA` pierna, la extra es C; si no, A o B, la contraria de la última. Nunca dos C en la misma semana.
4. Domingo, "Hoy prefiero A" y el resto: como en la v6.

Ejemplos que deben salir así (van todos como pruebas):

| Semana | Lun | Mar | Mié | Jue | Vie | Dom |
|---|---|---|---|---|---|---|
| Frida pierna | Frida pierna | A sin pierna | | B | | |
| Frida torso | Frida torso | A | | B | | |
| Sin Frida | | C | | A | B | |
| Frida pierna con extra | Frida pierna | A sin pierna | | B | C | |
| Frida pierna, faltó el martes | Frida pierna | | | A sin pierna | B | |
| Frida torso, faltó el jueves | Frida torso | A | | | B | |
| Martes en la noche | Frida torso | A (noche) | | B | | |
| Frida el miércoles, torso | | A | Frida torso | B | | |
| Sin Frida, sin viernes | | C | | A | | B |

**Registro de sesiones** (lo de la v6 sigue: la sesión se cierra sola, Deshacer sin diálogos, editar o borrar en Historial, nunca en el futuro). Cambia esto:
1. Cada sesión guarda `momento: 'manana' | 'noche'`. En vivo sale de la hora de Empezar: antes de las 12:00 es mañana. Al registrar después, dos botones; por defecto mañana en martes, jueves y viernes, y noche el día de Frida. Las sesiones viejas sin momento se quedan sin él.
2. Días de gym para preguntar "¿Entrenaste el martes 6?": martes, jueves, el día de Frida, el viernes solo si la semana iba en menos de 3, y el domingo si seguía en menos de 3. El lunes en la mañana, el miércoles y el sábado no son días de gym.
3. Nunca se pregunta por un día que no se ha acabado: hasta las 21:30 de ese día todavía puede ir en la noche.
4. **¿Vas en la noche?** De martes a sábado, de las 8:15 a las 21:00, si es día de gym y no hay sesión ese día, Hoy pone arriba "No fuiste en la mañana" con la sesión que toca, la versión que alcanza según la hora a la que salga (usa `estadoSiSalgo`) y tres botones: "Voy en la noche" (se queda como plan del día), "Ya fui" (abre registrar) y "Hoy no" (se guarda en `noFui` y la semana se recalcula).
5. Registrar sesión, en Hoy y en Historial: fecha, mañana o noche, y qué fue: A, B, C, Frida pierna o Frida torso. Una de club por día, como en la v6.
6. Línea de arriba de Hoy: "Hoy toca A sin pierna · Frida fue pierna el lunes · Semana: 1 de 3".

**Tu semana en Hoy** (nuevo):
- Debajo de la línea de arriba, una tira de siete días (L M M J V S D) que cabe completa a 375 px.
- Cada día muestra: lo hecho (la letra, o F con P o T para Frida, y un punto chico si fue en la noche), lo planeado (la letra en contorno), nada en los días sin plan, y hoy marcado.
- El plan sale de acomodar las base que faltan en los días que quedan después de hoy, en este orden de preferencia: martes, jueves, viernes y domingo; Frida en su día planeado; respetando la regla de espalda.
- Tocar un día que ya pasó abre registrar o editar ese día. Los días futuros no hacen nada.
- Se recalcula con cada registro, con cada cambio de tipo de Frida y con "Hoy no".

**Avisos** (una línea en Hoy, sin notificaciones):
- Jueves, cuando ya se hizo la sesión del día o después de las 21:00: si la semana va en menos de 3, "Vas en 2 de 3. Mañana viernes toca B: prende tus alarmas de Pesas extra." Si ya van 3: "Semana completa. Mañana viernes, sauna."
- Viernes y domingo: el aviso de rescate de la v6, con el domingo hasta las 19:00.

## 3. Zonas, horario y versiones

**Zonas del Club Britania** (lo que Fer conoce y usa):
- **Bancos** (adentro): bancos planos y reclinables, y mancuernas.
- **Poleas:** la máquina de jalón al pecho, la máquina de remo sentado y la polea de pie con cuerda para tríceps.
- **Terraza:** mancuernas, colchonetas y el saco de box.

Cada ejercicio lleva su zona. La sesión se recorre por zonas en orden y cada zona se visita una sola vez. Arriba se ve el recorrido, por ejemplo "Bancos → Poleas → Terraza", y al terminar una zona la app dice a cuál sigue.

- **Calentamiento:** 5 min de elíptica o caminadora; 4 en la corta.
- **Cierre:** en la mañana no hay. En la noche y en fin de semana, al terminar se ofrece "Cierre de 10 min (saco o elíptica)" con un botón para saltarlo; no entra en el cálculo de la versión.
- **Series seguidas, serie de aproximación y esfuerzo:** como en la v6.
- **Duración:** con el cálculo que ya tiene la app y sin cierre, unos 47 min de pesas en A, 49 en B y 43 en C, más el calentamiento. Code calcula la de A sin pierna y la reporta.
- **Entre semana en la mañana** (lunes a viernes, empezando antes de las 12:00): la última pesa ideal es a las 7:40 y el tope a las 8:15. Al tocar Empezar: completa si inicio + calentamiento + pesas termina a las 8:15 o antes; si no, corta si cabe; si tampoco, Hoy dice "Ya no alcanza en la mañana" y abre "¿Vas en la noche?". En la mañana no se ofrece `CASA`. Con las duraciones de arriba, la completa alcanza hasta las 7:20 más o menos y la corta hasta las 7:50; Code lo verifica y lo reporta.
- **Línea de la mañana:** "Empezaste 6:47 · completa · terminas pesas 7:36 · sauna hasta 8:40". Si la última pesa pasa de las 7:40: "terminas pesas 7:52 · te quedan 48 min de sauna y baño".
- **Recorte en la mañana:** solo si la última pesa proyectada pasa de las 8:15, en el orden de la v6. Pasar de las 7:40 no recorta nada: lo que se acorta es el sauna.
- **En la noche y en fin de semana:** la última pesa es 15 min antes de que cierre el club: 21:15 de martes a sábado y 18:45 el domingo. El lunes en la tarde el club no abre: no se ofrece sesión de club. Completa, corta o `CASA` y el recorte, como en la v6 pero con estos topes.
- **Ajustes:** "Salida del club en la mañana" (8:40), "Minutos de baño" (25) y "Última pesa en la noche" (21:15). Se quita la de 21:10. El domingo sale solo de la hora de cierre.
- **"Terminar aquí" y "Ocupado: después":** como en la v6.

## 4. Sesión A: pecho y pierna · Bancos → Terraza

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Bancos | `press-inclinado` | Press inclinado con mancuernas | 4 × 8-10 | 90 s | peso, lb | Incline_Dumbbell_Press |
| 2 | Bancos | `aperturas-inclinadas` | Aperturas inclinadas con mancuernas | 2 × 12-15 | 60 s | peso, lb | Incline_Dumbbell_Flyes |
| 3 | Bancos | `laterales` | Elevaciones laterales | 4 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 4 | Bancos | `triceps-cabeza` | Tríceps con mancuerna sobre la cabeza, sentado | 2 × 10-12 | 60 s | peso, lb | Seated_Triceps_Press |
| 5 | Terraza | `goblet` | Sentadilla goblet | 3 × 10-12 | 90 s | peso, lb | Goblet_Squat |
| 6 | Terraza | `puente-gluteo` | Puente de glúteo con mancuerna, en colchoneta | 2 × 12-15 | 60 s | peso, lb | Butt_Lift_Bridge (referencia: sin mancuerna) |
| 7 | Terraza | `crunch` | Crunch en colchoneta | 2 × 15-20 | 45 s | corporal | Crunches |

Notas: del 1 al 4 es el mismo banco reclinable: a 30° para el 1 y el 2, casi derecho para el 4. El cierre en saco queda ahí mismo en la terraza. El press inclinado y los laterales van a 4 series desde el 27 oct (PULIDO-FM.md, 4), con sus alternativas también a 4; en B, C y la corta siguen a 3. Así pecho y hombro lateral llegan a unas 10 series por semana contando a Frida.

## 4b. A sin pierna: pecho y espalda · Bancos → Terraza (semanas con Frida pierna)

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Bancos | `press-inclinado` | Press inclinado con mancuernas | 4 × 8-10 | 90 s | peso, lb | Incline_Dumbbell_Press |
| 2 | Bancos | `aperturas-inclinadas` | Aperturas inclinadas con mancuernas | 3 × 12-15 | 60 s | peso, lb | Incline_Dumbbell_Flyes |
| 3 | Bancos | `remo-pecho-apoyado` | Remo con pecho apoyado en banco reclinable | 3 × 10-12 | 75 s | peso, lb | Dumbbell_Incline_Row |
| 4 | Bancos | `laterales` | Elevaciones laterales | 4 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 5 | Bancos | `triceps-cabeza` | Tríceps con mancuerna sobre la cabeza, sentado | 2 × 10-12 | 60 s | peso, lb | Seated_Triceps_Press |
| 6 | Terraza | `crunch` | Crunch en colchoneta | 2 × 15-20 | 45 s | corporal | Crunches |

Notas: es la A con la goblet y el puente cambiados por el remo y una serie más de aperturas, para no repetir pierna y que la espalda no quede corta esa semana. Del 1 al 3 es el mismo banco reclinable a 30°; en el 3, Fer va boca abajo con el pecho apoyado. En la app se llama "A · pecho y espalda", con la línea "Sin pierna: esta semana la hiciste con Frida". Comparte historial por id con todo lo demás. La alternativa del remo es `remo-mancuerna` (sección 7). Corta: press inclinado, remo con pecho apoyado y laterales. Recorte: abdomen, brazos y aperturas; nunca el press, el remo ni los laterales. Peso inicial de `remo-pecho-apoyado` sin historial: 30 lb por mano (manda sobre la sección 10).

## 5. Sesión B: torso completo · Bancos → Poleas → Terraza

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Bancos | `press-plano` | Press plano con mancuernas | 3 × 8-10 | 90 s | peso, lb | Dumbbell_Bench_Press |
| 2 | Bancos | `laterales` | Elevaciones laterales | 3 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 3 | Poleas | `jalon-cerrado` | Jalón al pecho, manos al ancho de los hombros | 3 × 10-12 | 75 s | peso, lb | Close-Grip_Front_Lat_Pulldown |
| 4 | Poleas | `remo-polea` | Remo sentado en máquina | 3 × 10-12 | 75 s | peso, lb | Seated_Cable_Rows |
| 5 | Poleas | `triceps-polea` | Tríceps con cuerda en la polea de pie | 3 × 10-12 | 60 s | peso, lb | Triceps_Pushdown_-_Rope_Attachment |
| 6 | Terraza | `curl-alternado` | Curl con mancuernas | 2 × 10-12 | 60 s | peso, lb | Dumbbell_Alternate_Bicep_Curl |
| 7 | Terraza | `elevacion-piernas` | Elevación de piernas en colchoneta | 3 × 12 | 45 s | corporal | Flat_Bench_Lying_Leg_Raise |

Notas: el jalón cerrado usa la misma máquina y la misma barra del jalón ancho; solo cambian las manos.

## 5c. Sesión C: espalda y hombro · Poleas → Bancos → Terraza (semanas sin Frida, o la extra en semanas con Frida pierna)

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Poleas | `jalon` | Jalón al pecho, agarre ancho | 3 × 10-12 | 75 s | peso, lb | Wide-Grip_Lat_Pulldown |
| 2 | Poleas | `remo-polea` | Remo sentado en máquina | 3 × 10-12 | 75 s | peso, lb | Seated_Cable_Rows |
| 3 | Bancos | `press-militar` | Press militar sentado con mancuernas | 3 × 8-10 | 90 s | peso, lb | Dumbbell_Shoulder_Press |
| 4 | Bancos | `laterales` | Elevaciones laterales | 3 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 5 | Terraza | `curl-martillo` | Curl martillo | 3 × 10-12 | 60 s | peso, lb | Hammer_Curls |
| 6 | Terraza | `crunch` | Crunch en colchoneta | 2 × 15-20 | 45 s | corporal | Crunches |

## 5b. Por qué así (para que Code no lo "optimice")

- **Cobertura:** con cualquier combinación de las tres base, pecho va 2 veces por semana (A y B), espalda 2 (Frida o C, y B), hombro lateral 3 (Frida o C, A y B), abdomen 2 a 3, bíceps y tríceps unas 5 series cada uno, y pierna 1 (A).
- **Prioridad de Fer:** torso y verse atlético. El hombro lateral y el dorsal hacen la forma de V y la cintura se ve más chica; el press inclinado llena el pecho de arriba; los remos y el jalón mejoran la postura. Nada de abdomen con peso hacia los lados, que ensancha la cintura.
- **Bajar de peso:** la pierna es el músculo más grande y el que más gasta; el cardio de inicio y cierre suma unos 18 min por sesión. Lo que más baja es la comida y los pasos del plan; la rutina hace que lo que se baje sea grasa y no músculo.
- **Si falla un día, no se pierde nada:** cada sesión trabaja varias zonas.
- No agregues series ni ejercicios para "completar": cada sesión tiene que caber en una hora.
- **Con Frida variable (v7):** con cualquier semana, pierna va una vez (Frida o la A), pecho dos (A y B), espalda dos o tres (Frida torso o C, B y el remo de la A sin pierna) y hombro lateral dos o tres.
- **En la mañana:** A, B y C ya caben en unos 50 min de pesas. No agregues series para "aprovechar" el tiempo; si un día no alcanza, manda el recorte.

## 6. Sesión CASA: 12 minutos, opcional

Un minuto de descanso entre series. Es lo único en kg. No cuenta para la meta ni cambia la sesión que sigue.

| # | id | Nombre | Series × reps | Modo | Foto |
|---|---|---|---|---|---|
| 1 | `laterales-casa` | Laterales con mancuernas de 4 a 5 kg | 3 × 15-20 | peso, kg | Side_Lateral_Raise |
| 2 | `lagartijas` | Lagartijas dejando 2 en reserva | 3 series al tope | corporal | Pushups |
| 3 | `remo-liga` | Remo con liga anclada en la puerta | 2 × 12-15 | corporal | Seated_Cable_Rows como referencia, marcada así |
| 4 | `crunch` | Crunch | 2 × 15-20 | corporal | Crunches |

## 7. Alternativas

Reglas: primero "Ocupado: después". Las alternativas solo usan mancuernas, banco, colchoneta o el cuerpo, en la misma zona o en la terraza; nunca "en máquina" a secas ni nada que obligue a buscar aditamentos o a preguntar. A Fer no le gustan los pájaros, los remos de pie ni los ejercicios raros o de técnica difícil. Una alternativa se oculta si su id ya está en la sesión. Si usa el id de otro ejercicio, comparte su historial. Al elegirla cambia todo a ella (sección 15).

**press-inclinado**
- `press-plano` · Press plano con mancuernas · No hay banco reclinable libre
- `press-piso` · Press en el piso con mancuernas, en colchoneta · Bancos ocupados o molestia de hombro · Dumbbell_Floor_Press

**aperturas-inclinadas**
- `aperturas-mancuernas` · Aperturas en banco plano · No hay banco reclinable libre · Dumbbell_Flyes
- `lagartijas` · Lagartijas · Bancos ocupados o molestia de hombro al abrir · Pushups

**laterales**
- `laterales-sentado` · Laterales sentado en la orilla de un banco · Si te balanceas · Seated_Side_Lateral_Raise

**triceps-cabeza**
- `triceps-patada` · Patada de tríceps, apoyado en el banco · Molestia de codo u hombro con el brazo arriba · Tricep_Dumbbell_Kickback (fotos volteadas, sección 8)

**goblet**
- `sentadilla-mancuernas` · Sentadilla con dos mancuernas · La mancuerna pesada está ocupada o ya no alcanza · Dumbbell_Squat

**puente-gluteo**
- Sin mancuerna libre: el mismo ejercicio sin peso y con 20 repeticiones.

**crunch**
- `elevacion-piernas` · Elevación de piernas en colchoneta · Molestia de cuello

**press-plano**
- `press-piso` · Press en el piso con mancuernas · Bancos ocupados
- `lagartijas` · Lagartijas · Sin mancuernas libres (3 series al tope dejando 2) · Pushups

**jalon** y **jalon-cerrado** (máquina de jalón)
- `remo-mancuerna` · Remo a una mano con mancuerna, jalando hacia la cadera · Solo si la máquina sigue ocupada al final · One-Arm_Dumbbell_Row

**remo-polea** (máquina de remo)
- `remo-pecho-apoyado` · Remo con pecho apoyado en banco reclinable · Máquina ocupada · Dumbbell_Incline_Row

**triceps-polea** (polea de pie con cuerda)
- `triceps-cabeza` · Tríceps con mancuerna sobre la cabeza · Polea ocupada
- `triceps-patada` · Patada de tríceps · Te molesta el codo con el brazo arriba

**press-militar**
- `press-militar-pie` · Press militar de pie, mismas mancuernas · No hay banco con respaldo · Standing_Dumbbell_Press

**curl-alternado** y **curl-martillo**
- Cada uno es la alternativa del otro, con las mismas mancuernas.

**elevacion-piernas**
- `crunch` · Crunch en colchoneta · Te jala la espalda baja

**CASA**: sin cambios (`laterales-liga`, `lagartijas-inclinadas`, `lagartijas-pies-banco`, `remo-mancuerna-casa`) y `crunch` → `elevacion-piernas-piso`.

Salen de la rutina y de las alternativas: `curl-z`, `plancha`, `prensa`, `aperturas-maquina`, `cruce-poleas`, `press-pecho-maquina`, `press-inclinado-maquina`, `press-hombro-maquina`, `remo-pecho-maquina`, `remo-alto-maquina`, `laterales-polea`, `curl-polea`, `curl-cuerda`, `dominadas-asistidas`, `fondos-banco`, `remo-polea-una-mano`. Su historial no se borra y se sigue viendo en Historial.

## 8. Fotos

Todo lo de antes sigue: fuente free-exercise-db, pipeline de 720 px, `<ID>.jpg` y `<ID>-2.jpg`, revisión una por una, recorte, precarga en el service worker.

**Descargar nuevas** (verificadas el 7 y 8 oct, existen y corresponden): Incline_Dumbbell_Flyes, Butt_Lift_Bridge, Triceps_Pushdown_-_Rope_Attachment, Crunches, Tricep_Dumbbell_Kickback. Dumbbell_Alternate_Bicep_Curl, Dumbbell_Flyes, Dumbbell_Floor_Press, One-Arm_Dumbbell_Row, Dumbbell_Squat y Goblet_Squat ya deberían estar; si no, descárgalas.

**Revisadas a ojo:**
- Incline_Dumbbell_Flyes: banco reclinable; foto 0 mancuernas juntas arriba (Inicio), foto 1 brazos abiertos (Final). Correcta.
- Butt_Lift_Bridge: puente en colchoneta sin peso. Va con la etiqueta chica "Referencia" porque Fer lo hace con una mancuerna sobre la cadera.
- Goblet_Squat: el modelo usa pesa rusa; la ficha dice mancuerna y está bien así.
- Triceps_Pushdown_-_Rope_Attachment: parado derecho con la cuerda; foto 0 manos al pecho (Inicio), foto 1 brazos estirados (Final).
- Tricep_Dumbbell_Kickback: **fotos al revés**: en la app, "Inicio" es `Tricep_Dumbbell_Kickback-2.jpg` (codo doblado).
- Crunches y Dumbbell_Alternate_Bicep_Curl: correctas.
- No uses los pullover (Straight-Arm o Bent-Arm Dumbbell Pullover) ni Barbell_Glute_Bridge (es con barra).

Prueba existente: recorrer la biblioteca y fallar si falta un archivo. Agrega los ids nuevos.

## 9. Migración

La migración de ids viejos ya corrió; no la cambies ni la vuelvas a correr. Esta versión no renombra nada. Agrega `aperturas-inclinadas`, `puente-gluteo`, `crunch` y `triceps-patada`, y la sesión C. `triceps-polea` conserva su historial aunque cambien la foto y la técnica. Las sesiones `FRIDA` viejas se quedan como están y cuentan igual. Si alguna versión anterior agregó pares, la lógica de "pierna según Frida", `aperturas-maquina` o `cruce-poleas`, se quitan sin borrar datos. La A del 7 oct se carga una sola vez (sección 2).

## 10. Reglas y progresión

- Doble progresión por id: cuando salga el número alto del rango en todas las series, la siguiente vez sube el peso.
- **Unidades:** todo lo del club en lb por defecto. En kg solo lo de CASA (`laterales-casa` y `remo-mancuerna-casa`). En la sesión, un toque cambia kg o lb de ese ejercicio y se queda guardado. Cada serie guarda la unidad en que se registró y se convierte al mostrarla, sin perder el dato original.
- **Incrementos:** en lb de 5 en 5; en kg (CASA) de 1 en 1. Si Fer escribe otro número (12, 17.5), se respeta.
- **Sin regla de 4 semanas:** `CON_SERIE_EXTRA = []`.
- Dolor: molestia muscular sí; dolor agudo en articulación, alternativa.
- **Peso inicial sin historial** (si hay historial, manda el historial; mancuernas por mano): `press-inclinado` 30 lb, `aperturas-inclinadas` 15 lb, `laterales` 10 lb, `triceps-cabeza` 20 lb (una mancuerna a dos manos), `goblet` 45 lb, `puente-gluteo` 35 lb (una mancuerna sobre la cadera), `press-plano` 35 lb, `jalon-cerrado` 80 lb, `remo-polea` 90 lb, `triceps-polea` 40 lb, `curl-alternado` 20 lb, `jalon` 90 lb, `press-militar` 25 lb, `curl-martillo` 20 lb, `aperturas-mancuernas` 15 lb, `remo-pecho-apoyado` 15 lb, `triceps-patada` 10 lb, `remo-mancuerna` 45 lb, `laterales-casa` 4 kg.
- Ajuste dentro de la sesión (texto en la ficha): si la primera serie pasó del número alto con 3 o más en reserva, sube un escalón; si no llegó al bajo, baja uno. Escalón: 5 lb por mano en mancuernas o una placa en máquina.

## 11. Fichas nuevas o que cambian

Formato de FICHAS.md, igual que todas: Para qué · Lo sientes · Prepárate · Movimiento · Imagina · Errores (máximo 2, con su corrección) · Cuidado. De tú, sin jerga. Pesos de arranque en la sección 10. Las fichas de `jalon-cerrado`, `aperturas-mancuernas`, `triceps-cabeza` y `remo-pecho-apoyado` de la v3 siguen igual.

**aperturas-inclinadas** (nueva)
- Para qué: pecho de arriba, el que se nota con playera.
- Lo sientes: arriba del pecho, estirándose al abrir y apretando al cerrar.
- Prepárate: el mismo banco del press inclinado, a 30°. Mancuernas arriba del pecho, palmas viéndose, codos apenas doblados.
- Movimiento: abre en arco en 2 a 3 segundos hasta que las mancuernas queden a la altura del pecho, no más abajo. Sube por el mismo arco hasta juntarlas.
- Imagina: que abrazas un árbol grueso.
- Errores: doblar los codos y hacerlo press, déjalos fijos. Bajar de más, para a la altura del pecho.
- Cuidado: empieza ligero; si molesta el hombro, lagartijas.

**puente-gluteo** (nueva)
- Para qué: glúteo; mejora cómo te queda el pantalón y la postura.
- Lo sientes: en el glúteo, no en la espalda baja.
- Prepárate: acostado en colchoneta, rodillas dobladas y pies firmes al ancho de la cadera; una mancuerna acostada sobre la cadera, sostenida con las dos manos.
- Movimiento: empuja con los talones y sube la cadera hasta que rodillas, cadera y hombros queden en línea. Aprieta el glúteo un segundo arriba y baja en 2 a 3 segundos.
- Imagina: que aprietas una moneda entre los glúteos.
- Errores: arquear la espalda baja para subir más, para en la línea recta. Empujar con las puntas, empuja con los talones.
- Cuidado: si molesta la espalda baja, sin mancuerna y con menos altura.

**goblet** (revisa que diga esto)
- Para qué: piernas y glúteo; es el músculo que más gasta.
- Lo sientes: en los muslos y el glúteo.
- Prepárate: pies un poco más abiertos que los hombros, puntas un poco hacia afuera. Una mancuerna parada, sostenida con las dos manos pegada al pecho.
- Movimiento: baja en 2 a 3 segundos como si te sentaras en una silla baja, con el pecho arriba, hasta que los codos rocen las rodillas o lo más bajo que llegues sin redondear la espalda. Sube empujando el piso.
- Imagina: que separas el piso con los pies.
- Errores: rodillas que se juntan, empújalas hacia afuera. Talones que se despegan, peso en todo el pie.
- Cuidado: si molesta la rodilla, baja menos.

**triceps-polea** (polea de pie con cuerda; de la v5)
- Para qué: tríceps, la parte de atrás del brazo.
- Lo sientes: atrás del brazo, arriba del codo. Si lo sientes en el pecho, te estás echando encima del cable.
- Prepárate: en la polea de pie que ya tiene la cuerda, una punta en cada mano. Un paso atrás, parado derecho, codos pegados a los costados.
- Movimiento: arranca con los antebrazos paralelos al piso y empuja hasta estirar, abriendo las manos abajo. Regresa en 2 a 3 segundos solo hasta 90°.
- Imagina: que tus codos están pegados con cinta a las costillas.
- Errores: echarte encima y empujar con hombro y pecho, párate derecho y baja el peso. Dejar subir las manos a la cara, para en 90°.
- Cuidado: si molesta el codo, tríceps con mancuerna sobre la cabeza.

**curl-alternado**, **crunch**, **triceps-patada**, **remo-polea** y **remo-mancuerna**: como en la v5.

## 12. Seguimiento

Sin cambios: promedio de 7 días del peso, cintura cada lunes, foto cada 2 semanas.

## 13. Lo que no

- Sin frases motivacionales, insignias ni rachas.
- Prohibidos: pájaros, remo de pie con barra, peso muerto y press francés.
- Nada de pares ni circuitos.
- Ningún ejercicio fuera de este archivo. No borrar datos. No tocar el deploy.

## 14. Cómo verificar

- `npm test`, build y e2e en verde.
- Elección de sesión: las seis semanas de la tabla de la sección 2 salen exactamente así. Después de `FRIDA` o C nunca se ofrece B ni C mientras falte A. C solo aparece en semanas sin Frida y nunca como extra.
- Frida: "Fui con Frida" registra sin ejercicios y cuenta para la meta; registrarla otro día la vuelve el día de Frida de esa semana; "No hubo" mete C a la semana.
- Registro: con la A del 7 oct cargada, hoy (jueves 8) toca B. Una sesión con una sola serie cuenta aunque nunca se toque "Terminar". Un día de gym sin registro hace que la app pregunte por él una sola vez. No deja dos sesiones de club el mismo día ni fechas futuras. "Deshacer" revierte el último registro.
- Pon al día tu semana: aparece una sola vez, con los días de la semana hasta hoy y el 7 oct como A.
- Sesiones: A, B y C salen en el orden y zona de las secciones 4, 5 y 5c, sin pares; cada zona se visita una vez.
- Versión automática: empezar a las 20:10 da completa; a las 20:30, corta; a las 20:45, `CASA`; un domingo a las 11 am, completa.
- Recorte: se quita primero abdomen, luego brazos, luego aperturas o puente; nunca el press principal, el jalón, el remo, los laterales ni la goblet.
- "Terminar aquí" cierra la sesión con lo hecho y cuenta.
- "Ocupado: después" manda el ejercicio al final de su zona y, si sigue ocupado, ofrece la alternativa.
- Unidades: todo lo del club abre en lb y CASA en kg.
- Las alternativas nunca repiten un id de la sesión y ninguna dice "en máquina".
- `triceps-patada` muestra la foto de codo doblado como Inicio; `puente-gluteo` lleva la etiqueta "Referencia".
- Cada ejercicio y cada alternativa tiene sus dos fotos.
- Capturas a 390 px de lo que pide la sección 0.
- Commits chicos en una rama. Push solo cuando Fer lo apruebe. Al final, resumen corto de qué cambió.
- **v7, elección de sesión:** las nueve semanas de la tabla de la sección 2 salen exactamente así. `FRIDA` pierna no bloquea B ni C al día siguiente; `FRIDA` torso sí, mientras falte A. La A sale sin pierna solo si la `FRIDA` pierna se registró antes. La extra es C en semanas con Frida pierna y nunca hay dos C.
- **v7, Frida:** "Fui con Frida" no guarda nada hasta elegir Pierna o Torso; las `FRIDA` viejas cuentan como torso; cambiar el tipo en Historial recalcula la semana y Tu semana.
- **v7, horario:** un martes, empezar B a las 6:45 da completa y pesas hasta 7:39 más o menos; a las 7:20, completa; a las 7:30, corta; a las 7:55, "Ya no alcanza en la mañana". El recorte de la mañana no se activa antes de las 8:15. Martes en la noche: 20:15 completa, 20:45 corta, 21:00 `CASA`. Domingo a las 11:00, completa (tope 18:45). Lunes en la tarde no ofrece sesión de club.
- **v7, registro:** cada sesión guarda mañana o noche; no se pregunta por un día antes de que se acabe; el miércoles y el sábado no se preguntan; "Hoy no" recalcula la semana; un martes a las 8:30 sin sesión muestra "¿Vas en la noche?".
- **v7, Tu semana:** cabe a 375 px; muestra hecho, planeado y hoy; el plan coincide con la tabla de la sección 2.
- **v7, avisos:** jueves después de su sesión con 2 de 3 dice "Mañana viernes toca …: prende tus alarmas de Pesas extra"; con 3 de 3, "Semana completa".

## 15. Calidad de la app (pedido del 1 oct; si ya está, verifícalo y no lo rehagas)

- **iPhone:** nada se corta ni deja de caber. Revisa todas las pantallas a 375×667, 390×844, 393×852 y 430×932, en Safari y como app instalada, con nombres largos, alternativa elegida y foto 4:3: dvh o svh en lugar de 100vh, safe-area-inset-bottom en barras fijas, inputs de al menos 16 px para que no haga zoom y textos que no empujen botones. El botón principal siempre completo y visible. Prueba que falle si un botón principal se sale de la pantalla.
- **Peso por serie:** cada serie con su peso y sus reps; la nueva arranca con el peso de la anterior; botones − y + grandes con el paso del ejercicio; al tocar el número se abre el teclado numérico; cambiar la serie 2 no toca la 1; una serie registrada se puede editar o deshacer.
- **Alternativas completas:** al elegir una cambia todo a ella (nombre, fotos, ficha, series y reps, unidad, sugerencia e historial propio) y con un toque se regresa al original. Prueba que recorra cada ejercicio con cada alternativa y falle si aparece texto o foto del original.
- **FICHAS.md** con todas las fichas, de ejercicios y alternativas, en el formato de la sección 11.
- **Auditoría:** la sesión se retoma exacta si iOS cierra la app; el descanso se calcula por la hora real aunque se bloquee la pantalla; la pantalla no se apaga durante la sesión si el iPhone lo permite; almacenamiento persistente y recordatorio de descargar respaldo cada 2 semanas; botones de al menos 44 px; fotos ligeras sin brincos.
