// Fichas de técnica (DISENO-FM-v2.md, 8.2). Se llenan en el bloque D.
export interface Ficha {
  trabaja: string
  sentir: string
  preparacion: string[]
  ejecucion: string[]
  errores: { error: string; correccion: string }[]
  peso: string
  alternativa: string
}
export const FICHAS: Record<string, Ficha> = {}
