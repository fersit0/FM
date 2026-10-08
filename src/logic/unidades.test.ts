import { describe, it, expect } from 'vitest'
import { aKg, desdeKg, convertir, unidadPorDefecto, incrementoDe, pesoDeSet, pesoInicial, redondearAPaso } from './unidades'
import { buscarEjercicio, buscarCualquiera, EJERCICIOS } from '../data/ejercicios'

describe('unidades', () => {
  it('convierte ida y vuelta redondeando al paso real', () => {
    expect(aKg(160, 'lb')).toBeCloseTo(72.57, 1)
    expect(desdeKg(72.57, 'lb')).toBe(160)
    expect(convertir(20, 'kg', 'lb')).toBe(45)
    expect(convertir(10, 'kg', 'kg')).toBe(10)
    expect(convertir(12.5, 'kg', 'lb')).toBe(30)
    expect(convertir(6, 'kg', 'lb', 1)).toBe(13)
    expect(convertir(35, 'lb', 'kg')).toBe(16)
    expect(redondearAPaso(17.3, 2.5)).toBe(17.5)
  })
  it('todo el gym en lb, casa en kg', () => {
    expect(unidadPorDefecto(buscarEjercicio('jalon')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('press-plano')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('curl-alternado')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('laterales')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('laterales-casa')!)).toBe('kg')
    expect(unidadPorDefecto(buscarCualquiera('remo-mancuerna-casa')!.item)).toBe('kg')
    for (const e of EJERCICIOS) for (const it of [e, ...e.alternativas]) if (it.modo === 'peso') expect(unidadPorDefecto(it), it.id).toBe(e.sesion === 'CASA' ? 'kg' : 'lb')
  })
  it('incrementos: 5 lb, 1 kg', () => {
    expect(incrementoDe(buscarEjercicio('jalon')!, 'lb')).toBe(5)
    expect(incrementoDe(buscarEjercicio('press-plano')!, 'kg')).toBe(1)
    expect(incrementoDe(buscarEjercicio('laterales')!, 'kg')).toBe(1)
    expect(incrementoDe(buscarEjercicio('laterales')!, 'lb')).toBe(5)
  })
  it('el valor exacto se conserva en su unidad y se convierte al paso en la otra', () => {
    const s = { sessionId: 's', exerciseId: 'jalon', ejercicioBaseId: 'jalon', numSerie: 1, pesoKg: aKg(72.5, 'lb'), reps: 10, fecha: '2026-09-21', hora: 1, peso: 72.5, unidad: 'lb' as const }
    expect(pesoDeSet(s, 'lb')).toBe(72.5)
    expect(pesoDeSet(s, 'kg')).toBe(33)
    expect(pesoDeSet(s, 'kg', 2.5)).toBe(32.5)
    // registros viejos sin unidad: eran kilos exactos
    const viejo = { ...s, peso: undefined, unidad: undefined, pesoKg: 12 }
    expect(pesoDeSet(viejo, 'kg')).toBe(12)
    expect(pesoDeSet(viejo, 'lb')).toBe(25)
  })
  it('pesos iniciales en lb del club (RUTINA-FINAL.md, 10) y en la rejilla', () => {
    const lb: Record<string, number> = { jalon: 90, 'remo-polea': 90, 'press-inclinado': 30, 'press-militar': 25, 'triceps-cabeza': 20, laterales: 10, 'curl-alternado': 20, 'press-plano': 35, 'aperturas-mancuernas': 15, 'remo-pecho-apoyado': 15, 'jalon-cerrado': 80, 'triceps-polea': 40, 'curl-martillo': 20, goblet: 45, 'triceps-patada': 10, 'remo-mancuerna': 45 }
    for (const [id, v] of Object.entries(lb)) expect(pesoInicial(buscarCualquiera(id)!.item, 'lb'), id).toBe(v)
    expect(pesoInicial(buscarEjercicio('laterales-casa')!, 'kg')).toBe(4)
    // en kilos, a la rejilla de 1
    expect(pesoInicial(buscarEjercicio('press-plano')!, 'kg')).toBe(16)
    expect(pesoInicial(buscarEjercicio('laterales')!, 'kg')).toBe(5)
  })
})
