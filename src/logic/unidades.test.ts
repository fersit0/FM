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
    expect(redondearAPaso(17.3, 2.5)).toBe(17.5)
  })
  it('todo el gym en lb, casa en kg', () => {
    expect(unidadPorDefecto(buscarEjercicio('jalon')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('press-plano')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('curl-z')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('laterales')!)).toBe('lb')
    expect(unidadPorDefecto(buscarEjercicio('laterales-casa')!)).toBe('kg')
    expect(unidadPorDefecto(buscarCualquiera('remo-mancuerna-casa')!.item)).toBe('kg')
    for (const e of EJERCICIOS) for (const it of [e, ...e.alternativas]) if (it.modo === 'peso') expect(unidadPorDefecto(it), it.id).toBe(e.sesion === 'CASA' ? 'kg' : 'lb')
  })
  it('incrementos: 5 lb, 2.5 kg, 1 kg en laterales', () => {
    expect(incrementoDe(buscarEjercicio('jalon')!, 'lb')).toBe(5)
    expect(incrementoDe(buscarEjercicio('press-plano')!, 'kg')).toBe(2.5)
    expect(incrementoDe(buscarEjercicio('laterales')!, 'kg')).toBe(1)
    expect(incrementoDe(buscarEjercicio('laterales')!, 'lb')).toBe(5)
  })
  it('el valor exacto se conserva en su unidad y se convierte al paso en la otra', () => {
    const s = { sessionId: 's', exerciseId: 'jalon', ejercicioBaseId: 'jalon', numSerie: 1, pesoKg: aKg(72.5, 'lb'), reps: 10, fecha: '2026-09-21', hora: 1, peso: 72.5, unidad: 'lb' as const }
    expect(pesoDeSet(s, 'lb')).toBe(72.5)
    expect(pesoDeSet(s, 'kg')).toBe(32.5)
    expect(pesoDeSet(s, 'kg', 1)).toBe(33)
    // registros viejos sin unidad: eran kilos exactos
    const viejo = { ...s, peso: undefined, unidad: undefined, pesoKg: 12 }
    expect(pesoDeSet(viejo, 'kg')).toBe(12)
    expect(pesoDeSet(viejo, 'lb')).toBe(25)
  })
  it('pesos iniciales en lb del club y en la rejilla', () => {
    expect(pesoInicial(buscarEjercicio('press-inclinado')!, 'lb')).toBe(30)
    expect(pesoInicial(buscarEjercicio('jalon')!, 'lb')).toBe(90)
    expect(pesoInicial(buscarEjercicio('press-militar')!, 'lb')).toBe(25)
    expect(pesoInicial(buscarEjercicio('laterales')!, 'lb')).toBe(10)
    expect(pesoInicial(buscarEjercicio('goblet')!, 'lb')).toBe(45)
    expect(pesoInicial(buscarEjercicio('curl-z')!, 'lb')).toBe(45)
    expect(pesoInicial(buscarEjercicio('triceps-polea')!, 'lb')).toBe(50)
    expect(pesoInicial(buscarEjercicio('press-plano')!, 'lb')).toBe(35)
    expect(pesoInicial(buscarEjercicio('remo-polea')!, 'lb')).toBe(90)
    expect(pesoInicial(buscarEjercicio('remo-mancuerna')!, 'lb')).toBe(45)
    expect(pesoInicial(buscarEjercicio('remo-pecho-apoyado')!, 'lb')).toBe(15)
    expect(pesoInicial(buscarEjercicio('curl-martillo')!, 'lb')).toBe(20)
    expect(pesoInicial(buscarEjercicio('prensa')!, 'lb')).toBe(0)
    expect(pesoInicial(buscarEjercicio('laterales-casa')!, 'kg')).toBe(4)
    // en kilos, a la rejilla de 2.5 (o 1 en laterales)
    expect(pesoInicial(buscarEjercicio('press-plano')!, 'kg')).toBe(15)
    expect(pesoInicial(buscarEjercicio('laterales')!, 'kg')).toBe(5)
    expect(pesoInicial(buscarCualquiera('triceps-cabeza')!.item, 'lb')).toBe(25)
  })
})
