import { useEffect, type ReactNode } from 'react'

/** 6.7 Hoja: sube desde abajo, dos alturas, capa-1, radio 12, asa 36×5. */
export function Hoja({ abierta, titulo, altura = 'media', onCerrar, children }: { abierta: boolean; titulo?: string; altura?: 'media' | 'completa'; onCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!abierta) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierta, onCerrar])
  return (
    <div className={`fm-hoja-fondo ${abierta ? 'abierta' : ''}`} onClick={onCerrar} aria-hidden={!abierta}>
      <section className={`fm-hoja ${altura}`} role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="fm-hoja-asa" aria-hidden="true" />
        {titulo && <h2 className="titulo">{titulo}</h2>}
        <div className="fm-hoja-cuerpo">{children}</div>
      </section>
    </div>
  )
}
