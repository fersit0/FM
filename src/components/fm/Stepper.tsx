import { useRef } from 'react'

/** 6.3 Stepper: tres piezas sueltas, botones circulares de 56, cifra media al centro. Mantener repite. */
export function Stepper({ valor, onChange, min = 0, max = 99, unidad = 'reps' }: { valor: number; onChange: (v: number) => void; min?: number; max?: number; unidad?: string }) {
  const timer = useRef<number | null>(null)
  const repetidor = useRef<number | null>(null)
  const actual = useRef(valor)
  actual.current = valor

  function cambiar(d: number) {
    const v = Math.max(min, Math.min(max, actual.current + d))
    actual.current = v
    onChange(v)
  }
  function empezar(d: number) {
    cambiar(d)
    timer.current = window.setTimeout(() => {
      repetidor.current = window.setInterval(() => cambiar(d), 120)
    }, 400)
  }
  function soltar() {
    if (timer.current) clearTimeout(timer.current)
    if (repetidor.current) clearInterval(repetidor.current)
    timer.current = repetidor.current = null
  }
  const props = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); empezar(d) },
    onPointerUp: soltar, onPointerCancel: soltar, onPointerLeave: soltar,
  })

  return (
    <div className="fm-stepper" role="group" aria-label={unidad}>
      <button className="fm-stepper-boton" aria-label="Menos" {...props(-1)}>
        <svg className="fm-icono" viewBox="0 0 24 24"><path d="M6 12h12" /></svg>
      </button>
      <div className="fm-stepper-cifra" aria-live="polite">
        <span key={valor} className="cifra-media cifra-cambio">{valor}</span>
        <span className="unidad">{unidad}</span>
      </div>
      <button className="fm-stepper-boton" aria-label="Más" {...props(1)}>
        <svg className="fm-icono" viewBox="0 0 24 24"><path d="M6 12h12M12 6v12" /></svg>
      </button>
    </div>
  )
}
