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

Máximo 2 errores, cada uno con su corrección separada por la primera coma. Máximo 80 palabras por ficha (lo revisa `src/data/fichas.test.ts`). Las dos que dio Fer como tono (press inclinado y jalón) van tal cual aunque pasen de 80.

---

## press-inclinado — Press inclinado con mancuernas
Para qué: pecho de arriba, el que se nota con playera.
Lo sientes: arriba del pecho. Si lo sientes más en el hombro, baja el banco.
Prepárate: banco a 30°, pies firmes, omóplatos juntos y abajo, mancuernas a los lados del pecho.
Movimiento: baja en 2 a 3 segundos con los codos a 45° del cuerpo, no en T, hasta que los codos queden un poco abajo del banco. Sube empujando arriba y un poco hacia adentro.
Imagina: que quieres juntar los bíceps arriba.
Errores: arquear la espalda baja, deja el glúteo pegado al banco. Rebotar abajo, haz una pausa de un segundo.
Cuidado: si duele el frente del hombro, cambia a press en el piso.

## jalon — Jalón al pecho en polea, agarre ancho
Para qué: dorsal, lo que abre la espalda en V.
Lo sientes: a los costados, abajo de las axilas. No en bíceps ni en cuello.
Prepárate: rodillo apretando los muslos, agarre un poco más abierto que los hombros, pecho arriba y apenas inclinado hacia atrás.
Movimiento: jala la barra a la parte alta del pecho bajando los codos a los costados. Pausa un segundo y sube en 2 a 3 segundos hasta estirar sin soltar la tensión.
Imagina: que tus manos son ganchos y jalas con los codos hacia las bolsas de atrás.
Errores: columpiarte para jalar, baja el peso. Hombros a las orejas, bájalos antes de jalar.
Cuidado: si molesta el hombro, usa un agarre más cerrado o con las palmas hacia ti.

## press-militar — Press militar sentado con mancuernas
Para qué: hombro de enfrente y de los lados.
Lo sientes: en los hombros y un poco en tríceps. No en la espalda baja.
Prepárate: respaldo casi vertical, espalda baja pegada, abdomen apretado, mancuernas a la altura de las orejas.
Movimiento: empuja hasta estirar sin trabar los codos. Baja en 2 a 3 segundos hasta las orejas.
Imagina: que empujas el techo con los nudillos.
Errores: arquear la espalda baja, aprieta el abdomen. Bajar de más, para en las orejas.
Cuidado: si pellizca el hombro, usa las palmas viéndose.

## laterales — Elevaciones laterales
Para qué: hombro de los lados, el que te hace ver más ancho.
Lo sientes: en el lado del hombro, no en el cuello.
Prepárate: de pie, mancuernas ligeras a los costados, codos apenas doblados, hombros abajo.
Movimiento: sube a los lados hasta la altura de los hombros, codo más alto que la mano. Baja en 2 segundos.
Imagina: que sirves dos jarras de agua.
Errores: tomar impulso, usa menos peso. Encoger los hombros, bájalos.
Cuidado: si duele al pasar la horizontal, no subas tanto.

## goblet — Sentadilla goblet
Para qué: muslos y glúteo, la base de todo.
Lo sientes: en los muslos al bajar y en el glúteo al subir.
Prepárate: mancuerna vertical pegada al pecho, pies al ancho de hombros, puntas un poco afuera.
Movimiento: baja en 2 a 3 segundos como si te sentaras, hasta muslos paralelos. Pecho arriba, talones pegados. Sube empujando el piso.
Imagina: que te sientas en una silla atrás de ti.
Errores: talones despegados, abre más las puntas. Rodillas hacia adentro, empújalas afuera.
Cuidado: si molesta la rodilla, baja menos.

## curl-z — Curl con barra Z
Para qué: bíceps.
Lo sientes: en el frente del brazo, no en el antebrazo ni en la espalda.
Prepárate: de pie, pies firmes, codos pegados a los costados, barra colgando con los brazos estirados.
Movimiento: sube doblando solo los codos, aprieta arriba un segundo y baja en 2 a 3 segundos hasta estirar.
Imagina: que los codos están clavados a las costillas.
Errores: balancear el cuerpo, baja el peso. Codos hacia adelante, mantenlos atrás.
Cuidado: si duele la muñeca, agarra la parte más inclinada de la barra.

