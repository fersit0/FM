import { describe, it, expect } from 'vitest'
import { SETTINGS_DEFAULT } from '../data/tipos'
import { listaDe } from '../data/ejercicios'
import { duracionesDe, duracionEstimada, segundosPorSerie, segundosPesas, minutosHastaUltimaPesa } from './duracion'
import { franjaDe, franjaDeSesion, topeDe, versionAutomatica, versionParaHora, limites, estadoTiempo, estadoSiSalgo, lineaSesion, horaCorta } from './horario'

// martes 24 de noviembre de 2026
const a = (dia: number, h: number, m = 0) => new Date(2026, 10, dia, h, m)
const AJ = SETTINGS_DEFAULT
const V7 = { ...SETTINGS_DEFAULT, salidaManana: '08:40', minBano: 25 }
const A = duracionesDe('A')
const B = duracionesDe('B')

describe('duración estimada (RUTINA-FINAL.md, 3, con las sesiones de MANANAS-30.md, 2)', () => {
  it('segundos por serie según el rango de repeticiones', () => {
    expect(segundosPorSerie({ repsMin: 8, repsMax: 10 })).toBe(40)
    expect(segundosPorSerie({ repsMin: 10, repsMax: 12 })).toBe(45)
    expect(segundosPorSerie({ repsMin: 12, repsMax: 15 })).toBe(50)
    expect(segundosPorSerie({ repsMin: 12, repsMax: 20 })).toBe(55)
  })
  it('descansos completos, 1 min entre ejercicios y 2 al cambiar de zona', () => {
    // A, toda en bancos: 4×(40+90) + 4×(55+60) + 2×(50+60) + 2×(45+60) y tres cambios de 1 min
    expect(segundosPesas(listaDe('A'))).toBe(520 + 460 + 220 + 210 + 180)
    // B: de poleas a terraza son 2 min
    expect(segundosPesas(listaDe('B'))).toBe(360 + 360 + 405 + 180 + 60 + 120 + 60)
  })
  it('A y B caben en 30 min con calentamiento de 3; la corta, 14 con la serie de aproximación', () => {
    expect(A).toEqual({ completa: 29.5, minima: 20 + 1 / 3, corta: 14.25 })
    expect(B).toEqual({ completa: 28.75, minima: 16, corta: 14 })
    expect(duracionEstimada(listaDe('A'), 'completa')).toBe(30)
    expect(duracionEstimada(listaDe('B'), 'completa')).toBe(29)
    expect(duracionEstimada(listaDe('A', 'corta'), 'corta')).toBe(14)
    expect(minutosHastaUltimaPesa(listaDe('B', 'corta'), 'corta')).toBe(14)
    expect(duracionEstimada([], 'completa', { casa: true })).toBe(12)
  })
})

describe('franjas y topes (RUTINA-FINAL.md v7, 3, y MANANAS-30.md, 4)', () => {
  it('de lunes a viernes antes de las 12 es mañana; el lunes en la tarde el club no abre; lo demás es noche', () => {
    expect(franjaDe(a(23, 7, 30))).toBe('manana')
    expect(franjaDe(a(24, 7, 40))).toBe('manana')
    expect(franjaDe(a(27, 11, 59))).toBe('manana')
    expect(franjaDe(a(23, 13))).toBe('cerrado')
    expect(franjaDe(a(24, 19))).toBe('noche')
    expect(franjaDe(a(28, 9))).toBe('noche')
    expect(franjaDe(a(29, 11))).toBe('noche')
  })
  it('tope: 8:10 en la mañana (8:45 menos 35 de baño), 21:15 en la noche, 18:45 el domingo, ninguno con el club cerrado', () => {
    expect(topeDe(a(24, 7), AJ)).toBe(8 * 60 + 10)
    expect(topeDe(a(24, 7), V7)).toBe(8 * 60 + 15)
    expect(topeDe(a(24, 19), AJ)).toBe(21 * 60 + 15)
    expect(topeDe(a(29, 11), AJ)).toBe(18 * 60 + 45)
    expect(topeDe(a(23, 13), AJ)).toBeNull()
  })
  it('la sesión ya empezada toma la franja del día y la hora de inicio', () => {
    expect(franjaDeSesion(a(24, 7, 40).getTime())).toBe('manana')
    expect(franjaDeSesion(a(24, 19).getTime())).toBe('noche')
    expect(franjaDeSesion(a(28, 9).getTime())).toBe('noche')
    expect(franjaDeSesion(a(23, 13).getTime())).toBe('noche')
  })
})

