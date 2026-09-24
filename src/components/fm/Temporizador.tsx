import { useCallback, useEffect, useState } from 'react'
import { formatoDuracion } from '../../logic/fechas'
import { BotonSecundario } from './Botones'

/** 7.7 Temporizador de descanso: cuenta regresiva mono 64, línea que se vacía, +15 s y Saltar. Va dentro del módulo. */
export function Temporizador({ fin, total, onFin, onMas, onSaltar }: { fin: number; total: number; onFin: () => void; onMas: () => void; onSaltar: () => void }) {
  const [restante, setRestante] = useState(() => fin - Date.now())
  const avisar = useCallback(onFin, [onFin])

  useEffect(() => {
    let avisado = false
    const tick = () => {
      const r = fin - Date.now()
      setRestante(r)
      if (r <= 0 && !avisado) {
        avisado = true
        avisar()
      }
    }
    tick()
    const id = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [fin, avisar])

  const r = Math.max(0, restante)
  return (
    <div className="fm-temporizador">
      <span className="tiempo" aria-live="off">{formatoDuracion(r)}</span>
      <div className="fm-temporizador-linea" aria-hidden="true">
        <div className="fm-temporizador-restante" style={{ transform: `scaleX(${Math.min(1, r / (total * 1000))})` }} />
      </div>
      <div className="fm-temporizador-botones">
        <BotonSecundario capsula onClick={onMas}>+15 s</BotonSecundario>
        <BotonSecundario onClick={onSaltar}>Saltar</BotonSecundario>
      </div>
    </div>
  )
}
