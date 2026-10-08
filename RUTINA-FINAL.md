# RUTINA-FINAL.md · versión 5 (7 oct 2026, noche)

Para Claude Code. Este archivo es la única fuente de verdad de la rutina de FM y lo autoriza Fer. Sustituye completas a todas las versiones anteriores (29 sep y versiones 2, 3 y 4 del 7 oct). Fer probó la A el 7 oct y describió su gym; esta versión sale de eso. Donde choque con BRIEF.md, NOTAS o cualquier otra cosa en el repo, manda este archivo. En CLAUDE.md debe seguir la línea: "La rutina, los ejercicios, las alternativas y las fotos salen de RUTINA-FINAL.md".

## 0. Prompt para pegarle a Code

```
Lee RUTINA-FINAL.md (versión 5) en la raíz del proyecto; reemplaza a cualquier versión anterior (3 o 4). Probé la A en el gym y cambié cosas: series seguidas en vez de pares, ejercicios agrupados por zona de mi gym, alternativas sencillas, versión corta automática según la hora y un registro de sesiones que no dependa de que me acuerde. Si ya implementaste la v3 o la v4, ajústala a esta en vez de empezar de cero; lo que no cambia (pierna con día de Frida, lb, fotos, sección 15) se queda. Orden: 1) registro de sesiones de la sección 2, con la A del 7 oct ya cargada, en src/logic con pruebas; 2) sesiones A y B sin pares, por zona, con sus alternativas; 3) versión automática y recorte, en src/logic con pruebas; 4) botón "Ocupado: después"; 5) fotos y fichas nuevas; 6) lo que falte de la sección 15. Commits chicos en una rama y sin push hasta que te diga. Al final dime qué cambió, cuánto dura cada sesión según tu cálculo, y enséñame capturas a 390 px de Hoy, la pantalla "Pon al día tu semana", sesión A, sesión B, la versión corta y la ficha de tríceps con cuerda.
```

## 1. Qué cambia contra la versión 3

- **Sin pares.** Todas las series de un ejercicio seguidas, con su descanso, y luego el siguiente. Se quitan los bloques en par de la lógica, la pantalla y las pruebas.
- **Por zona del gym** (sección 3): bancos, poleas y terraza. Cada sesión recorre las zonas en orden y visita cada una una sola vez. Cada ejercicio muestra su zona.
- **Solo equipo que Fer ubica y sabe usar:** bancos planos y reclinables, mancuernas, la máquina de jalón al pecho, la máquina de remo sentado, la polea de pie con cuerda para tríceps, colchonetas y el saco. Salen el pec deck, la prensa y todas las alternativas "en máquina".
- **Cambios de ejercicio:** curl con barra Z → curl con mancuernas (`curl-alternado`). Tríceps en polea alta → tríceps con cuerda en la polea de pie (`triceps-polea`, misma historia, foto y ficha nuevas). Plancha → crunch en colchoneta (`crunch`). `remo-polea` pasa a A, `remo-pecho-apoyado` a B y `triceps-cabeza` a A. `jalon-cerrado` sube a 3 series. Aperturas con mancuernas en lugar de máquina.
- **Alternativas sencillas** (sección 7): solo mancuernas, banco, colchoneta o el cuerpo. Antes de cambiar de ejercicio, "Ocupado: después".
- **Versión automática:** la app decide completa o corta con la hora real al empezar, y recorta si se atrasa (sección 3).
- **Registro de sesiones a prueba de olvidos** (sección 2): la que sigue se calcula del historial, la sesión se cierra sola, la app pregunta por los días sin registro y se puede registrar una sesión hecha sin la app.
- **Duración:** alrededor de una hora con calentamiento y cierre. Sale la regla de 4 semanas.

## 2. Semana y registro de sesiones

| Día | Qué toca |
|---|---|
| Lunes | `FRIDA`: pierna en Foro 4 (el Club Britania cierra los lunes). Es el día planeado por defecto y se puede mover. |
| Martes a jueves | A o B, la que siga. |
| Viernes y sábado | Sin gym. No bloquees si Fer registra algo. |
| Domingo | Rescate antes de las 3 pm si el jueves en la noche iba en menos de 3. |

