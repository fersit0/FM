// Fotos base por ejercicio (clave = campo `ilustracion`). Dos posiciones: a = inicio, b = final.
// Fuente: yuhonas/free-exercise-db (Unlicense). Revisadas una por una (tabla en NOTAS-DISENO.md).
type Par = { a: string; b?: string; referencia?: boolean }
const par = (id: string): Par => ({ a: id, b: `${id}-2` })
export const FOTOS_BASE: Record<string, Par> = {
  // A
  jalon: par('Wide-Grip_Lat_Pulldown'), 'remo-polea': par('Seated_Cable_Rows'), 'press-inclinado': par('Incline_Dumbbell_Press'), 'press-militar': par('Dumbbell_Shoulder_Press'),
  'triceps-cabeza': par('Seated_Triceps_Press'), laterales: par('Side_Lateral_Raise'), 'curl-alternado': par('Dumbbell_Alternate_Bicep_Curl'), crunch: par('Crunches'),
  // B
  'press-plano': par('Dumbbell_Bench_Press'), 'aperturas-mancuernas': par('Dumbbell_Flyes'), 'remo-pecho-apoyado': par('Dumbbell_Incline_Row'), 'jalon-cerrado': par('Close-Grip_Front_Lat_Pulldown'),
  'triceps-polea': par('Triceps_Pushdown_-_Rope_Attachment'), 'curl-martillo': par('Hammer_Curls'), 'elevacion-piernas': par('Flat_Bench_Lying_Leg_Raise'),
  // pierna sin Frida
  goblet: par('Goblet_Squat'), 'sentadilla-mancuernas': par('Dumbbell_Squat'),
  // alternativas
  'remo-mancuerna': par('One-Arm_Dumbbell_Row'), 'press-piso': par('Dumbbell_Floor_Press'), 'press-militar-pie': par('Standing_Dumbbell_Press'), 'laterales-sentado': par('Seated_Side_Lateral_Raise'),
  // Tricep_Dumbbell_Kickback viene al revés en la fuente: la foto 0 tiene el brazo estirado; Inicio es la de codo doblado (-2)
  'triceps-patada': { a: 'Tricep_Dumbbell_Kickback-2', b: 'Tricep_Dumbbell_Kickback' },
  // CASA
  'laterales-casa': par('Side_Lateral_Raise'), lagartijas: par('Pushups'), 'remo-liga': { ...par('Seated_Cable_Rows'), referencia: true },
  'laterales-liga': par('Lateral_Raise_-_With_Bands'), 'lagartijas-inclinadas': par('Incline_Push-Up'), 'lagartijas-pies-banco': par('Push-Ups_With_Feet_Elevated'), 'remo-mancuerna-casa': par('One-Arm_Dumbbell_Row'), 'elevacion-piernas-piso': par('Flat_Bench_Lying_Leg_Raise'),
  // calentamiento
  eliptica: par('Elliptical_Trainer'), bici: par('Bicycling_Stationary'),
}
/** Encuadre por foto para que no se corten cabeza, manos ni máquina (object-position) */
export const ENCUADRE: Record<string, string> = {
  'press-inclinado': '50% 30%', jalon: '50% 20%', 'press-militar': '50% 25%', 'press-militar-pie': '50% 20%', 'remo-pecho-apoyado': '50% 55%',
  'jalon-cerrado': '50% 25%', 'triceps-polea': '50% 40%', 'triceps-patada': '45% 40%', crunch: '50% 50%',
}
export function urlsFotoBase(clave: string): { a: string; b?: string; referencia?: boolean } | null {
  const f = FOTOS_BASE[clave]
  if (!f) return null
  return { a: `${import.meta.env.BASE_URL}fotos/${f.a}.jpg`, b: f.b ? `${import.meta.env.BASE_URL}fotos/${f.b}.jpg` : undefined, referencia: f.referencia }
}
