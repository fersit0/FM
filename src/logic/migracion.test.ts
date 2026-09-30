import { describe, it, expect } from 'vitest'
import { migrarId, migrarSet, migrarSesion, migrarSettings, hayIdsViejos, MAPA } from './migracion'
import { SETTINGS_DEFAULT, type SetLog } from '../data/tipos'

const set = (id: string): SetLog => ({ sessionId: 's', exerciseId: id, ejercicioBaseId: id.split('-')[0], numSerie: 1, pesoKg: 10, reps: 10, fecha: '2026-09-21', hora: 1 })

describe('migración de ids', () => {
  it('A1 pasa a press-plano y B4 a laterales', () => {
    expect(migrarSet(set('A1')).exerciseId).toBe('press-plano')
    expect(migrarSet(set('B4')).exerciseId).toBe('laterales')
    expect(migrarSet(set('B4-sentado')).ejercicioBaseId).toBe('laterales')
  })
  it('los ids nuevos no cambian y los viejos desconocidos se reportan sin borrarse', () => {
    const d = new Set<string>()
    expect(migrarId('jalon', d)).toBe('jalon')
    expect(migrarId('A9-raro', d)).toBe('A9-raro')
    expect([...d]).toEqual(['A9-raro'])
  })
  it('migra cambios de sesión, reemplazos y unidades, y deja la bandera', () => {
    const s = migrarSesion({ id: 'x', fecha: '2026-09-21', tipo: 'A', version: 'completa', inicio: 1, terminada: true, cambios: [{ ejercicioId: 'A1', alternativaId: 'A1-piso' }] })
    expect(s.cambios![0]).toEqual({ ejercicioId: 'press-plano', alternativaId: 'press-piso' })
    const st = migrarSettings({ ...SETTINGS_DEFAULT, reemplazos: { B2: 'B2-pecho' }, unidades: { A2: 'lb' } })
    expect(st.reemplazos).toEqual({ 'remo-polea': 'remo-pecho-maquina' })
    expect(st.unidades).toEqual({ jalon: 'lb' })
    expect(st.migracionRutinaFinal).toBe(true)
  })
  it('detecta si quedan ids viejos', () => {
    expect(hayIdsViejos([set('A1')], [], [])).toBe(true)
    expect(hayIdsViejos([set('press-plano')], [], [])).toBe(false)
  })
  it('la tabla cubre los 13 ejercicios viejos', () => {
    for (const id of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6']) expect(MAPA[id]).toBeTruthy()
  })
})
