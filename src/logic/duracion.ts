// Duración estimada (RUTINA-FINAL.md, 3): 45 s por serie, descansos completos, 1 min entre ejercicios y 2 min al
// cambiar de zona, calentamiento y cierre según versión y pierna. Puro, sin React.
import type { Ejercicio } from '../data/tipos'
import { CALENTAMIENTO, CIERRE } from '../data/ejercicios'
import { seriesPara } from './semana'

export const SEG_POR_SERIE = 45
export const SEG_ENTRE_EJERCICIOS = 60
export const SEG_CAMBIO_ZONA = 120
type Version = 'completa' | 'corta' | 'bonus'

export function minutosCalentamiento(version: Version, casa = false): number {
  if (casa) return 0
  return version === 'corta' ? CALENTAMIENTO.minCorta : CALENTAMIENTO.minCompleta
}
export function minutosCierre(version: Version, pierna = false, casa = false): number {
  if (casa) return 0
  if (version === 'corta') return CIERRE.minCorta
  if (version === 'bonus') return CIERRE.minBonus
  return pierna ? CIERRE.minConPierna : CIERRE.minCompleta
}
/** Segundos de un ejercicio: series × (45 s + su descanso) */
export function segundosDeEjercicio(e: Pick<Ejercicio, 'series' | 'descansoSeg'>, ligera = false, seriesHechas = 0): number {
  return Math.max(0, seriesPara(e.series, ligera) - seriesHechas) * (SEG_POR_SERIE + e.descansoSeg)
}
/** Segundos de pesas de una lista en orden: ejercicios más 1 min entre ellos (2 si cambia la zona) */
export function segundosPesas(lista: Ejercicio[], ligera = false): number {
  let seg = 0
  for (let i = 0; i < lista.length; i++) {
    seg += segundosDeEjercicio(lista[i], ligera)
    if (i > 0) seg += lista[i - 1].zona && lista[i].zona && lista[i - 1].zona !== lista[i].zona ? SEG_CAMBIO_ZONA : SEG_ENTRE_EJERCICIOS
  }
  return seg
}
/** Minutos desde que se toca Empezar hasta la última pesa: calentamiento más pesas (sin cierre) */
export function minutosHastaUltimaPesa(lista: Ejercicio[], version: Version, ligera = false): number {
  return minutosCalentamiento(version) + segundosPesas(lista, ligera) / 60
}
/** Minutos totales estimados, redondeados. CASA son 12 por definición. */
export function duracionEstimada(lista: Ejercicio[], version: Version, opciones: { pierna?: boolean; ligera?: boolean; casa?: boolean } = {}): number {
  const { pierna = false, ligera = false, casa = false } = opciones
  if (casa) return 12
  return Math.round(minutosHastaUltimaPesa(lista, version, ligera) + minutosCierre(version, pierna))
}
