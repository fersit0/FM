import type { CSSProperties, ReactNode } from 'react'

/**
 * 4. El círculo: plano, uno por pantalla. Vive dentro del espacio flexible del medio,
 * con el diámetro del spec pero nunca mayor que el espacio disponible.
 */
export function Circulo({ d, continuo = false, children, className = '', style }: { d: number; continuo?: boolean; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`circulo ${continuo ? 'sin-transicion' : ''} ${className}`} style={{ width: d, height: d, ...style }} aria-hidden={children ? undefined : true}>
      {children}
    </div>
  )
}
