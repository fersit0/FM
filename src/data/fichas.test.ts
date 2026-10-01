import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { EJERCICIOS } from './ejercicios'
import { FICHAS } from './fichas'
// @ts-expect-error módulo de Node sin tipos
import { parsearFichas, palabrasDe } from '../../scripts/fichas-md.mjs'

const CAMPOS = ['paraQue', 'sientes', 'preparate', 'movimiento', 'imagina', 'cuidado'] as const
/** Las dos fichas que dio Fer como tono (press inclinado y jalón) miden 107 y 115 palabras: ese es el tope */
const MAX_PALABRAS = 115

describe('fichas', () => {
  const items = EJERCICIOS.flatMap((e) => [e, ...e.alternativas])
  for (const ej of items) {
    it(`${ej.id} tiene ficha completa, corta y con máximo 2 errores corregidos`, () => {
      const f = FICHAS[ej.id]
      expect(f, `falta la ficha de ${ej.id}`).toBeDefined()
      for (const c of CAMPOS) expect(f[c].trim().length, c).toBeGreaterThan(0)
      expect(f.errores.length).toBeGreaterThanOrEqual(1)
      expect(f.errores.length).toBeLessThanOrEqual(2)
      for (const e of f.errores) { expect(e.error.length).toBeGreaterThan(3); expect(e.correccion.length).toBeGreaterThan(3) }
      expect(palabrasDe(f), `${ej.id} tiene ${palabrasDe(f)} palabras`).toBeLessThanOrEqual(MAX_PALABRAS)
      // de tú, sin usted
      expect(JSON.stringify(f)).not.toMatch(/\busted\b/i)
    })
  }
  it('src/data/fichas.ts está generado a partir de FICHAS.md (corre node scripts/fichas-desde-md.mjs)', () => {
    const md = parsearFichas(readFileSync('FICHAS.md', 'utf8'))
    expect(FICHAS).toEqual(md)
  })
  it('ninguna ficha de alternativa menciona por nombre al ejercicio original', () => {
    for (const e of EJERCICIOS) for (const a of e.alternativas) {
      if (a.nombre.includes(e.nombre)) continue
      const f = FICHAS[a.id]
      const texto = [f.paraQue, f.sientes, f.preparate, f.movimiento, f.imagina, f.cuidado, ...f.errores.map((x) => x.error + x.correccion)].join(' ')
      expect(texto, `${a.id} menciona "${e.nombre}"`).not.toContain(e.nombre)
    }
  })
})
