import { describe, it, expect } from 'vitest'
import type { Sesion, SesionTipo, SetLog } from '../data/tipos'
import { sesionRegistrada, visita, absorbida, cargaInicial, seriesPlaneadas, comoQuedo, cierresPendientes, esDiaDeGym, momentoDe, momentoPorDefecto, diasSinRegistro, sugeridaPara, armarRegistro, textoUltima, cambiarTipo } from './registro'
import { desdeClave, DIAS_NOMBRE } from './fechas'

// semana del lunes 23 al domingo 29 de noviembre de 2026
const L = '2026-11-23', M = '2026-11-24', X = '2026-11-25', J = '2026-11-26', V = '2026-11-27', S = '2026-11-28', D = '2026-11-29', L2 = '2026-11-30'
const s = (fecha: string, tipo: SesionTipo, extra: Partial<Sesion> = {}): Sesion => ({ id: `${fecha}-${tipo}`, fecha, tipo, version: 'completa', inicio: new Date(`${fecha}T07:40:00`).getTime(), terminada: true, ...extra })
const dia = (f: string, h = 7, m = 40) => { const d = desdeClave(f); d.setHours(h, m); return d }
const set = (sessionId: string, n: number): SetLog => ({ sessionId, exerciseId: 'press-inclinado', ejercicioBaseId: 'press-inclinado', numSerie: n, pesoKg: 10, reps: 8, fecha: M, hora: 1000 + n })

describe('visita de solo regadera (MANANAS-30.md, 4)', () => {
  it('es una por día, sin ejercicios, en la mañana y ya cerrada', () => {
    const v = visita(M)
    expect(v).toMatchObject({ id: `visita-${M}`, tipo: 'VISITA', fecha: M, terminada: true, momento: 'manana', origen: 'registro' })
    expect(seriesPlaneadas(v)).toBe(0)
  })
  it('si ese día hay pesas en el club, la visita queda absorbida; con Frida no', () => {
    const v = visita(M)
    expect(absorbida(v, [v, s(M, 'A')])).toBe(true)
    expect(absorbida(v, [v, s(M, 'FRIDA')])).toBe(false)
    expect(absorbida(v, [v, s(X, 'A')])).toBe(false)
    expect(absorbida(s(M, 'A'), [v, s(M, 'A')])).toBe(false)
  })
  it('no se registra sobre un día que ya tiene pesas en el club, ni dos veces', () => {
    expect(armarRegistro([s(M, 'B')], M, 'VISITA', M)).toEqual({ error: 'Ese día ya tiene B: la ida al club ya está contada.' })
    const r = armarRegistro([visita(M)], M, 'VISITA', M)
    expect('sesion' in r && r.reemplaza?.id).toBe(`visita-${M}`)
    const nueva = armarRegistro([], M, 'VISITA', M)
    expect('sesion' in nueva && nueva.reemplaza).toBeNull()
  })
})

describe('registrar una sesión hecha sin la app', () => {
  it('nunca en el futuro', () => {
    expect(armarRegistro([], X, 'A', M)).toEqual({ error: 'Esa fecha todavía no llega.' })
  })
  it('una de club por día: si ya hay, ofrece cambiarla en vez de duplicar', () => {
    const r = armarRegistro([s(M, 'A', { origen: 'app', como: 'completa' })], M, 'B', M, undefined, { momento: 'noche' })
    if (!('sesion' in r)) throw new Error('debía armar')
    expect(r.reemplaza?.tipo).toBe('A')
    expect(r.sesion).toMatchObject({ id: `${M}-A`, tipo: 'B', momento: 'noche', como: 'completa' })
  })
  it('Frida es una por día, con su tipo (torso si no se dice) y su nota', () => {
    const r = armarRegistro([], L, 'FRIDA', M, 'espalda', { fridaTipo: 'pierna', momento: 'noche' })
    if (!('sesion' in r)) throw new Error('debía armar')
    expect(r.sesion).toMatchObject({ id: `frida-${L}`, tipo: 'FRIDA', fridaTipo: 'pierna', momento: 'noche', nota: 'espalda', como: 'registrada' })
    const otra = armarRegistro([r.sesion], L, 'FRIDA', M)
    expect('sesion' in otra && otra.reemplaza?.id).toBe(`frida-${L}`)
    expect('sesion' in otra && otra.sesion.fridaTipo).toBe('pierna')
    const sinTipo = armarRegistro([], L, 'FRIDA', M)
    expect('sesion' in sinTipo && sinTipo.sesion.fridaTipo).toBe('torso')
  })
  it('la sesión registrada queda a las 7:30 pm, de una hora y marcada como registrada', () => {
    const r = sesionRegistrada(M, 'A')
    expect(new Date(r.inicio).getHours()).toBe(19)
    expect(r).toMatchObject({ terminada: true, como: 'registrada', origen: 'registro' })
    expect(r.fin! - r.inicio).toBe(3600_000)
  })
  it('la A del 7 de octubre se carga una sola vez', () => {
    expect(cargaInicial([])?.fecha).toBe('2026-10-07')
    expect(cargaInicial([s('2026-10-07', 'B')])).toBeNull()
  })
  it('mañana antes de las 12; al registrar después, Frida en la noche y lo demás en la mañana', () => {
    expect(momentoDe(dia(M, 11, 59).getTime())).toBe('manana')
    expect(momentoDe(dia(M, 12, 0).getTime())).toBe('noche')
    expect(momentoPorDefecto('FRIDA')).toBe('noche')
    expect(momentoPorDefecto('A')).toBe('manana')
    expect(momentoPorDefecto('VISITA')).toBe('manana')
    expect(momentoPorDefecto()).toBe('manana')
  })
  it('"la última fue A el lunes 23"', () => {
    expect(textoUltima(s(L, 'A'), DIAS_NOMBRE)).toBe('la última fue A el lunes 23')
    expect(textoUltima(null, DIAS_NOMBRE)).toBe('sin sesiones todavía')
  })
})

