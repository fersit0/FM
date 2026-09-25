// Fotos base por ejercicio (clave = campo `ilustracion`). Dos posiciones: a = inicio, b = final.
// Fuente: yuhonas/free-exercise-db (Unlicense). Revisadas una por una (tabla en NOTAS-DISENO.md).
type Par = { a: string; b?: string }
const par = (id: string): Par => ({ a: id, b: `${id}-2` })
export const FOTOS_BASE: Record<string, Par> = {
  'press-banca': par('Dumbbell_Bench_Press'),
  'press-piso': par('Dumbbell_Floor_Press'),
  'press-maquina': par('Leverage_Chest_Press'),
  'lagartijas-banco': par('Push-Ups_With_Feet_Elevated'),
  jalon: par('Wide-Grip_Lat_Pulldown'),
  'remo-mancuerna': par('One-Arm_Dumbbell_Row'),
  dominadas: par('Band_Assisted_Pull-Up'),
  goblet: par('Goblet_Squat'),
  prensa: par('Leg_Press'),
  'sentadilla-mancuernas': par('Dumbbell_Squat'),
  'sentadilla-banco': par('Bodyweight_Squat'),
  militar: par('Dumbbell_Shoulder_Press'),
  'militar-neutro': par('Dumbbell_Shoulder_Press'),
  'hombro-maquina': par('Machine_Shoulder_Military_Press'),
  'curl-z': par('EZ-Bar_Curl'),
  'curl-alternado': par('Dumbbell_Alternate_Bicep_Curl'),
  'curl-polea': par('Standing_Biceps_Cable_Curl'),
  'triceps-polea': par('Triceps_Pushdown'),
  'triceps-cabeza': par('Seated_Triceps_Press'),
  'fondos-banco': par('Bench_Dips'),
  plancha: { a: 'Plank-2' },
  'plancha-rodillas': { a: 'Plank-2' },
  'dead-bug': par('Dead_Bug'),
  'press-inclinado': par('Incline_Dumbbell_Press'),
  'remo-polea': par('Seated_Cable_Rows'),
  'remo-pecho': par('Leverage_Iso_Row'),
  laterales: par('Side_Lateral_Raise'),
  'laterales-sentado': par('Seated_Side_Lateral_Raise'),
  martillo: par('Hammer_Curls'),
  'curl-cuerda': par('Cable_Hammer_Curls_-_Rope_Attachment'),
  piernas: par('Flat_Bench_Lying_Leg_Raise'),
}
export function urlsFotoBase(clave: string): { a: string; b?: string } | null {
  const f = FOTOS_BASE[clave]
  if (!f) return null
  return { a: `${import.meta.env.BASE_URL}fotos/${f.a}.jpg`, b: f.b ? `${import.meta.env.BASE_URL}fotos/${f.b}.jpg` : undefined }
}
