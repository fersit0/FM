import { describe, it, expect } from 'vitest'
import type { Sesion, SesionTipo } from '../data/tipos'
import { tocaSesion, rotaDe, contadores, textoContadores, avisoAyer, sesionesDeSemana, estadoSemana, habilAnterior, habilSiguiente, fueAlClub, ultimaDeRotacion, casaDisponible, cuenta, seriesPara } from './semana'
import { desdeClave, claveFecha } from './fechas'

// semana del lunes 23 al domingo 29 de noviembre de 2026
const L = '2026-11-23', M = '2026-11-24', X = '2026-11-25', J = '2026-11-26', V = '2026-11-27', S = '2026-11-28', D = '2026-11-29', L2 = '2026-11-30', M2 = '2026-12-01'
const s = (fecha: string, tipo: SesionTipo, extra: Partial<Sesion> = {}): Sesion => ({ id: `${fecha}-${tipo}`, fecha, tipo, version: 'completa', inicio: new Date(`${fecha}T07:40:00`).getTime(), terminada: true, ...extra })
const dia = (f: string, h = 7, m = 40) => { const d = desdeClave(f); d.setHours(h, m); return d }

describe('rotación A y B (MANANAS-30.md, 3)', () => {
  it('sin sesiones toca A, y de ahí se alternan: A lunes, B martes, A miércoles, B jueves, A viernes', () => {
    const hechas: Sesion[] = []
    const orden: string[] = []
    for (const f of [L, M, X, J, V]) { const t = tocaSesion(hechas, dia(f)); orden.push(t); hechas.push(s(f, t)) }
    expect(orden).toEqual(['A', 'B', 'A', 'B', 'A'])
  })
  it('no reinicia por semana: viernes A, el lunes toca B', () => {
    expect(tocaSesion([s(V, 'A')], dia(L2))).toBe('B')
  })
  it('con un día sin ir en medio, sigue donde iba', () => {
    expect(tocaSesion([s(L, 'A')], dia(X))).toBe('B')
    expect(tocaSesion([s(L, 'A'), s(X, 'B')], dia(V))).toBe('A')
  })
  it('Frida torso cuenta como B: viernes A y lunes en la noche Frida torso, el martes toca A', () => {
    const frida = s(L2, 'FRIDA', { fridaTipo: 'torso', momento: 'noche', inicio: new Date(`${L2}T20:00:00`).getTime() })
    expect(tocaSesion([s(V, 'A'), frida], dia(M2))).toBe('A')
    // las FRIDA viejas sin tipo cuentan como torso
    expect(tocaSesion([s(V, 'A'), s(L2, 'FRIDA')], dia(M2))).toBe('A')
  })
  it('Frida pierna, la visita y casa no mueven nada', () => {
    const todo = [s(V, 'A'), s(L2, 'FRIDA', { fridaTipo: 'pierna' }), s(M2, 'VISITA'), s(M2, 'CASA')]
    expect(tocaSesion(todo, dia('2026-12-02'))).toBe('B')
    expect(rotaDe(s(L, 'FRIDA', { fridaTipo: 'pierna' }))).toBeNull()
    expect(rotaDe(s(L, 'VISITA'))).toBeNull()
    expect(rotaDe(s(L, 'CASA'))).toBeNull()
  })
  it('la C vieja (espalda) cuenta como B', () => {
    expect(rotaDe(s(L, 'C'))).toBe('B')
    expect(tocaSesion([s(L, 'C')], dia(M))).toBe('A')
  })
  it('la primera después de actualizar es A: lo de antes de `desde` no cuenta', () => {
    const viejas = [s('2026-11-18', 'B'), s('2026-11-20', 'A')]
    expect(tocaSesion(viejas, dia(M))).toBe('B')
    expect(tocaSesion(viejas, dia(M), [], { desde: M })).toBe('A')
    expect(tocaSesion([...viejas, s(M, 'A')], dia(X), [], { desde: M })).toBe('B')
    expect(ultimaDeRotacion(viejas, [], M)).toBeNull()
  })
  it('"Hoy prefiero…" manda solo ese día y la rotación sigue desde la que se hizo', () => {
    expect(tocaSesion([], dia(M), [], { elegida: { fecha: M, tipo: 'B' } })).toBe('B')
    expect(tocaSesion([], dia(X), [], { elegida: { fecha: M, tipo: 'B' } })).toBe('A')
    expect(tocaSesion([s(M, 'B')], dia(X))).toBe('A')
    // la C ya no se puede elegir
    expect(tocaSesion([], dia(M), [], { elegida: { fecha: M, tipo: 'C' } })).toBe('A')
  })
  it('una sesión abierta cuenta si ya tiene una serie', () => {
    const abierta = s(L, 'A', { terminada: false })
    expect(cuenta(abierta)).toBe(false)
    expect(tocaSesion([abierta], dia(M))).toBe('A')
    expect(tocaSesion([abierta], dia(M), [{ sessionId: abierta.id, exerciseId: 'press-inclinado', ejercicioBaseId: 'press-inclinado', numSerie: 1, pesoKg: 10, reps: 8, fecha: L, hora: 1 }])).toBe('B')
  })
})

