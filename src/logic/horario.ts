// Versión automática por hora real, mañana y noche (RUTINA-FINAL.md v7, 3, con MANANAS-30.md, 4). Puro, sin React.
// Entre semana en la mañana (lunes a viernes, antes de las 12) el tope de la última pesa es la salida del club menos los
// minutos de baño (8:45 menos 35 = 8:10): completa si caben al menos los dos primeros ejercicios (lo demás se recorta en
// el camino), si no corta, si no "Hoy solo regadera". En la noche y en fin de semana la última pesa es 15 min antes de
// que cierre el club: 21:15 de martes a sábado, 18:45 el domingo; completa, corta o CASA. El lunes en la tarde el club
// no abre.
import type { Settings } from '../data/tipos'
import { minutosAhora, minutosDe, formatoHora } from './fechas'

/** 'regadera' = en la mañana ya no alcanza ni la corta: hoy solo regadera; 'cerrado' = el club no abre (lunes en la tarde) */
export type VersionAuto = 'completa' | 'corta' | 'casa' | 'regadera' | 'cerrado'
export interface Duraciones {
  /** minutos de calentamiento más pesas de la completa entera */
  completa: number
  /** minutos de calentamiento más los dos primeros ejercicios de la completa: lo mínimo para empezarla */
  minima: number
  /** minutos de calentamiento más pesas de la corta */
  corta: number
}
export type Franja = 'manana' | 'noche' | 'cerrado'
export const MEDIODIA = 12 * 60
/** el domingo el club cierra a las 19:00: última pesa 18:45 */
export const TOPE_DOMINGO = 18 * 60 + 45
type Horario = Pick<Settings, 'salidaManana' | 'minBano' | 'ultimaPesaNoche'>

/** Entre semana antes de las 12, mañana; el lunes en la tarde el club no abre; lo demás (tardes y fin de semana), noche */
export function franjaDe(fecha: Date, min = minutosAhora(fecha)): Franja {
  const dow = fecha.getDay()
  if (dow >= 1 && dow <= 5 && min < MEDIODIA) return 'manana'
  if (dow === 1) return 'cerrado'
  return 'noche'
}
/**
 * Franja de una sesión ya empezada, por el día y la hora de inicio: entre semana antes de las 12, mañana; lo demás, noche
 * (también sábado y domingo antes de las 12, y el lunes en la tarde). No sale del momento, que es solo la etiqueta del
 * registro: un domingo a las 11 el momento es mañana, pero el tope es el de las 18:45 y hay cierre.
 */
export function franjaDeSesion(inicioMs: number): 'manana' | 'noche' {
  return franjaDe(new Date(inicioMs)) === 'manana' ? 'manana' : 'noche'
}
/** Tope de la última pesa (minuto del día) para esa franja: 8:10 en la mañana, 21:15 en la noche, 18:45 el domingo */
export function topeDe(fecha: Date, settings: Horario, franja = franjaDe(fecha)): number | null {
  if (franja === 'cerrado') return null
  if (franja === 'manana') return minutosDe(settings.salidaManana) - settings.minBano
  return fecha.getDay() === 0 ? TOPE_DOMINGO : minutosDe(settings.ultimaPesaNoche)
}

/**
 * Qué versión alcanza si se empieza en el minuto `inicio`: completa si sus dos primeros ejercicios terminan en el tope o
 * antes (lo que no quepa del resto se recorta en el camino); si no, corta si cabe
 */
export function versionAutomatica(inicio: number, duraciones: Duraciones, topeMin: number | null, franja: Franja = 'noche'): VersionAuto {
  if (franja === 'cerrado' || topeMin === null) return 'cerrado'
  if (inicio + duraciones.minima <= topeMin) return 'completa'
  if (inicio + duraciones.corta <= topeMin) return 'corta'
  return franja === 'manana' ? 'regadera' : 'casa'
}
/** La versión para una hora real (lo que se usa al tocar Empezar) */
export function versionParaHora(ahora: Date, duraciones: Duraciones, settings: Horario): VersionAuto {
  const franja = franjaDe(ahora)
  return versionAutomatica(minutosAhora(ahora), duraciones, topeDe(ahora, settings, franja), franja)
}
/** Último minuto del día en que todavía alcanza cada versión */
export function limites(duraciones: Duraciones, topeMin: number): { completa: number; minima: number; corta: number } {
  return { completa: Math.floor(topeMin - duraciones.completa), minima: Math.floor(topeMin - duraciones.minima), corta: Math.floor(topeMin - duraciones.corta) }
}

