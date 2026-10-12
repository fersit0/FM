import { describe, it, expect } from 'vitest'
import { estadoSemana, avisoRescate, seriesPara, casaDeSemana, casaDisponible, estadoFrida, diaFridaPlaneado, diasParaMoverFrida, cuenta, ultimaPropia, semanaSinFrida, sesionesBase, faltantes, elegirSesion, type PlanFrida } from './semana'
import type { Sesion, SetLog } from '../data/tipos'
import { inicioSemana, claveFecha } from './fechas'

export function sesion(fecha: string, tipo: Sesion['tipo'], terminada = true): Sesion {
  const d = new Date(fecha + 'T20:00:00')
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: d.getTime(), fin: d.getTime() + 3600e3, terminada }
}
const serie = (sessionId: string, n = 1): SetLog => ({ sessionId, exerciseId: 'jalon', ejercicioBaseId: 'jalon', numSerie: n, pesoKg: 40, reps: 10, fecha: '2026-09-21', hora: n })

// Semana del lunes 5 al domingo 11 de octubre de 2026 (la del miércoles 7, cuando Fer hizo la A sin la app)
const LUN = '2026-10-05', MAR = '2026-10-06', MIE = '2026-10-07', JUE = '2026-10-08', DOM = '2026-10-11'
const dia = (f: string, h = '19:00:00') => new Date(`${f}T${h}`)
const SIN_FRIDA: PlanFrida = { [LUN]: null }

describe('la que cuenta', () => {
  it('una sesión abierta cuenta en cuanto tiene una serie; sin series no', () => {
    const abierta = sesion(MIE, 'B', false)
    expect(cuenta(abierta)).toBe(false)
    expect(cuenta(abierta, [serie(abierta.id)])).toBe(true)
  })
  it('la última de club es la A, B o C más reciente por fecha, aunque se registre después', () => {
    expect(ultimaPropia([sesion(MAR, 'A'), { ...sesion(LUN, 'C'), inicio: 9e15 }])?.tipo).toBe('A')
    expect(ultimaPropia([sesion(MAR, 'C'), sesion(LUN, 'FRIDA'), sesion(MIE, 'CASA')])?.tipo).toBe('C')
    expect(ultimaPropia([])).toBeNull()
  })
})

describe('semana', () => {
  it('la semana empieza en lunes', () => {
    expect(claveFecha(inicioSemana(new Date('2026-09-27T10:00:00')))).toBe('2026-09-21') // domingo
    expect(claveFecha(inicioSemana(new Date('2026-09-21T10:00:00')))).toBe('2026-09-21') // lunes
  })
  it('cuenta FRIDA, A, B y C para la meta; CASA no', () => {
    const s = [sesion(LUN, 'FRIDA'), sesion(MAR, 'A'), sesion(JUE, 'B'), sesion('2026-09-28', 'A'), sesion(MIE, 'CASA')]
    const e = estadoSemana(s, dia('2026-10-09'))
    expect(e.hechas).toBe(3)
    expect(e.bonus).toBe(true)
    expect(e.fridaHecha).toBe(true)
    expect(e.dias[0].tipos).toEqual(['FRIDA'])
    expect(e.dias[3].tipos).toEqual(['B'])
    expect(estadoSemana([sesion(MAR, 'C')], dia(MIE)).hechas).toBe(1)
  })
  it('CASA no cuenta para la meta y se topa en 2', () => {
    const s = [sesion(MAR, 'A'), sesion(MIE, 'CASA'), sesion(JUE, 'CASA')]
    const d = dia('2026-10-09')
    expect(estadoSemana(s, d).hechas).toBe(1)
    expect(casaDeSemana(s, d)).toBe(2)
    expect(casaDisponible(s, d)).toBe(false)
    expect(casaDisponible([s[0]], d)).toBe(true)
  })
  it('la semana ligera baja a 2 series; si no, las de la rutina', () => {
    expect(seriesPara(3)).toBe(3)
    expect(seriesPara(3, true)).toBe(2)
    expect(seriesPara(2, true)).toBe(2)
  })
})

