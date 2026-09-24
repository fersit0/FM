import { useCallback, useEffect, useState } from 'react'
import { Tabs, type Vista } from './components/Tabs'
import { Aviso } from './components/Aviso'
import { Hoy } from './screens/Hoy'
import { Progreso } from './screens/Progreso'
import { Rutina } from './screens/Rutina'
import { Ajustes } from './screens/Ajustes'
import { Sesion } from './screens/Sesion'
import { Diseno } from './screens/Diseno'
import { useDatos } from './hooks/useDatos'
import { useReloj } from './hooks/useReloj'
import { useSesionActiva } from './hooks/useSesionActiva'
import { claveFecha } from './logic/fechas'
import type { Version } from './data/tipos'

const CLAVE_ACTUALIZADA = 'gym-app:actualizada'

export default function App() {
  const datos = useDatos()
  const ahora = useReloj()
  const { activa, setActiva } = useSesionActiva()
  const [vista, setVista] = useState<Vista>('hoy')
  // Si hay sesión en curso, la app abre directo en ella (sobrevive cerrar Safari)
  const [enSesion, setEnSesion] = useState(() => activa !== null)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.dataset.tema = datos.settings.tema
  }, [datos.settings.tema])

  useEffect(() => {
    if (sessionStorage.getItem(CLAVE_ACTUALIZADA)) {
      sessionStorage.removeItem(CLAVE_ACTUALIZADA)
      setAviso('Actualizada')
    }
  }, [])

  const sesionEnCurso = activa ? datos.sesiones.find((s) => s.id === activa.sessionId && !s.terminada) ?? null : null

  useEffect(() => {
    // Si la sesión activa ya no existe (se borró o terminó), limpiar
    if (datos.listo && activa && !sesionEnCurso) setActiva(null)
  }, [datos.listo, activa, sesionEnCurso, setActiva])

  const empezar = useCallback(
    async (tipo: 'A' | 'B', version: Version) => {
      const inicio = Date.now()
      const id = `${claveFecha(new Date(inicio))}-${tipo}-${inicio}`
      await datos.guardarSesion({ id, fecha: claveFecha(new Date(inicio)), tipo, version, inicio, terminada: false, cambios: [] })
      setActiva({ sessionId: id, paso: 0 })
      setEnSesion(true)
    },
    [datos, setActiva],
  )

  const cerrarAviso = useCallback(() => setAviso(null), [])

  if (location.hash === '#diseno') return <Diseno />

  if (!datos.listo) return <div className="app" />

  if (enSesion && sesionEnCurso) {
    return (
      <div className="app">
        <Sesion
          datos={datos}
          sesion={sesionEnCurso}
          activa={activa!}
          setActiva={setActiva}
          onSalir={() => setEnSesion(false)}
          onTerminar={() => {
            setActiva(null)
            setEnSesion(false)
            setVista('hoy')
          }}
        />
      </div>
    )
  }

  return (
    <div className="app">
      {vista === 'hoy' && (
        <Hoy datos={datos} ahora={ahora} sesionEnCurso={sesionEnCurso} onEmpezar={empezar} onContinuar={() => setEnSesion(true)} />
      )}
      {vista === 'progreso' && <Progreso datos={datos} ahora={ahora} />}
      {vista === 'rutina' && <Rutina datos={datos} />}
      {vista === 'ajustes' && <Ajustes datos={datos} onAviso={setAviso} />}
      <Tabs vista={vista} onCambiar={setVista} />
      {aviso && <Aviso texto={aviso} onCerrar={cerrarAviso} />}
    </div>
  )
}
