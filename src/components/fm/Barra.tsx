export type Destino = 'hoy' | 'historial' | 'ejercicios'
const NOMBRES: Record<Destino, string> = { hoy: 'Hoy', historial: 'Historial', ejercicios: 'Ejercicios' }

/** 5. Barra de navegación: tres textos, sin íconos, alineados a la izquierda. */
export function Barra({ destino, onCambiar }: { destino: Destino; onCambiar: (d: Destino) => void }) {
  return (
    <nav className="barra" aria-label="Secciones">
      {(['hoy', 'historial', 'ejercicios'] as Destino[]).map((d) => (
        <button key={d} aria-current={destino === d ? 'page' : undefined} onClick={() => onCambiar(d)}>{NOMBRES[d]}</button>
      ))}
    </nav>
  )
}
