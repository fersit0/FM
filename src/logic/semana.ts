// Lógica de la semana (sección 4 del brief). Puro, sin React.
import type { Sesion, Letra, Settings } from '../data/tipos'
import { claveFecha, inicioSemana, sumarDias, minutosAhora, minutosDe } from './fechas'

export const META = 3

/** Sesiones terminadas dentro de la semana (lunes a domingo) que contiene `fecha` */
export function sesionesDeSemana(sesiones: Sesion[], fecha: Date): Sesion[] {
  const ini = claveFecha(inicioSemana(fecha))
  const fin = claveFecha(sumarDias(inicioSemana(fecha), 6))
  return sesiones
    .filter((s) => s.terminada && s.fecha >= ini && s.fecha <= fin)
    .sort((a, b) => a.inicio - b.inicio)
}

/** La siguiente sesión propia es la que NO se hizo la última vez. Frida no afecta. */
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
  extraIds: string[] = ['A1', 'A2', 'B1', 'B2'],
): number {
  if (version === 'corta' || ligera) return 2
  if (seriesExtra && extraIds.includes(ejercicioId)) return 4
  return seriesBase
}

/** Ejercicios que entran según la versión: corta = solo 1 a 4 */
export function entraEnVersion(orden: number, version: 'completa' | 'corta' | 'bonus'): boolean {
  return version !== 'corta' || orden <= 4
}
