# RUTINA-FINAL.md · versión 6 (8 oct 2026)

Para Claude Code. Este archivo es la única fuente de verdad de la rutina de FM y lo autoriza Fer. Sustituye completas a todas las versiones anteriores (29 sep y versiones 2 a 5). Sale de lo que Fer vivió en el gym el 7 oct, de cómo es su gym y de que Frida cambió su rutina de los lunes. Donde choque con BRIEF.md, NOTAS o cualquier otra cosa en el repo, manda este archivo. En CLAUDE.md debe seguir la línea: "La rutina, los ejercicios, las alternativas y las fotos salen de RUTINA-FINAL.md".

## 0. Prompt para pegarle a Code

```
Lee RUTINA-FINAL.md (versión 6) en la raíz del proyecto; reemplaza a cualquier versión anterior. Cambió la semana: Frida ya no hace pierna, el día con ella solo se registra, y en el club hay tres sesiones (A, B y C) que la app elige según lo que ya hice en la semana. Si ya implementaste la v3, v4 o v5, ajústala a esta en vez de empezar de cero; lo que no cambia (lb, fotos, registro de sesiones, sección 15) se queda. Orden: 1) semana, registro y elección de sesión de la sección 2, en src/logic con pruebas, con la A del 7 oct ya cargada; 2) sesiones A, B y C por zona, sin pares, con sus alternativas; 3) versión automática, recorte y "Terminar aquí", en src/logic con pruebas; 4) botón "Ocupado: después"; 5) fotos y fichas nuevas; 6) lo que falte de la sección 15. Commits chicos en una rama y sin push hasta que te diga. Al final dime qué cambió, cuánto dura cada sesión según tu cálculo, y enséñame capturas a 390 px de Hoy en un día de club, Hoy en un día de Frida, "Pon al día tu semana", sesión A, sesión B, sesión C y la versión corta.
```

## 1. Qué cambia contra lo que hay en la app

- **Frida ya no es pierna.** Frida cambió su rutina: ahora es espalda, hombro y bíceps, a su ritmo y con su app. En FM ese día solo se registra ("Fui con Frida"); no lleva ejercicios.
- **Semana por sesiones, no por días.** Cada semana tiene tres sesiones base: Frida (o C si no hay Frida), A y B. La app elige cuál toca según lo que ya se hizo esa semana (sección 2).
- **Tres sesiones de club:** A (pecho y pierna), B (torso completo) y C (espalda y hombro, solo en semanas sin Frida).
- **La pierna va siempre en A** y ya no depende de Frida. Se quita toda la lógica de "pierna según Frida".
- **Sin pares.** Todas las series de un ejercicio seguidas y luego el siguiente.
- **Por zona del gym** (sección 3): bancos, poleas y terraza; cada zona se visita una vez por sesión.
- **Cardio:** elíptica al empezar (8 min) y cierre de 10 min en saco o elíptica, a elección de Fer.
- **Duración:** alrededor de una hora, máximo 70 min. Versión corta automática según la hora, recorte si se atrasa y botón "Terminar aquí".
- **Solo ejercicios fáciles con equipo que Fer ubica.** Salen el pec deck, la prensa, la barra Z, la plancha y todo lo "en máquina" que no sea jalón, remo sentado o tríceps con cuerda.

## 2. Semana, registro y elección de sesión

**Contexto de Fer:** el club (Club Britania) cierra los lunes. Frida va normalmente el lunes en Smart Fit, pero a veces se mueve a otro día. Fer va al club de martes a jueves, no siempre los tres. El domingo es comodín. Viernes y sábado casi nunca. Meta: mínimo 3 sesiones por semana; puede haber días extra.

**Sesiones base de cada semana** (lunes a domingo): `FRIDA` (o `C` si esa semana no hay Frida), `A` y `B`. Cuentan para la meta `FRIDA`, A, B y C. `CASA` no cuenta.

**Frida** (en `src/logic`, con pruebas):
1. Cada semana tiene un día de Frida planeado: el lunes, salvo que Fer lo mueva. En Hoy, "Mover Frida" deja elegir otro día de esa semana o "Esta semana no hay".
2. El día planeado, Hoy muestra "Hoy vas con Frida" con "Fui con Frida", "Se movió a…" y "No hubo". "Fui con Frida" registra la sesión `FRIDA` de ese día, sin ejercicios. Se puede agregar una nota opcional.
3. Fer también puede registrar "Fui con Frida" cualquier otro día desde Hoy o Historial; cuenta igual y ese pasa a ser el día de Frida de esa semana.
4. Si el día planeado pasa sin respuesta, la siguiente vez que abra la app, Hoy pregunta "¿Fuiste con Frida el [día]?" con las mismas opciones, antes de armar la sesión.
5. Una semana queda "sin Frida" si Fer marca "Esta semana no hay" o contesta "No hubo". Entonces `C` entra a las sesiones base de esa semana.

