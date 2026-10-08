// Datos ficticios de 4 semanas, activables con ?seed=1 (y ?seed=0 para borrarlos)
import { borrarTodo, guardarSesion, guardarSet } from '../data/db'
import { ejerciciosDe, EJERCICIOS } from '../data/ejercicios'
import { FOTOS_BASE } from '../data/fotos'
import { claveFecha, inicioSemana, sumarDias } from '../logic/fechas'
import { leerSettings, escribirSettings } from '../data/settings'
import type { Sesion, SetLog } from '../data/tipos'
import { sesionRegistrada } from '../logic/registro'

declare global {
  interface Window { fmBiblioteca?: { ejercicios: unknown; fotos: unknown } }
}

export async function sembrarSiToca(): Promise<void> {
  // en desarrollo las pruebas de punta a punta leen la biblioteca real desde aquí
  if (import.meta.env.DEV) window.fmBiblioteca = { ejercicios: EJERCICIOS, fotos: FOTOS_BASE }
  const params = new URLSearchParams(location.search)
  const seed = params.get('seed')
  const frida = params.get('frida')
  if (seed === null && frida === null) return
  if (seed !== null) await borrarTodo()
  if (seed === '1') await sembrar()
  // las pruebas arrancan sin la carga inicial, sin "Pon al día tu semana" y sin preguntas por los días de esta semana;
  // con fresco=1 se deja como una instalación nueva de la v5
  if (params.get('fresco') !== '1') {
    const st = leerSettings()
    const noFui: string[] = []
    for (let i = 1; i <= 7; i++) noFui.push(claveFecha(sumarDias(new Date(), -i)))
    escribirSettings({ ...st, cargaInicialV5: true, semanaAlDiaV5: true, noFui })
  }
  // frida=hecha: FRIDA registrada el lunes de esta semana; frida=no: "esta semana no hay" (la siguiente completa trae pierna)
  const lunes = claveFecha(inicioSemana(new Date()))
  if (frida === 'hecha' || seed === '1') await guardarSesion({ id: `frida-${lunes}`, fecha: lunes, tipo: 'FRIDA', version: 'completa', inicio: new Date(lunes + 'T20:00:00').getTime(), fin: new Date(lunes + 'T21:00:00').getTime(), terminada: true })
  if (frida === 'no') { const s = leerSettings(); escribirSettings({ ...s, fridaPlan: { ...(s.fridaPlan ?? {}), [lunes]: null } }) }
  // registro=YYYY-MM-DD:TIPO deja una sesión registrada sin la app en esa fecha (para probar las preguntas de días sin registro)
  const registro = params.get('registro')
  if (registro) { const [fecha, tipo] = registro.split(':'); await guardarSesion(sesionRegistrada(fecha, (tipo as Sesion['tipo']) || 'A')) }
  history.replaceState(null, '', location.pathname)
}

/** 4 semanas cumplidas (Frida lunes, A miércoles, B viernes) con pesos que suben */
async function sembrar(): Promise<void> {
  const hoy = new Date()
  const lunesActual = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dow = lunesActual.getDay()
  lunesActual.setDate(lunesActual.getDate() - (dow === 0 ? 6 : dow - 1))

  const pesoBase: Record<string, number> = { 'press-inclinado': 12, jalon: 40, 'press-militar': 10, laterales: 6, goblet: 16, 'curl-alternado': 8, 'triceps-polea': 18, 'press-plano': 14, 'remo-polea': 35, 'remo-mancuerna': 16, 'remo-pecho-apoyado': 6, 'curl-martillo': 10, 'jalon-cerrado': 36, 'aperturas-mancuernas': 7, 'triceps-cabeza': 9 }

  for (let w = 4; w >= 1; w--) {
    const lunes = new Date(lunesActual)
    lunes.setDate(lunes.getDate() - w * 7)
    const dias: [number, Sesion['tipo']][] = [[0, 'FRIDA'], [2, w % 2 === 0 ? 'A' : 'B'], [4, w % 2 === 0 ? 'B' : 'A']]
    for (const [off, tipo] of dias) {
      const d = new Date(lunes)
      d.setDate(d.getDate() + off)
      d.setHours(19, 30, 0, 0)
      const inicio = d.getTime()
      const fecha = claveFecha(d)
      const id = `seed-${fecha}-${tipo}`
      const s: Sesion = { id, fecha, tipo, version: 'completa', inicio, fin: inicio + 62 * 60000, terminada: true, cambios: [], como: 'completa', origen: 'app' }
      await guardarSesion(s)
      if (tipo === 'FRIDA') continue
      // progreso: semana 4 y 3 mismo peso; semana 2 llega al tope; semana 1 sube
      const paso = 4 - w // 0..3
      for (const e of ejerciciosDe(tipo).filter((x) => !x.pierna)) {
        const base = pesoBase[e.id] ?? 10
        const conPeso = e.modo === 'peso'
        let peso: number | null = null
        if (conPeso) peso = base + (paso >= 3 ? 2 : 0)
        for (let n = 1; n <= e.series; n++) {
          let reps: number
          if (e.modo === 'tiempo') reps = e.repsMax
          else if (e.modo === 'corporal') reps = e.repsMax || 12
          else reps = paso === 0 ? e.repsMin : paso === 1 ? Math.min(e.repsMax, e.repsMin + 1) : paso === 2 ? e.repsMax : e.repsMin
          const log: SetLog = { sessionId: id, exerciseId: e.id, ejercicioBaseId: e.id, numSerie: n, pesoKg: peso, reps, fecha, hora: inicio + n * 120000 }
          await guardarSet(log)
        }
      }
    }
  }
}
