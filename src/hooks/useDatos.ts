import { useCallback, useEffect, useState } from 'react'
import type { Sesion, SetLog, Bodyweight, Photo, Settings, FotoEjercicio } from '../data/tipos'
import * as db from '../data/db'
import { leerSettings, escribirSettings } from '../data/settings'

export interface Datos {
  listo: boolean
  sesiones: Sesion[]
  sets: SetLog[]
  peso: Bodyweight[]
  fotos: Photo[]
  fotosEjercicio: FotoEjercicio[]
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
  setSettings: (s: Settings) => void
}

export function useDatos(): Datos {
  const [listo, setListo] = useState(false)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sets, setSets] = useState<SetLog[]>([])
  const [peso, setPeso] = useState<Bodyweight[]>([])
  const [fotos, setFotos] = useState<Photo[]>([])
  const [fotosEjercicio, setFotosEjercicio] = useState<FotoEjercicio[]>([])
  const [settings, setSettingsState] = useState<Settings>(() => leerSettings())

  const recargar = useCallback(async () => {
    const [s, l, p, f, fe] = await Promise.all([db.todasLasSesiones(), db.todosLosSets(), db.todoElPeso(), db.todasLasFotos(), db.todasLasFotosEjercicio()])
    // Datos dañados o de versiones viejas: se ignoran sin borrar lo demás
    setSesiones(s.filter((x) => x && typeof x.id === 'string' && typeof x.fecha === 'string' && typeof x.inicio === 'number' && ['A', 'B', 'FRIDA'].includes(x.tipo)).map((x) => ({ ...x, version: x.version ?? 'completa', terminada: !!x.terminada })))
    setSets(l.filter((x) => x && typeof x.sessionId === 'string' && typeof x.exerciseId === 'string' && typeof x.reps === 'number'))
    setPeso(p.filter((x) => x && typeof x.fecha === 'string' && typeof x.kg === 'number'))
    setFotos(f)
    setFotosEjercicio(fe)
    setListo(true)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const setSettings = useCallback((s: Settings) => {
    escribirSettings(s)
    setSettingsState(s)
  }, [])

  const envuelve = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) =>
    async (...a: A): Promise<R> => {
      const r = await fn(...a)
      await recargar()
      return r
    }

  return {
    listo, sesiones, sets, peso, fotos, fotosEjercicio, settings, recargar, setSettings,
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
  }
}