describe('contadores Club y Pesas (MANANAS-30.md, 5)', () => {
  it('semana con A, una visita y B da "Club 3 de 5 · Pesas 2"', () => {
    const c = contadores([s(L, 'A'), s(M, 'VISITA'), s(X, 'B')], dia(J))
    expect(c).toEqual({ club: 3, pesas: 2 })
    expect(textoContadores(c)).toEqual(['Club 3 de 5', 'Pesas 2'])
  })
  it('Frida cuenta como pesas pero no como club; casa no cuenta en ninguno', () => {
    expect(contadores([s(L, 'FRIDA', { fridaTipo: 'pierna' }), s(M, 'CASA')], dia(X))).toEqual({ club: 0, pesas: 1 })
  })
  it('la visita de un día con pesas no suma otro día de club; pesas no tiene tope', () => {
    expect(contadores([s(L, 'VISITA'), s(L, 'A')], dia(M))).toEqual({ club: 1, pesas: 1 })
    expect(contadores([s(L, 'A'), s(L, 'FRIDA'), s(M, 'B'), s(X, 'A'), s(J, 'B'), s(V, 'A')], dia(D))).toEqual({ club: 5, pesas: 6 })
  })
  it('va de lunes a domingo: lo de otra semana no entra, la C vieja sí cuenta', () => {
    expect(contadores([s('2026-11-22', 'A'), s(L, 'C'), s(L2, 'B')], dia(S))).toEqual({ club: 1, pesas: 1 })
  })
  it('sesiones de pesas de la semana y estado', () => {
    const todo = [s(L, 'A'), s(M, 'VISITA'), s(X, 'FRIDA'), s(J, 'CASA')]
    expect(sesionesDeSemana(todo, dia(V)).map((x) => x.tipo)).toEqual(['A', 'FRIDA'])
    const e = estadoSemana(todo, dia(V))
    expect(e.hechas).toBe(2)
    expect(e.meta).toBe(3)
    expect(e.dias[0]).toEqual({ fecha: L, tipos: ['A'] })
    expect(casaDisponible(todo, dia(V))).toBe(true)
  })
})

describe('días hábiles y el único aviso (MANANAS-30.md, 4 y 5)', () => {
  it('el hábil anterior al lunes es el viernes y el que sigue al viernes es el lunes', () => {
    expect(claveFecha(habilAnterior(dia(L2)))).toBe(V)
    expect(claveFecha(habilAnterior(dia(X)))).toBe(M)
    expect(claveFecha(habilSiguiente(dia(V)))).toBe(L2)
    expect(claveFecha(habilSiguiente(dia(S)))).toBe(L2)
    expect(claveFecha(habilSiguiente(dia(M)))).toBe(X)
  })
  it('fue al club: pesas o visita; Frida y casa no', () => {
    const todo = [s(L, 'VISITA'), s(M, 'B'), s(X, 'FRIDA'), s(J, 'CASA')]
    expect([L, M, X, J, V].map((f) => fueAlClub(todo, [], f))).toEqual([true, true, false, false, false])
  })
  it('ayer no hubo club: lo dice una vez arriba, y el lunes habla del viernes', () => {
    expect(avisoAyer([s(L, 'A')], [], dia(X), L)).toBe('Ayer no hubo club. Hoy sí: nunca dos seguidos.')
    expect(avisoAyer([s(J, 'A')], [], dia(L2), L)).toBe('El viernes no hubo club. Hoy sí: nunca dos seguidos.')
  })
  it('no sale si ayer hubo pesas, visita o Frida, si hoy ya fue, en fin de semana, ni por días de antes de la v8', () => {
    expect(avisoAyer([s(M, 'A')], [], dia(X), L)).toBeNull()
    expect(avisoAyer([s(M, 'VISITA')], [], dia(X), L)).toBeNull()
    expect(avisoAyer([s(M, 'FRIDA', { fridaTipo: 'pierna' })], [], dia(X), L)).toBeNull()
    expect(avisoAyer([s(X, 'VISITA')], [], dia(X, 9), L)).toBeNull()
    expect(avisoAyer([], [], dia(S), L)).toBeNull()
    expect(avisoAyer([], [], dia(M), M)).toBeNull()
    expect(avisoAyer([], [], dia(X))).toBeNull()
  })
  it('semana ligera: 2 series por ejercicio', () => {
    expect(seriesPara(4)).toBe(4)
    expect(seriesPara(4, true)).toBe(2)
    expect(seriesPara(1, true)).toBe(1)
  })
})
