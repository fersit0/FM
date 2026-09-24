import { useRef } from 'react'

/** 7.4 Stepper de reps: cápsula capa-2, botones 56×56, mantener repite cada 120 ms tras 400 ms. */
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

  return (
    <div className="fm-stepper" role="group" aria-label={unidad}>
      <button className="fm-stepper-boton" aria-label="Menos" onPointerDown={(e) => { e.preventDefault(); empezar(-1) }} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar}>
        <svg className="fm-icono" viewBox="0 0 22 22"><path d="M5 11h12" /></svg>
      </button>
      <div className="fm-stepper-cifra" aria-live="polite">
        <span className="cifra-grande">{valor}</span>
        <span className="unidad">{unidad}</span>
      </div>
      <button className="fm-stepper-boton" aria-label="Más" onPointerDown={(e) => { e.preventDefault(); empezar(1) }} onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={soltar}>
        <svg className="fm-icono" viewBox="0 0 22 22"><path d="M5 11h12M11 5v12" /></svg>
      </button>
    </div>
  )
}
