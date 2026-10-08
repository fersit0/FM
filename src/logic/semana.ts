// Lógica de la semana (sección 4 del brief). Puro, sin React.
import type { Sesion, Letra, Settings } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, minutosAhora, minutosDe } from './fechas'

export const META = 3

/** Sesiones terminadas dentro de la semana (lunes a domingo) que contiene `fecha`. CASA no cuenta. */
export function sesionesDeSemana(sesiones: Sesion[], fecha: Date): Sesion[] {
  const ini = claveFecha(inicioSemana(fecha))
  const fin = claveFecha(sumarDias(inicioSemana(fecha), 6))
  return sesiones
    .filter((s) => s.terminada && s.tipo !== 'CASA' && s.fecha >= ini && s.fecha <= fin)
    .sort((a, b) => a.inicio - b.inicio)
}

export const CASA_MAX = 2
/** Sesiones CASA de la semana (máximo 2, no cuentan para la meta) */
export function casaDeSemana(sesiones: Sesion[], fecha: Date): number {
  const ini = claveFecha(inicioSemana(fecha))
  const fin = claveFecha(sumarDias(inicioSemana(fecha), 6))
  return sesiones.filter((s) => s.terminada && s.tipo === 'CASA' && s.fecha >= ini && s.fecha <= fin).length
}
export function casaDisponible(sesiones: Sesion[], fecha: Date): boolean {
  return casaDeSemana(sesiones, fecha) < CASA_MAX
}

// ---------- Pierna con Frida (RUTINA-FINAL.md, 2) ----------
/** Plan por semana: clave = lunes (YYYY-MM-DD); valor = fecha planeada o null si esa semana no hay. Sin entrada = lunes. */
export type PlanFrida = Record<string, string | null>

export function claveSemana(fecha: Date): string {
  return claveFecha(inicioSemana(fecha))
}
/** Día de Frida planeado para la semana de `fecha`: lunes salvo que se haya movido; null si "esta semana no hay" */
export function diaFridaPlaneado(plan: PlanFrida | undefined, fecha: Date): string | null {
  const semana = claveSemana(fecha)
  const v = plan?.[semana]
  return v === undefined ? semana : v
}
export interface EstadoFrida {
  /** fecha planeada esta semana, o null si no hay */
  planeada: string | null
  /** fecha en que ya se registró FRIDA esta semana */
  hecha: string | null
  /** el día planeado ya pasó sin respuesta: hay que preguntar */
  pendiente: string | null
  /** hoy es el día planeado y todavía no está registrada */
  hoyEsFrida: boolean
}
export function estadoFrida(sesiones: Sesion[], plan: PlanFrida | undefined, hoy: Date): EstadoFrida {
  const frida = sesionesDeSemana(sesiones, hoy).find((s) => s.tipo === 'FRIDA')
  const planeada = diaFridaPlaneado(plan, hoy)
  const hoyClave = claveFecha(hoy)
  if (frida) return { planeada, hecha: frida.fecha, pendiente: null, hoyEsFrida: false }
  if (planeada === null) return { planeada, hecha: null, pendiente: null, hoyEsFrida: false }
  if (planeada === hoyClave) return { planeada, hecha: null, pendiente: null, hoyEsFrida: true }
  if (planeada < hoyClave) return { planeada, hecha: null, pendiente: planeada, hoyEsFrida: false }
  return { planeada, hecha: null, pendiente: null, hoyEsFrida: false }
}
/** Ya hubo pierna en A o B esta semana */
export function piernaHechaEnSemana(sesiones: Sesion[], fecha: Date): boolean {
  return sesionesDeSemana(sesiones, fecha).some((s) => (s.tipo === 'A' || s.tipo === 'B') && !!s.pierna)
}
/**
 * La sesión A o B que se abre hoy trae pierna solo si la semana se quedó sin Frida ("Esta semana no hay" o "No hubo"),
 * todavía no hubo pierna esta semana y la versión no es corta. Con Frida hecha, planeada o pendiente de respuesta, no.
 */
export function tocaPierna(sesiones: Sesion[], plan: PlanFrida | undefined, hoy: Date, version: 'completa' | 'corta' | 'bonus'): boolean {
  if (version === 'corta') return false
  const e = estadoFrida(sesiones, plan, hoy)
  if (e.hecha || e.planeada !== null) return false
  return !piernaHechaEnSemana(sesiones, hoy)
}
/** Días de la semana de `fecha` a los que se puede mover Frida: de hoy en adelante, hasta el domingo */
export function diasParaMoverFrida(fecha: Date): string[] {
  const ini = inicioSemana(fecha)
  const hoy = claveFecha(fecha)
  return Array.from({ length: 7 }, (_, i) => claveFecha(sumarDias(ini, i))).filter((d) => d >= hoy)
}