describe('Frida (RUTINA-FINAL.md, 2)', () => {
  it('el lunes por defecto; el día planeado Hoy muestra Frida', () => {
    expect(diaFridaPlaneado(undefined, dia(MAR))).toBe(LUN)
    const e = estadoFrida([], undefined, dia(LUN, '10:00:00'))
    expect(e.hoyEsFrida).toBe(true)
    expect(e.pendiente).toBeNull()
  })
  it('"Fui con Frida" registra la sesión y la semana tiene Frida', () => {
    const s = [sesion(LUN, 'FRIDA')]
    expect(estadoFrida(s, undefined, dia(MAR)).hecha).toBe(LUN)
    expect(semanaSinFrida(s, undefined, dia(MAR))).toBe(false)
  })
  it('registrada otro día, ese pasa a ser el día de Frida de la semana', () => {
    const s = [sesion(MIE, 'FRIDA')]
    expect(estadoFrida(s, undefined, dia(JUE)).hecha).toBe(MIE)
    expect(semanaSinFrida(s, SIN_FRIDA, dia(JUE))).toBe(false)
  })
  it('movida al miércoles: el martes no es Frida y el miércoles sí', () => {
    const plan = { [LUN]: MIE }
    expect(estadoFrida([], plan, dia(MAR)).hoyEsFrida).toBe(false)
    expect(estadoFrida([], plan, dia(MIE)).hoyEsFrida).toBe(true)
  })
  it('el día planeado pasó sin respuesta: queda pendiente y la semana todavía no está sin Frida', () => {
    const e = estadoFrida([], undefined, dia(MAR))
    expect(e.pendiente).toBe(LUN)
    expect(semanaSinFrida([], undefined, dia(MAR))).toBe(false)
  })
  it('"Esta semana no hay" o "No hubo" dejan la semana sin Frida y C entra a las sesiones base', () => {
    expect(semanaSinFrida([], SIN_FRIDA, dia(MAR))).toBe(true)
    expect(sesionesBase([], SIN_FRIDA, dia(MAR))).toEqual(['C', 'A', 'B'])
    expect(sesionesBase([], undefined, dia(MAR))).toEqual(['FRIDA', 'A', 'B'])
    // no se arrastra a la otra semana
    expect(semanaSinFrida([], SIN_FRIDA, dia('2026-10-13'))).toBe(false)
  })
  it('se puede mover de hoy en adelante dentro de la semana', () => {
    expect(diasParaMoverFrida(dia(MIE))).toEqual([MIE, JUE, '2026-10-09', '2026-10-10', DOM])
  })
})

