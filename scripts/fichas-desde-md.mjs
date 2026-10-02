// Genera src/data/fichas.ts a partir de FICHAS.md. Uso: node scripts/fichas-desde-md.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { parsearFichas, palabrasDe } from './fichas-md.mjs'

const fichas = parsearFichas(readFileSync('FICHAS.md', 'utf8'))
const lineas = Object.entries(fichas).map(([id, f]) => `  ${JSON.stringify(id)}: ${JSON.stringify(f)},`)
const salida = `// Generado por scripts/fichas-desde-md.mjs a partir de FICHAS.md (fuente de verdad). No editar a mano.
export interface Ficha {
  nombre: string
  paraQue: string
  sientes: string
  preparate: string
  movimiento: string
  imagina: string
  errores: { error: string; correccion: string }[]
  cuidado: string
}

export const FICHAS: Record<string, Ficha> = {
${lineas.join('\n')}
}
`
writeFileSync('src/data/fichas.ts', salida)
const n = Object.keys(fichas).length
const max = Math.max(...Object.values(fichas).map(palabrasDe))
console.log(`${n} fichas escritas en src/data/fichas.ts; la más larga tiene ${max} palabras`)
