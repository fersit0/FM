import { describe, it, expect } from 'vitest'
import { versionAutomatica, estadoTiempo, estadoSiSalgo, limites } from './horario'
import { duracionEstimada, minutosHastaUltimaPesa, segundosPesas, segundosPorSerie, duracionesDe } from './duracion'
import { listaDe } from '../data/ejercicios'
import { SETTINGS_DEFAULT } from '../data/tipos'
import { minutosDe } from './fechas'

const en = (h: string, fecha = '2026-10-07') => new Date(`${fecha}T${h}:00`)
const DUR_A = duracionesDe('A')
const DUR_B = duracionesDe('B')
const DUR_C = duracionesDe('C')

describe('duración estimada (RUTINA-FINAL.md, 3)', () => {
  it('segundos por serie según el rango: 40 de 8-10, 45 de 10-12, 50 de 12-15, 55 de 12-20', () => {
    expect(segundosPorSerie({ repsMin: 8, repsMax: 10 })).toBe(40)
    expect(segundosPorSerie({ repsMin: 10, repsMax: 12 })).toBe(45)
    expect(segundosPorSerie({ repsMin: 12, repsMax: 15 })).toBe(50)
    expect(segundosPorSerie({ repsMin: 12, repsMax: 20 })).toBe(55)
    expect(segundosPorSerie({ repsMin: 15, repsMax: 20 })).toBe(55)
    expect(segundosPorSerie({ repsMin: 12, repsMax: 12 })).toBe(45)
  })
  it('descansos completos, 1 min entre ejercicios y 2 al cambiar de zona', () => {
    const a = listaDe('A')
    // press inclinado 3 × (40 + 90) = 390; aperturas 2 × (50 + 60) = 220; misma zona: 60
    expect(segundosPesas(a.slice(0, 2))).toBe(390 + 60 + 220)
    // tríceps (bancos) → goblet (terraza): 120
    expect(segundosPesas(a.slice(3, 5))).toBe(210 + 120 + 405)
  })
  it('A unos 58, B unos 64, C unos 58 con calentamiento y cierre; la corta unos 31; CASA 12', () => {
    expect(duracionEstimada(listaDe('A'), 'completa')).toBe(58)
    expect(duracionEstimada(listaDe('B'), 'completa')).toBe(64)
    expect(duracionEstimada(listaDe('C'), 'completa')).toBe(58)
    expect(duracionEstimada(listaDe('A', 'corta'), 'corta')).toBe(32)
    expect(duracionEstimada(listaDe('B', 'corta'), 'corta')).toBe(31)
    expect(duracionEstimada(listaDe('C', 'corta'), 'corta')).toBe(31)
    expect(duracionEstimada(listaDe('CASA'), 'completa', { casa: true })).toBe(12)
  })
  it('hasta la última pesa: calentamiento más pesas, sin cierre', () => {
    expect(minutosHastaUltimaPesa(listaDe('A'), 'completa')).toBeCloseTo(8 + 2410 / 60, 2)
    expect(DUR_B.completa).toBeCloseTo(8 + 2730 / 60, 2)
    expect(DUR_B.corta).toBeCloseTo(5 + 1275 / 60, 2)
  })
})

describe('versión automática (RUTINA-FINAL.md, 3 y 14)', () => {
  const tope = minutosDe('21:10')
  it('20:10 da completa; 20:30, corta; 20:45, casa, en A, B y C', () => {
    for (const d of [DUR_A, DUR_B, DUR_C]) {
      expect(versionAutomatica(minutosDe('20:10'), d, tope)).toBe('completa')
      expect(versionAutomatica(minutosDe('20:30'), d, tope)).toBe('corta')
      expect(versionAutomatica(minutosDe('20:45'), d, tope)).toBe('casa')
    }
  })
  it('límites: B completa hasta las 20:16 y corta hasta las 20:43', () => {
    const l = limites(DUR_B, tope)
    expect(l.completa).toBe(minutosDe('20:16'))
    expect(l.corta).toBe(minutosDe('20:43'))
    expect(versionAutomatica(l.completa, DUR_B, tope)).toBe('completa')
    expect(versionAutomatica(l.completa + 1, DUR_B, tope)).toBe('corta')
    expect(versionAutomatica(l.corta, DUR_B, tope)).toBe('corta')
    expect(versionAutomatica(l.corta + 1, DUR_B, tope)).toBe('casa')
  })
  it('un domingo a las 11 am, completa; y en domingo siempre completa aunque sea tarde', () => {
    expect(estadoTiempo(en('11:00', '2026-10-11'), SETTINGS_DEFAULT, DUR_B).version).toBe('completa')
    expect(estadoTiempo(en('20:45', '2026-10-11'), SETTINGS_DEFAULT, DUR_B).version).toBe('completa')
    expect(estadoTiempo(en('20:45', '2026-10-08'), SETTINGS_DEFAULT, DUR_B).version).toBe('casa')
  })
  it('respeta la hora tope de ajustes', () => {
    expect(estadoTiempo(en('19:30'), { horaTope: '19:50' }, DUR_A).version).toBe('casa')
    expect(estadoTiempo(en('19:30'), { horaTope: '20:00' }, DUR_A).version).toBe('corta')
    expect(estadoTiempo(en('19:30'), SETTINGS_DEFAULT, DUR_A).version).toBe('completa')
  })
  it('textos de Hoy', () => {
    expect(estadoTiempo(en('10:00'), SETTINGS_DEFAULT, DUR_B).detalle).toBe('Antes de las 7. Sin prisa.')
    expect(estadoTiempo(en('19:30'), SETTINGS_DEFAULT, DUR_B).detalle).toBe('Completa hasta las 8:16 pm.')
    expect(estadoTiempo(en('20:30'), SETTINGS_DEFAULT, DUR_B).detalle).toBe('Tienes 40 min hasta la última pesa. Corta hasta las 8:43 pm.')
    expect(estadoTiempo(en('20:50'), SETTINGS_DEFAULT, DUR_B).titulo).toBe('Hoy ya no alcanza ni la corta.')
  })
})

describe('salgo de la oficina a las', () => {
  it('suma carretera y casa-club', () => {
    // 18:30 + 60 + 30 = 20:00 → completa; 18:50 → 20:20 corta; 19:20 → 20:50 casa
    expect(estadoSiSalgo('18:30', SETTINGS_DEFAULT, DUR_B).version).toBe('completa')
    expect(estadoSiSalgo('18:50', SETTINGS_DEFAULT, DUR_B).version).toBe('corta')
    expect(estadoSiSalgo('19:20', SETTINGS_DEFAULT, DUR_B).version).toBe('casa')
  })
  it('usa minutos configurables', () => {
    expect(estadoSiSalgo('19:20', { ...SETTINGS_DEFAULT, minCarretera: 40, minCasaClub: 10 }, DUR_B).version).toBe('completa')
  })
})
