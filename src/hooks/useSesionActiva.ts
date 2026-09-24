import { useCallback, useState } from 'react'

/** Estado de la sesión en curso, en localStorage para sobrevivir cierres de Safari */
export interface SesionActiva {
  sessionId: string
  paso: number
  /** cronómetro de calentamiento/cierre: cuándo empezó (ms) */
  timerInicio?: number
  /** descanso en curso: cuándo termina (ms) */
  descansoFin?: number
  descansoSeg?: number
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