**Elección de la sesión de club** (en `src/logic`, con pruebas). Cuando Fer abre Hoy un día de club:
1. Las que faltan son las sesiones base de la semana que todavía no se hacen: A y B siempre, y C solo si la semana está sin Frida.
2. Si falta más de una, el orden es C → A → B (la de espalda primero, luego pecho y pierna, luego torso completo).
3. Para no repetir espalda dos días seguidos: si ayer fue `FRIDA` o C, hoy no se ofrece B ni C mientras falte A. Si Frida está planeada para mañana, hoy no se ofrece B ni C mientras falte A.
4. Si ya se hicieron las tres base, la sesión extra es A o B, alternando con la última que se hizo. C nunca es extra.
5. Domingo: si la semana va en menos de 3, la que falte con las mismas reglas. Si ya van 3, ofrece la extra y deja claro que es opcional.
6. El jueves en la noche, si la semana va en menos de 3, Hoy avisa: "Vas en 2 de 3; el domingo antes de las 3 pm te toca B".
7. Fer siempre puede cambiar la sesión del día con un toque ("Hoy prefiero A"); la elección se recalcula después.

Ejemplos que deben salir así (también van como pruebas):

| Semana | Lun | Mar | Mié | Jue | Dom |
|---|---|---|---|---|---|
| Normal | Frida | A | | B | |
| Con 4 días | Frida | A | B | A (extra) | |
| Frida el martes | | Frida | A | B | |
| Sin Frida | | C | A | B | |
| Faltó a días | Frida | A | | | B |
| Frida el miércoles | | A | Frida | B | |

**Registro de sesiones** (de la v5, sin cambios; en `src/logic`, con pruebas). Tiene que funcionar aunque Fer se olvide de abrir la app, de terminar la sesión o de registrar.
1. Una sola lista de sesiones con fecha, tipo (A, B, C, `FRIDA`, `CASA`), cómo quedó (completa, corta, parcial o registrada sin detalle) y si vino de la app o se registró después. Todo lo demás se calcula de esa lista; no hay contadores guardados aparte.
2. La sesión se cierra sola: una sesión con al menos una serie registrada cuenta como hecha. Se cierra al final del día, al empezar otra o con "Terminar aquí".
3. Días sin registro: al abrir la app, si desde la última sesión pasó un día de gym (martes a jueves, el día de Frida o un domingo de rescate) sin nada, Hoy pregunta una sola vez por cada día: "¿Entrenaste el martes 6?" con "A", "B", "C", "Frida" y "No fui", con la que tocaba ya marcada.
4. Pon al día tu semana: la primera vez que abra esta versión, una pantalla con los días de esta semana hasta hoy y los mismos botones por día. El miércoles 7 oct ya aparece como A.
5. Registrar una sesión hecha sin la app, en Hoy y en Historial: fecha (hoy por defecto, nunca en el futuro) y tipo. Máximo una sesión de club por día: si ese día ya tiene una, ofrece cambiarla en vez de duplicarla.
6. Sin diálogos de confirmación: cada registro muestra "Deshacer" unos segundos. Todo se puede editar o borrar en Historial, y la sesión que sigue se recalcula sola.
7. Carga inicial: si no hay ninguna sesión el 7 oct 2026, se agrega una A registrada después.
8. En Hoy, arriba y en una línea: "Hoy toca B · la última fue A el miércoles 7 · Semana: 1 de 3".

## 3. Zonas, horario y versiones

**Zonas del Club Britania** (lo que Fer conoce y usa):
- **Bancos** (adentro): bancos planos y reclinables, y mancuernas.
- **Poleas:** la máquina de jalón al pecho, la máquina de remo sentado y la polea de pie con cuerda para tríceps.
- **Terraza:** mancuernas, colchonetas y el saco de box.

Cada ejercicio lleva su zona. La sesión se recorre por zonas en orden y cada zona se visita una sola vez. Arriba se ve el recorrido, por ejemplo "Bancos → Poleas → Terraza", y al terminar una zona la app dice a cuál sigue.

