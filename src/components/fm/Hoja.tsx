import { useEffect, useRef, type ReactNode } from 'react'
import { BotonTexto } from './Botones'

/** Hoja tinta que sube en 420 ms. Dos alturas. */
/** `pie`: lo que va fijo abajo, fuera de lo que se recorre (el botón principal siempre completo y visible) */
export function Hoja({ abierta, titulo, altura = 'media', onCerrar, children, pie }: { abierta: boolean; titulo?: string; altura?: 'media' | 'completa'; onCerrar: () => void; children: ReactNode; pie?: ReactNode }) {
  const hoja = useRef<HTMLElement>(null)
  const cerrar = useRef(onCerrar)
  cerrar.current = onCerrar
  useEffect(() => {
    if (!abierta) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierta, onCerrar])

  // La que tiene asa se cierra deslizándola hacia abajo, como en iOS: desde cualquier parte si lo de adentro está hasta
  // arriba. Si se suelta antes de un cuarto de su alto y sin aventarla, regresa a su lugar.
  useEffect(() => {
    const el = hoja.current
    const fondo = el?.parentElement
    if (!abierta || altura !== 'media' || !el || !fondo) return
    let y0 = 0, dy = 0, yAntes = 0, tAntes = 0, velocidad = 0, puede = false, arrastrando = false
    const enSuLugar = () => { el.style.transform = ''; el.style.transition = '' }
    const inicio = (e: TouchEvent) => {
      arrastrando = false
      if (e.touches.length !== 1) { puede = false; return }
      const cuerpo = el.querySelector('.hoja-cuerpo')
      puede = !cuerpo || !cuerpo.contains(e.target as Node) || cuerpo.scrollTop <= 0
      y0 = yAntes = e.touches[0].clientY
      tAntes = performance.now()
      dy = velocidad = 0
    }
    const mueve = (e: TouchEvent) => {
      if (!puede) return
      const y = e.touches[0].clientY
      dy = y - y0
      // hacia arriba antes de arrastrar: es para recorrer lo de adentro
      if (!arrastrando && dy < 0) { puede = false; return }
      // hacia abajo la hoja es del dedo (y no de Safari, que querría recorrer o rebotar)
      e.preventDefault()
      const t = performance.now()
      velocidad = (y - yAntes) / Math.max(1, t - tAntes)
      yAntes = y
      tAntes = t
      if (!arrastrando && dy < 4) return
      if (!arrastrando) {
        arrastrando = true
        el.style.transition = 'none'
      }
      el.style.transform = `translateY(${dy}px)`
    }
    const fin = () => {
      puede = false
      if (!arrastrando) return
      arrastrando = false
      // el toque que arrastró no es un toque sobre lo que quedaba bajo el dedo, ni sobre la pantalla de atrás
      window.addEventListener('click', sinClic, true)
      setTimeout(() => window.removeEventListener('click', sinClic, true), 400)
      if (dy > el.offsetHeight / 4 || (velocidad > 0.5 && dy > 24)) {
        // se queda donde la dejó el dedo con sus transiciones de vuelta; al cerrarse, sigue de ahí hacia abajo
        el.style.transition = ''
        cerrar.current()
        requestAnimationFrame(() => requestAnimationFrame(() => { if (fondo.classList.contains('abierta')) enSuLugar() }))
      } else enSuLugar()
    }
    const sinClic = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault() }
    el.addEventListener('touchstart', inicio, { passive: true })
    el.addEventListener('touchmove', mueve, { passive: false })
    el.addEventListener('touchend', fin)
    el.addEventListener('touchcancel', fin)
    return () => {
      el.removeEventListener('touchstart', inicio)
      el.removeEventListener('touchmove', mueve)
      el.removeEventListener('touchend', fin)
      el.removeEventListener('touchcancel', fin)
      enSuLugar()
    }
  }, [abierta, altura])

  return (
    <div className={`hoja-fondo ${abierta ? 'abierta' : ''}`} onClick={onCerrar} aria-hidden={!abierta}>
      <section ref={hoja} className={`hoja ${altura}`} role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        {altura === 'completa' ? <BotonTexto className="hoja-cerrar" onClick={onCerrar}>Cerrar</BotonTexto> : <div className="hoja-asa" aria-hidden="true" />}
        {titulo && <h2 className="t-ejercicio">{titulo}</h2>}
        <div className="hoja-cuerpo">{children}</div>
        {/* aquí va el aviso de Deshacer de lo que se haga en la hoja: ocupa su lugar y no tapa nada */}
        <div className="aviso-lugar" />
        {pie && <div className="hoja-pie">{pie}</div>}
      </section>
    </div>
  )
}
