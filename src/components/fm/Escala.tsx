import { useLayoutEffect, useRef, useState } from 'react'

/**
 * 7.2 Escala de sintonía: cada serie es una marca; los grupos son ejercicios.
 * `hechas[g]` = series terminadas del grupo g; la aguja está en el grupo `actual`, en su siguiente serie.
 */
export function Escala({ grupos, hechas, actual }: { grupos: number[]; hechas: number[]; actual: number }) {
  const total = grupos.reduce((a, b) => a + b, 0)
  const previas = grupos.slice(0, actual).reduce((a, b) => a + b, 0)
  const enGrupo = Math.min(hechas[actual] ?? 0, Math.max(0, (grupos[actual] ?? 1) - 1))
  const indiceAguja = Math.min(total - 1, previas + enGrupo)
  const grupoCompleto = (hechas[actual] ?? 0) >= (grupos[actual] ?? 0)
  const contenedor = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const clave = grupos.join(',')

  useLayoutEffect(() => {
    const c = contenedor.current
    if (!c) return
    const medir = () => {
      const marca = c.querySelectorAll<HTMLElement>('.fm-marca')[indiceAguja]
      if (!marca) return
      const a = c.getBoundingClientRect()
      const b = marca.getBoundingClientRect()
      setX(b.left - a.left + b.width / 2 - 1.5)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(c)
    return () => ro.disconnect()
  }, [indiceAguja, clave])

  let k = 0
  const totalHechas = hechas.reduce((a, b) => a + b, 0)
  return (
    <div className="fm-escala" ref={contenedor} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={totalHechas} aria-label="Series de la sesión">
      {grupos.map((n, g) => (
        <div key={g} className="fm-escala-grupo">
          {Array.from({ length: n }, (_, i) => {
            const idx = k++
            const hecha = i < (hechas[g] ?? 0)
            const esAguja = idx === indiceAguja && !grupoCompleto
            return <span key={idx} className={`fm-marca ${hecha ? 'hecha' : ''} ${esAguja ? 'actual' : ''}`} />
          })}
        </div>
      ))}
      <span className="fm-aguja" style={{ transform: `translateX(${x}px)`, opacity: grupoCompleto ? 0 : 1 }} aria-hidden="true" />
    </div>
  )
}
