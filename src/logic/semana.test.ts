import { describe, it, expect } from 'vitest'
import { siguienteSesion, estadoSemana, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra, seriesPara, casaDeSemana, casaDisponible, estadoFrida, tocaPierna, diaFridaPlaneado, diasParaMoverFrida, secuenciaDePar } from './semana'
import { bloquesDe, alternativasDisponibles, ejerciciosDe, buscarEjercicio } from '../data/ejercicios'
import { duracionEstimada } from './duracion'
import { SETTINGS_DEFAULT, type Sesion } from '../data/tipos'
import { inicioSemana, claveFecha } from './fechas'

function sesion(fecha: string, tipo: Sesion['tipo'], terminada = true): Sesion {
  const d = new Date(fecha + 'T20:00:00')
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: d.getTime(), fin: d.getTime() + 3600e3, terminada }
}

describe('alternancia', () => {
  it('empieza en A sin historial', () => {
    expect(siguienteSesion([])).toBe('A')
  })
  it('después de A toca B y después de B toca A', () => {
    expect(siguienteSesion([sesion('2026-09-21', 'A')])).toBe('B')
    expect(siguienteSesion([sesion('2026-09-21', 'A'), sesion('2026-09-23', 'B')])).toBe('A')
  })
  it('Frida no afecta la alternancia', () => {
    expect(siguienteSesion([sesion('2026-09-21', 'A'), sesion('2026-09-22', 'FRIDA')])).toBe('B')
  })
  it('las sesiones no terminadas no cuentan', () => {
    expect(siguienteSesion([sesion('2026-09-21', 'A'), sesion('2026-09-23', 'B', false)])).toBe('B')
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
})

describe('domingo de rescate', () => {
  const s = [sesion('2026-09-21', 'A'), sesion('2026-09-23', 'B')]
  it('avisa jueves en la noche con 2', () => {
    expect(avisoRescate(s, new Date('2026-09-24T21:00:00'), SETTINGS_DEFAULT)).toBe('Vas en 2. Domingo antes de las 3 pm.')
  })
  it('no avisa jueves en la tarde ni miércoles', () => {
    expect(avisoRescate(s, new Date('2026-09-24T18:00:00'), SETTINGS_DEFAULT)).toBeNull()
    expect(avisoRescate(s, new Date('2026-09-23T21:00:00'), SETTINGS_DEFAULT)).toBeNull()
  })
  it('avisa domingo en la mañana', () => {
    expect(avisoRescate(s, new Date('2026-09-27T09:00:00'), SETTINGS_DEFAULT)).toMatch(/Vas en 2/)
    expect(avisoRescate(s, new Date('2026-09-27T16:00:00'), SETTINGS_DEFAULT)).toBeNull()
  })
  it('no avisa con 0 ni con 3', () => {
    expect(avisoRescate([], new Date('2026-09-24T21:00:00'), SETTINGS_DEFAULT)).toBeNull()
    expect(avisoRescate([...s, sesion('2026-09-24', 'FRIDA')], new Date('2026-09-24T21:00:00'), SETTINGS_DEFAULT)).toBeNull()
  })
})

describe('regla de 4 semanas', () => {
  function cuatroSemanas(): Sesion[] {
    const out: Sesion[] = []
    for (let w = 0; w < 4; w++) {
      const lunes = new Date('2026-08-24T00:00:00')
      lunes.setDate(lunes.getDate() + w * 7)
      for (const off of [0, 2, 4]) {
        const d = new Date(lunes)
        d.setDate(d.getDate() + off)
        out.push(sesion(claveFecha(d), off === 0 ? 'FRIDA' : off === 2 ? 'A' : 'B'))
      }
    }
    return out
  }
  it('cuenta 4 cumplidas con 4 semanas cerradas de 3', () => {
    expect(semanasCumplidas(cuatroSemanas(), new Date('2026-09-23T20:00:00'))).toBe(4)
  })
  it('una semana con 2 no cuenta', () => {
    const s = cuatroSemanas().filter((x) => x.id !== '2026-08-26A')
    expect(semanasCumplidas(s, new Date('2026-09-23T20:00:00'))).toBe(3)
  })
  it('la semana actual no cuenta aunque tenga 3', () => {
    expect(semanasCumplidas(cuatroSemanas(), new Date('2026-09-16T20:00:00'))).toBe(3)
  })
  it('propone con 4 cumplidas y respeta posponer', () => {
    expect(tocaProponerSeriesExtra(3, SETTINGS_DEFAULT)).toBe(false)
    expect(tocaProponerSeriesExtra(4, SETTINGS_DEFAULT)).toBe(true)
    expect(tocaProponerSeriesExtra(4, { ...SETTINGS_DEFAULT, reglaPospuestaEn: 4 })).toBe(false)
    expect(tocaProponerSeriesExtra(5, { ...SETTINGS_DEFAULT, reglaPospuestaEn: 4 })).toBe(true)
    expect(tocaProponerSeriesExtra(6, { ...SETTINGS_DEFAULT, seriesExtra: true })).toBe(false)
  })
  it('series extra solo en press-inclinado, jalon, press-plano y remo-polea, nunca en corta', () => {
    expect(seriesPara('press-inclinado', 3, 'completa', true)).toBe(4)
    expect(seriesPara('goblet', 2, 'completa', true)).toBe(2)
    expect(seriesPara('press-inclinado', 3, 'corta', true)).toBe(2)
    expect(seriesPara('press-inclinado', 3, 'completa', false, true)).toBe(2)
    expect(seriesPara('remo-polea', 3, 'bonus', true)).toBe(4)
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
  it('la corta lleva los bloques 1, 2 y el par de laterales, a 2 series', () => {
    const a = bloquesDe('A', 'corta')
    expect(a.map((b) => b.numero)).toEqual([1, 2, 5])
    expect(a[2].ejercicios.map((e) => e.id)).toEqual(['laterales', 'remo-pecho-apoyado'])
    const b = bloquesDe('B', 'corta')
    expect(b.map((x) => x.numero)).toEqual([1, 2, 4])
    expect(seriesPara('laterales', 3, 'corta', false)).toBe(2)
    // en corta nunca hay pierna, aunque se pida
    expect(bloquesDe('A', 'corta', true).some((x) => x.ejercicios.some((e) => e.pierna))).toBe(false)
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
  it('el día planeado pasó sin respuesta: se pregunta, y "No hubo" activa la pierna', () => {
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
  it('los bloques de pierna solo entran cuando toca', () => {
    expect(bloquesDe('A').some((b) => b.ejercicios.some((e) => e.id === 'goblet'))).toBe(false)
    expect(bloquesDe('A', 'completa', true).map((b) => b.numero)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(bloquesDe('B', 'completa', true)[2].ejercicios[0].id).toBe('prensa')
  })
})

describe('bloques en par', () => {
  it('alterna series y las de más se hacen solas', () => {
    expect(secuenciaDePar([3, 3])).toEqual([0, 1, 0, 1, 0, 1])
    expect(secuenciaDePar([2, 3])).toEqual([0, 1, 0, 1, 1])
    expect(secuenciaDePar([2])).toEqual([0, 0])
  })
  it('A y B tienen los pares del archivo', () => {
    const pares = (l: 'A' | 'B') => bloquesDe(l).filter((b) => b.ejercicios.length === 2).map((b) => b.ejercicios.map((e) => e.id))
    expect(pares('A')).toEqual([['laterales', 'remo-pecho-apoyado'], ['curl-z', 'triceps-polea']])
    expect(pares('B')).toEqual([['jalon-cerrado', 'laterales'], ['curl-martillo', 'triceps-cabeza']])
  })
  it('cada sesión tiene un jalón y un remo distintos y laterales comparte id', () => {
    const a = ejerciciosDe('A').map((e) => e.id), b = ejerciciosDe('B').map((e) => e.id)
    expect(a).toContain('laterales'); expect(b).toContain('laterales')
    expect(a).not.toContain('remo-mancuerna'); expect(b).not.toContain('remo-mancuerna')
    expect(b).toContain('jalon-cerrado'); expect(b).toContain('aperturas-maquina'); expect(b).toContain('triceps-cabeza')
  })
  it('una alternativa se oculta si su id ya está en la sesión', () => {
    const bloques = bloquesDe('B')
    const aperturas = buscarEjercicio('aperturas-maquina')!
    expect(alternativasDisponibles(aperturas, bloques).map((a) => a.id)).toContain('press-pecho-maquina')
    const cambios = [{ ejercicioId: 'press-plano', alternativaId: 'press-pecho-maquina' }]
    expect(alternativasDisponibles(aperturas, bloques, cambios).map((a) => a.id)).not.toContain('press-pecho-maquina')
    // el propio bloque no se bloquea a sí mismo
    expect(alternativasDisponibles(buscarEjercicio('press-plano')!, bloques, cambios).map((a) => a.id)).toContain('press-pecho-maquina')
  })
})

describe('duración estimada', () => {
  it('A ≈ 57, B ≈ 55, con pierna ≈ 60, corta ≈ 30', () => {
    expect(duracionEstimada(bloquesDe('A'), 'completa')).toBe(57)
    expect(duracionEstimada(bloquesDe('B'), 'completa')).toBe(55)
    expect(duracionEstimada(bloquesDe('A', 'completa', true), 'completa', { pierna: true })).toBeGreaterThanOrEqual(59)
    expect(duracionEstimada(bloquesDe('A', 'completa', true), 'completa', { pierna: true })).toBeLessThanOrEqual(61)
    expect(duracionEstimada(bloquesDe('A', 'corta'), 'corta')).toBeGreaterThanOrEqual(25)
    expect(duracionEstimada(bloquesDe('A', 'corta'), 'corta')).toBeLessThanOrEqual(33)
    expect(duracionEstimada(bloquesDe('CASA'), 'completa', { casa: true })).toBe(12)
  })
})