export interface ResultadoTiempo {
  version: VersionAuto
  franja: Franja
  /** minutos hasta la última pesa (hora tope); 0 si el club no abre */
  minutosParaTope: number
  /** alcanza la completa, pero ya no entera: se va a recortar en el camino */
  recortada: boolean
  titulo: string
  detalle: string
}
export function estadoTiempoEnMinutos(min: number, fecha: Date, settings: Horario, duraciones: Duraciones): ResultadoTiempo {
  const franja = franjaDe(fecha, min)
  const tope = topeDe(fecha, settings, franja)
  if (tope === null) return { version: 'cerrado', franja, minutosParaTope: 0, recortada: false, titulo: 'El club ya cerró.', detalle: 'Los lunes abre de 7 a 11.' }
  const minutosParaTope = tope - min
  const version = versionAutomatica(min, duraciones, tope, franja)
  const lim = limites(duraciones, tope)
  const base = { version, franja, minutosParaTope, recortada: false }
  if (version === 'completa') {
    if (min + duraciones.completa <= tope) return { ...base, titulo: 'Alcanza la completa', detalle: `Completa si empiezas a las ${formatoHora(lim.completa)} o antes.` }
    return { ...base, recortada: true, titulo: 'Alcanza recortada', detalle: `Lo que no quepa antes de las ${formatoHora(tope)} se recorta solo.` }
  }
  if (version === 'corta') return { ...base, titulo: 'Alcanza la corta', detalle: `Tienes ${minutosParaTope} min hasta la última pesa. Corta si empiezas a las ${formatoHora(lim.corta)} o antes.` }
  if (version === 'regadera') return { ...base, titulo: 'Hoy solo regadera.', detalle: 'Para pesas ya no alcanza. Llegar cuenta.' }
  return { ...base, titulo: 'Hoy ya no alcanza ni la corta.', detalle: minutosParaTope > 0 ? 'Queda casa, 12 minutos, o la corta de todas formas.' : 'Ya pasó la hora de la última pesa.' }
}
export function estadoTiempo(ahora: Date, settings: Horario, duraciones: Duraciones): ResultadoTiempo {
  return estadoTiempoEnMinutos(minutosAhora(ahora), ahora, settings, duraciones)
}
/** "Salgo de la oficina a las ___": suma carretera + casa-club y contesta para esa hora de llegada, en la noche de ese día */
export function estadoSiSalgo(horaSalida: string, settings: Horario & Pick<Settings, 'minCarretera' | 'minCasaClub'>, duraciones: Duraciones, fecha: Date): ResultadoTiempo & { llegadaMin: number } {
  const llegadaMin = Math.max(MEDIODIA, minutosDe(horaSalida) + settings.minCarretera + settings.minCasaClub)
  return { ...estadoTiempoEnMinutos(llegadaMin, fecha, settings, duraciones), llegadaMin }
}

/**
 * Línea de arriba de la sesión. Mañana: "Empezaste 7:42 · completa · terminas pesas 8:09 · sales 8:45". Noche:
 * "Empezaste 8:22 · va la corta · terminas pesas 8:36".
 */
export function lineaSesion(inicioMin: number, finPesasMin: number, version: 'completa' | 'corta', franja: Franja, settings: Horario): string {
  const fin = Math.round(finPesasMin)
  const base = `Empezaste ${horaCorta(inicioMin)} · ${franja === 'manana' ? version : `va la ${version}`} · terminas pesas ${horaCorta(fin)}`
  if (franja !== 'manana') return base
  return `${base} · sales ${horaCorta(minutosDe(settings.salidaManana))}`
}
/** "6:47", sin am ni pm (en la sesión se sobreentiende) */
export function horaCorta(min: number): string {
  const m = Math.round(min)
  return `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}`
}
