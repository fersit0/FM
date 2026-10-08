import { describe, it, expect } from 'vitest'
import { siguienteSesion, estadoSemana, avisoRescate, seriesPara, casaDeSemana, casaDisponible, estadoFrida, tocaPierna, diaFridaPlaneado, diasParaMoverFrida, cuenta, ultimaPropia } from './semana'
import { listaDe, rutaDe, alternativasDisponibles, ejerciciosDe, buscarEjercicio, EJERCICIOS, NOMBRES_RETIRADOS } from '../data/ejercicios'
import type { Sesion, SetLog } from '../data/tipos'
import { inicioSemana, claveFecha } from './fechas'

export function sesion(fecha: string, tipo: Sesion['tipo'], terminada = true): Sesion {
  const d = new Date(fecha + 'T20:00:00')
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: d.getTime(), fin: d.getTime() + 3600e3, terminada }
}
const serie = (sessionId: string, n = 1): SetLog => ({ sessionId, exerciseId: 'jalon', ejercicioBaseId: 'jalon', numSerie: n, pesoKg: 40, reps: 10, fecha: '2026-09-21', hora: n })

describe('la que sigue', () => {
  it('empieza en A sin historial', () => {
    expect(siguienteSesion([])).toBe('A')
  })
  it('es la contraria de la A o B más reciente por fecha, aunque se registre después', () => {
    expect(siguienteSesion([sesion('2026-09-21', 'A')])).toBe('B')
    expect(siguienteSesion([sesion('2026-09-21', 'A'), sesion('2026-09-23', 'B')])).toBe('A')
    // una B registrada después pero con fecha anterior no manda
    expect(siguienteSesion([sesion('2026-09-23', 'A'), { ...sesion('2026-09-21', 'B'), inicio: 9e15 }])).toBe('B')
  })
  it('Frida y CASA no la cambian', () => {
    expect(siguienteSesion([sesion('2026-09-21', 'A'), sesion('2026-09-22', 'FRIDA'), sesion('2026-09-23', 'CASA')])).toBe('B')
  })
  it('una sesión abierta cuenta en cuanto tiene una serie; sin series no', () => {
    const abierta = sesion('2026-09-23', 'B', false)
    expect(cuenta(abierta)).toBe(false)
    expect(cuenta(abierta, [serie(abierta.id)])).toBe(true)
    expect(siguienteSesion([sesion('2026-09-21', 'A'), abierta])).toBe('B')
    expect(siguienteSesion([sesion('2026-09-21', 'A'), abierta], [serie(abierta.id)])).toBe('A')
  })
  it('si se borra la última, se recalcula sola', () => {
    const s = [sesion('2026-09-21', 'A'), sesion('2026-09-23', 'B')]
    expect(siguienteSesion(s)).toBe('A')
    expect(siguienteSesion(s.filter((x) => x.tipo !== 'B'))).toBe('B')
    expect(ultimaPropia(s)?.fecha).toBe('2026-09-23')
  })
})

