import { useEffect, useState } from 'react'
import { urlFotoBase } from '../data/fotos'
import type { FotoEjercicio } from '../data/tipos'

/** Foto del ejercicio: propia primero, luego base. Blanco y negro, contraste +10%, radio 0. */
export function Foto({ clave, ejercicioId, propias, nombre, chica = false }: { clave: string; ejercicioId: string; propias: FotoEjercicio[]; nombre: string; chica?: boolean }) {
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
  if (chica) return <span className="foto-chica"><img src={url} alt="" loading="lazy" /></span>
  return (
    <div className="foto ficha-foto" role="img" aria-label={nombre}>
      <img src={url} alt="" loading="lazy" />
    </div>
  )
}
