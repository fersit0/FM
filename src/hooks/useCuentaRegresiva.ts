import { useEffect, useState } from 'react'

/**
 * Cuenta regresiva que nunca falla (9.1): calcula `fin - Date.now()` en cada frame
 * y al volver a la app. Nada suma segundos. Devuelve los ms que faltan (negativo si ya pasó).
 */
export function useCuentaRegresiva(fin: number | undefined): number {
  const [restante, setRestante] = useState(() => (fin === undefined ? 0 : fin - Date.now()))
  useEffect(() => {
    if (fin === undefined) return
    let id = 0
    let vivo = true
    const tick = () => {
      if (!vivo) return
      setRestante(fin - Date.now())
      if (document.visibilityState === 'visible') id = requestAnimationFrame(tick)
    }
    const alVolver = () => {
      cancelAnimationFrame(id)
      tick()
    }
    tick()
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('focus', alVolver)
    window.addEventListener('pageshow', alVolver)
    return () => {
      vivo = false
      cancelAnimationFrame(id)
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener('focus', alVolver)
      window.removeEventListener('pageshow', alVolver)
    }
  }, [fin])
  return restante
}

/** m:ss a partir de ms, sin decimales */
export function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
