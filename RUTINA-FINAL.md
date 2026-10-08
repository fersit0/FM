# RUTINA-FINAL.md · versión 3 (7 oct 2026)

Para Claude Code. Este archivo es la única fuente de verdad de la rutina de FM y lo autoriza Fer. Sustituye completas a las versiones anteriores (29 sep y versión 2 del 7 oct) y a cualquier mensaje suelto sobre la pierna con Frida. Donde choque con BRIEF.md, NOTAS o cualquier otra cosa en el repo, manda este archivo. En CLAUDE.md debe seguir la línea: "La rutina, los ejercicios, las alternativas y las fotos salen de RUTINA-FINAL.md".

## 0. Prompt para pegarle a Code

```
Lee RUTINA-FINAL.md (versión 3) en la raíz del proyecto; si ahí hay otra versión, reemplázala por esta. Es la única fuente de verdad y manda sobre la versión 2 y sobre cualquier mensaje mío anterior de la pierna con Frida. Aplica lo de la sección 1. Lo que ya esté hecho no lo rehagas, y la migración de la sección 9 no se toca. Orden: 1) pierna con día de Frida y bloques en par, en src/logic con pruebas; 2) sesiones A y B con sus alternativas; 3) unidades en lb; 4) fotos y fichas nuevas; 5) versión corta; 6) lo que falte de la sección 15. Respeta el spec de diseño del repo. Rama nueva, commits chicos y sin push hasta que te diga. Al final dime qué cambió, qué de la sección 15 ya estaba y qué hiciste, cuánto dura cada sesión según tu cálculo, y enséñame capturas a 390 px de Hoy, sesión A, sesión B, una tarjeta de par y la ficha de aperturas-maquina.
```

## 1. Qué cambia contra lo que hay en la app

- **Pierna una vez por semana, con día de Frida movible.** El día de pierna es el día `FRIDA`: lunes por defecto, y se puede mover o cancelar desde Hoy. Mientras la semana tenga Frida hecha o planeada, A y B no traen pierna. Si la semana se queda sin Frida, solo la siguiente sesión completa trae pierna a 3 series (sección 2).
- **Sin redundancias dentro de una sesión.** Cada sesión tiene un jalón y un remo distintos. `remo-mancuerna` sale de B y queda como alternativa; `remo-pecho-apoyado` pasa a A.
- **Entran `aperturas-maquina` y `jalon-cerrado` en B**: forma del pecho, y dorsal dos veces por semana con otro agarre.
- **`triceps-cabeza` pasa a ejercicio principal en B**; en A sigue `triceps-polea`.
- **Bloques en par** (sección 3). Ahorran unos 8 minutos por sesión.
- **Cardio:** 5 min al abrir y 10 al cerrar; 20 solo en bonus; 5 si la sesión trae pierna.
- **Versión corta nueva** (sección 3).
- **Todo lo del gym en lb**, mancuernas y barras incluidas, porque en el club casi todo está en lb. Solo CASA sigue en kg (sección 10).
- **Técnica que coincide con la foto:** `remo-pecho-apoyado` ahora va con codos a unos 45° y `jalon-cerrado` con la barra larga al ancho de los hombros (sección 8).
- **Fichas nuevas en el formato de FICHAS.md** (sección 11).

## 2. Semana

| Día | Qué toca |
|---|---|
| Lunes | `FRIDA`: pierna en Foro 4 (el Club Britania cierra los lunes). Es el día planeado por defecto y se puede mover. |
| Martes a jueves | A o B, la que siga. La alternancia ignora `FRIDA` y `CASA`. |
| Viernes y sábado | Sin gym. No bloquees si Fer registra algo. |
| Domingo | Rescate antes de las 3 pm si el jueves en la noche iba en menos de 3. |

- Meta: 3 sesiones por semana, de lunes a domingo. Cuentan `FRIDA`, A y B.
- Bonus: con 3 hechas, una cuarta opcional: la que sigue, con cierre de 20 min.
- `CASA`: máximo 2 por semana, no cuenta para la meta y no mueve la alternancia. Se ofrece cuando el horario ya no alcanza o en días sin gym. Muestra "llevas X de 2".

**Pierna con Frida** (en `src/logic`, con pruebas):

