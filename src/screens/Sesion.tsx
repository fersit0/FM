import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
export function Sesion({ sesion, onSalir }: { datos: Datos; sesion: SesionTipo; activa: SesionActiva; setActiva: (a: SesionActiva | null) => void; onSalir: () => void; onTerminar: () => void }) {
  return (
    <div className="pantalla-llena">
      <h1 className="titulo">Sesión {sesion.tipo}</h1>
      <p className="texto-3">Fase 2.</p>
      <button className="boton boton-marco" onClick={onSalir}>Salir</button>
    </div>
  )
}
