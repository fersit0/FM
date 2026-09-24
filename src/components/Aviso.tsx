import { useEffect } from 'react'

/** Aviso discreto que desaparece solo */
export function Aviso({ texto, ms = 3000, onCerrar }: { texto: string; ms?: number; onCerrar: () => void }) {
  useEffect(() => {
    const id = setTimeout(onCerrar, ms)
    return () => clearTimeout(id)
  }, [ms, onCerrar])
  return <div className="fm-aviso-flotante" role="status">{texto}</div>
}