describe('días sin registro (MANANAS-30.md, 4)', () => {
  it('día de club es de lunes a viernes; sábado y domingo no', () => {
    expect([L, M, X, J, V, S, D].map((f) => esDiaDeGym(f))).toEqual([true, true, true, true, true, false, false])
  })
  it('pregunta por los días hábiles sin nada desde la última sesión, con la que tocaba', () => {
    expect(diasSinRegistro([s(L, 'A')], [], { v8Desde: L }, dia(J))).toEqual([{ fecha: M, sugerida: 'B' }, { fecha: X, sugerida: 'B' }])
  })
  it('no pregunta por fin de semana, por lo ya contestado "No fui", por hoy, ni por días con registro', () => {
    expect(diasSinRegistro([s(J, 'A')], [], { v8Desde: L }, dia(L2))).toEqual([{ fecha: V, sugerida: 'B' }])
    expect(diasSinRegistro([s(J, 'A')], [], { v8Desde: L, noFui: [V] }, dia(L2))).toEqual([])
    expect(diasSinRegistro([s(L, 'A'), s(M, 'VISITA')], [], { v8Desde: L }, dia(X))).toEqual([])
  })
  it('nunca pregunta por días de antes de la v8, y sin la marca no pregunta', () => {
    expect(diasSinRegistro([s('2026-11-18', 'A')], [], { v8Desde: M }, dia(J))).toEqual([{ fecha: M, sugerida: 'A' }, { fecha: X, sugerida: 'A' }])
    expect(diasSinRegistro([s('2026-11-18', 'A')], [], { v8Desde: J }, dia(J))).toEqual([])
    expect(diasSinRegistro([s(L, 'A')], [], {}, dia(J))).toEqual([])
  })
  it('lo que tocaba un día sale de la rotación con lo hecho antes', () => {
    expect(sugeridaPara(X, [s(L, 'A'), s(X, 'B')], [])).toBe('B')
    expect(sugeridaPara(J, [s(L, 'A'), s(X, 'B')], [])).toBe('A')
  })
})

describe('cómo quedó y cierres', () => {
  it('series planeadas: A 12, B 11, la corta 6; menos lo recortado', () => {
    expect(seriesPlaneadas(s(M, 'A'))).toBe(12)
    expect(seriesPlaneadas(s(M, 'B'))).toBe(11)
    expect(seriesPlaneadas(s(M, 'A', { version: 'corta' }))).toBe(6)
    expect(seriesPlaneadas(s(M, 'A', { recortados: ['triceps-cabeza'], seriesMenos: { 'aperturas-inclinadas': 1 } }))).toBe(9)
    expect(seriesPlaneadas(s(M, 'A', { ligera: true }))).toBe(8)
    expect(seriesPlaneadas(s(M, 'FRIDA'))).toBe(0)
  })
  it('completa con la mayoría de las series, parcial con pocas, corta si era corta', () => {
    const a = s(M, 'A')
    expect(comoQuedo(a, [1, 2, 3, 4, 5, 6].map((n) => set(a.id, n)))).toBe('completa')
    expect(comoQuedo(a, [1, 2].map((n) => set(a.id, n)))).toBe('parcial')
    const corta = s(M, 'A', { version: 'corta' })
    expect(comoQuedo(corta, [1, 2, 3].map((n) => set(corta.id, n)))).toBe('corta')
  })
  it('las abiertas de otros días se cierran con series y se descartan sin ellas; las de hoy se quedan', () => {
    const conSeries = s(L, 'A', { terminada: false })
    const vacia = s(L, 'B', { terminada: false, id: 'vacia' })
    const deHoy = s(M, 'B', { terminada: false, id: 'hoy' })
    const r = cierresPendientes([conSeries, vacia, deHoy], [set(conSeries.id, 1)], M)
    expect(r.guardar).toHaveLength(1)
    expect(r.guardar[0]).toMatchObject({ id: conSeries.id, terminada: true, fin: 1001, como: 'parcial', origen: 'app' })
    expect(r.borrar).toEqual(['vacia'])
    expect(cierresPendientes([deHoy], [], M, true).borrar).toEqual(['hoy'])
  })
})

describe('cambiar en Historial qué fue una sesión', () => {
  it('una de club por día', () => {
    expect(cambiarTipo([s(M, 'A'), s(M, 'FRIDA')], s(M, 'FRIDA'), 'B')).toEqual({ error: 'Ese día ya tiene A.' })
    expect(cambiarTipo([s(M, 'A')], s(M, 'A'), 'B')).toMatchObject({ tipo: 'B' })
  })
  it('Frida lleva su tipo; lo demás no', () => {
    expect(cambiarTipo([s(M, 'A')], s(M, 'A'), 'FRIDA', 'pierna')).toMatchObject({ tipo: 'FRIDA', fridaTipo: 'pierna' })
    expect(cambiarTipo([s(M, 'FRIDA')], s(M, 'FRIDA', { fridaTipo: 'pierna' }), 'VISITA')).toMatchObject({ tipo: 'VISITA', fridaTipo: undefined })
  })
  it('la "A sin pierna" de la v7 se conserva mientras siga siendo A', () => {
    const vieja = s(M, 'A', { sinPierna: true })
    expect(cambiarTipo([vieja], vieja, 'A')).toMatchObject({ sinPierna: true })
    expect(cambiarTipo([vieja], vieja, 'B')).toMatchObject({ sinPierna: undefined })
  })
})
