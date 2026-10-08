// Lógica de la semana (RUTINA-FINAL.md, 2). Puro, sin React.
// Una sesión cuenta si está terminada o si tiene al menos una serie registrada (se cierra sola después).
import type { Sesion, SetLog, Letra } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, minutosAhora } from './fechas'

export const META = 3

/** Una sesión cuenta como hecha si se cerró o si ya tiene una serie registrada */
export function cuenta(s: Sesion, sets: SetLog[] = []): boolean {
  return s.terminada || sets.some((x) => x.sessionId === s.id)
}
/** Sesiones que cuentan, en orden cronológico (fecha y luego inicio) */
export function hechas(sesiones: Sesion[], sets: SetLog[] = []): Sesion[] {
  return sesiones.filter((s) => cuenta(s, sets)).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.inicio - b.inicio)
}
function rango(fecha: Date): [string, string] {
  const ini = inicioSemana(fecha)
  return [claveFecha(ini), claveFecha(sumarDias(ini, 6))]
}
/** Sesiones de la semana (lunes a domingo) que contiene `fecha`. CASA no cuenta. */
export function sesionesDeSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): Sesion[] {
  const [ini, fin] = rango(fecha)
  return hechas(sesiones, sets).filter((s) => s.tipo !== 'CASA' && s.fecha >= ini && s.fecha <= fin)
}

export const CASA_MAX = 2
/** Sesiones CASA de la semana (máximo 2, no cuentan para la meta) */
export function casaDeSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): number {
  const [ini, fin] = rango(fecha)
  return hechas(sesiones, sets).filter((s) => s.tipo === 'CASA' && s.fecha >= ini && s.fecha <= fin).length
}
export function casaDisponible(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): boolean {
  return casaDeSemana(sesiones, fecha, sets) < CASA_MAX
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
  /** el día planeado ya pasó sin respuesta (se pregunta junto con los días sin registro) */
  pendiente: string | null
  /** hoy es el día planeado y todavía no está registrada */
  hoyEsFrida: boolean
}
export function estadoFrida(sesiones: Sesion[], plan: PlanFrida | undefined, hoy: Date, sets: SetLog[] = []): EstadoFrida {
  const frida = sesionesDeSemana(sesiones, hoy, sets).find((s) => s.tipo === 'FRIDA')
  const planeada = diaFridaPlaneado(plan, hoy)
  const hoyClave = claveFecha(hoy)
  if (frida) return { planeada, hecha: frida.fecha, pendiente: null, hoyEsFrida: false }
  if (planeada === null) return { planeada, hecha: null, pendiente: null, hoyEsFrida: false }
  if (planeada === hoyClave) return { planeada, hecha: null, pendiente: null, hoyEsFrida: true }
  if (planeada < hoyClave) return { planeada, hecha: null, pendiente: planeada, hoyEsFrida: false }
  return { planeada, hecha: null, pendiente: null, hoyEsFrida: false }
}
/** Ya hubo pierna en A o B esta semana */
export function piernaHechaEnSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): boolean {
  return sesionesDeSemana(sesiones, fecha, sets).some((s) => (s.tipo === 'A' || s.tipo === 'B') && !!s.pierna)
}
/**
 * La sesión A o B que se abre hoy trae pierna solo si la semana se quedó sin Frida ("Esta semana no hay" o "No fui"),
 * todavía no hubo pierna esta semana y la versión no es corta. Con Frida hecha, planeada o pendiente de respuesta, no.
 */
export function tocaPierna(sesiones: Sesion[], plan: PlanFrida | undefined, hoy: Date, version: 'completa' | 'corta' | 'bonus', sets: SetLog[] = []): boolean {
  if (version === 'corta') return false
  const e = estadoFrida(sesiones, plan, hoy, sets)
  if (e.hecha || e.planeada !== null) return false
  return !piernaHechaEnSemana(sesiones, hoy, sets)
}
/** Días de la semana de `fecha` a los que se puede mover Frida: de hoy en adelante, hasta el domingo */
export function diasParaMoverFrida(fecha: Date): string[] {
  const ini = inicioSemana(fecha)
  const hoy = claveFecha(fecha)
  return Array.from({ length: 7 }, (_, i) => claveFecha(sumarDias(ini, i))).filter((d) => d >= hoy)
}

/** La A o B más reciente por fecha (la que cuenta), o null */
export function ultimaPropia(sesiones: Sesion[], sets: SetLog[] = [], antesDe?: string): Sesion | null {
  const propias = hechas(sesiones, sets).filter((s) => (s.tipo === 'A' || s.tipo === 'B') && (!antesDe || s.fecha < antesDe))
  return propias.length ? propias[propias.length - 1] : null
}
/** La que sigue se calcula siempre del historial: la contraria de la A o B más reciente; sin ninguna, A. Frida y CASA no la cambian. */
export function siguienteSesion(sesiones: Sesion[], sets: SetLog[] = [], antesDe?: string): Letra {
  const u = ultimaPropia(sesiones, sets, antesDe)
  if (!u) return 'A'
  return u.tipo === 'A' ? 'B' : 'A'
}

export interface EstadoSemana {
  hechas: number
  meta: number
  /** true cuando ya hay 3 y la siguiente es bonus */
  bonus: boolean
  /** días de la semana (0..6 empezando en lunes) con sesión hecha */
  dias: { fecha: string; tipos: Sesion['tipo'][] }[]
  /** ya se marcó Frida esta semana */
  fridaHecha: boolean
}

export function estadoSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): EstadoSemana {
  const semana = sesionesDeSemana(sesiones, fecha, sets)
  const ini = inicioSemana(fecha)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const clave = claveFecha(sumarDias(ini, i))
    return { fecha: clave, tipos: semana.filter((s) => s.fecha === clave).map((s) => s.tipo) }
  })
  const n = semana.length
  return { hechas: n, meta: META, bonus: n >= META, dias, fridaHecha: semana.some((s) => s.tipo === 'FRIDA') }
}

/** Jueves en la noche (desde las 8) y domingo en la mañana: aviso del domingo de rescate si va en 1 o 2 */
export const NOCHE_MIN = 20 * 60
export function avisoRescate(sesiones: Sesion[], ahora: Date, sets: SetLog[] = []): string | null {
  const { hechas: n } = estadoSemana(sesiones, ahora, sets)
  if (n < 1 || n >= META) return null
  const dow = ahora.getDay()
  const min = minutosAhora(ahora)
  const esJuevesNoche = dow === 4 && min >= NOCHE_MIN
  const esDomingoManana = dow === 0 && min < 15 * 60
  if (!esJuevesNoche && !esDomingoManana) return null
  const faltan = META - n
  if (esDomingoManana) return `Vas en ${n}. Hoy antes de las 3 pm y queda.`
  return faltan === 1 ? `Vas en ${n}. Domingo antes de las 3 pm.` : `Vas en ${n}. Faltan dos: una entre semana y domingo antes de las 3 pm.`
}

/** Número de series de un ejercicio: las de la rutina, salvo la semana ligera (2 con el mismo peso) */
export function seriesPara(seriesBase: number, ligera = false): number {
  return ligera ? Math.min(2, seriesBase) : seriesBase
}
