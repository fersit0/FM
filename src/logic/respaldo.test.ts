import { describe, it, expect } from 'vitest'
import { tocaRespaldo, armarRespaldo, leerRespaldo } from './respaldo'
import { SETTINGS_DEFAULT } from '../data/tipos'

describe('respaldo', () => {
  it('exporta e importa sin perder nada', () => {
    const r = armarRespaldo({
      settings: { ...SETTINGS_DEFAULT, minCarretera: 45 },
      sesiones: [{ id: 'x', fecha: '2026-09-21', tipo: 'A', version: 'completa', inicio: 1, fin: 2, terminada: true }],
      sets: [{ id: 7, sessionId: 'x', exerciseId: 'press-plano', ejercicioBaseId: 'press-plano', numSerie: 1, pesoKg: 14, reps: 10, fecha: '2026-09-21', hora: 1 }],
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

describe('tocaRespaldo', () => {
  const ses = [{ fecha: '2026-09-01', terminada: true }, { fecha: '2026-09-10', terminada: true }]
  it('sin sesiones no molesta', () => { expect(tocaRespaldo(undefined, [], '2026-10-01')).toBe(false) })
  it('nunca respaldado: cuenta desde la primera sesión', () => {
    expect(tocaRespaldo(undefined, ses, '2026-09-14')).toBe(false)
    expect(tocaRespaldo(undefined, ses, '2026-09-15')).toBe(true)
  })
  it('respaldado hace menos de 14 días: no; hace 14 o más: sí', () => {
    expect(tocaRespaldo('2026-09-20', ses, '2026-10-01')).toBe(false)
    expect(tocaRespaldo('2026-09-17', ses, '2026-10-01')).toBe(true)
  })
})
