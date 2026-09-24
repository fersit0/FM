// Figura plana con contorno oscuro. Puro: genera cadenas SVG, sin React,
// para poder renderizar las mismas ilustraciones en la app y en la hoja de contacto de desarrollo.

export type Punto = [number, number]

/** Pose de perfil (o de frente). Ángulos en grados, 0 = derecha, 90 = abajo. */
export interface Pose {
  cadera: Punto
  torso: number
  muslo: number
  pierna: number
  brazo: number
  antebrazo: number
  /** ángulo del cuello (default: el del torso) */
  cabeza?: number
  /** segunda pierna / brazo cuando difieren */
  muslo2?: number
  pierna2?: number
  brazo2?: number
  antebrazo2?: number
  /** fuerza la mano a un punto (cables, barras, apoyos) */
  mano?: Punto
  mano2?: Punto
  /** vista de frente: brazos y piernas simétricos */
  frente?: boolean
}

export const L = { torso: 30, brazo: 17, antebrazo: 15, muslo: 22, pierna: 22, cabeza: 8, cuello: 10 }

const rad = (a: number) => (a * Math.PI) / 180
export const mover = (p: Punto, a: number, d: number): Punto => [p[0] + Math.cos(rad(a)) * d, p[1] + Math.sin(rad(a)) * d]

export interface Articulaciones {
  cadera: Punto
  hombro: Punto
  cabeza: Punto
  codo: Punto
  mano: Punto
  rodilla: Punto
  tobillo: Punto
  codo2?: Punto
  mano2?: Punto
  rodilla2?: Punto
  tobillo2?: Punto
}

export function articular(p: Pose): Articulaciones {
  const hombro = mover(p.cadera, p.torso, L.torso)
  const cabeza = mover(hombro, p.cabeza ?? p.torso, L.cuello)
  const codo = mover(hombro, p.brazo, L.brazo)
  const mano = p.mano ?? mover(codo, p.antebrazo, L.antebrazo)
  const rodilla = mover(p.cadera, p.muslo, L.muslo)
  const tobillo = mover(rodilla, p.pierna, L.pierna)
  const a: Articulaciones = { cadera: p.cadera, hombro, cabeza, codo, mano, rodilla, tobillo }
  if (p.brazo2 !== undefined) {
    a.codo2 = mover(hombro, p.brazo2, L.brazo)
    a.mano2 = p.mano2 ?? mover(a.codo2, p.antebrazo2 ?? p.brazo2, L.antebrazo)
  }
  if (p.muslo2 !== undefined) {
    a.rodilla2 = mover(p.cadera, p.muslo2, L.muslo)
    a.tobillo2 = mover(a.rodilla2, p.pierna2 ?? p.muslo2, L.pierna)
  }
  return a
}

const f = (n: number) => Math.round(n * 10) / 10
const pl = (pts: Punto[]) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')

export interface Colores {
  acento: string
  linea: string
  fantasma: string
  equipo: string
  equipoLinea: string
  metal: string
  cable: string
}

/** Un trazo con contorno oscuro debajo */
function trazo(pts: Punto[], ancho: number, color: string, linea: string, contorno: boolean): string {
  const base = `points="${pl(pts)}" fill="none" stroke-linecap="round" stroke-linejoin="round"`
  const abajo = contorno ? `<polyline ${base} stroke="${linea}" stroke-width="${ancho + 5}"/>` : ''
  return `${abajo}<polyline ${base} stroke="${color}" stroke-width="${ancho}"/>`
}

function circulo(c: Punto, r: number, color: string, linea: string, contorno: boolean): string {
  const abajo = contorno ? `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${r + 2.5}" fill="${linea}"/>` : ''
  return `${abajo}<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${r}" fill="${color}"/>`
}

