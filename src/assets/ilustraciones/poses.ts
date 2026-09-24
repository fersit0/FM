// Catálogo de ilustraciones: una por ejercicio y por alternativa (sección 10 del brief).
// Cada una: equipo + pose inicial (fantasma) + pose final (color de estado), en el mismo cuadro.
import { type Pose, type Colores, type Punto, articular, dibujarFigura, mancuerna, barra, banco, torre, cable, piso, maquina, manija } from './figura.ts'

export interface Ilustracion {
  inicio?: Pose
  fin: Pose
  /** equipo fijo, dibujado antes de la figura */
  equipo?: (c: Colores) => string
  /** cosas pegadas a la mano (mancuerna, barra, cable) para cada pose */
  enMano?: (a: ReturnType<typeof articular>, c: Colores, fantasma: boolean) => string
}

const DE_PIE: Pose = { cadera: [100, 68], torso: -90, muslo: 90, pierna: 90, brazo: 90, antebrazo: 90 }
const SENTADO: Pose = { cadera: [100, 80], torso: -90, muslo: 10, pierna: 95, brazo: 90, antebrazo: 90 }

const catalogo: Record<string, Ilustracion> = {
  'press-banca': {
    equipo: (c) => piso(c) + banco(40, 165, 74, c),
    inicio: { cadera: [105, 70], torso: 180, muslo: 60, pierna: 95, brazo: 120, antebrazo: -90 },
    fin: { cadera: [105, 70], torso: 180, muslo: 60, pierna: 95, brazo: -90, antebrazo: -90 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  'press-inclinado': {
    equipo: (c) => piso(c) + banco(60, 160, 78, c, { x: 76, angulo: 210, largo: 44 }),
    inicio: { cadera: [108, 74], torso: 210, muslo: 55, pierna: 100, brazo: 120, antebrazo: -60 },
    fin: { cadera: [108, 74], torso: 210, muslo: 55, pierna: 100, brazo: -60, antebrazo: -60 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  'press-piso': {
    equipo: (c) => piso(c),
    inicio: { cadera: [105, 104], torso: 180, muslo: -60, pierna: 100, brazo: 180, antebrazo: -90 },
    fin: { cadera: [105, 104], torso: 180, muslo: -60, pierna: 100, brazo: -90, antebrazo: -90 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  'press-maquina': {
    equipo: (c) => piso(c) + maquina(150, c, { x: 92, y: 80 }),
    inicio: { ...SENTADO, cadera: [92, 80], brazo: 160, antebrazo: 0 },
    fin: { ...SENTADO, cadera: [92, 80], brazo: 0, antebrazo: 0 },
    enMano: (a, c) => manija(a.mano, c),
  },
  'lagartijas-banco': {
    equipo: (c) => piso(c) + banco(128, 178, 84, c),
    inicio: { cadera: [118, 92], torso: 190, muslo: -12, pierna: -3, brazo: 30, antebrazo: 130 },
    fin: { cadera: [118, 80], torso: 190, muslo: 8, pierna: 2, brazo: 90, antebrazo: 95 },
  },
  jalon: {
    equipo: (c) => piso(c) + torre(150, c, 'alta') + banco(80, 122, 84, c),
    inicio: { cadera: [100, 80], torso: -85, muslo: 5, pierna: 95, brazo: -75, antebrazo: -80 },
    fin: { cadera: [100, 80], torso: -85, muslo: 5, pierna: 95, brazo: 110, antebrazo: -20 },
    enMano: (a, c) => cable([142, 16], a.mano, c) + manija(a.mano, c, false),
  },
  'remo-mancuerna': {
    equipo: (c) => piso(c) + banco(24, 84, 80, c),
    inicio: { cadera: [95, 66], torso: 180, cabeza: 170, muslo: 150, pierna: 180, muslo2: 95, pierna2: 90, brazo: 90, antebrazo: 90 },
    fin: { cadera: [95, 66], torso: 180, cabeza: 170, muslo: 150, pierna: 180, muslo2: 95, pierna2: 90, brazo: 30, antebrazo: 120 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  dominadas: {
    equipo: (c) => piso(c) + `<line x1="60" y1="18" x2="140" y2="18" stroke="${c.equipoLinea}" stroke-width="6" stroke-linecap="round"/><line x1="60" y1="18" x2="140" y2="18" stroke="${c.metal}" stroke-width="3" stroke-linecap="round"/><rect x="70" y="100" width="60" height="8" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>`,
    inicio: { cadera: [100, 80], torso: -90, muslo: 100, pierna: 170, brazo: -90, antebrazo: -90, mano: [100, 18] },
    fin: { cadera: [100, 58], torso: -90, muslo: 100, pierna: 170, brazo: 150, antebrazo: -60, mano: [100, 18] },
  },
  goblet: {
    equipo: (c) => piso(c),
    inicio: { ...DE_PIE, brazo: 60, antebrazo: -60 },
    fin: { cadera: [92, 86], torso: -80, muslo: 20, pierna: 123, brazo: 60, antebrazo: -60 },
    enMano: (a, c) => mancuerna(a.mano, c, true),
  },
  prensa: {
    equipo: (c) =>
      piso(c) +
      `<rect x="28" y="96" width="60" height="16" rx="4" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>` +
      `<line x1="34" y1="98" x2="66" y2="46" stroke="${c.equipoLinea}" stroke-width="14" stroke-linecap="round"/><line x1="34" y1="98" x2="66" y2="46" stroke="${c.equipo}" stroke-width="10" stroke-linecap="round"/>` +
      `<line x1="150" y1="20" x2="150" y2="112" stroke="${c.equipoLinea}" stroke-width="6"/>` +
      `<line x1="104" y1="38" x2="126" y2="80" stroke="${c.equipoLinea}" stroke-width="10" stroke-linecap="round"/><line x1="104" y1="38" x2="126" y2="80" stroke="${c.metal}" stroke-width="6" stroke-linecap="round"/>`,
    inicio: { cadera: [70, 84], torso: -135, muslo: -60, pierna: 20, brazo: 45, antebrazo: 90 },
    fin: { cadera: [70, 84], torso: -135, muslo: -30, pierna: -30, brazo: 45, antebrazo: 90 },
  },
  'sentadilla-mancuernas': {
    equipo: (c) => piso(c),
    inicio: { ...DE_PIE, brazo: 92, antebrazo: 92 },
    fin: { cadera: [92, 86], torso: -80, muslo: 20, pierna: 123, brazo: 95, antebrazo: 95 },
    enMano: (a, c) => mancuerna(a.mano, c, true),
  },
  'sentadilla-banco': {
    equipo: (c) => piso(c) + banco(26, 80, 86, c),
    inicio: { ...DE_PIE, cadera: [104, 68], brazo: 70, antebrazo: 20 },
    fin: { cadera: [90, 84], torso: -75, muslo: 15, pierna: 118, brazo: -10, antebrazo: -5 },
  },
  militar: {
    equipo: (c) => piso(c) + banco(72, 128, 84, c, { x: 78, angulo: -95, largo: 48 }),
    inicio: { ...SENTADO, brazo: 0, antebrazo: -90 },
    fin: { ...SENTADO, brazo: -80, antebrazo: -85 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  'militar-pie': {
    equipo: (c) => piso(c),
    inicio: { ...DE_PIE, brazo: 0, antebrazo: -90 },
    fin: { ...DE_PIE, brazo: -80, antebrazo: -85 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  'hombro-maquina': {
    equipo: (c) => piso(c) + maquina(150, c, { x: 92, y: 80 }),
    inicio: { ...SENTADO, cadera: [92, 80], brazo: 0, antebrazo: -90 },
    fin: { ...SENTADO, cadera: [92, 80], brazo: -75, antebrazo: -85 },
    enMano: (a, c) => manija(a.mano, c, false),
  },
  'curl-z': {
    equipo: (c) => piso(c),
    inicio: { ...DE_PIE, brazo: 90, antebrazo: 90 },
    fin: { ...DE_PIE, brazo: 90, antebrazo: -60 },
    enMano: (a, c) => barra(a.mano, c, 24),
  },
  'curl-alternado': {
    equipo: (c) => piso(c),
    inicio: { ...DE_PIE, brazo: 90, antebrazo: 90, brazo2: 88, antebrazo2: 88 },
    fin: { ...DE_PIE, brazo: 90, antebrazo: -60, brazo2: 88, antebrazo2: 88 },
    enMano: (a, c) => mancuerna(a.mano, c) + (a.mano2 ? mancuerna(a.mano2, c) : ''),
  },
  martillo: {
    equipo: (c) => piso(c),
    inicio: { ...DE_PIE, brazo: 90, antebrazo: 90 },
    fin: { ...DE_PIE, brazo: 90, antebrazo: -60 },
    enMano: (a, c) => mancuerna(a.mano, c, true),
  },
  'curl-polea': {
    equipo: (c) => piso(c) + torre(150, c, 'baja'),
    inicio: { ...DE_PIE, brazo: 90, antebrazo: 80 },
    fin: { ...DE_PIE, brazo: 90, antebrazo: -60 },
    enMano: (a, c) => cable([142, 88], a.mano, c) + manija(a.mano, c, false),
  },
  'triceps-polea': {
    equipo: (c) => piso(c) + torre(150, c, 'alta'),
    inicio: { ...DE_PIE, brazo: 95, antebrazo: 0 },
    fin: { ...DE_PIE, brazo: 95, antebrazo: 70 },
    enMano: (a, c) => cable([142, 16], a.mano, c) + manija(a.mano, c, false),
  },
  'triceps-cabeza': {
    equipo: (c) => piso(c) + banco(72, 128, 84, c, { x: 78, angulo: -95, largo: 48 }),
    inicio: { ...SENTADO, brazo: -85, antebrazo: 160 },
    fin: { ...SENTADO, brazo: -85, antebrazo: -85 },
    enMano: (a, c) => mancuerna(a.mano, c),
  },
  'fondos-banco': {
    equipo: (c) => piso(c) + banco(26, 86, 80, c),
    inicio: { cadera: [100, 100], torso: -95, muslo: 10, pierna: 100, brazo: 170, antebrazo: 0, mano: [84, 80] },
    fin: { cadera: [100, 88], torso: -95, muslo: 10, pierna: 100, brazo: 120, antebrazo: 0, mano: [84, 80] },
  },
  plancha: {
    equipo: (c) => piso(c),
    fin: { cadera: [100, 96], torso: 195, cabeza: 185, muslo: 15, pierna: 15, brazo: 90, antebrazo: 0 },
  },
  'plancha-rodillas': {
    equipo: (c) => piso(c),
    fin: { cadera: [100, 92], torso: 195, cabeza: 185, muslo: 55, pierna: 5, brazo: 90, antebrazo: 0 },
  },
  'dead-bug': {
    equipo: (c) => piso(c),
    inicio: { cadera: [100, 104], torso: 180, muslo: -90, pierna: 0, brazo: -90, antebrazo: -90 },
    fin: { cadera: [100, 104], torso: 180, muslo: -20, pierna: -20, brazo: 180, antebrazo: 180, muslo2: -90, pierna2: 0, brazo2: -90, antebrazo2: -90 },
  },
  'remo-polea': {
    equipo: (c) => piso(c) + torre(160, c, 'baja') + `<rect x="66" y="84" width="60" height="8" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/><rect x="134" y="78" width="8" height="26" rx="2" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>`,
    inicio: { cadera: [95, 82], torso: -80, muslo: 5, pierna: 20, brazo: -5, antebrazo: 0 },
    fin: { cadera: [95, 82], torso: -88, muslo: 5, pierna: 20, brazo: 160, antebrazo: 0 },
    enMano: (a, c) => cable([152, 88], a.mano, c) + manija(a.mano, c),
  },
  'remo-pecho': {
    equipo: (c) => piso(c) + maquina(150, c, { x: 92, y: 80 }) + `<rect x="106" y="42" width="8" height="30" rx="3" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/>`,
    inicio: { ...SENTADO, cadera: [92, 80], brazo: 0, antebrazo: 0 },
    fin: { ...SENTADO, cadera: [92, 80], brazo: 160, antebrazo: 0 },
    enMano: (a, c) => manija(a.mano, c),
  },
  laterales: {
    equipo: (c) => piso(c),
    inicio: { cadera: [100, 68], torso: -90, muslo: 95, pierna: 90, brazo: 100, antebrazo: 100, frente: true },
    fin: { cadera: [100, 68], torso: -90, muslo: 95, pierna: 90, brazo: 5, antebrazo: 0, frente: true },
    enMano: (a, c) => {
      // de frente: mancuernas en las dos manos
      const izq: Punto = [2 * a.hombro[0] - a.mano[0], a.mano[1]]
      return mancuerna([a.mano[0] + 12, a.mano[1]], c, true) + mancuerna([izq[0] - 12, izq[1]], c, true)
    },
  },
  'laterales-sentado': {
    equipo: (c) => piso(c) + `<rect x="74" y="78" width="52" height="8" rx="4" fill="${c.equipo}" stroke="${c.equipoLinea}" stroke-width="2"/><line x1="100" y1="86" x2="100" y2="112" stroke="${c.equipoLinea}" stroke-width="4"/>`,
    inicio: { cadera: [100, 74], torso: -90, muslo: 70, pierna: 95, brazo: 100, antebrazo: 100, frente: true },
    fin: { cadera: [100, 74], torso: -90, muslo: 70, pierna: 95, brazo: 5, antebrazo: 0, frente: true },
    enMano: (a, c) => {
      const izq: Punto = [2 * a.hombro[0] - a.mano[0], a.mano[1]]
      return mancuerna([a.mano[0] + 12, a.mano[1]], c, true) + mancuerna([izq[0] - 12, izq[1]], c, true)
    },
  },
  'laterales-polea': {
    equipo: (c) => piso(c) + torre(160, c, 'baja'),
    inicio: { ...DE_PIE, brazo: 80, antebrazo: 80 },
    fin: { ...DE_PIE, brazo: -170, antebrazo: -175 },
    enMano: (a, c) => cable([152, 88], a.mano, c) + manija(a.mano, c, false),
  },
  'curl-cuerda': {
    equipo: (c) => piso(c) + torre(150, c, 'baja'),
    inicio: { ...DE_PIE, brazo: 90, antebrazo: 80 },
    fin: { ...DE_PIE, brazo: 90, antebrazo: -60 },
    enMano: (a, c) => cable([142, 88], a.mano, c) + manija(a.mano, c),
  },
  piernas: {
    equipo: (c) => piso(c) + banco(36, 126, 74, c),
    inicio: { cadera: [105, 70], torso: 180, muslo: 0, pierna: 0, brazo: 180, antebrazo: 180 },
    fin: { cadera: [105, 70], torso: 180, muslo: -90, pierna: -90, brazo: 180, antebrazo: 180 },
  },
  'piernas-piso': {
    equipo: (c) => piso(c),
    inicio: { cadera: [105, 104], torso: 180, muslo: 0, pierna: 0, brazo: 0, antebrazo: 0 },
    fin: { cadera: [105, 104], torso: 180, muslo: -90, pierna: -90, brazo: 0, antebrazo: 0 },
  },
  rodillas: {
    equipo: (c) => piso(c) + banco(36, 126, 74, c),
    inicio: { cadera: [105, 70], torso: 180, muslo: 0, pierna: 0, brazo: 180, antebrazo: 180 },
    fin: { cadera: [105, 70], torso: 180, muslo: -90, pierna: 0, brazo: 180, antebrazo: 180 },
  },
}

// Alias: mismo dibujo, distinto id
catalogo['militar-neutro'] = catalogo['militar']

export const IDS = Object.keys(catalogo)

export function existe(id: string): boolean {
  return id in catalogo
}

/** Grano de impresión sutil como patrón de puntos */
const GRANO = `<pattern id="grano" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="currentColor"/><circle cx="3" cy="3" r="0.4" fill="currentColor"/></pattern>`

/** Contenido SVG (sin la etiqueta <svg>) de una ilustración */
export function dibujarIlustracion(id: string, c: Colores): string {
  const il = catalogo[id]
  if (!il) return ''
  const partes: string[] = [`<defs>${GRANO}</defs>`, `<rect width="200" height="120" fill="url(#grano)" opacity="0.05"/>`]
  if (il.equipo) partes.push(il.equipo(c))
  if (il.inicio) {
    const a = articular(il.inicio)
    partes.push(`<g opacity="0.45">${il.enMano ? il.enMano(a, c, true) : ''}</g>`)
    partes.push(dibujarFigura(il.inicio, c, true))
  }
  const a = articular(il.fin)
  partes.push(dibujarFigura(il.fin, c, false))
  if (il.enMano) partes.push(il.enMano(a, c, false))
  return partes.join('')
}
