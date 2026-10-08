import { useCallback, useEffect, useState } from 'react'
import { Barra, type Destino } from './components/fm'
import { Aviso } from './components/Aviso'
import { Hoy } from './screens/Hoy'
import { Historial } from './screens/Historial'
import { Ejercicios } from './screens/Ejercicios'
import { Ajustes } from './screens/Ajustes'
import { Sesion } from './screens/Sesion'
import { useDatos } from './hooks/useDatos'
import { useReloj } from './hooks/useReloj'
import { useSesionActiva } from './hooks/useSesionActiva'
import { claveFecha } from './logic/fechas'
import { pedirPersistencia } from './data/db'
import type { Version, Letra } from './data/tipos'
import { Migracion } from './screens/Migracion'

const CLAVE_ACTUALIZADA = 'gym-app:actualizada'
/** tras 'Algo falló → Volver al inicio' no se retoma sola, para no caer en el mismo error */
const CLAVE_SIN_RETOMAR = 'gym-app:sin-retomar'
const HORAS_PARA_RETOMAR = 4

export default function App() {
  const datos = useDatos()
  const ahora = useReloj()
  const { activa, setActiva } = useSesionActiva()
  const [destino, setDestino] = useState<Destino>('hoy')
  const [enSesion, setEnSesion] = useState(false)
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
  // Si iOS cerró la app a media sesión, se retoma sola donde iba (salvo que se haya salido con "Seguir después" o venga de un error)
  const [retomada, setRetomada] = useState(false)
  useEffect(() => {
    if (!datos.listo || retomada) return
    setRetomada(true)
    if (!activa || !sesionEnCurso || activa.pausada) return
    if (sessionStorage.getItem(CLAVE_SIN_RETOMAR)) { sessionStorage.removeItem(CLAVE_SIN_RETOMAR); setActiva({ ...activa, pausada: true }); return }
    if (Date.now() - sesionEnCurso.inicio < HORAS_PARA_RETOMAR * 3600_000) setEnSesion(true)
  }, [datos.listo, retomada, activa, sesionEnCurso, setActiva])

  const empezar = useCallback(async (tipo: Letra, version: Version, pierna = false) => {
    // al empezar otra, la abierta se cierra sola (con series cuenta; sin series se descarta)
    await datos.cerrarAbiertas()
    const inicio = Date.now()
    const id = `${claveFecha(new Date(inicio))}-${tipo}-${inicio}`
    pedirPersistencia()
    await datos.guardarSesion({ id, fecha: claveFecha(new Date(inicio)), tipo, version, inicio, terminada: false, cambios: [], pierna: pierna && version !== 'corta', origen: 'app' })
    setActiva({ sessionId: id, paso: 0 })
    setEnSesion(true)
  }, [datos, setActiva])
  const cerrarAviso = useCallback(() => setAviso(null), [])

  if (!datos.listo) return null
  if (datos.necesitaMigracion) return <Migracion datos={datos} />

  if (enSesion && sesionEnCurso) {
    return <Sesion datos={datos} sesion={sesionEnCurso} activa={activa!} setActiva={setActiva} onSalir={() => { setActiva({ ...activa!, pausada: true }); setEnSesion(false) }} onTerminar={() => { setActiva(null); setEnSesion(false); setDestino('hoy') }} />
  }

  return (
    <>
      {destino === 'hoy' && (
        <Hoy datos={datos} ahora={ahora} sesionEnCurso={sesionEnCurso} onEmpezar={empezar} onSeguir={() => { if (activa) setActiva({ ...activa, pausada: false }); setEnSesion(true) }} onDescartar={async () => { if (sesionEnCurso) await datos.borrarSesion(sesionEnCurso.id); setActiva(null) }} onAjustes={() => setAjustes(true)} />
      )}
      {destino === 'historial' && <Historial datos={datos} ahora={ahora} />}
      {destino === 'ejercicios' && <Ejercicios datos={datos} />}
      <Barra destino={destino} onCambiar={setDestino} />
      <Ajustes datos={datos} abierta={ajustes} onCerrar={() => setAjustes(false)} onAviso={setAviso} />
      {aviso && <Aviso texto={aviso} onCerrar={cerrarAviso} />}
    </>
  )
}
