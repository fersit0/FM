// Fichas de técnica (DISENO-FM-v2.md, 8.2). Español mexicano, directo, frases cortas.
// Complementan la sección 7 del brief: no agregan ejercicios, explican los que hay.
export interface Ficha {
  trabaja: string
  sentir: string
  preparacion: string[]
  ejecucion: string[]
  errores: { error: string; correccion: string }[]
  peso: string
  alternativa: string
}

const REGLA = 'Si terminas la última serie con más de 2 reps de sobra, sube. Si no llegas al mínimo del rango, baja.'

export const FICHAS: Record<string, Ficha> = {
  A1: {
    trabaja: 'Pecho, sobre todo la parte media. Ayudan hombro frontal y tríceps.',
    sentir: 'El pecho estirándose abajo y apretándose arriba. Si lo sientes en el hombro de frente o te punza, los codos van muy abiertos o bajas de más.',
    preparacion: [
      'Banco plano libre. Lleva las mancuernas al banco, no las cargues acostado.',
      'Siéntate en la orilla con las mancuernas sobre los muslos; al acostarte impúlsalas una a la vez con la rodilla.',
      'Pies firmes en el piso, espalda alta pegada, omóplatos juntos y abajo.',
    ],
    ejecucion: [
      'Arranca con las mancuernas arriba, sobre el pecho, codos a unos 45° del cuerpo.',
      'Inhala y baja en 2 segundos hasta que los codos queden a la altura del pecho o poco más abajo.',
      'Exhala y empuja hasta arriba sin chocar las mancuernas.',
      'Al terminar, baja las mancuernas a los muslos y siéntate; no las sueltes al piso.',
    ],
    errores: [
      { error: 'Rebotar abajo.', correccion: 'Frena 2 segundos en la bajada y arranca desde quieto.' },
      { error: 'Arquear la espalda baja de más.', correccion: 'Apoya los pies y aprieta el abdomen; el arco es solo el natural.' },
      { error: 'Subir hacia la cara.', correccion: 'Empuja recto hacia el techo, sobre el pecho.' },
      { error: 'Abrir codos a 90°.', correccion: 'Métélos a 45°; el hombro lo agradece.' },
    ],
    peso: `Primera vez: un par con el que 10 reps salgan con 2 de sobra, unos 12 a 14 kg por mano. ${REGLA}`,
    alternativa: 'Banco ocupado: press en el piso con mancuernas. Sin mancuernas suficientes: lagartijas con los pies sobre el banco. Máquina de press de pecho si está libre.',
  },
  A2: {
    trabaja: 'Dorsal ancho y espalda alta. Ayudan bíceps y antebrazo.',
    sentir: 'Los costados de la espalda jalando, como si metieras los codos en las bolsas del pantalón. Si arden los bíceps o el antebrazo primero, estás jalando con las manos.',
    preparacion: [
      'Torre alta con asiento y cojín para las rodillas; barra ancha colgando.',
      'Ajusta el cojín para que las rodillas queden trabadas sin apretar.',
      'Agarre un poco más ancho que los hombros, palmas al frente. Pecho arriba, inclinación mínima hacia atrás.',
    ],
    ejecucion: [
      'Brazos estirados del todo arriba, hombros relajados.',
      'Exhala y jala la barra hasta la parte alta del pecho llevando los codos abajo y atrás.',
      'Pausa corta con los omóplatos juntos.',
      'Inhala y suelta controlado hasta estirar del todo, sin que el cuerpo se levante.',
    ],
    errores: [
      { error: 'Jalar detrás de la nuca.', correccion: 'Siempre al frente, a la clavícula.' },
      { error: 'Columpiarse.', correccion: 'Baja el peso y quédate casi vertical.' },
      { error: 'Jalar con los brazos.', correccion: 'Piensa en llevar los codos hacia la cadera, las manos son ganchos.' },
      { error: 'No estirar arriba.', correccion: 'Cada rep empieza con los brazos completamente estirados.' },
    ],
    peso: `Primera vez: una placa con la que 12 reps salgan con 2 de sobra, más o menos la mitad de tu peso corporal. ${REGLA}`,
    alternativa: 'Torre ocupada: dominadas asistidas si hay máquina; si no, remo con mancuerna a una mano apoyado en el banco.',
  },
  A3: {
    trabaja: 'Cuádriceps y glúteo. Ayudan abdomen y espalda baja para sostener el tronco.',
    sentir: 'Los muslos al bajar y el glúteo al empujar para subir. Si te arde la espalda baja, te encorvaste o el peso te jaló hacia adelante.',
    preparacion: [
      'Una mancuerna. Frente a un espejo si se puede.',
      'Sujétala vertical, pegada al pecho, por la cabeza de arriba con las dos manos.',
      'Pies al ancho de hombros, puntas un poco hacia afuera.',
    ],
    ejecucion: [
      'Inhala y baja como si te sentaras, rodillas siguiendo la dirección de los pies.',
      'Llega hasta que los muslos queden al menos paralelos al piso. Pecho arriba, talones pegados.',
      'Exhala y sube empujando el piso con todo el pie.',
      'Tempo: 2 segundos abajo, 1 arriba.',
    ],
    errores: [
      { error: 'Talones despegándose.', correccion: 'Reparte el peso en todo el pie; si no puedes, abre un poco más las puntas.' },
      { error: 'Rodillas cerrándose hacia adentro.', correccion: 'Empuja las rodillas hacia afuera siguiendo los pies.' },
      { error: 'Encorvarse.', correccion: 'La mancuerna pegada al pecho y la mirada al frente.' },
      { error: 'Bajar poco.', correccion: 'Baja el peso hasta que llegues al paralelo con buena forma.' },
    ],
    peso: `Primera vez: 12 a 16 kg. Sube rápido: aquí se aguanta más de lo que parece. ${REGLA} Cuando la mancuerna más pesada ya sale fácil, pásate a prensa o a dos mancuernas a los costados.`,
    alternativa: 'Sin mancuernas libres: sentadilla a un banco con peso corporal, 3 × 15. Rodilla molesta: prensa con recorrido corto.',
  },
  A4: {
    trabaja: 'Hombro, sobre todo la parte frontal y media. Ayuda el tríceps.',
    sentir: 'El hombro trabajando arriba y a los lados. Si punza adelante o arde el cuello, estás empujando hacia adelante o encogiendo los hombros.',
    preparacion: [
      'Banco con respaldo ajustable, casi vertical: un clic antes de 90°.',
      'Mancuernas a la altura de las orejas, palmas al frente.',
      'Espalda baja pegada al respaldo, abdomen apretado, pies firmes.',
    ],
    ejecucion: [
      'Exhala y empuja hacia arriba hasta estirar sin trabar los codos.',
      'Las mancuernas suben en línea recta, no hacia adelante ni se juntan de golpe.',
      'Inhala y baja controlado, 2 segundos, hasta la altura de las orejas.',
    ],
    errores: [
      { error: 'Arquear la espalda.', correccion: 'Menos peso y espalda baja pegada al respaldo.' },
      { error: 'Bajar de más.', correccion: 'Hasta las orejas, no hasta los hombros.' },
      { error: 'Impulso con las piernas.', correccion: 'Si necesitas patear, el peso es grande.' },
    ],
    peso: `Primera vez: 8 a 10 kg por mano, con 10 reps y 2 de sobra. ${REGLA}`,
    alternativa: 'Sin banco con respaldo: de pie, con un poco menos de peso y glúteos apretados. Banco ocupado: máquina de press de hombro. Hombro molesto: agarre neutro, palmas mirándose.',
  },
  A5: {
    trabaja: 'Bíceps. Ayuda el antebrazo.',
    sentir: 'El bíceps apretando arriba y estirándose abajo. Si lo sientes en la espalda baja o en los hombros, te estás balanceando.',
    preparacion: [
      'Barra Z con discos, o una de las fijas si el gym las tiene.',
      'De pie, pies al ancho de la cadera, codos pegados a los costados.',
    ],
    ejecucion: [
      'Exhala y sube doblando solo los codos; aprieta arriba un segundo.',
      'Inhala y baja en 2 segundos hasta estirar del todo.',
      'Los codos no se mueven de su lugar en toda la serie.',
    ],
    errores: [
      { error: 'Balancear el cuerpo.', correccion: 'Pega la espalda a una pared o baja el peso.' },
      { error: 'Codos hacia adelante.', correccion: 'Imagina que los tienes amarrados a las costillas.' },
      { error: 'No bajar completo.', correccion: 'Cada rep termina con el brazo estirado.' },
    ],
    peso: `Primera vez: la barra fija de 10 a 15 kg. ${REGLA}`,
    alternativa: 'Sin barra: curl alternado con mancuernas. Barra ocupada: curl en polea baja con barra recta.',
  },
  A6: {
    trabaja: 'Tríceps, las tres cabezas.',
    sentir: 'La parte de atrás del brazo apretando al estirar. Si lo sientes en el hombro o el pecho, te estás inclinando y empujando con el cuerpo.',
    preparacion: [
      'Polea alta de la torre del jalón, con barra recta corta o cuerda.',
      'De pie, un pie ligeramente adelante, codos pegados a los costados, antebrazos paralelos al piso.',
    ],
    ejecucion: [
      'Exhala y empuja hacia abajo hasta estirar los codos.',
      'Aprieta un segundo abajo.',
      'Inhala y sube controlado hasta que los antebrazos vuelvan a quedar paralelos al piso.',
      'Solo se mueven los antebrazos.',
    ],
    errores: [
      { error: 'Abrir los codos.', correccion: 'Pégalos a las costillas; si se abren, baja el peso.' },
      { error: 'Inclinarse y empujar con el cuerpo.', correccion: 'Quédate derecho; el peso lo mueve el tríceps, no la espalda.' },
    ],
    peso: `Primera vez: dos o tres placas ligeras, 12 reps limpias con 2 de sobra. ${REGLA}`,
    alternativa: 'Sin polea: extensión sobre la cabeza con una mancuerna a dos manos, sentado. Polea ocupada: fondos en banco.',
  },
  A7: {
    trabaja: 'Abdomen profundo y recto abdominal. Ayudan glúteos y hombros para sostener.',
    sentir: 'El abdomen apretado como si esperaras un golpe, y los glúteos firmes. Si arde la espalda baja, la cadera se cayó.',
    preparacion: [
      'Antebrazos en el piso, codos justo debajo de los hombros.',
      'Pies juntos o al ancho de la cadera, puntas apoyadas.',
    ],
    ejecucion: [
      'Levanta el cuerpo en una línea recta de la cabeza a los talones.',
      'Aprieta glúteos y abdomen, mirada al piso.',
      'Respira normal, sin contener el aire, hasta completar el tiempo.',
    ],
    errores: [
      { error: 'Cadera caída.', correccion: 'Aprieta los glúteos y mete un poco la pelvis.' },
      { error: 'Cadera levantada.', correccion: 'Baja hasta que hombros, cadera y talones queden en línea.' },
      { error: 'Contener la respiración.', correccion: 'Cuenta las respiraciones en vez de los segundos.' },
    ],
    peso: 'No lleva peso. Empieza con 40 segundos por serie; si terminas con más de 10 segundos de sobra, sube a 50.',
    alternativa: 'Si no se sostiene: plancha con rodillas apoyadas, misma duración. Piso ocupado o sucio: dead bug, 3 × 10 por lado.',
  },
  B1: {
    trabaja: 'Pecho, sobre todo la parte alta. Ayudan hombro frontal y tríceps.',
    sentir: 'La parte alta del pecho estirándose abajo y apretando arriba. Si punza el hombro, el banco está muy inclinado o los codos muy abiertos.',
    preparacion: [
      'Banco con respaldo ajustable a 30°, uno o dos clics arriba de plano. Más de 45° ya es hombro.',
      'Igual que el press plano: mancuernas sobre los muslos, impúlsalas una a la vez al acostarte.',
      'Espalda alta pegada, omóplatos juntos y abajo, pies firmes.',
    ],
    ejecucion: [
      'Inhala y baja en 2 segundos hasta la parte alta del pecho.',
      'Exhala y empuja hacia arriba y un poco atrás.',
      'Codos a unos 45° del cuerpo; las mancuernas no chocan arriba.',
    ],
    errores: [
      { error: 'Banco muy inclinado.', correccion: 'Máximo dos clics arriba de plano.' },
      { error: 'Codos abiertos.', correccion: 'Métélos a 45°.' },
      { error: 'Rebotar abajo.', correccion: 'Frena 2 segundos y arranca desde quieto.' },
    ],
    peso: `Primera vez: un par más ligero que el del press plano, unos 10 a 12 kg por mano. ${REGLA}`,
    alternativa: 'Sin banco ajustable: press plano ese día. Banco ocupado: máquina de press inclinado o lagartijas con los pies en el banco.',
  },
  B2: {
    trabaja: 'Espalda media y dorsal. Ayudan bíceps y hombro posterior.',
    sentir: 'Los omóplatos juntándose y la espalda media apretando. Si lo sientes en la espalda baja, te estás meciendo con el torso.',
    preparacion: [
      'Polea baja de la torre del jalón con el agarre en V, o la máquina de remo con plataforma.',
      'Pies en la plataforma o firmes en el piso, rodillas apenas dobladas.',
      'Espalda recta, brazos estirados al frente, pecho arriba.',
    ],
    ejecucion: [
      'Exhala y jala el agarre hacia el abdomen llevando los codos atrás.',
      'Pausa corta con los omóplatos juntos.',
      'Inhala y suelta controlado hasta estirar los brazos, sin encorvarte.',
      'El torso se queda casi quieto toda la serie.',
    ],
    errores: [
      { error: 'Mecerse con el torso.', correccion: 'Baja el peso y mantén el pecho arriba todo el tiempo.' },
      { error: 'Encoger los hombros.', correccion: 'Hombros abajo y lejos de las orejas.' },
      { error: 'Jalar hacia el pecho alto.', correccion: 'El agarre llega al ombligo, no a la clavícula.' },
    ],
    peso: `Primera vez: parecido al jalón o un poco menos. ${REGLA} Si la polea ya no alcanza, agrega una pausa de 2 segundos atrás.`,
    alternativa: 'Sin polea: remo con mancuerna a una mano apoyado en banco. Ocupada: máquina de remo con pecho apoyado.',
  },
  B3: {
    trabaja: 'Cuádriceps y glúteo. Ayudan isquiotibiales.',
    sentir: 'Los muslos llenándose al bajar y el glúteo al empujar. Si duele la rodilla por delante, estás trabando arriba o bajando de más.',
    preparacion: [
      'Máquina grande con asiento reclinado y plataforma inclinada arriba; los discos van en los brazos laterales.',
      'Pies al ancho de hombros a media plataforma.',
      'Espalda baja y glúteos pegados al asiento. Suelta los seguros con las piernas ya estiradas.',
    ],
    ejecucion: [
      'Inhala y baja controlado hasta unos 90° en las rodillas.',
      'Exhala y empuja con todo el pie sin trabar las rodillas arriba.',
      'Tempo: 2 segundos abajo, 1 arriba.',
      'Al terminar, pon los seguros antes de soltar.',
    ],
    errores: [
      { error: 'Despegar la cadera del asiento.', correccion: 'Estás bajando de más; para en 90°.' },
      { error: 'Trabar las rodillas arriba.', correccion: 'Deja los últimos grados sin estirar.' },
      { error: 'Bajar poco.', correccion: 'Menos peso, más recorrido.' },
      { error: 'No poner los seguros al terminar.', correccion: 'Seguros primero, luego sales.' },
    ],
    peso: `Primera vez: la máquina sola más 20 kg por lado; sube por 10. ${REGLA}`,
    alternativa: 'No se ubica u ocupada: sentadilla goblet. Sin nada libre: sentadilla a un banco con peso corporal, 3 × 15 a 20.',
  },
  B4: {
    trabaja: 'Hombro medio, el que da anchura.',
    sentir: 'Un ardor a los lados del hombro al pasar de 10 reps. Si lo sientes en el cuello, estás encogiendo los hombros.',
    preparacion: [
      'Mancuernas ligeras: empieza con las que parezcan poca cosa.',
      'De pie, mancuernas a los costados, codos apenas doblados, hombros abajo.',
    ],
    ejecucion: [
      'Exhala y sube a los lados hasta la altura de los hombros, guiando con los codos.',
      'Inhala y baja en 2 segundos.',
      'Nada de impulso: si tienes que columpiarte, el peso es grande.',
    ],
    errores: [
      { error: 'Impulso con el cuerpo.', correccion: 'Hazlas sentado en la orilla del banco.' },
      { error: 'Pasar de los hombros.', correccion: 'Para en horizontal; más arriba ya no trabaja el hombro medio.' },
      { error: 'Encoger los hombros.', correccion: 'Hombros lejos de las orejas toda la serie.' },
    ],
    peso: `Primera vez: 4 a 6 kg por mano. Aquí se sube de a 1 kg. ${REGLA}`,
    alternativa: 'Sin mancuernas chicas: en polea baja a una mano, cruzando el cable frente al cuerpo.',
  },
  B5: {
    trabaja: 'Bíceps y braquial, el músculo debajo del bíceps. Ayuda el antebrazo.',
    sentir: 'El brazo entero apretando, más hacia afuera que en el curl normal. Si arde la muñeca, la estás doblando.',
    preparacion: [
      'Mancuernas con las palmas mirándose, como si sostuvieras un martillo.',
      'De pie, codos pegados a los costados.',
    ],
    ejecucion: [
      'Exhala y sube con las palmas mirándose todo el recorrido.',
      'Aprieta arriba un segundo.',
      'Inhala y baja controlado hasta estirar.',
    ],
    errores: [
      { error: 'Balancear el cuerpo.', correccion: 'Baja el peso y quédate quieto.' },
      { error: 'Girar la muñeca arriba.', correccion: 'Las palmas se miran de principio a fin.' },
    ],
    peso: `Primera vez: 8 a 10 kg por mano. ${REGLA}`,
    alternativa: 'Mancuernas ocupadas: curl con cuerda en polea baja. Sin polea: curl alternado con mancuernas.',
  },
  B6: {
    trabaja: 'Abdomen bajo y flexores de cadera.',
    sentir: 'La parte baja del abdomen apretando al subir. Si arde la espalda baja, se despegó del banco.',
    preparacion: [
      'Banco plano, acostado boca arriba, manos agarrando el banco detrás de la cabeza.',
      'Espalda baja pegada al banco antes de empezar.',
    ],
    ejecucion: [
      'Exhala y sube las piernas casi estiradas hasta la vertical.',
      'Inhala y baja controlado, 2 segundos, sin que la espalda baja se despegue.',
      'Para antes de que los talones toquen el banco.',
    ],
    errores: [
      { error: 'Arquear la espalda.', correccion: 'No bajes tanto: para donde la espalda se quiera despegar.' },
      { error: 'Bajar con impulso.', correccion: 'Cuenta 2 segundos en cada bajada.' },
    ],
    peso: 'No lleva peso. Si 12 reps salen fáciles, baja más lento o sostén un segundo arriba.',
    alternativa: 'Sin banco: en el piso con las manos bajo los glúteos. Si cuesta: rodillas dobladas. Sin banco ni piso limpio: dead bug.',
  },
}
