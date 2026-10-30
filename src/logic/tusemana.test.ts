import { describe, it, expect } from 'vitest'
import { tuSemana } from './tusemana'
import type { Sesion } from '../data/tipos'

function sesion(fecha: string, tipo: Sesion['tipo']): Sesion {
  const d = new Date(fecha + 'T20:00:00')
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: d.getTime(), fin: d.getTime() + 3600e3, terminada: true }
}

// semana del lunes 5 al domingo 11 de octubre de 2026
const LUN = '2026-10-05', MAR = '2026-10-06', MIE = '2026-10-07', JUE = '2026-10-08', VIE = '2026-10-09', SAB = '2026-10-10', DOM = '2026-10-11'
const SEMANA = [LUN, MAR, MIE, JUE, VIE, SAB, DOM]
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
  it('cuando el día ya no da para una de club (21:00, el domingo 19:00), lo que falta pasa a los días que siguen', () => {
    // Frida torso, faltó el jueves: el jueves a las 9:30 pm la B va el viernes, como dice el aviso
    const ft = [{ ...sesion(LUN, 'FRIDA'), fridaTipo: 'torso' as const }, sesion(MAR, 'A')]
    expect(planDe(ft, {}, en(JUE, '20:59'))).toEqual({ [JUE]: 'B' })
    expect(planDe(ft, {}, en(JUE, '21:30'))).toEqual({ [VIE]: 'B' })
    // Frida pierna, faltó el martes: el martes a las 10 pm, A el jueves y B el viernes
    expect(planDe([{ ...sesion(LUN, 'FRIDA'), fridaTipo: 'pierna' }], {}, en(MAR, '22:00'))).toEqual({ [JUE]: 'A', [VIE]: 'B' })
    // el domingo después de las 7 pm ya no hay plan
    expect(planDe(ft, {}, en(DOM, '18:59'))).toEqual({ [DOM]: 'B' })
    expect(planDe(ft, {}, en(DOM, '19:30'))).toEqual({})
  })
  it('Frida movida al martes: ese día va la A en la mañana y Frida en la noche, y la B el jueves', () => {
    const dias = tuSemana([], [], { fridaPlan: { [LUN]: MAR } }, en(LUN, '21:00'))
    expect(dias[1]).toMatchObject({ plan: 'A', conFrida: true })
    expect(planDe([], { fridaPlan: { [LUN]: MAR } }, en(LUN, '21:00'))).toEqual({ [MAR]: 'A', [JUE]: 'B' })
    // y ya registrada la A en la mañana, el martes sigue con Frida planeada
    const conA = tuSemana([sesion(MAR, 'A')], [], { fridaPlan: { [LUN]: MAR } }, en(MAR, '10:00'))
    expect(conA[1]).toMatchObject({ plan: 'F', hecho: [{ tipo: 'A', noche: false }] })
  })
  // Las nueve semanas de la tabla de la sección 2: cada día a las 6 am, con lo hecho antes, el plan de ese día es lo
  // que dice la tabla (las extras no se planean)
  const fp = (f: string): Sesion => ({ ...sesion(f, 'FRIDA'), fridaTipo: 'pierna' })
  const ftt = (f: string): Sesion => ({ ...sesion(f, 'FRIDA'), fridaTipo: 'torso' })
  const SIN_FRIDA = { [LUN]: null }
  const TABLA: [string, Record<string, Sesion>, Record<string, string | null>?, string[]?][] = [
    ['Frida pierna', { [LUN]: fp(LUN), [MAR]: sesion(MAR, 'A'), [JUE]: sesion(JUE, 'B') }],
    ['Frida torso', { [LUN]: ftt(LUN), [MAR]: sesion(MAR, 'A'), [JUE]: sesion(JUE, 'B') }],
    ['Sin Frida', { [MAR]: sesion(MAR, 'C'), [JUE]: sesion(JUE, 'A'), [VIE]: sesion(VIE, 'B') }, SIN_FRIDA],
    ['Frida pierna con extra', { [LUN]: fp(LUN), [MAR]: sesion(MAR, 'A'), [JUE]: sesion(JUE, 'B'), [VIE]: sesion(VIE, 'C') }, {}, [VIE]],
    ['Frida pierna, faltó el martes', { [LUN]: fp(LUN), [JUE]: sesion(JUE, 'A'), [VIE]: sesion(VIE, 'B') }],
    ['Frida torso, faltó el jueves', { [LUN]: ftt(LUN), [MAR]: sesion(MAR, 'A'), [VIE]: sesion(VIE, 'B') }],
    ['Martes en la noche', { [LUN]: ftt(LUN), [MAR]: { ...sesion(MAR, 'A'), momento: 'noche' }, [JUE]: sesion(JUE, 'B') }],
    ['Frida el miércoles, torso', { [MAR]: sesion(MAR, 'A'), [MIE]: ftt(MIE), [JUE]: sesion(JUE, 'B') }, { [LUN]: MIE }],
    ['Sin Frida, sin viernes', { [MAR]: sesion(MAR, 'C'), [JUE]: sesion(JUE, 'A'), [DOM]: sesion(DOM, 'B') }, SIN_FRIDA],
  ]
  for (const [nombre, hechas, fridaPlan = {}, extras = []] of TABLA) {
    it(`la tabla de la sección 2, día por día: ${nombre}`, () => {
      for (const f of SEMANA) {
        const s = hechas[f]
        if (!s || extras.includes(f)) continue
        const antes = Object.values(hechas).filter((x) => x.fecha < f)
        const dia = tuSemana(antes, [], { fridaPlan }, en(f, '06:00')).find((d) => d.fecha === f)!
        expect(dia.plan, `${nombre}, ${f}`).toBe(s.tipo === 'FRIDA' ? 'F' : s.tipo)
      }
    })
  }
})