- Meta: 3 sesiones por semana, de lunes a domingo. Cuentan `FRIDA`, A y B.
- Bonus: con 3 hechas, una cuarta opcional: la que sigue, con cierre de 20 min.
- `CASA`: máximo 2 por semana, no cuenta para la meta y no cambia la que sigue. Se ofrece cuando la hora ya no alcanza o en días sin gym. Muestra "llevas X de 2".

**Registro de sesiones** (en `src/logic`, con pruebas). Tiene que funcionar aunque Fer se olvide de abrir la app, de terminar la sesión o de registrar.

1. **Una sola lista de sesiones** con fecha, tipo (A, B, `FRIDA`, `CASA`), cómo quedó (completa, corta, parcial o registrada sin detalle) y si vino de la app o se registró después. Todo lo demás se calcula de esa lista; no hay contadores guardados aparte.
2. **La que sigue se calcula siempre del historial:** es la contraria de la A o B más reciente por fecha; si no hay ninguna, A. `FRIDA` y `CASA` no la cambian. Si Fer edita o borra una sesión, la que sigue se recalcula sola.
3. **La sesión se cierra sola.** No hace falta tocar "Terminar": una sesión con al menos una serie registrada cuenta como hecha. Se cierra al final del día o al empezar otra, y queda como completa si se hizo la mayoría de las series, o como parcial si no. Las dos cuentan para la meta.
4. **Días sin registro.** Al abrir la app, si desde la última sesión registrada pasó un día de gym (lunes a jueves, o domingo de rescate) sin nada, Hoy pregunta una sola vez por cada día, antes de armar la sesión: "¿Entrenaste el martes 6?" con botones "A", "B", "Frida" y "No fui", con la que tocaba ya marcada. Un toque y listo. Lo que conteste se puede cambiar en Historial.
5. **Pon al día tu semana.** La primera vez que abra esta versión, en lugar de preguntar día por día, una pantalla con los días de esta semana hasta hoy y los mismos botones por día. El miércoles 7 oct ya aparece como A (sección 2, punto 8).
6. **Registrar una sesión hecha sin la app:** en Hoy y en Historial, "Registrar sesión" con fecha (hoy por defecto, nunca en el futuro) y tipo. Máximo una A o B por día: si ese día ya tiene una, ofrece cambiarla en vez de duplicarla.
7. **Sin diálogos de confirmación:** cada registro muestra "Deshacer" unos segundos. Todo se puede editar o borrar en Historial.
8. **Carga inicial:** al instalar esta versión, si no hay ninguna sesión el 7 oct 2026, se agrega una A registrada después (Fer la hizo sin la app). Así hoy le toca B.
9. **En Hoy, arriba y en una línea:** "Hoy toca B · la última fue A el miércoles 7" y "Semana: 2 de 3".

**Pierna con Frida** (sin cambios contra la v3, en `src/logic` con pruebas):

1. Cada semana tiene un día de Frida planeado: el lunes, salvo que Fer lo mueva. En Hoy, "Mover pierna con Frida" deja elegir otro día de esa semana o "Esta semana no hay".
2. El día planeado, Hoy muestra `FRIDA` en lugar de A o B, con "Sí, fui", "Se movió a…" y "No hubo". La pregunta de días sin registro (punto 4 de arriba) incluye a Frida.
3. Mientras la semana tenga `FRIDA` hecha o planeada a futuro, A y B no traen pierna.
4. Si la semana se queda sin Frida, la siguiente sesión A o B completa agrega `goblet` 3 × 10-12 al empezar la terraza y el cierre baja a 5 min. Solo una vez por semana; en corta nunca; no se arrastra a la semana siguiente.
5. Si ya hubo pierna en A o B y después se registra `FRIDA`, no se cambia nada.

## 3. Zonas, horario y versiones

