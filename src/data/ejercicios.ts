// Biblioteca de ejercicios: RUTINA-FINAL.md versión 7 con MANANAS-30.md (versión 8) encima. Ids estables por movimiento;
// un id compartido entre ejercicio y alternativa (o entre sesiones) comparte historial. Sin pares: cada ejercicio termina
// sus series y luego el siguiente. Dos sesiones de club que se alternan, de unos 30 min: A empuje y B jalón. La C
// (espalda y hombro) ya no se ofrece: se queda aquí para que su historial se siga viendo.
import type { Ejercicio, Alternativa, Letra, Zona } from './tipos'

const alt = (a: Omit<Alternativa, 'modo' | 'tecnica' | 'errores'> & Partial<Pick<Alternativa, 'modo' | 'tecnica' | 'errores'>>): Alternativa => ({ modo: 'peso', tecnica: [], errores: [], ...a })

export const ZONA_NOMBRE: Record<Zona, string> = { bancos: 'Bancos', poleas: 'Poleas', terraza: 'Terraza' }
export const ZONA_DETALLE: Record<Zona, string> = {
  bancos: 'Adentro: bancos planos y reclinables, y mancuernas.',
  poleas: 'La máquina de jalón al pecho, la de remo sentado y la polea de pie con cuerda para tríceps.',
  terraza: 'Mancuernas, colchonetas y el saco de box.',
}

export const CALENTAMIENTO = {
  nombre: 'Calentamiento', minCompleta: 3, minCorta: 1,
  texto: 'Elíptica o caminadora 3 min, ritmo en el que puedes platicar. En la corta, solo la serie de aproximación.',
  /** la corta no lleva cardio: una serie de aproximación del primer ejercicio (MANANAS-30.md, 2) */
  textoCorta: 'Serie de aproximación: 10 repeticiones con la mitad del peso del primer ejercicio.',
  siOcupada: 'Si las dos están ocupadas: bici fija.',
}
/** Ya no hay cierre de cardio (MANANAS-30.md, 2): de las pesas a la regadera. Se queda la definición por las sesiones viejas. */
export const CIERRE = {
  nombre: 'Cierre', minCompleta: 10, minCorta: 5, minTerminarAqui: 5,
  texto: 'Sin cierre de cardio: de las pesas a la regadera.',
  /** con 10 min son cinco vueltas; con 5 (corta o "Terminar aquí"), hasta que se acabe */
  saco: (min: number) => `Saco: 1 min fuerte y 1 min suave, ${min >= 10 ? 'cinco veces' : `hasta los ${min}`}.`,
}
export const REGLAS_GLOBALES: { titulo: string; texto: string }[] = [
  { titulo: 'Esfuerzo', texto: 'Terminar cada serie con 1 o 2 repeticiones en reserva. Si la última salió fácil, el peso era chico. Si no llegaste al mínimo del rango, era grande.' },
  { titulo: 'Ajuste dentro de la sesión', texto: 'Si la primera serie pasó del número alto con 3 o más en reserva, sube un escalón para la siguiente; si no llegó al número bajo, baja uno. Un escalón: 5 lb por mano en mancuernas (1 kg en las laterales de casa) o una placa en máquina.' },
  { titulo: 'Serie de aproximación', texto: 'En el primer ejercicio de la sesión y en el primer press si no es el primero, 10 repeticiones con la mitad del peso. No se registra.' },
  { titulo: 'Series seguidas', texto: 'Cada ejercicio se termina completo antes de pasar al siguiente. El descanso corre al tocar la serie.' },
  { titulo: 'Zonas', texto: 'La A se hace toda en bancos. La B empieza en poleas y termina en la terraza. Si algo está ocupado, "Ocupado: después" lo manda al final de su zona.' },
  { titulo: 'Qué sesión toca', texto: 'Entre semana te bañas en el club: cualquier mañana de lunes a viernes es de club y las pesas son lo que quepa. A (empuje) y B (jalón) se alternan sin reiniciar por semana: toca la contraria de la última. Una de club por día. Si llegas tarde, solo regadera: llegar cuenta. La meta es llegar 5 veces y hacer pesas 3 o 4.' },
  { titulo: 'Frida', texto: 'Con Frida, a su ritmo y con su app. Es extra: se registra cuando pasa, con Pierna o Torso, y cuenta como pesas. Torso cuenta como B (después toca A); pierna no mueve la rotación.' },
  { titulo: 'Versión automática', texto: 'Al tocar Empezar, la app ve la hora real. Entre semana antes de las 12 la última pesa sale de tus ajustes (salida del club menos minutos de baño): completa si caben al menos los dos primeros ejercicios; si no, corta; si tampoco, solo regadera. En la noche y en fin de semana la última pesa es a las 21:15, el domingo a las 18:45: completa, corta o casa. El lunes en la tarde el club no abre. Si a media sesión no alcanza, al llegar al segundo ejercicio la app empieza a quitar series del último, luego ese ejercicio y luego lo mismo con el tercero. Los dos primeros no se tocan.' },
  { titulo: 'Terminar aquí', texto: 'Siempre a la mano durante la sesión: cierra con lo hecho y cuenta como pesas.' },
  { titulo: 'Dolor', texto: 'Molestia muscular es normal; dolor agudo en una articulación (hombro, codo, rodilla, espalda baja) no. Si aparece, cambiar a la alternativa ese día. No se aguanta.' },
  { titulo: 'Semana pesada', texto: 'Si dos semanas seguidas se llega muerto, la siguiente se hacen 2 series por ejercicio con el mismo peso y se retoma. La app lo ofrece, no lo impone.' },
]
export const VERSION_CORTA_TEXTO = 'Unos 14 min: la serie de aproximación y los dos primeros ejercicios a 3 series (A: press inclinado y laterales; B: jalón y remo). Cuenta como sesión de pesas. La app la elige sola por la hora.'
export const REGLA_ALTERNATIVA = 'Primero "Ocupado: después". Si sigue ocupado, la alternativa: solo mancuernas, banco, colchoneta o el cuerpo, en la misma zona o en la terraza. Se oculta si su id ya está en la sesión.'

