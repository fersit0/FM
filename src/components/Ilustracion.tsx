import { useMemo } from 'react'
import { dibujarIlustracion, existe } from '../assets/ilustraciones/poses.ts'
import type { Colores } from '../assets/ilustraciones/figura.ts'

/** Duotono (sección 10): sombras en noche, luces en crema. Sin color de temperatura. */
const COLORES: Colores = {
  acento: 'var(--crema)',
  linea: 'var(--noche)',
  fantasma: 'var(--crema-3)',
  equipo: 'var(--capa-2)',
  equipoLinea: 'var(--noche)',
  metal: 'var(--crema-2)',
  cable: 'var(--crema-3)',
}

/** Ilustración plana por ejercicio: posición inicial en fantasma, final en crema. Si no existe, no ocupa espacio. */
export function Ilustracion({ id, nombre, onClick }: { id: string; nombre: string; onClick?: () => void }) {
  const svg = useMemo(() => (existe(id) ? dibujarIlustracion(id, COLORES) : ''), [id])
  if (!svg) return null
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="fm-foto" onClick={onClick} aria-label={onClick ? `${nombre}: ver técnica` : nombre} role={onClick ? undefined : 'img'}>
      <svg viewBox="10 0 180 120" className="fm-foto-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
    </Tag>
  )
}
