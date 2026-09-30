// Kilos y libras. Se guarda el valor exacto en la unidad registrada; pesoKg es solo para comparar.
import type { Ejercicio, Alternativa, SetLog } from '../data/tipos'

export type Unidad = 'kg' | 'lb'
const LB = 0.45359237

export function aKg(valor: number, unidad: Unidad): number {
  return unidad === 'kg' ? valor : Math.round(valor * LB * 100) / 100
}
export function desdeKg(kg: number, unidad: Unidad): number {
  const v = unidad === 'kg' ? kg : kg / LB
  return Math.round(v * 2) / 2
}
export function convertir(valor: number, de: Unidad, a: Unidad): number {
  return de === a ? valor : desdeKg(aKg(valor, de), a)
}

const EN_LB = new Set(['jalon', 'remo-polea', 'triceps-polea', 'prensa', 'prensa-corta', 'press-inclinado-maquina', 'press-pecho-maquina', 'press-hombro-maquina', 'remo-pecho-maquina', 'remo-alto-maquina', 'laterales-polea', 'curl-polea', 'curl-cuerda', 'remo-polea-una-mano', 'dominadas-asistidas'])
/** Máquinas y poleas en libras (RUTINA-FINAL.md, sección 10); lo demás en kilos */
export function unidadPorDefecto(item: Ejercicio | Alternativa): Unidad {
  return EN_LB.has(item.id) ? 'lb' : 'kg'
}
export function unidadDe(item: Ejercicio | Alternativa, unidades?: Record<string, Unidad>): Unidad {
  return unidades?.[item.id] ?? unidadPorDefecto(item)
}
export function incrementoDe(item: Ejercicio | Alternativa, unidad: Unidad): number {
  if (unidad === 'lb') return 5
  return ['laterales', 'laterales-sentado', 'laterales-casa'].includes(item.id) ? 1 : 2.5
}

/** Peso de un set en la unidad pedida, exacto si se registró en esa unidad */
export function pesoDeSet(s: SetLog, unidad: Unidad): number | null {
  if (s.pesoKg === null || s.pesoKg === undefined) return null
  if (s.unidad === unidad && typeof s.peso === 'number') return s.peso
  return desdeKg(s.pesoKg, unidad)
}

/** Peso inicial razonable por ejercicio (kg), para la primera vez */
const INICIAL_KG: Record<string, number> = {
  'press-inclinado': 14, 'press-militar': 12, laterales: 6, goblet: 20, 'curl-z': 20, 'press-plano': 16, 'remo-mancuerna': 20, 'remo-pecho-apoyado': 8, 'curl-martillo': 10, 'laterales-casa': 4,
  'press-inclinado-maquina': 20, 'press-piso': 14, 'press-militar-pie': 10, 'press-hombro-maquina': 20, 'press-militar-neutro': 12, 'laterales-sentado': 6, 'laterales-polea': 5,
  'sentadilla-mancuernas': 12, 'curl-alternado': 8, 'curl-polea': 15, 'triceps-cabeza': 10, 'press-pecho-maquina': 20, 'remo-pecho-maquina': 25, 'remo-polea-una-mano': 15, 'remo-alto-maquina': 25, 'curl-cuerda': 15, 'remo-mancuerna-casa': 12,
}
const INICIAL_LB: Record<string, number> = { jalon: 90, 'triceps-polea': 50, 'remo-polea': 90 }
/** Peso inicial sin historial. Prensa no lleva sugerencia: la ficha explica el tanteo. */
export function pesoInicial(item: Ejercicio | Alternativa, unidad: Unidad): number {
  if (item.id === 'prensa' || item.id === 'prensa-corta') return 0
  const v = INICIAL_LB[item.id] !== undefined ? convertir(INICIAL_LB[item.id], 'lb', unidad) : desdeKg(INICIAL_KG[item.id] ?? (unidadPorDefecto(item) === 'lb' ? 20 : 8), unidad)
  const inc = incrementoDe(item, unidad)
  return Math.max(inc, Math.round(v / inc) * inc)
}
export function formatoPeso(valor: number, unidad: Unidad): string {
  return `${Math.round(valor * 100) / 100} ${unidad}`
}
