import { useCallback, useState } from 'react'

/** Estado de la sesión en curso, en localStorage para sobrevivir cierres de Safari */
export interface SesionActiva {
  sessionId: string
  paso: number
  /** calentamiento o cierre: cuándo termina (ms). Se calcula por hora de término, nunca sumando segundos. */
  timerFin?: number
  timerSeg?: number
  /** descanso: cuándo termina (ms) */
  descansoFin?: number
  descansoSeg?: number
  /** el descanso en curso son los 15 s para cambiarse de ejercicio dentro de un par */
  cambio?: boolean
  /** se pidió aviso con Atajos para este descanso: no duplicar el sonido */
  avisado?: boolean
  /** peso y reps que se estaban ajustando, para retomar exacto si iOS cierra la app */
  borrador?: { itemId: string; peso: number; reps: number; unidad: 'kg' | 'lb' }
  /** el usuario salió con "Seguir después": no se abre sola al volver */
  pausada?: boolean
}

const CLAVE = 'gym-app:sesion-activa'

function leer(): SesionActiva | null {
  try {
    const raw = localStorage.getItem(CLAVE)
    return raw ? (JSON.parse(raw) as SesionActiva) : null
  } catch {
    return null
  }
}

export function useSesionActiva() {
  const [activa, setActivaState] = useState<SesionActiva | null>(leer)
  const setActiva = useCallback((a: SesionActiva | null) => {
    if (a) localStorage.setItem(CLAVE, JSON.stringify(a))
    else localStorage.removeItem(CLAVE)
    setActivaState(a)
  }, [])
  return { activa, setActiva }
}
