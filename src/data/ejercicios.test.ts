import { describe, it, expect } from 'vitest'
import { EJERCICIOS, ejerciciosDe, listaDe, rutaDe, protegidosDe, buscarCualquiera, buscarEjercicio, nombreDe, alternativasDisponibles, idsEnSesion, itemDeRutina, nombreSesion, RUTA, CALENTAMIENTO, REGLAS_GLOBALES, VERSION_CORTA_TEXTO } from './ejercicios'

const fila = (s: 'A' | 'B' | 'C', v: 'completa' | 'corta' = 'completa') => listaDe(s, v).map((e) => `${e.id} ${e.series}×${e.repsMin}-${e.repsMax} ${e.descansoSeg}s ${e.zona}`)

describe('sesiones de la v8 (MANANAS-30.md, 2)', () => {
  it('A: empuje, toda en bancos', () => {
    expect(fila('A')).toEqual(['press-inclinado 4×8-10 90s bancos', 'laterales 4×12-20 60s bancos', 'aperturas-inclinadas 2×12-15 60s bancos', 'triceps-cabeza 2×10-12 60s bancos'])
    expect(nombreSesion('A')).toBe('Empuje')
    expect(rutaDe(listaDe('A'))).toEqual(RUTA.A)
  })
  it('B: jalón, de poleas a terraza', () => {
    expect(fila('B')).toEqual(['jalon 3×10-12 75s poleas', 'remo-polea 3×10-12 75s poleas', 'goblet 3×10-12 90s terraza', 'elevacion-piernas 2×12-12 45s terraza'])
    expect(nombreSesion('B')).toBe('Jalón')
    expect(rutaDe(listaDe('B'))).toEqual(['poleas', 'terraza'])
  })
  it('la corta: los dos primeros a 3 series, que son también los que el recorte nunca toca', () => {
    expect(fila('A', 'corta')).toEqual(['press-inclinado 3×8-10 90s bancos', 'laterales 3×12-20 60s bancos'])
    expect(fila('B', 'corta')).toEqual(['jalon 3×10-12 75s poleas', 'remo-polea 3×10-12 75s poleas'])
    expect(protegidosDe('A')).toEqual(['press-inclinado', 'laterales'])
    expect(protegidosDe('B')).toEqual(['jalon', 'remo-polea'])
    for (const a of listaDe('A', 'corta').flatMap((e) => e.alternativas)) expect(a.series).toBeLessThanOrEqual(3)
  })
  it('los ids van en orden y sin repetirse dentro de una sesión', () => {
    for (const s of ['A', 'B', 'C', 'CASA'] as const) {
      const l = ejerciciosDe(s)
      expect(l.map((e) => e.orden)).toEqual(l.map((_, i) => i + 1))
      expect(new Set(l.map((e) => e.id)).size).toBe(l.length)
    }
  })
  it('calentamiento de 3 min; en la corta, solo la serie de aproximación', () => {
    expect(CALENTAMIENTO.minCompleta).toBe(3)
    expect(CALENTAMIENTO.minCorta).toBe(1)
    expect(CALENTAMIENTO.textoCorta).toContain('aproximación')
  })
  it('las reglas hablan de esta versión', () => {
    const texto = REGLAS_GLOBALES.map((r) => r.texto).join(' ') + VERSION_CORTA_TEXTO
    expect(texto).toContain('te bañas en el club')
    expect(texto).toContain('se alternan')
    expect(texto).not.toMatch(/sin pierna|sauna|tres sesiones base|Pesas extra/)
  })
})

describe('lo que salió de la rotación (MANANAS-30.md, 2 y 7)', () => {
  it('la C ya no se ofrece pero sigue ahí, con su corta, para que su historial se vea', () => {
    expect(listaDe('C').map((e) => e.id)).toEqual(['jalon', 'remo-polea', 'press-militar', 'laterales', 'curl-martillo', 'crunch'])
    expect(listaDe('C', 'corta').map((e) => e.id)).toEqual(['jalon', 'press-militar', 'laterales'])
  })
  it('los ejercicios que salieron siguen teniendo nombre y ficha: quedan como alternativas o en la C', () => {
    for (const id of ['press-plano', 'jalon-cerrado', 'triceps-polea', 'curl-alternado', 'curl-martillo', 'press-militar', 'puente-gluteo', 'crunch', 'remo-pecho-apoyado']) {
      expect(buscarCualquiera(id), id).toBeTruthy()
      expect(nombreDe(id), id).not.toBe(id)
    }
    expect(nombreDe('puente-sin-peso')).toBe('Puente de glúteo sin mancuerna')
  })
  it('dónde quedó cada una como alternativa', () => {
    const alts = (id: string) => buscarEjercicio(id)!.alternativas.map((a) => a.id)
    expect(alts('press-inclinado')).toEqual(['press-plano', 'press-piso'])
    expect(alts('triceps-cabeza')).toEqual(['triceps-polea', 'triceps-patada'])
    expect(alts('jalon')).toEqual(['jalon-cerrado', 'remo-mancuerna'])
    expect(alts('remo-polea')).toEqual(['remo-pecho-apoyado'])
    expect(alts('goblet')).toEqual(['sentadilla-mancuernas', 'puente-gluteo'])
    expect(alts('elevacion-piernas')).toEqual(['crunch'])
  })
  it('las alternativas que antes eran ejercicio conservan su técnica', () => {
    for (const id of ['jalon-cerrado', 'triceps-polea', 'puente-gluteo']) {
      const a = buscarCualquiera(id)!.item
      expect(a.tecnica.length, id).toBeGreaterThan(0)
      expect(a.errores.length, id).toBeGreaterThan(0)
      expect('caso' in a && a.caso, id).toBeTruthy()
    }
  })
})

describe('alternativas en la sesión', () => {
  it('todas las de A y B se pueden elegir: ninguna repite un movimiento de su sesión', () => {
    for (const s of ['A', 'B'] as const) for (const e of listaDe(s)) expect(alternativasDisponibles(e, listaDe(s)).map((a) => a.id)).toEqual(e.alternativas.map((a) => a.id))
  })
  it('una alternativa se oculta si su id ya está en la sesión por otro ejercicio', () => {
    const c = listaDe('C')
    const crunch = c.find((e) => e.id === 'crunch')!
    const otro = { ...c[0], alternativas: [...c[0].alternativas, crunch.alternativas[0]] }
    const lista = [otro, ...c.slice(1)]
    expect(alternativasDisponibles(otro, lista).map((a) => a.id)).toContain(crunch.alternativas[0].id)
    expect(alternativasDisponibles(otro, lista, [{ ejercicioId: 'crunch', alternativaId: crunch.alternativas[0].id }]).map((a) => a.id)).not.toContain(crunch.alternativas[0].id)
  })
  it('"Usar siempre esta" cambia el ejercicio de la rutina', () => {
    const tri = buscarEjercicio('triceps-cabeza')!
    expect(itemDeRutina(tri).id).toBe('triceps-cabeza')
    expect(itemDeRutina(tri, { 'triceps-cabeza': 'triceps-polea' }).id).toBe('triceps-polea')
    expect([...idsEnSesion(listaDe('A'), [], { 'triceps-cabeza': 'triceps-polea' })]).toEqual(['press-inclinado', 'laterales', 'aperturas-inclinadas', 'triceps-polea'])
  })
  it('todo lo del gym tiene zona y lo de casa no', () => {
    for (const e of EJERCICIOS) expect(!!e.zona, e.id).toBe(e.sesion !== 'CASA')
  })
})
