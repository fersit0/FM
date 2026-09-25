import { useEffect } from 'react'

/** Aviso de 5 segundos con opción de deshacer, pegado abajo. */
export function Deshacer({ texto, onDeshacer, onCerrar, ms = 5000 }: { texto: string; onDeshacer: () => void; onCerrar: () => void; ms?: number }) {
  useEffect(() => {
    const id = setTimeout(onCerrar, ms)
    return () => clearTimeout(id)
  }, [onCerrar, ms])
  return (
    <div className="deshacer" role="status">
      <span>{texto}</span>
      <button onClick={onDeshacer}>Deshacer</button>
    </div>
  )
}
