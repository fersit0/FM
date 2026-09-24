import { useEffect, useState } from 'react'

/** Hora real del teléfono, actualizada cada 30 s y al volver a la app */
export function useReloj(): Date {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setAhora(new Date())
    const id = setInterval(tick, 30_000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])
  return ahora
}
