import type { ReactNode } from 'react'

/** 5. Botón principal: 0.88 W, 64 pt, cápsula; colores por pantalla. */
export function BotonPrincipal({ children, onClick, disabled, piedra = false }: { children: ReactNode; onClick?: () => void; disabled?: boolean; piedra?: boolean }) {
  return <button className={`boton ${piedra ? 'piedra' : ''}`} onClick={onClick} disabled={disabled}>{children}</button>
}

/** Botón secundario en cápsula de contorno de 2 pt */
export function BotonContorno({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button className="boton contorno" onClick={onClick}>{children}</button>
}

/** Acción menor: texto de 17 pt al 60% */
export function BotonTexto({ children, onClick, subrayado = false, className = '' }: { children: ReactNode; onClick?: () => void; subrayado?: boolean; className?: string }) {
  return <button className={`secundario ${subrayado ? 'subrayado' : ''} ${className}`} onClick={onClick}>{children}</button>
}
