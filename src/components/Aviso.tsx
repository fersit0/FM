import { useEffect } from 'react'
export function Aviso({ texto, ms = 3000, onCerrar }: { texto: string; ms?: number; onCerrar: () => void }) {
  useEffect(() => {
    const id = setTimeout(onCerrar, ms)
    return () => clearTimeout(id)
  }, [ms, onCerrar])
  return <div className="aviso-flotante" role="status">{texto}</div>
}