- **Calentamiento:** 8 min de elíptica (bici fija si está ocupada). En la corta, 5.
- **Cierre:** 10 min a elección: saco en la terraza (1 min fuerte y 1 min suave, cinco veces) o elíptica. En la corta, 5.
- **Series seguidas:** cada ejercicio se termina completo antes de pasar al siguiente. El descanso corre al tocar la serie.
- **Serie de aproximación:** en el primer ejercicio de la sesión y en el primer press si no es el primero, 10 repeticiones con la mitad del peso. No se registra.
- **Esfuerzo:** 1 o 2 repeticiones en reserva.
- **Duración** (se muestra en Hoy; Code la verifica con su cálculo de 40 s por serie de 8-10, 45 s de 10-12, 50 s de 12-15 y 55 s de 12-20, descansos completos, 1 min entre ejercicios y 2 min al cambiar de zona): A ≈ 53 min, B ≈ 58 min y C ≈ 55 min con calentamiento y cierre. Con los tiempos muertos reales quedan alrededor de una hora; el máximo es 70.
- **Corta (unos 30 min):** calentamiento 5 min; tres ejercicios a 3 series (A: press inclinado, laterales y goblet; B: press plano, laterales y jalón cerrado; C: jalón ancho, press militar y laterales); cierre de 5 min. Cuenta como sesión.
- **Versión automática** (en `src/logic`, con pruebas): al tocar "Empezar", la app toma la hora real y calcula si las pesas de la completa terminan antes de las 21:10 (última pesa; a las 22:00 cierran el agua). Si sí, completa. Si no, y la corta alcanza, corta. Si ninguna alcanza, ofrece `CASA`. Con las duraciones de arriba queda: completa si empieza a las 20:15 o antes, corta hasta las 20:40, después `CASA`. Arriba de la sesión, en una línea: "Empezaste 8:22 · va la corta · terminas pesas 8:50", con un botón para cambiar de versión. En domingo o cualquier día antes de las 7 pm, siempre completa.
- **Recorte en el camino:** si a media sesión la hora proyectada de la última pesa pasa de 21:10, la app quita lo que falta en este orden: abdomen, brazos, aperturas o puente de glúteo. Avisa en una línea qué quitó. Nunca quita el press principal, el jalón, el remo, los laterales ni la goblet.
- **"Terminar aquí":** siempre visible durante la sesión. Cierra la sesión con lo hecho, cuenta para la meta y ofrece el cierre de cardio de 5 min.
- **"Ocupado: después":** manda ese ejercicio al final de su zona; si la zona ya se terminó, al final de la sesión. Cuando le vuelve a tocar y sigue ocupado, ofrece su alternativa (sección 7).

## 4. Sesión A: pecho y pierna · Bancos → Terraza

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Bancos | `press-inclinado` | Press inclinado con mancuernas | 3 × 8-10 | 90 s | peso, lb | Incline_Dumbbell_Press |
| 2 | Bancos | `aperturas-inclinadas` | Aperturas inclinadas con mancuernas | 2 × 12-15 | 60 s | peso, lb | Incline_Dumbbell_Flyes |
| 3 | Bancos | `laterales` | Elevaciones laterales | 3 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 4 | Bancos | `triceps-cabeza` | Tríceps con mancuerna sobre la cabeza, sentado | 2 × 10-12 | 60 s | peso, lb | Seated_Triceps_Press |
| 5 | Terraza | `goblet` | Sentadilla goblet | 3 × 10-12 | 90 s | peso, lb | Goblet_Squat |
| 6 | Terraza | `puente-gluteo` | Puente de glúteo con mancuerna, en colchoneta | 2 × 12-15 | 60 s | peso, lb | Butt_Lift_Bridge (referencia: sin mancuerna) |
| 7 | Terraza | `crunch` | Crunch en colchoneta | 2 × 15-20 | 45 s | corporal | Crunches |

Notas: del 1 al 4 es el mismo banco reclinable: a 30° para el 1 y el 2, casi derecho para el 4. El cierre en saco queda ahí mismo en la terraza.

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

## 5c. Sesión C: espalda y hombro · Poleas → Bancos → Terraza (solo semanas sin Frida)

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

## 15. Calidad de la app (pedido del 1 oct; si ya está, verifícalo y no lo rehagas)

- **iPhone:** nada se corta ni deja de caber. Revisa todas las pantallas a 375×667, 390×844, 393×852 y 430×932, en Safari y como app instalada, con nombres largos, alternativa elegida y foto 4:3: dvh o svh en lugar de 100vh, safe-area-inset-bottom en barras fijas, inputs de al menos 16 px para que no haga zoom y textos que no empujen botones. El botón principal siempre completo y visible. Prueba que falle si un botón principal se sale de la pantalla.
- **Peso por serie:** cada serie con su peso y sus reps; la nueva arranca con el peso de la anterior; botones − y + grandes con el paso del ejercicio; al tocar el número se abre el teclado numérico; cambiar la serie 2 no toca la 1; una serie registrada se puede editar o deshacer.
- **Alternativas completas:** al elegir una cambia todo a ella (nombre, fotos, ficha, series y reps, unidad, sugerencia e historial propio) y con un toque se regresa al original. Prueba que recorra cada ejercicio con cada alternativa y falle si aparece texto o foto del original.
- **FICHAS.md** con todas las fichas, de ejercicios y alternativas, en el formato de la sección 11.
- **Auditoría:** la sesión se retoma exacta si iOS cierra la app; el descanso se calcula por la hora real aunque se bloquee la pantalla; la pantalla no se apaga durante la sesión si el iPhone lo permite; almacenamiento persistente y recordatorio de descargar respaldo cada 2 semanas; botones de al menos 44 px; fotos ligeras sin brincos.
