import { describe, it, expect } from 'vitest'
import { listaDeSesion, posponer, recortar, segundosRestantes, hechosDe } from './sesion'
import { listaDe } from '../data/ejercicios'
import type { SetLog } from '../data/tipos'

const A = listaDe('A')
const ids = (l: { id: string }[]) => l.map((e) => e.id)

describe('"Ocupado: después" (RUTINA-FINAL.md, 3)', () => {
  it('manda el ejercicio al final de su zona', () => {
    // el jalón (poleas) se va después del remo, que es el último de poleas
    expect(posponer(A, 0)).toEqual(['remo-polea', 'jalon', 'press-inclinado', 'press-militar', 'triceps-cabeza', 'laterales', 'curl-alternado', 'crunch'])
    // el press inclinado se va después del tríceps, último de bancos
    expect(posponer(A, 2)).toEqual(['jalon', 'remo-polea', 'press-militar', 'triceps-cabeza', 'press-inclinado', 'laterales', 'curl-alternado', 'crunch'])
  })
  it('si la zona ya se terminó, al final de la sesión', () => {
    // el remo es el último de poleas: se va hasta el final
    expect(posponer(A, 1)).toEqual(['jalon', 'press-inclinado', 'press-militar', 'triceps-cabeza', 'laterales', 'curl-alternado', 'crunch', 'remo-polea'])
    expect(posponer(A, 7)).toEqual(ids(A))
  })
  it('la sesión guarda el orden y lo respeta; sin orden guardado usa el de la rutina', () => {
    const orden = posponer(A, 0)
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa', orden }))).toEqual(orden)
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa' }))).toEqual(ids(A))
    // un id desconocido en el orden se ignora y uno que falte se agrega al final
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa', orden: ['remo-polea', 'raro'] }))).toEqual(['remo-polea', 'jalon', 'press-inclinado', 'press-militar', 'triceps-cabeza', 'laterales', 'curl-alternado', 'crunch'])
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa', recortados: ['crunch'] }))).not.toContain('crunch')
  })
})

describe('recorte en el camino (RUTINA-FINAL.md, 3)', () => {
  it('si cabe, no quita nada', () => {
    expect(recortar(A, 0, 0, segundosRestantes(A, 0, 0))).toEqual([])
  })
  it('quita primero abdomen, luego brazos, luego press militar; nunca press principal, jalón, remo ni laterales', () => {
    // desde el jalón sin series: faltan 2850 s; con 2700 disponibles sale el crunch
    expect(recortar(A, 0, 0, 2700)).toEqual(['crunch'])
    // con mucho menos salen crunch, curl, tríceps, press militar, en ese orden, y nada más
    expect(recortar(A, 0, 0, 1000)).toEqual(['crunch', 'curl-alternado', 'triceps-cabeza', 'press-militar'])
    const B = listaDe('B')
    expect(recortar(B, 0, 0, 1000)).toEqual(['elevacion-piernas', 'curl-martillo', 'triceps-polea', 'aperturas-mancuernas'])
  })
  it('solo quita lo que falta, nunca el actual ni los ya hechos', () => {
    // en el crunch (último) no hay nada que quitar aunque no quepa
    expect(recortar(A, 7, 0, 0)).toEqual([])
    // en el curl, el crunch sí se puede quitar; el tríceps ya pasó
    expect(recortar(A, 6, 1, 0)).toEqual(['crunch'])
  })
  it('lo que falta cuenta series hechas del actual y el cambio de zona', () => {
    // último ejercicio con 1 de 2 series hechas: 1 × (45 + 45)
    expect(segundosRestantes(A, 7, 1)).toBe(90)
    // curl (2 × 105) + 60 + crunch (2 × 90)
    expect(segundosRestantes(A, 6, 0)).toBe(210 + 60 + 180)
    // tríceps en bancos → laterales en terraza: 120 de cambio
    expect(segundosRestantes(A, 4, 2)).toBe(120 + 315 + 60 + 210 + 60 + 180)
  })
})

describe('series por ejercicio base', () => {
  it('una serie hecha en la alternativa cuenta para el ejercicio', () => {
    const sets: SetLog[] = [
      { sessionId: 's', exerciseId: 'remo-pecho-apoyado', ejercicioBaseId: 'remo-polea', numSerie: 1, pesoKg: 10, reps: 12, fecha: '2026-10-07', hora: 2 },
      { sessionId: 's', exerciseId: 'remo-polea', ejercicioBaseId: 'remo-polea', numSerie: 2, pesoKg: 40, reps: 10, fecha: '2026-10-07', hora: 3 },
      { sessionId: 'otra', exerciseId: 'remo-polea', ejercicioBaseId: 'remo-polea', numSerie: 1, pesoKg: 40, reps: 10, fecha: '2026-10-01', hora: 1 },
    ]
    expect(hechosDe(sets, 's', 'remo-polea').map((s) => s.numSerie)).toEqual([1, 2])
  })
})