/** La siguiente sesión propia es la que NO se hizo la última vez. Frida y CASA no afectan. */
export function siguienteSesion(sesiones: Sesion[]): Letra {
  const propias = sesiones
    .filter((s) => s.terminada && (s.tipo === 'A' || s.tipo === 'B'))
    .sort((a, b) => b.inicio - a.inicio)
  if (propias.length === 0) return 'A'
  return propias[0].tipo === 'A' ? 'B' : 'A'
}

export interface EstadoSemana {
  hechas: number
  meta: number
  /** true cuando ya hay 3 y la siguiente es bonus */
  bonus: boolean
  /** días de la semana (0..6 empezando en lunes) con sesión terminada */
  dias: { fecha: string; tipos: Sesion['tipo'][] }[]
  /** ya se marcó Frida esta semana */
  fridaHecha: boolean
}

export function estadoSemana(sesiones: Sesion[], fecha: Date): EstadoSemana {
  const semana = sesionesDeSemana(sesiones, fecha)
  const ini = inicioSemana(fecha)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const clave = claveFecha(sumarDias(ini, i))
    return { fecha: clave, tipos: semana.filter((s) => s.fecha === clave).map((s) => s.tipo) }
  })
  const hechas = semana.length
  return {
    hechas,
    meta: META,
    bonus: hechas >= META,
    dias,
    fridaHecha: semana.some((s) => s.tipo === 'FRIDA'),
  }
}

/**
 * Domingo de rescate: si el jueves en la noche va en 1 o 2, se avisa ese jueves
 * y el domingo en la mañana. Devuelve el texto o null.
 */
export function avisoRescate(sesiones: Sesion[], ahora: Date, settings: Settings): string | null {
  const { hechas } = estadoSemana(sesiones, ahora)
  if (hechas < 1 || hechas >= META) return null
  const dow = ahora.getDay()
  const min = minutosAhora(ahora)
  const esJuevesNoche = dow === 4 && min >= minutosDe(settings.horaCorta)
  const esDomingoManana = dow === 0 && min < 15 * 60
  if (!esJuevesNoche && !esDomingoManana) return null
  const faltan = META - hechas
  if (esDomingoManana) return `Vas en ${hechas}. Hoy antes de las 3 pm y queda.`
  return faltan === 1
    ? `Vas en ${hechas}. Domingo antes de las 3 pm.`
    : `Vas en ${hechas}. Faltan dos: una entre semana y domingo antes de las 3 pm.`
}

/** Cuenta las semanas ya cerradas (antes de la semana actual) con 3 o más sesiones */
export function semanasCumplidas(sesiones: Sesion[], ahora: Date): number {
  const iniActual = claveFecha(inicioSemana(ahora))
  const porSemana = new Map<string, number>()
  for (const s of sesiones) {
    if (!s.terminada) continue
    const ini = claveFecha(inicioSemana(new Date(s.inicio)))
    if (ini >= iniActual) continue
    porSemana.set(ini, (porSemana.get(ini) ?? 0) + 1)
  }
  let n = 0
  for (const c of porSemana.values()) if (c >= META) n++
  return n
}

/**
 * Regla de las 4 semanas: al acumular 4 semanas cumplidas, proponer 4 series en A1, A2, B1 y B2.
 * Si se pospuso, vuelve a proponer cuando haya una semana cumplida más.
 */
export function tocaProponerSeriesExtra(cumplidas: number, settings: Settings): boolean {
  if (settings.seriesExtra) return false
  if (cumplidas < 4) return false
  if (settings.reglaPospuestaEn !== undefined && cumplidas <= settings.reglaPospuestaEn) return false
  return true
}

/** Número de series para un ejercicio según versión, ligera y series extra */
export function seriesPara(
  ejercicioId: string,
  seriesBase: number,
  version: 'completa' | 'corta' | 'bonus',
  seriesExtra: boolean,
  ligera = false,
  extraIds: string[] = ['press-inclinado', 'jalon', 'press-plano', 'remo-polea'],
): number {
  if (version === 'corta' || ligera) return 2
  if (seriesExtra && extraIds.includes(ejercicioId)) return 4
  return seriesBase
}

/**
 * Orden de las series dentro de un bloque: en un par se alternan (0, 1, 0, 1...) y las de más del que tiene más series
 * se hacen solas al final. Devuelve la secuencia de índices de ejercicio.
 */
export function secuenciaDePar(series: number[]): number[] {
  const out: number[] = []
  const max = Math.max(0, ...series)
  for (let r = 0; r < max; r++) for (let i = 0; i < series.length; i++) if (r < series[i]) out.push(i)
  return out
}
