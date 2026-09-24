import { useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, Version } from '../data/tipos'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { estadoSemana, siguienteSesion, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra, entraEnVersion } from '../logic/semana'
import { estadoTiempo, estadoSiSalgo, versionInicial, textoManana } from '../logic/horario'
import { porSesion } from '../logic/progresion'
import { ejerciciosDe } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, formatoHora, minutosDe } from '../logic/fechas'
import { Circulo, BotonPrincipal, BotonTexto, Hoja, Grupo, Fila, Pez } from '../components/fm'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: 'A' | 'B', version: Version) => void
  onSeguir: () => void
  onDescartar: () => void
  onAjustes: () => void
}

/** 6.1 Inicio: círculo rojo cortado arriba a la derecha, texto abajo a la izquierda, Empezar. */
export function Hoy({ datos, ahora, sesionEnCurso, onEmpezar, onSeguir, onDescartar, onAjustes }: Props) {
  usePantalla('inicio')
  const { W, H } = useMedidas()
  const { sesiones, sets, settings } = datos
  const semana = useMemo(() => estadoSemana(sesiones, ahora), [sesiones, ahora])
  const toca = useMemo(() => siguienteSesion(sesiones), [sesiones])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings), [ahora, settings])
  const rescate = useMemo(() => avisoRescate(sesiones, ahora, settings), [sesiones, ahora, settings])
  const cumplidas = useMemo(() => semanasCumplidas(sesiones, ahora), [sesiones, ahora])
  const proponerExtra = tocaProponerSeriesExtra(cumplidas, settings)
  const siSalgo = settings.horaSalida ? estadoSiSalgo(settings.horaSalida, settings) : null
  const estado = siSalgo ? siSalgo.estado : tiempo.estado
  const version = versionInicial(estado, semana.bonus)
  const [hojaLista, setHojaLista] = useState(false)
  const [hojaExtra, setHojaExtra] = useState(false)
  const lista = useMemo(() => ejerciciosDe(toca).filter((e) => entraEnVersion(e.orden, version)), [toca, version])
  const filas = useMemo(() => lista.map((e) => {
    const grupos = porSesion(sets, e.id)
    const u = grupos[grupos.length - 1]
    let dato = ''
    if (u) {
      const peso = Math.max(...u.map((s) => s.pesoKg ?? 0))
      const reps = Math.max(...u.map((s) => s.reps))
      dato = e.modo === 'peso' ? `${peso} kg` : e.modo === 'tiempo' ? `${reps} s` : `${reps} reps`
    }
    return { id: e.id, nombre: e.nombre, dato }
  }), [lista, sets])
  const minutos = version === 'corta' ? 45 : version === 'bonus' ? 75 : 65
  const tope = formatoHora(minutosDe(settings.horaTope))
  const claveHoy = claveFecha(ahora)
  const recortada = version === 'corta'

  let linea: string
  if (siSalgo) linea = `Sales a las ${formatoHora(minutosDe(settings.horaSalida!))}. ${siSalgo.estado === 'completa' ? 'Alcanza completa.' : siSalgo.estado === 'corta' ? 'No alcanza completa, te dejo lo esencial.' : 'Hoy ya no, salvo en corta.'}`
  else if (tiempo.estado === 'no') linea = `Hoy ya no. ${textoManana(ahora, DIAS_NOMBRE)}`
  else if (tiempo.estado === 'corta') linea = `Tienes ${tiempo.minutosParaTope} min. No alcanza completa, te dejo lo esencial.`
  else if (tiempo.minutosParaTope > 180) linea = ''
  else linea = `Tienes hasta las ${tope}. Alcanza completa.`

  async function alternarFrida() {
    if (semana.fridaHecha) {
      const f = sesiones.find((s) => s.tipo === 'FRIDA' && semana.dias.some((d) => d.fecha === s.fecha))
      if (f) await datos.borrarSesion(f.id)
      return
    }
    const lunes = semana.dias[0].fecha
    await datos.guardarSesion({ id: `frida-${lunes}`, fecha: lunes, tipo: 'FRIDA', version: 'completa', inicio: new Date(lunes + 'T20:00:00').getTime(), fin: new Date(lunes + 'T21:00:00').getTime(), terminada: true })
  }

  return (
    <div className="pantalla inicio">
      <Circulo d={0.62 * W} cx={0.83 * W} cy={0.11 * H} />
      <div className="inicio-arriba">
        <div className="puntos" aria-label={`Esta semana ${semana.hechas} de ${semana.meta}`}>
          {semana.dias.map((d, i) => {
            const clase = `punto ${d.tipos.length ? 'hecho' : ''} ${d.fecha === claveHoy ? 'hoy' : ''}`
            return i === 0 ? <button key={d.fecha} className={clase} onClick={alternarFrida} aria-label={semana.fridaHecha ? 'Lunes con Frida hecho, tocar para quitar' : 'Marcar lunes con Frida'} aria-pressed={semana.fridaHecha} /> : <span key={d.fecha} className={clase} />
          })}
        </div>
        <BotonTexto onClick={onAjustes}>Ajustes</BotonTexto>
      </div>

      <div className="inicio-texto">
        <p className="t-sub">{sesionEnCurso ? 'Sesión a medias' : semana.bonus ? 'Bonus, ya van 3' : 'Hoy toca'}</p>
        <h1 className="t-inicio">Cuerpo completo {sesionEnCurso?.tipo ?? toca}</h1>
        <div style={{ position: 'relative' }}>
          <button className="t-unidad tenue" style={{ fontSize: 20, fontWeight: 400, textAlign: 'left', lineHeight: 1.3 }} onClick={() => setHojaLista(true)}>
            {sesionEnCurso ? `Empezaste hace ${Math.max(1, Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000))} min.` : `${filas.length} ejercicios, unos ${minutos} min${linea ? `. ${linea}` : ''}${rescate ? ` ${rescate}` : ''}`}
          </button>
          {recortada && !sesionEnCurso && <Pez expresion="picaro" tamano={72} style={{ right: 0, top: -84 }} />}
        </div>
      </div>

      <div className="inicio-pie">
        {proponerExtra && !sesionEnCurso && <button className="inicio-linea-roja" onClick={() => setHojaExtra(true)}>Ya toca pasar a 4 series.</button>}
        {sesionEnCurso ? (
          <>
            <BotonPrincipal onClick={onSeguir}>Seguir sesión</BotonPrincipal>
            <BotonTexto onClick={() => confirm('¿Descartar la sesión a medias?') && onDescartar()}>Descartar</BotonTexto>
          </>
        ) : (
          <BotonPrincipal onClick={() => onEmpezar(toca, version)}>{tiempo.estado === 'no' && !siSalgo ? 'Empezar de todas formas' : 'Empezar'}</BotonPrincipal>
        )}
      </div>

      <Hoja abierta={hojaLista} titulo={`Cuerpo completo ${toca}`} onCerrar={() => setHojaLista(false)}>
        <Grupo>{filas.map((f, i) => <Fila key={f.id} num={i + 1} texto={f.nombre} dato={f.dato} />)}</Grupo>
      </Hoja>
      <Hoja abierta={hojaExtra} titulo="Cuatro semanas cumplidas" onCerrar={() => setHojaExtra(false)}>
        <p className="t-cuerpo">Press de banca, jalón, press inclinado y remo pasan de 3 a 4 series. Se puede apagar en ajustes.</p>
        <Grupo>
          <Fila texto="Aceptar" onClick={() => { datos.setSettings({ ...settings, seriesExtra: true }); setHojaExtra(false) }} />
          <Fila texto="Después" onClick={() => { datos.setSettings({ ...settings, reglaPospuestaEn: cumplidas }); setHojaExtra(false) }} />
        </Grupo>
      </Hoja>
    </div>
  )
}
