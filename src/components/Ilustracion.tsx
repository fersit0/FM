import { useMemo } from 'react'
import { dibujarIlustracion, existe } from '../assets/ilustraciones/poses.ts'
import type { Colores } from '../assets/ilustraciones/figura.ts'

/** Colores tomados de los tokens: el acento es el estado de temperatura actual */
const COLORES: Colores = {
  acento: 'var(--temp)',
  linea: 'var(--marco)',
  fantasma: 'var(--crema-2)',
  equipo: 'var(--navy-alto)',
  equipoLinea: 'var(--marco)',
  metal: 'var(--crema-2)',
  cable: 'var(--crema-3)',
}

/** Ilustración plana por ejercicio: posición inicial en fantasma, final en el color de estado. */
export function Ilustracion({ id, nombre, chica = false }: { id: string; nombre: string; chica?: boolean }) {
  const svg = useMemo(() => (existe(id) ? dibujarIlustracion(id, COLORES) : ''), [id])
  return (
    <div className={`ilustracion ${chica ? 'chica' : ''}`} role="img" aria-label={nombre}>
      <svg viewBox={chica ? '20 10 160 110' : '0 0 200 120'} className="ilustracion-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
