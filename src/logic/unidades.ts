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

/** Máquinas y poleas en libras; mancuernas, barras y peso corporal en kilos */
export function unidadPorDefecto(item: Ejercicio | Alternativa): Unidad {
  const t = `${item.nombre} ${item.ubicar ?? ''}`.toLowerCase()
  return /polea|máquina|maquina|prensa|jalón|jalon|dominadas|remo sentado|remo con pecho/.test(t) ? 'lb' : 'kg'
}
export function unidadDe(item: Ejercicio | Alternativa, unidades?: Record<string, Unidad>): Unidad {
  return unidades?.[item.id] ?? unidadPorDefecto(item)
}
export function incrementoDe(item: Ejercicio | Alternativa, unidad: Unidad): number {
  if (unidad === 'lb') return 5
  return item.id === 'B4' || item.id === 'B4-sentado' ? 1 : 2.5
}

/** Peso de un set en la unidad pedida, exacto si se registró en esa unidad */
export function pesoDeSet(s: SetLog, unidad: Unidad): number | null {
  if (s.pesoKg === null || s.pesoKg === undefined) return null
  if (s.unidad === unidad && typeof s.peso === 'number') return s.peso
  return desdeKg(s.pesoKg, unidad)
}

/** Peso inicial razonable por ejercicio (kg), para la primera vez */
const INICIAL_KG: Record<string, number> = {
  A1: 12, 'A1-piso': 12, 'A1-maquina': 20, A2: 30, 'A2-remo': 12, 'A2-dominadas': 30, 'A2-dominadas-menos': 20,
  A3: 14, 'A3-prensa': 60, 'A3-dos-mancuernas': 10, 'A3-prensa-corta': 60, A4: 8, 'A4-pie': 8, 'A4-maquina': 20, 'A4-neutro': 8,
  A5: 12, 'A5-alternado': 8, 'A5-polea': 15, A6: 15, 'A6-cabeza': 10,
  B1: 10, 'B1-plano': 12, 'B1-maquina': 20, B2: 30, 'B2-remo': 12, 'B2-pecho': 25, 'B2-pausa': 25, B3: 60, 'B3-goblet': 14, 'B3-dos-mancuernas': 10,
  B4: 4, 'B4-sentado': 4, 'B4-polea': 5, B5: 8, 'B5-cuerda': 15, 'B5-alternado': 8,
}
export function pesoInicial(item: Ejercicio | Alternativa, unidad: Unidad): number {
  const kg = INICIAL_KG[item.id] ?? (unidadPorDefecto(item) === 'lb' ? 20 : 8)
  const v = desdeKg(kg, unidad)
  const inc = incrementoDe(item, unidad)
  return Math.max(inc, Math.round(v / inc) * inc)
}
export function formatoPeso(valor: number, unidad: Unidad): string {
  return `${Math.round(valor * 100) / 100} ${unidad}`
}
