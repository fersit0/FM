import { describe, it, expect } from 'vitest'
import { estadoSemana, avisoSemana, seriesPara, fridaTipoDe, fridaPiernaEnSemana, casaDeSemana, casaDisponible, estadoFrida, diaFridaPlaneado, diasParaMoverFrida, cuenta, ultimaPropia, semanaSinFrida, sesionesBase, faltantes, elegirSesion, type PlanFrida } from './semana'
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
    expect(elegirSesion(s, undefined, dia(MIE))).toMatchObject({ tipo: 'B', extra: false })
    expect(elegirSesion([...s, sesion(MIE, 'B')], undefined, dia(JUE))).toMatchObject({ tipo: 'A', extra: true })
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
    expect(elegirSesion([sesion(LUN, 'FRIDA'), sesion(MAR, 'A')], undefined, dia(DOM))).toMatchObject({ tipo: 'B', extra: false })
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
    expect(elegirSesion(base, undefined, dia(JUE))).toMatchObject({ tipo: 'B', extra: true })
    const sinFrida = [sesion(MAR, 'C'), sesion(MIE, 'A'), sesion(JUE, 'B')]
    expect(elegirSesion(sinFrida, SIN_FRIDA, dia(DOM))).toMatchObject({ tipo: 'A', extra: true })
    expect(elegirSesion([sesion(MAR, 'A'), sesion(MIE, 'B'), sesion(JUE, 'C')], SIN_FRIDA, dia(DOM)).tipo).toBe('A')
  })
  it('"Hoy prefiero A" manda solo ese día', () => {
    const s = [sesion(LUN, 'FRIDA')]
    expect(elegirSesion(s, undefined, dia(MAR), [], { fecha: MAR, tipo: 'B' })).toMatchObject({ tipo: 'B', extra: false })
    expect(elegirSesion(s, undefined, dia(MIE), [], { fecha: MAR, tipo: 'B' }).tipo).toBe('A')
    // elegir algo que ya se hizo es extra
    expect(elegirSesion([...s, sesion(MAR, 'A')], undefined, dia(MIE), [], { fecha: MIE, tipo: 'A' })).toMatchObject({ tipo: 'A', extra: true })
  })
  it('una sesión abierta con una serie ya cuenta para la elección', () => {
    const abierta = sesion(MAR, 'A', false)
    expect(elegirSesion([sesion(LUN, 'FRIDA'), abierta], undefined, dia(MIE)).tipo).toBe('A')
    expect(elegirSesion([sesion(LUN, 'FRIDA'), abierta], undefined, dia(MIE), [serie(abierta.id)]).tipo).toBe('B')
  })
})

