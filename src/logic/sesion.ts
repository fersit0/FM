// Orden de la sesión en marcha (RUTINA-FINAL.md, 3): "Ocupado: después" y el recorte en el camino. Puro, sin React.
import type { Ejercicio, Sesion, SetLog } from '../data/tipos'
import { listaDe, RECORTE_ORDEN } from '../data/ejercicios'
import { segundosDeEjercicio, SEG_ENTRE_EJERCICIOS, SEG_CAMBIO_ZONA } from './duracion'

/** Lista de ejercicios de una sesión en su orden actual: el guardado (si "Ocupado: después" lo cambió) sin los recortados */
export function listaDeSesion(s: Pick<Sesion, 'tipo' | 'version' | 'pierna' | 'orden' | 'recortados'>): Ejercicio[] {
  if (s.tipo === 'FRIDA') return []
  const base = listaDe(s.tipo, s.version, !!s.pierna)
  const orden = s.orden ?? base.map((e) => e.id)
  const lista = orden.map((id) => base.find((e) => e.id === id)).filter((e): e is Ejercicio => !!e)
  for (const e of base) if (!lista.includes(e)) lista.push(e)
  return lista.filter((e) => !s.recortados?.includes(e.id))
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

/**
 * Recorte en el camino: si lo que falta no cabe antes del tope, quita de los pendientes (después del actual) en este
 * orden: abdomen, brazos, press militar o aperturas. Nunca el press principal, el jalón, el remo ni los laterales.
 * Devuelve los ids a quitar (además de los ya quitados) hasta que quepa, o todo lo quitable si ni así.
 */
export function recortar(lista: Ejercicio[], indice: number, seriesHechasActual: number, segundosDisponibles: number, ligera = false): string[] {
  const quitar: string[] = []
  let actual = lista
  const cabe = () => segundosRestantes(actual, indice, seriesHechasActual, ligera) <= segundosDisponibles
  if (cabe()) return quitar
  for (const grupo of RECORTE_ORDEN) {
    // dentro del grupo, primero el que está más al final
    const candidatos = actual.map((e, i) => ({ e, i })).filter(({ e, i }) => i > indice && grupo.includes(e.id)).reverse()
    for (const { e } of candidatos) {
      quitar.push(e.id)
      actual = actual.filter((x) => x.id !== e.id)
      if (cabe()) return quitar
    }
  }
  return quitar
}

/** Series hechas en esta sesión del ejercicio base (cuentan aunque se hayan hecho en una alternativa) */
export function hechosDe(sets: SetLog[], sesionId: string, baseId: string): SetLog[] {
  return sets.filter((s) => s.sessionId === sesionId && s.ejercicioBaseId === baseId).sort((a, b) => a.hora - b.hora)
}