## triceps-polea — Extensión de tríceps en polea alta
Para qué: tríceps, la parte de atrás del brazo.
Lo sientes: atrás del brazo, no en el hombro.
Prepárate: de pie frente a la polea alta, codos pegados a los costados, antebrazos paralelos al piso.
Movimiento: empuja hacia abajo hasta estirar, aprieta un segundo y sube en 2 a 3 segundos hasta que los antebrazos queden paralelos.
Imagina: que solo se mueve el antebrazo, como una bisagra.
Errores: abrir los codos, pégalos al cuerpo. Empujar con el cuerpo, baja el peso.
Cuidado: si molesta el codo, usa la cuerda.

## plancha — Plancha
Para qué: abdomen y espalda baja, para sostener todo lo demás.
Lo sientes: en el abdomen. No en la espalda baja.
Prepárate: antebrazos en el piso, codos bajo los hombros, cuerpo en línea recta de la cabeza a los talones.
Movimiento: aprieta glúteo y abdomen y sostén. Respira normal, mirada al piso.
Imagina: que te quieren pisar el estómago y lo endureces.
Errores: cadera caída, aprieta el glúteo. Cadera levantada, bájala hasta hacer línea.
Cuidado: si duele la espalda baja, apoya las rodillas o cambia a dead bug.

## press-plano — Press plano con mancuernas
Para qué: pecho, sobre todo la parte media.
Lo sientes: en el pecho. Si lo sientes en el hombro, bajas de más.
Prepárate: sube las mancuernas con las rodillas. Pies firmes, omóplatos juntos y abajo.
Movimiento: baja en 2 a 3 segundos con los codos a 45° hasta la altura del pecho. Sube sin chocar las mancuernas.
Imagina: que doblas el banco con la espalda alta.
Errores: rebotar abajo, pausa de un segundo. Codos en T, ciérralos a 45°.
Cuidado: al terminar, mancuernas a los muslos y siéntate.

## remo-polea — Remo sentado en polea baja
Para qué: espalda media y dorsal, lo que te endereza.
Lo sientes: entre los omóplatos y a los costados.
Prepárate: pies en la plataforma, rodillas apenas dobladas, espalda recta, brazos estirados.
Movimiento: jala al abdomen llevando los codos atrás y juntando los omóplatos. Pausa un segundo y suelta en 2 a 3 segundos.
Imagina: que aprietas una pelota entre los omóplatos.
Errores: mecerte con el torso, quédate vertical. Encoger los hombros, bájalos.
Cuidado: si duele la espalda baja, no te estires tanto adelante.

## remo-mancuerna — Remo a una mano apoyado en banco
Para qué: dorsal y espalda media, un lado a la vez.
Lo sientes: en el costado de la espalda, no en el bíceps.
Prepárate: rodilla y mano del mismo lado en el banco, espalda plana, mancuerna colgando.
Movimiento: jala el codo hacia la cadera, pegado al cuerpo, hasta pasar la espalda. Baja en 2 a 3 segundos.
Imagina: que arrancas una podadora.
Errores: girar el torso, pecho viendo al piso. Jalar al hombro, codo a la cadera.
Cuidado: sin banco, mano libre en el mancuernero.

## remo-pecho-apoyado — Remo con pecho apoyado en banco inclinado
Para qué: espalda media y alta; endereza la postura.
Lo sientes: entre los omóplatos.
Prepárate: banco a 30 o 45°, pecho apoyado, barbilla fuera del respaldo. Mancuernas colgando, palmas viéndose.
Movimiento: jala los codos atrás, a unos 45° del cuerpo, hasta pasar la espalda. Aprieta un segundo y baja en 2 a 3 segundos.
Imagina: tus manos son ganchos; jalas con los codos.
Errores: despegar el pecho, baja el peso. Encoger los hombros, bájalos antes de jalar.
Cuidado: si molesta la espalda baja, pásate a la máquina.

## prensa — Prensa de pierna
Para qué: muslos y glúteo con la espalda apoyada.
Lo sientes: en muslos y glúteo. No en rodillas ni espalda baja.
Prepárate: pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados, seguros sueltos.
Movimiento: baja en 2 a 3 segundos hasta 90° en las rodillas. Empuja con todo el pie sin trabar.
Imagina: que empujas la pared con los talones.
Errores: despegar la cadera, baja menos. Trabar las rodillas, para antes de estirar.
Cuidado: pon los seguros antes de bajarte.

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
Prepárate: boca arriba en el banco, manos agarrándolo detrás de la cabeza, espalda baja pegada.
Movimiento: sube las piernas casi estiradas hasta la vertical. Baja en 2 a 3 segundos sin despegar la espalda baja.
Imagina: que la espalda baja está pegada al banco.
Errores: arquear la espalda, dobla un poco las rodillas. Bajar con impulso, frena antes de llegar.
Cuidado: si jala la espalda baja, dobla las rodillas.

