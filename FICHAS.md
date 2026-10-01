# FICHAS.md

Fuente de verdad de las fichas de técnica. `scripts/fichas-desde-md.mjs` genera `src/data/fichas.ts` a partir de este archivo; no se edita el `.ts` a mano.

Formato fijo por ficha, español sencillo y de tú, técnica conservadora (espalda neutra, bajar en 2 a 3 segundos, rango completo sin dolor, 1 o 2 repeticiones en reserva, sin jerga sin explicar):

```
## <id> — <Nombre>
Para qué: ...
Lo sientes: ...
Prepárate: ...
Movimiento: ...
Imagina: ...
Errores: <error>, <corrección>. <error>, <corrección>.
Cuidado: ...
```

Máximo 2 errores, cada uno con su corrección separada por la primera coma. Cada ficha cabe en unas 80 palabras; las dos que dio Fer como tono (press inclinado y jalón) llegan a 107 y marcan el tope que revisa la prueba (`src/data/fichas.test.ts`).

---

## press-inclinado — Press inclinado con mancuernas
Para qué: pecho de arriba, el que se nota con playera.
Lo sientes: arriba del pecho. Si lo sientes más en el hombro, baja el banco.
Prepárate: banco a 30°, pies firmes, omóplatos juntos y abajo, mancuernas a los lados del pecho.
Movimiento: baja en 2 a 3 segundos con los codos a 45° del cuerpo, no en T, hasta que los codos queden un poco abajo del banco. Sube empujando arriba y un poco hacia adentro.
Imagina: que quieres juntar los bíceps arriba.
Errores: arquear la espalda baja, deja el glúteo pegado al banco. Rebotar abajo, haz una pausa de un segundo.
Cuidado: si duele el frente del hombro, cambia a press en el piso.

## jalon — Jalón al pecho en polea
Para qué: dorsal, lo que abre la espalda en V.
Lo sientes: a los costados, abajo de las axilas. No en bíceps ni en cuello.
Prepárate: rodillo apretando los muslos, agarre un poco más abierto que los hombros, pecho arriba y apenas inclinado hacia atrás.
Movimiento: jala la barra a la parte alta del pecho bajando los codos a los costados. Pausa un segundo y sube en 2 a 3 segundos hasta estirar sin soltar la tensión.
Imagina: que tus manos son ganchos y jalas con los codos hacia las bolsas de atrás.
Errores: columpiarte para jalar, baja el peso. Hombros a las orejas, bájalos antes de jalar.
Cuidado: si molesta el hombro, usa un agarre más cerrado o con las palmas hacia ti.

## press-militar — Press militar sentado con mancuernas
Para qué: hombro de enfrente y de los lados, el que redondea la playera.
Lo sientes: en los hombros y un poco en tríceps. No en la espalda baja.
Prepárate: respaldo casi vertical, espalda baja pegada, abdomen apretado, mancuernas a la altura de las orejas con las palmas al frente.
Movimiento: empuja hacia arriba hasta estirar sin trabar los codos. Baja en 2 a 3 segundos hasta las orejas.
Imagina: que empujas el techo con los nudillos.
Errores: arquear la espalda baja, aprieta el abdomen y baja el peso. Bajar de más, para en las orejas.
Cuidado: si pellizca el hombro arriba, usa las palmas viéndose entre sí.

## laterales — Elevaciones laterales
Para qué: hombro de los lados, el que te hace ver más ancho.
Lo sientes: en el lado del hombro, no en el cuello.
Prepárate: de pie, mancuernas ligeras a los costados, codos apenas doblados, hombros abajo.
Movimiento: sube a los lados hasta la altura de los hombros, con el codo un poco más alto que la mano. Baja en 2 segundos.
Imagina: que sirves dos jarras de agua.
Errores: tomar impulso con el cuerpo, usa menos peso. Encoger los hombros, bájalos antes de subir.
Cuidado: si duele al pasar la horizontal, no subas tanto.

