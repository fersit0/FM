import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { EJERCICIOS } from './ejercicios'
import { FOTOS_BASE } from './fotos'

describe('fotos de la biblioteca', () => {
  it('triceps-patada muestra el codo doblado como Inicio (la fuente viene al revés)', () => {
    expect(FOTOS_BASE['triceps-patada']).toEqual({ a: 'Tricep_Dumbbell_Kickback-2', b: 'Tricep_Dumbbell_Kickback' })
  })
  it('las fotos nuevas de la v5 y la v6 están; el puente lleva la etiqueta "Referencia"', () => {
    expect(FOTOS_BASE['triceps-polea'].a).toBe('Triceps_Pushdown_-_Rope_Attachment')
    expect(FOTOS_BASE.crunch.a).toBe('Crunches')
    expect(FOTOS_BASE['curl-alternado'].a).toBe('Dumbbell_Alternate_Bicep_Curl')
    expect(FOTOS_BASE['aperturas-inclinadas']).toEqual({ a: 'Incline_Dumbbell_Flyes', b: 'Incline_Dumbbell_Flyes-2' })
    expect(FOTOS_BASE['puente-gluteo']).toEqual({ a: 'Butt_Lift_Bridge', b: 'Butt_Lift_Bridge-2', referencia: true })
    expect(FOTOS_BASE['puente-sin-peso'].a).toBe('Butt_Lift_Bridge')
    expect(FOTOS_BASE['puente-sin-peso'].referencia).toBeFalsy()
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
  it('los ids son únicos salvo los compartidos: laterales (A, B y C), remo-polea (B y C) y crunch (A, C y CASA)', () => {
    const ids = EJERCICIOS.map((e) => e.id)
    expect(ids.filter((i) => i === 'laterales')).toHaveLength(3)
    expect(ids.filter((i) => i === 'remo-polea')).toHaveLength(2)
    expect(ids.filter((i) => i === 'crunch')).toHaveLength(3)
    expect(new Set(ids).size).toBe(ids.length - 5)
  })
  it('cada ejercicio y cada alternativa tiene sus dos fotos', () => {
    for (const e of EJERCICIOS) for (const it of [e, ...e.alternativas]) expect(FOTOS_BASE[it.ilustracion]?.b, it.id).toBeTruthy()
  })
})