## laterales-casa — Laterales con mancuernas de 4 a 5 kg
Para qué: hombro de los lados, el que te hace ver más ancho.
Lo sientes: en el lado del hombro, no en el cuello.
Prepárate: de pie, mancuernas a los costados, codos apenas doblados, hombros abajo.
Movimiento: sube a los lados hasta la altura de los hombros y baja en 2 segundos. De 15 a 20 por serie.
Imagina: que sirves dos jarras de agua.
Errores: tomar impulso, usa menos peso. Encoger los hombros, bájalos antes de subir.
Cuidado: si duele al pasar la horizontal, no subas tanto.

## lagartijas — Lagartijas dejando 2 en reserva
Para qué: pecho, tríceps y hombro de enfrente, sin equipo.
Lo sientes: en el pecho.
Prepárate: manos un poco más abiertas que los hombros, cuerpo recto de la cabeza a los talones, glúteo apretado.
Movimiento: baja en 2 segundos hasta un puño del piso, codos a 45°. Sube empujando. Para cuando te queden 2.
Imagina: que empujas el piso lejos de ti.
Errores: cadera caída, aprieta glúteo y abdomen. Codos abiertos en T, ciérralos a 45°.
Cuidado: si cuestan, manos en la cama o una mesa firme.

## remo-liga — Remo con liga anclada en la puerta
Para qué: espalda media y dorsal, en casa.
Lo sientes: entre los omóplatos.
Prepárate: liga a la altura del pecho, puerta con seguro. Sentado o de pie, a la distancia en que quede tensa con los brazos estirados.
Movimiento: jala los codos atrás pegados al cuerpo, aprieta un segundo y regresa en 2 a 3 segundos.
Imagina: que metes los codos en las bolsas de atrás.
Errores: echarte para atrás, mueve solo los brazos. Soltar de golpe, controla la vuelta.
Cuidado: cuando salgan 15 fácil, un paso más atrás.

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
Prepárate: asiento a la altura en que las manijas queden al nivel del pecho alto, espalda pegada al respaldo.
Movimiento: empuja al frente y arriba sin trabar los codos. Regresa en 2 a 3 segundos sin que las placas choquen.
Imagina: que alejas la máquina de ti.
Errores: despegar la espalda, baja el peso. Trabar los codos, para un poco antes.
Cuidado: si molesta el hombro, sube un poco el asiento.

## lagartijas-pies-banco — Lagartijas con los pies en el banco
Para qué: pecho de arriba y hombro, sin mancuernas.
Lo sientes: arriba del pecho.
Prepárate: pies sobre el banco, manos en el piso un poco más abiertas que los hombros, cuerpo recto, glúteo apretado.
Movimiento: baja en 2 segundos hasta un puño del piso, codos a 45°. Sube empujando. Para cuando te queden 2.
Imagina: que empujas el piso lejos de ti.
Errores: cadera caída, aprieta glúteo y abdomen. Cabeza colgando, mira un punto adelante.
Cuidado: si molesta el hombro, pies en el piso.

## press-piso — Press en el piso con mancuernas
Para qué: pecho y tríceps con menos recorrido, más seguro para el hombro.
Lo sientes: en el pecho y atrás del brazo.
Prepárate: acostado en el piso, rodillas dobladas, mancuernas sobre el pecho con los codos a 45°.
Movimiento: baja en 2 a 3 segundos hasta que los brazos toquen el piso, pausa un segundo y sube.
Imagina: que el piso frena la bajada por ti.
Errores: dejar caer los codos, frena antes de tocar. Rebotar, haz la pausa.
Cuidado: sube y baja las mancuernas desde los muslos.

## dominadas-asistidas — Dominadas asistidas en máquina o con liga
Para qué: dorsal y espalda alta, el camino a la dominada.
Lo sientes: a los costados de la espalda, no en los bíceps.
Prepárate: rodillas en la plataforma o pies en la liga, agarre abierto, brazos estirados.
Movimiento: sube llevando los codos abajo y atrás hasta pasar la barbilla. Baja en 2 a 3 segundos.
Imagina: que jalas la barra hacia tu pecho.
Errores: columpiarte, sube más despacio. Quedarte a medias, lleva el pecho a la barra.
Cuidado: en la máquina, más peso es más ayuda.

