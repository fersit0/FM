import { useEffect } from 'react'

/** Aviso de 5 segundos con opción de deshacer, pegado abajo. */
export function Deshacer({ texto, onDeshacer, onCerrar, ms = 5000 }: { texto: string; onDeshacer: () => void; onCerrar: () => void; ms?: number }) {
  // un aviso nuevo (otro texto) cuenta sus 5 segundos desde cero, no los que le quedaban al anterior
  useEffect(() => {
    const id = setTimeout(onCerrar, ms)
    return () => clearTimeout(id)
  }, [onCerrar, ms, texto])
  return (
    <div className="deshacer" role="status">
      <span>{texto}</span>
      <button onClick={onDeshacer}>Deshacer</button>
    </div>
  )
}
