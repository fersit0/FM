// Biblioteca de ejercicios: sección 7 del brief, tal cual. Nada fuera de aquí.
import type { Ejercicio, Alternativa, Letra } from './tipos'

const alt = (a: Omit<Alternativa, 'modo' | 'tecnica' | 'errores'> & Partial<Pick<Alternativa, 'modo' | 'tecnica' | 'errores'>>): Alternativa => ({
  modo: 'peso',
  tecnica: [],
  errores: [],
  ...a,
})

export const CALENTAMIENTO = {
  nombre: 'Calentamiento',
  minCompleta: 7,
  minCorta: 4,
  texto: 'Elíptica 7 min, ritmo en el que puedes platicar. Corta: 4 min.',
  siOcupada: 'Si la elíptica está ocupada: caminadora inclinada 7 min o saco suave.',
}

export const CIERRE = {
  nombre: 'Cierre',
  minCompleta: 12,
  minCompletaMax: 15,
  minCorta: 5,
  minBonus: 20,
  texto: 'Elíptica o saco, 12 a 15 min. Saco: 4 rounds de 2 min con 1 de descanso. Corta: 5 min. Bonus: 20 min.',
}

export const REGLAS_GLOBALES: { titulo: string; texto: string }[] = [
  {
    titulo: 'Esfuerzo',
    texto: 'Terminar cada serie con 1 o 2 repeticiones guardadas. Si la última salió fácil, el peso era chico. Si no llegaste al mínimo del rango, era grande.',
  },
  {
    titulo: 'Peso inicial',
    texto: 'Primera vez de cada ejercicio: elegir un peso con el que el tope del rango salga con 2 guardadas. Si hay duda, empezar más ligero; la app sube rápido en dos sesiones.',
  },
  {
    titulo: 'Serie de aproximación',
    texto: 'En el primer ejercicio de cada sesión, una serie ligera (mitad del peso, 10 reps) que no se registra. En los demás no hace falta.',
  },
  {
    titulo: 'Descanso',
    texto: 'El que marca cada ejercicio. Sin cel entre series; la app muestra el cronómetro grande.',
  },
  {
    titulo: 'Dolor',
    texto: 'Molestia muscular es normal; dolor agudo en una articulación (hombro, codo, rodilla, espalda baja) no. Si aparece, cambiar a la alternativa ese día y anotarlo. No se aguanta.',
  },
  {
    titulo: 'Semana pesada',
    texto: 'Si dos semanas seguidas se llega muerto, la siguiente se hacen 2 series por ejercicio con el mismo peso y se retoma. La app lo ofrece, no lo impone.',
  },
]

export const VERSION_CORTA_TEXTO =
  'Calentamiento 4 min, ejercicios 1 a 4 de la sesión con 2 series cada uno, cierre 5 min. Cuenta completa. Se activa sola por horario o a mano.'

export const REGLA_ALTERNATIVA =
  'Primero la que use el mismo equipo, luego la que use mancuernas, luego la de peso corporal. Nunca se salta el patrón; si no hay forma de empujar horizontal, se hacen lagartijas, no se salta el pecho.'

// Alternativas compartidas
const remoMancuerna = (id: string): Alternativa =>
  alt({
    id,
    nombre: 'Remo con mancuerna a una mano',
    caso: 'Sin máquina',
    series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, porLado: true,
    colocacion: 'Rodilla y mano apoyadas en el banco, espalda plana.',
    tecnica: ['Jalar el codo hacia la cadera.', 'Bajar controlado hasta estirar.'],
    ilustracion: 'remo-mancuerna',
  })

const sentadillaBanco = (id: string, repsMin: number, repsMax: number): Alternativa =>
  alt({
    id,
    nombre: 'Sentadilla a un banco',
    caso: 'Sin nada libre',
    series: 3, repsMin, repsMax, descansoSeg: 90, modo: 'corporal',
    tecnica: ['Peso corporal, bajando hasta tocar el banco sin sentarse.'],
    ilustracion: 'sentadilla-banco',
  })

