import type { ReactElement } from 'react'

export type Destino = 'hoy' | 'senal' | 'ejercicios'

const ICONOS: Record<Destino, ReactElement> = {
  hoy: <svg className="fm-icono" viewBox="0 0 22 22"><circle cx="11" cy="11" r="7.5" /><path d="M11 7.5v3.5l2.5 2" /></svg>,
  senal: <svg className="fm-icono" viewBox="0 0 22 22"><path d="M4 15v-3M8.5 15V7M13 15v-5M17.5 15V4" /></svg>,
  ejercicios: <svg className="fm-icono" viewBox="0 0 22 22"><path d="M7 11h8M4 8v6M18 8v6M6 7v8M16 7v8" /></svg>,
}
const NOMBRES: Record<Destino, string> = { hoy: 'Hoy', senal: 'Señal', ejercicios: 'Ejercicios' }

/** 7.8 Barra inferior: tres destinos, único blur permitido. Se oculta durante la sesión. */
export function Barra({ destino, onCambiar }: { destino: Destino; onCambiar: (d: Destino) => void }) {
  return (
    <nav className="fm-barra" aria-label="Secciones">
      {(['hoy', 'senal', 'ejercicios'] as Destino[]).map((d) => (
        <button key={d} className="fm-barra-item" aria-current={destino === d ? 'page' : undefined} onClick={() => onCambiar(d)}>
          {ICONOS[d]}
          <span>{NOMBRES[d]}</span>
        </button>
      ))}
    </nav>
  )
}
