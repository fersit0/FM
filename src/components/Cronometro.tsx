import { useEffect, useState } from 'react'
import { formatoDuracion } from '../logic/fechas'

/** Cuenta regresiva grande en monoespaciada. Solo muestra; la lógica de tiempo la lleva quien lo usa. */
export function CuentaRegresiva({ fin, onTerminar, grande = true }: { fin: number; onTerminar?: () => void; grande?: boolean }) {
  const [restante, setRestante] = useState(() => fin - Date.now())
  useEffect(() => {
    let avisado = false
    const tick = () => {
      const r = fin - Date.now()
      setRestante(r)
      if (r <= 0 && !avisado) {
        avisado = true
        onTerminar?.()
      }
    }
    tick()
    const id = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [fin, onTerminar])
  return <span className={grande ? 'numero-grande' : 'numero'}>{formatoDuracion(Math.max(0, restante))}</span>
}

/** Tiempo transcurrido desde un instante */
export function Transcurrido({ desde }: { desde: number }) {
  const [t, setT] = useState(() => Date.now() - desde)
  useEffect(() => {
    const id = setInterval(() => setT(Date.now() - desde), 1000)
    return () => clearInterval(id)
  }, [desde])
  return <span className="numero">{formatoDuracion(t)}</span>
}
