import { describe, it, expect } from 'vitest'
import type { Sesion, SesionTipo, Settings } from '../data/tipos'
import { tuSemana } from './tusemana'
import { desdeClave } from './fechas'

// semana del lunes 23 al domingo 29 de noviembre de 2026
const L = '2026-11-23', M = '2026-11-24', X = '2026-11-25', S = '2026-11-28'
const s = (fecha: string, tipo: SesionTipo, extra: Partial<Sesion> = {}): Sesion => ({ id: `${fecha}-${tipo}`, fecha, tipo, version: 'completa', inicio: new Date(`${fecha}T07:40:00`).getTime(), terminada: true, ...extra })
const dia = (f: string, h = 7, m = 0) => { const d = desdeClave(f); d.setHours(h, m); return d }
const AJ: Pick<Settings, 'salidaManana' | 'v8Desde'> = { salidaManana: '08:45', v8Desde: L }
const plan = (sesiones: Sesion[], ahora: Date, ajustes: Partial<Settings> = {}) => tuSemana(sesiones, [], { ...AJ, ...ajustes }, ahora).map((d) => d.plan)
const hecho = (sesiones: Sesion[], ahora: Date) => tuSemana(sesiones, [], AJ, ahora).map((d) => d.hecho.map((h) => (h.tipo === 'FRIDA' ? `F${h.fridaTipo === 'pierna' ? 'P' : 'T'}` : h.tipo)).join('+'))

describe('Tu semana (MANANAS-30.md, 5)', () => {
  it('lunes sin nada: de lunes a viernes va A, B, A, B, A; sábado y domingo sin plan', () => {
    expect(plan([], dia(L))).toEqual(['A', 'B', 'A', 'B', 'A', null, null])
  })
  it('lo hecho va con su letra y lo que falta sigue la rotación', () => {
    const d = tuSemana([s(L, 'A')], [], AJ, dia(M))
    expect(d.map((x) => x.plan)).toEqual([null, 'B', 'A', 'B', 'A', null, null])
    expect(d[0].hecho).toEqual([{ tipo: 'A', noche: false }])
    expect(d.map((x) => x.letra).join('')).toBe('LMMJVSD')
    expect(d.map((x) => x.hoy)).toEqual([false, true, false, false, false, false, false])
    expect(d.map((x) => x.pasado)).toEqual([true, false, false, false, false, false, false])
  })
  it('la visita es un punto lleno, no mueve la rotación y ese día ya no lleva plan', () => {
    const todo = [s(L, 'A'), s(M, 'VISITA')]
    expect(hecho(todo, dia(M, 9))).toEqual(['A', 'VISITA', '', '', '', '', ''])
    expect(plan(todo, dia(M, 8))).toEqual([null, null, 'B', 'A', 'B', null, null])
  })
  it('"Hoy descanso": ese día no lleva plan y la letra pasa al día siguiente', () => {
    expect(plan([s(L, 'A')], dia(M), { descansos: [M] })).toEqual([null, null, 'B', 'A', 'B', null, null])
  })
  it('con pesas y visita el mismo día, se ve solo la de pesas', () => {
    expect(hecho([s(L, 'VISITA'), s(L, 'A')], dia(M))[0]).toBe('A')
  })
  it('Frida sale con su tipo; pierna no mueve la rotación y torso sí', () => {
    const pierna = s(L, 'FRIDA', { fridaTipo: 'pierna', momento: 'noche' })
    expect(hecho([pierna], dia(M))[0]).toBe('FP')
    expect(tuSemana([pierna], [], AJ, dia(M))[0].hecho[0].noche).toBe(true)
    expect(plan([pierna], dia(M))).toEqual([null, 'A', 'B', 'A', 'B', null, null])
    expect(plan([s(L, 'A'), s(L, 'FRIDA', { fridaTipo: 'torso', inicio: new Date(`${L}T20:00:00`).getTime() })], dia(M))).toEqual([null, 'A', 'B', 'A', 'B', null, null])
  })
  it('pasada la salida de la mañana sin club, hoy ya no lleva letra y la rotación pasa a mañana', () => {
    expect(plan([s(L, 'A')], dia(M, 8, 44))).toEqual([null, 'B', 'A', 'B', 'A', null, null])
    expect(plan([s(L, 'A')], dia(M, 8, 45))).toEqual([null, null, 'B', 'A', 'B', null, null])
  })
  it('"Voy en la noche" deja la letra de hoy hasta las 21:00; el lunes no, porque en la tarde el club no abre', () => {
    expect(plan([s(L, 'A')], dia(M, 10), { vaEnLaNoche: M })).toEqual([null, 'B', 'A', 'B', 'A', null, null])
    expect(plan([s(L, 'A')], dia(M, 21), { vaEnLaNoche: M })).toEqual([null, null, 'B', 'A', 'B', null, null])
    expect(plan([], dia(L, 13), { vaEnLaNoche: L })).toEqual([null, 'A', 'B', 'A', 'B', null, null])
    // con visita en la mañana y plan de ir en la noche, mañana ya cuenta la de hoy
    expect(plan([s(L, 'A'), s(M, 'VISITA')], dia(M, 10), { vaEnLaNoche: M })).toEqual([null, 'B', 'A', 'B', 'A', null, null])
  })
  it('"Hoy prefiero B" cambia la de hoy y lo demás sigue desde ahí', () => {
    expect(plan([], dia(L), { sesionElegida: { fecha: L, tipo: 'B' } })).toEqual(['B', 'A', 'B', 'A', 'B', null, null])
  })
  it('en fin de semana no hay plan, solo lo hecho', () => {
    expect(plan([s(L, 'A'), s(X, 'B')], dia(S, 10))).toEqual([null, null, null, null, null, null, null])
    expect(hecho([s(L, 'A'), s(X, 'B'), s(S, 'A')], dia(S, 12))).toEqual(['A', '', 'B', '', '', 'A', ''])
  })
  it('lo de antes de la v8 no decide la primera: toca A', () => {
    expect(plan([s('2026-11-20', 'A')], dia(M), { v8Desde: M })).toEqual([null, 'A', 'B', 'A', 'B', null, null])
  })
})
