import type { ReactNode } from 'react'

/** 7.5 Botón principal: dice exactamente lo que hace. */
export function BotonPrincipal({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button className="fm-boton" onClick={onClick} disabled={disabled}>{children}</button>
  )
}

/** 7.6 Botón secundario: texto crema-2, o cápsula capa-2 si necesita área. */
export function BotonSecundario({ children, onClick, capsula = false, className = '' }: { children: ReactNode; onClick?: () => void; capsula?: boolean; className?: string }) {
  return (
    <button className={`fm-secundario ${capsula ? 'capsula' : ''} ${className}`} onClick={onClick}>{children}</button>
  )
}
