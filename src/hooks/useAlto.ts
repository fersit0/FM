import { useLayoutEffect, useRef, useState } from 'react'

/** Alto y ancho disponibles de un contenedor, medidos con ResizeObserver */
export function useAlto<T extends HTMLElement>(): [React.RefObject<T | null>, number, number] {
  const ref = useRef<T | null>(null)
  const [alto, setAlto] = useState(0)
  const [ancho, setAncho] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => { setAlto(el.clientHeight); setAncho(el.clientWidth) }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, alto, ancho]
}
