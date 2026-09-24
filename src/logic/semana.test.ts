import { describe, it, expect } from 'vitest'
import { siguienteSesion, estadoSemana, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra, seriesPara, entraEnVersion } from './semana'
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
  it('series extra solo en A1, A2, B1, B2 y nunca en corta', () => {
    expect(seriesPara('A1', 3, 'completa', true)).toBe(4)
    expect(seriesPara('A3', 3, 'completa', true)).toBe(3)
    expect(seriesPara('A1', 3, 'corta', true)).toBe(2)
    expect(seriesPara('A1', 3, 'completa', false, true)).toBe(2)
    expect(seriesPara('B2', 3, 'bonus', true)).toBe(4)
  })
  it('la corta solo lleva ejercicios 1 a 4', () => {
    expect(entraEnVersion(4, 'corta')).toBe(true)
    expect(entraEnVersion(5, 'corta')).toBe(false)
    expect(entraEnVersion(7, 'completa')).toBe(true)
  })
})