1. Cada semana tiene un día de Frida planeado: el lunes, salvo que Fer lo mueva. En Hoy, "Mover pierna con Frida" deja elegir otro día de esa semana o "Esta semana no hay".
2. El día planeado, Hoy muestra `FRIDA` en lugar de A o B, con "Sí, fui", "Se movió a…" y "No hubo".
3. Si ese día pasa sin respuesta, la siguiente vez que Fer abra la app, Hoy pregunta "¿Fuiste con Frida el [día]?" con las mismas tres opciones antes de armar la sesión. "Sí, fui" registra `FRIDA` en ese día.
4. Mientras la semana tenga `FRIDA` hecha o planeada a futuro, A y B no traen pierna. Nada la reemplaza; la sesión queda más corta.
5. Si la semana se queda sin Frida ("Esta semana no hay" o "No hubo"), la siguiente sesión A o B completa agrega su pierna a 3 series como bloque 3 (`goblet` en A, `prensa` en B) y el cierre baja a 5 min. Solo una vez por semana. En corta nunca: pasa a la siguiente completa de esa semana. No se arrastra a la semana siguiente.
6. Si ya hubo pierna en A o B y después se registra `FRIDA`, no se cambia nada; solo cuenta para la meta.

## 3. Horario, versiones y bloques en par

- Sin cambios: última pesa 21:10; completa si entra a las 20:05 o antes; corta hasta las 20:25; después no hay gym y se ofrece `CASA`. "Salgo a las" suma 60 min de carretera y 30 de casa al club.
- **Completa:** calentamiento 5 min de elíptica (si está ocupada, bici fija), todos los bloques, cierre de 10 min en elíptica o saco (5 si hubo pierna).
- **Corta (unos 30 min):** calentamiento 4 min; solo los bloques 1, 2 y el par de laterales, cada uno a 2 series; cierre de 5 min. Cuenta como sesión.
- **Bonus:** completa con cierre de 20 min.
- **Serie de aproximación:** en el bloque 1, 10 repeticiones con la mitad del peso. No se registra.
- **Esfuerzo:** 1 o 2 repeticiones en reserva.
- **Par:** dos ejercicios que no compiten por el mismo músculo. Una serie del primero, 15 s para cambiarse, una serie del segundo, y entonces corre el descanso del bloque. Si uno tiene más series, las de más se hacen solas con el mismo descanso. En la sesión se ve como una sola tarjeta con los dos ejercicios, el que toca resaltado, y el cronómetro arranca solo después del segundo. Cada ejercicio conserva su registro, su sugerencia de peso y sus alternativas.
- **Duración estimada** (se muestra en Hoy; Code la verifica con su cálculo): A ≈ 57 min y B ≈ 55 min con calentamiento, cierre, descansos completos y 1 min de transición entre bloques. Con pierna, unos 60.

## 4. Sesión A: pecho alto, dorsal y hombro

| Bloque | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|
| 1 | `press-inclinado` | Press inclinado con mancuernas | 3 × 8-10 (4 con la regla de 4 semanas) | 90 s | peso, lb | Incline_Dumbbell_Press |
| 2 | `jalon` | Jalón al pecho en polea, agarre ancho | 3 × 10-12 (4 con la regla) | 75 s | peso, lb | Wide-Grip_Lat_Pulldown |
| 3* | `goblet` | Sentadilla goblet (solo si toca pierna) | 3 × 10-12 | 90 s | peso, lb | Goblet_Squat |
| 4 | `press-militar` | Press militar sentado con mancuernas | 2 × 8-10 | 90 s | peso, lb | Dumbbell_Shoulder_Press |
| 5 par | `laterales` | Elevaciones laterales | 3 × 12-20 | 60 s tras el par | peso, lb | Side_Lateral_Raise |
| 5 par | `remo-pecho-apoyado` | Remo con pecho apoyado en banco inclinado | 3 × 12-15 | | peso, lb | Dumbbell_Incline_Row |
| 6 par | `curl-z` | Curl con barra Z | 2 × 10-12 | 60 s tras el par | peso, lb | EZ-Bar_Curl |
| 6 par | `triceps-polea` | Extensión de tríceps en polea alta | 2 × 10-12 | | peso, lb | Triceps_Pushdown |
| 7 | `plancha` | Plancha | 3 × 45 s | 45 s | tiempo | Plank |

Notas para la tarjeta del par: el remo con pecho apoyado usa el banco inclinado del bloque 1 (a 30-45°); en el par 6, lleva la barra Z a la polea.

## 5. Sesión B: pecho, espalda media y brazo