// ---- alternativas compartidas (mismo id = mismo historial) ----
const remoMancuerna = (caso: string): Alternativa => alt({ id: 'remo-mancuerna', nombre: 'Remo a una mano con mancuerna, jalando hacia la cadera', caso, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, porLado: true, colocacion: 'Una rodilla y la mano del mismo lado en un banco plano, espalda plana, la mancuerna colgando bajo el hombro.', tecnica: ['Jala el codo hacia la cadera, pegado al cuerpo.', 'Baja en 2 a 3 segundos hasta estirar.'], ilustracion: 'remo-mancuerna' })
const pressPiso = (caso: string, nombre = 'Press en el piso con mancuernas', series = 3): Alternativa => alt({ id: 'press-piso', nombre, caso, series, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Acostado en la colchoneta, mismas reps.', 'La amplitud es menor y es más seguro para el hombro.'], ilustracion: 'press-piso' })
const lagartijas = (caso: string, series = 3): Alternativa => alt({ id: 'lagartijas', nombre: 'Lagartijas', caso, series, repsMin: 0, repsMax: 0, descansoSeg: 90, modo: 'corporal', tecnica: ['Al tope dejando 2 en reserva.'], ilustracion: 'lagartijas' })
const tricepsPatada = (caso: string, nombre: string, series = 2): Alternativa => alt({ id: 'triceps-patada', nombre, caso, series, repsMin: 10, repsMax: 12, descansoSeg: 60, porLado: true, colocacion: 'Una mano y una rodilla en el banco, espalda plana; el codo pegado al cuerpo y doblado a 90°.', tecnica: ['Estira el brazo hacia atrás hasta que quede recto.', 'Regresa a 90° en 2 a 3 segundos.'], ilustracion: 'triceps-patada' })
const curlAlternadoAlt = (caso: string, series: number): Alternativa => alt({ id: 'curl-alternado', nombre: 'Curl con mancuernas', caso, series, repsMin: 10, repsMax: 12, descansoSeg: 60, tecnica: ['Codos pegados a las costillas.', 'Sube sin mover el codo, baja en 2 a 3 segundos.'], ilustracion: 'curl-alternado' })
const crunchAlt = (caso: string, series = 3): Alternativa => alt({ id: 'crunch', nombre: 'Crunch en colchoneta', caso, series, repsMin: 15, repsMax: 20, descansoSeg: 45, modo: 'corporal', tecnica: ['Despega los hombros del piso subiendo las costillas hacia la cadera.', 'Baja lento sin descansar la cabeza.'], ilustracion: 'crunch' })
const elevacionPiernasAlt = (caso: string, series = 2): Alternativa => alt({ id: 'elevacion-piernas', nombre: 'Elevación de piernas en colchoneta', caso, series, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal', tecnica: ['Espalda baja pegada, piernas casi estiradas hasta la vertical.', 'Baja controlado.'], ilustracion: 'elevacion-piernas' })
const lateralesLiga: Alternativa = alt({ id: 'laterales-liga', nombre: 'Laterales con liga', caso: 'Sin mancuernas', series: 3, repsMin: 15, repsMax: 20, descansoSeg: 60, modo: 'corporal', tecnica: ['Pisa la liga con los dos pies y sube a los lados hasta la altura de los hombros.'], ilustracion: 'laterales-liga' })

/** Laterales: en A (4 series) y en la C vieja, en la zona de bancos (mancuernas ligeras) */
const LATERALES = (sesion: Letra, orden: number, series = 3): Ejercicio => ({
  id: 'laterales', nombre: 'Elevaciones laterales', sesion, orden, zona: 'bancos', series, repsMin: 12, repsMax: 20, descansoSeg: 60, modo: 'peso', incrementoKg: 1,
  ubicar: 'Mancuernas ligeras (empezar con las que parezcan poca cosa).',
  tecnica: ['De pie, mancuernas a los costados, codos apenas doblados.', 'Subir a los lados hasta la altura de los hombros.', 'Bajar en 2 segundos.'],
  errores: ['Impulso.', 'Pasar de los hombros.', 'Encoger hombros.'],
  ilustracion: 'laterales',
  alternativas: [alt({ id: 'laterales-sentado', nombre: 'Laterales sentado en la orilla de un banco', caso: 'Si te balanceas', series, repsMin: 12, repsMax: 20, descansoSeg: 60, tecnica: ['Sentado en la orilla del banco, mismo movimiento.'], ilustracion: 'laterales-sentado' })],
})
/** Jalón al pecho ancho: abre la B; también era el primero de la C */
const JALON = (sesion: Letra, orden: number): Ejercicio => ({
  id: 'jalon', nombre: 'Jalón al pecho, agarre ancho', sesion, orden, zona: 'poleas', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
  ubicar: 'La máquina de jalón al pecho: asiento, cojines para trabar las rodillas y una barra ancha colgando arriba.',
  colocacion: 'Rodillas trabadas bajo el cojín, agarre un poco más ancho que los hombros, palmas al frente. Pecho arriba.',
  tecnica: ['Jalar la barra hasta la parte alta del pecho llevando los codos abajo y atrás.', 'Pausa corta.', 'Soltar controlado hasta estirar del todo.'], errores: ['Jalar detrás de la nuca.', 'Columpiarse.', 'Jalar con los brazos en vez de con los codos.'], ilustracion: 'jalon',
  alternativas: [
    alt({
      id: 'jalon-cerrado', nombre: 'Jalón al pecho, manos al ancho de los hombros', caso: 'Otra opción en la misma máquina', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
      ubicar: 'La misma máquina y la misma barra del jalón ancho; solo cambian las manos.',
      colocacion: 'Manos al ancho de los hombros, palmas al frente, rodillas trabadas, pecho arriba.',
      tecnica: ['Jala a la parte alta del pecho con los codos pegados al cuerpo.', 'Pausa corta y sube en 2 a 3 segundos hasta estirar del todo.'], errores: ['Echarte atrás para mover más peso.', 'Quedarte corto arriba.'], ilustracion: 'jalon-cerrado',
    }),
    remoMancuerna('Solo si la máquina sigue ocupada al final'),
  ],
})
/** Remo sentado en máquina: en B y en la C vieja */
const REMO_POLEA = (sesion: Letra, orden: number): Ejercicio => ({
  id: 'remo-polea', nombre: 'Remo sentado en máquina', sesion, orden, zona: 'poleas', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
  ubicar: 'La máquina de remo sentado, con el agarre que tenga puesto.',
  colocacion: 'Pies en la plataforma, rodillas apenas dobladas, espalda recta, pecho arriba, brazos estirados al frente.',
  tecnica: ['Jalar hacia el abdomen con los codos pegados al cuerpo y apretar los omóplatos un segundo.', 'Regresar en 2 a 3 segundos hasta estirar sin redondear la espalda.'], errores: ['Echarte para atrás para jalar.', 'Encoger hombros.'], ilustracion: 'remo-polea',
  alternativas: [alt({ id: 'remo-pecho-apoyado', nombre: 'Remo con pecho apoyado en banco reclinable', caso: 'Máquina ocupada', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, tecnica: ['Boca abajo en el banco a 30 o 45°, mancuernas colgando.', 'Jala los codos atrás hasta pasar la línea de la espalda.'], ilustracion: 'remo-pecho-apoyado' })],
})
/** Crunch en colchoneta: en la C vieja */
const CRUNCH = (sesion: Letra, orden: number): Ejercicio => ({
  id: 'crunch', nombre: 'Crunch en colchoneta', sesion, orden, zona: 'terraza', series: 2, repsMin: 15, repsMax: 20, descansoSeg: 45, modo: 'corporal',
  colocacion: 'Acostado en colchoneta, rodillas dobladas, pies en el piso, manos tocando las sienes o cruzadas en el pecho.',
  tecnica: ['Despega los hombros del piso subiendo las costillas hacia la cadera, aprieta un segundo.', 'Baja lento sin descansar la cabeza.'], errores: ['Jalar la cabeza con las manos.', 'Subir hasta sentarte.'], ilustracion: 'crunch',
  alternativas: [elevacionPiernasAlt('Molestia de cuello')],
})

export const EJERCICIOS: Ejercicio[] = [
  // ---------------- A: empuje (pecho, hombro y tríceps) · Bancos ----------------
  {
    id: 'press-inclinado', nombre: 'Press inclinado con mancuernas', sesion: 'A', orden: 1, zona: 'bancos', series: 4, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco reclinable a 30° (uno o dos clics arriba de plano). Más de 45° ya es hombro. Del 1 al 4 es el mismo banco.',
    colocacion: 'Mancuernas sobre los muslos, impulsar una a la vez al acostarse, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: ['Bajar hasta la parte alta del pecho.', 'Empujar arriba y un poco atrás.'], errores: ['Banco muy inclinado.', 'Codos abiertos.', 'Rebotar.'], ilustracion: 'press-inclinado',
    alternativas: [
      alt({ id: 'press-plano', nombre: 'Press plano con mancuernas', caso: 'No hay banco reclinable libre', series: 4, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Mismo movimiento en banco plano.'], ilustracion: 'press-plano' }),
      pressPiso('Bancos ocupados o molestia de hombro', 'Press en el piso con mancuernas, en colchoneta', 4),
    ],
  },
  LATERALES('A', 2, 4),
  {
    id: 'aperturas-inclinadas', nombre: 'Aperturas inclinadas con mancuernas', sesion: 'A', orden: 3, zona: 'bancos', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
    ubicar: 'El mismo banco del press inclinado, a 30°.',
    colocacion: 'Mancuernas arriba del pecho, palmas viéndose, codos apenas doblados y fijos.',
    tecnica: ['Abre en arco en 2 a 3 segundos hasta que las mancuernas queden a la altura del pecho, no más abajo.', 'Sube por el mismo arco hasta juntarlas.'], errores: ['Doblar los codos y hacerlo press.', 'Bajar de más.'], ilustracion: 'aperturas-inclinadas',
    alternativas: [
      alt({ id: 'aperturas-mancuernas', nombre: 'Aperturas en banco plano', caso: 'No hay banco reclinable libre', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, tecnica: ['Mismo arco en banco plano.'], ilustracion: 'aperturas-mancuernas' }),
      lagartijas('Bancos ocupados o molestia de hombro al abrir', 2),
    ],
  },
  {
    id: 'triceps-cabeza', nombre: 'Tríceps con mancuerna sobre la cabeza, sentado', sesion: 'A', orden: 4, zona: 'bancos', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'El mismo banco reclinable, casi derecho.',
    colocacion: 'Espalda pegada al respaldo, una mancuerna con las dos manos por el disco de arriba, brazos estirados sobre la cabeza.',
    tecnica: ['Baja detrás de la cabeza en 2 a 3 segundos doblando solo los codos.', 'Sube hasta estirar.'], errores: ['Abrir los codos.', 'Arquear la espalda baja.'], ilustracion: 'triceps-cabeza',
    alternativas: [
      alt({
        id: 'triceps-polea', nombre: 'Tríceps con cuerda en la polea de pie', caso: 'Si prefieres la polea de pie', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
        ubicar: 'La polea de pie que ya tiene la cuerda, una punta en cada mano.',
        colocacion: 'Un paso atrás, parado derecho, codos pegados a los costados, antebrazos paralelos al piso.',
        tecnica: ['Empuja hasta estirar, abriendo las manos abajo.', 'Regresa en 2 a 3 segundos solo hasta 90°.'], errores: ['Echarte encima y empujar con hombro y pecho.', 'Dejar subir las manos a la cara.'], ilustracion: 'triceps-polea',
      }),
      tricepsPatada('Molestia de codo u hombro con el brazo arriba', 'Patada de tríceps, apoyado en el banco'),
    ],
  },

  // ---------------- B: jalón (espalda, pierna y abdomen) · Poleas → Terraza ----------------
  JALON('B', 1),
  REMO_POLEA('B', 2),
  {
    id: 'goblet', nombre: 'Sentadilla goblet', sesion: 'B', orden: 3, zona: 'terraza', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, modo: 'peso',
    ubicar: 'Una mancuerna; hacerla frente a un espejo si se puede.', colocacion: 'Pies un poco más abiertos que los hombros, puntas un poco hacia afuera. Una mancuerna parada, sostenida con las dos manos pegada al pecho.',
    tecnica: ['Baja en 2 a 3 segundos como si te sentaras en una silla baja, con el pecho arriba.', 'Hasta que los codos rocen las rodillas o lo más bajo sin redondear la espalda.', 'Sube empujando el piso.'], errores: ['Rodillas que se juntan.', 'Talones que se despegan.'], ilustracion: 'goblet',
    alternativas: [
      alt({ id: 'sentadilla-mancuernas', nombre: 'Sentadilla con dos mancuernas', caso: 'La mancuerna pesada está ocupada o ya no alcanza', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, tecnica: ['Mancuernas colgando a los costados, misma técnica que la goblet.'], ilustracion: 'sentadilla-mancuernas' }),
      alt({
        id: 'puente-gluteo', nombre: 'Puente de glúteo con mancuerna, en colchoneta', caso: 'Molestia de rodilla', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
        colocacion: 'Acostado en colchoneta, rodillas dobladas y pies firmes al ancho de la cadera; una mancuerna acostada sobre la cadera, sostenida con las dos manos.',
        tecnica: ['Empuja con los talones y sube la cadera hasta que rodillas, cadera y hombros queden en línea.', 'Aprieta el glúteo un segundo arriba y baja en 2 a 3 segundos.'], errores: ['Arquear la espalda baja para subir más.', 'Empujar con las puntas.'], ilustracion: 'puente-gluteo',
      }),
    ],
  },
  {
    id: 'elevacion-piernas', nombre: 'Elevación de piernas en colchoneta', sesion: 'B', orden: 4, zona: 'terraza', series: 2, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal',
    colocacion: 'Acostado boca arriba en la colchoneta, manos bajo los glúteos, espalda baja pegada.',
    tecnica: ['Subir las piernas casi estiradas hasta la vertical.', 'Bajar controlado sin que la espalda baja se despegue.'], errores: ['Arquear la espalda.', 'Bajar con impulso.'], ilustracion: 'elevacion-piernas',
    alternativas: [crunchAlt('Te jala la espalda baja')],
  },

  // ---------------- C: espalda y hombro · Poleas → Bancos → Terraza (v7; ya no se ofrece, queda por el historial) ----------------
  JALON('C', 1),
  REMO_POLEA('C', 2),
  {
    id: 'press-militar', nombre: 'Press militar sentado con mancuernas', sesion: 'C', orden: 3, zona: 'bancos', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco reclinable casi derecho (un clic antes de 90°).', colocacion: 'Mancuernas a la altura de las orejas, palmas al frente, espalda baja pegada, abdomen apretado.',
    tecnica: ['Empujar hacia arriba hasta estirar sin trabar los codos.', 'Bajar controlado a la altura de las orejas.'], errores: ['Arquear la espalda.', 'Bajar de más.', 'Impulso con las piernas.'], ilustracion: 'press-militar',
    alternativas: [alt({ id: 'press-militar-pie', nombre: 'Press militar de pie, mismas mancuernas', caso: 'No hay banco con respaldo', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Mismas reps, un poco menos de peso.', 'Glúteos y abdomen apretados.'], ilustracion: 'press-militar-pie' })],
  },
  LATERALES('C', 4),
  {
    id: 'curl-martillo', nombre: 'Curl martillo', sesion: 'C', orden: 5, zona: 'terraza', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    colocacion: 'De pie, mancuernas colgando, palmas mirándose, codos pegados.',
    tecnica: ['Palmas mirándose todo el recorrido, codos pegados.', 'Subir, apretar, bajar controlado.'], errores: ['Mecer el cuerpo.'], ilustracion: 'curl-martillo',
    alternativas: [curlAlternadoAlt('Otra opción con las mismas mancuernas', 3)],
  },
  CRUNCH('C', 6),

  // ---------------- CASA: 12 minutos, opcional. Lo único en kg. ----------------
  {
    id: 'laterales-casa', nombre: 'Laterales con mancuernas de 4 a 5 kg', sesion: 'CASA', orden: 1, series: 3, repsMin: 15, repsMax: 20, descansoSeg: 60, modo: 'peso', incrementoKg: 1,
    tecnica: ['De pie, mancuernas a los costados, codos apenas doblados.', 'Subir a los lados hasta la altura de los hombros.', 'Bajar en 2 segundos.'], errores: ['Impulso.', 'Pasar de los hombros.', 'Encoger hombros.'], ilustracion: 'laterales-casa',
    alternativas: [lateralesLiga],
  },
  {
    id: 'lagartijas', nombre: 'Lagartijas dejando 2 en reserva', sesion: 'CASA', orden: 2, series: 3, repsMin: 0, repsMax: 0, descansoSeg: 60, modo: 'corporal',
    tecnica: ['Manos un poco más abiertas que los hombros, cuerpo recto.', 'Baja hasta un puño del piso, codos a 45°.', 'Sube empujando el piso.'], errores: ['Cadera caída.', 'Codos abiertos en T.'], ilustracion: 'lagartijas',
    alternativas: [
      alt({ id: 'lagartijas-inclinadas', nombre: 'Lagartijas con las manos en la cama o una mesa firme', caso: 'Si cuestan', series: 3, repsMin: 0, repsMax: 0, descansoSeg: 60, modo: 'corporal', tecnica: ['Mismo movimiento con las manos elevadas.'], ilustracion: 'lagartijas-inclinadas' }),
      alt({ id: 'lagartijas-pies-banco', nombre: 'Lagartijas con los pies en una silla', caso: 'Si ya haces más de 20', series: 3, repsMin: 0, repsMax: 0, descansoSeg: 60, modo: 'corporal', tecnica: ['Al tope dejando 2 en reserva.'], ilustracion: 'lagartijas-pies-banco' }),
    ],
  },
  {
    id: 'remo-liga', nombre: 'Remo con liga anclada en la puerta', sesion: 'CASA', orden: 3, series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'corporal',
    tecnica: ['Liga a la altura del pecho, puerta con seguro.', 'Jala los codos hacia atrás pegados al cuerpo, aprieta los omóplatos y regresa lento.'], errores: ['Echarte para atrás.', 'Dejar que la liga regrese de golpe.'], ilustracion: 'remo-liga',
    alternativas: [alt({ id: 'remo-mancuerna-casa', nombre: 'Remo a una mano apoyado en la cama o una silla', caso: 'Sin liga', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, porLado: true, tecnica: ['Jala el codo hacia la cadera, pegado al cuerpo.'], ilustracion: 'remo-mancuerna-casa' })],
  },
  {
    id: 'crunch', nombre: 'Crunch', sesion: 'CASA', orden: 4, series: 2, repsMin: 15, repsMax: 20, descansoSeg: 60, modo: 'corporal',
    colocacion: 'Acostado, rodillas dobladas, pies en el piso, manos en las sienes o cruzadas en el pecho.',
    tecnica: ['Despega los hombros del piso subiendo las costillas hacia la cadera.', 'Baja lento sin descansar la cabeza.'], errores: ['Jalar la cabeza con las manos.', 'Subir hasta sentarte.'], ilustracion: 'crunch',
    alternativas: [alt({ id: 'elevacion-piernas-piso', nombre: 'Elevación de piernas en el piso', caso: 'Molestia de cuello', series: 2, repsMin: 12, repsMax: 12, descansoSeg: 60, modo: 'corporal', tecnica: ['Manos bajo los glúteos, espalda baja pegada.'], ilustracion: 'elevacion-piernas-piso' })],
  },
]

/** Nombres de ids que salieron de la rutina (RUTINA-FINAL.md, 7): su historial se sigue viendo en Historial */
export const NOMBRES_RETIRADOS: Record<string, string> = {
  'curl-z': 'Curl con barra Z', plancha: 'Plancha', 'plancha-casa': 'Plancha', 'plancha-rodillas': 'Plancha con rodillas apoyadas', 'dead-bug': 'Dead bug', prensa: 'Prensa de pierna', 'prensa-corta': 'Prensa con recorrido corto',
  'aperturas-maquina': 'Aperturas en máquina', 'cruce-poleas': 'Cruce de poleas de pie', 'press-pecho-maquina': 'Press de pecho en máquina', 'press-inclinado-maquina': 'Press inclinado en máquina',
  'press-hombro-maquina': 'Press de hombro en máquina', 'press-militar-neutro': 'Press con agarre neutro', 'remo-pecho-maquina': 'Remo en máquina con pecho apoyado', 'remo-alto-maquina': 'Remo alto en máquina',
  'laterales-polea': 'Lateral en polea', 'curl-polea': 'Curl en polea', 'curl-cuerda': 'Curl martillo en polea con cuerda', 'dominadas-asistidas': 'Dominadas asistidas', 'fondos-banco': 'Fondos en banco',
  'remo-polea-una-mano': 'Remo sentado a una mano en polea', 'sentadilla-banco': 'Sentadilla a un banco', 'elevacion-rodillas': 'Elevación de rodillas dobladas', 'puente-sin-peso': 'Puente de glúteo sin mancuerna',
}
/** Nombre para mostrar de cualquier id, aunque ya no esté en la rutina */
export function nombreDe(id: string): string {
  return buscarCualquiera(id)?.item.nombre ?? NOMBRES_RETIRADOS[id] ?? id
}

/** Ejercicio a usar en la rutina: el original o la alternativa marcada con "Usar siempre esta" */
export function itemDeRutina(base: Ejercicio, reemplazos?: Record<string, string>): Ejercicio | Alternativa {
  const id = reemplazos?.[base.id]
  return (id && base.alternativas.find((a) => a.id === id)) || base
}
/** Todos los ejercicios base de una sesión, en el orden de la rutina */
export function ejerciciosDe(sesion: Letra): Ejercicio[] {
  return EJERCICIOS.filter((e) => e.sesion === sesion).sort((a, b) => a.orden - b.orden)
}
export function buscarEjercicio(id: string, sesion?: Letra): Ejercicio | undefined {
  return EJERCICIOS.find((e) => e.id === id && (!sesion || e.sesion === sesion))
}
/** Devuelve el ejercicio o la alternativa con ese id, y el ejercicio base. Los ids compartidos resuelven al ejercicio principal. */
export function buscarCualquiera(id: string): { item: Ejercicio | Alternativa; base: Ejercicio } | undefined {
  const base = EJERCICIOS.find((e) => e.id === id)
  if (base) return { item: base, base }
  for (const e of EJERCICIOS) {
    const a = e.alternativas.find((x) => x.id === id)
    if (a) return { item: a, base: e }
  }
  return undefined
}
/** Sin regla de 4 semanas (RUTINA-FINAL.md, 10) */
export const CON_SERIE_EXTRA: string[] = []
export const NOMBRE_SESION: Record<Letra, string> = { A: 'Empuje', B: 'Jalón', C: 'Espalda y hombro', CASA: 'Casa, 12 minutos' }
export const nombreSesion = (tipo: Letra) => NOMBRE_SESION[tipo]

/** Orden de las zonas en cada sesión (RUTINA-FINAL.md, 4, 5 y 5c) */
export const RUTA: Record<Letra, Zona[]> = { A: ['bancos'], B: ['poleas', 'terraza'], C: ['poleas', 'bancos', 'terraza'], CASA: [] }
/** La corta: los dos primeros ejercicios a 3 series (MANANAS-30.md, 2). La de la C es la de la v7, por el historial. */
const CORTA: Record<'A' | 'B' | 'C', string[]> = { A: ['press-inclinado', 'laterales'], B: ['jalon', 'remo-polea'], C: ['jalon', 'press-militar', 'laterales'] }

/** Lista de ejercicios de una sesión según versión, ya en el orden del recorrido por zonas */
export function listaDe(sesion: Letra, version: 'completa' | 'corta' = 'completa'): Ejercicio[] {
  const todos = ejerciciosDe(sesion)
  if (sesion === 'CASA') return todos
  if (version === 'corta') {
    // tres series también si se cambia por una alternativa (las de A van a 4 en la completa)
    const lista = todos.filter((e) => CORTA[sesion].includes(e.id)).map((e) => ({ ...e, series: 3, alternativas: e.alternativas.map((a) => ({ ...a, series: Math.min(a.series, 3) })) }))
    const ruta = RUTA[sesion]
    return lista.sort((a, b) => ruta.indexOf(a.zona!) - ruta.indexOf(b.zona!) || a.orden - b.orden)
  }
  return todos
}
/** Los que el recorte en el camino nunca toca: los dos primeros de la sesión, que son también la corta (MANANAS-30.md, 4) */
export function protegidosDe(sesion: Letra): string[] {
  return sesion === 'CASA' ? ejerciciosDe(sesion).map((e) => e.id) : ejerciciosDe(sesion).slice(0, 2).map((e) => e.id)
}
/** Zonas que se visitan, en orden, según la lista */
export function rutaDe(lista: Ejercicio[]): Zona[] {
  const out: Zona[] = []
  for (const e of lista) if (e.zona && !out.includes(e.zona)) out.push(e.zona)
  return out
}
/** Ids que ya están en la sesión (bases y alternativas elegidas), para no repetir un movimiento el mismo día */
export function idsEnSesion(lista: Ejercicio[], cambios: { ejercicioId: string; alternativaId: string }[] = [], reemplazos?: Record<string, string>): Set<string> {
  const ids = new Set<string>()
  for (const e of lista) {
    const cambio = cambios.find((c) => c.ejercicioId === e.id)
    ids.add(cambio ? cambio.alternativaId : itemDeRutina(e, reemplazos).id)
  }
  return ids
}
/** Alternativas que se pueden elegir para `base`: las suyas menos las que ya están en otro ejercicio de la sesión */
export function alternativasDisponibles(base: Ejercicio, lista: Ejercicio[], cambios: { ejercicioId: string; alternativaId: string }[] = [], reemplazos?: Record<string, string>): Alternativa[] {
  const otros = idsEnSesion(lista.filter((e) => e.id !== base.id), cambios.filter((c) => c.ejercicioId !== base.id), reemplazos)
  return base.alternativas.filter((a) => !otros.has(a.id))
}