## goblet — Sentadilla goblet
Para qué: muslos y glúteo, la base de todo.
Lo sientes: en los muslos al bajar y en el glúteo al subir.
Prepárate: mancuerna vertical pegada al pecho, sujeta por la cabeza de arriba. Pies al ancho de hombros, puntas un poco hacia afuera.
Movimiento: baja en 2 a 3 segundos como si te sentaras, hasta que los muslos queden paralelos al piso. Pecho arriba, talones pegados. Sube empujando el piso.
Imagina: que te sientas en una silla que está atrás de ti.
Errores: talones que se despegan, abre un poco más las puntas. Rodillas hacia adentro, empújalas hacia afuera.
Cuidado: si molesta la rodilla, baja menos o pásate a la prensa.

## curl-z — Curl con barra Z
Para qué: bíceps.
Lo sientes: en el frente del brazo, no en el antebrazo ni en la espalda.
Prepárate: de pie, pies firmes, codos pegados a los costados, barra colgando con los brazos estirados.
Movimiento: sube doblando solo los codos, aprieta arriba un segundo y baja en 2 a 3 segundos hasta estirar.
Imagina: que los codos están clavados a las costillas.
Errores: balancear el cuerpo, baja el peso. Codos hacia adelante, mantenlos atrás de la barra.
Cuidado: si duele la muñeca, mueve las manos a la parte más inclinada de la barra.

## triceps-polea — Extensión de tríceps en polea alta
Para qué: tríceps, la parte de atrás del brazo.
Lo sientes: atrás del brazo, no en el hombro.
Prepárate: de pie frente a la polea alta, codos pegados a los costados, antebrazos paralelos al piso.
Movimiento: empuja hacia abajo hasta estirar los brazos, aprieta un segundo y sube en 2 a 3 segundos hasta que los antebrazos vuelvan a quedar paralelos.
Imagina: que solo se mueve el antebrazo, como una bisagra.
Errores: abrir los codos, pégalos al cuerpo. Empujar con el cuerpo, baja el peso.
Cuidado: si molesta el codo, usa la cuerda en vez de la barra.

## plancha — Plancha
Para qué: abdomen y espalda baja, para sostener todo lo demás.
Lo sientes: en el abdomen. No en la espalda baja.
Prepárate: antebrazos en el piso, codos bajo los hombros, pies juntos, cuerpo en línea recta de la cabeza a los talones.
Movimiento: aprieta glúteo y abdomen y sostén. Respira normal, mirada al piso.
Imagina: que te quieren pisar el estómago y lo endureces.
Errores: cadera caída, aprieta el glúteo. Cadera levantada, bájala hasta hacer línea.
Cuidado: si duele la espalda baja, apoya las rodillas o cambia a dead bug.

## press-plano — Press plano con mancuernas
Para qué: pecho, sobre todo la parte media.
Lo sientes: en el pecho. Si lo sientes en el frente del hombro, bajas de más.
Prepárate: sube las mancuernas con las rodillas al acostarte. Pies firmes, espalda alta pegada, omóplatos juntos y abajo.
Movimiento: baja en 2 a 3 segundos con los codos a 45° del cuerpo hasta que queden a la altura del pecho. Sube empujando arriba sin chocar las mancuernas.
Imagina: que doblas el banco con la espalda alta.
Errores: rebotar abajo, haz una pausa de un segundo. Codos abiertos en T, ciérralos a 45°.
Cuidado: al terminar, baja las mancuernas a los muslos y siéntate; no las sueltes.

## remo-polea — Remo sentado en polea baja
Para qué: espalda media y dorsal, lo que te endereza.
Lo sientes: entre los omóplatos y a los costados. No en la espalda baja.
Prepárate: pies en la plataforma, rodillas apenas dobladas, espalda recta, brazos estirados al frente.
Movimiento: jala el agarre al abdomen llevando los codos atrás y juntando los omóplatos. Pausa un segundo y suelta en 2 a 3 segundos hasta estirar sin encorvarte.
Imagina: que aprietas una pelota entre los omóplatos.
Errores: mecerte con el torso, quédate vertical y baja el peso. Encoger los hombros, bájalos antes de jalar.
Cuidado: si duele la espalda baja, baja el peso y no te estires tanto adelante.

