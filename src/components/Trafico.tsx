import type { SemanaHistorial } from '../logic/progreso'
import { posicionEnSemana } from '../logic/progreso'
import { fechaCorta } from '../logic/fechas'

/**
 * Historial como tráfico nocturno: cada semana es una fila de carretera oscura;
 * cada sesión, una luz. Duración = longitud, intensidad = saturación, descanso = espacio.
 * Una semana sin cumplir es un intervalo más largo, no una racha rota.
 */
export function Trafico({ semanas }: { semanas: SemanaHistorial[] }) {
  const ancho = 320
  const izquierda = 44
  const filaAlto = 22
  const alto = semanas.length * filaAlto + 16
  const escala = (ancho - izquierda - 8) / 7

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="trafico" role="img" aria-label="Historial de semanas">
      {/* carriles */}
      {semanas.map((w, i) => {
        const y = 8 + i * filaAlto + filaAlto / 2
        return (
          <g key={w.inicio} className={w.actual ? 'trafico-actual' : ''}>
            <text x={izquierda - 8} y={y + 4} textAnchor="end" className="trafico-fecha">{fechaCorta(w.inicio)}</text>
            <line x1={izquierda} x2={ancho - 8} y1={y} y2={y} className="trafico-carril" />
            {w.sesiones.map((s) => {
              const { x, minutos } = posicionEnSemana(s)
              const largo = Math.max(6, Math.min(escala * 0.9, (minutos / 75) * escala * 0.9))
              const px = izquierda + x * escala
              const clase = s.tipo === 'FRIDA' ? 'luz-olivo' : s.version === 'corta' ? 'luz-ambar' : s.version === 'bonus' ? 'luz-pico' : 'luz-naranja'
              return <rect key={s.id} x={px} y={y - 4} width={largo} height={8} rx={4} className={`trafico-luz ${clase}`} />
            })}
          </g>
        )
      })}
    </svg>
  )
}