describe('semana', () => {
  it('la semana empieza en lunes', () => {
    expect(claveFecha(inicioSemana(new Date('2026-09-27T10:00:00')))).toBe('2026-09-21') // domingo
    expect(claveFecha(inicioSemana(new Date('2026-09-21T10:00:00')))).toBe('2026-09-21') // lunes
  })
  it('cuenta sesiones de la semana incluyendo Frida y marca bonus con 3', () => {
    const s = [sesion('2026-09-21', 'FRIDA'), sesion('2026-09-22', 'A'), sesion('2026-09-24', 'B'), sesion('2026-09-14', 'A')]
    const e = estadoSemana(s, new Date('2026-09-25T20:00:00'))
    expect(e.hechas).toBe(3)
    expect(e.bonus).toBe(true)
    expect(e.fridaHecha).toBe(true)
    expect(e.dias[0].tipos).toEqual(['FRIDA'])
    expect(e.dias[3].tipos).toEqual(['B'])
  })
  it('CASA no cuenta para la meta, no mueve la alternancia y se topa en 2', () => {
    const s = [sesion('2026-09-22', 'A'), sesion('2026-09-23', 'CASA'), sesion('2026-09-24', 'CASA')]
    const d = new Date('2026-09-25T20:00:00')
    expect(estadoSemana(s, d).hechas).toBe(1)
    expect(siguienteSesion(s)).toBe('B')
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

describe('domingo de rescate', () => {
  const s = [sesion('2026-09-21', 'A'), sesion('2026-09-23', 'B')]
  it('avisa jueves en la noche con 2', () => {
    expect(avisoRescate(s, new Date('2026-09-24T21:00:00'))).toBe('Vas en 2. Domingo antes de las 3 pm.')
  })
  it('no avisa jueves en la tarde ni miércoles', () => {
    expect(avisoRescate(s, new Date('2026-09-24T18:00:00'))).toBeNull()
    expect(avisoRescate(s, new Date('2026-09-23T21:00:00'))).toBeNull()
  })
  it('avisa domingo en la mañana', () => {
    expect(avisoRescate(s, new Date('2026-09-27T09:00:00'))).toMatch(/Vas en 2/)
    expect(avisoRescate(s, new Date('2026-09-27T16:00:00'))).toBeNull()
  })
  it('no avisa con 0 ni con 3', () => {
    expect(avisoRescate([], new Date('2026-09-24T21:00:00'))).toBeNull()
    expect(avisoRescate([...s, sesion('2026-09-24', 'FRIDA')], new Date('2026-09-24T21:00:00'))).toBeNull()
  })
})

describe('pierna con Frida', () => {
  const lunes = '2026-09-21'
  const mar = new Date('2026-09-22T19:00:00')
  const mie = new Date('2026-09-23T19:00:00')
  it('lunes por defecto; el día planeado Hoy muestra FRIDA', () => {
    expect(diaFridaPlaneado(undefined, mar)).toBe(lunes)
    const e = estadoFrida([], undefined, new Date('2026-09-21T10:00:00'))
    expect(e.hoyEsFrida).toBe(true)
    expect(e.pendiente).toBeNull()
  })
  it('con Frida registrada el lunes, A y B no traen pierna', () => {
    const s = [sesion(lunes, 'FRIDA')]
    expect(estadoFrida(s, undefined, mar).hecha).toBe(lunes)
    expect(tocaPierna(s, undefined, mar, 'completa')).toBe(false)
  })
  it('movida al miércoles: el martes no hay pierna y el miércoles Hoy muestra FRIDA', () => {
    const plan = { [lunes]: '2026-09-23' }
    expect(tocaPierna([], plan, mar, 'completa')).toBe(false)
    expect(estadoFrida([], plan, mar).hoyEsFrida).toBe(false)
    expect(estadoFrida([], plan, mie).hoyEsFrida).toBe(true)
  })
  it('"Esta semana no hay": la siguiente completa trae pierna y la que sigue ya no; no se arrastra a la otra semana', () => {
    const plan = { [lunes]: null }
    expect(tocaPierna([], plan, mar, 'completa')).toBe(true)
    expect(tocaPierna([], plan, mar, 'bonus')).toBe(true)
    const conPierna = [{ ...sesion('2026-09-22', 'A'), pierna: true }]
    expect(tocaPierna(conPierna, plan, mie, 'completa')).toBe(false)
    expect(tocaPierna([], plan, new Date('2026-09-29T19:00:00'), 'completa')).toBe(false)
  })
  it('el día planeado pasó sin respuesta: queda pendiente y no hay pierna; "No fui" la activa', () => {
    const e = estadoFrida([], undefined, mar)
    expect(e.pendiente).toBe(lunes)
    expect(tocaPierna([], undefined, mar, 'completa')).toBe(false)
    expect(tocaPierna([], { [lunes]: null }, mar, 'completa')).toBe(true)
  })
  it('en corta nunca hay pierna', () => {
    expect(tocaPierna([], { [lunes]: null }, mar, 'corta')).toBe(false)
  })
  it('si ya hubo pierna y luego se registra Frida, nada cambia', () => {
    const s = [{ ...sesion('2026-09-22', 'A'), pierna: true }, sesion('2026-09-24', 'FRIDA')]
    expect(tocaPierna(s, { [lunes]: null }, new Date('2026-09-25T19:00:00'), 'completa')).toBe(false)
    expect(estadoSemana(s, mie).hechas).toBe(2)
  })
  it('se puede mover de hoy en adelante dentro de la semana', () => {
    expect(diasParaMoverFrida(mie)).toEqual(['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'])
  })
  it('goblet solo entra cuando toca, al empezar la terraza, en A y en B', () => {
    expect(listaDe('A').some((e) => e.id === 'goblet')).toBe(false)
    const a = listaDe('A', 'completa', true).map((e) => e.id)
    expect(a.indexOf('goblet')).toBe(a.indexOf('laterales') - 1)
    expect(a.indexOf('goblet')).toBe(a.indexOf('triceps-cabeza') + 1)
    const b = listaDe('B', 'completa', true).map((e) => e.id)
    expect(b.indexOf('goblet')).toBe(b.indexOf('laterales') - 1)
    expect(listaDe('A', 'corta', true).some((e) => e.pierna)).toBe(false)
  })
})

describe('sesiones por zona (RUTINA-FINAL.md, 4 y 5)', () => {
  it('A y B tienen 8 ejercicios en el orden y zona del archivo, sin pares', () => {
    expect(listaDe('A').map((e) => e.id)).toEqual(['jalon', 'remo-polea', 'press-inclinado', 'press-militar', 'triceps-cabeza', 'laterales', 'curl-alternado', 'crunch'])
    expect(listaDe('A').map((e) => e.zona)).toEqual(['poleas', 'poleas', 'bancos', 'bancos', 'bancos', 'terraza', 'terraza', 'terraza'])
    expect(listaDe('B').map((e) => e.id)).toEqual(['press-plano', 'aperturas-mancuernas', 'remo-pecho-apoyado', 'jalon-cerrado', 'triceps-polea', 'laterales', 'curl-martillo', 'elevacion-piernas'])
    expect(listaDe('B').map((e) => e.zona)).toEqual(['bancos', 'bancos', 'bancos', 'poleas', 'poleas', 'terraza', 'terraza', 'terraza'])
    expect(buscarEjercicio('jalon-cerrado')!.series).toBe(3)
  })
  it('cada zona se visita una sola vez: Poleas → Bancos → Terraza en A, Bancos → Poleas → Terraza en B', () => {
    expect(rutaDe(listaDe('A'))).toEqual(['poleas', 'bancos', 'terraza'])
    expect(rutaDe(listaDe('B'))).toEqual(['bancos', 'poleas', 'terraza'])
    expect(rutaDe(listaDe('A', 'completa', true))).toEqual(['poleas', 'bancos', 'terraza'])
  })
  it('la corta: jalón, press principal y laterales a 3 series, con los laterales en bancos', () => {
    const a = listaDe('A', 'corta')
    expect(a.map((e) => e.id)).toEqual(['jalon', 'press-inclinado', 'laterales'])
    expect(a.map((e) => e.zona)).toEqual(['poleas', 'bancos', 'bancos'])
    expect(a.every((e) => e.series === 3)).toBe(true)
    const b = listaDe('B', 'corta')
    expect(b.map((e) => e.id)).toEqual(['press-plano', 'laterales', 'jalon-cerrado'])
    expect(rutaDe(b)).toEqual(['bancos', 'poleas'])
  })
  it('cada sesión tiene un jalón y un remo, nunca dos remos; laterales se comparte', () => {
    const a = ejerciciosDe('A').map((e) => e.id), b = ejerciciosDe('B').map((e) => e.id)
    expect(a.filter((id) => id.startsWith('jalon'))).toHaveLength(1)
    expect(b.filter((id) => id.startsWith('jalon'))).toHaveLength(1)
    expect(a.filter((id) => id.startsWith('remo'))).toHaveLength(1)
    expect(b.filter((id) => id.startsWith('remo'))).toHaveLength(1)
    expect(a).toContain('laterales'); expect(b).toContain('laterales')
  })
  it('solo equipo que Fer ubica: ninguna alternativa "en máquina"; sin prensa, pec deck, barra Z ni plancha', () => {
    for (const e of EJERCICIOS) {
      expect(Object.keys(NOMBRES_RETIRADOS), e.id).not.toContain(e.id)
      for (const a of e.alternativas) {
        expect(a.nombre, a.id).not.toMatch(/máquina/i)
        expect(Object.keys(NOMBRES_RETIRADOS), a.id).not.toContain(a.id)
      }
    }
    expect(buscarEjercicio('remo-polea')!.nombre).toBe('Remo sentado en máquina')
  })
  it('una alternativa se oculta si su id ya está en la sesión; una elegida bloquea a las demás', () => {
    const lista = listaDe('B')
    // en B, remo-pecho-apoyado es de la rutina: no aparece como alternativa de nada (no la hay); en A sí es alternativa del remo
    expect(alternativasDisponibles(buscarEjercicio('remo-polea')!, listaDe('A')).map((a) => a.id)).toContain('remo-pecho-apoyado')
    const jalon = buscarEjercicio('jalon-cerrado')!
    expect(alternativasDisponibles(jalon, lista).map((a) => a.id)).toContain('remo-mancuerna')
    const cambios = [{ ejercicioId: 'remo-pecho-apoyado', alternativaId: 'remo-mancuerna' }]
    expect(alternativasDisponibles(jalon, lista, cambios).map((a) => a.id)).not.toContain('remo-mancuerna')
    // el propio ejercicio no se bloquea a sí mismo
    expect(alternativasDisponibles(buscarEjercicio('remo-pecho-apoyado')!, lista, cambios).map((a) => a.id)).toContain('remo-mancuerna')
    // crunch está en A: en A la alternativa del crunch es elevación de piernas, y en B la de elevación es crunch
    expect(alternativasDisponibles(buscarEjercicio('crunch', 'A')!, listaDe('A')).map((a) => a.id)).toEqual(['elevacion-piernas'])
    expect(alternativasDisponibles(buscarEjercicio('elevacion-piernas')!, lista).map((a) => a.id)).toEqual(['crunch'])
  })
})
