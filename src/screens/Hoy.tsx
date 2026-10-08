import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, Version, Letra } from '../data/tipos'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { estadoSemana, siguienteSesion, ultimaPropia, avisoRescate, casaDeSemana, casaDisponible, CASA_MAX, estadoFrida, tocaPierna, diasParaMoverFrida, claveSemana, diaFridaPlaneado } from '../logic/semana'
import { diasSinRegistro, diasDeSemanaHastaHoy, armarRegistro, textoUltima, type DiaPendiente } from '../logic/registro'
import { duracionEstimada, minutosHastaUltimaPesa } from '../logic/duracion'
import { estadoTiempo, estadoSiSalgo, versionAutomatica, textoManana, type Duraciones } from '../logic/horario'
import { porSesion } from '../logic/progresion'
import { unidadDe, incrementoDe, pesoDeSet, formatoPeso } from '../logic/unidades'
import { listaDe, itemDeRutina, NOMBRE_SESION, ZONA_NOMBRE, rutaDe } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, formatoHora, minutosDe, minutosAhora, fechaCorta, desdeClave } from '../logic/fechas'
import { tocaRespaldo } from '../logic/respaldo'
import { Circulo, BotonPrincipal, BotonTexto, Hoja, Grupo, Fila, Pez, Deshacer } from '../components/fm'
import { BotonesDia, RegistrarHoja, textoDia, type Respuesta } from '../components/Registrar'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: Letra, version: Version, pierna?: boolean) => void
  onSeguir: () => void
  onDescartar: () => void
  onAjustes: () => void
}
type Accion = { texto: string; deshacer: () => void | Promise<void> }