| Bloque | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|
| 1 | `press-plano` | Press plano con mancuernas | 3 × 8-10 (4 con la regla) | 90 s | peso, lb | Dumbbell_Bench_Press |
| 2 | `remo-polea` | Remo sentado en polea baja | 3 × 10-12 (4 con la regla) | 75 s | peso, lb | Seated_Cable_Rows |
| 3* | `prensa` | Prensa de pierna (solo si toca pierna) | 3 × 10-12 | 90 s | peso, lb | Leg_Press |
| 4 par | `jalon-cerrado` | Jalón al pecho con agarre cerrado | 2 × 10-12 | 60 s tras el par | peso, lb | Close-Grip_Front_Lat_Pulldown |
| 4 par | `laterales` | Elevaciones laterales (el mismo de A) | 3 × 12-20 | | peso, lb | Side_Lateral_Raise |
| 5 | `aperturas-maquina` | Aperturas en máquina (pec deck) | 2 × 12-15 | 60 s | peso, lb | Butterfly, con las fotos volteadas (sección 8) |
| 6 par | `curl-martillo` | Curl martillo | 2 × 10-12 | 60 s tras el par | peso, lb | Hammer_Curls |
| 6 par | `triceps-cabeza` | Extensión de tríceps con mancuerna sobre la cabeza, sentado | 2 × 10-12 | | peso, lb | Seated_Triceps_Press |
| 7 | `elevacion-piernas` | Elevación de piernas acostado en banco | 3 × 12 | 45 s | corporal | Flat_Bench_Lying_Leg_Raise |

Notas: si el jalón y el remo están en la misma máquina doble, quédate ahí; lleva las mancuernas de laterales. En el par 6 todo va sentado en el mismo banco con respaldo.

## 5b. Por qué así (para que Code no lo "optimice")

Series duras por semana con A y B: pecho 8 (10 con la regla), espalda 11 (13), hombro lateral 6 (12 con dos CASA), hombro de enfrente 2 más todo el press, bíceps 4, tríceps 4, core 6, pierna con Frida o 3 series de mantenimiento. Prioridad de Fer: torso (pecho, dorsal, espalda alta, hombro lateral, core). Los brazos se mantienen y crecen con lo que hay. No agregues series ni ejercicios para "completar".

## 6. Sesión CASA: 12 minutos, opcional

Sin cambios. Un minuto de descanso entre series. Ids propios. Es lo único en kg.

| # | id | Nombre | Series × reps | Modo | Foto |
|---|---|---|---|---|---|
| 1 | `laterales-casa` | Laterales con mancuernas de 4 a 5 kg | 3 × 15-20 | peso, kg | Side_Lateral_Raise |
| 2 | `lagartijas` | Lagartijas dejando 2 en reserva | 3 series al tope | corporal | Pushups |
| 3 | `remo-liga` | Remo con liga anclada en la puerta | 2 × 12-15 | corporal | Seated_Cable_Rows como referencia, marcada así, hasta que Fer suba la suya |
| 4 | `plancha-casa` | Plancha | 2 × 45 s | tiempo | Plank |

## 7. Alternativas

Formato: id · nombre · caso · foto. Si una alternativa usa el id de otro ejercicio, comparte su historial. A Fer no le gustan los pájaros, los remos de pie ni los ejercicios raros o de técnica difícil: no agregues alternativas de ese tipo. Una alternativa se oculta si ese mismo id ya está en la sesión, como ejercicio o como alternativa elegida en otro bloque, para que nunca se repita un movimiento el mismo día. Al elegir una alternativa cambia todo a ella (sección 15).

**press-inclinado**
- `press-inclinado-maquina` · Press inclinado en máquina · Banco ocupado o no hay inclinado · Leverage_Incline_Chest_Press
- `lagartijas-pies-banco` · Lagartijas con los pies en el banco · Sin mancuernas ni máquina (3 series al tope dejando 2) · Push-Ups_With_Feet_Elevated
- `press-piso` · Press en el piso con mancuernas · Molestia de hombro · Dumbbell_Floor_Press

**jalon**
- `dominadas-asistidas` · Dominadas asistidas en máquina o con liga · Polea ocupada (3 × 6-10) · Band_Assisted_Pull-Up. En la máquina asistida más peso es más ayuda: la sugerencia baja el contrapeso, no lo sube.
- `remo-mancuerna` · Remo a una mano · Sin polea · One-Arm_Dumbbell_Row

