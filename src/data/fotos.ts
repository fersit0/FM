// Fotos base por ejercicio (clave = campo `ilustracion`). Dos posiciones: a = inicio, b = final.
// Fuente: yuhonas/free-exercise-db (Unlicense). Revisadas una por una (tabla en NOTAS-DISENO.md).
type Par = { a: string; b?: string; referencia?: boolean }
const par = (id: string): Par => ({ a: id, b: `${id}-2` })
export const FOTOS_BASE: Record<string, Par> = {
  'press-inclinado': par('Incline_Dumbbell_Press'), jalon: par('Wide-Grip_Lat_Pulldown'), 'press-militar': par('Dumbbell_Shoulder_Press'), laterales: par('Side_Lateral_Raise'),
  goblet: par('Goblet_Squat'), 'curl-z': par('EZ-Bar_Curl'), 'triceps-polea': par('Triceps_Pushdown'), plancha: { a: 'Plank-2' },
  'press-plano': par('Dumbbell_Bench_Press'), 'remo-polea': par('Seated_Cable_Rows'), 'remo-mancuerna': par('One-Arm_Dumbbell_Row'), 'remo-pecho-apoyado': par('Dumbbell_Incline_Row'),
  prensa: par('Leg_Press'), 'curl-martillo': par('Hammer_Curls'), 'elevacion-piernas': par('Flat_Bench_Lying_Leg_Raise'),
  'laterales-casa': par('Side_Lateral_Raise'), lagartijas: par('Pushups'), 'remo-liga': { ...par('Seated_Cable_Rows'), referencia: true }, 'plancha-casa': { a: 'Plank-2' },
  'press-inclinado-maquina': par('Leverage_Incline_Chest_Press'), 'lagartijas-pies-banco': par('Push-Ups_With_Feet_Elevated'), 'press-piso': par('Dumbbell_Floor_Press'),
  'dominadas-asistidas': par('Band_Assisted_Pull-Up'), 'press-militar-pie': par('Standing_Dumbbell_Press'), 'press-hombro-maquina': par('Machine_Shoulder_Military_Press'), 'press-militar-neutro': par('Dumbbell_Shoulder_Press'),
  'laterales-sentado': par('Seated_Side_Lateral_Raise'), 'laterales-polea': par('Cable_Seated_Lateral_Raise'), 'laterales-liga': par('Lateral_Raise_-_With_Bands'),
  'sentadilla-mancuernas': par('Dumbbell_Squat'), 'sentadilla-banco': par('Bodyweight_Squat'), 'curl-alternado': par('Dumbbell_Alternate_Bicep_Curl'), 'curl-polea': par('Standing_Biceps_Cable_Curl'),
  'triceps-cabeza': par('Seated_Triceps_Press'), 'fondos-banco': par('Bench_Dips'), 'plancha-rodillas': { a: 'Plank-2' }, 'dead-bug': par('Dead_Bug'),
  'press-pecho-maquina': par('Leverage_Chest_Press'), 'remo-pecho-maquina': par('Leverage_Iso_Row'), 'remo-polea-una-mano': par('Seated_One-arm_Cable_Pulley_Rows'), 'remo-alto-maquina': par('Leverage_High_Row'),
  'prensa-corta': par('Leg_Press'), 'curl-cuerda': par('Cable_Hammer_Curls_-_Rope_Attachment'), 'elevacion-piernas-piso': par('Flat_Bench_Lying_Leg_Raise'), 'elevacion-rodillas': par('Flat_Bench_Lying_Leg_Raise'),
  'lagartijas-inclinadas': par('Incline_Push-Up'), 'remo-mancuerna-casa': par('One-Arm_Dumbbell_Row'),
  eliptica: par('Elliptical_Trainer'), bici: par('Bicycling_Stationary'),
}
/** Encuadre por foto para que no se corten cabeza, manos ni máquina (object-position) */
export const ENCUADRE: Record<string, string> = {
  'press-inclinado': '50% 30%', jalon: '50% 20%', 'press-militar': '50% 25%', 'press-militar-pie': '50% 20%', prensa: '40% 50%', 'remo-pecho-apoyado': '50% 55%',
  'dominadas-asistidas': '50% 15%', 'triceps-polea': '55% 40%', 'curl-polea': '50% 40%', 'curl-cuerda': '55% 40%', 'remo-alto-maquina': '50% 35%', 'press-hombro-maquina': '50% 20%',
}
export function urlsFotoBase(clave: string): { a: string; b?: string; referencia?: boolean } | null {
  const f = FOTOS_BASE[clave]
  if (!f) return null
  return { a: `${import.meta.env.BASE_URL}fotos/${f.a}.jpg`, b: f.b ? `${import.meta.env.BASE_URL}fotos/${f.b}.jpg` : undefined, referencia: f.referencia }
}
