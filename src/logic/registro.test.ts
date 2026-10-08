import { describe, it, expect } from 'vitest'
import { cargaInicial, cierresPendientes, comoQuedo, seriesPlaneadas, diasSinRegistro, sugeridaPara, diasDeSemanaHastaHoy, armarRegistro, esDiaDeGym, textoUltima, sesionRegistrada } from './registro'
import { siguienteSesion, estadoSemana, ultimaPropia } from './semana'
import { DIAS_NOMBRE } from './fechas'
import type { Sesion, SetLog } from '../data/tipos'

function sesion(fecha: string, tipo: Sesion['tipo'], terminada = true, extra: Partial<Sesion> = {}): Sesion {
  const d = new Date(fecha + 'T20:00:00')
  return { id: fecha + tipo, fecha, tipo, version: 'completa', inicio: d.getTime(), fin: d.getTime() + 3600e3, terminada, ...extra }
}
const series = (sessionId: string, n: number, fecha = '2026-10-06'): SetLog[] => Array.from({ length: n }, (_, i) => ({ sessionId, exerciseId: 'jalon', ejercicioBaseId: 'jalon', numSerie: i + 1, pesoKg: 40, reps: 10, fecha, hora: new Date(fecha + 'T20:00:00').getTime() + i * 120000 }))

describe('carga inicial (2.8)', () => {
  it('agrega la A del 7 oct 2026 si no hay nada ese día, y entonces toca B', () => {
    const a = cargaInicial([])!
    expect(a).toMatchObject({ fecha: '2026-10-07', tipo: 'A', terminada: true, como: 'registrada', origen: 'registro' })
    expect(siguienteSesion([a])).toBe('B')
    // si se borra, vuelve a tocar A
    expect(siguienteSesion([])).toBe('A')
  })
  it('no la agrega si ya hay algo ese día', () => {
    expect(cargaInicial([sesion('2026-10-07', 'B')])).toBeNull()
  })
})

describe('cierre automático (2.3)', () => {
  it('una sesión de ayer con una serie se cierra como hecha aunque nunca se tocó Terminar', () => {
    const s = sesion('2026-10-06', 'A', false)
    const r = cierresPendientes([s], series(s.id, 1), '2026-10-07')
    expect(r.guardar).toHaveLength(1)
    expect(r.guardar[0]).toMatchObject({ terminada: true, como: 'parcial', origen: 'app' })
    expect(r.borrar).toEqual([])
    expect(siguienteSesion(r.guardar)).toBe('B')
  })
  it('con la mayoría de las series queda completa; en corta, corta', () => {
    const s = sesion('2026-10-06', 'A', false)
    expect(comoQuedo(s, series(s.id, 12))).toBe('completa')
    expect(comoQuedo(s, series(s.id, 9))).toBe('parcial')
    expect(seriesPlaneadas(s)).toBe(20)
    const c = sesion('2026-10-06', 'B', false, { version: 'corta' })
    expect(seriesPlaneadas(c)).toBe(9)
    expect(comoQuedo(c, series(c.id, 5))).toBe('corta')
    expect(comoQuedo(c, series(c.id, 2))).toBe('parcial')
  })
  it('sin series se descarta; la de hoy se queda abierta salvo al empezar otra', () => {
    const vacia = sesion('2026-10-06', 'A', false)
    const hoy = sesion('2026-10-07', 'B', false)
    const r = cierresPendientes([vacia, hoy], series(hoy.id, 2, '2026-10-07'), '2026-10-07')
    expect(r.borrar).toEqual([vacia.id])
    expect(r.guardar).toEqual([])
    const todas = cierresPendientes([vacia, hoy], series(hoy.id, 2, '2026-10-07'), '2026-10-07', true)
    expect(todas.guardar.map((s) => s.id)).toEqual([hoy.id])
  })
  it('una sesión abierta con una serie ya cuenta para la semana', () => {
    const s = sesion('2026-10-06', 'A', false)
    expect(estadoSemana([s], new Date('2026-10-07T19:00:00')).hechas).toBe(0)
    expect(estadoSemana([s], new Date('2026-10-07T19:00:00'), series(s.id, 1)).hechas).toBe(1)
  })
})

