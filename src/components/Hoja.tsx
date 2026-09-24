import { useEffect, type ReactNode } from 'react'

/** Hoja deslizable desde abajo. Un panel con peso, sin rebote. */
export function Hoja({ abierta, titulo, onCerrar, children }: { abierta: boolean; titulo: string; onCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!abierta) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierta, onCerrar])

  return (
    <div className={`hoja-fondo ${abierta ? 'abierta' : ''}`} onClick={onCerrar} aria-hidden={!abierta}>
      <section className="hoja" role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="hoja-asa" aria-hidden="true" />
        <div className="fila-entre">
          <h2 className="titulo-2">{titulo}</h2>
          <button className="boton-texto" onClick={onCerrar}>Cerrar</button>
        </div>
        <div className="hoja-cuerpo">{children}</div>
      </section>
    </div>
  )
}
