import { describe, it, expect } from 'vitest'
import { armarRespaldo, leerRespaldo } from './respaldo'
import { SETTINGS_DEFAULT } from '../data/tipos'

describe('respaldo', () => {
  it('exporta e importa sin perder nada', () => {
    const r = armarRespaldo({
      settings: { ...SETTINGS_DEFAULT, minCarretera: 45 },
      sesiones: [{ id: 'x', fecha: '2026-09-21', tipo: 'A', version: 'completa', inicio: 1, fin: 2, terminada: true }],
      sets: [{ id: 7, sessionId: 'x', exerciseId: 'A1', ejercicioBaseId: 'A1', numSerie: 1, pesoKg: 14, reps: 10, fecha: '2026-09-21', hora: 1 }],
      peso: [{ fecha: '2026-09-20', kg: 80.5 }],
      fotos: [{ fecha: '2026-09-20', tipo: 'image/jpeg', base64: 'AAAA' }],
    })
    const leido = leerRespaldo(JSON.stringify(r))
    expect(leido.settings.minCarretera).toBe(45)
    expect(leido.sesiones).toHaveLength(1)
    expect(leido.sets[0].id).toBeUndefined() // se reasigna al importar
    expect(leido.sets[0].pesoKg).toBe(14)
    expect(leido.peso[0].kg).toBe(80.5)
    expect(leido.fotos[0].base64).toBe('AAAA')
  })
  it('rechaza archivos ajenos', () => {
    expect(() => leerRespaldo('{"hola":1}')).toThrow(/no es un respaldo/)
    expect(() => leerRespaldo('no json')).toThrow(/JSON/)
  })
})
