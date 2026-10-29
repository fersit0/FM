// Lógica de la semana (RUTINA-FINAL.md, 2). Puro, sin React.
// Cada semana (lunes a domingo) tiene tres sesiones base: FRIDA (o C si esa semana no hay Frida), A y B. La app elige
// cuál toca según lo que ya se hizo. Una sesión cuenta si está terminada o si tiene al menos una serie registrada.
import type { Sesion, SetLog, Club, FridaTipo } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, minutosAhora } from './fechas'

export const META = 3
const ES_CLUB = (t: Sesion['tipo']): t is Club => t === 'A' || t === 'B' || t === 'C'

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

// ---------- Frida (RUTINA-FINAL.md, 2) ----------
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
  /** fecha en que ya se registró FRIDA esta semana (si fue otro día, ese pasa a ser el día de Frida) */
  hecha: string | null
  /** el día planeado ya pasó sin respuesta: Hoy pregunta "¿Fuiste con Frida el…?" */
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
/** Qué hicieron con Frida; las FRIDA viejas sin tipo cuentan como torso (RUTINA-FINAL.md v7, 2.3) */
export function fridaTipoDe(s: Pick<Sesion, 'fridaTipo'>): FridaTipo {
  return s.fridaTipo ?? 'torso'
}
/** La FRIDA hecha en la semana de `fecha`, si hay */
export function fridaDeSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): Sesion | null {
  return sesionesDeSemana(sesiones, fecha, sets).find((s) => s.tipo === 'FRIDA') ?? null
}
/** En la semana de `fecha` ya hay una FRIDA pierna registrada (antes de `antesDe`, si se da): la A sale sin pierna */
export function fridaPiernaEnSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = [], antesDe?: string): boolean {
  return sesionesDeSemana(sesiones, fecha, sets).some((s) => s.tipo === 'FRIDA' && fridaTipoDe(s) === 'pierna' && (!antesDe || s.fecha < antesDe))
}
/** Trabaja espalda: C o FRIDA torso (o sin tipo). FRIDA pierna no (RUTINA-FINAL.md v7, 2) */
const esEspalda = (s: Sesion) => s.tipo === 'C' || (s.tipo === 'FRIDA' && fridaTipoDe(s) === 'torso')

/** La semana queda sin Frida con "Esta semana no hay" o "No hubo" (plan en null) y sin FRIDA registrada */
export function semanaSinFrida(sesiones: Sesion[], plan: PlanFrida | undefined, fecha: Date, sets: SetLog[] = []): boolean {
  const e = estadoFrida(sesiones, plan, fecha, sets)
  return e.hecha === null && e.planeada === null
}
/** Sesiones base de la semana: FRIDA (o C si no hay Frida), A y B */
export function sesionesBase(sesiones: Sesion[], plan: PlanFrida | undefined, fecha: Date, sets: SetLog[] = []): ('FRIDA' | Club)[] {
  return [semanaSinFrida(sesiones, plan, fecha, sets) ? 'C' : 'FRIDA', 'A', 'B']
}
/** Días de la semana de `fecha` a los que se puede mover Frida: de hoy en adelante, hasta el domingo */
export function diasParaMoverFrida(fecha: Date): string[] {
  const ini = inicioSemana(fecha)
  const hoy = claveFecha(fecha)
  return Array.from({ length: 7 }, (_, i) => claveFecha(sumarDias(ini, i))).filter((d) => d >= hoy)
}

// ---------- Elección de la sesión de club (RUTINA-FINAL.md, 2) ----------
/** La sesión de club (A, B o C) más reciente por fecha, o null */
export function ultimaPropia(sesiones: Sesion[], sets: SetLog[] = [], antesDe?: string): Sesion | null {
  const propias = hechas(sesiones, sets).filter((s) => ES_CLUB(s.tipo) && (!antesDe || s.fecha < antesDe))
  return propias.length ? propias[propias.length - 1] : null
}
/** Las sesiones base de la semana que todavía no se hacen, en orden C → A → B */
export function faltantes(sesiones: Sesion[], plan: PlanFrida | undefined, hoy: Date, sets: SetLog[] = []): Club[] {
  const semana = sesionesDeSemana(sesiones, hoy, sets)
  const hecha = (t: Club) => semana.some((s) => s.tipo === t)
  const base: Club[] = semanaSinFrida(sesiones, plan, hoy, sets) ? ['C', 'A', 'B'] : ['A', 'B']
  return base.filter((t) => !hecha(t))
}
export interface Eleccion {
  tipo: Club
  /** ya se hicieron las tres base: esta es extra (en domingo, opcional) */
  extra: boolean
  /** A sin pierna: la semana ya tiene FRIDA pierna (RUTINA-FINAL.md v7, 4b) */
  sinPierna: boolean
}
/**
 * Qué sesión de club toca hoy (RUTINA-FINAL.md v7, 2). Si faltan varias, C → A → B. Sin espalda dos días seguidos: si
 * ayer hubo FRIDA torso (o sin tipo) o C, o Frida está planeada para mañana y todavía sin tipo, no se ofrece B ni C
 * mientras falte A; FRIDA pierna no bloquea nada. Con las tres base hechas, la extra es C si la semana tuvo FRIDA pierna
 * (nunca dos C en la semana); si no, A o B, la contraria de la última. La A sale sin pierna si la FRIDA pierna ya está
 * registrada. "Hoy prefiero A" (`elegida`) manda solo ese día.
 */
