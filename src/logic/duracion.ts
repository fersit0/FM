// Duración estimada de una sesión (RUTINA-FINAL.md, 3): 45 s por serie, descansos completos, 15 s de cambio en los pares,
// 1 min de transición entre bloques, calentamiento y cierre según versión y pierna.
import type { Bloque } from '../data/ejercicios'
import { CALENTAMIENTO, CIERRE, CAMBIO_PAR_SEG } from '../data/ejercicios'
import { seriesPara, secuenciaDePar } from './semana'

export const SEG_POR_SERIE = 45
export const SEG_TRANSICION = 60

export function minutosCalentamiento(version: 'completa' | 'corta' | 'bonus', casa = false): number {
  if (casa) return 0
  return version === 'corta' ? CALENTAMIENTO.minCorta : CALENTAMIENTO.minCompleta
}
export function minutosCierre(version: 'completa' | 'corta' | 'bonus', pierna = false, casa = false): number {
  if (casa) return 0
  if (version === 'corta') return CIERRE.minCorta
  if (version === 'bonus') return CIERRE.minBonus
  return pierna ? CIERRE.minConPierna : CIERRE.minCompleta
}
/** Segundos de un bloque: series × (45 s + descanso); en un par, cada ronda suma los 15 s de cambio */
export function segundosDeBloque(b: Bloque, version: 'completa' | 'corta' | 'bonus', seriesExtra: boolean, ligera = false): number {
  const series = b.ejercicios.map((e) => seriesPara(e.id, e.series, version, seriesExtra, ligera))
  const descanso = b.ejercicios[0].descansoSeg
  if (b.ejercicios.length === 1) return series[0] * (SEG_POR_SERIE + descanso)
  const seq = secuenciaDePar(series)
  let total = 0
  for (let i = 0; i < seq.length; i++) {
    total += SEG_POR_SERIE
    const sigue = seq[i + 1]
    if (sigue === undefined) total += descanso
    else total += sigue !== seq[i] && i % 2 === 0 ? CAMBIO_PAR_SEG : descanso
  }
  return total
}
/** Minutos totales estimados, redondeados */
export function duracionEstimada(bloques: Bloque[], version: 'completa' | 'corta' | 'bonus', opciones: { pierna?: boolean; seriesExtra?: boolean; ligera?: boolean; casa?: boolean } = {}): number {
  const { pierna = false, seriesExtra = false, ligera = false, casa = false } = opciones
  let seg = 0
  for (const b of bloques) seg += segundosDeBloque(b, version, seriesExtra, ligera) + SEG_TRANSICION
  seg -= bloques.length ? SEG_TRANSICION : 0
  const min = seg / 60 + minutosCalentamiento(version, casa) + minutosCierre(version, pierna, casa) + (casa ? 0 : bloques.length ? 1 : 0)
  return Math.round(min)
}
