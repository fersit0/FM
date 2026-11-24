import { describe, it, expect } from 'vitest'
import type { Sesion, SetLog } from '../data/tipos'
import { listaDe, protegidosDe } from '../data/ejercicios'
import { listaDeSesion, posponer, segundosRestantes, recortar, terminarAqui, hechosDe, protegidosDeSesion } from './sesion'
import { segundosPesas } from './duracion'

const base = (extra: Partial<Sesion> = {}): Sesion => ({ id: 's1', fecha: '2026-11-24', tipo: 'A', version: 'completa', inicio: 0, terminada: false, ...extra })
const ids = (l: { id: string }[]) => l.map((e) => e.id)
const A = listaDe('A')
const B = listaDe('B')
const FIJOS_A = protegidosDe('A')

describe('lista de la sesión en marcha', () => {
  it('A y B en su orden; Frida y la visita no llevan ejercicios', () => {
    expect(ids(listaDeSesion(base()))).toEqual(['press-inclinado', 'laterales', 'aperturas-inclinadas', 'triceps-cabeza'])
    expect(ids(listaDeSesion(base({ tipo: 'B' })))).toEqual(['jalon', 'remo-polea', 'goblet', 'elevacion-piernas'])
    expect(listaDeSesion(base({ tipo: 'FRIDA' }))).toEqual([])
    expect(listaDeSesion(base({ tipo: 'VISITA' }))).toEqual([])
  })
  it('respeta el orden guardado, quita los recortados y descuenta las series recortadas', () => {
    const l = listaDeSesion(base({ orden: ['laterales', 'press-inclinado', 'aperturas-inclinadas', 'triceps-cabeza'], recortados: ['triceps-cabeza'], seriesMenos: { 'aperturas-inclinadas': 1 } }))
    expect(ids(l)).toEqual(['laterales', 'press-inclinado', 'aperturas-inclinadas'])
    expect(l.map((e) => e.series)).toEqual([4, 4, 1])
    // nunca baja de una serie; en la semana ligera se descuenta de las 2
    expect(listaDeSesion(base({ seriesMenos: { laterales: 9 } }))[1].series).toBe(1)
    expect(listaDeSesion(base({ ligera: true, seriesMenos: { laterales: 1 } }))[1].series).toBe(1)
  })
  it('"Ocupado: después" manda el ejercicio al final de su zona', () => {
    expect(posponer(A, 0)).toEqual(['laterales', 'aperturas-inclinadas', 'triceps-cabeza', 'press-inclinado'])
    expect(posponer(B, 0)).toEqual(['remo-polea', 'jalon', 'goblet', 'elevacion-piernas'])
    expect(posponer(B, 2)).toEqual(['jalon', 'remo-polea', 'elevacion-piernas', 'goblet'])
  })
  it('lo que falta de pesas: toda la lista al empezar, y menos con cada serie', () => {
    expect(segundosRestantes(A, 0, 0)).toBe(segundosPesas(A))
    expect(segundosRestantes(A, 0, 1)).toBe(segundosPesas(A) - 130)
    expect(segundosRestantes(A, 3, 1)).toBe(105)
  })
})

describe('recorte en el camino (MANANAS-30.md, 4)', () => {
  const total = segundosPesas(A)
  it('si cabe, no quita nada', () => {
    expect(recortar(A, 0, 0, total, FIJOS_A)).toEqual({ quitar: [], menos: {} })
  })
  it('primero quita series del último, de una en una; luego el último completo', () => {
    expect(recortar(A, 0, 0, total - 60, FIJOS_A)).toEqual({ quitar: [], menos: { 'triceps-cabeza': 1 } })
    expect(recortar(A, 0, 0, total - 120, FIJOS_A)).toEqual({ quitar: ['triceps-cabeza'], menos: {} })
  })
  it('luego sigue con el tercero, igual: series y después completo', () => {
    // sin tríceps (210 s y su minuto de cambio) faltan todavía 30 s: una serie de aperturas
    expect(recortar(A, 0, 0, total - 300, FIJOS_A)).toEqual({ quitar: ['triceps-cabeza'], menos: { 'aperturas-inclinadas': 1 } })
    expect(recortar(A, 0, 0, total - 400, FIJOS_A)).toEqual({ quitar: ['triceps-cabeza', 'aperturas-inclinadas'], menos: {} })
  })
  it('nunca toca los dos primeros, ni lo que ya se está haciendo', () => {
    expect(recortar(A, 0, 0, 0, FIJOS_A)).toEqual({ quitar: ['triceps-cabeza', 'aperturas-inclinadas'], menos: {} })
    expect(recortar(A, 2, 0, 0, FIJOS_A)).toEqual({ quitar: ['triceps-cabeza'], menos: {} })
    expect(recortar(A, 3, 0, 0, FIJOS_A)).toEqual({ quitar: [], menos: {} })
    expect(recortar(B, 0, 0, 0, protegidosDe('B'))).toEqual({ quitar: ['elevacion-piernas', 'goblet'], menos: {} })
  })
  it('la corta son los dos protegidos: no hay nada que recortar', () => {
    expect(recortar(listaDe('A', 'corta'), 0, 0, 0, FIJOS_A)).toEqual({ quitar: [], menos: {} })
    expect(protegidosDeSesion(base())).toEqual(['press-inclinado', 'laterales'])
    expect(protegidosDeSesion(base({ tipo: 'B' }))).toEqual(['jalon', 'remo-polea'])
    expect(protegidosDeSesion(base({ tipo: 'VISITA' }))).toEqual([])
  })
})

describe('terminar aquí y series hechas', () => {
  it('"Terminar aquí" deja fuera lo que falta después del actual', () => {
    const s = terminarAqui(base(), A, 1)
    expect(s.terminoAqui).toBe(true)
    expect(s.recortados).toEqual(['aperturas-inclinadas', 'triceps-cabeza'])
    expect(ids(listaDeSesion(s))).toEqual(['press-inclinado', 'laterales'])
  })
  it('las series de un ejercicio cuentan aunque se hayan hecho en una alternativa', () => {
    const set = (exerciseId: string, hora: number): SetLog => ({ sessionId: 's1', exerciseId, ejercicioBaseId: 'press-inclinado', numSerie: 1, pesoKg: 10, reps: 8, fecha: '2026-11-24', hora })
    const sets = [set('press-plano', 2), set('press-inclinado', 1), { ...set('press-inclinado', 3), sessionId: 'otra' }]
    expect(hechosDe(sets, 's1', 'press-inclinado').map((x) => x.hora)).toEqual([1, 2])
  })
})