/** Dibuja la figura. `fantasma` = posición inicial, sin contorno y traslúcida. */
export function dibujarFigura(p: Pose, c: Colores, fantasma = false): string {
  const a = articular(p)
  const color = fantasma ? c.fantasma : c.acento
  const contorno = !fantasma
  const k = fantasma ? 0.75 : 1
  const partes: string[] = []
  const brazoW = 8 * k, piernaW = 10 * k, torsoW = 14 * k

  if (p.frente) {
    const [hx, hy] = a.hombro
    const [cx, cy] = p.cadera
    // piernas
    for (const s of [-1, 1]) {
      const cad: Punto = [cx + s * 7, cy]
      const rod = mover(cad, p.muslo, L.muslo)
      const tob = mover(rod, p.pierna, L.pierna)
      partes.push(trazo([cad, rod, tob], piernaW, color, c.linea, contorno))
    }
    // torso ancho
    partes.push(trazo([[cx, cy], [hx, hy]], torsoW + 6, color, c.linea, contorno))
    partes.push(trazo([[hx - 12, hy], [hx + 12, hy]], torsoW - 2, color, c.linea, contorno))
    // brazos simétricos (el ángulo dado es el del brazo derecho; el izquierdo se refleja)
    for (const s of [1, -1]) {
      const hom: Punto = [hx + s * 12, hy]
      const ang = (t: number) => (s === 1 ? t : 180 - t)
      const codo = mover(hom, ang(p.brazo), L.brazo)
      const mano = mover(codo, ang(p.antebrazo), L.antebrazo)
      partes.push(trazo([hom, codo, mano], brazoW, color, c.linea, contorno))
    }
    partes.push(circulo(a.cabeza, L.cabeza * k, color, c.linea, contorno))
    return `<g>${partes.join('')}</g>`
  }

  // perfil: pierna y brazo lejanos primero (más oscuros), luego torso, luego los cercanos
  if (a.rodilla2 && a.tobillo2) partes.push(trazo([p.cadera, a.rodilla2, a.tobillo2], piernaW, color, c.linea, contorno))
  if (a.codo2 && a.mano2) partes.push(trazo([a.hombro, a.codo2, a.mano2], brazoW, color, c.linea, contorno))
  partes.push(trazo([p.cadera, a.rodilla, a.tobillo], piernaW, color, c.linea, contorno))
  partes.push(trazo([p.cadera, a.hombro], torsoW, color, c.linea, contorno))
  partes.push(circulo(a.cabeza, L.cabeza * k, color, c.linea, contorno))
  partes.push(trazo([a.hombro, a.codo, a.mano], brazoW, color, c.linea, contorno))
  return `<g${fantasma ? ' opacity="0.45"' : ''}>${partes.join('')}</g>`
}

// ---------- Equipo ----------

export function mancuerna(mano: Punto, c: Colores, vertical = false): string {
  const [x, y] = mano
  const r = 4.5
  if (vertical) {
    return `<g>
      <line x1="${f(x)}" y1="${f(y - 8)}" x2="${f(x)}" y2="${f(y + 8)}" stroke="${c.linea}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${f(x)}" y1="${f(y - 8)}" x2="${f(x)}" y2="${f(y + 8)}" stroke="${c.metal}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="${f(x - r)}" y="${f(y - 11)}" width="${r * 2}" height="5" rx="1.5" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>
      <rect x="${f(x - r)}" y="${f(y + 6)}" width="${r * 2}" height="5" rx="1.5" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>
    </g>`
  }
  return `<g>
    <line x1="${f(x - 9)}" y1="${f(y)}" x2="${f(x + 9)}" y2="${f(y)}" stroke="${c.linea}" stroke-width="5" stroke-linecap="round"/>
    <line x1="${f(x - 9)}" y1="${f(y)}" x2="${f(x + 9)}" y2="${f(y)}" stroke="${c.metal}" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="${f(x - 12)}" y="${f(y - r)}" width="5" height="${r * 2}" rx="1.5" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>
    <rect x="${f(x + 7)}" y="${f(y - r)}" width="5" height="${r * 2}" rx="1.5" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>
  </g>`
}

