import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Dónde va el aviso: en la hoja abierta de más arriba, si hay; si no, en el lugar que cada pantalla le guarda
 * (`<div className="aviso-lugar de-pantalla" />`). Ocupa su propio espacio y nunca queda encima de nada.
 */
function lugar(): Element | null {
  const hojas = document.querySelectorAll('.hoja-fondo.abierta .aviso-lugar')
  return hojas[hojas.length - 1] ?? document.querySelector('.aviso-lugar.de-pantalla')
}

/** Aviso de 5 segundos con opción de deshacer. */
export function Deshacer({ texto, onDeshacer, onCerrar, ms = 5000, clave }: { texto: string; onDeshacer: () => void; onCerrar: () => void; ms?: number; clave?: unknown }) {
  // un aviso nuevo cuenta sus 5 segundos desde cero, no los que le quedaban al anterior, aunque diga lo mismo ("Serie borrada." dos veces):
  // `clave` es el objeto del aviso, que cambia con cada aviso nuevo y no con cada render
  useEffect(() => {
    const id = setTimeout(onCerrar, ms)
    return () => clearTimeout(id)
  }, [onCerrar, ms, texto, clave])
  // se vuelve a buscar el lugar en cada render: si se cierra la hoja donde estaba, pasa al de la pantalla
  const [destino, setDestino] = useState<Element | null>(null)
  useLayoutEffect(() => {
    const l = lugar()
    if (l !== destino) setDestino(l)
  })
  // la pantalla sabe que tiene aviso (data-con-aviso) y le hace lugar; con un atributo, Safari lo aplica al momento (con :has no)
  useLayoutEffect(() => {
    const pantalla = destino && !destino.closest('.hoja') ? destino.closest('.pantalla') : null
    if (!pantalla) return
    pantalla.setAttribute('data-con-aviso', '')
    return () => pantalla.removeAttribute('data-con-aviso')
  }, [destino])
  // que se vea: en Hoy la pantalla baja hasta el fondo (el aviso va arriba de los botones); en lo demás, lo justo
  const ref = useRef<HTMLDivElement>(null)
  // Cuando el aviso se va, su lugar se queda apartado con el mismo alto: nada brinca a media serie ni en Hoy (en el
  // iPhone el nombre, "Técnica", − y + subían hasta 63 pt y el toque caía donde ya no estaba el botón). La sesión lo
  // suelta al cambiar de paso, de serie o de descanso (le cambia la `key` al lugar); Hoy, al salir de la pantalla.
  // En una hoja no hace falta: ahí el aviso va abajo de todo y no empuja nada.
  useLayoutEffect(() => {
    if (!destino || destino.closest('.hoja') || !ref.current || !(destino instanceof HTMLElement)) return
    destino.style.minHeight = `${ref.current.offsetHeight}px`
    destino.setAttribute('data-apartado', '')
  })
  useLayoutEffect(() => {
    if (!ref.current || !destino) return
    const pantalla = destino.hasAttribute('data-al-fondo') ? destino.closest('.pantalla') : null
    if (pantalla) pantalla.scrollTop = pantalla.scrollHeight
    else ref.current.scrollIntoView?.({ block: 'nearest' })
  }, [destino, clave])
  const aviso = (
    <div className={`deshacer${destino ? '' : ' flotante'}`} role="status" ref={ref}>
      <span>{texto}</span>
      <button onClick={onDeshacer}>Deshacer</button>
    </div>
  )
  return destino ? createPortal(aviso, destino) : aviso
}