describe('v7: Frida con tipo, A sin pierna y elección (RUTINA-FINAL.md v7, 2)', () => {
  const VIE = '2026-10-09'
  const fp = (f: string): Sesion => ({ ...sesion(f, 'FRIDA'), fridaTipo: 'pierna' })
  const ft = (f: string): Sesion => ({ ...sesion(f, 'FRIDA'), fridaTipo: 'torso' })
  const a = (f: string, sinPierna = false): Sesion => ({ ...sesion(f, 'A'), sinPierna })
  /**
   * Recorre una semana de la tabla: cada sesión de club tiene que salir así (tipo, sin pierna y extra) con lo hecho antes
   * de ese día; las FRIDA y las de club se van agregando como hechas.
   */
  function semana(dias: [string, Sesion, { sinPierna?: boolean; extra?: boolean; hora?: string }?][], plan?: PlanFrida) {
    const hechas: Sesion[] = []
    for (const [f, s, o = {}] of dias) {
      if (s.tipo !== 'FRIDA') expect(elegirSesion(hechas, plan, dia(f, o.hora ?? '07:00:00')), `${f} ${s.tipo}`).toEqual({ tipo: s.tipo, sinPierna: !!o.sinPierna, extra: !!o.extra })
      hechas.push(s)
    }
  }
  it('Frida pierna: lunes Frida pierna, martes A sin pierna, jueves B', () => semana([[LUN, fp(LUN)], [MAR, a(MAR, true), { sinPierna: true }], [JUE, sesion(JUE, 'B')]]))
  it('Frida torso: lunes Frida torso, martes A, jueves B', () => semana([[LUN, ft(LUN)], [MAR, a(MAR)], [JUE, sesion(JUE, 'B')]]))
  it('sin Frida: martes C, jueves A, viernes B', () => semana([[MAR, sesion(MAR, 'C')], [JUE, a(JUE)], [VIE, sesion(VIE, 'B')]], SIN_FRIDA))
  it('Frida pierna con extra: lunes Frida pierna, martes A sin pierna, jueves B, viernes C', () =>
    semana([[LUN, fp(LUN)], [MAR, a(MAR, true), { sinPierna: true }], [JUE, sesion(JUE, 'B')], [VIE, sesion(VIE, 'C'), { extra: true }]]))
  it('Frida pierna, faltó el martes: jueves A sin pierna, viernes B', () => semana([[LUN, fp(LUN)], [JUE, a(JUE, true), { sinPierna: true }], [VIE, sesion(VIE, 'B')]]))
  it('Frida torso, faltó el jueves: martes A, viernes B', () => semana([[LUN, ft(LUN)], [MAR, a(MAR)], [VIE, sesion(VIE, 'B')]]))
  it('martes en la noche: lunes Frida torso, martes A en la noche, jueves B', () =>
    semana([[LUN, ft(LUN)], [MAR, { ...a(MAR), momento: 'noche' }, { hora: '19:30:00' }], [JUE, sesion(JUE, 'B')]]))
  it('Frida el miércoles, torso: martes A, miércoles Frida torso, jueves B', () => semana([[MAR, a(MAR)], [MIE, ft(MIE)], [JUE, sesion(JUE, 'B')]], { [LUN]: MIE }))
  it('sin Frida, sin viernes: martes C, jueves A, domingo B', () => semana([[MAR, sesion(MAR, 'C')], [JUE, a(JUE)], [DOM, sesion(DOM, 'B')]], SIN_FRIDA))

  it('las FRIDA viejas sin tipo cuentan como torso', () => {
    expect(fridaTipoDe(sesion(LUN, 'FRIDA'))).toBe('torso')
    expect(elegirSesion([sesion(LUN, 'FRIDA')], undefined, dia(MAR))).toEqual({ tipo: 'A', sinPierna: false, extra: false })
  })
  it('FRIDA pierna no bloquea espalda al día siguiente; FRIDA torso o C sí, mientras falte A', () => {
    // Frida movida al martes; el miércoles con A hecha el lunes, B en los dos casos
    const plan = { [LUN]: MAR }
    expect(elegirSesion([a(LUN), fp(MAR)], plan, dia(MIE)).tipo).toBe('B')
    expect(elegirSesion([a(LUN), ft(MAR)], plan, dia(MIE)).tipo).toBe('B')
    // falta A: después de Frida torso, A
    expect(elegirSesion([ft(MAR)], plan, dia(MIE)).tipo).toBe('A')
    // Frida planeada para mañana y sin tipo cuenta como torso: A
    expect(elegirSesion([], { [LUN]: JUE }, dia(MIE)).tipo).toBe('A')
  })
  it('la A sale sin pierna solo si la FRIDA pierna se registró antes; registrarla después no cambia la A ya hecha', () => {
    expect(fridaPiernaEnSemana([fp(LUN)], dia(MAR), [], MAR)).toBe(true)
    expect(fridaPiernaEnSemana([fp(MIE)], dia(MAR), [], MAR)).toBe(false)
    // A el lunes en la mañana y Frida pierna en la noche: ya no falta A, el martes toca B
    expect(elegirSesion([a(LUN), fp(LUN)], undefined, dia(MAR))).toEqual({ tipo: 'B', sinPierna: false, extra: false })
  })
  it('la extra es C en semanas con Frida pierna, nunca dos C; sin Frida pierna, A o B contraria a la última', () => {
    const base = [fp(LUN), a(MAR, true), sesion(JUE, 'B')]
    expect(elegirSesion(base, undefined, dia(VIE))).toEqual({ tipo: 'C', sinPierna: false, extra: true })
    // ya hubo una C en la semana: la extra vuelve a A o B, contraria a la última (B → A, sin pierna)
    expect(elegirSesion([...base, sesion(VIE, 'C')], undefined, dia(DOM))).toEqual({ tipo: 'A', sinPierna: true, extra: true })
    expect(elegirSesion([ft(LUN), a(MAR), sesion(JUE, 'B')], undefined, dia(VIE))).toEqual({ tipo: 'A', sinPierna: false, extra: true })
  })
  it('"Hoy prefiero A" en semana con Frida pierna da la A sin pierna', () => {
    expect(elegirSesion([fp(LUN)], undefined, dia(MAR), [], { fecha: MAR, tipo: 'A' })).toEqual({ tipo: 'A', sinPierna: true, extra: false })
  })
})

