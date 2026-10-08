import { describe, it, expect } from 'vitest'
import { listaDe, rutaDe, alternativasDisponibles, ejerciciosDe, buscarEjercicio, buscarCualquiera, EJERCICIOS, NOMBRES_RETIRADOS, RUTA, NOMBRE_SESION, CALENTAMIENTO, CIERRE, RECORTE_ORDEN } from './ejercicios'

const ids = (l: { id: string }[]) => l.map((e) => e.id)

describe('sesiones por zona, sin pares (RUTINA-FINAL.md, 4, 5 y 5c)', () => {
  it('A: pecho y pierna · Bancos → Terraza', () => {
    const a = listaDe('A')
    expect(ids(a)).toEqual(['press-inclinado', 'aperturas-inclinadas', 'laterales', 'triceps-cabeza', 'goblet', 'puente-gluteo', 'crunch'])
    expect(a.map((e) => e.zona)).toEqual(['bancos', 'bancos', 'bancos', 'bancos', 'terraza', 'terraza', 'terraza'])
    expect(a.map((e) => e.series)).toEqual([3, 2, 3, 2, 3, 2, 2])
    expect(a.map((e) => `${e.repsMin}-${e.repsMax}`)).toEqual(['8-10', '12-15', '12-20', '10-12', '10-12', '12-15', '15-20'])
    expect(a.map((e) => e.descansoSeg)).toEqual([90, 60, 60, 60, 90, 60, 45])
    expect(rutaDe(a)).toEqual(['bancos', 'terraza'])
    expect(NOMBRE_SESION.A).toBe('Pecho y pierna')
  })
  it('B: torso completo · Bancos → Poleas → Terraza', () => {
    const b = listaDe('B')
    expect(ids(b)).toEqual(['press-plano', 'laterales', 'jalon-cerrado', 'remo-polea', 'triceps-polea', 'curl-alternado', 'elevacion-piernas'])
    expect(b.map((e) => e.zona)).toEqual(['bancos', 'bancos', 'poleas', 'poleas', 'poleas', 'terraza', 'terraza'])
    expect(b.map((e) => e.series)).toEqual([3, 3, 3, 3, 3, 2, 3])
    expect(b.map((e) => e.descansoSeg)).toEqual([90, 60, 75, 75, 60, 60, 45])
    expect(rutaDe(b)).toEqual(['bancos', 'poleas', 'terraza'])
    expect(NOMBRE_SESION.B).toBe('Torso completo')
  })
  it('C: espalda y hombro · Poleas → Bancos → Terraza', () => {
    const c = listaDe('C')
    expect(ids(c)).toEqual(['jalon', 'remo-polea', 'press-militar', 'laterales', 'curl-martillo', 'crunch'])
    expect(c.map((e) => e.zona)).toEqual(['poleas', 'poleas', 'bancos', 'bancos', 'terraza', 'terraza'])
    expect(c.map((e) => e.series)).toEqual([3, 3, 3, 3, 3, 2])
    expect(rutaDe(c)).toEqual(['poleas', 'bancos', 'terraza'])
    expect(NOMBRE_SESION.C).toBe('Espalda y hombro')
    expect(RUTA).toEqual({ A: ['bancos', 'terraza'], B: ['bancos', 'poleas', 'terraza'], C: ['poleas', 'bancos', 'terraza'], CASA: [] })
  })
  it('cada zona se visita una sola vez y los ejercicios van en orden de zona', () => {
    for (const s of ['A', 'B', 'C'] as const) {
      const zonas = listaDe(s).map((e) => e.zona!)
      expect(new Set(zonas).size, s).toBe(rutaDe(listaDe(s)).length)
      expect(zonas, s).toEqual([...zonas].sort((x, y) => RUTA[s].indexOf(x) - RUTA[s].indexOf(y)))
    }
  })
  it('la pierna va siempre en A y nada depende de Frida', () => {
    expect(listaDe('A').some((e) => e.id === 'goblet')).toBe(true)
    expect(listaDe('B').some((e) => e.id === 'goblet')).toBe(false)
    expect(listaDe('C').some((e) => e.id === 'goblet')).toBe(false)
    expect(EJERCICIOS.some((e) => 'pierna' in e)).toBe(false)
  })
  it('la corta: tres ejercicios a 3 series por sesión', () => {
    expect(ids(listaDe('A', 'corta'))).toEqual(['press-inclinado', 'laterales', 'goblet'])
    expect(ids(listaDe('B', 'corta'))).toEqual(['press-plano', 'laterales', 'jalon-cerrado'])
    expect(ids(listaDe('C', 'corta'))).toEqual(['jalon', 'press-militar', 'laterales'])
    for (const s of ['A', 'B', 'C'] as const) expect(listaDe(s, 'corta').every((e) => e.series === 3), s).toBe(true)
    expect(rutaDe(listaDe('A', 'corta'))).toEqual(['bancos', 'terraza'])
    expect(rutaDe(listaDe('B', 'corta'))).toEqual(['bancos', 'poleas'])
    expect(rutaDe(listaDe('C', 'corta'))).toEqual(['poleas', 'bancos'])
  })
  it('CASA: 12 minutos en kg, sin cambios', () => {
    expect(ids(listaDe('CASA'))).toEqual(['laterales-casa', 'lagartijas', 'remo-liga', 'crunch'])
    expect(ids(buscarEjercicio('crunch', 'CASA')!.alternativas)).toEqual(['elevacion-piernas-piso'])
  })
  it('calentamiento 8 min (5 en la corta) y cierre 10 (5 en la corta), saco 1 fuerte y 1 suave cinco veces', () => {
    expect(CALENTAMIENTO.minCompleta).toBe(8)
    expect(CALENTAMIENTO.minCorta).toBe(5)
    expect(CIERRE.minCompleta).toBe(10)
    expect(CIERRE.minCorta).toBe(5)
    expect(CIERRE.saco).toMatch(/1 min fuerte y 1 min suave, cinco veces/)
  })
  it('el jalón cerrado y el ancho son la misma máquina; los dos remos de B y C son el mismo id', () => {
    expect(buscarEjercicio('jalon-cerrado')!.ubicar).toMatch(/misma máquina/)
    expect(buscarEjercicio('remo-polea', 'B')!.id).toBe(buscarEjercicio('remo-polea', 'C')!.id)
  })
})