## press-militar-pie — Press militar de pie con mancuernas
Para qué: hombro de enfrente y de los lados, sin banco.
Lo sientes: en los hombros. No en la espalda baja.
Prepárate: pies al ancho de hombros, glúteo y abdomen apretados, mancuernas a la altura de las orejas.
Movimiento: empuja hasta estirar sin trabar los codos. Baja en 2 a 3 segundos hasta las orejas.
Imagina: que una cuerda te jala de la coronilla.
Errores: arquear la espalda baja, aprieta el abdomen. Impulso con las piernas, quédate quieto.
Cuidado: un poco menos de peso que sentado.

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
Prepárate: respaldo casi vertical, espalda baja pegada, mancuernas a la altura de las orejas con las palmas viéndose.
Movimiento: empuja arriba y un poco hacia adentro hasta estirar. Baja en 2 a 3 segundos.
Imagina: que las mancuernas suben por un riel.
Errores: arquear la espalda baja, aprieta el abdomen. Abrir los codos, mantenlos al frente.
Cuidado: si aun así duele, deja el hombro ese día.

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
Para qué: muslos y glúteo cuando una mancuerna ya no alcanza.
Lo sientes: en los muslos al bajar y en el glúteo al subir.
Prepárate: mancuernas colgando a los costados, pies al ancho de hombros, puntas un poco afuera, pecho arriba.
Movimiento: baja en 2 a 3 segundos hasta muslos paralelos, talones pegados. Sube empujando el piso.
Imagina: que te sientas en una silla atrás de ti.
Errores: encorvarte, baja el peso y mira al frente. Rodillas hacia adentro, empújalas afuera.
Cuidado: si molesta la rodilla, baja menos.

## sentadilla-banco — Sentadilla a un banco
Para qué: muslos y glúteo sin equipo, con el banco marcando hasta dónde bajar.
Lo sientes: en los muslos y el glúteo.
Prepárate: de espaldas a un banco, pies al ancho de hombros, brazos al frente.
Movimiento: baja en 2 a 3 segundos hasta rozar el banco sin sentarte y sube empujando el piso. 15 por serie.
Imagina: que apenas tocas el banco con el glúteo.
Errores: dejarte caer, frena antes de tocar. Rodillas hacia adentro, empújalas hacia afuera.
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

## triceps-cabeza — Extensión de tríceps con mancuerna sobre la cabeza, sentado
Para qué: tríceps, sobre todo la cabeza larga.
Lo sientes: atrás del brazo.
Prepárate: respaldo derecho, espalda pegada, una mancuerna a dos manos por el disco de arriba, brazos estirados sobre la cabeza.
Movimiento: baja detrás de la cabeza en 2 a 3 segundos doblando solo los codos. Sube hasta estirar.
Imagina: tu brazo es una bisagra y solo se mueve el codo.
Errores: abrir los codos, apúntalos al techo. Arquear la espalda baja, pégala al respaldo.
Cuidado: si molesta el codo o el hombro, polea alta.

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
Movimiento: estira un brazo atrás y la pierna contraria al frente en 2 a 3 segundos. Regresa y cambia.
Imagina: que aplastas un papel bajo la espalda baja.
Errores: despegar la espalda baja, estira menos la pierna. Contener la respiración, exhala al estirar.
Cuidado: si duele la espalda, estira solo la pierna.

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
Prepárate: asiento a la altura en que el pecho descanse en el cojín, brazos estirados en las manijas.
Movimiento: jala llevando los codos atrás, pegados o abiertos a 90° para espalda alta. Pausa y suelta en 2 a 3 segundos.
Imagina: que aprietas una pelota entre los omóplatos.
Errores: despegar el pecho, baja el peso. Encoger los hombros, bájalos.
Cuidado: si duele la espalda baja, menos peso.

## remo-polea-una-mano — Remo sentado a una mano en polea
Para qué: dorsal, un lado a la vez.
Lo sientes: en el costado de la espalda, no en el bíceps.
Prepárate: polea baja con manija de una mano, pies en la plataforma, espalda recta, brazo estirado.
Movimiento: jala el codo hacia la cadera, pegado al cuerpo. Pausa y suelta en 2 a 3 segundos. Cambia de mano.
Imagina: que arrancas una podadora.
Errores: girar el torso, quédate de frente. Jalar al hombro, lleva el codo a la cadera.
Cuidado: si duele la espalda baja, no te estires tanto.

