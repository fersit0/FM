// Migración única de ids viejos (A1, B4-polea...) a ids por movimiento (RUTINA-FINAL.md, sección 9).
import type { Sesion, SetLog, Settings, FotoEjercicio } from '../data/tipos'

export const MAPA: Record<string, string> = {
  A1: 'press-plano', A2: 'jalon', A3: 'goblet', A4: 'press-militar', A5: 'curl-z', A6: 'triceps-polea', A7: 'plancha',
  B1: 'press-inclinado', B2: 'remo-polea', B3: 'prensa', B4: 'laterales', B5: 'curl-martillo', B6: 'elevacion-piernas',
  'A1-piso': 'press-piso', 'A1-maquina': 'press-pecho-maquina', 'A1-lagartijas': 'lagartijas-pies-banco', 'B1-lagartijas': 'lagartijas-pies-banco',
  'A2-remo': 'remo-mancuerna', 'B2-remo': 'remo-mancuerna', 'A2-dominadas': 'dominadas-asistidas', 'A2-dominadas-menos': 'dominadas-asistidas',
  'A3-prensa': 'prensa', 'A3-dos-mancuernas': 'sentadilla-mancuernas', 'B3-dos-mancuernas': 'sentadilla-mancuernas', 'A3-banco': 'sentadilla-banco', 'B3-banco': 'sentadilla-banco', 'A3-prensa-corta': 'prensa-corta',
  'A4-pie': 'press-militar-pie', 'A4-maquina': 'press-hombro-maquina', 'A4-neutro': 'press-militar-neutro',
  'A5-alternado': 'curl-alternado', 'B5-alternado': 'curl-alternado', 'A5-polea': 'curl-polea', 'A6-cabeza': 'triceps-cabeza', 'A6-fondos': 'fondos-banco',
  'A7-rodillas': 'plancha-rodillas', 'A7-deadbug': 'dead-bug', 'B6-deadbug': 'dead-bug',
  'B1-plano': 'press-plano', 'B1-maquina': 'press-inclinado-maquina', 'B2-pecho': 'remo-pecho-maquina', 'B2-pausa': 'remo-polea', 'B3-goblet': 'goblet',
  'B4-sentado': 'laterales-sentado', 'B4-polea': 'laterales-polea', 'B5-cuerda': 'curl-cuerda', 'B6-piso': 'elevacion-piernas-piso', 'B6-rodillas': 'elevacion-rodillas',
}
const VIEJO = /^[AB]\d(-|$)/

/** Devuelve el id nuevo; si es viejo y no está en la tabla, lo deja igual y lo reporta */
export function migrarId(id: string, desconocidos?: Set<string>): string {
  if (MAPA[id]) return MAPA[id]
  if (VIEJO.test(id)) desconocidos?.add(id)
  return id
}
export function esViejo(id: string): boolean {
  return VIEJO.test(id)
}
export function migrarSet(s: SetLog, d?: Set<string>): SetLog {
  return { ...s, exerciseId: migrarId(s.exerciseId, d), ejercicioBaseId: migrarId(s.ejercicioBaseId, d) }
}
export function migrarSesion(s: Sesion, d?: Set<string>): Sesion {
  return s.cambios ? { ...s, cambios: s.cambios.map((c) => ({ ejercicioId: migrarId(c.ejercicioId, d), alternativaId: migrarId(c.alternativaId, d) })) } : s
}
export function migrarFoto(f: FotoEjercicio, d?: Set<string>): FotoEjercicio {
  return { ...f, ejercicioId: migrarId(f.ejercicioId, d) }
}
export function migrarSettings(s: Settings, d?: Set<string>): Settings {
  const mapaRec = (r?: Record<string, string>) => {
    if (!r) return r
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(r)) out[migrarId(k, d)] = migrarId(v, d)
    return out
  }
  const unidades = s.unidades ? Object.fromEntries(Object.entries(s.unidades).map(([k, v]) => [migrarId(k, d), v])) : undefined
  return { ...s, reemplazos: mapaRec(s.reemplazos), unidades: unidades as Settings['unidades'], migracionRutinaFinal: true }
}
export function hayIdsViejos(sets: SetLog[], sesiones: Sesion[], fotos: FotoEjercicio[]): boolean {
  return sets.some((s) => esViejo(s.exerciseId)) || sesiones.some((s) => s.cambios?.some((c) => esViejo(c.ejercicioId))) || fotos.some((f) => esViejo(f.ejercicioId))
}