describe('días sin registro (2.4)', () => {
  const lunes = sesion('2026-10-05', 'FRIDA')
  it('un martes sin nada hace que el miércoles se pregunte por el martes, con la que tocaba marcada', () => {
    const r = diasSinRegistro([lunes], [], {}, new Date('2026-10-07T19:00:00'))
    expect(r).toEqual([{ fecha: '2026-10-06', sugerida: 'A' }])
    expect(diasSinRegistro([lunes, sesion('2026-10-06', 'A')], [], {}, new Date('2026-10-07T19:00:00'))).toEqual([])
  })
  it('una sola vez: contestado "No fui" ya no se pregunta', () => {
    expect(diasSinRegistro([lunes], [], { noFui: ['2026-10-06'] }, new Date('2026-10-07T19:00:00'))).toEqual([])
  })
  it('incluye el día de Frida y sugiere FRIDA; viernes y sábado no se preguntan; el domingo de rescate sí', () => {
    const r = diasSinRegistro([sesion('2026-10-01', 'B')], [], {}, new Date('2026-10-07T19:00:00'))
    expect(r).toEqual([{ fecha: '2026-10-04', sugerida: 'A' }, { fecha: '2026-10-05', sugerida: 'FRIDA' }, { fecha: '2026-10-06', sugerida: 'A' }])
    expect(sugeridaPara('2026-10-06', [sesion('2026-10-01', 'B')], [], { '2026-10-05': '2026-10-06' })).toBe('FRIDA')
  })
  it('el domingo solo cuando era de rescate (menos de 3 en la semana)', () => {
    expect(esDiaDeGym('2026-10-04', [sesion('2026-09-29', 'A')])).toBe(true)
    expect(esDiaDeGym('2026-10-04', [sesion('2026-09-28', 'FRIDA'), sesion('2026-09-29', 'A'), sesion('2026-10-01', 'B')])).toBe(false)
    expect(esDiaDeGym('2026-10-03', [])).toBe(false)
  })
  it('no pregunta más de una semana atrás ni por hoy, y sin sesiones no pregunta nada', () => {
    const r = diasSinRegistro([sesion('2026-09-01', 'A')], [], {}, new Date('2026-10-07T19:00:00'))
    expect(r.map((d) => d.fecha)).toEqual(['2026-09-30', '2026-10-01', '2026-10-04', '2026-10-05', '2026-10-06'])
    expect(diasSinRegistro([], [], {}, new Date('2026-10-07T19:00:00'))).toEqual([])
  })
  it('la sugerencia respeta el historial anterior a ese día', () => {
    const s = [sesion('2026-10-01', 'A'), sesion('2026-10-07', 'B')]
    expect(sugeridaPara('2026-10-06', s, [])).toBe('B')
  })
})

describe('pon al día tu semana (2.5)', () => {
  it('lista los días de la semana hasta hoy con lo registrado; el 7 oct aparece como A', () => {
    const r = diasDeSemanaHastaHoy([cargaInicial([])!, sesion('2026-10-05', 'FRIDA')], [], new Date('2026-10-07T19:00:00'))
    expect(r).toEqual([{ fecha: '2026-10-05', registrado: 'FRIDA' }, { fecha: '2026-10-06', registrado: null }, { fecha: '2026-10-07', registrado: 'A' }])
  })
})

describe('registrar una sesión hecha sin la app (2.6)', () => {
  it('nunca en el futuro', () => {
    expect(armarRegistro([], '2026-10-08', 'A', '2026-10-07')).toEqual({ error: 'Esa fecha todavía no llega.' })
  })
  it('máximo una A o B por día: si ya hay una, se ofrece cambiarla', () => {
    const a = sesionRegistrada('2026-10-07', 'A')
    const r = armarRegistro([a], '2026-10-07', 'B', '2026-10-07')
    expect('reemplaza' in r && r.reemplaza?.id).toBe(a.id)
    expect('sesion' in r && r.sesion).toMatchObject({ id: a.id, tipo: 'B' })
    const nueva = armarRegistro([], '2026-10-07', 'B', '2026-10-07')
    expect('reemplaza' in nueva && nueva.reemplaza).toBeNull()
    expect('sesion' in nueva && nueva.sesion.como).toBe('registrada')
  })
  it('Frida es una por día y CASA se puede repetir', () => {
    const f = armarRegistro([], '2026-10-05', 'FRIDA', '2026-10-07')
    expect('sesion' in f && f.sesion.id).toBe('frida-2026-10-05')
    const c = armarRegistro([sesionRegistrada('2026-10-03', 'CASA', 'registro-2026-10-03-CASA-1')], '2026-10-03', 'CASA', '2026-10-07')
    expect('sesion' in c && c.sesion.id).toBe('registro-2026-10-03-CASA-2')
  })
  it('la línea de Hoy', () => {
    expect(textoUltima(ultimaPropia([cargaInicial([])!]), DIAS_NOMBRE)).toBe('la última fue A el miércoles 7')
    expect(textoUltima(null, DIAS_NOMBRE)).toBe('sin sesiones todavía')
  })
})
