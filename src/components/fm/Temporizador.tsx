import { useEffect, useRef } from 'react'
import { useCuentaRegresiva, mmss } from '../../hooks/useCuentaRegresiva'
import { BotonSecundario } from './Botones'

/** Temporizador por hora de término (9.1): calcula fin - ahora en cada frame y al volver a la app. */
export function Temporizador({ fin, total, onFin, onMas, onMenos, onSaltar, onAvisar }: {
  fin: number
  total: number
  onFin: () => void
  onMas?: () => void
  onMenos?: () => void
  onSaltar?: () => void
  onAvisar?: () => void
}) {
  const restante = useCuentaRegresiva(fin)
  const avisado = useRef(false)
  useEffect(() => {
    avisado.current = false
  }, [fin])
  useEffect(() => {
    if (restante <= 0 && !avisado.current) {
      avisado.current = true
      onFin()
    }
  }, [restante, onFin])

  const r = Math.max(0, restante)
  const tarde = restante < -3000
  return (
    <div className="fm-temporizador">
      {tarde ? (
        <span className="cuerpo" style={{ color: 'var(--crema-2)' }}>Terminó hace {mmss(-restante)}.</span>
      ) : (
        <span className="cifra-heroe fm-temporizador-cifra">{restante <= 0 ? 'Va' : mmss(r)}</span>
      )}
      <div className="fm-temporizador-linea" aria-hidden="true">
        <div className="fm-temporizador-restante" style={{ transform: `scaleX(${Math.min(1, r / (total * 1000))})` }} />
      </div>
      <div className="fm-temporizador-botones">
        {onMenos && <BotonSecundario onClick={onMenos}>−15 s</BotonSecundario>}
        {onMas && <BotonSecundario onClick={onMas}>+15 s</BotonSecundario>}
        {onAvisar && <BotonSecundario onClick={onAvisar}>Avísame</BotonSecundario>}
        {onSaltar && <BotonSecundario onClick={onSaltar}>Saltar</BotonSecundario>}
      </div>
    </div>
  )
}