**goblet**
- `prensa` · Prensa de pierna · Mancuerna pesada ocupada o prefieres máquina
- `sentadilla-mancuernas` · Sentadilla con dos mancuernas · La mancuerna más pesada ya no alcanza · Dumbbell_Squat
- `sentadilla-banco` · Conservar texto y foto actuales

**press-militar**
- `press-militar-pie` · Press militar de pie con mancuernas · No hay banco con respaldo · Standing_Dumbbell_Press
- `press-hombro-maquina` · Press de hombro en máquina · Mancuernas ocupadas · Machine_Shoulder_Military_Press
- `press-militar-neutro` · Press con agarre neutro · Molestia de hombro · Dumbbell_Shoulder_Press

**laterales**
- `laterales-sentado` · Laterales sentado · Si te balanceas · Seated_Side_Lateral_Raise
- `laterales-polea` · Lateral en polea · Mancuernas ocupadas · Cable_Seated_Lateral_Raise
- `laterales-liga` · Laterales con liga · Sin mancuernas · Lateral_Raise_-_With_Bands

**remo-pecho-apoyado**
- `remo-pecho-maquina` · Remo en máquina con pecho apoyado · Banco inclinado ocupado · Leverage_Iso_Row
- `remo-alto-maquina` · Remo alto en máquina · Tampoco está la de remo con pecho apoyado · Leverage_High_Row

**curl-z**
- `curl-alternado` · Curl alterno con mancuernas · Barra ocupada · Dumbbell_Alternate_Bicep_Curl
- `curl-polea` · Curl en polea · Sin barra ni mancuernas · Standing_Biceps_Cable_Curl

**triceps-polea**
- `triceps-cabeza` · Extensión con mancuerna sobre la cabeza, sentado · Polea ocupada · Seated_Triceps_Press
- `fondos-banco` · Fondos en banco · Sin polea ni mancuerna; no usar si molesta el hombro · Bench_Dips

**plancha** y **plancha-casa**
- `plancha-rodillas` · Plancha con rodillas apoyadas · No llegas a 45 s · Plank
- `dead-bug` · Dead bug · Molestia de espalda baja o el piso no ayuda · Dead_Bug

**press-plano**
- `press-pecho-maquina` · Press de pecho en máquina · Banco ocupado · Leverage_Chest_Press
- `press-piso` · Press en el piso con mancuernas · Sin banco
- `lagartijas` · Lagartijas · Sin banco ni mancuernas (3 series al tope dejando 2) · Pushups

**remo-polea**
- `remo-pecho-maquina` · Remo en máquina con pecho apoyado · Polea ocupada · Leverage_Iso_Row
- `remo-mancuerna` · Remo a una mano apoyado en banco · Sin polea · One-Arm_Dumbbell_Row

**prensa**
- `goblet` · Sentadilla goblet · Prensa ocupada o no la ubicas
- `prensa-corta` · Conservar texto y foto actuales

**jalon-cerrado** (nuevo)
- `dominadas-asistidas` · Dominadas asistidas · Polea ocupada
- `remo-polea-una-mano` · Remo sentado a una mano en polea · Solo queda libre la polea baja · Seated_One-arm_Cable_Pulley_Rows

**aperturas-maquina** (nuevo)
- `aperturas-mancuernas` · Aperturas con mancuernas en banco plano · No hay máquina o está ocupada · Dumbbell_Flyes
- `cruce-poleas` · Cruce de poleas de pie · Banco y máquina ocupados · Cable_Crossover
- `press-pecho-maquina` · Press de pecho en máquina · Molestia de hombro al abrir

**curl-martillo**
- `curl-cuerda` · Curl martillo en polea con cuerda · Mancuernas ocupadas · Cable_Hammer_Curls_-_Rope_Attachment
- `curl-alternado` · Curl alterno con mancuernas · Otra opción con mancuernas

**triceps-cabeza** (ahora principal en B)
- `triceps-polea` · Extensión en polea alta · Te molesta el hombro o el codo arriba de la cabeza
- `fondos-banco` · Fondos en banco · Sin mancuerna ni polea; no usar si molesta el hombro

**elevacion-piernas**
- `elevacion-piernas-piso` · Conservar lo actual · Sin banco
- `elevacion-rodillas` · Conservar lo actual · Te jala la espalda baja
- `dead-bug` · Dead bug · Molestia de espalda baja

