import { useEffect, useState } from 'react'

/**
 * Cuenta regresiva que nunca falla (9.1): calcula `fin - Date.now()` cuatro veces por segundo y al volver a la app.
 * Nada suma segundos, así que bloquear la pantalla o cambiar de app no la desfasa. Devuelve los ms que faltan (negativo si ya pasó).
 */
export function useCuentaRegresiva(fin: number | undefined): number {
  const [restante, setRestante] = useState(() => (fin === undefined ? 0 : fin - Date.now()))
  useEffect(() => {
    if (fin === undefined) return
    let id = 0
    const tick = () => setRestante(fin - Date.now())
    const arrancar = () => { clearInterval(id); tick(); if (document.visibilityState === 'visible') id = window.setInterval(tick, 250) }
    const alVolver = () => arrancar()
    arrancar()
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('focus', alVolver)
    window.addEventListener('pageshow', alVolver)
    return () => {
      clearInterval(id)
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
