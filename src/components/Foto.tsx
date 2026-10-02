import { useEffect, useState } from 'react'
import { urlsFotoBase, ENCUADRE } from '../data/fotos'
import type { FotoEjercicio } from '../data/tipos'

function urlsDe(clave: string, propia?: FotoEjercicio): { a: string; b?: string; referencia?: boolean } | null {
  if (propia) return { a: URL.createObjectURL(propia.blob), b: propia.blob2 ? URL.createObjectURL(propia.blob2) : undefined }
  return urlsFotoBase(clave)
}

/**
 * Foto del ejercicio (RUTINA-FINAL.md, 8): propia primero, luego base. Recorte 4:3 con encuadre por ejercicio.
 * `modo`: 'toque' alterna inicio y final al tocar (sesión; las dos imágenes ya están cargadas, así que no brinca);
 * 'par' muestra las dos lado a lado con etiqueta (ficha); 'chica' miniatura. Si una imagen no carga, no se muestra nada roto.
 */
export function Foto({ clave, ejercicioId, propias, nombre, modo = 'toque', onClick }: { clave: string; ejercicioId: string; propias: FotoEjercicio[]; nombre: string; modo?: 'toque' | 'par' | 'chica'; onClick?: () => void }) {
  const propia = propias.find((f) => f.ejercicioId === ejercicioId)
  const [urls, setUrls] = useState<ReturnType<typeof urlsDe>>(null)
  const [cual, setCual] = useState<0 | 1>(0)
  const [fallo, setFallo] = useState(false)
  useEffect(() => {
    const u = urlsDe(clave, propia)
    setUrls(u)
    setFallo(false)
    setCual(0)
    return () => { if (propia && u) { URL.revokeObjectURL(u.a); if (u.b) URL.revokeObjectURL(u.b) } }
  }, [propia, clave])
  if (!urls || fallo) return null
  const pos = ENCUADRE[clave] ?? '50% 35%'
  const img = (src: string, alt: string, lazy = true, extra?: React.CSSProperties) => <img src={src} alt={alt} width={720} height={540} loading={lazy ? 'lazy' : 'eager'} decoding="async" onError={() => setFallo(true)} style={{ objectPosition: pos, ...extra }} />
  const ref = urls.referencia && <span className="foto-etiqueta">Referencia</span>
  if (modo === 'chica') {
    if (!onClick) return <span className="foto foto-chica" role="img" aria-label={nombre}>{img(urls.a, `${nombre}, inicio`)}</span>
    return <button className="foto foto-chica" onClick={onClick} aria-label={`${nombre}: ver técnica`}>{img(urls.a, `${nombre}, inicio`)}</button>
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
      {img(urls.a, `${nombre}, inicio`, false, dos && cual === 1 ? { visibility: 'hidden' } : undefined)}
      {dos && <span className="foto-b" aria-hidden={cual !== 1}>{img(urls.b!, `${nombre}, final`, false, cual === 0 ? { visibility: 'hidden' } : undefined)}</span>}
      {dos && <span className="foto-etiqueta">{cual === 0 ? 'Inicio' : 'Final'}{onClick ? '' : ' · toca para cambiar'}</span>}
      {ref}
    </Tag>
  )
}
