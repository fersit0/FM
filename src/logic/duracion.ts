// Duración estimada (RUTINA-FINAL.md, 3): 40 s por serie de 8-10, 45 de 10-12, 50 de 12-15 y 55 de 12-20, descansos
// completos, 1 min entre ejercicios y 2 min al cambiar de zona, más calentamiento y cierre según versión. Puro, sin React.
import type { Ejercicio, Letra } from '../data/tipos'
import { CALENTAMIENTO, CIERRE, listaDe } from '../data/ejercicios'
import { seriesPara } from './semana'
import type { Duraciones } from './horario'

export const SEG_ENTRE_EJERCICIOS = 60
export const SEG_CAMBIO_ZONA = 120
type Version = 'completa' | 'corta'

/** Segundos que dura una serie según su rango de repeticiones */
export function segundosPorSerie(e: Pick<Ejercicio, 'repsMin' | 'repsMax'>): number {
  if (e.repsMax <= 10) return 40
  if (e.repsMax <= 12) return 45
  if (e.repsMax <= 15) return 50
  return 55
}
export function minutosCalentamiento(version: Version, casa = false): number {
  if (casa) return 0
  return version === 'corta' ? CALENTAMIENTO.minCorta : CALENTAMIENTO.minCompleta
}
export function minutosCierre(version: Version, casa = false, terminoAqui = false): number {
  if (casa) return 0
  if (terminoAqui) return CIERRE.minTerminarAqui
  return version === 'corta' ? CIERRE.minCorta : CIERRE.minCompleta
}
/** Segundos de un ejercicio: series × (segundos de la serie + su descanso) */
export function segundosDeEjercicio(e: Pick<Ejercicio, 'series' | 'descansoSeg' | 'repsMin' | 'repsMax'>, ligera = false, seriesHechas = 0): number {
  return Math.max(0, seriesPara(e.series, ligera) - seriesHechas) * (segundosPorSerie(e) + e.descansoSeg)
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
export function duracionEstimada(lista: Ejercicio[], version: Version, opciones: { ligera?: boolean; casa?: boolean } = {}): number {
  const { ligera = false, casa = false } = opciones
  if (casa) return 12
  return Math.round(minutosHastaUltimaPesa(lista, version, ligera) + minutosCierre(version))
}
/** Minutos hasta la última pesa de la completa y de la corta de una sesión de club (para la versión automática) */
export function duracionesDe(sesion: Letra): Duraciones {
  return { completa: minutosHastaUltimaPesa(listaDe(sesion, 'completa'), 'completa'), corta: minutosHastaUltimaPesa(listaDe(sesion, 'corta'), 'corta') }
}
