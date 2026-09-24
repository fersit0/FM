// Cálculos para la pantalla Progreso. Puro.
import type { Sesion, Bodyweight, Photo } from '../data/tipos'
import { inicioSemana, sumarDias, claveFecha, desdeClave } from './fechas'

export interface SemanaHistorial {
  inicio: string
  sesiones: Sesion[]
  cumplida: boolean
  actual: boolean
}

/** Últimas N semanas (la actual incluida), de la más vieja a la más nueva */
export function semanasHistorial(sesiones: Sesion[], ahora: Date, n = 12): SemanaHistorial[] {
  const iniActual = inicioSemana(ahora)
  const out: SemanaHistorial[] = []
  for (let i = n - 1; i >= 0; i--) {
    const ini = sumarDias(iniActual, -7 * i)
    const a = claveFecha(ini)
    const b = claveFecha(sumarDias(ini, 6))
    const propias = sesiones.filter((s) => s.terminada && s.fecha >= a && s.fecha <= b).sort((x, y) => x.inicio - y.inicio)
    out.push({ inicio: a, sesiones: propias, cumplida: propias.length >= 3, actual: i === 0 })
  }
  return out
}

/** Posición de una sesión dentro de su semana: 0..7 (días con fracción de hora) y duración en minutos */
export function posicionEnSemana(s: Sesion): { x: number; minutos: number } {
  const ini = inicioSemana(new Date(s.inicio))
  const x = (s.inicio - ini.getTime()) / 86400000
  const minutos = s.fin ? Math.max(5, (s.fin - s.inicio) / 60000) : 45
  return { x, minutos }
}

/** ¿Toca pesarse? Día de pesaje y sin registro esta semana */
export function tocaPesarse(peso: Bodyweight[], ahora: Date, diaPesaje: number): boolean {
  if (ahora.getDay() !== diaPesaje) return false
  const ini = claveFecha(inicioSemana(ahora))
  return !peso.some((p) => p.fecha >= ini && p.fecha <= claveFecha(ahora))
}

/** ¿Toca foto? Cada 2 semanas desde la última */
export function tocaFoto(fotos: Photo[], ahora: Date): { toca: boolean; dias: number | null } {
  if (fotos.length === 0) return { toca: true, dias: null }
  const ultima = desdeClave(fotos[fotos.length - 1].fecha)
  const dias = Math.floor((ahora.getTime() - ultima.getTime()) / 86400000)
  return { toca: dias >= 14, dias }
}

/** Peso corporal de las últimas 12 semanas (un punto por semana, el último de cada una) */
export function pesoPorSemana(peso: Bodyweight[], ahora: Date, n = 12): { inicio: string; kg: number | null }[] {
  const iniActual = inicioSemana(ahora)
  const out: { inicio: string; kg: number | null }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const ini = sumarDias(iniActual, -7 * i)
    const a = claveFecha(ini)
    const b = claveFecha(sumarDias(ini, 6))
    const de = peso.filter((p) => p.fecha >= a && p.fecha <= b)
    out.push({ inicio: a, kg: de.length ? de[de.length - 1].kg : null })
  }
  return out
}
