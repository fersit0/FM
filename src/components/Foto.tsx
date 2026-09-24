import { useEffect, useState } from 'react'
import { urlFotoBase } from '../data/fotos'
import type { FotoEjercicio } from '../data/tipos'

/**
 * 8.1 Foto del ejercicio: primero la propia (IndexedDB), si no la base del repo, si no nada (no ocupa espacio).
 * Tratamiento: desaturada al 35% y oscurecida hacia los bordes, radio 16.
 */
export function Foto({ clave, ejercicioId, propias, nombre, ancha = false, onClick }: {
  clave: string
  ejercicioId: string
  propias: FotoEjercicio[]
  nombre: string
  ancha?: boolean
  onClick?: () => void
}) {
  const propia = propias.find((f) => f.ejercicioId === ejercicioId)
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (propia) {
      const u = URL.createObjectURL(propia.blob)
      setUrl(u)
      return () => URL.revokeObjectURL(u)
    }
    setUrl(urlFotoBase(clave))
  }, [propia, clave])
  if (!url) return null
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`fm-foto ${ancha ? 'ancha' : ''}`} onClick={onClick} aria-label={onClick ? `${nombre}: ver técnica` : nombre}>
      <img src={url} alt="" loading="lazy" />
    </Tag>
  )
}
