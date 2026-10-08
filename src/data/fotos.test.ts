import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { EJERCICIOS } from './ejercicios'
import { FOTOS_BASE } from './fotos'

describe('fotos de la biblioteca', () => {
  it('aperturas-maquina muestra los brazos abiertos como Inicio (Butterfly viene al revés)', () => {
    expect(FOTOS_BASE['aperturas-maquina']).toEqual({ a: 'Butterfly-2', b: 'Butterfly' })
  })
  const claves = new Set<string>()
  for (const e of EJERCICIOS) {
    claves.add(e.ilustracion)
    for (const a of e.alternativas) claves.add(a.ilustracion)
  }
  for (const clave of claves) {
    it(`${clave} tiene foto y el archivo existe`, () => {
      const f = FOTOS_BASE[clave]
      expect(f, `sin foto: ${clave}`).toBeTruthy()
      expect(existsSync(`public/fotos/${f.a}.jpg`), `falta public/fotos/${f.a}.jpg`).toBe(true)
      if (f.b) expect(existsSync(`public/fotos/${f.b}.jpg`), `falta public/fotos/${f.b}.jpg`).toBe(true)
    })
  }
  it('los ids de A, B y CASA son únicos salvo laterales, que se comparte', () => {
    const ids = EJERCICIOS.map((e) => e.id)
    expect(ids.filter((i) => i === 'laterales')).toHaveLength(2)
    expect(new Set(ids).size).toBe(ids.length - 1)
  })
})
