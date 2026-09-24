import { describe, it, expect } from 'vitest'
import { semanasHistorial, tocaPesarse, tocaFoto, pesoPorSemana } from './progreso'
import type { Sesion } from '../data/tipos'

const s = (fecha: string, tipo: Sesion['tipo']): Sesion => {
  const t = new Date(fecha + 'T20:00:00').getTime()
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: t, fin: t + 3600e3, terminada: true }
}

describe('historial', () => {
  it('marca cumplida solo con 3 y la semana actual al final', () => {
    const ses = [s('2026-09-14', 'A'), s('2026-09-16', 'B'), s('2026-09-18', 'A'), s('2026-09-21', 'B')]
    const h = semanasHistorial(ses, new Date('2026-09-24T10:00:00'), 3)
    expect(h.map((w) => w.inicio)).toEqual(['2026-09-07', '2026-09-14', '2026-09-21'])
    expect(h.map((w) => w.cumplida)).toEqual([false, true, false])
    expect(h[2].actual).toBe(true)
  })
})

describe('pesaje y foto', () => {
  it('toca pesarse el día configurado si no hay registro esa semana', () => {
    expect(tocaPesarse([], new Date('2026-09-27T09:00:00'), 0)).toBe(true) // domingo
    expect(tocaPesarse([{ fecha: '2026-09-27', kg: 80 }], new Date('2026-09-27T09:00:00'), 0)).toBe(false)
    expect(tocaPesarse([], new Date('2026-09-26T09:00:00'), 0)).toBe(false) // sábado
  })
  it('toca foto sin fotos o a los 14 días', () => {
    expect(tocaFoto([], new Date()).toca).toBe(true)
    const f = [{ fecha: '2026-09-10', blob: new Blob() }]
    expect(tocaFoto(f, new Date('2026-09-20T10:00:00'))).toEqual({ toca: false, dias: 10 })
    expect(tocaFoto(f, new Date('2026-09-24T10:00:00')).toca).toBe(true)
  })
  it('peso por semana toma el último de cada semana', () => {
    const p = [{ fecha: '2026-09-14', kg: 81 }, { fecha: '2026-09-20', kg: 80.4 }]
    const r = pesoPorSemana(p, new Date('2026-09-24T10:00:00'), 2)
    expect(r.map((x) => x.kg)).toEqual([80.4, null])
  })
})