describe('alternativas (RUTINA-FINAL.md, 7)', () => {
  const alts = (id: string, sesion: 'A' | 'B' | 'C' | 'CASA') => ids(buscarEjercicio(id, sesion)!.alternativas)
  it('cada ejercicio tiene las del archivo', () => {
    expect(alts('press-inclinado', 'A')).toEqual(['press-plano', 'press-piso'])
    expect(alts('aperturas-inclinadas', 'A')).toEqual(['aperturas-mancuernas', 'lagartijas'])
    expect(alts('laterales', 'A')).toEqual(['laterales-sentado'])
    expect(alts('triceps-cabeza', 'A')).toEqual(['triceps-patada'])
    expect(alts('goblet', 'A')).toEqual(['sentadilla-mancuernas'])
    expect(alts('puente-gluteo', 'A')).toEqual(['puente-sin-peso'])
    expect(alts('crunch', 'A')).toEqual(['elevacion-piernas'])
    expect(alts('press-plano', 'B')).toEqual(['press-piso', 'lagartijas'])
    expect(alts('jalon-cerrado', 'B')).toEqual(['remo-mancuerna'])
    expect(alts('jalon', 'C')).toEqual(['remo-mancuerna'])
    expect(alts('remo-polea', 'B')).toEqual(['remo-pecho-apoyado'])
    expect(alts('triceps-polea', 'B')).toEqual(['triceps-cabeza', 'triceps-patada'])
    expect(alts('press-militar', 'C')).toEqual(['press-militar-pie'])
    expect(alts('curl-alternado', 'B')).toEqual(['curl-martillo'])
    expect(alts('curl-martillo', 'C')).toEqual(['curl-alternado'])
    expect(alts('elevacion-piernas', 'B')).toEqual(['crunch'])
  })
  it('el puente sin mancuerna es el mismo ejercicio sin peso y con 20 repeticiones', () => {
    const p = buscarCualquiera('puente-sin-peso')!
    expect(p.base.id).toBe('puente-gluteo')
    expect(p.item).toMatchObject({ modo: 'corporal', series: 2, repsMin: 20, repsMax: 20 })
  })
  it('solo equipo que Fer ubica: ninguna alternativa "en máquina"; sin prensa, pec deck, barra Z, plancha ni cruce de poleas', () => {
    for (const e of EJERCICIOS) {
      expect(Object.keys(NOMBRES_RETIRADOS), e.id).not.toContain(e.id)
      for (const a of e.alternativas) {
        expect(a.nombre, a.id).not.toMatch(/máquina/i)
        expect(Object.keys(NOMBRES_RETIRADOS), a.id).not.toContain(a.id)
      }
    }
    for (const id of ['curl-z', 'plancha', 'prensa', 'aperturas-maquina', 'cruce-poleas', 'press-pecho-maquina', 'press-inclinado-maquina', 'press-hombro-maquina', 'remo-pecho-maquina', 'remo-alto-maquina', 'laterales-polea', 'curl-polea', 'curl-cuerda', 'dominadas-asistidas', 'fondos-banco', 'remo-polea-una-mano']) {
      expect(buscarCualquiera(id), id).toBeUndefined()
      expect(NOMBRES_RETIRADOS[id], id).toBeTruthy()
    }
  })
  it('una alternativa se oculta si su id ya está en la sesión', () => {
    // en B, tríceps con cuerda ofrece tríceps sobre la cabeza (no está en B); en A el tríceps sobre la cabeza es de la rutina
    expect(ids(alternativasDisponibles(buscarEjercicio('triceps-polea')!, listaDe('B')))).toEqual(['triceps-cabeza', 'triceps-patada'])
    // crunch y elevación de piernas: en A la alternativa del crunch es elevación, en B la de elevación es crunch; en C igual
    expect(ids(alternativasDisponibles(buscarEjercicio('crunch', 'A')!, listaDe('A')))).toEqual(['elevacion-piernas'])
    expect(ids(alternativasDisponibles(buscarEjercicio('elevacion-piernas')!, listaDe('B')))).toEqual(['crunch'])
    // si press inclinado cambió a press plano, aperturas ya no ofrece lagartijas si las lagartijas se eligieron en otro
    const cambios = [{ ejercicioId: 'press-inclinado', alternativaId: 'press-plano' }]
    expect(ids(alternativasDisponibles(buscarEjercicio('aperturas-inclinadas')!, listaDe('A'), cambios))).toEqual(['aperturas-mancuernas', 'lagartijas'])
    const conLagartijas = [{ ejercicioId: 'aperturas-inclinadas', alternativaId: 'lagartijas' }]
    expect(ids(alternativasDisponibles(buscarEjercicio('press-inclinado')!, listaDe('A'), conLagartijas))).toEqual(['press-plano', 'press-piso'])
    expect(ids(alternativasDisponibles(buscarEjercicio('press-plano')!, listaDe('B'), [{ ejercicioId: 'press-plano', alternativaId: 'lagartijas' }]))).toEqual(['press-piso', 'lagartijas'])
  })
  it('el recorte quita primero abdomen, luego brazos, luego aperturas o puente; nunca press principal, jalón, remo, laterales ni goblet', () => {
    expect(RECORTE_ORDEN).toEqual([['crunch', 'elevacion-piernas'], ['curl-alternado', 'curl-martillo', 'triceps-cabeza', 'triceps-polea'], ['aperturas-inclinadas', 'puente-gluteo']])
    const quitables = RECORTE_ORDEN.flat()
    for (const id of ['press-inclinado', 'press-plano', 'press-militar', 'jalon', 'jalon-cerrado', 'remo-polea', 'laterales', 'goblet']) expect(quitables).not.toContain(id)
  })
  it('todos los ids de la rutina y las alternativas tienen nombre', () => {
    for (const e of ejerciciosDe('A')) expect(e.nombre.length).toBeGreaterThan(3)
  })
})
