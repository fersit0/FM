import { useEffect } from 'react'

export type Temperatura = 'reposo' | 'prep' | 'moderado' | 'fuerte' | 'pico'

/** Cambia el estado de temperatura de toda la interfaz (data-temp en <html>) */
export function useTemperatura(temp: Temperatura): void {
  useEffect(() => {
    document.documentElement.dataset.temp = temp
  }, [temp])
}
