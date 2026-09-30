import { describe, it, expect } from 'vitest'
import { sugerirPeso, maximosPorSesion, subioDePeso } from './progresion'
import type { SetLog } from '../data/tipos'

function sesionDe(sessionId: string, fecha: string, exerciseId: string, peso: number, reps: number[]): SetLog[] {
  const hora = new Date(fecha + 'T20:00:00').getTime()
  return reps.map((r, i) => ({ sessionId, exerciseId, ejercicioBaseId: exerciseId.split('-')[0], numSerie: i + 1, pesoKg: peso, reps: r, fecha, hora }))
}

describe('doble progresión', () => {
  it('sin historial pide peso inicial', () => {
    const r = sugerirPeso([], 'press-plano', 10)
    expect(r.tipo).toBe('inicial')
    expect(r.peso).toBeNull()
  })
  it('tope en todas las series: subir, con el peso anterior precargado', () => {
    const logs = sesionDe('s1', '2026-09-21', 'press-plano', 14, [10, 10, 10])
    const r = sugerirPeso(logs, 'press-plano', 10)
    expect(r.tipo).toBe('subir')
    expect(r.peso).toBe(14)
  })
  it('sin tope en alguna serie: repetir', () => {
    const logs = sesionDe('s1', '2026-09-21', 'press-plano', 14, [10, 10, 8])
    expect(sugerirPeso(logs, 'press-plano', 10).tipo).toBe('repetir')
  })
  it('usa la última sesión, no una vieja', () => {
    const logs = [...sesionDe('s1', '2026-09-14', 'press-plano', 14, [10, 10, 10]), ...sesionDe('s2', '2026-09-21', 'press-plano', 16, [8, 8, 7])]
    const r = sugerirPeso(logs, 'press-plano', 10)
    expect(r.tipo).toBe('repetir')
    expect(r.peso).toBe(16)
  })
  it('dos sesiones seguidas bajando reps con el mismo peso: bajar', () => {
    const logs = [
      ...sesionDe('s1', '2026-09-07', 'press-plano', 16, [9, 8, 8]),
      ...sesionDe('s2', '2026-09-14', 'press-plano', 16, [8, 8, 7]),
      ...sesionDe('s3', '2026-09-21', 'press-plano', 16, [8, 7, 6]),
    ]
    expect(sugerirPeso(logs, 'press-plano', 10).tipo).toBe('bajar')
  })
  it('una sola bajada no es suficiente para bajar', () => {
    const logs = [
      ...sesionDe('s1', '2026-09-07', 'press-plano', 16, [8, 8, 7]),
      ...sesionDe('s2', '2026-09-14', 'press-plano', 16, [9, 8, 8]),
      ...sesionDe('s3', '2026-09-21', 'press-plano', 16, [8, 7, 6]),
    ]
    expect(sugerirPeso(logs, 'press-plano', 10).tipo).toBe('repetir')
  })
  it('si no llegó al mínimo: quedarse o bajar', () => {
    const logs = sesionDe('s1', '2026-09-21', 'press-plano', 16, [8, 7, 6])
    expect(sugerirPeso(logs, 'press-plano', 10, 'peso', 8).tipo).toBe('quedarse')
    expect(sugerirPeso(logs, 'press-plano', 10, 'peso', 6).tipo).toBe('repetir')
  })
  it('la alternativa tiene su propio historial', () => {
    const logs = sesionDe('s1', '2026-09-21', 'press-plano', 14, [10, 10, 10])
    expect(sugerirPeso(logs, 'press-piso', 10).tipo).toBe('inicial')
  })
  it('plancha y peso corporal no sugieren peso', () => {
    const logs = sesionDe('s1', '2026-09-21', 'plancha', 0, [40, 40, 40])
    expect(sugerirPeso(logs, 'plancha', 40, 'tiempo').tipo).toBe('repetir')
  })
})

describe('progreso por ejercicio', () => {
  it('máximo por sesión y detecta subida de peso', () => {
    const logs = [...sesionDe('s1', '2026-09-14', 'press-plano', 14, [10, 10, 10]), ...sesionDe('s2', '2026-09-21', 'press-plano', 16, [8, 8, 7])]
    expect(maximosPorSesion(logs, 'press-plano').map((m) => m.peso)).toEqual([14, 16])
    expect(subioDePeso(logs, 'press-plano', 's2')).toBe(true)
    expect(subioDePeso(logs, 'press-plano', 's1')).toBe(false)
  })
})
