// Biblioteca de ejercicios: RUTINA-FINAL.md (secciones 4 a 7). Ids estables por movimiento.
import type { Ejercicio, Alternativa, Letra } from './tipos'

const alt = (a: Omit<Alternativa, 'modo' | 'tecnica' | 'errores'> & Partial<Pick<Alternativa, 'modo' | 'tecnica' | 'errores'>>): Alternativa => ({ modo: 'peso', tecnica: [], errores: [], ...a })

export const CALENTAMIENTO = {
  nombre: 'Calentamiento', minCompleta: 5, minCorta: 4,
  texto: 'Elíptica 5 min, ritmo en el que puedes platicar. Corta: 4 min.',
  siOcupada: 'Si la elíptica está ocupada: bici fija.',
}
export const CIERRE = {
  nombre: 'Cierre', minCompleta: 10, minConPierna: 5, minCorta: 5, minBonus: 20,
  texto: 'Elíptica o saco, 10 min (5 si hubo pierna). Saco: 4 rounds de 2 min con 1 de descanso. Corta: 5 min. Bonus: 20 min.',
  saco: 'Saco: 4 rounds de 2 min con 1 de descanso.',
}
export const REGLAS_GLOBALES: { titulo: string; texto: string }[] = [
  { titulo: 'Esfuerzo', texto: 'Terminar cada serie con 1 o 2 repeticiones en reserva. Si la última salió fácil, el peso era chico. Si no llegaste al mínimo del rango, era grande.' },
  { titulo: 'Ajuste dentro de la sesión', texto: 'Si la primera serie pasó del número alto con 3 o más en reserva, sube un escalón para la siguiente; si no llegó al número bajo, baja uno. Un escalón: 5 lb por mano en mancuernas (1 kg en las laterales de casa) o una placa en máquina.' },
  { titulo: 'Serie de aproximación', texto: 'En el bloque 1 de cada sesión, 10 repeticiones con la mitad del peso. No se registra.' },
  { titulo: 'Descanso', texto: 'El que marca cada bloque. Sin cel entre series; la app muestra el cronómetro grande.' },
  { titulo: 'Bloques en par', texto: 'Dos ejercicios que no compiten por el mismo músculo: una serie del primero, 15 s para cambiarse, una serie del segundo, y entonces corre el descanso. Si uno tiene más series, las de más se hacen solas.' },
  { titulo: 'Pierna con Frida', texto: 'La pierna es el día de Frida (lunes, se puede mover desde Hoy). Si la semana se queda sin Frida, la siguiente sesión completa trae pierna a 3 series: goblet en A, prensa en B, y el cierre baja a 5 min.' },
  { titulo: 'Dolor', texto: 'Molestia muscular es normal; dolor agudo en una articulación (hombro, codo, rodilla, espalda baja) no. Si aparece, cambiar a la alternativa ese día. No se aguanta.' },
  { titulo: 'Semana pesada', texto: 'Si dos semanas seguidas se llega muerto, la siguiente se hacen 2 series por ejercicio con el mismo peso y se retoma. La app lo ofrece, no lo impone.' },
]
export const VERSION_CORTA_TEXTO = 'Unos 30 min: calentamiento 4 min, solo los bloques 1, 2 y el par de laterales a 2 series, cierre 5 min. Cuenta como sesión. Se activa sola por horario o a mano.'
export const REGLA_ALTERNATIVA = 'Primero la que use el mismo equipo, luego la que use mancuernas, luego la de peso corporal. Nunca se salta el patrón.'

