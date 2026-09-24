import { useEffect } from 'react'

/** Mantiene la pantalla encendida mientras el componente está montado (Wake Lock API) */
export function useWakeLock(activo: boolean): void {
  useEffect(() => {
    if (!activo || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelado = false
    const pedir = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch {
        /* sin permiso o batería baja */
      }
    }
    const alVolver = () => {
      if (document.visibilityState === 'visible' && !cancelado) pedir()
    }
    pedir()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', alVolver)
      lock?.release().catch(() => {})
    }
  }, [activo])
}
