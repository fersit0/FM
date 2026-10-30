import { describe, it, expect } from 'vitest'
import { versionAutomatica, versionParaHora, estadoTiempo, estadoSiSalgo, limites, franjaDe, franjaDeSesion, topeDe, lineaSesion } from './horario'
import { duracionEstimada, minutosHastaUltimaPesa, segundosPesas, segundosPorSerie, duracionesDe } from './duracion'
import { listaDe } from '../data/ejercicios'
import { SETTINGS_DEFAULT } from '../data/tipos'
import { minutosDe } from './fechas'

const en = (h: string, fecha = '2026-10-07') => new Date(`${fecha}T${h}:00`)
const DUR_A = duracionesDe('A')
const DUR_B = duracionesDe('B')
const DUR_C = duracionesDe('C')
const DUR_ASP = duracionesDe('A', true)

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
    // press inclinado 4 × (40 + 90) = 520; aperturas 2 × (50 + 60) = 220; misma zona: 60
    expect(segundosPesas(a.slice(0, 2))).toBe(520 + 60 + 220)
    // tríceps (bancos) → goblet (terraza): 120
    expect(segundosPesas(a.slice(3, 5))).toBe(210 + 120 + 405)
  })
  it('calentamiento y pesas, sin cierre (v7): A 49, A sin pierna 46, B 51, C 45; la corta 24 a 26; CASA 12', () => {
    expect(duracionEstimada(listaDe('A'), 'completa')).toBe(49)
    expect(duracionEstimada(listaDe('A', 'completa', true), 'completa')).toBe(46)
    expect(duracionEstimada(listaDe('B'), 'completa')).toBe(51)
    expect(duracionEstimada(listaDe('C'), 'completa')).toBe(45)
    expect(duracionEstimada(listaDe('A', 'corta'), 'corta')).toBe(26)
    expect(duracionEstimada(listaDe('A', 'corta', true), 'corta')).toBe(24)
    expect(duracionEstimada(listaDe('B', 'corta'), 'corta')).toBe(25)
    expect(duracionEstimada(listaDe('C', 'corta'), 'corta')).toBe(25)
    expect(duracionEstimada(listaDe('CASA'), 'completa', { casa: true })).toBe(12)
  })
  it('hasta la última pesa: calentamiento más pesas, sin cierre', () => {
    expect(minutosHastaUltimaPesa(listaDe('A'), 'completa')).toBeCloseTo(5 + 2655 / 60, 2)
    expect(DUR_B.completa).toBeCloseTo(5 + 2730 / 60, 2)
    expect(DUR_B.corta).toBeCloseTo(4 + 1275 / 60, 2)
  })
})

// martes 6 oct 2026, jueves 8, sábado 10, domingo 11, lunes 12
const MAR = '2026-10-06', SAB = '2026-10-10', DOM = '2026-10-11', LUN = '2026-10-12'
const S = SETTINGS_DEFAULT

describe('franjas y topes (RUTINA-FINAL.md v7, 3)', () => {
  it('entre semana antes de las 12 es mañana; el lunes en la tarde el club no abre; lo demás es noche', () => {
    expect(franjaDe(en('06:45', MAR))).toBe('manana')
    expect(franjaDe(en('11:59', LUN))).toBe('manana')
    expect(franjaDe(en('12:00', MAR))).toBe('noche')
    expect(franjaDe(en('18:00', LUN))).toBe('cerrado')
    expect(franjaDe(en('08:00', SAB))).toBe('noche')
    expect(franjaDe(en('11:00', DOM))).toBe('noche')
  })
  it('tope: 8:15 en la mañana (8:40 menos 25 de baño), 21:15 en la noche, 18:45 el domingo, ninguno el lunes en la tarde', () => {
    expect(topeDe(en('06:45', MAR), S)).toBe(minutosDe('08:15'))
    expect(topeDe(en('20:00', MAR), S)).toBe(minutosDe('21:15'))
    expect(topeDe(en('20:00', SAB), S)).toBe(minutosDe('21:15'))
    expect(topeDe(en('11:00', DOM), S)).toBe(minutosDe('18:45'))
    expect(topeDe(en('18:00', LUN), S)).toBeNull()
    expect(topeDe(en('06:45', MAR), { ...S, salidaManana: '09:00', minBano: 20 })).toBe(minutosDe('08:40'))
  })
  it('la sesión ya empezada toma la franja del día y la hora de inicio: el sábado y el domingo antes de las 12 son como la noche', () => {
    const tope = (d: Date) => topeDe(d, S, franjaDeSesion(d.getTime()))
    expect(franjaDeSesion(en('11:50', MAR).getTime())).toBe('manana')
    expect(tope(en('11:50', MAR))).toBe(minutosDe('08:15'))
    expect(franjaDeSesion(en('11:00', DOM).getTime())).toBe('noche')
    expect(tope(en('11:00', DOM))).toBe(minutosDe('18:45'))
    expect(franjaDeSesion(en('10:00', SAB).getTime())).toBe('noche')
    expect(tope(en('10:00', SAB))).toBe(minutosDe('21:15'))
    expect(franjaDeSesion(en('20:15', MAR).getTime())).toBe('noche')
  })
})

