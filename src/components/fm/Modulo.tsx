import type { ReactNode } from 'react'

/** 7.1 Módulo encendido: acrílico iluminado desde dentro con --estado. Uno por pantalla. */
export function Modulo({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="fm-modulo-sitio">
      <section className={`fm-modulo ${className}`}>{children}</section>
    </div>
  )
}
