// Modelo de datos (sección 12 del brief)

export type SesionTipo = 'A' | 'B' | 'FRIDA'
export type Version = 'completa' | 'corta' | 'bonus'
export type Letra = 'A' | 'B'

/** Cómo se cuenta una serie: reps con peso, segundos sostenidos, o al tope con peso corporal */
export type Modo = 'peso' | 'tiempo' | 'corporal'

export interface Detalle {
  ubicar?: string
  colocacion?: string
  tecnica: string[]
  errores: string[]
}

export interface Alternativa extends Detalle {
  id: string
  nombre: string
  /** Etiqueta corta del caso: "Sin banco", "Ocupado", "Peso no alcanza", "Rodilla molesta"... */
  caso: string
  series: number
  repsMin: number
  repsMax: number
  descansoSeg: number
  modo: Modo
  porLado?: boolean
  ilustracion: string
}

export interface Ejercicio extends Detalle {
  id: string
  nombre: string
  sesion: Letra
  orden: number
  series: number
  repsMin: number
  repsMax: number
  descansoSeg: number
  modo: Modo
  porLado?: boolean
  alternativas: Alternativa[]
  ilustracion: string
  /** incremento del dial de peso en kg (2.5 por defecto) */
  incrementoKg?: number
}

export interface Sesion {
  id: string
  /** YYYY-MM-DD local */
  fecha: string
  tipo: SesionTipo
  version: Version
  inicio: number
  fin?: number
  terminada: boolean
  /** Cambios a alternativa durante la sesión */
  cambios?: { ejercicioId: string; alternativaId: string }[]
  /** Semana ligera: 2 series por ejercicio con el mismo peso */
  ligera?: boolean
}

export interface SetLog {
  id?: number
  sessionId: string
  /** id del ejercicio o de la alternativa que se hizo */
  exerciseId: string
  /** id del ejercicio base de la rutina (para agrupar en Progreso) */
  ejercicioBaseId: string
  numSerie: number
  pesoKg: number | null
  reps: number
  fecha: string
  hora: number
}

export interface Bodyweight {
  fecha: string
  kg: number
}

export interface Photo {
  fecha: string
  blob: Blob
}

/** Foto propia de un ejercicio (la máquina real del gym), tomada desde la ficha */
export interface FotoEjercicio {
  ejercicioId: string
  blob: Blob
  fecha: string
}

export interface Settings {
  horaTope: string
  horaCompleta: string
  horaCorta: string
  minCarretera: number
  minCasaClub: number
  /** 0 = domingo ... 6 = sábado */
  diaPesaje: number
  seriesExtra: boolean
  tema: 'oscuro' | 'claro'
  /** cuántas semanas cumplidas había cuando se pospuso la regla de 4 semanas */
  reglaPospuestaEn?: number
  /** "Salgo de la oficina a las" (HH:MM) o vacío */
  horaSalida?: string
  /** alternativas que sustituyen a un ejercicio en la rutina ("Usar siempre esta") */
  reemplazos?: Record<string, string>
}

export const SETTINGS_DEFAULT: Settings = {
  horaTope: '21:10',
  horaCompleta: '20:05',
  horaCorta: '20:25',
  minCarretera: 60,
  minCasaClub: 30,
  diaPesaje: 0,
  seriesExtra: false,
  tema: 'oscuro',
}