describe('versión automática en la mañana (RUTINA-FINAL.md v7, 3 y 14)', () => {
  it('un martes, B a las 6:45 da completa con pesas hasta 7:36; a las 7:20, completa; a las 7:30, corta; a las 7:55, ya no alcanza', () => {
    expect(versionParaHora(en('06:45', MAR), DUR_B, S)).toBe('completa')
    expect(Math.abs(minutosDe('06:45') + DUR_B.completa - minutosDe('07:36'))).toBeLessThan(1)
    expect(versionParaHora(en('07:20', MAR), DUR_B, S)).toBe('completa')
    expect(versionParaHora(en('07:30', MAR), DUR_B, S)).toBe('corta')
    expect(versionParaHora(en('07:55', MAR), DUR_B, S)).toBe('noche')
    expect(estadoTiempo(en('07:55', MAR), S, DUR_B).titulo).toBe('Ya no alcanza en la mañana.')
  })
  it('hasta qué hora alcanza en la mañana: completa A 7:25, A sin pierna 7:29, B 7:24, C 7:30; corta 7:49 a 7:50', () => {
    const tope = minutosDe('08:15')
    expect(limites(DUR_A, tope)).toEqual({ completa: minutosDe('07:25'), corta: minutosDe('07:49') })
    expect(limites(DUR_ASP, tope)).toEqual({ completa: minutosDe('07:29'), corta: minutosDe('07:50') })
    expect(limites(DUR_B, tope)).toEqual({ completa: minutosDe('07:24'), corta: minutosDe('07:49') })
    expect(limites(DUR_C, tope)).toEqual({ completa: minutosDe('07:30'), corta: minutosDe('07:49') })
    for (const d of [DUR_A, DUR_ASP, DUR_B, DUR_C]) {
      const l = limites(d, tope)
      expect(versionAutomatica(l.completa, d, tope, 'manana')).toBe('completa')
      expect(versionAutomatica(l.completa + 1, d, tope, 'manana')).toBe('corta')
      expect(versionAutomatica(l.corta, d, tope, 'manana')).toBe('corta')
      expect(versionAutomatica(l.corta + 1, d, tope, 'manana')).toBe('noche')
    }
  })
  it('en la mañana nunca ofrece casa', () => {
    expect(versionParaHora(en('08:10', MAR), DUR_B, S)).toBe('noche')
  })
})