## remo-alto-maquina — Remo alto en máquina
Para qué: espalda alta y parte de atrás del hombro; endereza la postura.
Lo sientes: entre los omóplatos.
Prepárate: asiento a la altura en que las manijas queden al nivel del pecho alto, pecho apoyado si hay cojín.
Movimiento: jala con los codos abiertos hacia el pecho alto, aprieta los omóplatos un segundo y suelta en 2 a 3 segundos.
Imagina: que haces alas con los codos.
Errores: encoger los hombros, bájalos antes de jalar. Mecerte, baja el peso.
Cuidado: si pellizca el hombro, cierra un poco los codos.

## prensa-corta — Prensa con recorrido corto
Para qué: muslos y glúteo cuidando la rodilla.
Lo sientes: en los muslos. Nunca dolor en la rodilla.
Prepárate: pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados, seguros sueltos con las piernas estiradas.
Movimiento: baja en 2 a 3 segundos solo hasta donde la rodilla no moleste, antes de 90°, y empuja sin trabar.
Imagina: que empujas la pared con los talones.
Errores: bajar hasta donde duele, para antes. Trabar las rodillas, para antes de estirar.
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
Movimiento: sube las piernas casi estiradas hasta la vertical y baja en 2 a 3 segundos sin despegar la espalda baja.
Imagina: que la espalda baja está pegada al piso con pegamento.
Errores: arquear la espalda, dobla un poco las rodillas. Bajar con impulso, frena antes de llegar abajo.
Cuidado: si jala la espalda baja, dobla las rodillas.

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
Prepárate: mano y rodilla en la cama, o la mano en una silla firme, espalda plana, mancuerna colgando.
Movimiento: jala el codo hacia la cadera, pegado al cuerpo, hasta pasar la espalda. Baja en 2 a 3 segundos.
Imagina: que arrancas una podadora.
Errores: girar el torso, pecho viendo al piso. Jalar al hombro, codo a la cadera.
Cuidado: si la silla se mueve, usa la cama.

## jalon-cerrado — Jalón al pecho con agarre cerrado
Para qué: dorsal, la V de la espalda.
Lo sientes: a los costados, abajo de las axilas.
Prepárate: misma barra del jalón, manos al ancho de los hombros, rodillas trabadas, pecho arriba.
Movimiento: jala al pecho alto con los codos pegados al cuerpo. Pausa corta y sube en 2 a 3 segundos hasta estirar.
Imagina: que llevas los codos a las bolsas del pantalón.
Errores: echarte atrás, torso casi derecho. Quedarte corto arriba, estira completo.
Cuidado: si molesta el hombro o el codo, agarre en V.

## aperturas-maquina — Aperturas en máquina
Para qué: la forma del pecho.
Lo sientes: el pecho apretando, no el hombro.
Prepárate: la máquina de dos manijas que se juntan al frente (Pec Deck). Manijas a la altura del pecho, espalda pegada, codos casi fijos.
Movimiento: junta en arco, aprieta un segundo y regresa en 2 a 3 segundos hasta la línea del cuerpo.
Imagina: que abrazas un barril.
Errores: abrir más atrás de los hombros, para en la línea del cuerpo. Doblar los codos, déjalos fijos.
Cuidado: si molesta el hombro, press en máquina.

## aperturas-mancuernas — Aperturas con mancuernas en banco plano
Para qué: pecho, cuando no hay máquina.
Lo sientes: el pecho estirándose al abrir y apretando al cerrar.
Prepárate: acostado en banco plano, mancuernas arriba del pecho, palmas viéndose, codos apenas doblados.
Movimiento: abre en arco en 2 a 3 segundos hasta la altura del pecho, no más. Sube por el mismo arco.
Imagina: que abrazas un árbol grueso.
Errores: doblar los codos y hacerlo press, déjalos fijos. Bajar de más, para a la altura del pecho.
Cuidado: empieza ligero; si molesta el hombro, press en máquina.

## cruce-poleas — Cruce de poleas de pie
Para qué: pecho, sin máquina ni banco.
Lo sientes: el pecho apretando al juntar.
Prepárate: entre las poleas altas, una manija en cada mano, un pie adelante, torso apenas inclinado.
Movimiento: junta las manos al frente y un poco abajo, codos apenas doblados y fijos. Aprieta un segundo y regresa en 2 a 3 segundos.
Imagina: que abrazas un barril.
Errores: doblar los brazos para jalar, déjalos fijos. Dejar que el cable te jale, controla la vuelta.
Cuidado: no abras más allá de la línea de los hombros.
