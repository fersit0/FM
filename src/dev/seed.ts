// Datos ficticios de 4 semanas, activables con ?seed=1 (y ?seed=0 para borrarlos)
import { borrarTodo, guardarSesion, guardarSet } from '../data/db'
import { ejerciciosDe } from '../data/ejercicios'
import { claveFecha } from '../logic/fechas'
import type { Sesion, SetLog } from '../data/tipos'

export async function sembrarSiToca(): Promise<void> {
  const params = new URLSearchParams(location.search)
  const seed = params.get('seed')
  if (seed === null) return
  await borrarTodo()
  if (seed === '1') await sembrar()
  history.replaceState(null, '', location.pathname)
}

/** 4 semanas cumplidas (Frida lunes, A miércoles, B viernes) con pesos que suben */
async function sembrar(): Promise<void> {
  const hoy = new Date()
  const lunesActual = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dow = lunesActual.getDay()
  lunesActual.setDate(lunesActual.getDate() - (dow === 0 ? 6 : dow - 1))

  const pesoBase: Record<string, number> = { A1: 14, A2: 40, A3: 16, A4: 10, A5: 15, A6: 20, B1: 12, B2: 35, B3: 80, B4: 6, B5: 10 }

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
      const s: Sesion = { id, fecha, tipo, version: 'completa', inicio, fin: inicio + 62 * 60000, terminada: true, cambios: [] }
      await guardarSesion(s)
      if (tipo === 'FRIDA') continue
      // progreso: semana 4 y 3 mismo peso; semana 2 llega al tope; semana 1 sube
      const paso = 4 - w // 0..3
      for (const e of ejerciciosDe(tipo)) {
        const base = pesoBase[e.id]
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
