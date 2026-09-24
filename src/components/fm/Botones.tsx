import type { ReactNode } from 'react'

/** 6.4 Botón principal: 56 px, radio 16, fondo --estado. Dice lo que hace. */
export function BotonPrincipal({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="fm-boton" onClick={onClick} disabled={disabled}>{children}</button>
}

/** 6.5 Botón secundario: texto crema-2, área táctil de 44. */
export function BotonSecundario({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return <button className={`fm-secundario ${className}`} onClick={onClick}>{children}</button>
}