**Zonas del Club Britania** (lo que Fer conoce y usa):
- **Bancos** (adentro): bancos planos y reclinables, y mancuernas.
- **Poleas:** la máquina de jalón al pecho, la máquina de remo sentado y la polea de pie con cuerda para tríceps.
- **Terraza:** mancuernas, colchonetas y el saco de box.

Cada ejercicio lleva su zona. La sesión se recorre por zonas en orden y cada zona se visita una sola vez. Arriba de la sesión se ve el recorrido, por ejemplo "Poleas → Bancos → Terraza", y al terminar la última serie de una zona la app dice a cuál sigue.

- **Series seguidas:** cada ejercicio se termina completo antes de pasar al siguiente. El descanso corre al tocar la serie.
- **Completa:** calentamiento 5 min de elíptica (si está ocupada, bici fija), todos los ejercicios, cierre de 10 min en el saco de la terraza o en la elíptica (5 si hubo pierna).
- **Corta (unos 30 min):** calentamiento 4 min; el jalón, el press principal (inclinado en A, plano en B) y laterales, 3 series cada uno, haciendo los laterales en la zona de bancos para no subir a la terraza; cierre de 5 min. Cuenta como sesión.
- **Serie de aproximación:** en el primer ejercicio de la sesión y en el primer press, 10 repeticiones con la mitad del peso. No se registra.
- **Esfuerzo:** 1 o 2 repeticiones en reserva.
- **Versión automática** (en `src/logic`, con pruebas): al tocar "Empezar", la app toma la hora real y calcula con la duración estimada si las pesas de la completa terminan antes de las 21:10 (última pesa; a las 22:00 cierran el agua). Si sí, completa. Si no, y la corta sí alcanza, corta. Si ninguna alcanza, ofrece `CASA`. Con las duraciones de abajo queda: completa si empieza a las 20:15 o antes, corta hasta las 20:40, después `CASA`. Arriba de la sesión se ve en una línea, por ejemplo "Empezaste 8:22 · va la corta · terminas pesas 8:50", con un botón para cambiar a la otra versión.
- **Recorte en el camino:** si a media sesión la hora proyectada de la última pesa pasa de 21:10, la app quita lo que falta en este orden: abdomen, brazos, press militar o aperturas, y avisa en una línea qué quitó. Nunca quita el press principal, el jalón, el remo ni los laterales.
- **"Ocupado: después":** manda ese ejercicio al final de su zona; si la zona ya se terminó, al final de la sesión. Cuando le vuelve a tocar y sigue ocupado, ofrece su alternativa de la sección 7.
- **Duración estimada** (se muestra en Hoy; Code la verifica con su cálculo de 40-45 s por serie, descansos completos, 1 min entre ejercicios y 2 min al cambiar de zona): A ≈ 59 min y B ≈ 57 min con calentamiento y cierre. Con pierna, unos 62.

## 4. Sesión A: dorsal, pecho alto y hombro · Poleas → Bancos → Terraza

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Poleas | `jalon` | Jalón al pecho, agarre ancho | 3 × 10-12 | 75 s | peso, lb | Wide-Grip_Lat_Pulldown |
| 2 | Poleas | `remo-polea` | Remo sentado en máquina | 3 × 10-12 | 75 s | peso, lb | Seated_Cable_Rows |
| 3 | Bancos | `press-inclinado` | Press inclinado con mancuernas | 3 × 8-10 | 90 s | peso, lb | Incline_Dumbbell_Press |
| 4 | Bancos | `press-militar` | Press militar sentado con mancuernas | 2 × 8-10 | 90 s | peso, lb | Dumbbell_Shoulder_Press |
| 5 | Bancos | `triceps-cabeza` | Tríceps con mancuerna sobre la cabeza, sentado | 2 × 10-12 | 60 s | peso, lb | Seated_Triceps_Press |
| 6 | Terraza | `laterales` | Elevaciones laterales | 3 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 7 | Terraza | `curl-alternado` | Curl con mancuernas | 2 × 10-12 | 60 s | peso, lb | Dumbbell_Alternate_Bicep_Curl |
| 8 | Terraza | `crunch` | Crunch en colchoneta | 2 × 15-20 | 45 s | corporal | Crunches |

