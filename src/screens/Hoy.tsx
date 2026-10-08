import { useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, Version, Letra } from '../data/tipos'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { estadoSemana, siguienteSesion, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra, casaDeSemana, casaDisponible, CASA_MAX, estadoFrida, tocaPierna, diasParaMoverFrida, claveSemana } from '../logic/semana'
import { duracionEstimada } from '../logic/duracion'
import { estadoTiempo, estadoSiSalgo, versionInicial, textoManana } from '../logic/horario'
import { porSesion } from '../logic/progresion'
import { unidadDe, incrementoDe, pesoDeSet, formatoPeso } from '../logic/unidades'
import { bloquesDe, itemDeRutina, NOMBRE_SESION } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, formatoHora, minutosDe, fechaCorta, desdeClave } from '../logic/fechas'
import { tocaRespaldo } from '../logic/respaldo'
import { Circulo, BotonPrincipal, BotonTexto, Hoja, Grupo, Fila, Pez } from '../components/fm'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: Letra, version: Version, pierna?: boolean) => void
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
  const [versionNueva, setVersionNueva] = useState(() => typeof window.fmActualizar === 'function')
  useEffect(() => {
    const f = () => setVersionNueva(true)
    window.addEventListener('fm:version-nueva', f)
    return () => window.removeEventListener('fm:version-nueva', f)
  }, [])
  const casaHechas = casaDeSemana(sesiones, ahora)
  const sinGym = ahora.getDay() === 5 || ahora.getDay() === 6
  const ofrecerCasa = !sesionEnCurso && casaDisponible(sesiones, ahora) && (estado === 'no' || sinGym)
  const [hojaExtra, setHojaExtra] = useState(false)
  // Frida y pierna (RUTINA-FINAL.md, 2)
  const frida = useMemo(() => estadoFrida(sesiones, settings.fridaPlan, ahora), [sesiones, settings.fridaPlan, ahora])
  const pierna = useMemo(() => tocaPierna(sesiones, settings.fridaPlan, ahora, version), [sesiones, settings.fridaPlan, ahora, version])
  const [hojaMover, setHojaMover] = useState(false)
  const [verSesionHoy, setVerSesionHoy] = useState(false)
  const bloques = useMemo(() => bloquesDe(toca, version, pierna), [toca, version, pierna])
  const lista = useMemo(() => bloques.flatMap((b) => b.ejercicios), [bloques])
  const minutos = useMemo(() => duracionEstimada(bloques, version, { pierna, seriesExtra: settings.seriesExtra }), [bloques, version, pierna, settings.seriesExtra])
  const filas = useMemo(() => lista.map((base) => {
    const e = itemDeRutina(base, settings.reemplazos)
    const grupos = porSesion(sets, e.id)
    const u = grupos[grupos.length - 1]
    let dato = ''
    if (u) {
      const un = unidadDe(e, settings.unidades)
      const peso = Math.max(...u.map((s) => pesoDeSet(s, un, incrementoDe(e, un)) ?? 0))
      const reps = Math.max(...u.map((s) => s.reps))
      dato = e.modo === 'peso' ? formatoPeso(peso, un) : e.modo === 'tiempo' ? `${reps} s` : `${reps} reps`
    }
    return { id: e.id, nombre: e.nombre, dato, bloque: base.bloque, par: lista.filter((x) => x.bloque === base.bloque).length > 1 }
  }), [lista, sets, settings.reemplazos, settings.unidades])
  const tope = formatoHora(minutosDe(settings.horaTope))
  const claveHoy = claveFecha(ahora)
  const recordarRespaldo = !sesionEnCurso && tocaRespaldo(settings.ultimoRespaldo, sesiones, claveHoy)
  const recortada = version === 'corta'

  let linea: string
  if (siSalgo) linea = `Sales a las ${formatoHora(minutosDe(settings.horaSalida!))}. ${siSalgo.estado === 'completa' ? 'Alcanza completa.' : siSalgo.estado === 'corta' ? 'No alcanza completa, te dejo lo esencial.' : 'Hoy ya no, salvo en corta.'}`
  else if (tiempo.estado === 'no') linea = `Hoy ya no. ${textoManana(ahora, DIAS_NOMBRE)}`
  else if (tiempo.estado === 'corta') linea = `Tienes ${tiempo.minutosParaTope} min. No alcanza completa, te dejo lo esencial.`
  else if (tiempo.minutosParaTope > 180) linea = ''
  else linea = `Tienes hasta las ${tope}. Alcanza completa.`

  /** "Sí, fui": registra FRIDA en el día planeado (o el pendiente) */
  async function fridaHecha(fecha: string) {
    await datos.guardarSesion({ id: `frida-${fecha}`, fecha, tipo: 'FRIDA', version: 'completa', inicio: new Date(fecha + 'T20:00:00').getTime(), fin: new Date(fecha + 'T21:00:00').getTime(), terminada: true })
  }
  /** "Se movió a…" o "Esta semana no hay" (null) */
  function moverFrida(fecha: string | null) {
    datos.setSettings({ ...settings, fridaPlan: { ...(settings.fridaPlan ?? {}), [claveSemana(ahora)]: fecha } })
    setHojaMover(false)
  }
  const diaTexto = (f: string) => `${DIAS_NOMBRE[desdeClave(f).getDay()]} ${desdeClave(f).getDate()}`
  // pantalla de Frida: hoy es el día planeado, o el planeado ya pasó sin respuesta
  const fridaFecha = frida.pendiente ?? (frida.hoyEsFrida ? frida.planeada : null)
  const pantallaFrida = !sesionEnCurso && fridaFecha !== null && !verSesionHoy

  return (
    <div className="pantalla inicio">
      <Circulo d={0.62 * W} style={{ position: 'absolute', left: 0.83 * W, top: 0.11 * H, transform: 'translate(-50%, -50%)' }} />
      <div className="inicio-arriba">
        <div className="puntos" aria-label={`Esta semana ${semana.hechas} de ${semana.meta}`}>
          {semana.dias.map((d) => {
            const clase = `punto ${d.tipos.length ? 'hecho' : ''} ${d.fecha === claveHoy ? 'hoy' : ''}`
            return <span key={d.fecha} className={clase} title={d.fecha === frida.planeada && !frida.hecha ? 'Pierna con Frida' : undefined} />
          })}
        </div>
        <BotonTexto onClick={onAjustes}>Ajustes</BotonTexto>
      </div>

      <div className="inicio-texto">
        {pantallaFrida ? (
          <>
            <p className="t-sub">{frida.pendiente ? 'Quedó pendiente' : 'Hoy toca'}</p>
            <h1 className="t-inicio">{frida.pendiente ? `¿Fuiste con Frida el ${diaTexto(frida.pendiente)}?` : 'FRIDA: pierna en Foro 4'}</h1>
            <p className="t-unidad tenue" style={{ fontSize: 20, fontWeight: 400, lineHeight: 1.3 }}>{frida.pendiente ? 'Dime qué pasó antes de armar la sesión.' : 'El día de pierna. Si se mueve o no hay, dímelo y la app acomoda la pierna.'}</p>
          </>
        ) : (
          <>
            <p className="t-sub">{sesionEnCurso ? 'Sesión a medias' : semana.bonus ? 'Bonus, ya van 3' : 'Hoy toca'}</p>
            {recortada && !sesionEnCurso && <Pez expresion="picaro" tamano={72} style={{ right: 0, top: -30 }} />}
            <h1 className="t-inicio">{sesionEnCurso?.tipo === 'CASA' ? 'Casa' : `${sesionEnCurso?.tipo ?? toca}: ${NOMBRE_SESION[(sesionEnCurso?.tipo === 'FRIDA' ? toca : (sesionEnCurso?.tipo as Letra | undefined)) ?? toca]}`}</h1>
            <div style={{ position: 'relative' }}>
              <button className="t-unidad tenue" style={{ fontSize: 20, fontWeight: 400, textAlign: 'left', lineHeight: 1.3 }} onClick={() => setHojaLista(true)}>
                {sesionEnCurso ? `Empezaste hace ${Math.max(1, Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000))} min.` : `${bloques.length} bloques, unos ${minutos} min${pierna ? `, con pierna (${toca === 'A' ? 'goblet' : 'prensa'} a 3 series)` : ''}${linea ? `. ${linea}` : ''}${rescate ? ` ${rescate}` : ''}`}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="inicio-pie">
        {versionNueva && <button className="inicio-linea-roja" onClick={() => window.fmActualizar?.()}>Hay versión nueva. Toca para actualizar.</button>}
        {pantallaFrida && fridaFecha && (
          <>
            <BotonPrincipal onClick={() => fridaHecha(fridaFecha)}>Sí, fui</BotonPrincipal>
            <div className="botones-fila" style={{ justifyContent: 'center' }}>
              <BotonTexto onClick={() => setHojaMover(true)}>Se movió a…</BotonTexto>
              <BotonTexto onClick={() => moverFrida(null)}>No hubo</BotonTexto>
            </div>
            {!frida.pendiente && <BotonTexto onClick={() => setVerSesionHoy(true)}>Mejor hago {toca} hoy</BotonTexto>}
          </>
        )}
        {!pantallaFrida && !sesionEnCurso && !frida.hecha && <BotonTexto onClick={() => setHojaMover(true)}>{frida.planeada ? `Pierna con Frida: ${diaTexto(frida.planeada)}. Mover` : 'Esta semana sin Frida. Cambiar'}</BotonTexto>}
        {proponerExtra && !sesionEnCurso && <button className="inicio-linea-roja" onClick={() => setHojaExtra(true)}>Ya toca pasar a 4 series.</button>}
        {recordarRespaldo && <BotonTexto onClick={onAjustes}>{settings.ultimoRespaldo ? 'Ya pasaron 2 semanas del último respaldo. Descárgalo en Ajustes.' : 'Descarga tu primer respaldo en Ajustes.'}</BotonTexto>}
        {ofrecerCasa && <BotonTexto onClick={() => onEmpezar('CASA', 'completa')}>Casa, 12 minutos. Llevas {casaHechas} de {CASA_MAX}.</BotonTexto>}
        {sesionEnCurso ? (
          <>
            <BotonPrincipal onClick={onSeguir}>Seguir sesión</BotonPrincipal>
            <BotonTexto onClick={() => confirm('¿Descartar la sesión a medias?') && onDescartar()}>Descartar</BotonTexto>
          </>
        ) : !pantallaFrida ? (
          <BotonPrincipal onClick={() => onEmpezar(toca, version, pierna)}>{tiempo.estado === 'no' && !siSalgo ? 'Empezar de todas formas' : 'Empezar'}</BotonPrincipal>
        ) : null}
      </div>

      <Hoja abierta={hojaLista} titulo={`${toca}: ${NOMBRE_SESION[toca]}`} onCerrar={() => setHojaLista(false)}>
        <Grupo>{filas.map((f) => <Fila key={f.id} num={f.bloque} texto={f.nombre} detalle={f.par ? 'En par' : undefined} dato={f.dato} />)}</Grupo>
      </Hoja>
      <Hoja abierta={hojaMover} titulo="Pierna con Frida" onCerrar={() => setHojaMover(false)}>
        <p className="t-cuerpo tenue">¿Qué día de esta semana? Mientras haya Frida, A y B no traen pierna.</p>
        <Grupo>
          {diasParaMoverFrida(ahora).map((f) => <Fila key={f} texto={`${DIAS_NOMBRE[desdeClave(f).getDay()]} ${fechaCorta(f)}`} dato={f === frida.planeada ? 'Planeado' : ''} onClick={() => moverFrida(f)} />)}
          <Fila texto="Esta semana no hay" detalle={`La siguiente ${toca} completa trae pierna a 3 series`} dato={frida.planeada === null ? 'Elegido' : ''} onClick={() => moverFrida(null)} />
        </Grupo>
      </Hoja>
      <Hoja abierta={hojaExtra} titulo="Cuatro semanas cumplidas" onCerrar={() => setHojaExtra(false)}>
        <p className="t-cuerpo">Press inclinado, jalón, press plano y remo en polea pasan de 3 a 4 series. Se puede apagar en ajustes.</p>
        <Grupo>
          <Fila texto="Aceptar" onClick={() => { datos.setSettings({ ...settings, seriesExtra: true }); setHojaExtra(false) }} />
          <Fila texto="Después" onClick={() => { datos.setSettings({ ...settings, reglaPospuestaEn: cumplidas }); setHojaExtra(false) }} />
        </Grupo>
      </Hoja>
    </div>
  )
}
