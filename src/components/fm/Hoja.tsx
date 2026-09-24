import { useEffect, type ReactNode } from 'react'

/** 7.9 Hoja: sube desde abajo, capa-1, radio 24 arriba, asa 36×5. */
export function Hoja({ abierta, titulo, onCerrar, children }: { abierta: boolean; titulo: string; onCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!abierta) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierta, onCerrar])

  return (
    <div className={`fm-hoja-fondo ${abierta ? 'abierta' : ''}`} onClick={onCerrar} aria-hidden={!abierta}>
      <section className="fm-hoja" role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="fm-hoja-asa" aria-hidden="true" />
        <h2 className="titulo-fm">{titulo}</h2>
        <div className="fm-hoja-cuerpo">{children}</div>
      </section>
    </div>
  )
}