Cierre en el saco, ahí mismo en la terraza. Notas: en bancos, un banco reclinable a 30° para el 3 y casi derecho para el 4 y el 5.

## 5. Sesión B: pecho, espalda media y brazo · Bancos → Poleas → Terraza

| # | Zona | id | Nombre | Series × reps | Descanso | Modo | Foto |
|---|---|---|---|---|---|---|---|
| 1 | Bancos | `press-plano` | Press plano con mancuernas | 3 × 8-10 | 90 s | peso, lb | Dumbbell_Bench_Press |
| 2 | Bancos | `aperturas-mancuernas` | Aperturas con mancuernas en banco plano | 2 × 12-15 | 60 s | peso, lb | Dumbbell_Flyes |
| 3 | Bancos | `remo-pecho-apoyado` | Remo con pecho apoyado en banco reclinable | 3 × 12-15 | 60 s | peso, lb | Dumbbell_Incline_Row |
| 4 | Poleas | `jalon-cerrado` | Jalón al pecho, manos al ancho de los hombros | 3 × 10-12 | 75 s | peso, lb | Close-Grip_Front_Lat_Pulldown |
| 5 | Poleas | `triceps-polea` | Tríceps con cuerda en la polea de pie | 2 × 10-12 | 60 s | peso, lb | Triceps_Pushdown_-_Rope_Attachment |
| 6 | Terraza | `laterales` | Elevaciones laterales (el mismo de A) | 3 × 12-20 | 60 s | peso, lb | Side_Lateral_Raise |
| 7 | Terraza | `curl-martillo` | Curl martillo | 2 × 10-12 | 60 s | peso, lb | Hammer_Curls |
| 8 | Terraza | `elevacion-piernas` | Elevación de piernas en colchoneta | 3 × 12 | 45 s | corporal | Flat_Bench_Lying_Leg_Raise |

Cierre en el saco. Notas: del 1 al 3 es el mismo banco (plano y luego reclinado a 30-45°). El jalón cerrado usa la misma máquina y la misma barra del jalón ancho, solo cambian las manos.

## 5b. Por qué así (para que Code no lo "optimice")

Series duras por semana con A y B: pecho 8, espalda 12, hombro lateral 6 (12 con dos CASA), hombro de enfrente 2 más todo el press, bíceps 4, tríceps 4, abdomen 5, pierna con Frida o 3 series de goblet. Prioridad de Fer: torso (pecho, dorsal, espalda alta, hombro lateral, abdomen). En cada sesión hay un jalón y un remo, nunca dos remos. Los brazos van al final para no cansar el bíceps antes de jalar ni el tríceps antes de empujar. No agregues series ni ejercicios para "completar": cada sesión tiene que caber en una hora.

## 6. Sesión CASA: 12 minutos, opcional

Un minuto de descanso entre series. Es lo único en kg. La plancha cambia por crunch.

| # | id | Nombre | Series × reps | Modo | Foto |
|---|---|---|---|---|---|
| 1 | `laterales-casa` | Laterales con mancuernas de 4 a 5 kg | 3 × 15-20 | peso, kg | Side_Lateral_Raise |
| 2 | `lagartijas` | Lagartijas dejando 2 en reserva | 3 series al tope | corporal | Pushups |
| 3 | `remo-liga` | Remo con liga anclada en la puerta | 2 × 12-15 | corporal | Seated_Cable_Rows como referencia, marcada así |
| 4 | `crunch` | Crunch | 2 × 15-20 | corporal | Crunches |

## 7. Alternativas

Reglas: primero "Ocupado: después". Las alternativas solo usan mancuernas, banco, colchoneta o el cuerpo, y se hacen en la misma zona o en la terraza; nunca "en máquina" a secas ni nada que obligue a buscar aditamentos o a preguntar. A Fer no le gustan los pájaros, los remos de pie ni los ejercicios raros o de técnica difícil. Una alternativa se oculta si su id ya está en la sesión. Si una alternativa usa el id de otro ejercicio, comparte su historial. Al elegirla cambia todo a ella (sección 15).

