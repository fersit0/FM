import { describe, it, expect } from 'vitest'
import { aKg, desdeKg, convertir, unidadPorDefecto, incrementoDe, pesoDeSet, pesoInicial } from './unidades'
import { buscarEjercicio, buscarCualquiera } from '../data/ejercicios'

describe('unidades', () => {
  it('convierte ida y vuelta con medio como paso visible', () => {
    expect(aKg(160, 'lb')).toBeCloseTo(72.57, 1)
    expect(desdeKg(72.57, 'lb')).toBe(160)
    expect(convertir(20, 'kg', 'lb')).toBe(44)
    expect(convertir(10, 'kg', 'kg')).toBe(10)
  })
  it('máquinas y poleas en lb, mancuernas en kg', () => {
    expect(unidadPorDefecto(buscarEjercicio('jalon')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('prensa')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('press-plano')!)).toBe('kg')
    expect(unidadPorDefecto(buscarEjercicio('curl-z')!)).toBe('kg')
  })
  it('incrementos: 5 lb, 2.5 kg, 1 kg en laterales', () => {
    expect(incrementoDe(buscarEjercicio('jalon')!, 'lb')).toBe(5)
    expect(incrementoDe(buscarEjercicio('press-plano')!, 'kg')).toBe(2.5)
    expect(incrementoDe(buscarEjercicio('laterales')!, 'kg')).toBe(1)
  })
  it('el valor exacto se conserva en su unidad', () => {
    const s = { sessionId: 's', exerciseId: 'jalon', ejercicioBaseId: 'jalon', numSerie: 1, pesoKg: aKg(72.5, 'lb'), reps: 10, fecha: '2026-09-21', hora: 1, peso: 72.5, unidad: 'lb' as const }
    expect(pesoDeSet(s, 'lb')).toBe(72.5)
    expect(pesoDeSet(s, 'kg')).toBe(33)
  })
  it('peso inicial razonable y en la rejilla del dial', () => {
    expect(pesoInicial(buscarEjercicio('press-plano')!, 'kg')).toBe(15)
    expect(pesoInicial(buscarEjercicio('jalon')!, 'lb')).toBe(90)
    expect(pesoInicial(buscarEjercicio('prensa')!, 'lb')).toBe(0)
    expect(pesoInicial(buscarCualquiera('triceps-cabeza')!.item, 'kg')).toBe(10)
  })
})
