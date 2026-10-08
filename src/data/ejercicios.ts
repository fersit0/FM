// Biblioteca de ejercicios: RUTINA-FINAL.md versión 5 (secciones 3 a 7). Ids estables por movimiento; un id compartido
// entre ejercicio y alternativa comparte historial. Sin pares: cada ejercicio termina sus series y luego el siguiente.
import type { Ejercicio, Alternativa, Letra, Zona } from './tipos'

const alt = (a: Omit<Alternativa, 'modo' | 'tecnica' | 'errores'> & Partial<Pick<Alternativa, 'modo' | 'tecnica' | 'errores'>>): Alternativa => ({ modo: 'peso', tecnica: [], errores: [], ...a })

export const ZONA_NOMBRE: Record<Zona, string> = { bancos: 'Bancos', poleas: 'Poleas', terraza: 'Terraza' }
export const ZONA_DETALLE: Record<Zona, string> = {
  bancos: 'Adentro: bancos planos y reclinables, y mancuernas.',
  poleas: 'La máquina de jalón al pecho, la de remo sentado y la polea de pie con cuerda.',
  terraza: 'Mancuernas, colchonetas y el saco de box.',
}

export const CALENTAMIENTO = {
  nombre: 'Calentamiento', minCompleta: 5, minCorta: 4,
  texto: 'Elíptica 5 min, ritmo en el que puedes platicar. Corta: 4 min.',
  siOcupada: 'Si la elíptica está ocupada: bici fija.',
}
export const CIERRE = {
  nombre: 'Cierre', minCompleta: 10, minConPierna: 5, minCorta: 5, minBonus: 20,
  texto: 'Saco en la terraza o elíptica, 10 min (5 si hubo pierna). Saco: 4 rounds de 2 min con 1 de descanso. Corta: 5 min. Bonus: 20 min.',
  saco: 'Saco: 4 rounds de 2 min con 1 de descanso.',
}
export const REGLAS_GLOBALES: { titulo: string; texto: string }[] = [
  { titulo: 'Esfuerzo', texto: 'Terminar cada serie con 1 o 2 repeticiones en reserva. Si la última salió fácil, el peso era chico. Si no llegaste al mínimo del rango, era grande.' },
  { titulo: 'Ajuste dentro de la sesión', texto: 'Si la primera serie pasó del número alto con 3 o más en reserva, sube un escalón para la siguiente; si no llegó al número bajo, baja uno. Un escalón: 5 lb por mano en mancuernas (1 kg en las laterales de casa) o una placa en máquina.' },
  { titulo: 'Serie de aproximación', texto: 'En el primer ejercicio de la sesión y en el primer press, 10 repeticiones con la mitad del peso. No se registra.' },
  { titulo: 'Series seguidas', texto: 'Cada ejercicio se termina completo antes de pasar al siguiente. El descanso corre al tocar la serie.' },
  { titulo: 'Zonas', texto: 'La sesión recorre Bancos, Poleas y Terraza en orden y visita cada zona una sola vez. Si algo está ocupado, "Ocupado: después" lo manda al final de su zona.' },
  { titulo: 'Versión automática', texto: 'Al tocar Empezar, la app ve la hora real: si las pesas de la completa terminan antes de la última pesa (21:10), va completa; si no, corta; si tampoco, casa. Si a media sesión no alcanza, quita abdomen, luego brazos, luego press militar o aperturas, y avisa.' },
  { titulo: 'Pierna con Frida', texto: 'La pierna es el día de Frida (lunes, se puede mover desde Hoy). Si la semana se queda sin Frida, la siguiente sesión completa trae goblet a 3 series al empezar la terraza y el cierre baja a 5 min.' },
  { titulo: 'Dolor', texto: 'Molestia muscular es normal; dolor agudo en una articulación (hombro, codo, rodilla, espalda baja) no. Si aparece, cambiar a la alternativa ese día. No se aguanta.' },
  { titulo: 'Semana pesada', texto: 'Si dos semanas seguidas se llega muerto, la siguiente se hacen 2 series por ejercicio con el mismo peso y se retoma. La app lo ofrece, no lo impone.' },
]
export const VERSION_CORTA_TEXTO = 'Unos 30 min: calentamiento 4 min; el jalón, el press principal y laterales, 3 series cada uno, con los laterales en la zona de bancos; cierre 5 min. Cuenta como sesión. La app la elige sola por la hora.'
export const REGLA_ALTERNATIVA = 'Primero "Ocupado: después". Si sigue ocupado, la alternativa: solo mancuernas, banco, colchoneta o el cuerpo, en la misma zona o en la terraza. Se oculta si su id ya está en la sesión.'

