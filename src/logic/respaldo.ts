// Exportar e importar respaldo JSON. Puro salvo la conversión de blobs.
import type { Sesion, SetLog, Bodyweight, Settings } from '../data/tipos'
import { SETTINGS_DEFAULT } from '../data/tipos'

export interface Respaldo {
  app: 'gym-app'
  version: 1
  exportado: string
  settings: Settings
  sesiones: Sesion[]
  sets: SetLog[]
  peso: Bodyweight[]
  fotos: { fecha: string; tipo: string; base64: string }[]
  fotosEjercicio?: { ejercicioId: string; fecha: string; tipo: string; base64: string; base64b?: string }[]
}

export function armarRespaldo(datos: {
  settings: Settings
  sesiones: Sesion[]
  sets: SetLog[]
  peso: Bodyweight[]
  fotos: { fecha: string; tipo: string; base64: string }[]
  fotosEjercicio?: { ejercicioId: string; fecha: string; tipo: string; base64: string; base64b?: string }[]
}): Respaldo {
  return { app: 'gym-app', version: 1, exportado: new Date().toISOString(), ...datos }
}

/** Valida un JSON de respaldo. Devuelve el respaldo limpio o lanza con un mensaje claro. */
export function leerRespaldo(texto: string): Respaldo {
  let obj: unknown
  try {
    obj = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es JSON válido.')
  }
  if (!obj || typeof obj !== 'object') throw new Error('El archivo está vacío.')
  const r = obj as Partial<Respaldo>
  if (r.app !== 'gym-app') throw new Error('Ese archivo no es un respaldo de esta app.')
  const lista = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : [])
  return {
    app: 'gym-app',
    version: 1,
    exportado: typeof r.exportado === 'string' ? r.exportado : new Date().toISOString(),
    settings: { ...SETTINGS_DEFAULT, ...(r.settings ?? {}) },
    sesiones: lista<Sesion>(r.sesiones).filter((s) => s && typeof s.id === 'string' && typeof s.fecha === 'string'),
    sets: lista<SetLog>(r.sets)
      .filter((s) => s && typeof s.sessionId === 'string' && typeof s.exerciseId === 'string')
      .map((s) => ({ ...s, id: undefined })),
    peso: lista<Bodyweight>(r.peso).filter((p) => p && typeof p.fecha === 'string' && typeof p.kg === 'number'),
    fotos: lista<Respaldo['fotos'][number]>(r.fotos).filter((f) => f && typeof f.fecha === 'string' && typeof f.base64 === 'string'),
    fotosEjercicio: lista<NonNullable<Respaldo['fotosEjercicio']>[number]>(r.fotosEjercicio).filter((f) => f && typeof f.ejercicioId === 'string' && typeof f.base64 === 'string'),
  }
}

export function blobABase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve((fr.result as string).split(',')[1] ?? '')
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
}

export function base64ABlob(base64: string, tipo: string): Blob {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: tipo || 'image/jpeg' })
}

/** Recordar el respaldo cada 2 semanas: si nunca se hizo, desde la primera sesión terminada */
export function tocaRespaldo(ultimoRespaldo: string | undefined, sesiones: { fecha: string; terminada: boolean }[], hoy: string, dias = 14): boolean {
  const hechas = sesiones.filter((s) => s.terminada).map((s) => s.fecha).sort()
  if (hechas.length === 0) return false
  const desde = ultimoRespaldo ?? hechas[0]
  const ms = new Date(hoy + 'T12:00:00').getTime() - new Date(desde + 'T12:00:00').getTime()
  return ms >= dias * 86400_000
}
