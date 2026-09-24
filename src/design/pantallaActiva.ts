import { useEffect, useState } from 'react'

export type Pantalla = 'inicio' | 'tinta' | 'calentamiento' | 'serie' | 'descanso' | 'resumen'
const COLOR: Record<Pantalla, string> = { inicio: '#121318', tinta: '#121318', resumen: '#121318', calentamiento: '#E9E3D7', serie: '#FF3D00', descanso: '#1E47E0' }

/** Un solo estado en <body>: colores de la pantalla y barra de estado de iOS */
export function usePantalla(p: Pantalla): void {
  useEffect(() => {
    document.body.dataset.pantalla = p
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = COLOR[p]
    const barra = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (barra) barra.content = p === 'calentamiento' || p === 'serie' ? 'default' : 'black-translucent'
  }, [p])
}

/** Ancho y alto de la ventana (W, H) para las proporciones de la sección 4 */
export function useMedidas(): { W: number; H: number } {
  const leer = () => ({ W: Math.min(window.innerWidth, 520), H: window.innerHeight })
  const [m, setM] = useState(leer)
  useEffect(() => {
    const f = () => setM(leer())
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return m
}