## remo-mancuerna — Remo a una mano apoyado en banco
Para qué: dorsal y espalda media, un lado a la vez.
Lo sientes: en el costado de la espalda, no en el bíceps.
Prepárate: rodilla y mano del mismo lado en el banco, espalda plana y casi paralela al piso, mancuerna colgando bajo el hombro.
Movimiento: jala el codo hacia la cadera, pegado al cuerpo, hasta que pase la línea de la espalda. Baja en 2 a 3 segundos hasta estirar.
Imagina: que arrancas una podadora.
Errores: girar el torso para subir más, baja el peso y deja el pecho viendo al piso. Jalar hacia el hombro, lleva el codo hacia la bolsa del pantalón.
Cuidado: sin banco, apoya la mano libre en el mancuernero con el torso a 45°.

## remo-pecho-apoyado — Remo con pecho apoyado, codos abiertos
Para qué: espalda alta y parte de atrás del hombro; endereza la postura.
Lo sientes: entre los omóplatos.
Prepárate: banco inclinado a 30 o 45°, boca abajo con el pecho apoyado y la barbilla por fuera del respaldo, mancuernas colgando.
Movimiento: jala abriendo los codos a los lados, doblados a 90°, hasta la altura de la espalda. Aprieta los omóplatos un segundo y baja en 2 a 3 segundos.
Imagina: que haces alas con los codos.
Errores: despegar el pecho del banco, baja el peso. Encoger los hombros, bájalos y aleja las orejas.
Cuidado: empieza ligero; aquí 15 lb por mano ya se sienten.

## prensa — Prensa de pierna
Para qué: muslos y glúteo con la espalda apoyada.
Lo sientes: en los muslos y el glúteo. No en las rodillas ni en la espalda baja.
Prepárate: pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados al asiento. Suelta los seguros con las piernas ya estiradas.
Movimiento: baja en 2 a 3 segundos hasta unos 90° en las rodillas. Empuja con todo el pie sin trabar las rodillas arriba.
Imagina: que empujas la pared con los talones.
Errores: despegar la cadera del asiento, baja menos. Trabar las rodillas arriba, para un poco antes de estirar.
Cuidado: pon los seguros antes de bajarte. Si molesta la rodilla, baja menos.

## curl-martillo — Curl martillo
Para qué: bíceps y antebrazo, lo que engrosa el brazo.
Lo sientes: en el brazo y un poco en el antebrazo.
Prepárate: de pie, mancuernas colgando con las palmas viéndose entre sí, codos pegados al cuerpo.
Movimiento: sube doblando los codos sin girar las muñecas, aprieta arriba y baja en 2 a 3 segundos hasta estirar.
Imagina: que clavas con un martillo hacia tu hombro.
Errores: balancear el cuerpo, baja el peso. Codos hacia adelante, mantenlos atrás.
Cuidado: si duele el codo, usa menos peso y sube más lento.

## elevacion-piernas — Elevación de piernas acostado en banco
Para qué: abdomen bajo.
Lo sientes: en el abdomen, abajo del ombligo. No en la espalda baja.
Prepárate: acostado boca arriba en el banco, manos agarrando el banco detrás de la cabeza, espalda baja pegada.
Movimiento: sube las piernas casi estiradas hasta la vertical. Baja en 2 a 3 segundos sin que la espalda baja se despegue.
Imagina: que la espalda baja está pegada al banco con pegamento.
Errores: arquear la espalda, dobla un poco las rodillas. Bajar con impulso, frena antes de llegar abajo.
Cuidado: si jala la espalda baja, hazlas con las rodillas dobladas.

## laterales-casa — Laterales con mancuernas de 4 a 5 kg
Para qué: hombro de los lados, el que te hace ver más ancho.
Lo sientes: en el lado del hombro, no en el cuello.
Prepárate: de pie, mancuernas a los costados, codos apenas doblados, hombros abajo.
Movimiento: sube a los lados hasta la altura de los hombros y baja en 2 segundos. De 15 a 20 por serie.
Imagina: que sirves dos jarras de agua.
Errores: tomar impulso con el cuerpo, usa menos peso. Encoger los hombros, bájalos antes de subir.
Cuidado: si duele al pasar la horizontal, no subas tanto.