**CASA** (sin cambios)
- `laterales-casa` → `laterales-liga` · Sin mancuernas
- `lagartijas` → `lagartijas-inclinadas` · Manos en la cama o una mesa firme · Si cuestan · Incline_Push-Up
- `lagartijas` → `lagartijas-pies-banco` · Si ya haces más de 20
- `remo-liga` → `remo-mancuerna-casa` · Remo a una mano apoyado en la cama o una silla · Sin liga · One-Arm_Dumbbell_Row
- `plancha-casa` → `dead-bug`

## 8. Fotos

Todo lo de antes sigue: fuente free-exercise-db, pipeline de 720 px, `<ID>.jpg` y `<ID>-2.jpg`, revisión una por una, recorte, precarga en el service worker.

**Descargar nuevas:** Butterfly, Close-Grip_Front_Lat_Pulldown, Dumbbell_Flyes, Cable_Crossover. Seated_Triceps_Press, Leverage_Iso_Row y One-Arm_Dumbbell_Row ya deberían estar; si no, descárgalas. Verificado el 7 oct: todos los ids existen en `dist/exercises.json` con sus dos fotos.

**Revisadas a ojo el 7 oct (dos veces):**
- Butterfly: es el pec deck correcto, pero **las fotos vienen al revés**: la foto 0 tiene los brazos cerrados y la 1 abiertos. En la app, "Inicio" es la de brazos abiertos (`Butterfly-2.jpg`) y "Final" la de brazos cerrados.
- Close-Grip_Front_Lat_Pulldown: vista de espaldas, **barra larga** con las manos al ancho de los hombros y el torso derecho. La ficha de `jalon-cerrado` ya dice eso. No uses V-Bar_Pulldown: el modelo se echa demasiado para atrás.
- Dumbbell_Incline_Row: boca abajo en banco inclinado con los codos cerca del cuerpo. Por eso la ficha va con codos a unos 45°.
- Cable_Crossover: foto 0 con los brazos abiertos (Inicio) y foto 1 con las manos juntas abajo (Final). Orden correcto.
- Seated_Triceps_Press, Dumbbell_Flyes y Leverage_Iso_Row: correctas.

Prueba existente: recorrer la biblioteca y fallar si falta un archivo. Agrega los ids nuevos.

## 9. Migración

La migración de ids viejos (A1, B4, etc.) ya corrió; no la cambies ni la vuelvas a correr. Esta versión no renombra nada: solo agrega `jalon-cerrado`, `aperturas-maquina`, `aperturas-mancuernas` y `cruce-poleas`. Los historiales de `remo-mancuerna`, `remo-pecho-apoyado`, `triceps-cabeza`, `goblet` y `prensa` se quedan como están y se siguen viendo donde aparezcan.

## 10. Reglas y progresión

- Doble progresión por id: cuando salga el número alto del rango en todas las series, la siguiente vez sube el peso.
- **Unidades:** todo lo del gym en lb por defecto, mancuernas y barras incluidas. En kg solo lo de CASA (`laterales-casa` y `remo-mancuerna-casa`). En la sesión, un toque cambia kg o lb de ese ejercicio y se queda guardado. Cada serie guarda la unidad en que se registró; el historial y la sugerencia se muestran convertidos a la unidad actual, redondeados al paso real, sin perder el dato original.
- **Incrementos:** en lb de 5 en 5; en kg (CASA) de 1 en 1. Si Fer escribe otro número (12, 17.5), se respeta.
- `CON_SERIE_EXTRA = ['press-inclinado', 'jalon', 'press-plano', 'remo-polea']` (sin cambio).
- Semana pesada: todo a 2 series con el mismo peso.
- Dolor: molestia muscular sí; dolor agudo en articulación, alternativa.
- **Peso inicial sin historial** (si hay historial, manda el historial; mancuernas por mano): `press-inclinado` 30 lb, `jalon` 90 lb, `goblet` 45 lb, `press-militar` 25 lb, `laterales` 10 lb, `remo-pecho-apoyado` 15 lb, `curl-z` 45 lb con barra, `triceps-polea` 50 lb, `press-plano` 35 lb, `remo-polea` 90 lb, `jalon-cerrado` 80 lb, `aperturas-maquina` 40 lb, `curl-martillo` 20 lb, `triceps-cabeza` 20 lb (una mancuerna a dos manos), `aperturas-mancuernas` 15 lb, `remo-mancuerna` 45 lb, `laterales-casa` 4 kg.
- `prensa` sin sugerencia. Tanteo en su ficha, en lb: un disco de 45 por lado y 10 repeticiones; si fue fácil, dos por lado; de ahí sube 25 por lado hasta que 12 cuesten.
- Ajuste dentro de la sesión (texto en la ficha): si la primera serie pasó del número alto con 3 o más en reserva, sube un escalón; si no llegó al bajo, baja uno. Escalón: 5 lb por mano en mancuernas o una placa en máquina.

