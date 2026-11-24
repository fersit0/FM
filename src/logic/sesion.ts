// Orden de la sesión en marcha (RUTINA-FINAL.md, 3): "Ocupado: después", el recorte en el camino y "Terminar aquí". Puro, sin React.
import type { Ejercicio, Sesion, SetLog } from '../data/tipos'
import { listaDe, protegidosDe } from '../data/ejercicios'
import { segundosDeEjercicio, SEG_ENTRE_EJERCICIOS, SEG_CAMBIO_ZONA } from './duracion'

/**
 * Lista de ejercicios de una sesión en su orden actual: el guardado (si "Ocupado: después" lo cambió), sin los
 * recortados y con las series que el recorte en el camino les haya quitado. Frida y la visita no llevan ejercicios.
 */
export function listaDeSesion(s: Pick<Sesion, 'tipo' | 'version' | 'orden' | 'recortados' | 'seriesMenos' | 'ligera'>): Ejercicio[] {
  if (s.tipo === 'FRIDA' || s.tipo === 'VISITA') return []
  const base = listaDe(s.tipo, s.version)
  const orden = s.orden ?? base.map((e) => e.id)
  const lista = orden.map((id) => base.find((e) => e.id === id)).filter((e): e is Ejercicio => !!e)
  for (const e of base) if (!lista.includes(e)) lista.push(e)
  return lista.filter((e) => !s.recortados?.includes(e.id)).map((e) => {
    const menos = s.seriesMenos?.[e.id] ?? 0
    if (menos <= 0) return e
    // en la semana ligera ya son 2 por ejercicio: el recorte se descuenta de esas
    return { ...e, series: Math.max(1, (s.ligera ? Math.min(2, e.series) : e.series) - menos) }
  })
}

/**
 * "Ocupado: después": manda el ejercicio en `indice` al final de su zona; si en la zona ya no queda nada después,
 * al final de la sesión. Devuelve el orden nuevo (ids).
 */
export function posponer(lista: Ejercicio[], indice: number): string[] {
  const e = lista[indice]
  if (!e) return lista.map((x) => x.id)
  const resto = lista.filter((_, i) => i !== indice)
  let ultimo = -1
  for (let i = indice; i < resto.length; i++) if (resto[i].zona === e.zona) ultimo = i
  const destino = ultimo >= 0 ? ultimo + 1 : resto.length
  resto.splice(destino, 0, e)
  return resto.map((x) => x.id)
}

/** Segundos que faltan de pesas: lo que resta del ejercicio actual y los que siguen, con sus transiciones */
export function segundosRestantes(lista: Ejercicio[], indice: number, seriesHechasActual: number, ligera = false, descansoRestanteSeg = 0): number {
  let seg = descansoRestanteSeg
  for (let i = Math.max(0, indice); i < lista.length; i++) {
    seg += segundosDeEjercicio(lista[i], ligera, i === indice ? seriesHechasActual : 0)
    if (i > indice) seg += lista[i - 1].zona !== lista[i].zona ? SEG_CAMBIO_ZONA : SEG_ENTRE_EJERCICIOS
  }
  return seg
}

export interface Recorte {
  /** ejercicios que salen completos (ids) */
  quitar: string[]
  /** series que se le quitan a un ejercicio que se queda (id → cuántas) */
  menos: Record<string, number>
}
/**
 * Recorte en el camino (MANANAS-30.md, 4): si lo que falta no cabe antes del tope, quita de los pendientes (después del
 * actual), empezando por el último: sus series de una en una hasta quitarlo, y luego lo mismo con el anterior. Nunca
 * toca los dos primeros de la sesión (`protegidos`), que son también la corta. Devuelve lo que hay que quitar hasta que
 * quepa, o todo lo quitable si ni así. `lista` ya trae lo recortado antes; lo que devuelve es además de eso.
 */
export function recortar(lista: Ejercicio[], indice: number, seriesHechasActual: number, segundosDisponibles: number, protegidos: string[], ligera = false): Recorte {
  const quitar: string[] = []
  const menos: Record<string, number> = {}
  let actual = lista
  const cabe = () => segundosRestantes(actual, indice, seriesHechasActual, ligera) <= segundosDisponibles
  if (cabe()) return { quitar, menos }
  const candidatos = lista.filter((e, i) => i > indice && !protegidos.includes(e.id)).reverse()
  for (const e of candidatos) {
    // con la semana ligera ya van 2 series por ejercicio: se cuentan las que de verdad se harían
    let quedan = ligera ? Math.min(2, e.series) : e.series
    let n = 0
    while (quedan > 1) {
      quedan--
      n++
      actual = actual.map((x) => (x.id === e.id ? { ...x, series: quedan } : x))
      if (cabe()) { menos[e.id] = n; return { quitar, menos } }
    }
    quitar.push(e.id)
    actual = actual.filter((x) => x.id !== e.id)
    if (cabe()) return { quitar, menos }
  }
  return { quitar, menos }
}
/** Lo mismo que `recortar`, para la sesión: los protegidos salen de su tipo */
export const protegidosDeSesion = (s: Pick<Sesion, 'tipo'>): string[] => (s.tipo === 'FRIDA' || s.tipo === 'VISITA' ? [] : protegidosDe(s.tipo))

/** "Terminar aquí": lo que falta después del ejercicio actual queda fuera; la sesión se cierra con lo hecho y el cierre es de 5 min */
export function terminarAqui(s: Sesion, lista: Ejercicio[], indice: number): Sesion {
  const fuera = lista.slice(indice + 1).map((e) => e.id).filter((id) => !s.recortados?.includes(id))
  return { ...s, terminoAqui: true, recortados: [...(s.recortados ?? []), ...fuera] }
}

/** Series hechas en esta sesión del ejercicio base (cuentan aunque se hayan hecho en una alternativa) */
export function hechosDe(sets: SetLog[], sesionId: string, baseId: string): SetLog[] {
  return sets.filter((s) => s.sessionId === sesionId && s.ejercicioBaseId === baseId).sort((a, b) => a.hora - b.hora)
}
