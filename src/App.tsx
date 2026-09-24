import { useCallback, useEffect, useState } from 'react'
import { Barra, BotonPrincipal, BotonSecundario, Horizonte, type Destino } from './components/fm'
import { Aviso } from './components/Aviso'
import { Hoy } from './screens/Hoy'
import { Historial } from './screens/Historial'
import { Ejercicios } from './screens/Ejercicios'
import { Ajustes } from './screens/Ajustes'
import { Sesion } from './screens/Sesion'
import { Diseno } from './screens/Diseno'
import { useDatos } from './hooks/useDatos'
import { useReloj } from './hooks/useReloj'
import { useSesionActiva } from './hooks/useSesionActiva'
import { useTemp } from './design/temperatura'
import { claveFecha } from './logic/fechas'
import type { Version } from './data/tipos'

const CLAVE_ACTUALIZADA = 'gym-app:actualizada'

export default function App() {
  const datos = useDatos()
  const ahora = useReloj()
  const { activa, setActiva } = useSesionActiva()
  const [destino, setDestino] = useState<Destino>('hoy')
  const [enSesion, setEnSesion] = useState(false)
  const [preguntar, setPreguntar] = useState(() => activa !== null)
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
    if (datos.listo && activa && !sesionEnCurso) {
      setActiva(null)
      setPreguntar(false)
    }
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
  if (!datos.listo) return <Horizonte />

  if (preguntar && sesionEnCurso) {
    return <AMedias datos={datos} sesion={sesionEnCurso} onSeguir={() => { setPreguntar(false); setEnSesion(true) }} onDescartar={async () => { await datos.borrarSesion(sesionEnCurso.id); setActiva(null); setPreguntar(false) }} />
  }

  if (enSesion && sesionEnCurso) {
    return (
      <>
        <Horizonte />
        <Sesion datos={datos} sesion={sesionEnCurso} activa={activa!} setActiva={setActiva} onSalir={() => setEnSesion(false)} onTerminar={() => { setActiva(null); setEnSesion(false); setDestino('hoy') }} />
      </>
    )
  }

  return (
    <>
      <Horizonte />
      {destino === 'hoy' && (sesionEnCurso ? <Continuar sesion={sesionEnCurso} onContinuar={() => setEnSesion(true)} /> : <Hoy datos={datos} ahora={ahora} onEmpezar={empezar} onAjustes={() => setAjustes(true)} />)}
      {destino === 'historial' && <Historial datos={datos} ahora={ahora} />}
      {destino === 'ejercicios' && <Ejercicios datos={datos} />}
      <Barra destino={destino} onCambiar={setDestino} />
      <Ajustes datos={datos} abierta={ajustes} onCerrar={() => setAjustes(false)} onAviso={setAviso} />
      {aviso && <Aviso texto={aviso} onCerrar={cerrarAviso} />}
    </>
  )
}

function AMedias({ datos, sesion, onSeguir, onDescartar }: { datos: ReturnType<typeof useDatos>; sesion: { tipo: string; inicio: number; id: string }; onSeguir: () => void; onDescartar: () => void }) {
  useTemp('reposo')
  const minutos = Math.max(1, Math.round((Date.now() - sesion.inicio) / 60000))
  const series = datos.sets.filter((s) => s.sessionId === sesion.id).length
  return (
    <>
      <Horizonte />
      <div className="fm-pantalla">
        <div className="fm-columna" style={{ marginTop: 'auto', gap: 6 }}>
          <h1 className="titulo-grande">Tienes una sesión a medias.</h1>
          <p className="cuerpo tenue">{sesion.tipo}, empezó hace {minutos} min. {series ? `${series} series guardadas.` : 'Sin series todavía.'}</p>
        </div>
        <div className="fm-pie fm-columna">
          <div className="fm-secundarios" style={{ justifyContent: 'center' }}>
            <BotonSecundario onClick={() => confirm('¿Descartar la sesión a medias?') && onDescartar()}>Descartar</BotonSecundario>
          </div>
          <BotonPrincipal onClick={onSeguir}>Seguir</BotonPrincipal>
        </div>
      </div>
    </>
  )
}

function Continuar({ sesion, onContinuar }: { sesion: { tipo: string; inicio: number }; onContinuar: () => void }) {
  useTemp('reposo')
  const minutos = Math.max(1, Math.round((Date.now() - sesion.inicio) / 60000))
  return (
    <div className="fm-pantalla fm-con-barra">
      <div className="fm-columna" style={{ marginTop: 'auto', gap: 6 }}>
        <p className="subtexto">Sesión en curso</p>
        <h1 className="titulo-grande">Cuerpo completo {sesion.tipo}</h1>
        <p className="subtexto">Empezaste hace {minutos} min.</p>
      </div>
      <div className="fm-pie con-barra">
        <BotonPrincipal onClick={onContinuar}>Continuar</BotonPrincipal>
      </div>
    </div>
  )
}
