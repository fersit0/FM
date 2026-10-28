// Versión automática por hora real, mañana y noche (RUTINA-FINAL.md v7, 3). Puro, sin React.
// Entre semana en la mañana (lunes a viernes, antes de las 12) la última pesa ideal es a las 7:40 y el tope a las 8:15
// (salida del club 8:40 menos 25 de baño): completa si cabe, si no corta, si no "ya no alcanza en la mañana". En la
// noche y en fin de semana la última pesa es 15 min antes de que cierre el club: 21:15 de martes a sábado, 18:45 el
// domingo; completa, corta o CASA. El lunes en la tarde el club no abre.
import type { Settings } from '../data/tipos'
import { minutosAhora, minutosDe, formatoHora } from './fechas'

/** 'noche' = en la mañana ya no alcanza ni la corta: queda la noche; 'cerrado' = el club no abre (lunes en la tarde) */
export type VersionAuto = 'completa' | 'corta' | 'casa' | 'noche' | 'cerrado'
export interface Duraciones {
  /** minutos de calentamiento más pesas de la completa */
  completa: number
  /** minutos de calentamiento más pesas de la corta */
  corta: number
}
export type Franja = 'manana' | 'noche' | 'cerrado'
export const MEDIODIA = 12 * 60
/** última pesa ideal en la mañana: después de esta hora lo que se acorta es el sauna, no las pesas */
export const IDEAL_MANANA = 7 * 60 + 40
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
/** Tope de la última pesa (minuto del día) para esa franja: 8:15 en la mañana, 21:15 en la noche, 18:45 el domingo */
export function topeDe(fecha: Date, settings: Horario, franja = franjaDe(fecha)): number | null {
  if (franja === 'cerrado') return null
  if (franja === 'manana') return minutosDe(settings.salidaManana) - settings.minBano
  return fecha.getDay() === 0 ? TOPE_DOMINGO : minutosDe(settings.ultimaPesaNoche)
}

/** Qué versión alcanza si se empieza en el minuto `inicio`: completa o corta si sus pesas terminan en el tope o antes */
export function versionAutomatica(inicio: number, duraciones: Duraciones, topeMin: number | null, franja: Franja = 'noche'): VersionAuto {
  if (franja === 'cerrado' || topeMin === null) return 'cerrado'
  if (inicio + duraciones.completa <= topeMin) return 'completa'
  if (inicio + duraciones.corta <= topeMin) return 'corta'
  return franja === 'manana' ? 'noche' : 'casa'
}
/** La versión para una hora real (lo que se usa al tocar Empezar) */
export function versionParaHora(ahora: Date, duraciones: Duraciones, settings: Horario): VersionAuto {
  const franja = franjaDe(ahora)
  return versionAutomatica(minutosAhora(ahora), duraciones, topeDe(ahora, settings, franja), franja)
}
/** Último minuto del día en que todavía alcanza cada versión */
export function limites(duraciones: Duraciones, topeMin: number): { completa: number; corta: number } {
  return { completa: Math.floor(topeMin - duraciones.completa), corta: Math.floor(topeMin - duraciones.corta) }
}

export interface ResultadoTiempo {
  version: VersionAuto
  franja: Franja
  /** minutos hasta la última pesa (hora tope); 0 si el club no abre */
  minutosParaTope: number
  titulo: string
  detalle: string
}
export function estadoTiempoEnMinutos(min: number, fecha: Date, settings: Horario, duraciones: Duraciones): ResultadoTiempo {
  const franja = franjaDe(fecha, min)
  const tope = topeDe(fecha, settings, franja)
  if (tope === null) return { version: 'cerrado', franja, minutosParaTope: 0, titulo: 'El club ya cerró.', detalle: 'Los lunes abre de 7 a 11.' }
  const minutosParaTope = tope - min
  const version = versionAutomatica(min, duraciones, tope, franja)
  const lim = limites(duraciones, tope)
  if (version === 'completa') return { version, franja, minutosParaTope, titulo: 'Alcanza la completa', detalle: `Completa hasta las ${formatoHora(lim.completa)}.` }
  if (version === 'corta') return { version, franja, minutosParaTope, titulo: 'Alcanza la corta', detalle: `Tienes ${minutosParaTope} min hasta la última pesa. Corta hasta las ${formatoHora(lim.corta)}.` }
  if (version === 'noche') return { version, franja, minutosParaTope, titulo: 'Ya no alcanza en la mañana.', detalle: 'Queda la noche.' }
  return { version, franja, minutosParaTope, titulo: 'Hoy ya no alcanza ni la corta.', detalle: minutosParaTope > 0 ? 'Queda casa, 12 minutos, o la corta de todas formas.' : 'Ya pasó la hora de la última pesa.' }
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
 * Línea de arriba de la sesión. Mañana: "Empezaste 6:47 · completa · terminas pesas 7:36 · sauna hasta 8:40"; si la
 * última pesa pasa de las 7:40, "terminas pesas 7:52 · te quedan 48 min de sauna y baño". Noche: "Empezaste 8:22 · va la
 * corta · terminas pesas 8:50".
 */
export function lineaSesion(inicioMin: number, finPesasMin: number, version: 'completa' | 'corta', franja: Franja, settings: Horario): string {
  const fin = Math.round(finPesasMin)
  const base = `Empezaste ${horaCorta(inicioMin)} · ${franja === 'manana' ? version : `va la ${version}`} · terminas pesas ${horaCorta(fin)}`
  if (franja !== 'manana') return base
  const salida = minutosDe(settings.salidaManana)
  if (fin <= IDEAL_MANANA) return `${base} · sauna hasta ${horaCorta(salida)}`
  return `${base} · te quedan ${Math.max(0, salida - fin)} min de sauna y baño`
}
/** "6:47", sin am ni pm (en la sesión se sobreentiende) */
export function horaCorta(min: number): string {
  const m = Math.round(min)
  return `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}`
}
