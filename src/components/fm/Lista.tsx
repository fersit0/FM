import type { ReactNode } from 'react'

/** Listas planas con separadores de 1 px, sin tarjetas. */
export function Grupo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div>
      {titulo && <p className="grupo-titulo">{titulo}</p>}
      <div className="lista">{children}</div>
    </div>
  )
}

export function Fila({ num, texto, detalle, dato, onClick, children }: { num?: string | number; texto: ReactNode; detalle?: ReactNode; dato?: ReactNode; onClick?: () => void; children?: ReactNode }) {
  const contenido = (
    <>
      {num !== undefined && <span className="fila-num">{num}</span>}
      <span className="fila-texto">
        <span className="t-cuerpo">{texto}</span>
        {detalle && <span className="t-nota tenue">{detalle}</span>}
      </span>
      {dato !== undefined && <span className="fila-dato">{dato}</span>}
      {children}
    </>
  )
  return onClick ? <button className="fila" onClick={onClick}>{contenido}</button> : <div className="fila">{contenido}</div>
}
