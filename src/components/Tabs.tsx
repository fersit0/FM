export type Vista = 'hoy' | 'progreso' | 'rutina' | 'ajustes'

const TABS: { id: Vista; nombre: string }[] = [
  { id: 'hoy', nombre: 'Hoy' },
  { id: 'progreso', nombre: 'Progreso' },
  { id: 'rutina', nombre: 'Rutina' },
  { id: 'ajustes', nombre: 'Ajustes' },
]

export function Tabs({ vista, onCambiar }: { vista: Vista; onCambiar: (v: Vista) => void }) {
  return (
    <nav className="tabs" aria-label="Secciones">
      <div className="tabs-barra">
        {TABS.map((t) => (
          <button key={t.id} className="tab" aria-current={vista === t.id ? 'page' : undefined} onClick={() => onCambiar(t.id)}>
            {t.nombre}
          </button>
        ))}
      </div>
    </nav>
  )
}
