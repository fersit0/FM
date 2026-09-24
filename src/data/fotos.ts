// Fotos base por ejercicio (clave = campo `ilustracion` del ejercicio o alternativa).
// Fuente: yuhonas/free-exercise-db (Unlicense, dominio público), reducidas a 900 px en public/fotos/.
// Revisadas una por una (tabla en NOTAS-DISENO.md): sin foto es mejor que una incorrecta.
export const FOTOS_BASE: Record<string, string> = {
  'press-banca': 'Dumbbell_Bench_Press',
  'press-piso': 'Dumbbell_Floor_Press',
  'press-maquina': 'Leverage_Chest_Press',
  'lagartijas-banco': 'Push-Ups_With_Feet_Elevated',
  jalon: 'Wide-Grip_Lat_Pulldown',
  'remo-mancuerna': 'One-Arm_Dumbbell_Row',
  dominadas: 'Band_Assisted_Pull-Up',
  goblet: 'Goblet_Squat',
  prensa: 'Leg_Press',
  'sentadilla-mancuernas': 'Dumbbell_Squat',
  'sentadilla-banco': 'Bodyweight_Squat',
  militar: 'Dumbbell_Shoulder_Press',
  'militar-neutro': 'Dumbbell_Shoulder_Press',
  'hombro-maquina': 'Machine_Shoulder_Military_Press',
  'curl-z': 'EZ-Bar_Curl',
  'curl-alternado': 'Dumbbell_Alternate_Bicep_Curl',
  'curl-polea': 'Standing_Biceps_Cable_Curl',
  'triceps-polea': 'Triceps_Pushdown',
  'triceps-cabeza': 'Seated_Triceps_Press',
  'fondos-banco': 'Bench_Dips',
  'dead-bug': 'Dead_Bug',
  'press-inclinado': 'Incline_Dumbbell_Press',
  'remo-polea': 'Seated_Cable_Rows',
  'remo-pecho': 'Leverage_Iso_Row',
  laterales: 'Side_Lateral_Raise',
  'laterales-sentado': 'Seated_Side_Lateral_Raise',
  martillo: 'Hammer_Curls',
  'curl-cuerda': 'Cable_Hammer_Curls_-_Rope_Attachment',
  piernas: 'Flat_Bench_Lying_Leg_Raise',
}

export function urlFotoBase(clave: string): string | null {
  const f = FOTOS_BASE[clave]
  return f ? `${import.meta.env.BASE_URL}fotos/${f}.jpg` : null
}