describe('avisos de la semana (RUTINA-FINAL.md v7, 2)', () => {
  const VIE = '2026-10-09'
  const s = [sesion(LUN, 'FRIDA'), sesion(MAR, 'A')]
  it('jueves ya hecha su sesión o desde las 21:00, con 2 de 3: mañana viernes toca B, prende tus alarmas de Pesas extra', () => {
    expect(avisoSemana(s, undefined, dia(JUE, '21:00:00'))).toBe('Vas en 2 de 3. Mañana viernes toca B: prende tus alarmas de Pesas extra.')
    expect(avisoSemana([sesion(MAR, 'C')], SIN_FRIDA, dia(JUE, '21:30:00'))).toBe('Vas en 1 de 3. Mañana viernes toca A: prende tus alarmas de Pesas extra.')
    // Frida pierna: la del viernes es la A sin pierna
    expect(avisoSemana([{ ...sesion(LUN, 'FRIDA'), fridaTipo: 'pierna' }, sesion(MAR, 'B')], undefined, dia(JUE, '21:00:00'))).toBe('Vas en 2 de 3. Mañana viernes toca A sin pierna: prende tus alarmas de Pesas extra.')
  })
  it('jueves con 3 de 3: semana completa, mañana sauna; en cuanto se hace la sesión del jueves, aunque sea de mañana', () => {
    expect(avisoSemana([...s, sesion(JUE, 'B')], undefined, dia(JUE, '08:30:00'))).toBe('Semana completa. Mañana viernes, sauna.')
  })
  it('jueves antes de su sesión y antes de las 21:00, o miércoles: nada', () => {
    expect(avisoSemana(s, undefined, dia(JUE, '18:00:00'))).toBeNull()
    expect(avisoSemana(s, undefined, dia(MIE, '21:30:00'))).toBeNull()
  })
  it('viernes en la noche (o con "Hoy no") y domingo hasta las 7 pm, con menos de 3: el rescate del domingo', () => {
    expect(avisoSemana(s, undefined, dia(VIE, '21:10:00'))).toBe('Vas en 2 de 3; el domingo antes de las 7 pm te toca B.')
    expect(avisoSemana(s, undefined, dia(VIE, '09:00:00'), [], [VIE])).toBe('Vas en 2 de 3; el domingo antes de las 7 pm te toca B.')
    expect(avisoSemana(s, undefined, dia(VIE, '09:00:00'))).toBeNull()
    expect(avisoSemana(s, undefined, dia(DOM, '17:00:00'))).toBe('Vas en 2 de 3; hoy antes de las 7 pm te toca B.')
    expect(avisoSemana(s, undefined, dia(DOM, '19:10:00'))).toBeNull()
    expect(avisoSemana([...s, sesion(JUE, 'B')], undefined, dia(DOM, '09:00:00'))).toBeNull()
  })
})