// ---- alternativas compartidas (mismo id = mismo historial) ----
const remoMancuerna = (caso: string, nombre: string, series = 3, repsMin = 10, repsMax = 12, descansoSeg = 75): Alternativa => alt({ id: 'remo-mancuerna', nombre, caso, series, repsMin, repsMax, descansoSeg, porLado: true, colocacion: 'Una rodilla y la mano del mismo lado en un banco plano, espalda plana, la mancuerna colgando bajo el hombro.', tecnica: ['Jala el codo hacia la cadera, pegado al cuerpo.', 'Baja en 2 a 3 segundos hasta estirar.'], ilustracion: 'remo-mancuerna' })
const pressPiso = (caso: string, nombre = 'Press en el piso con mancuernas'): Alternativa => alt({ id: 'press-piso', nombre, caso, series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Acostado en la colchoneta, mismas reps.', 'La amplitud es menor y es más seguro para el hombro.'], ilustracion: 'press-piso' })
const lagartijas = (caso: string, series = 3): Alternativa => alt({ id: 'lagartijas', nombre: 'Lagartijas', caso, series, repsMin: 0, repsMax: 0, descansoSeg: 90, modo: 'corporal', tecnica: ['Al tope dejando 2 en reserva.'], ilustracion: 'lagartijas' })
const tricepsPatada = (caso: string, nombre: string): Alternativa => alt({ id: 'triceps-patada', nombre, caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, porLado: true, colocacion: 'Una mano y una rodilla en el banco, espalda plana; el codo pegado al cuerpo y doblado a 90°.', tecnica: ['Estira el brazo hacia atrás hasta que quede recto.', 'Regresa a 90° en 2 a 3 segundos.'], ilustracion: 'triceps-patada' })
const tricepsCabezaAlt = (caso: string): Alternativa => alt({ id: 'triceps-cabeza', nombre: 'Tríceps con mancuerna sobre la cabeza', caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, colocacion: 'Sentado en banco con respaldo, una mancuerna a dos manos.', tecnica: ['Bajar detrás de la cabeza doblando codos.', 'Estirar arriba sin abrir codos.'], ilustracion: 'triceps-cabeza' })
const curlAlternadoAlt = (caso: string): Alternativa => alt({ id: 'curl-alternado', nombre: 'Curl con mancuernas', caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, tecnica: ['Codos pegados a las costillas.', 'Sube sin mover el codo, baja en 2 a 3 segundos.'], ilustracion: 'curl-alternado' })
const curlMartilloAlt = (caso: string): Alternativa => alt({ id: 'curl-martillo', nombre: 'Curl martillo, mismas mancuernas', caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, tecnica: ['Palmas mirándose todo el recorrido, codos pegados.'], ilustracion: 'curl-martillo' })
const crunchAlt = (caso: string, series = 3): Alternativa => alt({ id: 'crunch', nombre: 'Crunch en colchoneta', caso, series, repsMin: 15, repsMax: 20, descansoSeg: 45, modo: 'corporal', tecnica: ['Despega los hombros del piso subiendo las costillas hacia la cadera.', 'Baja lento sin descansar la cabeza.'], ilustracion: 'crunch' })
const elevacionPiernasAlt = (caso: string, series = 2): Alternativa => alt({ id: 'elevacion-piernas', nombre: 'Elevación de piernas en colchoneta', caso, series, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal', tecnica: ['Espalda baja pegada, piernas casi estiradas hasta la vertical.', 'Baja controlado.'], ilustracion: 'elevacion-piernas' })
const lateralesLiga: Alternativa = alt({ id: 'laterales-liga', nombre: 'Laterales con liga', caso: 'Sin mancuernas', series: 3, repsMin: 15, repsMax: 20, descansoSeg: 60, modo: 'corporal', tecnica: ['Pisa la liga con los dos pies y sube a los lados hasta la altura de los hombros.'], ilustracion: 'laterales-liga' })

const LATERALES = (sesion: Letra, orden: number): Ejercicio => ({
  id: 'laterales', nombre: 'Elevaciones laterales', sesion, orden, zona: 'terraza', series: 3, repsMin: 12, repsMax: 20, descansoSeg: 60, modo: 'peso', incrementoKg: 1,
  ubicar: 'Mancuernas ligeras (empezar con las que parezcan poca cosa).',
  tecnica: ['De pie, mancuernas a los costados, codos apenas doblados.', 'Subir a los lados hasta la altura de los hombros.', 'Bajar en 2 segundos.'],
  errores: ['Impulso.', 'Pasar de los hombros.', 'Encoger hombros.'],
  ilustracion: 'laterales',
  alternativas: [alt({ id: 'laterales-sentado', nombre: 'Laterales sentado en la orilla de un banco', caso: 'Si te balanceas', series: 3, repsMin: 12, repsMax: 20, descansoSeg: 60, tecnica: ['Sentado en la orilla del banco, mismo movimiento.'], ilustracion: 'laterales-sentado' })],
})
/** Pierna de las semanas sin Frida: goblet a 3 series al empezar la terraza (RUTINA-FINAL.md, 2) */
const GOBLET = (sesion: Letra, orden: number): Ejercicio => ({
  id: 'goblet', nombre: 'Sentadilla goblet', sesion, orden, zona: 'terraza', pierna: true, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, modo: 'peso',
  ubicar: 'Una mancuerna; hacerla frente a un espejo si se puede.', colocacion: 'Mancuerna vertical pegada al pecho, sujeta por la cabeza de arriba con las dos manos. Pies al ancho de hombros, puntas un poco hacia afuera.',
  tecnica: ['Bajar como si te sentaras hasta que los muslos queden al menos paralelos.', 'Pecho arriba, talones pegados.', 'Subir empujando el piso.'], errores: ['Talones despegándose.', 'Rodillas cerrándose hacia adentro.', 'Encorvarse.'], ilustracion: 'goblet',
  alternativas: [alt({ id: 'sentadilla-mancuernas', nombre: 'Sentadilla con dos mancuernas', caso: 'La mancuerna pesada está ocupada o ya no alcanza', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, tecnica: ['Mancuernas colgando a los costados, misma técnica que la goblet.'], ilustracion: 'sentadilla-mancuernas' })],
})

export const EJERCICIOS: Ejercicio[] = [
  // ---------------- A: dorsal, pecho alto y hombro · Poleas → Bancos → Terraza ----------------
  {
    id: 'jalon', nombre: 'Jalón al pecho, agarre ancho', sesion: 'A', orden: 1, zona: 'poleas', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'La máquina de jalón al pecho: asiento, cojines para trabar las rodillas y una barra ancha colgando arriba.',
    colocacion: 'Rodillas trabadas bajo el cojín, agarre un poco más ancho que los hombros, palmas al frente. Pecho arriba.',
    tecnica: ['Jalar la barra hasta la parte alta del pecho llevando los codos abajo y atrás.', 'Pausa corta.', 'Soltar controlado hasta estirar del todo.'], errores: ['Jalar detrás de la nuca.', 'Columpiarse.', 'Jalar con los brazos en vez de con los codos.'], ilustracion: 'jalon',
    alternativas: [remoMancuerna('Solo si la máquina sigue ocupada al final', 'Remo a una mano con mancuerna, jalando hacia la cadera')],
  },
  {
    id: 'remo-polea', nombre: 'Remo sentado en máquina', sesion: 'A', orden: 2, zona: 'poleas', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'La máquina de remo sentado, con el agarre que tenga puesto.',
    colocacion: 'Pies en la plataforma, rodillas apenas dobladas, espalda recta, pecho arriba, brazos estirados al frente.',
    tecnica: ['Jalar hacia el abdomen con los codos pegados al cuerpo y apretar los omóplatos un segundo.', 'Regresar en 2 a 3 segundos hasta estirar sin redondear la espalda.'], errores: ['Echarte para atrás para jalar.', 'Encoger hombros.'], ilustracion: 'remo-polea',
    alternativas: [alt({ id: 'remo-pecho-apoyado', nombre: 'Remo con pecho apoyado en banco reclinable', caso: 'Máquina ocupada', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, tecnica: ['Boca abajo en el banco a 30 o 45°, mancuernas colgando.', 'Jala los codos atrás hasta pasar la línea de la espalda.'], ilustracion: 'remo-pecho-apoyado' })],
  },
  {
    id: 'press-inclinado', nombre: 'Press inclinado con mancuernas', sesion: 'A', orden: 3, zona: 'bancos', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco reclinable a 30° (uno o dos clics arriba de plano). Más de 45° ya es hombro.',
    colocacion: 'Mancuernas sobre los muslos, impulsar una a la vez al acostarse, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: ['Bajar hasta la parte alta del pecho.', 'Empujar arriba y un poco atrás.'], errores: ['Banco muy inclinado.', 'Codos abiertos.', 'Rebotar.'], ilustracion: 'press-inclinado',
    alternativas: [
      alt({ id: 'press-plano', nombre: 'Press plano con mancuernas', caso: 'No hay banco reclinable libre', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Mismo movimiento en banco plano.'], ilustracion: 'press-plano' }),
      pressPiso('Bancos ocupados o molestia de hombro', 'Press en el piso con mancuernas, en colchoneta'),
    ],
  },
  {
    id: 'press-militar', nombre: 'Press militar sentado con mancuernas', sesion: 'A', orden: 4, zona: 'bancos', series: 2, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco reclinable casi derecho (un clic antes de 90°).', colocacion: 'Mancuernas a la altura de las orejas, palmas al frente, espalda baja pegada, abdomen apretado.',
    tecnica: ['Empujar hacia arriba hasta estirar sin trabar los codos.', 'Bajar controlado a la altura de las orejas.'], errores: ['Arquear la espalda.', 'Bajar de más.', 'Impulso con las piernas.'], ilustracion: 'press-militar',
    alternativas: [alt({ id: 'press-militar-pie', nombre: 'Press militar de pie, mismas mancuernas', caso: 'No hay banco con respaldo', series: 2, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Mismas reps, un poco menos de peso.', 'Glúteos y abdomen apretados.'], ilustracion: 'press-militar-pie' })],
  },
  {
    id: 'triceps-cabeza', nombre: 'Tríceps con mancuerna sobre la cabeza, sentado', sesion: 'A', orden: 5, zona: 'bancos', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    colocacion: 'Banco con respaldo derecho, espalda pegada, una mancuerna con las dos manos por el disco de arriba, brazos estirados sobre la cabeza.',
    tecnica: ['Baja detrás de la cabeza en 2 a 3 segundos doblando solo los codos.', 'Sube hasta estirar.'], errores: ['Abrir los codos.', 'Arquear la espalda baja.'], ilustracion: 'triceps-cabeza',
    alternativas: [tricepsPatada('Molestia de codo u hombro con el brazo arriba', 'Patada de tríceps con mancuerna, apoyado en el banco')],
  },
  GOBLET('A', 6),
  LATERALES('A', 7),
  {
    id: 'curl-alternado', nombre: 'Curl con mancuernas', sesion: 'A', orden: 8, zona: 'terraza', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    colocacion: 'De pie, una mancuerna en cada mano, palmas al frente, codos pegados a las costillas.',
    tecnica: ['Sube una a la vez, o las dos, sin mover el codo, hasta que la mancuerna llegue al hombro.', 'Baja en 2 a 3 segundos hasta estirar.'], errores: ['Mecer el cuerpo.', 'Codos que se van al frente.'], ilustracion: 'curl-alternado',
    alternativas: [curlMartilloAlt('Molestia de muñeca')],
  },
  {
    id: 'crunch', nombre: 'Crunch en colchoneta', sesion: 'A', orden: 9, zona: 'terraza', series: 2, repsMin: 15, repsMax: 20, descansoSeg: 45, modo: 'corporal',
    colocacion: 'Acostado en colchoneta, rodillas dobladas, pies en el piso, manos tocando las sienes o cruzadas en el pecho.',
    tecnica: ['Despega los hombros del piso subiendo las costillas hacia la cadera, aprieta un segundo.', 'Baja lento sin descansar la cabeza.'], errores: ['Jalar la cabeza con las manos.', 'Subir hasta sentarte.'], ilustracion: 'crunch',
    alternativas: [elevacionPiernasAlt('Molestia de cuello')],
  },

  // ---------------- B: pecho, espalda media y brazo · Bancos → Poleas → Terraza ----------------
  {
    id: 'press-plano', nombre: 'Press plano con mancuernas', sesion: 'B', orden: 1, zona: 'bancos', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Un banco plano; del 1 al 3 es el mismo banco (plano y luego reclinado).',
    colocacion: 'Sentado en la orilla con las mancuernas sobre los muslos, impulsar una a la vez con la rodilla al acostarse. Pies firmes, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: ['Bajar en 2 segundos hasta que los codos queden a la altura del pecho.', 'Empujar hasta arriba sin chocar las mancuernas.', 'Codos a unos 45° del cuerpo.'], errores: ['Rebotar abajo.', 'Arquear la espalda baja de más.', 'Abrir codos a 90°.'], ilustracion: 'press-plano',
    alternativas: [pressPiso('Bancos ocupados'), lagartijas('Sin mancuernas libres')],
  },
  {
    id: 'aperturas-mancuernas', nombre: 'Aperturas con mancuernas en banco plano', sesion: 'B', orden: 2, zona: 'bancos', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
    colocacion: 'Acostado en el banco plano, mancuernas arriba del pecho, palmas viéndose, codos apenas doblados y fijos.',
    tecnica: ['Abre en arco hasta la altura del pecho.', 'Sube por el mismo arco y aprieta un segundo.'], errores: ['Doblar los codos para empujar.', 'Abrir más abajo del pecho.'], ilustracion: 'aperturas-mancuernas',
    alternativas: [lagartijas('Banco ocupado o molestia de hombro al abrir', 2)],
  },
  {
    id: 'remo-pecho-apoyado', nombre: 'Remo con pecho apoyado en banco reclinable', sesion: 'B', orden: 3, zona: 'bancos', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
    colocacion: 'Banco reclinado a 30 o 45°, boca abajo con el pecho apoyado y la barbilla por fuera del respaldo. Mancuernas colgando, palmas viéndose.',
    tecnica: ['Jala los codos atrás, a unos 45° del cuerpo, hasta pasar la línea de la espalda.', 'Aprieta un segundo y baja en 2 a 3 segundos.'], errores: ['Despegar el pecho del banco.', 'Encoger los hombros hacia las orejas.'], ilustracion: 'remo-pecho-apoyado',
    alternativas: [remoMancuerna('No hay banco reclinable libre', 'Remo a una mano apoyado en un banco plano', 3, 12, 15, 60)],
  },
  {
    id: 'jalon-cerrado', nombre: 'Jalón al pecho, manos al ancho de los hombros', sesion: 'B', orden: 4, zona: 'poleas', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'La misma máquina y la misma barra del jalón ancho; solo cambian las manos.',
    colocacion: 'Manos al ancho de los hombros, palmas al frente, rodillas trabadas, pecho arriba.',
    tecnica: ['Jala a la parte alta del pecho con los codos pegados al cuerpo.', 'Pausa corta y sube en 2 a 3 segundos hasta estirar del todo.'], errores: ['Echarte atrás para mover más peso.', 'Quedarte corto arriba.'], ilustracion: 'jalon-cerrado',
    alternativas: [remoMancuerna('Solo si la máquina sigue ocupada al final', 'Remo a una mano con mancuerna, jalando hacia la cadera')],
  },
  {
    id: 'triceps-polea', nombre: 'Tríceps con cuerda en la polea de pie', sesion: 'B', orden: 5, zona: 'poleas', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'La polea de pie que ya tiene la cuerda, una punta en cada mano.',
    colocacion: 'Un paso atrás, parado derecho, codos pegados a los costados, antebrazos paralelos al piso.',
    tecnica: ['Empuja hasta estirar, abriendo las manos abajo.', 'Regresa en 2 a 3 segundos solo hasta 90°.'], errores: ['Echarte encima y empujar con hombro y pecho.', 'Dejar subir las manos a la cara.'], ilustracion: 'triceps-polea',
    alternativas: [tricepsCabezaAlt('Polea ocupada'), tricepsPatada('Te molesta el codo con el brazo arriba', 'Patada de tríceps')],
  },
  GOBLET('B', 6),
  LATERALES('B', 7),
  {
    id: 'curl-martillo', nombre: 'Curl martillo', sesion: 'B', orden: 8, zona: 'terraza', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    colocacion: 'De pie, mancuernas colgando, palmas mirándose, codos pegados.',
    tecnica: ['Palmas mirándose todo el recorrido, codos pegados.', 'Subir, apretar, bajar controlado.'], errores: ['Mecer el cuerpo.'], ilustracion: 'curl-martillo',
    alternativas: [curlAlternadoAlt('Otra opción con las mismas mancuernas')],
  },
  {
    id: 'elevacion-piernas', nombre: 'Elevación de piernas en colchoneta', sesion: 'B', orden: 9, zona: 'terraza', series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal',
    colocacion: 'Acostado boca arriba en la colchoneta, manos bajo los glúteos, espalda baja pegada.',
    tecnica: ['Subir las piernas casi estiradas hasta la vertical.', 'Bajar controlado sin que la espalda baja se despegue.'], errores: ['Arquear la espalda.', 'Bajar con impulso.'], ilustracion: 'elevacion-piernas',
    alternativas: [crunchAlt('Te jala la espalda baja')],
  },

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
  'remo-polea-una-mano': 'Remo sentado a una mano en polea', 'sentadilla-banco': 'Sentadilla a un banco', 'elevacion-rodillas': 'Elevación de rodillas dobladas',
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
/** Todos los ejercicios base de una sesión (con los de pierna), en el orden de la rutina */
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
export const NOMBRE_SESION: Record<Letra, string> = { A: 'Dorsal, pecho alto y hombro', B: 'Pecho, espalda media y brazo', CASA: 'Casa, 12 minutos' }

/** Orden de las zonas en cada sesión (RUTINA-FINAL.md, 4 y 5) */
export const RUTA: Record<Letra, Zona[]> = { A: ['poleas', 'bancos', 'terraza'], B: ['bancos', 'poleas', 'terraza'], CASA: [] }
/** La corta: el jalón, el press principal y laterales, con los laterales en bancos para no subir a la terraza */
const CORTA: Record<'A' | 'B', string[]> = { A: ['jalon', 'press-inclinado', 'laterales'], B: ['press-plano', 'jalon-cerrado', 'laterales'] }

/** Lista de ejercicios de una sesión según versión y pierna, ya en el orden del recorrido por zonas. */
export function listaDe(sesion: Letra, version: 'completa' | 'corta' | 'bonus' = 'completa', pierna = false): Ejercicio[] {
  const todos = ejerciciosDe(sesion)
  if (sesion === 'CASA') return todos
  if (version === 'corta') {
    const lista = todos.filter((e) => CORTA[sesion].includes(e.id)).map((e) => (e.id === 'laterales' ? { ...e, zona: 'bancos' as Zona } : e))
    const ruta = RUTA[sesion]
    return lista.sort((a, b) => ruta.indexOf(a.zona!) - ruta.indexOf(b.zona!) || a.orden - b.orden)
  }
  return todos.filter((e) => !e.pierna || pierna)
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

/** Orden del recorte en el camino (RUTINA-FINAL.md, 3): primero abdomen, luego brazos, luego press militar o aperturas. Nunca el resto. */
export const RECORTE_ORDEN: string[][] = [['crunch', 'elevacion-piernas'], ['curl-alternado', 'curl-martillo', 'triceps-cabeza', 'triceps-polea'], ['press-militar', 'aperturas-mancuernas']]