**jalon** y **jalon-cerrado** (máquina de jalón)
- `remo-mancuerna` · Remo a una mano con mancuerna, jalando hacia la cadera · Solo si la máquina sigue ocupada al final · One-Arm_Dumbbell_Row

**remo-polea** (máquina de remo)
- `remo-pecho-apoyado` · Remo con pecho apoyado en banco reclinable · Máquina ocupada · Dumbbell_Incline_Row

**press-inclinado**
- `press-plano` · Press plano con mancuernas · No hay banco reclinable libre
- `press-piso` · Press en el piso con mancuernas, en colchoneta · Bancos ocupados o molestia de hombro · Dumbbell_Floor_Press

**press-militar**
- `press-militar-pie` · Press militar de pie, mismas mancuernas · No hay banco con respaldo · Standing_Dumbbell_Press

**triceps-cabeza**
- `triceps-patada` · Patada de tríceps con mancuerna, apoyado en el banco · Molestia de codo u hombro con el brazo arriba · Tricep_Dumbbell_Kickback (fotos volteadas, sección 8)

**laterales**
- `laterales-sentado` · Laterales sentado en la orilla de un banco · Si te balanceas · Seated_Side_Lateral_Raise

**curl-alternado**
- `curl-martillo` · Curl martillo, mismas mancuernas · Molestia de muñeca

**crunch**
- `elevacion-piernas` · Elevación de piernas en colchoneta · Molestia de cuello

**press-plano**
- `press-piso` · Press en el piso con mancuernas · Bancos ocupados
- `lagartijas` · Lagartijas · Sin mancuernas libres (3 series al tope dejando 2) · Pushups

**aperturas-mancuernas**
- `lagartijas` · Lagartijas · Banco ocupado o molestia de hombro al abrir

**remo-pecho-apoyado**
- `remo-mancuerna` · Remo a una mano apoyado en un banco plano · No hay banco reclinable libre · One-Arm_Dumbbell_Row

**triceps-polea** (polea de pie con cuerda)
- `triceps-cabeza` · Tríceps con mancuerna sobre la cabeza · Polea ocupada
- `triceps-patada` · Patada de tríceps · Te molesta el codo con el brazo arriba

**curl-martillo**
- `curl-alternado` · Curl con mancuernas · Otra opción con las mismas mancuernas

**elevacion-piernas**
- `crunch` · Crunch en colchoneta · Te jala la espalda baja

**goblet** (solo semanas sin Frida)
- `sentadilla-mancuernas` · Sentadilla con dos mancuernas · La mancuerna pesada está ocupada o ya no alcanza · Dumbbell_Squat

**CASA**: sin cambios (`laterales-liga`, `lagartijas-inclinadas`, `lagartijas-pies-banco`, `remo-mancuerna-casa`), y `crunch` → `elevacion-piernas-piso`.

Salen de la rutina y de las alternativas: `curl-z`, `plancha`, `prensa`, `aperturas-maquina`, `cruce-poleas`, `press-pecho-maquina`, `press-inclinado-maquina`, `press-hombro-maquina`, `remo-pecho-maquina`, `remo-alto-maquina`, `laterales-polea`, `curl-polea`, `curl-cuerda`, `dominadas-asistidas`, `fondos-banco`, `remo-polea-una-mano`. Su historial no se borra y se sigue viendo en Historial.

## 8. Fotos

Todo lo de antes sigue: fuente free-exercise-db, pipeline de 720 px, `<ID>.jpg` y `<ID>-2.jpg`, revisión una por una, recorte, precarga en el service worker.

**Descargar nuevas** (verificadas el 7 oct, existen y corresponden): Triceps_Pushdown_-_Rope_Attachment, Crunches, Tricep_Dumbbell_Kickback. Dumbbell_Alternate_Bicep_Curl, Dumbbell_Flyes, Dumbbell_Floor_Press, One-Arm_Dumbbell_Row y Dumbbell_Squat ya deberían estar; si no, descárgalas.

