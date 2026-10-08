// Versión automática por hora real (RUTINA-FINAL.md, 3). Puro, sin React.
// Al empezar, si las pesas de la completa terminan antes de la última pesa (21:10) va completa; si no y la corta sí
// alcanza, corta; si ninguna alcanza, CASA. En domingo o antes de las 7 pm, siempre completa.
import type { Settings } from '../data/tipos'
import { minutosAhora, minutosDe, formatoHora } from './fechas'

export type VersionAuto = 'completa' | 'corta' | 'casa'
export interface Duraciones {
  /** minutos de calentamiento más pesas de la completa */
  completa: number
  /** minutos de calentamiento más pesas de la corta */
  corta: number
}
const TARDE_MIN = 19 * 60

/** Qué versión alcanza si se empieza en el minuto `inicio` del día; en domingo siempre completa */
export function versionAutomatica(inicio: number, duraciones: Duraciones, topeMin: number, domingo = false): VersionAuto {
  if (domingo || inicio < TARDE_MIN) return 'completa'
  if (inicio + duraciones.completa < topeMin) return 'completa'
  if (inicio + duraciones.corta < topeMin) return 'corta'
  return 'casa'
}
/** La versión para una hora real (lo que se usa al tocar Empezar) */
export function versionParaHora(ahora: Date, duraciones: Duraciones, topeMin: number): VersionAuto {
  return versionAutomatica(minutosAhora(ahora), duraciones, topeMin, ahora.getDay() === 0)
}
/** Último minuto del día en que todavía alcanza cada versión */
export function limites(duraciones: Duraciones, topeMin: number): { completa: number; corta: number } {
  return { completa: Math.ceil(topeMin - duraciones.completa) - 1, corta: Math.ceil(topeMin - duraciones.corta) - 1 }
}

export interface ResultadoTiempo {
  version: VersionAuto
  /** minutos hasta la última pesa (hora tope) */
  minutosParaTope: number
  titulo: string
  detalle: string
}
export function estadoTiempoEnMinutos(min: number, settings: Pick<Settings, 'horaTope'>, duraciones: Duraciones, domingo = false): ResultadoTiempo {
  const tope = minutosDe(settings.horaTope)
  const minutosParaTope = tope - min
  const version = versionAutomatica(min, duraciones, tope, domingo)
  const lim = limites(duraciones, tope)
  if (version === 'completa') {
    return {
      version, minutosParaTope, titulo: 'Alcanza la completa',
      detalle: domingo ? 'Domingo: completa, sin prisa.' : min < TARDE_MIN ? 'Antes de las 7. Sin prisa.' : `Completa hasta las ${formatoHora(lim.completa)}.`,
    }
  }
  if (version === 'corta') return { version, minutosParaTope, titulo: 'Alcanza la corta', detalle: `Tienes ${minutosParaTope} min hasta la última pesa. Corta hasta las ${formatoHora(lim.corta)}.` }
  return { version, minutosParaTope, titulo: 'Hoy ya no alcanza ni la corta.', detalle: minutosParaTope > 0 ? 'Queda casa, 12 minutos, o la corta de todas formas.' : 'Mañana es otro día.' }
}
export function estadoTiempo(ahora: Date, settings: Pick<Settings, 'horaTope'>, duraciones: Duraciones): ResultadoTiempo {
  return estadoTiempoEnMinutos(minutosAhora(ahora), settings, duraciones, ahora.getDay() === 0)
}
/** "Salgo de la oficina a las ___": suma carretera + casa-club y contesta para esa hora de llegada */
export function estadoSiSalgo(horaSalida: string, settings: Pick<Settings, 'horaTope' | 'minCarretera' | 'minCasaClub'>, duraciones: Duraciones, domingo = false): ResultadoTiempo & { llegadaMin: number } {
  const llegadaMin = minutosDe(horaSalida) + settings.minCarretera + settings.minCasaClub
  return { ...estadoTiempoEnMinutos(llegadaMin, settings, duraciones, domingo), llegadaMin }
}
/** Texto del día siguiente: "Mañana es martes." */
export function textoManana(ahora: Date, nombres: string[]): string {
  const m = new Date(ahora)
  m.setDate(m.getDate() + 1)
  return `Mañana es ${nombres[m.getDay()]}.`
}
