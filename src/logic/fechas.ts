// Utilidades de fecha en zona local. Sin dependencias.

export function claveFecha(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dia}`
}

export function desdeClave(clave: string): Date {
  const [y, m, d] = clave.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Lunes 00:00 de la semana que contiene la fecha */
export function inicioSemana(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = r.getDay() // 0 domingo
  const diff = dow === 0 ? 6 : dow - 1
  r.setDate(r.getDate() - diff)
  return r
}

export function sumarDias(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function mismaFecha(a: Date, b: Date): boolean {
  return claveFecha(a) === claveFecha(b)
}

/** "20:05" -> minutos desde medianoche */
export function minutosDe(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function minutosAhora(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

export function formatoHora(minutos: number): string {
  const h24 = Math.floor(minutos / 60) % 24
  const m = minutos % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const sufijo = h24 < 12 ? 'am' : 'pm'
  return m === 0 ? `${h12} ${sufijo}` : `${h12}:${String(m).padStart(2, '0')} ${sufijo}`
}

export const DIAS_CORTOS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
export const DIAS_NOMBRE = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function fechaCorta(clave: string): string {
  const d = desdeClave(clave)
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`
}

export function formatoDuracion(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
