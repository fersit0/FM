import { useEffect, useState } from 'react'

/** Aviso discreto que desaparece solo */
export function Aviso({ texto, ms = 3000, onCerrar }: { texto: string; ms?: number; onCerrar: () => void }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => {
      setVisible(false)
      onCerrar()
    }, ms)
    return () => clearTimeout(id)
  }, [ms, onCerrar])
  if (!visible) return null
  return (
    <div className="aviso" role="status">
      {texto}
    </div>
  )
}
