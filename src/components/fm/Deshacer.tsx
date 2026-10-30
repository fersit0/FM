import { useEffect } from 'react'

/** Aviso de 5 segundos con opción de deshacer, pegado abajo. */
export function Deshacer({ texto, onDeshacer, onCerrar, ms = 5000, clave }: { texto: string; onDeshacer: () => void; onCerrar: () => void; ms?: number; clave?: unknown }) {
  // un aviso nuevo cuenta sus 5 segundos desde cero, no los que le quedaban al anterior, aunque diga lo mismo ("Serie borrada." dos veces):
  // `clave` es el objeto del aviso, que cambia con cada aviso nuevo y no con cada render
  useEffect(() => {
    const id = setTimeout(onCerrar, ms)
    return () => clearTimeout(id)
  }, [onCerrar, ms, texto, clave])
  return (
    <div className="deshacer" role="status">
      <span>{texto}</span>
      <button onClick={onDeshacer}>Deshacer</button>
    </div>
  )
}
