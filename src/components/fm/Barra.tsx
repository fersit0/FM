import type { ReactElement } from 'react'

export type Destino = 'hoy' | 'historial' | 'ejercicios'

const ICONOS: Record<Destino, ReactElement> = {
  hoy: <svg className="fm-icono" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5l2.8 1.8" /></svg>,
  historial: <svg className="fm-icono" viewBox="0 0 24 24"><path d="M4 18V11M9.5 18V6M15 18v-7M20.5 18V9" /></svg>,
  ejercicios: <svg className="fm-icono" viewBox="0 0 24 24"><path d="M9 12h6M6 8v8M18 8v8M3.5 10v4M20.5 10v4" /></svg>,
}
const NOMBRES: Record<Destino, string> = { hoy: 'Hoy', historial: 'Historial', ejercicios: 'Ejercicios' }

/** 6.8 Barra inferior: tres destinos, blur 24, hairline arriba. Se oculta en sesión. */
export function Barra({ destino, onCambiar }: { destino: Destino; onCambiar: (d: Destino) => void }) {
  return (
    <nav className="fm-barra" aria-label="Secciones">
      {(['hoy', 'historial', 'ejercicios'] as Destino[]).map((d) => (
        <button key={d} className="fm-barra-item" aria-current={destino === d ? 'page' : undefined} onClick={() => onCambiar(d)}>
          {ICONOS[d]}
          <span>{NOMBRES[d]}</span>
        </button>
      ))}
    </nav>
  )
}
