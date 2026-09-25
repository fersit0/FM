import { useLayoutEffect, useRef, useState } from 'react'

/** Título del ejercicio: baja de 34 a 26 pt hasta caber en dos líneas, sin cortarse. */
export function TituloAjustable({ texto }: { texto: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [tamano, setTamano] = useState(34)
  useLayoutEffect(() => {
    setTamano(34)
  }, [texto])
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const lineas = Math.round(el.scrollHeight / (tamano * 1.05))
    if (lineas > 2 && tamano > 26) setTamano((t) => Math.max(26, t - 1))
  }, [tamano, texto])
  return <h1 ref={ref} className="t-ejercicio" style={{ fontSize: tamano }}>{texto}</h1>
}
