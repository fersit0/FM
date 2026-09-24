// Regla de horario automática (sección 5 del brief). Puro, sin React.
import type { Settings } from '../data/tipos'
import { minutosAhora, minutosDe } from './fechas'

export type EstadoTiempo = 'completa' | 'corta' | 'no'

export interface ResultadoTiempo {
  estado: EstadoTiempo
  /** minutos hasta la última pesa (hora tope) */
  minutosParaTope: number
  titulo: string
  detalle: string
}

export function estadoTiempoEnMinutos(min: number, settings: Settings): ResultadoTiempo {
  const tope = minutosDe(settings.horaTope)
  const completa = minutosDe(settings.horaCompleta)
  const corta = minutosDe(settings.horaCorta)
  const minutosParaTope = tope - min

  if (min <= completa) {
    return {
      estado: 'completa',
      minutosParaTope,
      titulo: 'Alcanza la completa',
      detalle: min < 19 * 60
        ? 'Antes de las 7. Sin prisa.'
        : minutosParaTope >= 90
          ? `Tienes ${minutosParaTope} minutos. Sobra.`
          : `Tienes ${minutosParaTope} minutos. Alcanza para algo bueno.`,
    }
  }
  if (min <= corta) {
    return {
      estado: 'corta',
      minutosParaTope,
      titulo: 'Alcanza la corta',
      detalle: `Tienes ${minutosParaTope} minutos. Versión de 45.`,
    }
  }
  return {
    estado: 'no',
    minutosParaTope,
    titulo: 'Hoy ya no. Descanso.',
    detalle: minutosParaTope > 0 ? 'Si entras de todas formas, va en corta.' : 'Mañana es otro día.',
  }
}

export function estadoTiempo(ahora: Date, settings: Settings): ResultadoTiempo {
  return estadoTiempoEnMinutos(minutosAhora(ahora), settings)
}

/** "Salgo de la oficina a las ___": suma carretera + casa-club y contesta */
export function estadoSiSalgo(horaSalida: string, settings: Settings): ResultadoTiempo & { llegadaMin: number } {
  const llegadaMin = minutosDe(horaSalida) + settings.minCarretera + settings.minCasaClub
  const r = estadoTiempoEnMinutos(llegadaMin, settings)
  return { ...r, llegadaMin }
}

/** Versión con la que se abre una sesión según el estado de tiempo y si ya es bonus */
export function versionInicial(estado: EstadoTiempo, bonus: boolean): 'completa' | 'corta' | 'bonus' {
  if (estado !== 'completa') return 'corta'
  return bonus ? 'bonus' : 'completa'
}

/** Texto del día siguiente para el estado "no": "Mañana es martes" */
export function textoManana(ahora: Date, nombres: string[]): string {
  const m = new Date(ahora)
  m.setDate(m.getDate() + 1)
  return `Mañana es ${nombres[m.getDay()]}.`
}
