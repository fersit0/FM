import { useCallback, useEffect, useState } from 'react'
import { Barra, type Destino } from './components/fm'
import { Aviso } from './components/Aviso'
import { Hoy } from './screens/Hoy'
import { Senal } from './screens/Senal'
import { Ejercicios } from './screens/Ejercicios'
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
  const [destino, setDestino] = useState<Destino>('hoy')
  // Si hay sesión en curso, la app abre directo en ella (sobrevive cerrar Safari)
  const [enSesion, setEnSesion] = useState(() => activa !== null)
  const [ajustes, setAjustes] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem(CLAVE_ACTUALIZADA)) {
      sessionStorage.removeItem(CLAVE_ACTUALIZADA)
      setAviso('Actualizada')
    }
  }, [])

  const sesionEnCurso = activa ? datos.sesiones.find((s) => s.id === activa.sessionId && !s.terminada) ?? null : null

  useEffect(() => {
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
  if (!datos.listo) return <div />

  if (enSesion && sesionEnCurso) {
    return (
      <Sesion
        datos={datos}
        sesion={sesionEnCurso}
        activa={activa!}
        setActiva={setActiva}
        onSalir={() => setEnSesion(false)}
        onTerminar={() => {
          setActiva(null)
          setEnSesion(false)
          setDestino('hoy')
        }}
      />
    )
  }

  return (
    <>
      {destino === 'hoy' && (
        <Hoy datos={datos} ahora={ahora} sesionEnCurso={sesionEnCurso} onEmpezar={empezar} onContinuar={() => setEnSesion(true)} onAjustes={() => setAjustes(true)} />
      )}
      {destino === 'senal' && <Senal datos={datos} ahora={ahora} />}
      {destino === 'ejercicios' && <Ejercicios datos={datos} />}
      <Barra destino={destino} onCambiar={setDestino} />
      <Ajustes datos={datos} abierta={ajustes} onCerrar={() => setAjustes(false)} onAviso={setAviso} />
      {aviso && <Aviso texto={aviso} onCerrar={cerrarAviso} />}
    </>
  )
}
