import type { SemanaHistorial } from '../logic/progreso'
import { posicionEnSemana } from '../logic/progreso'
import { fechaCorta } from '../logic/fechas'

/**
 * Señal (8.5): cada semana es una banda; cada sesión, un punto de luz.
 * Duración = largo, intensidad = saturación (ámbar a rojo), descanso = espacio.
 */
export function Senal({ semanas }: { semanas: SemanaHistorial[] }) {
  const ancho = 350
  const izquierda = 44
  const filaAlto = 24
  const alto = semanas.length * filaAlto + 8
  const escala = (ancho - izquierda - 4) / 7
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="fm-senal" role="img" aria-label="Señal de las últimas semanas">
      {semanas.map((w, i) => {
        const y = 4 + i * filaAlto + filaAlto / 2
        return (
          <g key={w.inicio}>
            <text x={izquierda - 8} y={y + 3.5} textAnchor="end" className="fm-senal-fecha">{fechaCorta(w.inicio)}</text>
            <line x1={izquierda} x2={ancho - 4} y1={y} y2={y} className="fm-senal-banda" />
            {w.sesiones.map((s) => {
              const { x, minutos } = posicionEnSemana(s)
              const largo = Math.max(5, Math.min(escala * 0.9, (minutos / 75) * escala * 0.9))
              const clase = s.tipo === 'FRIDA' ? 'olivo' : s.version === 'corta' ? 'ambar' : s.version === 'bonus' ? 'rojo' : 'naranja'
              return <rect key={s.id} x={izquierda + x * escala} y={y - 2.5} width={largo} height={5} rx={2.5} className={`fm-senal-luz ${clase}`} />
            })}
          </g>
        )
      })}
    </svg>
  )
}
