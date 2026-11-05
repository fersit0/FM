import { describe, it, expect } from 'vitest'
import { repartir, necesita, conservar, D_MIN } from './acomodo'

// 393 de ancho (iPhone 16): 345 libres; con − y + a los lados el círculo puede medir hasta 189 en la serie 1
const ANCHO = 345
const D1 = 189

describe('repartir la serie entre foto y círculo', () => {
  it('con espacio de sobra: foto a todo lo ancho, entera, y el círculo del diseño', () => {
    const a = repartir(480, ANCHO, D1, 1.5)
    expect(a.d).toBe(D1)
    expect(a.foto).toEqual({ w: 345, h: 230 })
  })
  it('la foto siempre conserva su proporción: nunca se recorta', () => {
    for (const alto of [250, 300, 360, 420]) {
      for (const p of [1.5, 4 / 3, 2 / 3]) {
        const a = repartir(alto, ANCHO, D1, p)
        if (a.foto) expect(Math.abs(a.foto.w / a.foto.h - p)).toBeLessThan(0.02)
        if (a.foto) expect(a.foto.w).toBeLessThanOrEqual(ANCHO + 1)
      }
    }
  })
  it('la foto nunca se lleva más de la mitad del alto', () => {
    const a = repartir(350, ANCHO, D1, 1.5)
    expect(a.foto!.h).toBeLessThanOrEqual((350 - 16) / 2)
    expect(a.d).toBeGreaterThan(D_MIN)
  })
  it('con poco espacio, primero cede el círculo hasta 140 y luego la foto se hace chica', () => {
    const a = repartir(300, ANCHO, D1, 1.5)
    expect(a.d).toBe(D_MIN)
    expect(a.foto!.h).toBeLessThan(230)
    expect(necesita(a)).toBeLessThanOrEqual(300)
  })
  it('si la foto quedaría de menos de 80 de alto, no sale y el círculo toma el lugar', () => {
    const a = repartir(240, ANCHO, D1, 1.5)
    expect(a.foto).toBeNull()
    expect(a.d).toBe(D1)
  })
  it('sin foto: el círculo del diseño, acotado al alto', () => {
    expect(repartir(500, ANCHO, 236, null)).toEqual({ d: 236, foto: null })
    expect(repartir(200, ANCHO, 236, null).d).toBe(184)
  })
  it('lo que reparte siempre cabe', () => {
    for (let alto = 120; alto <= 600; alto += 7) {
      const a = repartir(alto, ANCHO, D1, 1.5)
      expect(necesita(a)).toBeLessThanOrEqual(Math.max(alto, 88 + 16))
    }
  })
})

describe('sin brincos a media serie', () => {
  it('si sobra espacio (se fue el aviso), se queda como estaba', () => {
    const fijo = repartir(300, ANCHO, D1, 1.5)
    const nuevo = repartir(380, ANCHO, D1, 1.5)
    expect(conservar(fijo, nuevo, 380, 193)).toBe(fijo)
  })
  it('si ya no cabe, se achica', () => {
    const fijo = repartir(380, ANCHO, D1, 1.5)
    const nuevo = repartir(300, ANCHO, D1, 1.5)
    expect(conservar(fijo, nuevo, 300, 193)).toBe(nuevo)
  })
})
