import { Fragment, useLayoutEffect, useRef } from 'react'

/**
 * Una línea de datos separados por " · " (la de arriba de Hoy, la de la hora en la sesión). Ninguna pieza se parte entre
 * renglones y el "·" que quedaría colgando al final de un renglón no se ve (ACOMODO-FM.md, 18).
 */
export function LineaPiezas({ piezas, className }: { piezas: string[]; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const llave = piezas.join('|')
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // el "·" va dentro de la pieza de antes (que no se parte): si la siguiente baja de renglón, el punto queda al final y se esconde
    const acomodar = () => {
      const ps = [...el.querySelectorAll<HTMLElement>(':scope > .pieza')]
      ps.forEach((p, i) => {
        const sep = p.querySelector<HTMLElement>(':scope > .sep')
        const sig = ps[i + 1]
        if (sep && sig) sep.style.visibility = sig.getBoundingClientRect().top > p.getBoundingClientRect().top + 2 ? 'hidden' : ''
      })
    }
    acomodar()
    const ro = new ResizeObserver(acomodar)
    ro.observe(el)
    return () => ro.disconnect()
  }, [llave])
  const texto = piezas.map((p, i) => (i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p))
  return (
    <p className={className} ref={ref}>
      {texto.map((p, i) => <Fragment key={i}>{i > 0 && ' '}<span className="pieza sin-partir">{p}{i < texto.length - 1 && <span className="sep"> ·</span>}</span></Fragment>)}
    </p>
  )
}
