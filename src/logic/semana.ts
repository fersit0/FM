// Lógica de la semana (MANANAS-30.md, 3 y 5). Puro, sin React.
// Entre semana se va al club todas las mañanas y las pesas son lo que quepa. Dos sesiones, A (empuje) y B (jalón), que
// se alternan sin reiniciar por semana: toca la contraria de la última. Dos contadores de lunes a domingo: Club (días con
// pesas en el club o visita de solo regadera, meta 5) y Pesas (A, B, la C vieja y Frida, meta 3 y sin tope). Una sesión
// cuenta si está terminada o si tiene al menos una serie registrada.
import type { Sesion, SetLog, Club, Rota, FridaTipo } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, DIAS_NOMBRE } from './fechas'

export const META_PESAS = 3
export const META_CLUB = 5
export const esClub = (t: Sesion['tipo']): t is Club => t === 'A' || t === 'B' || t === 'C'
/** Pesas: A, B, la C vieja y Frida. La visita y CASA no. */
export const esPesas = (t: Sesion['tipo']): boolean => esClub(t) || t === 'FRIDA'

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
/** Todo lo hecho en la semana (lunes a domingo) que contiene `fecha`, en orden */
function deSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): Sesion[] {
  const [ini, fin] = rango(fecha)
  return hechas(sesiones, sets).filter((s) => s.fecha >= ini && s.fecha <= fin)
}
/** Sesiones de pesas de la semana que contiene `fecha` (A, B, C y Frida). CASA y la visita no. */
export function sesionesDeSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): Sesion[] {
  return deSemana(sesiones, fecha, sets).filter((s) => esPesas(s.tipo))
}

export const CASA_MAX = 2
/** Sesiones CASA de la semana (máximo 2, no cuentan para la meta) */
export function casaDeSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): number {
  return deSemana(sesiones, fecha, sets).filter((s) => s.tipo === 'CASA').length
}
export function casaDisponible(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): boolean {
  return casaDeSemana(sesiones, fecha, sets) < CASA_MAX
}

/** Qué hicieron con Frida; las FRIDA viejas sin tipo cuentan como torso */
export function fridaTipoDe(s: Pick<Sesion, 'fridaTipo'>): FridaTipo {
  return s.fridaTipo ?? 'torso'
}

// ---------- Rotación (MANANAS-30.md, 3) ----------
/**
 * Cómo mueve la rotación una sesión: A es A; B, la C vieja (espalda) y Frida torso cuentan como B; Frida pierna, la
 * visita y CASA no la mueven.
 */
export function rotaDe(s: Pick<Sesion, 'tipo' | 'fridaTipo'>): Rota | null {
  if (s.tipo === 'A') return 'A'
  if (s.tipo === 'B' || s.tipo === 'C') return 'B'
  if (s.tipo === 'FRIDA') return fridaTipoDe(s) === 'torso' ? 'B' : null
  return null
}
export interface OpcionesRotacion {
  /** día en que arrancó la v8: lo de antes no cuenta, para que la primera sea A */
  desde?: string
  /** "Hoy prefiero…": manda solo ese día */
  elegida?: { fecha: string; tipo: Club }
}
/** La última sesión que mueve la rotación (desde `desde`, si se da), o null */
export function ultimaDeRotacion(sesiones: Sesion[], sets: SetLog[] = [], desde?: string): Sesion | null {
  const lista = hechas(sesiones, sets).filter((s) => rotaDe(s) !== null && (!desde || s.fecha >= desde))
  return lista.length ? lista[lista.length - 1] : null
}
/**
 * Qué sesión toca: la contraria de la última que mueve la rotación, del día que sea; sin ninguna, A. "Hoy prefiero…"
 * (`elegida`) manda solo ese día, y la rotación sigue desde la que se hizo.
 */
export function tocaSesion(sesiones: Sesion[], hoy: Date, sets: SetLog[] = [], opciones: OpcionesRotacion = {}): Rota {
  const { desde, elegida } = opciones
  if (elegida && elegida.fecha === claveFecha(hoy) && (elegida.tipo === 'A' || elegida.tipo === 'B')) return elegida.tipo
  const u = ultimaDeRotacion(sesiones, sets, desde)
  return u && rotaDe(u) === 'A' ? 'B' : 'A'
}
/** La sesión de club (A, B o C) más reciente por fecha, o null */
export function ultimaPropia(sesiones: Sesion[], sets: SetLog[] = [], antesDe?: string): Sesion | null {
  const propias = hechas(sesiones, sets).filter((s) => esClub(s.tipo) && (!antesDe || s.fecha < antesDe))
  return propias.length ? propias[propias.length - 1] : null
}