## lagartijas — Lagartijas dejando 2 en reserva
Para qué: pecho, tríceps y hombro de enfrente, sin equipo.
Lo sientes: en el pecho.
Prepárate: manos un poco más abiertas que los hombros, cuerpo recto de la cabeza a los talones, glúteo apretado.
Movimiento: baja en 2 segundos hasta que el pecho quede a un puño del piso, codos a 45° del cuerpo. Sube empujando el piso. Para cuando te queden 2.
Imagina: que empujas el piso lejos de ti.
Errores: cadera caída, aprieta glúteo y abdomen. Codos abiertos en T, ciérralos a 45°.
Cuidado: si cuestan, manos en la cama o una mesa firme.

## remo-liga — Remo con liga anclada en la puerta
Para qué: espalda media y dorsal, en casa.
Lo sientes: entre los omóplatos.
Prepárate: liga a la altura del pecho, puerta cerrada con seguro. Sentado o de pie, a la distancia en que quede tensa con los brazos estirados.
Movimiento: jala los codos hacia atrás pegados al cuerpo, aprieta los omóplatos un segundo y regresa en 2 a 3 segundos.
Imagina: que metes los codos en las bolsas de atrás.
Errores: echarte para atrás, mueve solo los brazos. Dejar que la liga regrese de golpe, controla la vuelta.
Cuidado: cuando salgan 15 fácil, un paso más atrás o una liga más dura.

## plancha-casa — Plancha
Para qué: abdomen y espalda baja, para sostener todo lo demás.
Lo sientes: en el abdomen. No en la espalda baja.
Prepárate: antebrazos en el piso, codos bajo los hombros, cuerpo en línea recta de la cabeza a los talones.
Movimiento: aprieta glúteo y abdomen y sostén 45 segundos. Respira normal.
Imagina: que te quieren pisar el estómago y lo endureces.
Errores: cadera caída, aprieta el glúteo. Cadera levantada, bájala hasta hacer línea.
Cuidado: si duele la espalda baja, apoya las rodillas o cambia a dead bug.

## press-inclinado-maquina — Press inclinado en máquina
Para qué: pecho de arriba, con la máquina guiando el recorrido.
Lo sientes: arriba del pecho.
Prepárate: asiento a la altura en que las manijas queden al nivel de la parte alta del pecho, espalda pegada al respaldo.
Movimiento: empuja al frente y arriba sin trabar los codos. Regresa en 2 a 3 segundos sin que las placas choquen.
Imagina: que alejas la máquina de ti.
Errores: despegar la espalda del respaldo, baja el peso. Trabar los codos arriba, para un poco antes.
Cuidado: si molesta el hombro, sube un poco el asiento.

## lagartijas-pies-banco — Lagartijas con los pies en el banco
Para qué: pecho de arriba y hombro, sin mancuernas.
Lo sientes: arriba del pecho.
Prepárate: pies sobre el banco, manos en el piso un poco más abiertas que los hombros, cuerpo recto, glúteo apretado.
Movimiento: baja en 2 segundos hasta que la cara quede a un puño del piso, codos a 45°. Sube empujando. Para cuando te queden 2.
Imagina: que empujas el piso lejos de ti.
Errores: cadera caída, aprieta glúteo y abdomen. Cabeza colgando, mira un punto adelante.
Cuidado: si molesta el hombro, hazlas con los pies en el piso.

## press-piso — Press en el piso con mancuernas
Para qué: pecho y tríceps con menos recorrido, más seguro para el hombro.
Lo sientes: en el pecho y atrás del brazo.
Prepárate: acostado en el piso, rodillas dobladas, pies firmes, mancuernas sobre el pecho con los codos a 45°.
Movimiento: baja en 2 a 3 segundos hasta que los brazos toquen el piso, pausa un segundo y sube empujando.
Imagina: que el piso frena la bajada por ti.
Errores: dejar caer los codos al piso, frena antes de tocar. Rebotar, haz la pausa.
Cuidado: siéntate con las mancuernas en los muslos para subirlas y bajarlas.

