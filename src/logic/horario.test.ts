import { describe, it, expect } from 'vitest'
import { versionAutomatica, estadoTiempo, estadoSiSalgo, limites, type Duraciones } from './horario'
import { duracionEstimada, minutosHastaUltimaPesa, segundosPesas } from './duracion'
import { listaDe } from '../data/ejercicios'
import { SETTINGS_DEFAULT } from '../data/tipos'
import { minutosDe } from './fechas'

const en = (h: string) => new Date(`2026-10-07T${h}:00`)
const DUR: Duraciones = { completa: minutosHastaUltimaPesa(listaDe('A'), 'completa'), corta: minutosHastaUltimaPesa(listaDe('A', 'corta'), 'corta') }

describe('duración estimada (RUTINA-FINAL.md, 3)', () => {
  it('45 s por serie, descansos completos, 1 min entre ejercicios y 2 al cambiar de zona', () => {
    // jalón: 3 × (45 + 75) = 360 s; remo: 360; entre los dos, misma zona: 60 s
    expect(segundosPesas(listaDe('A').slice(0, 2))).toBe(780)
    // jalón → press inclinado cambia de zona: 120 s
    expect(segundosPesas([listaDe('A')[0], listaDe('A')[2]])).toBe(360 + 120 + 405)
  })
  it('A y B cerca de la hora; con pierna un poco más; corta unos 30; CASA 12', () => {
    expect(duracionEstimada(listaDe('A'), 'completa')).toBe(63)
    expect(duracionEstimada(listaDe('B'), 'completa')).toBe(62)
    expect(duracionEstimada(listaDe('A', 'completa', true), 'completa', { pierna: true })).toBe(65)
    expect(duracionEstimada(listaDe('A', 'corta'), 'corta')).toBe(30)
    expect(duracionEstimada(listaDe('B', 'corta'), 'corta')).toBe(30)
    expect(duracionEstimada(listaDe('CASA'), 'completa', { casa: true })).toBe(12)
    expect(duracionEstimada(listaDe('A'), 'bonus')).toBe(73)
  })
})

describe('versión automática (RUTINA-FINAL.md, 3 y 14)', () => {
  const tope = minutosDe('21:10')
  it('20:10 da completa; 20:30, corta; 20:45, casa', () => {
    expect(versionAutomatica(minutosDe('20:10'), DUR, tope)).toBe('completa')
    expect(versionAutomatica(minutosDe('20:30'), DUR, tope)).toBe('corta')
    expect(versionAutomatica(minutosDe('20:45'), DUR, tope)).toBe('casa')
  })
  it('completa hasta las 20:17 y corta hasta las 20:44 con las duraciones de la rutina', () => {
    const l = limites(DUR, tope)
    expect(l.completa).toBe(minutosDe('20:17'))
    expect(l.corta).toBe(minutosDe('20:44'))
    expect(versionAutomatica(l.completa, DUR, tope)).toBe('completa')
    expect(versionAutomatica(l.completa + 1, DUR, tope)).toBe('corta')
    expect(versionAutomatica(l.corta, DUR, tope)).toBe('corta')
    expect(versionAutomatica(l.corta + 1, DUR, tope)).toBe('casa')
  })
  it('con 3 hechas la completa es bonus, pero si solo alcanza la corta va corta', () => {
    expect(versionAutomatica(minutosDe('19:00'), DUR, tope, true)).toBe('bonus')
    expect(versionAutomatica(minutosDe('20:30'), DUR, tope, true)).toBe('corta')
  })
  it('respeta la hora tope de ajustes', () => {
    expect(estadoTiempo(en('19:30'), { horaTope: '19:50' }, DUR).version).toBe('casa')
    expect(estadoTiempo(en('19:30'), { horaTope: '20:00' }, DUR).version).toBe('corta')
    expect(estadoTiempo(en('19:30'), SETTINGS_DEFAULT, DUR).version).toBe('completa')
  })
  it('textos de Hoy', () => {
    expect(estadoTiempo(en('10:00'), SETTINGS_DEFAULT, DUR).detalle).toBe('Antes de las 7. Sin prisa.')
    expect(estadoTiempo(en('19:30'), SETTINGS_DEFAULT, DUR).detalle).toBe('Completa hasta las 8:17 pm.')
    expect(estadoTiempo(en('20:30'), SETTINGS_DEFAULT, DUR).detalle).toBe('Tienes 40 min hasta la última pesa. Corta hasta las 8:44 pm.')
    expect(estadoTiempo(en('20:50'), SETTINGS_DEFAULT, DUR).titulo).toBe('Hoy ya no alcanza ni la corta.')
  })
})

describe('salgo de la oficina a las', () => {
  it('suma carretera y casa-club', () => {
    // 18:30 + 60 + 30 = 20:00 → completa; 18:40 → 20:10 completa; 18:50 → 20:20 corta; 19:20 → 20:50 casa
    expect(estadoSiSalgo('18:30', SETTINGS_DEFAULT, DUR).version).toBe('completa')
    expect(estadoSiSalgo('18:50', SETTINGS_DEFAULT, DUR).version).toBe('corta')
    expect(estadoSiSalgo('19:20', SETTINGS_DEFAULT, DUR).version).toBe('casa')
  })
  it('usa minutos configurables', () => {
    expect(estadoSiSalgo('19:20', { ...SETTINGS_DEFAULT, minCarretera: 40, minCasaClub: 10 }, DUR).version).toBe('completa')
  })
})