describe('versión automática en la noche y en fin de semana (RUTINA-FINAL.md v7, 3 y 14)', () => {
  it('martes en la noche: 20:15 completa, 20:45 corta, 21:00 casa, en A, B y C', () => {
    for (const d of [DUR_A, DUR_ASP, DUR_B, DUR_C]) {
      expect(versionParaHora(en('20:15', MAR), d, S)).toBe('completa')
      expect(versionParaHora(en('20:45', MAR), d, S)).toBe('corta')
      expect(versionParaHora(en('21:00', MAR), d, S)).toBe('casa')
    }
  })
  it('hasta qué hora alcanza en la noche: completa A 8:25, A sin pierna 8:29, B 8:24, C 8:30 pm; corta 8:49 a 8:50 pm', () => {
    const tope = minutosDe('21:15')
    expect(limites(DUR_A, tope)).toEqual({ completa: minutosDe('20:25'), corta: minutosDe('20:49') })
    expect(limites(DUR_ASP, tope)).toEqual({ completa: minutosDe('20:29'), corta: minutosDe('20:50') })
    expect(limites(DUR_B, tope)).toEqual({ completa: minutosDe('20:24'), corta: minutosDe('20:49') })
    expect(limites(DUR_C, tope)).toEqual({ completa: minutosDe('20:30'), corta: minutosDe('20:49') })
  })
  it('domingo a las 11, completa (tope 18:45); domingo a las 18:00, ya no alcanza ni la corta', () => {
    expect(versionParaHora(en('11:00', DOM), DUR_B, S)).toBe('completa')
    expect(versionParaHora(en('18:00', DOM), DUR_B, S)).toBe('corta')
    expect(versionParaHora(en('18:30', DOM), DUR_B, S)).toBe('casa')
  })
  it('lunes en la tarde no ofrece sesión de club', () => {
    expect(versionParaHora(en('18:00', LUN), DUR_B, S)).toBe('cerrado')
    expect(estadoTiempo(en('18:00', LUN), S, DUR_B).version).toBe('cerrado')
  })
  it('sábado en la mañana es fin de semana: tope 21:15, completa', () => {
    expect(versionParaHora(en('08:30', SAB), DUR_B, S)).toBe('completa')
  })
  it('respeta la última pesa de la noche de ajustes', () => {
    expect(estadoTiempo(en('19:30', MAR), { ...S, ultimaPesaNoche: '19:50' }, DUR_A).version).toBe('casa')
    expect(estadoTiempo(en('19:30', MAR), { ...S, ultimaPesaNoche: '20:00' }, DUR_A).version).toBe('corta')
  })
  it('textos de Hoy', () => {
    expect(estadoTiempo(en('06:30', MAR), S, DUR_B).detalle).toBe('Completa hasta las 7:24 am.')
    expect(estadoTiempo(en('19:30', MAR), S, DUR_B).detalle).toBe('Completa hasta las 8:24 pm.')
    expect(estadoTiempo(en('20:40', MAR), S, DUR_B).detalle).toBe('Tienes 35 min hasta la última pesa. Corta hasta las 8:49 pm.')
    expect(estadoTiempo(en('21:00', MAR), S, DUR_B).titulo).toBe('Hoy ya no alcanza ni la corta.')
  })
})

describe('línea de la sesión (RUTINA-FINAL.md v7, 3)', () => {
  it('en la mañana dice hasta cuándo hay sauna, o cuántos minutos quedan de sauna y baño si la última pesa pasa de las 7:40', () => {
    expect(lineaSesion(minutosDe('06:47'), minutosDe('07:36'), 'completa', 'manana', S)).toBe('Empezaste 6:47 · completa · terminas pesas 7:36 · sauna hasta 8:40')
    expect(lineaSesion(minutosDe('07:20'), minutosDe('07:52'), 'completa', 'manana', S)).toBe('Empezaste 7:20 · completa · terminas pesas 7:52 · te quedan 48 min de sauna y baño')
  })
  it('en la noche, como en la v6', () => {
    expect(lineaSesion(minutosDe('20:22'), minutosDe('20:50'), 'corta', 'noche', S)).toBe('Empezaste 8:22 · va la corta · terminas pesas 8:50')
  })
})

describe('salgo de la oficina a las', () => {
  it('suma carretera y casa-club y contesta para la noche de ese día', () => {
    // 18:30 + 60 + 30 = 20:00 → completa; 18:50 → 20:20 completa; 19:00 → 20:30 corta; 19:30 → 21:00 casa
    expect(estadoSiSalgo('18:30', S, DUR_B, en('09:00', MAR)).version).toBe('completa')
    expect(estadoSiSalgo('19:00', S, DUR_B, en('09:00', MAR)).version).toBe('corta')
    expect(estadoSiSalgo('19:30', S, DUR_B, en('09:00', MAR)).version).toBe('casa')
  })
  it('usa minutos configurables', () => {
    expect(estadoSiSalgo('19:30', { ...S, minCarretera: 40, minCasaClub: 10 }, DUR_B, en('09:00', MAR)).version).toBe('completa')
  })
})
