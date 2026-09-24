import { useRef } from 'react'

/** 5. Stepper de reps: dos círculos de 64 con − y +, cifra 56/700 al centro y la unidad debajo. */
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
    timer.current = window.setTimeout(() => { repetidor.current = window.setInterval(() => cambiar(d), 120) }, 400)
  }
  function soltar() {
    if (timer.current) clearTimeout(timer.current)
    if (repetidor.current) clearInterval(repetidor.current)
    timer.current = repetidor.current = null
  }
  const props = (d: number) => ({ onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); empezar(d) }, onPointerUp: soltar, onPointerCancel: soltar, onPointerLeave: soltar })
  return (
    <div className="stepper" role="group" aria-label={unidad}>
      <button className="stepper-boton" aria-label="Menos" {...props(-1)}><svg viewBox="0 0 28 28"><path d="M6 14h16" /></svg></button>
      <div className="stepper-cifra" aria-live="polite">
        <span className="t-cifra">{valor}</span>
        <span className="t-unidad">{unidad}</span>
      </div>
      <button className="stepper-boton" aria-label="Más" {...props(1)}><svg viewBox="0 0 28 28"><path d="M6 14h16M14 6v16" /></svg></button>
    </div>
  )
}
