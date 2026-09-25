import { useEffect, useState } from 'react'
import { urlsFotoBase } from '../data/fotos'
import type { FotoEjercicio } from '../data/tipos'

/**
 * Foto del ejercicio: propia primero, luego base. Si hay dos posiciones, alterna cada segundo
 * con un fundido corto; tocar pausa y muestra "Inicio" / "Final". Blanco y negro, contraste +10%.
 */
export function Foto({ clave, ejercicioId, propias, nombre, chica = false, onClick }: { clave: string; ejercicioId: string; propias: FotoEjercicio[]; nombre: string; chica?: boolean; onClick?: () => void }) {
  const propia = propias.find((f) => f.ejercicioId === ejercicioId)
  const [urls, setUrls] = useState<{ a: string; b?: string } | null>(null)
  const [cual, setCual] = useState<0 | 1>(0)
  const [pausa, setPausa] = useState(false)
  useEffect(() => {
    if (propia) {
      const a = URL.createObjectURL(propia.blob)
      const b = propia.blob2 ? URL.createObjectURL(propia.blob2) : undefined
      setUrls({ a, b })
      return () => { URL.revokeObjectURL(a); if (b) URL.revokeObjectURL(b) }
    }
    setUrls(urlsFotoBase(clave))
  }, [propia, clave])
  useEffect(() => {
    if (!urls?.b || pausa) return
    const id = setInterval(() => setCual((c) => (c === 0 ? 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [urls, pausa])
  if (!urls) return null
  const dos = !!urls.b
  const toque = () => {
    if (onClick) return onClick()
    if (!dos) return
    if (!pausa) setPausa(true)
    else setCual((c) => (c === 0 ? 1 : 0))
  }
  const Tag = onClick || dos ? 'button' : 'div'
  return (
    <Tag className={`foto ${chica ? 'foto-chica' : 'ficha-foto'}`} onClick={toque} aria-label={onClick ? `${nombre}: ver técnica` : nombre} data-pausa={pausa || undefined}>
      <img src={urls.a} alt="" loading="lazy" style={{ opacity: cual === 0 || !dos ? 1 : 0 }} />
      {dos && <img src={urls.b} alt="" loading="lazy" className="foto-b" style={{ opacity: cual === 1 ? 1 : 0 }} />}
      {dos && pausa && !chica && <span className="foto-etiqueta">{cual === 0 ? 'Inicio' : 'Final'}</span>}
    </Tag>
  )
}