// ---- alternativas compartidas (mismo id = mismo historial) ----
const remoMancuerna = (caso: string, nombre = 'Remo a una mano apoyado en banco'): Alternativa => alt({ id: 'remo-mancuerna', nombre, caso, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, porLado: true, colocacion: 'Rodilla y mano del mismo lado en el banco, espalda plana, mancuerna colgando bajo el hombro.', tecnica: ['Jala el codo hacia la cadera, pegado al cuerpo.', 'Baja lento hasta estirar.'], ilustracion: 'remo-mancuerna' })
const pressPiso = (caso: string): Alternativa => alt({ id: 'press-piso', nombre: 'Press en el piso con mancuernas', caso, series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Acostado en el piso, mismas reps.', 'La amplitud es menor y es más seguro para el hombro.'], ilustracion: 'press-piso' })
const lagartijasBanco = (caso: string): Alternativa => alt({ id: 'lagartijas-pies-banco', nombre: 'Lagartijas con los pies en el banco', caso, series: 3, repsMin: 0, repsMax: 0, descansoSeg: 90, modo: 'corporal', tecnica: ['Al tope dejando 2 en reserva.'], ilustracion: 'lagartijas-pies-banco' })
const lagartijas = (caso: string): Alternativa => alt({ id: 'lagartijas', nombre: 'Lagartijas', caso, series: 3, repsMin: 0, repsMax: 0, descansoSeg: 90, modo: 'corporal', tecnica: ['Al tope dejando 2 en reserva.'], ilustracion: 'lagartijas' })
const deadBug = (caso: string): Alternativa => alt({ id: 'dead-bug', nombre: 'Dead bug', caso, series: 3, repsMin: 10, repsMax: 10, descansoSeg: 45, modo: 'corporal', porLado: true, tecnica: ['Boca arriba, extender brazo y pierna contrarios sin despegar la espalda baja.'], ilustracion: 'dead-bug' })
const planchaRodillas: Alternativa = alt({ id: 'plancha-rodillas', nombre: 'Plancha con rodillas apoyadas', caso: 'No llegas a 45 s', series: 3, repsMin: 45, repsMax: 45, descansoSeg: 45, modo: 'tiempo', tecnica: ['Misma duración, rodillas en el piso.'], ilustracion: 'plancha-rodillas' })
const goblet = (caso: string): Alternativa => alt({ id: 'goblet', nombre: 'Sentadilla goblet', caso, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, ilustracion: 'goblet' })
const prensa = (caso: string): Alternativa => alt({ id: 'prensa', nombre: 'Prensa de pierna', caso, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, ilustracion: 'prensa' })
const curlAlternado = (caso: string): Alternativa => alt({ id: 'curl-alternado', nombre: 'Curl alterno con mancuernas', caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, porLado: true, tecnica: ['Un brazo a la vez, codos pegados.'], ilustracion: 'curl-alternado' })
const remoPechoMaquina = (caso: string, series = 3, repsMin = 10, repsMax = 12, descansoSeg = 75): Alternativa => alt({ id: 'remo-pecho-maquina', nombre: 'Remo en máquina con pecho apoyado', caso, series, repsMin, repsMax, descansoSeg, ubicar: 'Asiento, cojín al frente donde se apoya el pecho, manijas que se jalan.', tecnica: ['Jalar llevando los codos atrás.', 'Soltar controlado.'], ilustracion: 'remo-pecho-maquina' })
const lateralesLiga: Alternativa = alt({ id: 'laterales-liga', nombre: 'Laterales con liga', caso: 'Sin mancuernas', series: 3, repsMin: 15, repsMax: 20, descansoSeg: 60, modo: 'corporal', tecnica: ['Pisa la liga con los dos pies y sube a los lados hasta la altura de los hombros.'], ilustracion: 'laterales-liga' })
const dominadas = (caso: string, nombre = 'Dominadas asistidas en máquina o con liga', series = 3, descansoSeg = 75): Alternativa => alt({ id: 'dominadas-asistidas', nombre, caso, series, repsMin: 6, repsMax: 10, descansoSeg, invertida: true, ubicar: 'Máquina con plataforma para las rodillas y contrapeso, o una liga en la barra. En la máquina, más peso es más ayuda: progresar es quitar contrapeso.', tecnica: ['Subir llevando los codos abajo y atrás.', 'Bajar controlado hasta estirar.'], ilustracion: 'dominadas-asistidas' })
const pressPechoMaquina = (caso: string, series = 3, repsMin = 10, repsMax = 12, descansoSeg = 90): Alternativa => alt({ id: 'press-pecho-maquina', nombre: 'Press de pecho en máquina', caso, series, repsMin, repsMax, descansoSeg, ubicar: 'Asiento con respaldo, dos manijas a la altura del pecho que se empujan al frente.', colocacion: 'Ajustar el asiento para que las manijas queden a la altura de los pezones.', tecnica: ['Empujar al frente sin trabar los codos.', 'Regresar controlado.'], ilustracion: 'press-pecho-maquina' })
const tricepsCabezaAlt = (caso: string): Alternativa => alt({ id: 'triceps-cabeza', nombre: 'Extensión con mancuerna sobre la cabeza, sentado', caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, colocacion: 'Sentado en banco con respaldo, una mancuerna a dos manos.', tecnica: ['Bajar detrás de la cabeza doblando codos.', 'Estirar arriba sin abrir codos.'], ilustracion: 'triceps-cabeza' })
const tricepsPoleaAlt = (caso: string): Alternativa => alt({ id: 'triceps-polea', nombre: 'Extensión en polea alta', caso, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, tecnica: ['De pie, codos pegados a los costados.', 'Empujar hasta estirar, subir controlado.'], ilustracion: 'triceps-polea' })
const fondosBanco = (caso: string): Alternativa => alt({ id: 'fondos-banco', nombre: 'Fondos en banco', caso, series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'corporal', colocacion: 'Manos en la orilla del banco, pies al frente.', tecnica: ['Bajar doblando codos.', 'Subir estirando.'], ilustracion: 'fondos-banco' })

const LATERALES = (sesion: Letra, orden: number, bloque: number): Ejercicio => ({
  id: 'laterales', nombre: 'Elevaciones laterales', sesion, orden, bloque, series: 3, repsMin: 12, repsMax: 20, descansoSeg: 60, modo: 'peso', incrementoKg: 1,
  ubicar: 'Mancuernas ligeras (empezar con las que parezcan poca cosa).',
  tecnica: ['De pie, mancuernas a los costados, codos apenas doblados.', 'Subir a los lados hasta la altura de los hombros.', 'Bajar en 2 segundos.'],
  errores: ['Impulso.', 'Pasar de los hombros.', 'Encoger hombros.'],
  ilustracion: 'laterales',
  alternativas: [
    alt({ id: 'laterales-sentado', nombre: 'Laterales sentado', caso: 'Si te balanceas', series: 3, repsMin: 12, repsMax: 20, descansoSeg: 60, tecnica: ['Sentado en la orilla del banco, mismo movimiento.'], ilustracion: 'laterales-sentado' }),
    alt({ id: 'laterales-polea', nombre: 'Lateral en polea', caso: 'Mancuernas ocupadas', series: 3, repsMin: 12, repsMax: 20, descansoSeg: 60, porLado: true, tecnica: ['A una mano, cruzando el cable frente al cuerpo.'], ilustracion: 'laterales-polea' }),
    lateralesLiga,
  ],
})

/** Segundos para cambiarse de ejercicio dentro de un par (RUTINA-FINAL.md, 3) */
export const CAMBIO_PAR_SEG = 15

export const EJERCICIOS: Ejercicio[] = [
  // ---------------- A: pecho alto, dorsal y hombro ----------------
  {
    id: 'press-inclinado', nombre: 'Press inclinado con mancuernas', sesion: 'A', orden: 1, bloque: 1, series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco con respaldo ajustable a 30° (uno o dos clics arriba de plano). Más de 45° ya es hombro.',
    colocacion: 'Mancuernas sobre los muslos, impulsar una a la vez al acostarse, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: ['Bajar hasta la parte alta del pecho.', 'Empujar arriba y un poco atrás.'], errores: ['Banco muy inclinado.', 'Codos abiertos.', 'Rebotar.'], ilustracion: 'press-inclinado',
    alternativas: [
      alt({ id: 'press-inclinado-maquina', nombre: 'Press inclinado en máquina', caso: 'Banco ocupado o no hay inclinado', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Empujar al frente y arriba sin trabar los codos.', 'Regresar controlado.'], ilustracion: 'press-inclinado-maquina' }),
      lagartijasBanco('Sin mancuernas ni máquina'),
      pressPiso('Molestia de hombro'),
    ],
  },
  {
    id: 'jalon', nombre: 'Jalón al pecho en polea, agarre ancho', sesion: 'A', orden: 2, bloque: 2, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'Torre alta con asiento, cojines para trabar las rodillas y una barra ancha colgando arriba.',
    colocacion: 'Rodillas trabadas bajo el cojín, agarre un poco más ancho que los hombros, palmas al frente. Pecho arriba.',
    tecnica: ['Jalar la barra hasta la parte alta del pecho llevando los codos abajo y atrás.', 'Pausa corta.', 'Soltar controlado hasta estirar del todo.'], errores: ['Jalar detrás de la nuca.', 'Columpiarse.', 'Jalar con los brazos en vez de con los codos.'], ilustracion: 'jalon',
    alternativas: [dominadas('Polea ocupada'), remoMancuerna('Sin polea', 'Remo a una mano')],
  },
  {
    id: 'goblet', nombre: 'Sentadilla goblet', sesion: 'A', orden: 3, bloque: 3, pierna: true, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, modo: 'peso',
    ubicar: 'Una mancuerna; hacerla frente a un espejo si se puede.', colocacion: 'Mancuerna vertical pegada al pecho, sujeta por la cabeza de arriba con las dos manos. Pies al ancho de hombros, puntas un poco hacia afuera.',
    tecnica: ['Bajar como si te sentaras hasta que los muslos queden al menos paralelos.', 'Pecho arriba, talones pegados.', 'Subir empujando el piso.'], errores: ['Talones despegándose.', 'Rodillas cerrándose hacia adentro.', 'Encorvarse.'], ilustracion: 'goblet',
    alternativas: [
      prensa('Mancuerna pesada ocupada o prefieres máquina'),
      alt({ id: 'sentadilla-mancuernas', nombre: 'Sentadilla con dos mancuernas', caso: 'La mancuerna más pesada ya no alcanza', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, tecnica: ['Mancuernas colgando a los costados, misma técnica que la goblet.'], ilustracion: 'sentadilla-mancuernas' }),
      alt({ id: 'sentadilla-banco', nombre: 'Sentadilla a un banco', caso: 'Sin nada libre', series: 3, repsMin: 15, repsMax: 15, descansoSeg: 90, modo: 'corporal', tecnica: ['Peso corporal, bajando hasta tocar el banco sin sentarse.'], ilustracion: 'sentadilla-banco' }),
    ],
  },
  {
    id: 'press-militar', nombre: 'Press militar sentado con mancuernas', sesion: 'A', orden: 4, bloque: 4, series: 2, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco con respaldo ajustable, casi vertical (un clic antes de 90°).', colocacion: 'Mancuernas a la altura de las orejas, palmas al frente, espalda baja pegada, abdomen apretado.',
    tecnica: ['Empujar hacia arriba hasta estirar sin trabar los codos.', 'Bajar controlado a la altura de las orejas.'], errores: ['Arquear la espalda.', 'Bajar de más.', 'Impulso con las piernas.'], ilustracion: 'press-militar',
    alternativas: [
      alt({ id: 'press-militar-pie', nombre: 'Press militar de pie con mancuernas', caso: 'No hay banco con respaldo', series: 2, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Mismas reps, un poco menos de peso.', 'Glúteos y abdomen apretados.'], ilustracion: 'press-militar-pie' }),
      alt({ id: 'press-hombro-maquina', nombre: 'Press de hombro en máquina', caso: 'Mancuernas ocupadas', series: 2, repsMin: 8, repsMax: 10, descansoSeg: 90, ubicar: 'Asiento con manijas a la altura de los hombros que se empujan hacia arriba.', tecnica: ['Empujar hacia arriba sin trabar los codos.', 'Bajar controlado.'], ilustracion: 'press-hombro-maquina' }),
      alt({ id: 'press-militar-neutro', nombre: 'Press con agarre neutro', caso: 'Molestia de hombro', series: 2, repsMin: 8, repsMax: 10, descansoSeg: 90, tecnica: ['Palmas mirándose, mismo rango.'], ilustracion: 'press-militar-neutro' }),
    ],
  },
  LATERALES('A', 5, 5),
  {
    id: 'remo-pecho-apoyado', nombre: 'Remo con pecho apoyado en banco inclinado', sesion: 'A', orden: 6, bloque: 5, series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
    colocacion: 'Banco inclinado a 30 o 45°, boca abajo con el pecho apoyado y la barbilla por fuera del respaldo. Mancuernas colgando, palmas viéndose.',
    tecnica: ['Jala los codos atrás, a unos 45° del cuerpo, hasta pasar la línea de la espalda.', 'Aprieta un segundo y baja en 2 a 3 segundos.'], errores: ['Despegar el pecho del banco.', 'Encoger los hombros hacia las orejas.'], ilustracion: 'remo-pecho-apoyado',
    alternativas: [
      remoPechoMaquina('Banco inclinado ocupado', 3, 12, 15, 60),
      alt({ id: 'remo-alto-maquina', nombre: 'Remo alto en máquina', caso: 'Tampoco está la de remo con pecho apoyado', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, tecnica: ['Jalar las manijas hacia el pecho alto con los codos abiertos.', 'Soltar controlado.'], ilustracion: 'remo-alto-maquina' }),
    ],
  },
  {
    id: 'curl-z', nombre: 'Curl con barra Z', sesion: 'A', orden: 7, bloque: 6, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'Barra Z (la ondulada corta) con discos, o las fijas si el gym las tiene. Llévala a la polea para el par.',
    tecnica: ['De pie, codos pegados y quietos.', 'Subir doblando solo los codos, apretar arriba.', 'Bajar en 2 segundos hasta estirar.'], errores: ['Balancear.', 'Codos hacia adelante.', 'No bajar completo.'], ilustracion: 'curl-z',
    alternativas: [
      curlAlternado('Barra ocupada'),
      alt({ id: 'curl-polea', nombre: 'Curl en polea', caso: 'Sin barra ni mancuernas', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, tecnica: ['Codos pegados, subir y bajar en 2 segundos.'], ilustracion: 'curl-polea' }),
    ],
  },
  {
    id: 'triceps-polea', nombre: 'Extensión de tríceps en polea alta', sesion: 'A', orden: 8, bloque: 6, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'La polea alta de la torre del jalón, con barra recta corta o cuerda.',
    tecnica: ['De pie, codos pegados a los costados.', 'Empujar hasta estirar, subir controlado hasta que los antebrazos queden paralelos al piso.'], errores: ['Abrir codos.', 'Inclinarse y empujar con el cuerpo.'], ilustracion: 'triceps-polea',
    alternativas: [tricepsCabezaAlt('Polea ocupada'), fondosBanco('Sin polea ni mancuerna; no usar si molesta el hombro')],
  },
  {
    id: 'plancha', nombre: 'Plancha', sesion: 'A', orden: 9, bloque: 7, series: 3, repsMin: 45, repsMax: 45, descansoSeg: 45, modo: 'tiempo',
    tecnica: ['Antebrazos en el piso, codos bajo los hombros.', 'Cuerpo en línea recta, glúteos y abdomen apretados.', 'Mirada al piso, respirar.'], errores: ['Cadera caída o levantada.', 'Contener la respiración.'], ilustracion: 'plancha',
    alternativas: [planchaRodillas, deadBug('Molestia de espalda baja o el piso no ayuda')],
  },

  // ---------------- B: pecho, espalda media y brazo ----------------
  {
    id: 'press-plano', nombre: 'Press plano con mancuernas', sesion: 'B', orden: 1, bloque: 1, series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Cualquier banco plano libre; se lleva las mancuernas al banco.',
    colocacion: 'Sentado en la orilla con las mancuernas sobre los muslos, impulsar una a la vez con la rodilla al acostarse. Pies firmes, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: ['Bajar en 2 segundos hasta que los codos queden a la altura del pecho.', 'Empujar hasta arriba sin chocar las mancuernas.', 'Codos a unos 45° del cuerpo.'], errores: ['Rebotar abajo.', 'Arquear la espalda baja de más.', 'Abrir codos a 90°.'], ilustracion: 'press-plano',
    alternativas: [pressPechoMaquina('Banco ocupado'), pressPiso('Sin banco'), lagartijas('Sin banco ni mancuernas')],
  },
  {
    id: 'remo-polea', nombre: 'Remo sentado en polea baja', sesion: 'B', orden: 2, bloque: 2, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'La polea baja de la torre del jalón, con el agarre en V. La máquina de remo con plataforma sirve igual.',
    colocacion: 'Pies en la plataforma o firmes en el piso, rodillas apenas dobladas, espalda recta, brazos estirados al frente.',
    tecnica: ['Jalar el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos.', 'Pausa.', 'Soltar controlado hasta estirar sin encorvarse.'], errores: ['Mecerse con el torso.', 'Encoger hombros.', 'Jalar hacia el pecho alto.'], ilustracion: 'remo-polea',
    alternativas: [remoPechoMaquina('Polea ocupada'), remoMancuerna('Sin polea')],
  },
  {
    id: 'prensa', nombre: 'Prensa de pierna', sesion: 'B', orden: 3, bloque: 3, pierna: true, series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, modo: 'peso',
    ubicar: 'Máquina grande con asiento reclinado y una plataforma inclinada arriba para los pies, con palancas de seguridad a los lados.',
    colocacion: 'Pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados al asiento. Soltar los seguros con las piernas ya estiradas.',
    tecnica: ['Bajar controlado hasta unos 90° en las rodillas.', 'Empujar sin trabar las rodillas arriba.'], errores: ['Despegar la cadera del asiento.', 'Trabar rodillas.', 'No poner los seguros al terminar.'], ilustracion: 'prensa',
    alternativas: [
      goblet('Prensa ocupada o no la ubicas'),
      alt({ id: 'prensa-corta', nombre: 'Prensa con recorrido corto', caso: 'Rodilla molesta', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, tecnica: ['Misma máquina, bajando menos: sin llegar a 90°.'], ilustracion: 'prensa-corta' }),
    ],
  },
  {
    id: 'jalon-cerrado', nombre: 'Jalón al pecho con agarre cerrado', sesion: 'B', orden: 4, bloque: 4, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'La misma torre y barra larga del jalón; si el jalón y el remo están en la misma máquina doble, quédate ahí.',
    colocacion: 'Manos al ancho de los hombros, palmas al frente, rodillas trabadas, pecho arriba.',
    tecnica: ['Jala a la parte alta del pecho con los codos pegados al cuerpo.', 'Pausa corta y sube en 2 a 3 segundos hasta estirar del todo.'], errores: ['Echarte atrás para mover más peso.', 'Quedarte corto arriba.'], ilustracion: 'jalon-cerrado',
    alternativas: [
      dominadas('Polea ocupada', 'Dominadas asistidas', 2, 60),
      alt({ id: 'remo-polea-una-mano', nombre: 'Remo sentado a una mano en polea', caso: 'Solo queda libre la polea baja', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, porLado: true, tecnica: ['Mismo movimiento con la manija de una mano en la polea baja.'], ilustracion: 'remo-polea-una-mano' }),
    ],
  },
  LATERALES('B', 5, 4),
  {
    id: 'aperturas-maquina', nombre: 'Aperturas en máquina', sesion: 'B', orden: 6, bloque: 5, series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
    ubicar: 'Asiento con dos manijas a los lados que se juntan al frente; suele decir Pec Deck o Butterfly.',
    colocacion: 'Manijas a la altura del pecho, espalda pegada, codos apenas doblados y fijos.',
    tecnica: ['Junta en arco, aprieta un segundo.', 'Regresa en 2 a 3 segundos hasta la línea del cuerpo.'], errores: ['Abrir más atrás de los hombros.', 'Doblar los codos para empujar.'], ilustracion: 'aperturas-maquina',
    alternativas: [
      alt({ id: 'aperturas-mancuernas', nombre: 'Aperturas con mancuernas en banco plano', caso: 'No hay máquina o está ocupada', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, tecnica: ['Abre en arco hasta la altura del pecho, codos apenas doblados y fijos.', 'Sube por el mismo arco.'], ilustracion: 'aperturas-mancuernas' }),
      alt({ id: 'cruce-poleas', nombre: 'Cruce de poleas de pie', caso: 'Banco y máquina ocupados', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, tecnica: ['Junta las manos al frente y un poco abajo, codos fijos.', 'Regresa controlado hasta la línea de los hombros.'], ilustracion: 'cruce-poleas' }),
      pressPechoMaquina('Molestia de hombro al abrir', 2, 12, 15, 60),
    ],
  },
  {
    id: 'curl-martillo', nombre: 'Curl martillo', sesion: 'B', orden: 7, bloque: 6, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'Sentado en el banco con respaldo; el par entero va ahí.',
    tecnica: ['Palmas mirándose todo el recorrido, codos pegados.', 'Subir, apretar, bajar controlado.'], errores: [], ilustracion: 'curl-martillo',
    alternativas: [
      alt({ id: 'curl-cuerda', nombre: 'Curl martillo en polea con cuerda', caso: 'Mancuernas ocupadas', series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, tecnica: ['Palmas mirándose, codos pegados.'], ilustracion: 'curl-cuerda' }),
      curlAlternado('Otra opción con mancuernas'),
    ],
  },
  {
    id: 'triceps-cabeza', nombre: 'Extensión de tríceps con mancuerna sobre la cabeza, sentado', sesion: 'B', orden: 8, bloque: 6, series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    colocacion: 'Banco con respaldo derecho, espalda pegada, una mancuerna con las dos manos por el disco de arriba, brazos estirados sobre la cabeza.',
    tecnica: ['Baja detrás de la cabeza en 2 a 3 segundos doblando solo los codos.', 'Sube hasta estirar.'], errores: ['Abrir los codos.', 'Arquear la espalda baja.'], ilustracion: 'triceps-cabeza',
    alternativas: [tricepsPoleaAlt('Te molesta el hombro o el codo arriba de la cabeza'), fondosBanco('Sin mancuerna ni polea; no usar si molesta el hombro')],
  },
  {
    id: 'elevacion-piernas', nombre: 'Elevación de piernas acostado en banco', sesion: 'B', orden: 9, bloque: 7, series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal',
    ubicar: 'Banco plano, acostado boca arriba, manos agarrando el banco detrás de la cabeza.',
    tecnica: ['Espalda baja pegada.', 'Subir las piernas casi estiradas hasta la vertical.', 'Bajar controlado sin que la espalda baja se despegue.'], errores: ['Arquear la espalda.', 'Bajar con impulso.'], ilustracion: 'elevacion-piernas',
    alternativas: [
      alt({ id: 'elevacion-piernas-piso', nombre: 'Elevación de piernas en el piso', caso: 'Sin banco', series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal', tecnica: ['Manos bajo los glúteos.'], ilustracion: 'elevacion-piernas-piso' }),
      alt({ id: 'elevacion-rodillas', nombre: 'Elevación de rodillas dobladas', caso: 'Te jala la espalda baja', series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal', tecnica: ['Mismo movimiento con rodillas dobladas.'], ilustracion: 'elevacion-rodillas' }),
      deadBug('Molestia de espalda baja'),
    ],
  },

  // ---------------- CASA: 12 minutos, opcional ----------------
  {
    id: 'laterales-casa', nombre: 'Laterales con mancuernas de 4 a 5 kg', sesion: 'CASA', orden: 1, bloque: 1, series: 3, repsMin: 15, repsMax: 20, descansoSeg: 60, modo: 'peso', incrementoKg: 1,
    tecnica: ['De pie, mancuernas a los costados, codos apenas doblados.', 'Subir a los lados hasta la altura de los hombros.', 'Bajar en 2 segundos.'], errores: ['Impulso.', 'Pasar de los hombros.', 'Encoger hombros.'], ilustracion: 'laterales-casa',
    alternativas: [lateralesLiga],
  },
  {
    id: 'lagartijas', nombre: 'Lagartijas dejando 2 en reserva', sesion: 'CASA', orden: 2, bloque: 2, series: 3, repsMin: 0, repsMax: 0, descansoSeg: 60, modo: 'corporal',
    tecnica: ['Manos un poco más abiertas que los hombros, cuerpo recto.', 'Baja hasta un puño del piso, codos a 45°.', 'Sube empujando el piso.'], errores: ['Cadera caída.', 'Codos abiertos en T.'], ilustracion: 'lagartijas',
    alternativas: [
      alt({ id: 'lagartijas-inclinadas', nombre: 'Lagartijas con las manos en la cama o una mesa firme', caso: 'Si cuestan', series: 3, repsMin: 0, repsMax: 0, descansoSeg: 60, modo: 'corporal', tecnica: ['Mismo movimiento con las manos elevadas.'], ilustracion: 'lagartijas-inclinadas' }),
      lagartijasBanco('Si ya haces más de 20'),
    ],
  },
  {
    id: 'remo-liga', nombre: 'Remo con liga anclada en la puerta', sesion: 'CASA', orden: 3, bloque: 3, series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'corporal',
    tecnica: ['Liga a la altura del pecho, puerta con seguro.', 'Jala los codos hacia atrás pegados al cuerpo, aprieta los omóplatos y regresa lento.'], errores: ['Echarte para atrás.', 'Dejar que la liga regrese de golpe.'], ilustracion: 'remo-liga',
    alternativas: [
      alt({ id: 'remo-mancuerna-casa', nombre: 'Remo a una mano apoyado en la cama o una silla', caso: 'Sin liga', series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, porLado: true, tecnica: ['Jala el codo hacia la cadera, pegado al cuerpo.'], ilustracion: 'remo-mancuerna-casa' }),
    ],
  },
  {
    id: 'plancha-casa', nombre: 'Plancha', sesion: 'CASA', orden: 4, bloque: 4, series: 2, repsMin: 45, repsMax: 45, descansoSeg: 60, modo: 'tiempo',
    tecnica: ['Antebrazos en el piso, codos bajo los hombros, cuerpo en línea recta.', 'Respirar.'], errores: ['Cadera caída o levantada.'], ilustracion: 'plancha-casa',
    alternativas: [planchaRodillas, deadBug('Molestia de espalda baja')],
  },
]

/** Ejercicio a usar en la rutina: el original o la alternativa marcada con "Usar siempre esta" */
export function itemDeRutina(base: Ejercicio, reemplazos?: Record<string, string>): Ejercicio | Alternativa {
  const id = reemplazos?.[base.id]
  return (id && base.alternativas.find((a) => a.id === id)) || base
}
export function ejerciciosDe(sesion: Letra): Ejercicio[] {
  return EJERCICIOS.filter((e) => e.sesion === sesion).sort((a, b) => a.orden - b.orden)
}
export function buscarEjercicio(id: string): Ejercicio | undefined {
  return EJERCICIOS.find((e) => e.id === id)
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
/** Ejercicios que suben a 4 series con la regla de 4 semanas */
export const CON_SERIE_EXTRA = ['press-inclinado', 'jalon', 'press-plano', 'remo-polea']
export const NOMBRE_SESION: Record<Letra, string> = { A: 'Pecho alto, dorsal y hombro', B: 'Pecho, espalda media y brazo', CASA: 'Casa, 12 minutos' }

/** Un bloque de la sesión: un ejercicio o un par */
export interface Bloque { numero: number; ejercicios: Ejercicio[] }
/** Bloques de una sesión según versión y pierna. Corta: bloques 1, 2 y el par de laterales. CASA: todo. */
export function bloquesDe(sesion: Letra, version: 'completa' | 'corta' | 'bonus' = 'completa', pierna = false): Bloque[] {
  const lista = ejerciciosDe(sesion).filter((e) => !e.pierna || (pierna && sesion !== 'CASA'))
  const mapa = new Map<number, Ejercicio[]>()
  for (const e of lista) mapa.set(e.bloque, [...(mapa.get(e.bloque) ?? []), e])
  let bloques = [...mapa.entries()].sort((a, b) => a[0] - b[0]).map(([numero, ejercicios]) => ({ numero, ejercicios }))
  if (version === 'corta' && sesion !== 'CASA') bloques = bloques.filter((b) => b.numero <= 2 || b.ejercicios.some((e) => e.id === 'laterales'))
  return bloques
}
/** Ids que ya están en la sesión (bases y alternativas elegidas), para no repetir un movimiento el mismo día */
export function idsEnSesion(bloques: Bloque[], cambios: { ejercicioId: string; alternativaId: string }[] = [], reemplazos?: Record<string, string>): Set<string> {
  const ids = new Set<string>()
  for (const b of bloques) for (const e of b.ejercicios) {
    const cambio = cambios.find((c) => c.ejercicioId === e.id)
    ids.add(cambio ? cambio.alternativaId : itemDeRutina(e, reemplazos).id)
  }
  return ids
}
/** Alternativas que se pueden elegir para `base`: las suyas menos las que ya están en otro bloque de la sesión */
export function alternativasDisponibles(base: Ejercicio, bloques: Bloque[], cambios: { ejercicioId: string; alternativaId: string }[] = [], reemplazos?: Record<string, string>): Alternativa[] {
  const otros = idsEnSesion(bloques.map((b) => ({ ...b, ejercicios: b.ejercicios.filter((e) => e.id !== base.id) })), cambios.filter((c) => c.ejercicioId !== base.id), reemplazos)
  return base.alternativas.filter((a) => !otros.has(a.id))
}
