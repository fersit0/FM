import type { ReactNode } from 'react'

/** 6.6 Listas agrupadas estilo iOS: bloque capa-1, filas de 52, hairline con sangría. */
export function Grupo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div>
      {titulo && <p className="fm-grupo-titulo">{titulo}</p>}
      <div className="fm-grupo">{children}</div>
    </div>
  )
}

export function Fila({ num, texto, detalle, dato, onClick, children }: { num?: string | number; texto: ReactNode; detalle?: ReactNode; dato?: ReactNode; onClick?: () => void; children?: ReactNode }) {
  const contenido = (
    <>
      {num !== undefined && <span className="fm-fila-num">{num}</span>}
      <span className="fm-fila-texto">
        <span className="cuerpo">{texto}</span>
        {detalle && <span className="nota">{detalle}</span>}
      </span>
      {dato !== undefined && <span className="fm-fila-dato">{dato}</span>}
      {children}
    </>
  )
  return onClick ? <button className="fm-fila" onClick={onClick}>{contenido}</button> : <div className="fm-fila">{contenido}</div>
}
