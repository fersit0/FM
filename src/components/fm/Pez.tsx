import type { CSSProperties } from 'react'

export type Expresion = 'concentrado' | 'esforzandose' | 'cansado' | 'tirado-descansando' | 'picaro' | 'orgulloso' | 'confundido' | 'dormido' | 'saludando'

/** 8. El pez: máximo uno por pantalla, entre 72 y 120 pt, nunca sobre rojo ni en Serie. */
export function Pez({ expresion, tamano, style, className = '' }: { expresion: Expresion; tamano: number; style?: CSSProperties; className?: string }) {
  return <img className={`pez ${className}`} src={`${import.meta.env.BASE_URL}pez/${expresion}.png`} alt="" width={tamano} height={tamano} style={{ width: tamano, height: tamano, ...style }} draggable={false} />
}