**Revisadas a ojo el 7 oct:**
- Triceps_Pushdown_-_Rope_Attachment: parado derecho frente a la polea con la cuerda; foto 0 manos al pecho (Inicio), foto 1 brazos estirados (Final). Correcta.
- Tricep_Dumbbell_Kickback: **fotos al revés**: la foto 0 tiene el brazo estirado y la 1 el codo doblado. En la app, "Inicio" es `Tricep_Dumbbell_Kickback-2.jpg`.
- Crunches: acostado en colchoneta; foto 1 con los hombros despegados. Correcta.
- Dumbbell_Alternate_Bicep_Curl: de pie, alternando. Correcta.
- No uses los pullover (Straight-Arm o Bent-Arm Dumbbell Pullover): el modelo va de través en el banco, que es más técnico.

Prueba existente: recorrer la biblioteca y fallar si falta un archivo. Agrega los ids nuevos.

## 9. Migración

La migración de ids viejos ya corrió; no la cambies ni la vuelvas a correr. Esta versión no renombra nada. Agrega `crunch` y `triceps-patada`. `triceps-polea` conserva su historial aunque cambien la foto y la técnica. Si la v3 o la v4 ya agregaron `aperturas-maquina`, `cruce-poleas` o los pares, se quitan de la rutina sin borrar datos. La A del 7 oct se carga como dice la sección 2, punto 8, una sola vez.

## 10. Reglas y progresión

- Doble progresión por id: cuando salga el número alto del rango en todas las series, la siguiente vez sube el peso.
- **Unidades:** todo lo del gym en lb por defecto. En kg solo lo de CASA (`laterales-casa` y `remo-mancuerna-casa`). En la sesión, un toque cambia kg o lb de ese ejercicio y se queda guardado. Cada serie guarda la unidad en que se registró y se convierte al mostrarla, sin perder el dato original.
- **Incrementos:** en lb de 5 en 5; en kg (CASA) de 1 en 1. Si Fer escribe otro número (12, 17.5), se respeta.
- **Sin regla de 4 semanas:** `CON_SERIE_EXTRA = []`. La progresión es por peso y repeticiones, para no pasar de la hora.
- Dolor: molestia muscular sí; dolor agudo en articulación, alternativa.
- **Peso inicial sin historial** (si hay historial, manda el historial; mancuernas por mano): `jalon` 90 lb, `remo-polea` 90 lb, `press-inclinado` 30 lb, `press-militar` 25 lb, `triceps-cabeza` 20 lb (una mancuerna a dos manos), `laterales` 10 lb, `curl-alternado` 20 lb, `press-plano` 35 lb, `aperturas-mancuernas` 15 lb, `remo-pecho-apoyado` 15 lb, `jalon-cerrado` 80 lb, `triceps-polea` 40 lb, `curl-martillo` 20 lb, `goblet` 45 lb, `triceps-patada` 10 lb, `remo-mancuerna` 45 lb, `laterales-casa` 4 kg.
- Ajuste dentro de la sesión (texto en la ficha): si la primera serie pasó del número alto con 3 o más en reserva, sube un escalón; si no llegó al bajo, baja uno. Escalón: 5 lb por mano en mancuernas o una placa en máquina.

## 11. Fichas nuevas o que cambian

Formato de FICHAS.md, igual que todas: Para qué · Lo sientes · Prepárate · Movimiento · Imagina · Errores (máximo 2, con su corrección) · Cuidado. De tú, sin jerga. Pesos de arranque en la sección 10. Las fichas de `remo-pecho-apoyado`, `jalon-cerrado`, `aperturas-mancuernas` y `triceps-cabeza` de la v3 siguen igual.

