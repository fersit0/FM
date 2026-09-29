import { useEffect, useState } from 'react'
import { urlsFotoBase, ENCUADRE } from '../data/fotos'
import type { FotoEjercicio } from '../data/tipos'

function urlsDe(clave: string, propia?: FotoEjercicio): { a: string; b?: string; referencia?: boolean } | null {
  if (propia) return { a: URL.createObjectURL(propia.blob), b: propia.blob2 ? URL.createObjectURL(propia.blob2) : undefined }
  return urlsFotoBase(clave)
}

/**
 * Foto del ejercicio (RUTINA-FINAL.md, 8): propia primero, luego base. Recorte 4:3 con encuadre por ejercicio.
 * `modo`: 'toque' alterna inicio y final al tocar (sesión); 'par' muestra las dos lado a lado con etiqueta (ficha); 'chica' miniatura.
 */
export function Foto({ clave, ejercicioId, propias, nombre, modo = 'toque', onClick }: { clave: string; ejercicioId: string; propias: FotoEjercicio[]; nombre: string; modo?: 'toque' | 'par' | 'chica'; onClick?: () => void }) {
  const propia = propias.find((f) => f.ejercicioId === ejercicioId)
  const [urls, setUrls] = useState<ReturnType<typeof urlsDe>>(null)
  const [cual, setCual] = useState<0 | 1>(0)
  useEffect(() => {
    const u = urlsDe(clave, propia)
    setUrls(u)
    return () => { if (propia && u) { URL.revokeObjectURL(u.a); if (u.b) URL.revokeObjectURL(u.b) } }
  }, [propia, clave])
  if (!urls) return null
  const pos = ENCUADRE[clave] ?? '50% 35%'
  const img = (src: string, alt: string, lazy = true) => <img src={src} alt={alt} width={720} height={540} loading={lazy ? 'lazy' : 'eager'} style={{ objectPosition: pos }} />
  const ref = urls.referencia && <span className="foto-etiqueta">Referencia</span>
  if (modo === 'chica') {
    return <button className="foto foto-chica" onClick={onClick} aria-label={onClick ? `${nombre}: ver técnica` : nombre}>{img(urls.a, `${nombre}, inicio`)}</button>
  }
  if (modo === 'par' && urls.b) {
    return (
      <div className="foto-par">
        <figure className="foto">{img(urls.a, `${nombre}, inicio`, false)}<figcaption className="foto-etiqueta">Inicio</figcaption>{ref}</figure>
        <figure className="foto">{img(urls.b, `${nombre}, final`, false)}<figcaption className="foto-etiqueta">Final</figcaption></figure>
      </div>
    )
  }
  const dos = !!urls.b
  const toque = () => (onClick ? onClick() : dos && setCual((c) => (c === 0 ? 1 : 0)))
  const Tag = onClick || dos ? 'button' : 'div'
  return (
    <Tag className="foto ficha-foto" onClick={toque} aria-label={onClick ? `${nombre}: ver técnica` : `${nombre}, ${cual === 0 ? 'inicio' : 'final'}`}>
      {img(cual === 1 && urls.b ? urls.b : urls.a, `${nombre}, ${cual === 0 ? 'inicio' : 'final'}`, false)}
      {dos && <span className="foto-etiqueta">{cual === 0 ? 'Inicio' : 'Final'}{onClick ? '' : ' · toca para cambiar'}</span>}
      {ref}
    </Tag>
  )
}