export function elegirSesion(sesiones: Sesion[], plan: PlanFrida | undefined, hoy: Date, sets: SetLog[] = [], elegida?: { fecha: string; tipo: Club }): Eleccion {
  const faltan = faltantes(sesiones, plan, hoy, sets)
  const hoyClave = claveFecha(hoy)
  const fridaPierna = fridaPiernaEnSemana(sesiones, hoy, sets)
  const con = (tipo: Club, extra: boolean): Eleccion => ({ tipo, extra, sinPierna: tipo === 'A' && fridaPierna })
  if (elegida && elegida.fecha === hoyClave) return con(elegida.tipo, !faltan.includes(elegida.tipo))
  if (faltan.length === 0) {
    const yaHayC = sesionesDeSemana(sesiones, hoy, sets).some((s) => s.tipo === 'C')
    if (fridaPierna && !yaHayC) return con('C', true)
    const u = hechas(sesiones, sets).filter((s) => s.tipo === 'A' || s.tipo === 'B').pop()
    return con(u?.tipo === 'A' ? 'B' : 'A', true)
  }
  if (faltan.includes('A')) {
    const ayer = claveFecha(sumarDias(hoy, -1))
    const manana = claveFecha(sumarDias(hoy, 1))
    const ayerEspalda = hechas(sesiones, sets).some((s) => s.fecha === ayer && esEspalda(s))
    const e = estadoFrida(sesiones, plan, hoy, sets)
    const fridaManana = e.hecha === null && e.planeada === manana
    if (ayerEspalda || fridaManana) return con('A', false)
  }
  return con(faltan[0], false)
}

export interface EstadoSemana {
  hechas: number
  meta: number
  /** true cuando ya hay 3 y la siguiente es extra */
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

/** "B", "A sin pierna" */
export const textoEleccion = (e: Pick<Eleccion, 'tipo' | 'sinPierna'>) => `${e.tipo}${e.sinPierna ? ' sin pierna' : ''}`
export const NOCHE_MIN = 21 * 60
/** el domingo el club cierra a las 7 */
export const DOMINGO_CIERRE = 19 * 60
/**
 * Avisos de la semana, una línea en Hoy (RUTINA-FINAL.md v7, 2). Jueves, ya hecha la sesión del día o desde las 21:00:
 * "Vas en 2 de 3. Mañana viernes toca B: prende tus alarmas de Pesas extra." o "Semana completa. Mañana viernes, sauna.".
 * Viernes (desde las 21:00 o con "Hoy no") y domingo hasta las 19:00, si va en menos de 3: el rescate del domingo.
 */
export function avisoSemana(sesiones: Sesion[], plan: PlanFrida | undefined, ahora: Date, sets: SetLog[] = [], noFui: string[] = []): string | null {
  const { hechas: n } = estadoSemana(sesiones, ahora, sets)
  const dow = ahora.getDay()
  const min = minutosAhora(ahora)
  const hoy = claveFecha(ahora)
  if (dow === 4) {
    const hechaHoy = hechas(sesiones, sets).some((s) => s.fecha === hoy && ES_CLUB(s.tipo))
    if (!hechaHoy && min < NOCHE_MIN) return null
    if (n >= META) return 'Semana completa. Mañana viernes, sauna.'
    return `Vas en ${n} de ${META}. Mañana viernes toca ${textoEleccion(elegirSesion(sesiones, plan, sumarDias(ahora, 1), sets))}: prende tus alarmas de Pesas extra.`
  }
  if (n >= META) return null
  if (dow === 5 && (min >= NOCHE_MIN || noFui.includes(hoy))) return `Vas en ${n} de ${META}; el domingo antes de las 7 pm te toca ${textoEleccion(elegirSesion(sesiones, plan, sumarDias(ahora, 2), sets))}.`
  if (dow === 0 && min < DOMINGO_CIERRE) return `Vas en ${n} de ${META}; hoy antes de las 7 pm te toca ${textoEleccion(elegirSesion(sesiones, plan, ahora, sets))}.`
  return null
}

/** Número de series de un ejercicio: las de la rutina, salvo la semana ligera (2 con el mismo peso) */
export function seriesPara(seriesBase: number, ligera = false): number {
  return ligera ? Math.min(2, seriesBase) : seriesBase
}