**triceps-polea** (cambia: polea de pie con cuerda)
- Para qué: tríceps, la parte de atrás del brazo.
- Lo sientes: atrás del brazo, arriba del codo. Si lo sientes en el pecho, te estás echando encima del cable.
- Prepárate: en la polea de pie que ya tiene la cuerda, una punta en cada mano. Un paso atrás, parado derecho, codos pegados a los costados.
- Movimiento: arranca con los antebrazos paralelos al piso y empuja hasta estirar, abriendo las manos abajo. Regresa en 2 a 3 segundos solo hasta 90°.
- Imagina: que tus codos están pegados con cinta a las costillas.
- Errores: echarte encima y empujar con hombro y pecho, párate derecho y baja el peso. Dejar subir las manos a la cara, para en 90°.
- Cuidado: si molesta el codo, tríceps con mancuerna sobre la cabeza.

**curl-alternado** (ahora principal en A)
- Para qué: bíceps.
- Lo sientes: al frente del brazo.
- Prepárate: de pie, una mancuerna en cada mano, palmas al frente, codos pegados a las costillas.
- Movimiento: sube una a la vez, o las dos, sin mover el codo, hasta que la mancuerna llegue al hombro. Baja en 2 a 3 segundos hasta estirar.
- Imagina: que tus codos son bisagras clavadas a tus costados.
- Errores: mecer el cuerpo para subir, baja el peso. Codos que se van al frente, déjalos pegados.
- Cuidado: si molesta la muñeca, curl martillo.

**crunch** (nueva)
- Para qué: abdomen.
- Lo sientes: en el abdomen, no en el cuello.
- Prepárate: acostado en colchoneta, rodillas dobladas, pies en el piso, manos tocando las sienes o cruzadas en el pecho.
- Movimiento: despega los hombros del piso subiendo las costillas hacia la cadera, aprieta un segundo y baja lento sin descansar la cabeza.
- Imagina: que acercas las costillas al ombligo.
- Errores: jalar la cabeza con las manos, deja el cuello suelto. Subir hasta sentarte, basta con despegar los hombros.
- Cuidado: si molesta la espalda baja, elevación de piernas con las rodillas dobladas.

**triceps-patada** (nueva)
- Para qué: tríceps sin subir el brazo arriba de la cabeza.
- Lo sientes: atrás del brazo.
- Prepárate: una mano y una rodilla en el banco, espalda plana; en la otra mano la mancuerna, con el codo pegado al cuerpo y doblado a 90°.
- Movimiento: estira el brazo hacia atrás hasta que quede recto, aprieta un segundo y regresa a 90° en 2 a 3 segundos.
- Imagina: que solo se mueve el antebrazo, como bisagra.
- Errores: columpiar la mancuerna con el hombro, codo fijo. Usar mucho peso, aquí poco basta.
- Cuidado: si molesta el codo, baja el peso.

**remo-polea** (revisa que diga esto; ahora en A)
- Para qué: espalda media y dorsal; grosor de espalda y postura.
- Lo sientes: entre los omóplatos y a los costados.
- Prepárate: en la máquina de remo sentado, pies en la plataforma, rodillas apenas dobladas, con el agarre que tenga puesto y el pecho arriba.
- Movimiento: jala hacia el abdomen con los codos pegados al cuerpo, aprieta los omóplatos un segundo y regresa en 2 a 3 segundos hasta estirar los brazos sin redondear la espalda.
- Imagina: que guardas los codos en las bolsas de atrás.
- Errores: echarte para atrás para jalar, torso casi quieto. Encoger los hombros, bájalos.
- Cuidado: si molesta la espalda baja, remo con pecho apoyado.

**remo-mancuerna** (revisa que diga esto; alternativa de los jalones y del remo con pecho apoyado)
- Para qué: dorsal y espalda media.
- Lo sientes: a los costados de la espalda, no en el bíceps.
- Prepárate: una rodilla y la mano del mismo lado en un banco plano, espalda plana, la mancuerna colgando bajo el hombro.
- Movimiento: jala el codo hacia la cadera, pegado al cuerpo, hasta pasar la línea de la espalda. Baja en 2 a 3 segundos hasta estirar.
- Imagina: que guardas el codo en la bolsa del pantalón.
- Errores: girar el torso para subir más, pecho viendo al piso. Jalar hacia el hombro, lleva el codo a la cadera.
- Cuidado: si molesta la espalda baja, apoya bien la mano y baja el peso.