## dominadas-asistidas — Dominadas asistidas en máquina o con liga
Para qué: dorsal y espalda alta, el camino a la dominada completa.
Lo sientes: a los costados de la espalda, no en los bíceps.
Prepárate: rodillas en la plataforma o pies en la liga, agarre un poco más abierto que los hombros, brazos estirados.
Movimiento: sube llevando los codos abajo y atrás hasta que la barbilla pase la barra. Baja en 2 a 3 segundos hasta estirar.
Imagina: que jalas la barra hacia tu pecho, no tú hacia ella.
Errores: columpiarte, sube más despacio. Quedarte a medias arriba, lleva el pecho a la barra.
Cuidado: en la máquina, más peso es más ayuda. Progresar es quitar contrapeso.

## press-militar-pie — Press militar de pie con mancuernas
Para qué: hombro de enfrente y de los lados, sin banco.
Lo sientes: en los hombros. No en la espalda baja.
Prepárate: pies al ancho de hombros, glúteo y abdomen apretados, mancuernas a la altura de las orejas.
Movimiento: empuja hacia arriba hasta estirar sin trabar los codos. Baja en 2 a 3 segundos hasta las orejas.
Imagina: que una cuerda te jala de la coronilla hacia arriba.
Errores: arquear la espalda baja, aprieta el abdomen y usa menos peso. Impulso con las piernas, quédate quieto de la cintura para abajo.
Cuidado: usa un poco menos de peso que sentado.

## press-hombro-maquina — Press de hombro en máquina
Para qué: hombro, con la máquina guiando el recorrido.
Lo sientes: en los hombros.
Prepárate: asiento a la altura en que las manijas queden a la altura de los hombros, espalda pegada al respaldo.
Movimiento: empuja hacia arriba sin trabar los codos y baja en 2 a 3 segundos hasta los hombros.
Imagina: que empujas el techo.
Errores: despegar la espalda del respaldo, baja el peso. Bajar de más, para a la altura de los hombros.
Cuidado: si pellizca el hombro, usa las manijas con las palmas viéndose.

## press-militar-neutro — Press con agarre neutro, palmas viéndose
Para qué: hombro, con el agarre que menos molesta.
Lo sientes: en los hombros, no en el frente del hombro.
Prepárate: respaldo casi vertical, espalda baja pegada, mancuernas a la altura de las orejas con las palmas viéndose entre sí.
Movimiento: empuja hacia arriba y un poco hacia adentro hasta estirar sin trabar. Baja en 2 a 3 segundos.
Imagina: que las mancuernas suben por un riel frente a ti.
Errores: arquear la espalda baja, aprieta el abdomen. Abrir los codos a los lados, mantenlos al frente.
Cuidado: si aun así duele, deja el hombro ese día y sigue con lo demás.

## laterales-sentado — Laterales sentado
Para qué: hombro de los lados, sin poder balancearte.
Lo sientes: en el lado del hombro.
Prepárate: sentado en la orilla del banco, pecho arriba, mancuernas colgando a los costados, codos apenas doblados.
Movimiento: sube a los lados hasta la altura de los hombros y baja en 2 segundos.
Imagina: que sirves dos jarras de agua.
Errores: inclinarte para subir, quédate vertical y usa menos peso. Encoger los hombros, bájalos.
Cuidado: si duele al pasar la horizontal, no subas tanto.

## laterales-polea — Lateral en polea
Para qué: hombro de los lados con tensión pareja.
Lo sientes: en el lado del hombro.
Prepárate: polea abajo, de lado a la máquina, manija en la mano de afuera cruzando frente al cuerpo, codo apenas doblado.
Movimiento: sube el brazo a un lado hasta la altura del hombro y baja en 2 segundos. Cambia de mano.
Imagina: que dibujas medio círculo con la mano.
Errores: tomar impulso con el cuerpo, baja el peso. Encoger el hombro, bájalo.
Cuidado: si duele al pasar la horizontal, no subas tanto.