describe('elección de la sesión de club (RUTINA-FINAL.md, 2)', () => {
  const tipo = (s: Sesion[], f: string, plan?: PlanFrida) => elegirSesion(s, plan, dia(f)).tipo
  it('las que faltan son A y B siempre, y C solo si la semana está sin Frida, en orden C → A → B', () => {
    expect(faltantes([], undefined, dia(MAR))).toEqual(['A', 'B'])
    expect(faltantes([], SIN_FRIDA, dia(MAR))).toEqual(['C', 'A', 'B'])
    expect(faltantes([sesion(MAR, 'C'), sesion(MIE, 'B')], SIN_FRIDA, dia(JUE))).toEqual(['A'])
    expect(faltantes([sesion(MAR, 'A'), sesion(MIE, 'B')], undefined, dia(JUE))).toEqual([])
  })
  it('semana normal: Frida lunes, A martes, B jueves', () => {
    const frida = [sesion(LUN, 'FRIDA')]
    expect(tipo(frida, MAR)).toBe('A')
    expect(tipo([...frida, sesion(MAR, 'A')], JUE)).toBe('B')
  })
  it('con 4 días: Frida, A, B y el jueves A como extra', () => {
    const s = [sesion(LUN, 'FRIDA'), sesion(MAR, 'A')]
    expect(elegirSesion(s, undefined, dia(MIE))).toEqual({ tipo: 'B', extra: false })
    expect(elegirSesion([...s, sesion(MIE, 'B')], undefined, dia(JUE))).toEqual({ tipo: 'A', extra: true })
  })
  it('Frida el martes: el lunes y el miércoles A, el jueves B', () => {
    const plan = { [LUN]: MAR }
    expect(tipo([], LUN, plan)).toBe('A')
    expect(tipo([sesion(MAR, 'FRIDA')], MIE, plan)).toBe('A')
    expect(tipo([sesion(MAR, 'FRIDA'), sesion(MIE, 'A')], JUE, plan)).toBe('B')
  })
  it('sin Frida: C martes, A miércoles, B jueves', () => {
    expect(tipo([], MAR, SIN_FRIDA)).toBe('C')
    expect(tipo([sesion(MAR, 'C')], MIE, SIN_FRIDA)).toBe('A')
    expect(tipo([sesion(MAR, 'C'), sesion(MIE, 'A')], JUE, SIN_FRIDA)).toBe('B')
  })
  it('faltó a días: Frida, A y el domingo B (no es extra)', () => {
    expect(elegirSesion([sesion(LUN, 'FRIDA'), sesion(MAR, 'A')], undefined, dia(DOM))).toEqual({ tipo: 'B', extra: false })
  })
  it('Frida el miércoles: el martes A (Frida es mañana), el jueves B', () => {
    const plan = { [LUN]: MIE }
    expect(tipo([], MAR, plan)).toBe('A')
    expect(tipo([sesion(MAR, 'A'), sesion(MIE, 'FRIDA')], JUE, plan)).toBe('B')
  })
  it('después de Frida o de C nunca se ofrece B ni C mientras falte A', () => {
    // ayer C y falta A: A, aunque C → A → B ya lo daría; con A hecha ayer, B sí
    expect(tipo([sesion(MAR, 'C')], MIE, SIN_FRIDA)).toBe('A')
    // ayer Frida, falta A y B: A. Con Frida registrada el martes (día movido) igual
    expect(tipo([sesion(MAR, 'FRIDA')], MIE)).toBe('A')
    // Frida mañana con A hecha: B
    expect(tipo([sesion(MAR, 'A')], MIE, { [LUN]: JUE })).toBe('B')
  })
  it('con las tres base hechas, la extra alterna con la última A o B; C nunca es extra', () => {
    const base = [sesion(LUN, 'FRIDA'), sesion(MAR, 'B'), sesion(MIE, 'A')]
    expect(elegirSesion(base, undefined, dia(JUE))).toEqual({ tipo: 'B', extra: true })
    const sinFrida = [sesion(MAR, 'C'), sesion(MIE, 'A'), sesion(JUE, 'B')]
    expect(elegirSesion(sinFrida, SIN_FRIDA, dia(DOM))).toEqual({ tipo: 'A', extra: true })
    expect(elegirSesion([sesion(MAR, 'A'), sesion(MIE, 'B'), sesion(JUE, 'C')], SIN_FRIDA, dia(DOM)).tipo).toBe('A')
  })
  it('"Hoy prefiero A" manda solo ese día', () => {
    const s = [sesion(LUN, 'FRIDA')]
    expect(elegirSesion(s, undefined, dia(MAR), [], { fecha: MAR, tipo: 'B' })).toEqual({ tipo: 'B', extra: false })
    expect(elegirSesion(s, undefined, dia(MIE), [], { fecha: MAR, tipo: 'B' }).tipo).toBe('A')
    // elegir algo que ya se hizo es extra
    expect(elegirSesion([...s, sesion(MAR, 'A')], undefined, dia(MIE), [], { fecha: MIE, tipo: 'A' })).toEqual({ tipo: 'A', extra: true })
  })
  it('una sesión abierta con una serie ya cuenta para la elección', () => {
    const abierta = sesion(MAR, 'A', false)
    expect(elegirSesion([sesion(LUN, 'FRIDA'), abierta], undefined, dia(MIE)).tipo).toBe('A')
    expect(elegirSesion([sesion(LUN, 'FRIDA'), abierta], undefined, dia(MIE), [serie(abierta.id)]).tipo).toBe('B')
  })
})

describe('aviso del jueves y del domingo', () => {
  const s = [sesion(LUN, 'FRIDA'), sesion(MAR, 'A')]
  it('jueves en la noche con menos de 3 dice qué toca el domingo', () => {
    expect(avisoRescate(s, undefined, dia(JUE, '21:00:00'))).toBe('Vas en 2 de 3; el domingo antes de las 3 pm te toca B.')
    expect(avisoRescate([sesion(MAR, 'C')], SIN_FRIDA, dia(JUE, '21:00:00'))).toBe('Vas en 1 de 3; el domingo antes de las 3 pm te toca A.')
  })
  it('no avisa jueves en la tarde ni miércoles', () => {
    expect(avisoRescate(s, undefined, dia(JUE, '18:00:00'))).toBeNull()
    expect(avisoRescate(s, undefined, dia(MIE, '21:00:00'))).toBeNull()
  })
  it('domingo en la mañana avisa; en la tarde ya no', () => {
    expect(avisoRescate(s, undefined, dia(DOM, '09:00:00'))).toBe('Vas en 2 de 3; hoy antes de las 3 pm te toca B.')
    expect(avisoRescate(s, undefined, dia(DOM, '16:00:00'))).toBeNull()
  })
  it('con 3 no avisa', () => {
    expect(avisoRescate([...s, sesion(JUE, 'B')], undefined, dia(JUE, '21:00:00'))).toBeNull()
  })
})