const sentadillaDosMancuernas = (id: string, caso: string): Alternativa =>
  alt({
    id,
    nombre: 'Sentadilla con dos mancuernas a los costados',
    caso,
    series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90,
    tecnica: ['Mancuernas colgando a los costados, misma técnica que la goblet.'],
    ilustracion: 'sentadilla-mancuernas',
  })

const lagartijasBanco = (id: string, caso: string): Alternativa =>
  alt({
    id,
    nombre: 'Lagartijas con los pies sobre el banco',
    caso,
    series: 3, repsMin: 0, repsMax: 0, descansoSeg: 90, modo: 'corporal',
    tecnica: ['Al tope con 2 guardadas.'],
    ilustracion: 'lagartijas-banco',
  })

const deadBug = (id: string, caso: string): Alternativa =>
  alt({
    id,
    nombre: 'Dead bug',
    caso,
    series: 3, repsMin: 10, repsMax: 10, descansoSeg: 45, modo: 'corporal', porLado: true,
    tecnica: ['Boca arriba, extender brazo y pierna contrarios sin despegar la espalda baja.'],
    ilustracion: 'dead-bug',
  })

export const EJERCICIOS: Ejercicio[] = [
  // ---------------- Sesión A ----------------
  {
    id: 'A1', nombre: 'Press de banca plano con mancuernas', sesion: 'A', orden: 1,
    series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Cualquier banco plano libre; se lleva las mancuernas al banco.',
    colocacion: 'Sentado en la orilla con las mancuernas sobre los muslos, impulsar una a la vez con la rodilla al acostarse. Pies firmes, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: [
      'Bajar en 2 segundos hasta que los codos queden a la altura del pecho o poco más abajo.',
      'Empujar hasta arriba sin chocar las mancuernas.',
      'Codos a unos 45° del cuerpo.',
    ],
    errores: ['Rebotar abajo.', 'Arquear la espalda baja de más.', 'Subir hacia la cara.', 'Abrir codos a 90°.'],
    ilustracion: 'press-banca',
    alternativas: [
      alt({
        id: 'A1-piso', nombre: 'Press en el piso con mancuernas', caso: 'Sin banco',
        series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90,
        tecnica: ['Acostado en el piso, mismas reps.', 'La amplitud es menor y es más seguro para el hombro.'],
        ilustracion: 'press-piso',
      }),
      alt({
        id: 'A1-maquina', nombre: 'Máquina de press de pecho sentado', caso: 'Ocupado',
        series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90,
        ubicar: 'Asiento con respaldo, dos manijas a la altura del pecho que se empujan al frente.',
        colocacion: 'Ajustar el asiento para que las manijas queden a la altura de los pezones.',
        tecnica: ['Empujar al frente sin trabar los codos.', 'Regresar controlado.'],
        ilustracion: 'press-maquina',
      }),
      lagartijasBanco('A1-lagartijas', 'Peso no alcanza'),
    ],
  },
  {
    id: 'A2', nombre: 'Jalón al pecho en polea', sesion: 'A', orden: 2,
    series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'Torre alta con asiento, cojines para trabar las rodillas y una barra ancha colgando arriba. Es la misma estación que tiene la polea baja para remo.',
    colocacion: 'Rodillas trabadas bajo el cojín, agarre un poco más ancho que los hombros, palmas al frente. Pecho arriba, inclinación mínima hacia atrás.',
    tecnica: [
      'Jalar la barra hasta la parte alta del pecho llevando los codos abajo y atrás.',
      'Pausa corta.',
      'Soltar controlado hasta estirar del todo.',
    ],
    errores: ['Jalar detrás de la nuca.', 'Columpiarse.', 'Jalar con los brazos en vez de con los codos.', 'No estirar arriba.'],
    ilustracion: 'jalon',
    alternativas: [
      remoMancuerna('A2-remo'),
      alt({
        id: 'A2-dominadas', nombre: 'Dominadas asistidas', caso: 'Ocupado',
        series: 3, repsMin: 8, repsMax: 10, descansoSeg: 75,
        ubicar: 'Máquina con plataforma para las rodillas y contrapeso. Si no hay, remo con mancuerna.',
        tecnica: ['Subir llevando los codos abajo y atrás.', 'Bajar controlado hasta estirar.'],
        ilustracion: 'dominadas',
      }),
      alt({
        id: 'A2-dominadas-menos', nombre: 'Dominadas asistidas con menos contrapeso', caso: 'Peso no alcanza',
        series: 3, repsMin: 8, repsMax: 10, descansoSeg: 75,
        tecnica: ['Mismo movimiento, quitando contrapeso conforme salga.'],
        ilustracion: 'dominadas',
      }),
    ],
  },
  {
    id: 'A3', nombre: 'Sentadilla goblet', sesion: 'A', orden: 3,
    series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, modo: 'peso',
    ubicar: 'Una mancuerna; hacerla frente a un espejo si se puede.',
    colocacion: 'Mancuerna vertical pegada al pecho, sujeta por la cabeza de arriba con las dos manos. Pies al ancho de hombros, puntas un poco hacia afuera.',
    tecnica: [
      'Bajar como si te sentaras, rodillas siguiendo la dirección de los pies, hasta que los muslos queden al menos paralelos.',
      'Pecho arriba, talones pegados.',
      'Subir empujando el piso.',
    ],
    errores: ['Talones despegándose.', 'Rodillas cerrándose hacia adentro.', 'Encorvarse.', 'Bajar poco.'],
    ilustracion: 'goblet',
    alternativas: [
      alt({
        id: 'A3-prensa', nombre: 'Prensa de pierna', caso: 'Peso no alcanza',
        series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90,
        ubicar: 'Ver B3. La mancuerna más pesada ya sale fácil.',
        tecnica: ['Bajar controlado hasta unos 90° en las rodillas.', 'Empujar sin trabar las rodillas arriba.'],
        ilustracion: 'prensa',
      }),
      sentadillaDosMancuernas('A3-dos-mancuernas', 'Peso no alcanza'),
      { ...sentadillaBanco('A3-banco', 15, 15), caso: 'Sin mancuernas libres' },
      alt({
        id: 'A3-prensa-corta', nombre: 'Prensa con recorrido corto', caso: 'Rodilla molesta',
        series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90,
        tecnica: ['Prensa de pierna bajando menos, sin llegar a 90°.'],
        ilustracion: 'prensa',
      }),
    ],
  },
  {
    id: 'A4', nombre: 'Press militar sentado con mancuernas', sesion: 'A', orden: 4,
    series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco con respaldo ajustable, ponerlo casi vertical (un clic antes de 90°).',
    colocacion: 'Mancuernas a la altura de las orejas, palmas al frente, espalda baja pegada, abdomen apretado.',
    tecnica: [
      'Empujar hacia arriba hasta estirar sin trabar los codos.',
      'Bajar controlado a la altura de las orejas.',
      'Las mancuernas suben en línea, no hacia adelante.',
    ],
    errores: ['Arquear la espalda.', 'Bajar de más.', 'Impulso con las piernas.'],
    ilustracion: 'militar',
    alternativas: [
      alt({
        id: 'A4-pie', nombre: 'Press militar de pie con mancuernas', caso: 'Sin banco con respaldo',
        series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90,
        tecnica: ['Mismas reps, un poco menos de peso.', 'Glúteos y abdomen apretados.'],
        ilustracion: 'militar-pie',
      }),
      alt({
        id: 'A4-maquina', nombre: 'Máquina de press de hombro', caso: 'Ocupado',
        series: 3, repsMin: 10, repsMax: 10, descansoSeg: 90,
        ubicar: 'Asiento con manijas a la altura de los hombros que se empujan hacia arriba.',
        tecnica: ['Empujar hacia arriba sin trabar los codos.', 'Bajar controlado.'],
        ilustracion: 'hombro-maquina',
      }),
      alt({
        id: 'A4-neutro', nombre: 'Press con agarre neutro', caso: 'Hombro molesto',
        series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90,
        tecnica: ['Palmas mirándose, mismo rango.'],
        ilustracion: 'militar-neutro',
      }),
    ],
  },
  {
    id: 'A5', nombre: 'Curl con barra Z', sesion: 'A', orden: 5,
    series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'Barra Z (la ondulada corta) con discos, o las fijas si el gym las tiene.',
    tecnica: [
      'De pie, codos pegados y quietos.',
      'Subir doblando solo los codos, apretar arriba.',
      'Bajar en 2 segundos hasta estirar.',
    ],
    errores: ['Balancear.', 'Codos hacia adelante.', 'No bajar completo.'],
    ilustracion: 'curl-z',
    alternativas: [
      alt({
        id: 'A5-alternado', nombre: 'Curl alternado con mancuernas', caso: 'Sin barra',
        series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60, porLado: true,
        tecnica: ['Un brazo a la vez, codos pegados.'],
        ilustracion: 'curl-alternado',
      }),
      alt({
        id: 'A5-polea', nombre: 'Curl en polea baja con barra recta', caso: 'Ocupado',
        series: 2, repsMin: 10, repsMax: 12, descansoSeg: 60,
        ubicar: 'Misma estación del jalón.',
        tecnica: ['Codos pegados, subir y bajar en 2 segundos.'],
        ilustracion: 'curl-polea',
      }),
    ],
  },
  {
    id: 'A6', nombre: 'Extensión de tríceps en polea alta', sesion: 'A', orden: 6,
    series: 2, repsMin: 12, repsMax: 12, descansoSeg: 60, modo: 'peso',
    ubicar: 'La polea alta de la torre del jalón, con barra recta corta o cuerda.',
    tecnica: [
      'De pie, codos pegados a los costados.',
      'Empujar hasta estirar, subir controlado hasta que los antebrazos queden paralelos al piso.',
      'Solo se mueven los antebrazos.',
    ],
    errores: ['Abrir codos.', 'Inclinarse y empujar con el cuerpo.'],
    ilustracion: 'triceps-polea',
    alternativas: [
      alt({
        id: 'A6-cabeza', nombre: 'Extensión sobre la cabeza con mancuerna', caso: 'Sin polea',
        series: 2, repsMin: 12, repsMax: 12, descansoSeg: 60,
        colocacion: 'Sentado en banco con respaldo, una mancuerna a dos manos.',
        tecnica: ['Bajar detrás de la cabeza doblando codos.', 'Estirar arriba sin abrir codos.'],
        ilustracion: 'triceps-cabeza',
      }),
      alt({
        id: 'A6-fondos', nombre: 'Fondos en banco', caso: 'Ocupado',
        series: 2, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'corporal',
        colocacion: 'Manos en la orilla del banco, pies al frente.',
        tecnica: ['Bajar doblando codos.', 'Subir estirando.'],
        ilustracion: 'fondos-banco',
      }),
    ],
  },
  {
    id: 'A7', nombre: 'Plancha', sesion: 'A', orden: 7,
    series: 3, repsMin: 40, repsMax: 40, descansoSeg: 45, modo: 'tiempo',
    tecnica: [
      'Antebrazos en el piso, codos bajo los hombros.',
      'Cuerpo en línea recta, glúteos y abdomen apretados.',
      'Mirada al piso, respirar.',
    ],
    errores: ['Cadera caída o levantada.', 'Contener la respiración.'],
    ilustracion: 'plancha',
    alternativas: [
      alt({
        id: 'A7-rodillas', nombre: 'Plancha con rodillas apoyadas', caso: 'No se sostiene',
        series: 3, repsMin: 40, repsMax: 40, descansoSeg: 45, modo: 'tiempo',
        tecnica: ['Misma duración, rodillas en el piso.'],
        ilustracion: 'plancha-rodillas',
      }),
      deadBug('A7-deadbug', 'Piso ocupado o sucio'),
    ],
  },

  // ---------------- Sesión B ----------------
  {
    id: 'B1', nombre: 'Press inclinado con mancuernas', sesion: 'B', orden: 1,
    series: 3, repsMin: 10, repsMax: 10, descansoSeg: 90, modo: 'peso',
    ubicar: 'Banco con respaldo ajustable a 30° (uno o dos clics arriba de plano). Más de 45° ya es hombro.',
    colocacion: 'Igual que el press plano: mancuernas sobre los muslos, impulsar una a la vez, espalda alta pegada, omóplatos juntos y abajo.',
    tecnica: [
      'Bajar hasta la parte alta del pecho.',
      'Empujar arriba y un poco atrás.',
    ],
    errores: ['Banco muy inclinado.', 'Codos abiertos.', 'Rebotar.'],
    ilustracion: 'press-inclinado',
    alternativas: [
      alt({
        id: 'B1-plano', nombre: 'Press plano con mancuernas', caso: 'Sin banco ajustable',
        series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90,
        tecnica: ['El press plano (A1) ese día.'],
        ilustracion: 'press-banca',
      }),
      alt({
        id: 'B1-maquina', nombre: 'Máquina de press inclinado', caso: 'Ocupado',
        series: 3, repsMin: 10, repsMax: 10, descansoSeg: 90,
        tecnica: ['Si existe. Si no, lagartijas con los pies en el banco.'],
        ilustracion: 'press-maquina',
      }),
      lagartijasBanco('B1-lagartijas', 'Ocupado y sin máquina'),
    ],
  },
  {
    id: 'B2', nombre: 'Remo sentado en polea baja', sesion: 'B', orden: 2,
    series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75, modo: 'peso',
    ubicar: 'La polea baja de la torre del jalón, con el agarre en V (dos manijas juntas). Hay gyms que tienen una máquina de remo aparte con plataforma para los pies; sirve igual.',
    colocacion: 'Pies en la plataforma o firmes en el piso, rodillas apenas dobladas, espalda recta, brazos estirados al frente.',
    tecnica: [
      'Jalar el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos.',
      'Pausa.',
      'Soltar controlado hasta estirar sin encorvarse.',
    ],
    errores: ['Mecerse con el torso.', 'Encoger hombros.', 'Jalar hacia el pecho alto.'],
    ilustracion: 'remo-polea',
    alternativas: [
      { ...remoMancuerna('B2-remo'), caso: 'Sin polea' },
      alt({
        id: 'B2-pecho', nombre: 'Máquina de remo con pecho apoyado', caso: 'Ocupado',
        series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75,
        ubicar: 'Asiento, cojín al frente donde se apoya el pecho, manijas que se jalan.',
        tecnica: ['Jalar llevando los codos atrás.', 'Soltar controlado.'],
        ilustracion: 'remo-pecho',
      }),
      alt({
        id: 'B2-pausa', nombre: 'Remo en polea con pausa de 2 segundos', caso: 'Peso no alcanza',
        series: 3, repsMin: 10, repsMax: 12, descansoSeg: 75,
        tecnica: ['Mismo ejercicio, sosteniendo 2 segundos atrás.'],
        ilustracion: 'remo-polea',
      }),
    ],
  },
  {
    id: 'B3', nombre: 'Prensa de pierna', sesion: 'B', orden: 3,
    series: 3, repsMin: 12, repsMax: 12, descansoSeg: 90, modo: 'peso',
    ubicar: 'Máquina grande con asiento reclinado y una plataforma metálica inclinada arriba para los pies, con palancas de seguridad a los lados. Se cargan discos en los brazos laterales.',
    colocacion: 'Pies al ancho de hombros a media plataforma, espalda baja y glúteos pegados al asiento. Soltar los seguros con las piernas ya estiradas.',
    tecnica: [
      'Bajar controlado hasta unos 90° en las rodillas.',
      'Empujar sin trabar las rodillas arriba.',
    ],
    errores: ['Despegar la cadera del asiento (bajar de más).', 'Trabar rodillas.', 'Bajar poco.', 'No poner los seguros al terminar.'],
    ilustracion: 'prensa',
    alternativas: [
      alt({
        id: 'B3-goblet', nombre: 'Sentadilla goblet', caso: 'No se ubica u ocupada',
        series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90,
        tecnica: ['Ver A3.'],
        ilustracion: 'goblet',
      }),
      sentadillaDosMancuernas('B3-dos-mancuernas', 'Peso no alcanza en goblet'),
      sentadillaBanco('B3-banco', 15, 20),
    ],
  },
  {
    id: 'B4', nombre: 'Elevaciones laterales', sesion: 'B', orden: 4,
    series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, modo: 'peso',
    ubicar: 'Mancuernas ligeras (empezar con las que parezcan poca cosa).',
    tecnica: [
      'De pie, mancuernas a los costados, codos apenas doblados.',
      'Subir a los lados hasta la altura de los hombros.',
      'Bajar en 2 segundos.',
    ],
    errores: ['Impulso.', 'Pasar de los hombros.', 'Encoger hombros.'],
    ilustracion: 'laterales',
    alternativas: [
      alt({
        id: 'B4-sentado', nombre: 'Elevaciones laterales sentado', caso: 'Impulso incontrolable',
        series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60,
        tecnica: ['Sentado en la orilla del banco, mismo movimiento.'],
        ilustracion: 'laterales-sentado',
      }),
      alt({
        id: 'B4-polea', nombre: 'Elevación lateral en polea baja', caso: 'Sin mancuernas chicas',
        series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60, porLado: true,
        tecnica: ['A una mano, cruzando el cable frente al cuerpo.'],
        ilustracion: 'laterales-polea',
      }),
    ],
  },
  {
    id: 'B5', nombre: 'Curl martillo', sesion: 'B', orden: 5,
    series: 2, repsMin: 12, repsMax: 12, descansoSeg: 60, modo: 'peso',
    tecnica: [
      'Palmas mirándose todo el recorrido, codos pegados.',
      'Subir, apretar, bajar controlado.',
    ],
    errores: [],
    ilustracion: 'martillo',
    alternativas: [
      alt({
        id: 'B5-cuerda', nombre: 'Curl con cuerda en polea baja', caso: 'Ocupado',
        series: 2, repsMin: 12, repsMax: 12, descansoSeg: 60,
        tecnica: ['Palmas mirándose, codos pegados.'],
        ilustracion: 'curl-cuerda',
      }),
      alt({
        id: 'B5-alternado', nombre: 'Curl alternado con mancuernas', caso: 'Sin polea',
        series: 2, repsMin: 12, repsMax: 12, descansoSeg: 60, porLado: true,
        tecnica: ['Un brazo a la vez.'],
        ilustracion: 'curl-alternado',
      }),
    ],
  },
  {
    id: 'B6', nombre: 'Elevación de piernas acostado', sesion: 'B', orden: 6,
    series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal',
    ubicar: 'Banco plano, acostado boca arriba, manos agarrando el banco detrás de la cabeza.',
    tecnica: [
      'Espalda baja pegada.',
      'Subir las piernas casi estiradas hasta la vertical.',
      'Bajar controlado sin que la espalda baja se despegue.',
    ],
    errores: ['Arquear la espalda.', 'Bajar con impulso.'],
    ilustracion: 'piernas',
    alternativas: [
      alt({
        id: 'B6-piso', nombre: 'Elevación de piernas en el piso', caso: 'Sin banco',
        series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal',
        tecnica: ['Manos bajo los glúteos.'],
        ilustracion: 'piernas-piso',
      }),
      alt({
        id: 'B6-rodillas', nombre: 'Elevación de rodillas dobladas', caso: 'Si cuesta',
        series: 3, repsMin: 12, repsMax: 12, descansoSeg: 45, modo: 'corporal',
        tecnica: ['Mismo movimiento con rodillas dobladas.'],
        ilustracion: 'rodillas',
      }),
      deadBug('B6-deadbug', 'Sin banco ni piso limpio'),
    ],
  },
]

export function ejerciciosDe(sesion: Letra): Ejercicio[] {
  return EJERCICIOS.filter((e) => e.sesion === sesion).sort((a, b) => a.orden - b.orden)
}

export function buscarEjercicio(id: string): Ejercicio | undefined {
  return EJERCICIOS.find((e) => e.id === id)
}

/** Devuelve el ejercicio o la alternativa con ese id, y el ejercicio base */
export function buscarCualquiera(id: string): { item: Ejercicio | Alternativa; base: Ejercicio } | undefined {
  for (const e of EJERCICIOS) {
    if (e.id === id) return { item: e, base: e }
    const a = e.alternativas.find((x) => x.id === id)
    if (a) return { item: a, base: e }
  }
  return undefined
}

/** Ejercicios que suben a 4 series con la regla de 4 semanas */
export const CON_SERIE_EXTRA = ['A1', 'A2', 'B1', 'B2']