## 11. Fichas nuevas o que cambian

Van en FICHAS.md con el mismo formato que todas: Para qué · Lo sientes · Prepárate · Movimiento · Imagina · Errores (máximo 2, cada uno con su corrección) · Cuidado. Máximo 80 palabras, de tú, sin jerga. Los pesos de arranque van en la sección 10, no en la ficha. Si FICHAS.md todavía no existe, créalo con este formato para todos los ejercicios y alternativas (sección 15).

**remo-pecho-apoyado** (cambia)
- Para qué: espalda media y alta; endereza la postura.
- Lo sientes: entre los omóplatos.
- Prepárate: banco a 30-45°, pecho apoyado, barbilla por fuera del respaldo, pies firmes. Mancuernas colgando, palmas viéndose.
- Movimiento: jala los codos atrás, a unos 45° del cuerpo, hasta pasar la línea de la espalda. Aprieta un segundo y baja en 2 a 3 segundos.
- Imagina: tus manos son ganchos y jalas con los codos.
- Errores: despegar el pecho, baja el peso. Encoger los hombros, bájalos antes de jalar.
- Cuidado: si molesta la espalda baja, remo en máquina con pecho apoyado.

**jalon-cerrado** (nueva)
- Para qué: dorsal, la forma de V de la espalda.
- Lo sientes: a los costados, abajo de las axilas.
- Prepárate: misma máquina y barra larga del jalón, manos al ancho de los hombros, palmas al frente, rodillas trabadas, pecho arriba.
- Movimiento: jala a la parte alta del pecho con los codos pegados al cuerpo. Pausa corta y sube en 2 a 3 segundos hasta estirar del todo.
- Imagina: que llevas los codos a las bolsas del pantalón.
- Errores: echarte atrás para mover más peso, torso casi derecho. Quedarte corto arriba, estira completo.
- Cuidado: si molesta el hombro o el codo, agarre en V.

**aperturas-maquina** (nueva)
- Ubícala: asiento con dos manijas a los lados que se juntan al frente; suele decir Pec Deck o Butterfly.
- Para qué: la forma del pecho.
- Lo sientes: el pecho apretando al juntar, no el hombro.
- Prepárate: asiento con las manijas a la altura del pecho, espalda pegada, codos apenas doblados y fijos.
- Movimiento: junta en arco, aprieta un segundo y regresa en 2 a 3 segundos hasta la línea del cuerpo.
- Imagina: que abrazas un barril.
- Errores: abrir más atrás de los hombros, para en la línea del cuerpo. Doblar los codos para empujar, déjalos fijos.
- Cuidado: si molesta el hombro, press de pecho en máquina.

**aperturas-mancuernas** (nueva)
- Para qué: pecho, cuando no hay máquina.
- Lo sientes: el pecho estirándose al abrir y apretando al cerrar.
- Prepárate: acostado en banco plano, mancuernas arriba del pecho, palmas viéndose, codos apenas doblados.
- Movimiento: abre en arco en 2 a 3 segundos hasta que las mancuernas queden a la altura del pecho, no más. Sube por el mismo arco.
- Imagina: que abrazas un árbol grueso.
- Errores: doblar los codos y hacerlo press, déjalos fijos. Bajar de más, para a la altura del pecho.
- Cuidado: empieza ligero; si molesta el hombro, press de pecho en máquina.

**cruce-poleas** (nueva)
- Para qué: pecho, cuando máquina y banco están ocupados.
- Lo sientes: el pecho apretando al juntar.
- Prepárate: entre las poleas altas, una manija en cada mano, un pie adelante, torso apenas inclinado.
- Movimiento: junta las manos al frente y un poco abajo en arco, codos apenas doblados y fijos. Aprieta un segundo y regresa en 2 a 3 segundos hasta la línea de los hombros.
- Imagina: que abrazas un barril.
- Errores: doblar los brazos para jalar, déjalos fijos. Dejar que el cable te jale al regresar, controla la vuelta.
- Cuidado: si molesta el hombro, no abras más allá de la línea de los hombros.

