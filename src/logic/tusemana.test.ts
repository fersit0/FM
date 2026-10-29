import { describe, it, expect } from 'vitest'
import { tuSemana } from './tusemana'
import type { Sesion } from '../data/tipos'

function sesion(fecha: string, tipo: Sesion['tipo']): Sesion {
  const d = new Date(fecha + 'T20:00:00')
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: d.getTime(), fin: d.getTime() + 3600e3, terminada: true }
}

// semana del lunes 5 al domingo 11 de octubre de 2026
const LUN = '2026-10-05', MAR = '2026-10-06', MIE = '2026-10-07', JUE = '2026-10-08', VIE = '2026-10-09'
const en = (f: string, h = '07:00') => new Date(`${f}T${h}:00`)
const planDe = (s: Sesion[], settings: Parameters<typeof tuSemana>[2], ahora: Date) => Object.fromEntries(tuSemana(s, [], settings, ahora).filter((d) => d.plan).map((d) => [d.fecha, d.plan]))

describe('Tu semana (RUTINA-FINAL.md v7, 2)', () => {
  it('siete días, de lunes a domingo, con hoy marcado y los pasados', () => {
    const dias = tuSemana([], [], {}, en(MIE))
    expect(dias.map((d) => d.letra).join('')).toBe('LMMJVSD')
    expect(dias.filter((d) => d.hoy).map((d) => d.fecha)).toEqual([MIE])
    expect(dias.filter((d) => d.pasado).map((d) => d.fecha)).toEqual([LUN, MAR])
  })
  it('sin Frida, el lunes: C el martes, A el jueves y B el viernes', () => {
    expect(planDe([], { fridaPlan: { [LUN]: null } }, en(LUN))).toEqual({ [MAR]: 'C', [JUE]: 'A', [VIE]: 'B' })
  })
  it('con Frida el lunes: hoy F, el martes A y el jueves B; registrada pierna, igual (la A sale sin pierna en la sesión)', () => {
    expect(planDe([], {}, en(LUN))).toEqual({ [LUN]: 'F', [MAR]: 'A', [JUE]: 'B' })
    expect(planDe([{ ...sesion(LUN, 'FRIDA'), fridaTipo: 'pierna' }], {}, en(LUN, '21:00'))).toEqual({ [MAR]: 'A', [JUE]: 'B' })
  })
  it('Frida el miércoles: A el martes, F el miércoles y B el jueves, respetando la espalda', () => {
    expect(planDe([], { fridaPlan: { [LUN]: MIE } }, en(LUN))).toEqual({ [MAR]: 'A', [MIE]: 'F', [JUE]: 'B' })
  })
  it('"Hoy no" el martes: lo de hoy se pasa al jueves y al viernes', () => {
    const s = [sesion(LUN, 'FRIDA')]
    expect(planDe(s, {}, en(MAR, '09:00'))).toEqual({ [MAR]: 'A', [JUE]: 'B' })
    expect(planDe(s, { noFui: [MAR] }, en(MAR, '09:00'))).toEqual({ [JUE]: 'A', [VIE]: 'B' })
  })
  it('el miércoles es descanso: sin plan hoy, B el jueves', () => {
    expect(planDe([sesion(LUN, 'FRIDA'), sesion(MAR, 'A')], {}, en(MIE))).toEqual({ [JUE]: 'B' })
  })
  it('lo hecho: la letra, o F con pierna o torso; con su noche', () => {
    const s: Sesion[] = [{ ...sesion(LUN, 'FRIDA'), fridaTipo: 'pierna', momento: 'noche' }, { ...sesion(MAR, 'A'), momento: 'manana' }]
    const dias = tuSemana(s, [], {}, en(MIE))
    expect(dias[0].hecho).toEqual([{ tipo: 'FRIDA', fridaTipo: 'pierna', noche: true }])
    expect(dias[1].hecho).toEqual([{ tipo: 'A', noche: false }])
  })
  it('se recalcula con lo registrado: con las tres base hechas ya no hay plan', () => {
    expect(planDe([sesion(LUN, 'FRIDA'), sesion(MAR, 'A'), sesion(JUE, 'B')], {}, en(JUE, '10:00'))).toEqual({})
  })
})
