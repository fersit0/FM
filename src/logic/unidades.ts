// Kilos y libras. Cada serie guarda el valor exacto en la unidad en que se registró; pesoKg es solo para comparar.
// En el club casi todo está en lb (mancuernas incluidas): el gym va en lb por defecto y CASA en kg.
import type { Ejercicio, Alternativa, SetLog } from '../data/tipos'
import { ejerciciosDe } from '../data/ejercicios'

export type Unidad = 'kg' | 'lb'
const LB = 0.45359237

/** Paso real de cada unidad: 5 lb; en kg (CASA) de 1 en 1 */
export function pasoPorDefecto(unidad: Unidad): number {
  return unidad === 'lb' ? 5 : 1
}
export function redondearAPaso(valor: number, paso: number): number {
  return Math.round(Math.round(valor / paso) * paso * 100) / 100
}
export function aKg(valor: number, unidad: Unidad): number {
  return unidad === 'kg' ? valor : Math.round(valor * LB * 100) / 100
}
/** De kilos a la unidad pedida, redondeado al paso real (5 lb, 2.5 kg o el del ejercicio) */
export function desdeKg(kg: number, unidad: Unidad, paso = pasoPorDefecto(unidad)): number {
  const v = unidad === 'kg' ? kg : kg / LB
  return redondearAPaso(v, paso)
}
export function convertir(valor: number, de: Unidad, a: Unidad, paso = pasoPorDefecto(a)): number {
  return de === a ? valor : desdeKg(aKg(valor, de), a, paso)
}

/** Los ejercicios de CASA (y sus alternativas) van en kg; todo lo del gym en lb */
const EN_KG = new Set(ejerciciosDe('CASA').flatMap((e) => [e.id, ...e.alternativas.map((a) => a.id)]))
export function unidadPorDefecto(item: Ejercicio | Alternativa): Unidad {
  return EN_KG.has(item.id) ? 'kg' : 'lb'
}
export function unidadDe(item: Ejercicio | Alternativa, unidades?: Record<string, Unidad>): Unidad {
  return unidades?.[item.id] ?? unidadPorDefecto(item)
}
/** Paso del ejercicio: lb de 5 en 5, kg de 1 en 1 (RUTINA-FINAL.md, 10) */
export function incrementoDe(_item: Ejercicio | Alternativa, unidad: Unidad): number {
  return unidad === 'lb' ? 5 : 1
}

/** Peso de un set en la unidad pedida: exacto si se registró en esa unidad, si no convertido y redondeado al paso */
export function pesoDeSet(s: SetLog, unidad: Unidad, paso = pasoPorDefecto(unidad)): number | null {
  if (s.pesoKg === null || s.pesoKg === undefined) return null
  if (s.unidad === unidad && typeof s.peso === 'number') return s.peso
  if (s.unidad === undefined && unidad === 'kg') return s.pesoKg
  return desdeKg(s.pesoKg, unidad, paso)
}

/** Pesos iniciales sin historial (RUTINA-FINAL.md, 10). Gym en lb, mancuernas por mano; CASA en kg. */
const INICIAL_LB: Record<string, number> = {
  jalon: 90, 'remo-polea': 90, 'press-inclinado': 30, 'press-militar': 25, 'triceps-cabeza': 20, laterales: 10, 'curl-alternado': 20,
  'press-plano': 35, 'aperturas-mancuernas': 15, 'remo-pecho-apoyado': 15, 'jalon-cerrado': 80, 'triceps-polea': 40, 'curl-martillo': 20,
  goblet: 45, 'sentadilla-mancuernas': 25, 'triceps-patada': 10, 'remo-mancuerna': 45, 'press-piso': 30, 'press-militar-pie': 20, 'laterales-sentado': 10,
}
const INICIAL_KG: Record<string, number> = { 'laterales-casa': 4, 'remo-mancuerna-casa': 12 }
/** Peso inicial sin historial, en la rejilla del ejercicio (RUTINA-FINAL.md, 10) */
export function pesoInicial(item: Ejercicio | Alternativa, unidad: Unidad): number {
  const inc = incrementoDe(item, unidad)
  let v: number
  if (INICIAL_LB[item.id] !== undefined) v = convertir(INICIAL_LB[item.id], 'lb', unidad, inc)
  else if (INICIAL_KG[item.id] !== undefined) v = convertir(INICIAL_KG[item.id], 'kg', unidad, inc)
  else v = convertir(unidadPorDefecto(item) === 'lb' ? 20 : 8, unidadPorDefecto(item), unidad, inc)
  return Math.max(inc, redondearAPaso(v, inc))
}
export function formatoPeso(valor: number, unidad: Unidad): string {
  return `${Math.round(valor * 100) / 100} ${unidad}`
}
