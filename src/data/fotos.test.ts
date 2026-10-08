import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { EJERCICIOS } from './ejercicios'
import { FOTOS_BASE } from './fotos'

describe('fotos de la biblioteca', () => {
  it('triceps-patada muestra el codo doblado como Inicio (la fuente viene al revés)', () => {
    expect(FOTOS_BASE['triceps-patada']).toEqual({ a: 'Tricep_Dumbbell_Kickback-2', b: 'Tricep_Dumbbell_Kickback' })
  })
  it('las fotos nuevas de la v5 están', () => {
    expect(FOTOS_BASE['triceps-polea'].a).toBe('Triceps_Pushdown_-_Rope_Attachment')
    expect(FOTOS_BASE.crunch.a).toBe('Crunches')
    expect(FOTOS_BASE['curl-alternado'].a).toBe('Dumbbell_Alternate_Bicep_Curl')
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
  it('los ids de A, B y CASA son únicos salvo laterales y goblet (A y B) y crunch (A y CASA)', () => {
    const ids = EJERCICIOS.map((e) => e.id)
    for (const c of ['laterales', 'goblet', 'crunch']) expect(ids.filter((i) => i === c), c).toHaveLength(2)
    expect(new Set(ids).size).toBe(ids.length - 3)
  })
  it('cada ejercicio y cada alternativa tiene sus dos fotos', () => {
    for (const e of EJERCICIOS) for (const it of [e, ...e.alternativas]) expect(FOTOS_BASE[it.ilustracion]?.b, it.id).toBeTruthy()
  })
})
