import { useLayoutEffect, useRef, useState } from 'react'

/**
 * 7.2 Escala de sintonía: cada serie es una marca; los grupos son ejercicios.
 * `hechas` = series terminadas en total; la aguja está en la siguiente.
 */
export function Escala({ grupos, hechas }: { grupos: number[]; hechas: number }) {
  const total = grupos.reduce((a, b) => a + b, 0)
  const actual = Math.min(hechas, total - 1)
  const terminada = hechas >= total
  const contenedor = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)

  useLayoutEffect(() => {
    const c = contenedor.current
    if (!c) return
    const medir = () => {
      const marca = c.querySelectorAll<HTMLElement>('.fm-marca')[actual]
      if (!marca) return
      const a = c.getBoundingClientRect()
      const b = marca.getBoundingClientRect()
      setX(b.left - a.left + b.width / 2 - 1.5)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(c)
    return () => ro.disconnect()
  }, [actual, grupos.join(',')])

  let i = 0
  return (
    <div className="fm-escala" ref={contenedor} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hechas} aria-label="Series de la sesión">
      {grupos.map((n, g) => (
        <div key={g} className="fm-escala-grupo">
          {Array.from({ length: n }, () => {
            const k = i++
            return <span key={k} className={`fm-marca ${k < hechas ? 'hecha' : ''} ${k === actual && !terminada ? 'actual' : ''}`} />
          })}
        </div>
      ))}
      <span className="fm-aguja" style={{ transform: `translateX(${x}px)`, opacity: terminada ? 0 : 1 }} aria-hidden="true" />
    </div>
  )
}
