import { useCallback, useEffect, useState } from 'react'
import type { Sesion, SetLog, Bodyweight, Photo, Settings, FotoEjercicio, Cintura } from '../data/tipos'
import * as db from '../data/db'
import { leerSettings, escribirSettings } from '../data/settings'
import { hayIdsViejos } from '../logic/migracion'
import { cargaInicial, cierresPendientes } from '../logic/registro'
import { claveFecha } from '../logic/fechas'

export interface Datos {
  listo: boolean
  /** hay ids viejos (A1, B4...) y la migración de RUTINA-FINAL no ha corrido */
  necesitaMigracion: boolean
  sesiones: Sesion[]
  sets: SetLog[]
  peso: Bodyweight[]
  fotos: Photo[]
  fotosEjercicio: FotoEjercicio[]
  cintura: Cintura[]
  settings: Settings
  recargar: () => Promise<void>
  guardarSesion: (s: Sesion) => Promise<void>
  borrarSesion: (id: string) => Promise<void>
  guardarSet: (s: SetLog) => Promise<number>
  borrarSet: (id: number) => Promise<void>
  guardarPeso: (p: Bodyweight) => Promise<void>
  borrarPeso: (fecha: string) => Promise<void>
  guardarFoto: (f: Photo) => Promise<void>
  borrarFoto: (fecha: string) => Promise<void>
  guardarFotoEjercicio: (f: FotoEjercicio) => Promise<void>
  borrarFotoEjercicio: (id: string) => Promise<void>
  guardarCintura: (c: Cintura) => Promise<void>
  borrarCintura: (fecha: string) => Promise<void>
  setSettings: (s: Settings) => void
  /** cierra las sesiones abiertas (con series: hechas; sin series: se descartan), por ejemplo antes de empezar otra */
  cerrarAbiertas: () => Promise<void>
}

const valida = (x: Sesion) => x && typeof x.id === 'string' && typeof x.fecha === 'string' && typeof x.inicio === 'number' && ['A', 'B', 'FRIDA', 'CASA'].includes(x.tipo)

export function useDatos(): Datos {
  const [listo, setListo] = useState(false)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sets, setSets] = useState<SetLog[]>([])
  const [peso, setPeso] = useState<Bodyweight[]>([])
  const [fotos, setFotos] = useState<Photo[]>([])
  const [fotosEjercicio, setFotosEjercicio] = useState<FotoEjercicio[]>([])
  const [cintura, setCintura] = useState<Cintura[]>([])
  const [settings, setSettingsState] = useState<Settings>(() => leerSettings())

  const setSettings = useCallback((s: Settings) => {
    escribirSettings(s)
    setSettingsState(s)
  }, [])

  const recargar = useCallback(async () => {
    const [s, l, p, f, fe, ci] = await Promise.all([db.todasLasSesiones(), db.todosLosSets(), db.todoElPeso(), db.todasLasFotos(), db.todasLasFotosEjercicio(), db.todaLaCintura()])
    setCintura(ci)
    // Datos dañados o de versiones viejas: se ignoran sin borrar lo demás
    setSesiones(s.filter(valida).map((x) => ({ ...x, version: x.version ?? 'completa', terminada: !!x.terminada })))
    setSets(l.filter((x) => x && typeof x.sessionId === 'string' && typeof x.exerciseId === 'string' && typeof x.reps === 'number'))
    setPeso(p.filter((x) => x && typeof x.fecha === 'string' && typeof x.kg === 'number'))
    setFotos(f)
    setFotosEjercicio(fe)
    setListo(true)
  }, [])

  // Al arrancar: la A del 7 oct una sola vez, y las sesiones abiertas de otros días se cierran solas (RUTINA-FINAL.md, 2)
  useEffect(() => {
    (async () => {
      const [s, l] = await Promise.all([db.todasLasSesiones(), db.todosLosSets()])
      const st = leerSettings()
      let cambio = false
      if (!st.migracionRutinaFinal && hayIdsViejos(l, s, [])) { await recargar(); return }
      if (!st.cargaInicialV5) {
        const a = cargaInicial(s.filter(valida))
        if (a) { await db.guardarSesion(a); cambio = true }
        setSettings({ ...st, cargaInicialV5: true })
      }
      const c = cierresPendientes(s.filter(valida), l, claveFecha(new Date()))
      for (const x of c.guardar) await db.guardarSesion(x)
      for (const id of c.borrar) await db.borrarSesion(id)
      if (cambio || c.guardar.length || c.borrar.length) { /* ya aplicado en la base */ }
      await recargar()
    })()
  }, [recargar, setSettings])

  const envuelve = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) =>
    async (...a: A): Promise<R> => {
      const r = await fn(...a)
      await recargar()
      return r
    }
  const cerrarAbiertas = useCallback(async () => {
    const c = cierresPendientes(sesiones, sets, claveFecha(new Date()), true)
    for (const x of c.guardar) await db.guardarSesion(x)
    for (const id of c.borrar) await db.borrarSesion(id)
    if (c.guardar.length || c.borrar.length) await recargar()
  }, [sesiones, sets, recargar])

  const necesitaMigracion = listo && !settings.migracionRutinaFinal && hayIdsViejos(sets, sesiones, fotosEjercicio)
  return {
    listo, necesitaMigracion, sesiones, sets, peso, fotos, fotosEjercicio, cintura, settings, recargar, setSettings, cerrarAbiertas,
    guardarSesion: envuelve(db.guardarSesion),
    borrarSesion: envuelve(db.borrarSesion),
    guardarSet: envuelve(db.guardarSet),
    borrarSet: envuelve(db.borrarSet),
    guardarPeso: envuelve(db.guardarPeso),
    borrarPeso: envuelve(db.borrarPeso),
    guardarFoto: envuelve(db.guardarFoto),
    borrarFoto: envuelve(db.borrarFoto),
    guardarFotoEjercicio: envuelve(db.guardarFotoEjercicio),
    borrarFotoEjercicio: envuelve(db.borrarFotoEjercicio),
    guardarCintura: envuelve(db.guardarCintura),
    borrarCintura: envuelve(db.borrarCintura),
  }
}
