// Modelo de datos (sección 12 del brief)

export type SesionTipo = 'A' | 'B' | 'FRIDA' | 'CASA'
export type Version = 'completa' | 'corta' | 'bonus'
export type Letra = 'A' | 'B' | 'CASA'
/** Zonas del Club Britania (RUTINA-FINAL.md, 3) */
export type Zona = 'bancos' | 'poleas' | 'terraza'
/** Cómo quedó una sesión: completa, corta, parcial (se cerró sola con pocas series) o registrada sin detalle */
export type Como = 'completa' | 'corta' | 'parcial' | 'registrada'

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
  /** en máquina asistida más peso es más ayuda: la progresión baja el contrapeso */
  invertida?: boolean
}

export interface Ejercicio extends Detalle {
  id: string
  nombre: string
  sesion: Letra
  orden: number
  /** zona del gym donde se hace (CASA no tiene) */
  zona?: Zona
  /** solo entra cuando toca pierna en A o B (semana sin Frida) */
  pierna?: boolean
  series: number
  repsMin: number
  repsMax: number
  descansoSeg: number
  modo: Modo
  porLado?: boolean
  alternativas: Alternativa[]
  ilustracion: string
  /** incremento en kg (2.5 por defecto) */
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
  /** esta sesión trajo goblet a 3 series (semana sin Frida) */
  pierna?: boolean
  /** cómo quedó (RUTINA-FINAL.md, 2): se calcula al cerrar; las registradas sin la app son 'registrada' */
  como?: Como
  /** 'app' si se hizo con la app; 'registro' si se registró después (Historial, pregunta de Hoy o carga inicial) */
  origen?: 'app' | 'registro'
  /** orden actual de los ejercicios (ids base); cambia con "Ocupado: después". Sin él, el de la rutina. */
  orden?: string[]
  /** ids que ya se mandaron al final una vez: la segunda vez se ofrece la alternativa */
  pospuestos?: string[]
  /** ids quitados por el recorte en el camino (RUTINA-FINAL.md, 3) */
  recortados?: string[]
}

export interface SetLog {
  id?: number
  sessionId: string
  /** id del ejercicio o de la alternativa que se hizo */
  exerciseId: string
  /** id del ejercicio base de la rutina (para agrupar en Progreso) */
  ejercicioBaseId: string
  numSerie: number
  /** en kilos, para comparar; puede tener redondeo */
  pesoKg: number | null
  /** valor exacto tal cual se registró y su unidad */
  peso?: number
  unidad?: 'kg' | 'lb'
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
  /** posición inicial */
  blob: Blob
  /** posición final, opcional */
  blob2?: Blob
  fecha: string
}

export interface Settings {
  /** última pesa (HH:MM): la versión se decide con la duración estimada contra esta hora */
  horaTope: string
  minCarretera: number
  minCasaClub: number
  /** 0 = domingo ... 6 = sábado */
  diaPesaje: number
  tema: 'oscuro' | 'claro'
  /** "Salgo de la oficina a las" (HH:MM) o vacío */
  horaSalida?: string
  /** alternativas que sustituyen a un ejercicio en la rutina ("Usar siempre esta") */
  reemplazos?: Record<string, string>
  /** unidad principal por ejercicio (kg o lb) */
  unidades?: Record<string, 'kg' | 'lb'>
  /** migración de ids viejos a ids por movimiento ya corrida */
  migracionRutinaFinal?: boolean
  /** ids viejos que no estaban en la tabla de migración */
  idsDesconocidos?: string[]
  /** último respaldo exportado o importado (YYYY-MM-DD): se recuerda cada 2 semanas */
  ultimoRespaldo?: string
  /** día de Frida por semana (clave = lunes YYYY-MM-DD): fecha planeada, o null si esa semana no hay; sin entrada = lunes */
  fridaPlan?: Record<string, string | null>
  /** días de gym contestados con "No fui" (YYYY-MM-DD), para preguntar una sola vez */
  noFui?: string[]
  /** la A del 7 oct 2026 ya se cargó (RUTINA-FINAL.md, 2.8) */
  cargaInicialV5?: boolean
  /** "Pon al día tu semana" ya se mostró (RUTINA-FINAL.md, 2.5) */
  semanaAlDiaV5?: boolean
}

export interface Cintura {
  fecha: string
  cm: number
}

export const SETTINGS_DEFAULT: Settings = {
  horaTope: '21:10',
  minCarretera: 60,
  minCasaClub: 30,
  diaPesaje: 0,
  tema: 'oscuro',
}