**triceps-cabeza** (ya existe; que diga esto)
- Para qué: tríceps, sobre todo la cabeza larga, la más grande del brazo.
- Lo sientes: atrás del brazo, arriba del codo.
- Prepárate: banco con respaldo derecho, espalda pegada, una mancuerna con las dos manos por el disco de arriba, brazos estirados sobre la cabeza.
- Movimiento: baja la mancuerna detrás de la cabeza en 2 a 3 segundos doblando solo los codos. Sube hasta estirar.
- Imagina: tu brazo es una bisagra y solo se mueve el codo.
- Errores: abrir los codos, apúntalos al techo. Arquear la espalda baja, pégala al respaldo.
- Cuidado: si molesta el codo o el hombro, tríceps en polea alta.

## 12. Seguimiento

Sin cambios: promedio de 7 días del peso, cintura cada lunes, foto cada 2 semanas.

## 13. Lo que no

- Sin frases motivacionales, insignias ni rachas.
- Prohibidos: pájaros, remo de pie con barra, peso muerto y press francés.
- Ningún ejercicio fuera de este archivo. No borrar datos. No tocar el deploy.

## 14. Cómo verificar

- `npm test`, build y e2e en verde.
- Pierna: con Frida el lunes registrada, A y B no traen pierna; con Frida movida al miércoles, el martes A o B no trae pierna y el miércoles Hoy muestra `FRIDA`; con "Esta semana no hay", la siguiente completa trae pierna a 3 series y la que sigue ya no; con el día planeado pasado sin respuesta, al día siguiente Hoy pregunta antes de armar la sesión, y "No hubo" activa la pierna en la siguiente completa; en corta nunca hay pierna.
- Par: alterna series y el descanso corre después del segundo; un par con 2 y 3 series termina con la serie suelta.
- `laterales` comparte historial entre A y B; las alternativas nunca repiten un id que ya está en la sesión.
- Unidades: todo lo del gym abre en lb y CASA en kg; cambiar la unidad no pierde ni altera series viejas.
- La corta hace los bloques 1, 2 y el par de laterales a 2 series.
- `aperturas-maquina` muestra la foto de brazos abiertos como Inicio.
- Cada ejercicio y cada alternativa tiene sus dos fotos.
- Capturas a 390 px para Fer: Hoy con la duración estimada, sesión A, sesión B, una tarjeta de par y la ficha de `aperturas-maquina`.
- Commits chicos en una rama. Push solo cuando Fer lo apruebe. Al final, resumen corto de qué cambió.

## 15. Calidad de la app (pedido del 1 oct; si ya está, verifícalo y no lo rehagas)

- **iPhone:** nada se corta ni deja de caber. Revisa todas las pantallas a 375×667, 390×844, 393×852 y 430×932, en Safari y como app instalada, con nombres largos, alternativa elegida y foto 4:3: dvh o svh en lugar de 100vh, safe-area-inset-bottom en barras fijas, inputs de al menos 16 px para que no haga zoom y textos que no empujen botones. El botón principal siempre completo y visible. Prueba que falle si un botón principal se sale de la pantalla.
- **Peso por serie:** cada serie con su peso y sus reps; la nueva arranca con el peso de la anterior; botones − y + grandes con el paso del ejercicio; al tocar el número se abre el teclado numérico; cambiar la serie 2 no toca la 1; una serie registrada se puede editar o deshacer.
- **Alternativas completas:** al elegir una cambia todo a ella (nombre, fotos, ficha, series y reps, unidad, sugerencia e historial propio) y con un toque se regresa al original. Prueba que recorra cada ejercicio con cada alternativa y falle si aparece texto o foto del original.
- **FICHAS.md** con todas las fichas, de ejercicios y alternativas, en el formato de la sección 11.
- **Auditoría:** la sesión se retoma exacta si iOS cierra la app (series, ejercicio y descanso); el descanso se calcula por la hora real aunque se bloquee la pantalla; la pantalla no se apaga durante la sesión si el iPhone lo permite; almacenamiento persistente y recordatorio de descargar respaldo cada 2 semanas; botones de al menos 44 px; fotos ligeras sin brincos.