describe('versión automática en la mañana (MANANAS-30.md, 4)', () => {
  it('un martes con la salida a las 8:45 y 35 de baño: A a las 7:42 da la completa, 7:52 la corta, 8:20 solo regadera', () => {
    expect(versionParaHora(a(24, 7, 42), A, AJ)).toBe('completa')
    expect(versionParaHora(a(24, 7, 52), A, AJ)).toBe('corta')
    expect(versionParaHora(a(24, 8, 20), A, AJ)).toBe('regadera')
  })
  it('con los ajustes de la v7 (8:40 y 25 de baño): 7:42 la completa, 7:58 la corta, 8:20 solo regadera', () => {
    expect(versionParaHora(a(24, 7, 42), A, V7)).toBe('completa')
    expect(versionParaHora(a(24, 7, 58), A, V7)).toBe('corta')
    expect(versionParaHora(a(24, 8, 20), A, V7)).toBe('regadera')
    expect(versionParaHora(a(24, 7, 58), B, V7)).toBe('completa')
  })
  it('la completa se empieza mientras quepan sus dos primeros ejercicios: lo demás se recorta en el camino', () => {
    expect(limites(A, 8 * 60 + 10)).toEqual({ completa: 7 * 60 + 40, minima: 7 * 60 + 49, corta: 7 * 60 + 55 })
    expect(versionParaHora(a(24, 7, 49), A, AJ)).toBe('completa')
    expect(versionParaHora(a(24, 7, 50), A, AJ)).toBe('corta')
    expect(versionParaHora(a(24, 7, 55), A, AJ)).toBe('corta')
    expect(versionParaHora(a(24, 7, 56), A, AJ)).toBe('regadera')
  })
  it('en la mañana nunca ofrece casa y en la noche nunca solo regadera', () => {
    for (let m = 6 * 60; m < 12 * 60; m += 5) expect(versionAutomatica(m, A, 8 * 60 + 10, 'manana')).not.toBe('casa')
    for (let m = 12 * 60; m < 23 * 60; m += 5) expect(versionAutomatica(m, A, 21 * 60 + 15, 'noche')).not.toBe('regadera')
  })
  it('textos de Hoy: completa, recortada, corta y solo regadera', () => {
    expect(estadoTiempo(a(24, 7, 30), AJ, A)).toMatchObject({ version: 'completa', recortada: false, titulo: 'Alcanza la completa', detalle: 'Completa si empiezas a las 7:40 am o antes.' })
    expect(estadoTiempo(a(24, 7, 45), AJ, A)).toMatchObject({ version: 'completa', recortada: true, titulo: 'Alcanza recortada', detalle: 'Lo que no quepa antes de las 8:10 am se recorta solo.' })
    expect(estadoTiempo(a(24, 7, 52), AJ, A)).toMatchObject({ version: 'corta', minutosParaTope: 18 })
    expect(estadoTiempo(a(24, 8, 0), AJ, A)).toMatchObject({ version: 'regadera', franja: 'manana', titulo: 'Hoy solo regadera.' })
  })
})

describe('versión automática en la noche y en fin de semana (RUTINA-FINAL.md v7, 3)', () => {
  it('martes en la noche: 20:15 completa, 20:58 corta, 21:02 casa', () => {
    expect(versionParaHora(a(24, 20, 15), A, AJ)).toBe('completa')
    expect(versionParaHora(a(24, 20, 58), A, AJ)).toBe('corta')
    expect(versionParaHora(a(24, 21, 2), A, AJ)).toBe('casa')
  })
  it('un domingo a las 11, la completa (tope 18:45); a las 18:40, casa', () => {
    expect(versionParaHora(a(29, 11), A, AJ)).toBe('completa')
    expect(versionParaHora(a(29, 18, 40), A, AJ)).toBe('casa')
  })
  it('el lunes en la tarde el club no abre', () => {
    expect(versionParaHora(a(23, 18), A, AJ)).toBe('cerrado')
    expect(estadoTiempo(a(23, 18), AJ, A)).toMatchObject({ version: 'cerrado', titulo: 'El club ya cerró.' })
  })
  it('respeta la última pesa de la noche de ajustes', () => {
    expect(versionParaHora(a(24, 20, 30), A, { ...AJ, ultimaPesaNoche: '20:30' })).toBe('casa')
  })
  it('"Salgo de la oficina a las": suma carretera y casa-club', () => {
    const r = estadoSiSalgo('18:30', AJ, A, a(24, 10))
    expect(r.llegadaMin).toBe(20 * 60)
    expect(r.version).toBe('completa')
  })
})

describe('línea de la sesión', () => {
  it('en la mañana dice a qué hora sales; en la noche, solo cuándo terminan las pesas', () => {
    expect(lineaSesion(7 * 60 + 42, 8 * 60 + 9, 'completa', 'manana', AJ)).toBe('Empezaste 7:42 · completa · terminas pesas 8:09 · sales 8:45')
    expect(lineaSesion(20 * 60 + 22, 20 * 60 + 36, 'corta', 'noche', AJ)).toBe('Empezaste 8:22 · va la corta · terminas pesas 8:36')
    expect(horaCorta(12 * 60 + 5)).toBe('12:05')
  })
})