## laterales-liga — Laterales con liga
Para qué: hombro de los lados, sin mancuernas.
Lo sientes: en el lado del hombro.
Prepárate: pisa la liga con los dos pies, agarra las puntas con los codos apenas doblados.
Movimiento: sube a los lados hasta la altura de los hombros y baja en 2 segundos. De 15 a 20 por serie.
Imagina: que sirves dos jarras de agua.
Errores: tomar impulso con el cuerpo, quédate quieto. Encoger los hombros, bájalos.
Cuidado: cuando salgan 20 fácil, pisa más abierto para tensar más.

## sentadilla-mancuernas — Sentadilla con dos mancuernas
Para qué: muslos y glúteo cuando una sola mancuerna ya no alcanza.
Lo sientes: en los muslos al bajar y en el glúteo al subir.
Prepárate: mancuernas colgando a los costados, pies al ancho de hombros, puntas un poco hacia afuera, pecho arriba.
Movimiento: baja en 2 a 3 segundos hasta que los muslos queden paralelos al piso, talones pegados. Sube empujando el piso.
Imagina: que te sientas en una silla que está atrás de ti.
Errores: encorvarte por el peso, baja el peso y mira al frente. Rodillas hacia adentro, empújalas hacia afuera.
Cuidado: si molesta la rodilla, baja menos.

## sentadilla-banco — Sentadilla a un banco
Para qué: muslos y glúteo sin equipo, con el banco marcando hasta dónde bajar.
Lo sientes: en los muslos y el glúteo.
Prepárate: de espaldas a un banco, pies al ancho de hombros, brazos al frente.
Movimiento: baja en 2 a 3 segundos hasta tocar el banco sin sentarte y sube empujando el piso. 15 por serie.
Imagina: que apenas rozas el banco con el glúteo.
Errores: dejarte caer en el banco, frena antes de tocar. Rodillas hacia adentro, empújalas hacia afuera.
Cuidado: si molesta la rodilla, usa un banco más alto.

## curl-alternado — Curl alterno con mancuernas
Para qué: bíceps, un brazo a la vez.
Lo sientes: en el frente del brazo.
Prepárate: de pie, mancuernas colgando, codos pegados a los costados, palmas al frente.
Movimiento: sube una mancuerna doblando solo el codo, aprieta arriba y baja en 2 a 3 segundos. Luego la otra.
Imagina: que los codos están clavados a las costillas.
Errores: balancear el cuerpo, baja el peso. Codo hacia adelante, mantenlo atrás.
Cuidado: si duele la muñeca, gira la palma hacia adentro al bajar.

## curl-polea — Curl en polea
Para qué: bíceps con tensión pareja en todo el recorrido.
Lo sientes: en el frente del brazo.
Prepárate: polea abajo con barra recta, de pie, codos pegados a los costados, brazos estirados.
Movimiento: sube doblando solo los codos, aprieta arriba y baja en 2 a 3 segundos hasta estirar sin soltar la tensión.
Imagina: que los codos están clavados a las costillas.
Errores: inclinarte hacia atrás, quédate vertical y baja el peso. Codos hacia adelante, mantenlos atrás.
Cuidado: si duele la muñeca, usa la cuerda.

## triceps-cabeza — Extensión con mancuerna sobre la cabeza, sentado
Para qué: tríceps, sobre todo la parte larga de atrás.
Lo sientes: atrás del brazo, estirándose abajo.
Prepárate: sentado con respaldo, una mancuerna sujeta a dos manos por el disco de arriba, brazos estirados sobre la cabeza, codos cerca de las orejas.
Movimiento: baja detrás de la cabeza en 2 a 3 segundos doblando solo los codos y estira arriba sin abrirlos.
Imagina: que los codos apuntan al techo todo el tiempo.
Errores: abrir los codos, ciérralos hacia las orejas. Arquear la espalda baja, aprieta el abdomen.
Cuidado: si molesta el hombro o el codo, baja menos.

## fondos-banco — Fondos en banco
Para qué: tríceps y un poco de pecho, sin equipo.
Lo sientes: atrás del brazo. No en el frente del hombro.
Prepárate: manos en la orilla del banco a la altura de las caderas, pies al frente, espalda pegada al banco.
Movimiento: baja en 2 segundos doblando los codos hacia atrás, hasta unos 90°, y sube estirando.
Imagina: que la espalda resbala por el banco.
Errores: bajar de más, para en 90°. Alejarte del banco, mantén la espalda rozándolo.
Cuidado: si molesta el hombro, no los uses ese día.