## 12. Seguimiento

Sin cambios: promedio de 7 días del peso, cintura cada lunes, foto cada 2 semanas.

## 13. Lo que no

- Sin frases motivacionales, insignias ni rachas.
- Prohibidos: pájaros, remo de pie con barra, peso muerto y press francés.
- Nada de pares ni circuitos.
- Ningún ejercicio fuera de este archivo. No borrar datos. No tocar el deploy.

## 14. Cómo verificar

- `npm test`, build y e2e en verde.
- Registro: con la A del 7 oct cargada, hoy toca B; si se borra esa A, vuelve a tocar A. Una sesión con una sola serie cuenta como hecha aunque nunca se toque "Terminar". Un martes sin registro hace que el miércoles Hoy pregunte por el martes antes de armar la sesión, una sola vez. No deja registrar dos A o B el mismo día ni fechas futuras. "Deshacer" revierte el último registro.
- Pon al día tu semana: aparece una sola vez, con los días de la semana hasta hoy y el 7 oct como A.
- Sesiones: A y B salen con 8 ejercicios en el orden y zona de las secciones 4 y 5, sin pares; cada zona se visita una vez; cada ejercicio termina sus series antes del siguiente.
- Versión automática: empezar a las 20:10 da completa; a las 20:30, corta; a las 20:45, `CASA`. El botón cambia de versión.
- Recorte: con la proyección pasada de 21:10, se quita primero abdomen, luego brazos, y nunca el press principal, el jalón, el remo ni los laterales.
- "Ocupado: después" manda el ejercicio al final de su zona y, si sigue ocupado, ofrece la alternativa.
- Pierna: con Frida el lunes, A y B sin pierna; con "Esta semana no hay", la siguiente completa trae goblet y la que sigue ya no; en corta nunca.
- Unidades: todo lo del gym abre en lb y CASA en kg.
- Las alternativas nunca repiten un id de la sesión y ninguna dice "en máquina".
- `triceps-patada` muestra la foto de codo doblado como Inicio.
- Cada ejercicio y cada alternativa tiene sus dos fotos.
- Capturas a 390 px: Hoy con la que toca, la duración estimada y la versión; "Pon al día tu semana"; sesión A; sesión B; la corta; y la ficha de `triceps-polea`.
- Commits chicos en una rama. Push solo cuando Fer lo apruebe. Al final, resumen corto de qué cambió.

## 15. Calidad de la app (pedido del 1 oct; si ya está, verifícalo y no lo rehagas)

- **iPhone:** nada se corta ni deja de caber. Revisa todas las pantallas a 375×667, 390×844, 393×852 y 430×932, en Safari y como app instalada, con nombres largos, alternativa elegida y foto 4:3: dvh o svh en lugar de 100vh, safe-area-inset-bottom en barras fijas, inputs de al menos 16 px para que no haga zoom y textos que no empujen botones. El botón principal siempre completo y visible. Prueba que falle si un botón principal se sale de la pantalla.
- **Peso por serie:** cada serie con su peso y sus reps; la nueva arranca con el peso de la anterior; botones − y + grandes con el paso del ejercicio; al tocar el número se abre el teclado numérico; cambiar la serie 2 no toca la 1; una serie registrada se puede editar o deshacer.
- **Alternativas completas:** al elegir una cambia todo a ella (nombre, fotos, ficha, series y reps, unidad, sugerencia e historial propio) y con un toque se regresa al original. Prueba que recorra cada ejercicio con cada alternativa y falle si aparece texto o foto del original.
- **FICHAS.md** con todas las fichas, de ejercicios y alternativas, en el formato de la sección 11.
- **Auditoría:** la sesión se retoma exacta si iOS cierra la app; el descanso se calcula por la hora real aunque se bloquee la pantalla; la pantalla no se apaga durante la sesión si el iPhone lo permite; almacenamiento persistente y recordatorio de descargar respaldo cada 2 semanas; botones de al menos 44 px; fotos ligeras sin brincos.
