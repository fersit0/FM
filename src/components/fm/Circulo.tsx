import type { CSSProperties, ReactNode } from 'react'

/**
 * 4. El círculo: elemento firma, plano, uno por pantalla.
 * `d` en px, centro en (cx, cy) en px del contenedor. Anima tamaño y posición en 500 ms salvo `continuo`.
 */
export function Circulo({ d, cx, cy, continuo = false, children, className = '' }: { d: number; cx: number; cy: number; continuo?: boolean; children?: ReactNode; className?: string }) {
  const style: CSSProperties = { width: d, height: d, left: cx, top: cy }
  return (
    <div className={`circulo ${continuo ? 'sin-transicion' : ''} ${className}`} style={style} aria-hidden={children ? undefined : true}>
      {children}
    </div>
  )
}

/** Ancho y alto de la ventana, para las proporciones de la sección 4 */
export function medidas(): { W: number; H: number } {
  return { W: Math.min(window.innerWidth, 520), H: window.innerHeight }
}
