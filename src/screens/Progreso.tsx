import type { Datos } from '../hooks/useDatos'
export function Progreso(_: { datos: Datos; ahora: Date }) {
  return <div className="pantalla"><h1 className="titulo">Progreso</h1><p className="texto-3">Fase 3.</p></div>
}
