import type { Datos } from '../hooks/useDatos'
export function Ajustes(_: { datos: Datos; onAviso: (t: string) => void }) {
  return <div className="pantalla"><h1 className="titulo">Ajustes</h1><p className="texto-3">Fase 3.</p></div>
}