## plancha-rodillas — Plancha con rodillas apoyadas
Para qué: abdomen y espalda baja, con menos carga.
Lo sientes: en el abdomen.
Prepárate: antebrazos en el piso, codos bajo los hombros, rodillas apoyadas, cuerpo en línea recta de la cabeza a las rodillas.
Movimiento: aprieta glúteo y abdomen y sostén 45 segundos. Respira normal.
Imagina: que te quieren pisar el estómago y lo endureces.
Errores: cadera levantada, bájala hasta hacer línea. Cadera caída, aprieta el glúteo.
Cuidado: cuando los 45 segundos salgan fácil, pásate a la plancha normal.

## dead-bug — Dead bug
Para qué: abdomen profundo, cuidando la espalda baja.
Lo sientes: en el abdomen. La espalda baja nunca se despega.
Prepárate: boca arriba, espalda baja pegada al piso, brazos al techo, rodillas dobladas a 90° sobre la cadera.
Movimiento: estira un brazo atrás y la pierna contraria al frente en 2 a 3 segundos, sin despegar la espalda baja. Regresa y cambia.
Imagina: que aplastas un papel bajo la espalda baja.
Errores: despegar la espalda baja, estira menos la pierna. Contener la respiración, exhala al estirar.
Cuidado: si duele la espalda, estira solo la pierna o solo el brazo.

## press-pecho-maquina — Press de pecho en máquina
Para qué: pecho, con la máquina guiando el recorrido.
Lo sientes: en el pecho.
Prepárate: asiento a la altura en que las manijas queden a la altura de los pezones, espalda pegada al respaldo, pies firmes.
Movimiento: empuja al frente sin trabar los codos. Regresa en 2 a 3 segundos sin que las placas choquen.
Imagina: que alejas la máquina de ti.
Errores: despegar la espalda del respaldo, baja el peso. Trabar los codos, para un poco antes.
Cuidado: si molesta el hombro, no regreses tan atrás.

## remo-pecho-maquina — Remo en máquina con pecho apoyado
Para qué: espalda media y dorsal, con el pecho fijo para no mecerte.
Lo sientes: entre los omóplatos y a los costados.
Prepárate: asiento a la altura en que el pecho descanse en el cojín, brazos estirados al frente agarrando las manijas.
Movimiento: jala llevando los codos atrás, pegados al cuerpo o abiertos a 90° si buscas espalda alta. Pausa un segundo y suelta en 2 a 3 segundos.
Imagina: que aprietas una pelota entre los omóplatos.
Errores: despegar el pecho del cojín, baja el peso. Encoger los hombros, bájalos antes de jalar.
Cuidado: si duele la espalda baja, baja el peso.

## remo-polea-una-mano — Remo sentado a una mano en polea
Para qué: dorsal, un lado a la vez.
Lo sientes: en el costado de la espalda, no en el bíceps.
Prepárate: polea baja con manija de una mano, sentado con los pies en la plataforma, espalda recta, brazo estirado.
Movimiento: jala el codo hacia la cadera, pegado al cuerpo. Pausa un segundo y suelta en 2 a 3 segundos. Cambia de mano.
Imagina: que arrancas una podadora.
Errores: girar el torso al jalar, quédate de frente. Jalar hacia el hombro, lleva el codo a la cadera.
Cuidado: si duele la espalda baja, no te estires tanto adelante.

## remo-alto-maquina — Remo alto en máquina
Para qué: espalda alta y parte de atrás del hombro; endereza la postura.
Lo sientes: entre los omóplatos.
Prepárate: asiento a la altura en que las manijas queden a la altura del pecho alto, pecho apoyado si la máquina tiene cojín.
Movimiento: jala con los codos abiertos hacia el pecho alto, aprieta los omóplatos un segundo y suelta en 2 a 3 segundos.
Imagina: que haces alas con los codos.
Errores: encoger los hombros, bájalos antes de jalar. Mecerte, baja el peso.
Cuidado: si pellizca el hombro, cierra un poco los codos.