// ---------- Días hábiles ----------
/** De lunes a viernes: cualquier mañana es de club (MANANAS-30.md, 4) */
export const esHabil = (d: Date): boolean => d.getDay() >= 1 && d.getDay() <= 5
/** El día hábil anterior a `d` (el del lunes es el viernes) */
export function habilAnterior(d: Date): Date {
  let r = sumarDias(d, -1)
  while (!esHabil(r)) r = sumarDias(r, -1)
  return r
}
/** El día hábil que sigue a `d` (el del viernes es el lunes) */
export function habilSiguiente(d: Date): Date {
  let r = sumarDias(d, 1)
  while (!esHabil(r)) r = sumarDias(r, 1)
  return r
}
/** Ese día fue al club: pesas (A, B o C) o visita */
export function fueAlClub(sesiones: Sesion[], sets: SetLog[], fecha: string): boolean {
  return hechas(sesiones, sets).some((s) => s.fecha === fecha && (esClub(s.tipo) || s.tipo === 'VISITA'))
}

// ---------- Contadores (MANANAS-30.md, 5) ----------
export interface Contadores {
  /** días de la semana con pesas en el club o visita */
  club: number
  /** sesiones de pesas de la semana: A, B, la C vieja y Frida */
  pesas: number
}
export function contadores(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): Contadores {
  const semana = deSemana(sesiones, fecha, sets)
  const diasClub = new Set(semana.filter((s) => esClub(s.tipo) || s.tipo === 'VISITA').map((s) => s.fecha))
  return { club: diasClub.size, pesas: semana.filter((s) => esPesas(s.tipo)).length }
}
/** "Club 2 de 5" y "Pesas 2", en piezas para la línea de Hoy */
export const textoContadores = (c: Contadores): string[] => [`Club ${c.club} de ${META_CLUB}`, `Pesas ${c.pesas}`]

export interface EstadoSemana {
  /** sesiones de pesas de la semana */
  hechas: number
  meta: number
  /** días de la semana (lunes a domingo) con lo hecho */
  dias: { fecha: string; tipos: Sesion['tipo'][] }[]
}
export function estadoSemana(sesiones: Sesion[], fecha: Date, sets: SetLog[] = []): EstadoSemana {
  const semana = sesionesDeSemana(sesiones, fecha, sets)
  const ini = inicioSemana(fecha)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const clave = claveFecha(sumarDias(ini, i))
    return { fecha: clave, tipos: semana.filter((s) => s.fecha === clave).map((s) => s.tipo) }
  })
  return { hechas: semana.length, meta: META_PESAS, dias }
}

export const NOCHE_MIN = 21 * 60
/** el domingo el club cierra a las 7 */
export const DOMINGO_CIERRE = 19 * 60
/**
 * El único aviso (MANANAS-30.md, 5): en día hábil, si el día hábil anterior no hubo nada (ni club ni Frida) y hoy
 * todavía no hay club, "Ayer no hubo club. Hoy sí: nunca dos seguidos.". Solo por días desde que arrancó la v8.
 */
export function avisoAyer(sesiones: Sesion[], sets: SetLog[], ahora: Date, desde?: string): string | null {
  if (!esHabil(ahora) || !desde) return null
  const anterior = habilAnterior(ahora)
  const clave = claveFecha(anterior)
  if (clave < desde) return null
  if (hechas(sesiones, sets).some((s) => s.fecha === clave && (esPesas(s.tipo) || s.tipo === 'VISITA'))) return null
  if (fueAlClub(sesiones, sets, claveFecha(ahora))) return null
  const cuando = clave === claveFecha(sumarDias(ahora, -1)) ? 'Ayer' : `El ${DIAS_NOMBRE[anterior.getDay()]}`
  return `${cuando} no hubo club. Hoy sí: nunca dos seguidos.`
}

/** Número de series de un ejercicio: las de la rutina, salvo la semana ligera (2 con el mismo peso) */
export function seriesPara(seriesBase: number, ligera = false): number {
  return ligera ? Math.min(2, seriesBase) : seriesBase
}