/** Barra corta vista de perfil (un disco) o de frente (barra con discos) */
export function barra(mano: Punto, c: Colores, largo = 26): string {
  const [x, y] = mano
  return `<g>
    <line x1="${f(x - largo / 2)}" y1="${f(y)}" x2="${f(x + largo / 2)}" y2="${f(y)}" stroke="${c.linea}" stroke-width="5" stroke-linecap="round"/>
    <line x1="${f(x - largo / 2)}" y1="${f(y)}" x2="${f(x + largo / 2)}" y2="${f(y)}" stroke="${c.metal}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${f(x - largo / 2 - 1)}" cy="${f(y)}" r="6" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>
    <circle cx="${f(x + largo / 2 + 1)}" cy="${f(y)}" r="6" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>
  </g>`
}

export function banco(x1: number, x2: number, top: number, c: Colores, respaldo?: { x: number; angulo: number; largo: number }): string {
  const piso = 112
  const partes = [
    `<rect x="${x1}" y="${top}" width="${x2 - x1}" height="8" rx="4" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>`,
    `<line x1="${x1 + 10}" y1="${top + 8}" x2="${x1 + 10}" y2="${piso}" stroke="${c.equipoLinea}" stroke-width="4" stroke-linecap="round"/>`,
    `<line x1="${x2 - 10}" y1="${top + 8}" x2="${x2 - 10}" y2="${piso}" stroke="${c.equipoLinea}" stroke-width="4" stroke-linecap="round"/>`,
  ]
  if (respaldo) {
    const fin = mover([respaldo.x, top + 4], respaldo.angulo, respaldo.largo)
    partes.push(`<line x1="${respaldo.x}" y1="${top + 4}" x2="${f(fin[0])}" y2="${f(fin[1])}" stroke="${c.equipoLinea}" stroke-width="12" stroke-linecap="round"/>`)
    partes.push(`<line x1="${respaldo.x}" y1="${top + 4}" x2="${f(fin[0])}" y2="${f(fin[1])}" stroke="${c.equipo}" stroke-width="8" stroke-linecap="round"/>`)
  }
  return `<g>${partes.join('')}</g>`
}

export function torre(x: number, c: Colores, polea: 'alta' | 'baja' | 'ambas' = 'alta'): string {
  const partes = [
    `<rect x="${x - 5}" y="10" width="10" height="102" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>`,
    `<rect x="${x - 16}" y="104" width="32" height="8" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>`,
  ]
  if (polea !== 'baja') partes.push(`<circle cx="${x - 8}" cy="16" r="5" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>`)
  if (polea !== 'alta') partes.push(`<circle cx="${x - 8}" cy="88" r="5" fill="${c.metal}" stroke="${c.linea}" stroke-width="1.5"/>`)
  return `<g>${partes.join('')}</g>`
}

export function cable(desde: Punto, hasta: Punto, c: Colores): string {
  return `<line x1="${f(desde[0])}" y1="${f(desde[1])}" x2="${f(hasta[0])}" y2="${f(hasta[1])}" stroke="${c.cable}" stroke-width="1.5" stroke-dasharray="3 2"/>`
}

export function piso(c: Colores): string {
  return `<line x1="14" y1="112" x2="186" y2="112" stroke="${c.equipoLinea}" stroke-width="3" stroke-linecap="round"/>`
}

export function maquina(xPoste: number, c: Colores, asiento: { x: number; y: number }): string {
  return `<g>
    <rect x="${xPoste - 5}" y="20" width="10" height="92" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>
    <rect x="${asiento.x - 14}" y="${asiento.y}" width="28" height="8" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>
    <rect x="${asiento.x - 20}" y="${asiento.y - 34}" width="8" height="38" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>
    <line x1="${asiento.x}" y1="${asiento.y + 8}" x2="${asiento.x}" y2="112" stroke="${c.equipoLinea}" stroke-width="4"/>
  </g>`
}

export function manija(mano: Punto, c: Colores, vertical = true): string {
  const [x, y] = mano
  return vertical
    ? `<line x1="${f(x)}" y1="${f(y - 7)}" x2="${f(x)}" y2="${f(y + 7)}" stroke="${c.metal}" stroke-width="4" stroke-linecap="round"/>`
    : `<line x1="${f(x - 7)}" y1="${f(y)}" x2="${f(x + 7)}" y2="${f(y)}" stroke="${c.metal}" stroke-width="4" stroke-linecap="round"/>`
}