/** 6.1 Inicio: círculo rojo cortado arriba a la derecha, texto abajo a la izquierda, Empezar. */
export function Hoy({ datos, ahora, sesionEnCurso, onEmpezar, onSeguir, onDescartar, onAjustes }: Props) {
  usePantalla('inicio')
  const { W, H } = useMedidas()
  const { sesiones, sets, settings } = datos
  const claveHoy = claveFecha(ahora)
  const semana = useMemo(() => estadoSemana(sesiones, ahora, sets), [sesiones, ahora, sets])
  const toca = useMemo(() => siguienteSesion(sesiones, sets), [sesiones, sets])
  const ultima = useMemo(() => ultimaPropia(sesiones, sets), [sesiones, sets])
  const rescate = useMemo(() => avisoRescate(sesiones, ahora, sets), [sesiones, ahora, sets])
  // Frida y pierna (RUTINA-FINAL.md, 2)
  const frida = useMemo(() => estadoFrida(sesiones, settings.fridaPlan, ahora, sets), [sesiones, settings.fridaPlan, ahora, sets])
  const pierna = useMemo(() => tocaPierna(sesiones, settings.fridaPlan, ahora, 'completa', sets), [sesiones, settings.fridaPlan, ahora, sets])
  // versión automática: la completa con pierna si toca, la corta nunca
  const listaCompleta = useMemo(() => listaDe(toca, 'completa', pierna), [toca, pierna])
  const listaCorta = useMemo(() => listaDe(toca, 'corta'), [toca])
  const duraciones = useMemo<Duraciones>(() => ({ completa: minutosHastaUltimaPesa(listaCompleta, 'completa'), corta: minutosHastaUltimaPesa(listaCorta, 'corta') }), [listaCompleta, listaCorta])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings, duraciones, semana.bonus), [ahora, settings, duraciones, semana.bonus])
  const siSalgo = settings.horaSalida ? estadoSiSalgo(settings.horaSalida, settings, duraciones, semana.bonus) : null
  const versionAuto = siSalgo ? siSalgo.version : tiempo.version
  const version: Version = versionAuto === 'casa' ? 'corta' : versionAuto
  const lista = version === 'corta' ? listaCorta : listaCompleta
  const conPierna = version !== 'corta' && pierna
  const minutos = useMemo(() => duracionEstimada(lista, version, { pierna: conPierna }), [lista, version, conPierna])
  const [hojaLista, setHojaLista] = useState(false)
  const [hojaCasa, setHojaCasa] = useState(false)
  const [registrar, setRegistrar] = useState(false)
  const [accion, setAccion] = useState<Accion | null>(null)
  const cerrarAccion = useCallback(() => setAccion(null), [])
  const [versionNueva, setVersionNueva] = useState(() => typeof window.fmActualizar === 'function')
  useEffect(() => {
    const f = () => setVersionNueva(true)
    window.addEventListener('fm:version-nueva', f)
    return () => window.removeEventListener('fm:version-nueva', f)
  }, [])
  const casaHechas = casaDeSemana(sesiones, ahora, sets)
  const sinGym = ahora.getDay() === 5 || ahora.getDay() === 6
  const ofrecerCasa = !sesionEnCurso && casaDisponible(sesiones, ahora, sets) && (versionAuto === 'casa' || sinGym)
  const [hojaMover, setHojaMover] = useState(false)
  const [verSesionHoy, setVerSesionHoy] = useState(false)
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
    return { id: e.id, nombre: e.nombre, dato, zona: base.zona ? ZONA_NOMBRE[base.zona] : '' }
  }), [lista, sets, settings.reemplazos, settings.unidades])
  const recordarRespaldo = !sesionEnCurso && tocaRespaldo(settings.ultimoRespaldo, sesiones, claveHoy)

  // Registro de sesiones (RUTINA-FINAL.md, 2): pon al día la semana una vez, luego pregunta por cada día de gym sin registro
  const pendientes = useMemo(() => diasSinRegistro(sesiones, sets, settings, ahora), [sesiones, sets, settings, ahora])
  const alDia = !settings.semanaAlDiaV5
  const pregunta: DiaPendiente | null = !alDia && pendientes.length ? pendientes[0] : null

  /** Contesta por un día: registra A, B o Frida, o lo marca "No fui". En el día planeado de Frida, lo que no sea Frida deja la semana sin Frida. */
  async function contestar(fecha: string, r: Respuesta) {
    const semanaDe = claveSemana(desdeClave(fecha))
    const eraFrida = diaFridaPlaneado(settings.fridaPlan, desdeClave(fecha)) === fecha
    const antes = settings
    const plan = eraFrida && r !== 'FRIDA' ? { ...(settings.fridaPlan ?? {}), [semanaDe]: null } : settings.fridaPlan
    if (r === 'no') {
      datos.setSettings({ ...settings, fridaPlan: plan, noFui: [...(settings.noFui ?? []).filter((d) => d !== fecha), fecha] })
      setAccion({ texto: `${textoDia(fecha)}: no fuiste.`, deshacer: () => datos.setSettings(antes) })
      return
    }
    const arm = armarRegistro(sesiones, fecha, r, claveHoy)
    if ('error' in arm) return
    await datos.guardarSesion(arm.sesion)
    datos.setSettings({ ...settings, fridaPlan: plan, noFui: (settings.noFui ?? []).filter((d) => d !== fecha) })
    setAccion({ texto: `${textoDia(fecha)}: ${r === 'FRIDA' ? 'Frida' : r} registrada.`, deshacer: async () => { if (arm.reemplaza) await datos.guardarSesion(arm.reemplaza); else await datos.borrarSesion(arm.sesion.id); datos.setSettings(antes) } })
  }
  function moverFrida(fecha: string | null) {
    datos.setSettings({ ...settings, fridaPlan: { ...(settings.fridaPlan ?? {}), [claveSemana(ahora)]: fecha } })
    setHojaMover(false)
  }
  /** Empezar: la versión se decide con la hora real al tocar; si no alcanza ni la corta, ofrece CASA */
  function empezar() {
    const v = versionAutomatica(minutosAhora(new Date()), duraciones, minutosDe(settings.horaTope), semana.bonus)
    if (v === 'casa') { setHojaCasa(true); return }
    onEmpezar(toca, v, v !== 'corta' && pierna)
  }

  let linea: string
  if (siSalgo) linea = `Sales a las ${formatoHora(minutosDe(settings.horaSalida!))}: ${siSalgo.version === 'casa' ? 'ya no alcanza ni la corta' : `alcanza la ${siSalgo.version === 'corta' ? 'corta' : 'completa'}`}.`
  else if (tiempo.version === 'casa') linea = `${tiempo.titulo} ${textoManana(ahora, DIAS_NOMBRE)}`
  else if (tiempo.minutosParaTope > 180) linea = ''
  else linea = tiempo.detalle
  const nombreVersion = versionAuto === 'casa' ? 'corta de todas formas' : versionAuto === 'bonus' ? 'bonus' : versionAuto
  const pantallaFrida = !sesionEnCurso && !alDia && !pregunta && frida.hoyEsFrida && !verSesionHoy

  if (alDia && !sesionEnCurso) return <PonAlDia datos={datos} ahora={ahora} />

  return (
    <div className="pantalla inicio">
      <Circulo d={0.62 * W} style={{ position: 'absolute', left: 0.83 * W, top: 0.11 * H, transform: 'translate(-50%, -50%)' }} />
      <div className="inicio-arriba">
        <div className="puntos" aria-label={`Semana: ${semana.hechas} de ${semana.meta}`}>
          {semana.dias.map((d) => {
            const clase = `punto ${d.tipos.length ? 'hecho' : ''} ${d.fecha === claveHoy ? 'hoy' : ''}`
            return <span key={d.fecha} className={clase} title={d.fecha === frida.planeada && !frida.hecha ? 'Pierna con Frida' : undefined} />
          })}
          <span className="t-nota tenue inicio-semana">Semana: {semana.hechas} de {semana.meta}</span>
        </div>
        <BotonTexto onClick={onAjustes}>Ajustes</BotonTexto>
      </div>

      <div className="inicio-texto">
        {pregunta ? (
          <>
            <p className="t-sub">Antes de armar la sesión</p>
            <h1 className="t-inicio">¿Entrenaste el {textoDia(pregunta.fecha)}?</h1>
            <p className="t-unidad tenue inicio-nota">Tocaba {pregunta.sugerida === 'FRIDA' ? 'Frida' : pregunta.sugerida}. Un toque y listo; se puede cambiar en Historial.</p>
          </>
        ) : pantallaFrida ? (
          <>
            <p className="t-sub">Hoy toca</p>
            <h1 className="t-inicio">FRIDA: pierna en Foro 4</h1>
            <p className="t-unidad tenue inicio-nota">El día de pierna. Si se mueve o no hay, dímelo y la app acomoda la pierna.</p>
          </>
        ) : (
          <>
            <p className="t-nota tenue inicio-linea">{sesionEnCurso ? 'Sesión a medias' : semana.bonus ? `Bonus, ya van ${semana.hechas}` : `Hoy toca ${toca} · ${textoUltima(ultima, DIAS_NOMBRE)}`}</p>
            {versionAuto !== 'completa' && versionAuto !== 'bonus' && !sesionEnCurso && <Pez expresion="picaro" tamano={72} style={{ right: 0, top: -30 }} />}
            <h1 className="t-inicio">{sesionEnCurso?.tipo === 'CASA' ? 'Casa' : `${sesionEnCurso?.tipo ?? toca}: ${NOMBRE_SESION[(sesionEnCurso?.tipo === 'FRIDA' ? toca : (sesionEnCurso?.tipo as Letra | undefined)) ?? toca]}`}</h1>
            <div style={{ position: 'relative' }}>
              <button className="t-unidad tenue inicio-nota" onClick={() => setHojaLista(true)}>
                {sesionEnCurso ? `Empezaste hace ${Math.max(1, Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000))} min.` : `${lista.length} ejercicios, unos ${minutos} min · ${nombreVersion}${conPierna ? ', con pierna (goblet a 3 series)' : ''}${linea ? `. ${linea}` : ''}${rescate ? ` ${rescate}` : ''}`}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="inicio-pie">
        {versionNueva && <button className="inicio-linea-roja" onClick={() => window.fmActualizar?.()}>Hay versión nueva. Toca para actualizar.</button>}
        {pregunta && <BotonesDia marcado={pregunta.sugerida} onElegir={(r) => contestar(pregunta.fecha, r)} />}
        {pantallaFrida && frida.planeada && (
          <>
            <BotonPrincipal onClick={() => contestar(frida.planeada!, 'FRIDA')}>Sí, fui</BotonPrincipal>
            <div className="botones-fila" style={{ justifyContent: 'center' }}>
              <BotonTexto onClick={() => setHojaMover(true)}>Se movió a…</BotonTexto>
              <BotonTexto onClick={() => contestar(frida.planeada!, 'no')}>No hubo</BotonTexto>
            </div>
            <BotonTexto onClick={() => setVerSesionHoy(true)}>Mejor hago {toca} hoy</BotonTexto>
          </>
        )}
        {!pregunta && !pantallaFrida && !sesionEnCurso && !frida.hecha && <BotonTexto onClick={() => setHojaMover(true)}>{frida.planeada ? `Pierna con Frida: ${textoDia(frida.planeada)}. Mover` : 'Esta semana sin Frida. Cambiar'}</BotonTexto>}
        {recordarRespaldo && <BotonTexto onClick={onAjustes}>{settings.ultimoRespaldo ? 'Ya pasaron 2 semanas del último respaldo. Descárgalo en Ajustes.' : 'Descarga tu primer respaldo en Ajustes.'}</BotonTexto>}
        {!pregunta && !pantallaFrida && !sesionEnCurso && <BotonTexto onClick={() => setRegistrar(true)}>Registrar sesión</BotonTexto>}
        {ofrecerCasa && !pregunta && <BotonTexto onClick={() => onEmpezar('CASA', 'completa')}>Casa, 12 minutos. Llevas {casaHechas} de {CASA_MAX}.</BotonTexto>}
        {sesionEnCurso ? (
          <>
            <BotonPrincipal onClick={onSeguir}>Seguir sesión</BotonPrincipal>
            <BotonTexto onClick={() => confirm('¿Descartar la sesión a medias?') && onDescartar()}>Descartar</BotonTexto>
          </>
        ) : !pantallaFrida && !pregunta ? (
          <BotonPrincipal onClick={empezar}>{versionAuto === 'casa' && !siSalgo ? 'Empezar de todas formas' : 'Empezar'}</BotonPrincipal>
        ) : null}
      </div>

      {accion && <Deshacer texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={cerrarAccion} />}

      <Hoja abierta={hojaLista} titulo={`${toca}: ${NOMBRE_SESION[toca]}`} onCerrar={() => setHojaLista(false)}>
        <p className="t-nota tenue">{rutaDe(lista).map((z) => ZONA_NOMBRE[z]).join(' → ')}</p>
        <Grupo>{filas.map((f, i) => <Fila key={f.id} num={i + 1} texto={f.nombre} detalle={f.zona} dato={f.dato} />)}</Grupo>
      </Hoja>
      <Hoja abierta={hojaCasa} titulo="Ya no alcanza ni la corta" onCerrar={() => setHojaCasa(false)}>
        <p className="t-cuerpo tenue">Las pesas terminarían después de las {formatoHora(minutosDe(settings.horaTope))}. Queda casa, 12 minutos, o la corta de todas formas.</p>
        <Grupo>
          {casaDisponible(sesiones, ahora, sets) && <Fila texto="Casa, 12 minutos" detalle={`Llevas ${casaHechas} de ${CASA_MAX} esta semana`} onClick={() => { setHojaCasa(false); onEmpezar('CASA', 'completa') }} />}
          <Fila texto={`Corta de todas formas: ${toca}`} detalle="Jalón, press y laterales" onClick={() => { setHojaCasa(false); onEmpezar(toca, 'corta', false) }} />
        </Grupo>
      </Hoja>
      <Hoja abierta={hojaMover} titulo="Pierna con Frida" onCerrar={() => setHojaMover(false)}>
        <p className="t-cuerpo tenue">¿Qué día de esta semana? Mientras haya Frida, A y B no traen pierna.</p>
        <Grupo>
          {diasParaMoverFrida(ahora).map((f) => <Fila key={f} texto={`${DIAS_NOMBRE[desdeClave(f).getDay()]} ${fechaCorta(f)}`} dato={f === frida.planeada ? 'Planeado' : ''} onClick={() => moverFrida(f)} />)}
          <Fila texto="Esta semana no hay" detalle={`La siguiente ${toca} completa trae goblet a 3 series`} dato={frida.planeada === null ? 'Elegido' : ''} onClick={() => moverFrida(null)} />
        </Grupo>
      </Hoja>
      <RegistrarHoja datos={datos} ahora={ahora} abierta={registrar} onCerrar={() => setRegistrar(false)} onGuardado={(s, reemplazada) => setAccion({ texto: `${textoDia(s.fecha)}: ${s.tipo === 'FRIDA' ? 'Frida' : s.tipo === 'CASA' ? 'casa' : s.tipo} registrada.`, deshacer: async () => { if (reemplazada) await datos.guardarSesion(reemplazada); else await datos.borrarSesion(s.id) } })} />
    </div>
  )
}

/** "Pon al día tu semana" (RUTINA-FINAL.md, 2.5): la primera vez, los días de esta semana hasta hoy con los mismos botones por día */
function PonAlDia({ datos, ahora }: { datos: Datos; ahora: Date }) {
  const { sesiones, sets, settings } = datos
  const claveHoy = claveFecha(ahora)
  const dias = useMemo(() => diasDeSemanaHastaHoy(sesiones, sets, ahora), [sesiones, sets, ahora])
  const [sel, setSel] = useState<Record<string, Respuesta | null>>(() => Object.fromEntries(dias.map((d) => [d.fecha, d.registrado === 'CASA' ? null : d.registrado ?? (d.fecha === claveHoy ? null : 'no')])))
  async function listo() {
    const noFui = new Set(settings.noFui ?? [])
    let plan = settings.fridaPlan
    for (const d of dias) {
      const r = sel[d.fecha]
      if (r === null || r === undefined) continue
      const registrado = d.registrado === 'CASA' ? null : d.registrado
      if (r === registrado) continue
      const eraFrida = diaFridaPlaneado(plan, desdeClave(d.fecha)) === d.fecha
      if (eraFrida && r !== 'FRIDA') plan = { ...(plan ?? {}), [claveSemana(desdeClave(d.fecha))]: null }
      if (r === 'no') {
        noFui.add(d.fecha)
        for (const s of sesiones.filter((x) => x.fecha === d.fecha && x.tipo !== 'CASA')) await datos.borrarSesion(s.id)
        continue
      }
      noFui.delete(d.fecha)
      if (registrado === 'FRIDA' && r !== 'FRIDA') for (const s of sesiones.filter((x) => x.fecha === d.fecha && x.tipo === 'FRIDA')) await datos.borrarSesion(s.id)
      const arm = armarRegistro(sesiones, d.fecha, r, claveHoy)
      if ('sesion' in arm) await datos.guardarSesion(arm.sesion)
    }
    datos.setSettings({ ...settings, noFui: [...noFui], fridaPlan: plan, semanaAlDiaV5: true })
  }
  return (
    <div className="pantalla inicio inicio-aldia">
      <div className="inicio-arriba"><span className="t-nota tenue">Semana del {fechaCorta(dias[0].fecha)}</span></div>
      <div className="inicio-texto">
        <h1 className="t-titulo">Pon al día tu semana</h1>
        <p className="t-cuerpo tenue">Marca qué hiciste cada día. Lo que falte se puede cambiar en Historial.</p>
        <Grupo>
          {dias.map((d) => (
            <div key={d.fecha} className="fila dia-fila">
              <span className="fila-texto"><span className="t-cuerpo">{textoDia(d.fecha)}{d.fecha === claveHoy ? ', hoy' : ''}</span></span>
              <BotonesDia marcado={sel[d.fecha] ?? null} sinNo={d.fecha === claveHoy} onElegir={(r) => setSel((s) => ({ ...s, [d.fecha]: s[d.fecha] === r ? null : r }))} />
            </div>
          ))}
        </Grupo>
      </div>
      <div className="inicio-pie"><BotonPrincipal onClick={listo}>Listo</BotonPrincipal></div>
    </div>
  )
}
