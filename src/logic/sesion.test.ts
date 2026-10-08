import { describe, it, expect } from 'vitest'
import { listaDeSesion, posponer, recortar, segundosRestantes, hechosDe, terminarAqui } from './sesion'
import { listaDe } from '../data/ejercicios'
import type { SetLog } from '../data/tipos'

const A = listaDe('A')
const B = listaDe('B')
const C = listaDe('C')
const ids = (l: { id: string }[]) => l.map((e) => e.id)

describe('"Ocupado: después" (RUTINA-FINAL.md, 3)', () => {
  it('manda el ejercicio al final de su zona', () => {
    // el press inclinado (bancos) se va después del tríceps, último de bancos
    expect(posponer(A, 0)).toEqual(['aperturas-inclinadas', 'laterales', 'triceps-cabeza', 'press-inclinado', 'goblet', 'puente-gluteo', 'crunch'])
    // el jalón cerrado (poleas) se va después del tríceps con cuerda
    expect(posponer(B, 2)).toEqual(['press-plano', 'laterales', 'remo-polea', 'triceps-polea', 'jalon-cerrado', 'curl-alternado', 'elevacion-piernas'])
  })
  it('si la zona ya se terminó, al final de la sesión', () => {
    // el tríceps es el último de bancos: se va hasta el final
    expect(posponer(A, 3)).toEqual(['press-inclinado', 'aperturas-inclinadas', 'laterales', 'goblet', 'puente-gluteo', 'crunch', 'triceps-cabeza'])
    expect(posponer(A, 6)).toEqual(ids(A))
  })
  it('la sesión guarda el orden y lo respeta; sin orden guardado usa el de la rutina', () => {
    const orden = posponer(A, 0)
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa', orden }))).toEqual(orden)
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa' }))).toEqual(ids(A))
    expect(ids(listaDeSesion({ tipo: 'C', version: 'completa' }))).toEqual(ids(C))
    // un id desconocido en el orden se ignora y uno que falte se agrega al final
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa', orden: ['laterales', 'raro'] }))).toEqual(['laterales', 'press-inclinado', 'aperturas-inclinadas', 'triceps-cabeza', 'goblet', 'puente-gluteo', 'crunch'])
    expect(ids(listaDeSesion({ tipo: 'A', version: 'completa', recortados: ['crunch'] }))).not.toContain('crunch')
    expect(ids(listaDeSesion({ tipo: 'FRIDA', version: 'completa' }))).toEqual([])
  })
})

describe('recorte en el camino (RUTINA-FINAL.md, 3)', () => {
  it('si cabe, no quita nada', () => {
    expect(recortar(A, 0, 0, segundosRestantes(A, 0, 0))).toEqual([])
  })
  it('quita primero abdomen, luego brazos, luego aperturas o puente; nunca press principal, jalón, remo, laterales ni goblet', () => {
    // desde el press sin series faltan 2410 s; con 2300 disponibles sale el crunch
    expect(recortar(A, 0, 0, 2300)).toEqual(['crunch'])
    // con mucho menos salen crunch, tríceps, puente y aperturas, en ese orden, y nada más
    expect(recortar(A, 0, 0, 600)).toEqual(['crunch', 'triceps-cabeza', 'puente-gluteo', 'aperturas-inclinadas'])
    expect(recortar(B, 0, 0, 600)).toEqual(['elevacion-piernas', 'curl-alternado', 'triceps-polea'])
    expect(recortar(C, 0, 0, 600)).toEqual(['crunch', 'curl-martillo'])
  })
  it('solo quita lo que falta, nunca el actual ni los ya hechos', () => {
    // en el crunch (último) no hay nada que quitar aunque no quepa
    expect(recortar(A, 6, 0, 0)).toEqual([])
    // en el puente, el crunch sí se puede quitar; el tríceps ya pasó
    expect(recortar(A, 5, 1, 0)).toEqual(['crunch'])
  })
  it('lo que falta cuenta series hechas del actual y el cambio de zona', () => {
    // último ejercicio con 1 de 2 series hechas: 1 × (55 + 45)
    expect(segundosRestantes(A, 6, 1)).toBe(100)
    // puente (2 × 110) + 60 + crunch (2 × 100)
    expect(segundosRestantes(A, 5, 0)).toBe(220 + 60 + 200)
    // tríceps en bancos con 2 de 2 hechas → goblet en terraza: 120 de cambio
    expect(segundosRestantes(A, 3, 2)).toBe(120 + 405 + 60 + 220 + 60 + 200)
  })
})

describe('"Terminar aquí" (RUTINA-FINAL.md, 3)', () => {
  it('cierra la sesión con lo hecho: lo que falta queda fuera y el cierre es de 5 min', () => {
    const s = terminarAqui({ id: 's', fecha: '2026-10-08', tipo: 'A', version: 'completa', inicio: 1, terminada: false }, A, 2)
    expect(s.terminoAqui).toBe(true)
    expect(s.recortados).toEqual(['triceps-cabeza', 'goblet', 'puente-gluteo', 'crunch'])
    expect(ids(listaDeSesion(s))).toEqual(['press-inclinado', 'aperturas-inclinadas', 'laterales'])
    // en el último no quita nada más
    expect(terminarAqui({ id: 's', fecha: '2026-10-08', tipo: 'A', version: 'completa', inicio: 1, terminada: false, recortados: ['crunch'] }, A.slice(0, 6), 5).recortados).toEqual(['crunch'])
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
