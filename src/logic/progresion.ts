// Registro y progresión (sección 8 del brief). Puro, sin React.
import type { SetLog } from '../data/tipos'

export type Sugerencia = 'inicial' | 'subir' | 'repetir' | 'bajar'

export interface ResultadoSugerencia {
  tipo: Sugerencia
  /** peso a precargar (null si nunca se ha hecho) */
  peso: number | null
  texto: string
}

/** Agrupa los sets de un ejercicio (o alternativa) por sesión, en orden cronológico */
export function porSesion(logs: SetLog[], exerciseId: string): SetLog[][] {
  const mapa = new Map<string, SetLog[]>()
  for (const l of logs) {
    if (l.exerciseId !== exerciseId) continue
    if (!mapa.has(l.sessionId)) mapa.set(l.sessionId, [])
    mapa.get(l.sessionId)!.push(l)
  }
  const grupos = [...mapa.values()]
  for (const g of grupos) g.sort((a, b) => a.numSerie - b.numSerie)
  grupos.sort((a, b) => a[0].hora - b[0].hora)
  return grupos
}

function pesoDe(sets: SetLog[]): number | null {
  const conPeso = sets.filter((s) => s.pesoKg !== null)
  if (conPeso.length === 0) return null
  return Math.max(...conPeso.map((s) => s.pesoKg as number))
}

function repsTotal(sets: SetLog[]): number {
  return sets.reduce((acc, s) => acc + s.reps, 0)
}

/**
 * Doble progresión:
 * - Sin historial: peso inicial lo pone el usuario.
 * - Última vez tope del rango en todas las series: subir.
 * - Dos sesiones seguidas bajaron las reps con el mismo peso: bajar un escalón.
 * - Si no: repetir peso.
 */
export function sugerirPeso(
  logs: SetLog[],
  exerciseId: string,
  repsMax: number,
  modo: 'peso' | 'tiempo' | 'corporal' = 'peso',
): ResultadoSugerencia {
  const sesiones = porSesion(logs, exerciseId)
  if (sesiones.length === 0) {
    return {
      tipo: 'inicial',
      peso: null,
      texto: modo === 'peso'
        ? 'Primera vez. Elige un peso con el que el tope salga con 2 guardadas. Si dudas, más ligero.'
        : 'Primera vez.',
    }
  }
  const ultima = sesiones[sesiones.length - 1]
  const peso = pesoDe(ultima)

  if (modo !== 'peso') {
    return { tipo: 'repetir', peso: null, texto: 'Mismo trabajo que la última vez.' }
  }

  const todasAlTope = ultima.every((s) => s.reps >= repsMax)
  if (todasAlTope) {
    return {
      tipo: 'subir',
      peso,
      texto: `La última vez llegaste al tope en todas. Sube: siguiente par o siguiente placa.`,
    }
  }

  if (sesiones.length >= 3) {
    const [s1, s2, s3] = sesiones.slice(-3)
    const mismoPeso = pesoDe(s1) === peso && pesoDe(s2) === peso && peso !== null
    if (mismoPeso && repsTotal(s2) < repsTotal(s1) && repsTotal(s3) < repsTotal(s2)) {
      return { tipo: 'bajar', peso, texto: 'Baja un escalón.' }
    }
  }

  return { tipo: 'repetir', peso, texto: 'Repite el peso.' }
}

/** Peso máximo por sesión de un ejercicio, últimas N sesiones */
export function maximosPorSesion(logs: SetLog[], exerciseId: string, n = 12): { fecha: string; peso: number; reps: number }[] {
  return porSesion(logs, exerciseId)
    .slice(-n)
    .map((sets) => ({ fecha: sets[0].fecha, peso: pesoDe(sets) ?? 0, reps: repsTotal(sets) }))
}

/** Para el resumen: ejercicios donde el peso máximo de esta sesión superó el de la anterior */
export function subioDePeso(logs: SetLog[], exerciseId: string, sessionId: string): boolean {
  const sesiones = porSesion(logs, exerciseId)
  const i = sesiones.findIndex((s) => s[0].sessionId === sessionId)
  if (i <= 0) return false
  const actual = pesoDe(sesiones[i])
  const previo = pesoDe(sesiones[i - 1])
  return actual !== null && previo !== null && actual > previo
}
