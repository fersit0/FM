import { useEffect } from 'react'

export type Temp = 'reposo' | 'calentamiento' | 'trabajo' | 'fuerte' | 'ultima' | 'descanso' | 'listo'

/** Un solo estado para toda la app: data-temp en <body>. Los componentes leen --estado. */
export function useTemp(temp: Temp): void {
  useEffect(() => {
    document.body.dataset.temp = temp
  }, [temp])
}

/** Temperatura de una serie según su lugar en el ejercicio: se calienta de ámbar a rojo */
export function tempDeSerie(numSerie: number, total: number): Temp {
  if (numSerie >= total) return 'ultima'
  if (numSerie <= 1) return 'trabajo'
  return 'fuerte'
}
