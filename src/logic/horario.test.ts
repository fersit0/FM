import { describe, it, expect } from 'vitest'
import { estadoTiempo, estadoSiSalgo, versionInicial } from './horario'
import { SETTINGS_DEFAULT } from '../data/tipos'

const en = (h: string) => new Date(`2026-09-22T${h}:00`)

describe('regla de horario', () => {
  it('8:05 pm o antes: completa', () => {
    expect(estadoTiempo(en('20:05'), SETTINGS_DEFAULT).estado).toBe('completa')
    expect(estadoTiempo(en('18:30'), SETTINGS_DEFAULT).estado).toBe('completa')
    expect(estadoTiempo(en('10:00'), SETTINGS_DEFAULT).estado).toBe('completa')
  })
  it('entre 8:05 y 8:25: corta', () => {
    expect(estadoTiempo(en('20:06'), SETTINGS_DEFAULT).estado).toBe('corta')
    expect(estadoTiempo(en('20:25'), SETTINGS_DEFAULT).estado).toBe('corta')
  })
  it('después de 8:25: hoy ya no', () => {
    expect(estadoTiempo(en('20:26'), SETTINGS_DEFAULT).estado).toBe('no')
    expect(estadoTiempo(en('22:00'), SETTINGS_DEFAULT).estado).toBe('no')
  })
  it('calcula los minutos hasta la última pesa', () => {
    expect(estadoTiempo(en('20:00'), SETTINGS_DEFAULT).minutosParaTope).toBe(70)
    expect(estadoTiempo(en('20:00'), SETTINGS_DEFAULT).detalle).toBe('Tienes 70 minutos. Alcanza para algo bueno.')
  })
  it('respeta horas personalizadas', () => {
    const s = { ...SETTINGS_DEFAULT, horaCompleta: '19:00', horaCorta: '19:20', horaTope: '20:00' }
    expect(estadoTiempo(en('19:10'), s).estado).toBe('corta')
    expect(estadoTiempo(en('19:30'), s).estado).toBe('no')
  })
})

describe('salgo de la oficina a las', () => {
  it('suma carretera y casa-club', () => {
    // 18:30 + 60 + 30 = 20:00 -> completa
    expect(estadoSiSalgo('18:30', SETTINGS_DEFAULT).estado).toBe('completa')
    // 18:40 + 90 = 20:10 -> corta
    expect(estadoSiSalgo('18:40', SETTINGS_DEFAULT).estado).toBe('corta')
    // 19:00 + 90 = 20:30 -> no
    expect(estadoSiSalgo('19:00', SETTINGS_DEFAULT).estado).toBe('no')
  })
  it('usa minutos configurables', () => {
    expect(estadoSiSalgo('19:00', { ...SETTINGS_DEFAULT, minCarretera: 40, minCasaClub: 20 }).estado).toBe('completa')
  })
})

describe('versión inicial', () => {
  it('abre en corta si el tiempo no da, y en bonus con 3 cumplidas', () => {
    expect(versionInicial('completa', false)).toBe('completa')
    expect(versionInicial('corta', false)).toBe('corta')
    expect(versionInicial('no', false)).toBe('corta')
    expect(versionInicial('completa', true)).toBe('bonus')
    expect(versionInicial('corta', true)).toBe('corta')
  })
})

describe('texto antes de las 7', () => {
  it('no cuenta minutos cuando falta mucho', () => {
    expect(estadoTiempo(en('10:00'), SETTINGS_DEFAULT).detalle).toBe('Antes de las 7. Sin prisa.')
    expect(estadoTiempo(en('19:30'), SETTINGS_DEFAULT).detalle).toBe('Tienes 100 minutos. Sobra.')
  })
})
