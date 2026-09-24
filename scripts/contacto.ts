// Hoja de contacto de ilustraciones para revisar en desarrollo.
// Uso: node scripts/contacto.ts [desde] [cuantos] > salida.svg
import { IDS, dibujarIlustracion } from '../src/assets/ilustraciones/poses.ts'

const colores = {
  acento: '#ff6b1f', linea: '#0a0d17', fantasma: '#cfc3aa', equipo: '#1f2b4a', equipoLinea: '#0a0d17', metal: '#cfc3aa', cable: '#8e8672',
}
const desde = parseInt(process.argv[2] ?? '0', 10)
const cuantos = parseInt(process.argv[3] ?? '100', 10)
const LISTA = IDS.slice(desde, desde + cuantos)
const cols = 3
const w = 200, h = 120, pad = 10
const filas = Math.ceil(LISTA.length / cols)
const partes: string[] = []
LISTA.forEach((id, i) => {
  const x = pad + (i % cols) * (w + pad)
  const y = pad + Math.floor(i / cols) * (h + 24 + pad)
  partes.push(`<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="12" fill="#0a0d17"/><g color="#f3e9d6">${dibujarIlustracion(id, colores)}</g><text x="4" y="${h + 16}" fill="#f3e9d6" font-family="Helvetica" font-size="11">${id}</text></g>`)
})
const W = pad + cols * (w + pad), H = pad + filas * (h + 24 + pad)
process.stdout.write(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}"><rect width="${W}" height="${H}" fill="#0f1626"/>${partes.join('')}</svg>`)
