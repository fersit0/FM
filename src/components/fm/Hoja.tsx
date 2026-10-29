import { useEffect, type ReactNode } from 'react'
import { BotonTexto } from './Botones'

/** Hoja tinta que sube en 420 ms. Dos alturas. */
/** `pie`: lo que va fijo abajo, fuera de lo que se recorre (el botón principal siempre completo y visible) */
export function Hoja({ abierta, titulo, altura = 'media', onCerrar, children, pie }: { abierta: boolean; titulo?: string; altura?: 'media' | 'completa'; onCerrar: () => void; children: ReactNode; pie?: ReactNode }) {
  useEffect(() => {
    if (!abierta) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierta, onCerrar])
  return (
    <div className={`hoja-fondo ${abierta ? 'abierta' : ''}`} onClick={onCerrar} aria-hidden={!abierta}>
      <section className={`hoja ${altura}`} role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        {altura === 'completa' ? <BotonTexto className="hoja-cerrar" onClick={onCerrar}>Cerrar</BotonTexto> : <div className="hoja-asa" aria-hidden="true" />}
        {titulo && <h2 className="t-ejercicio">{titulo}</h2>}
        <div className="hoja-cuerpo">{children}</div>
        {pie && <div className="hoja-pie">{pie}</div>}
      </section>
    </div>
  )
}