## prensa-corta — Prensa con recorrido corto
Para qué: muslos y glúteo cuidando la rodilla.
Lo sientes: en los muslos. Nunca dolor en la rodilla.
Prepárate: pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados al asiento, seguros sueltos con las piernas estiradas.
Movimiento: baja en 2 a 3 segundos solo hasta donde la rodilla no moleste, antes de los 90°, y empuja sin trabar arriba.
Imagina: que empujas la pared con los talones.
Errores: bajar hasta donde duele, para antes. Trabar las rodillas arriba, para un poco antes de estirar.
Cuidado: pon los seguros antes de bajarte.

## curl-cuerda — Curl martillo en polea con cuerda
Para qué: bíceps y antebrazo con tensión pareja.
Lo sientes: en el brazo y un poco en el antebrazo.
Prepárate: polea abajo con cuerda, de pie, palmas viéndose entre sí, codos pegados al cuerpo.
Movimiento: sube doblando solo los codos, aprieta arriba y baja en 2 a 3 segundos sin soltar la tensión.
Imagina: que clavas con un martillo hacia tu hombro.
Errores: inclinarte hacia atrás, quédate vertical. Codos hacia adelante, mantenlos atrás.
Cuidado: si duele el codo, usa menos peso.

## elevacion-piernas-piso — Elevación de piernas en el piso
Para qué: abdomen bajo, sin banco.
Lo sientes: en el abdomen, abajo del ombligo. No en la espalda baja.
Prepárate: boca arriba, manos bajo los glúteos, espalda baja pegada al piso.
Movimiento: sube las piernas casi estiradas hasta la vertical y baja en 2 a 3 segundos sin que la espalda baja se despegue.
Imagina: que la espalda baja está pegada al piso con pegamento.
Errores: arquear la espalda, dobla un poco las rodillas. Bajar con impulso, frena antes de llegar abajo.
Cuidado: si jala la espalda baja, hazlas con las rodillas dobladas.

## elevacion-rodillas — Elevación de rodillas dobladas
Para qué: abdomen bajo, con menos carga para la espalda.
Lo sientes: en el abdomen, abajo del ombligo.
Prepárate: boca arriba, manos bajo los glúteos o agarrando el banco, espalda baja pegada, rodillas dobladas.
Movimiento: lleva las rodillas hacia el pecho y baja en 2 a 3 segundos sin que la espalda baja se despegue.
Imagina: que enrollas el abdomen como una alfombra.
Errores: arquear la espalda, no bajes tanto. Bajar con impulso, frena antes de llegar abajo.
Cuidado: cuando salgan 12 fácil, estira un poco más las piernas.

## lagartijas-inclinadas — Lagartijas con las manos en la cama o una mesa firme
Para qué: pecho, tríceps y hombro con menos carga.
Lo sientes: en el pecho.
Prepárate: manos en la cama o una mesa firme un poco más abiertas que los hombros, cuerpo recto, glúteo apretado.
Movimiento: baja en 2 segundos hasta que el pecho quede a un puño del borde, codos a 45°. Sube empujando. Para cuando te queden 2.
Imagina: que empujas la mesa lejos de ti.
Errores: cadera caída, aprieta glúteo y abdomen. Codos abiertos en T, ciérralos a 45°.
Cuidado: cuando salgan 20 fácil, pasa al piso.

## remo-mancuerna-casa — Remo a una mano apoyado en la cama o una silla
Para qué: espalda media y dorsal, en casa.
Lo sientes: en el costado de la espalda, no en el bíceps.
Prepárate: mano y rodilla del mismo lado en la cama o la mano en una silla firme, espalda plana, mancuerna colgando bajo el hombro.
Movimiento: jala el codo hacia la cadera, pegado al cuerpo, hasta que pase la línea de la espalda. Baja en 2 a 3 segundos.
Imagina: que arrancas una podadora.
Errores: girar el torso para subir más, deja el pecho viendo al piso. Jalar hacia el hombro, lleva el codo a la cadera.
Cuidado: si la silla se mueve, usa la cama.
