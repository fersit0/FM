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
  /** se pidió aviso con Atajos para este descanso: no duplicar el sonido */
  avisado?: boolean
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
