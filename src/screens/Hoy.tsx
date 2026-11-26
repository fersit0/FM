import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, Version, Letra, Rota } from '../data/tipos'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { tocaSesion, contadores, textoContadores, avisoAyer, casaDeSemana, casaDisponible, CASA_MAX, cuenta, esClub, esHabil, habilSiguiente } from '../logic/semana'
import { diasSinRegistro, armarRegistro, visita, type DiaPendiente } from '../logic/registro'
import { duracionEstimada, duracionesDe } from '../logic/duracion'
import { estadoTiempo, estadoTiempoEnMinutos, estadoSiSalgo, versionParaHora, topeDe, MEDIODIA } from '../logic/horario'
import { tuSemana } from '../logic/tusemana'
import { porSesion } from '../logic/progresion'
import { unidadDe, incrementoDe, pesoDeSet, formatoPeso } from '../logic/unidades'
import { listaDe, itemDeRutina, nombreSesion, ZONA_NOMBRE, rutaDe } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, formatoHora, minutosDe, minutosAhora, sumarDias } from '../logic/fechas'
import { tocaRespaldo } from '../logic/respaldo'
import { Circulo, BotonPrincipal, BotonTexto, Hoja, Grupo, Fila, Pez, Deshacer, LineaPiezas } from '../components/fm'
import { BotonesDia, RegistrarHoja, textoDia, type Respuesta } from '../components/Registrar'
import { TuSemana } from '../components/TuSemana'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: Letra, version: Version) => void
  onSeguir: () => void
  onDescartar: () => void
  onAjustes: () => void
}
type Accion = { texto: string; deshacer: () => void | Promise<void> }
const ROTA: Rota[] = ['A', 'B']
/**
 * Qué muestra Hoy (MANANAS-30.md, 4): 'club' ofrece la sesión que toca; 'regadera', en la mañana de un día hábil cuando
 * ya no alcanza ni la corta ("Hoy solo regadera", con "Ya llegué"); 'sinclub', un día hábil que se quedó sin club ("Hoy
 * no hubo club", con "Sí fui" y "Voy en la noche"); 'hecha', ya hubo pesas en el club (una de club por día); 'visita',
 * llegó y solo se bañó; 'descanso', un día hábil en que dijo "Hoy descanso"; 'libre', sábado y domingo, sin plan.
 */
type Modo = 'club' | 'regadera' | 'sinclub' | 'hecha' | 'visita' | 'descanso' | 'libre'

/** 6.1 Inicio: círculo rojo cortado arriba a la derecha, texto abajo a la izquierda, Empezar. */
export function Hoy({ datos, ahora, sesionEnCurso, onEmpezar, onSeguir, onDescartar, onAjustes }: Props) {
  usePantalla('inicio')
  const { W, H } = useMedidas()
  const { sesiones, sets, settings } = datos
  const claveHoy = claveFecha(ahora)
  const dow = ahora.getDay()
  const minHoy = minutosAhora(ahora)
  const habil = esHabil(ahora)
  // rotación y contadores (MANANAS-30.md, 3 y 5)
  const toca = useMemo(() => tocaSesion(sesiones, ahora, sets, { desde: settings.v8Desde, elegida: settings.sesionElegida }), [sesiones, ahora, sets, settings.v8Desde, settings.sesionElegida])
  const piezasContadores = useMemo(() => textoContadores(contadores(sesiones, ahora, sets)), [sesiones, ahora, sets])
  const aviso = useMemo(() => avisoAyer(sesiones, sets, ahora, settings.v8Desde, settings.descansos), [sesiones, sets, ahora, settings.v8Desde, settings.descansos])
  const dias = useMemo(() => tuSemana(sesiones, sets, settings, ahora), [sesiones, sets, settings, ahora])
  // versión automática por hora, mañana o noche (MANANAS-30.md, 4)
  const listaCompleta = useMemo(() => listaDe(toca, 'completa'), [toca])
  const listaCorta = useMemo(() => listaDe(toca, 'corta'), [toca])
  const duraciones = useMemo(() => duracionesDe(toca), [toca])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings, duraciones), [ahora, settings, duraciones])
  // "Voy en la noche" ya dicho: lo de hoy se calcula para la noche
  const irNoche = settings.vaEnLaNoche === claveHoy
  const vaNoche = irNoche && tiempo.franja === 'manana'
  const tiempoNoche = useMemo(() => estadoTiempoEnMinutos(MEDIODIA, ahora, settings, duraciones), [ahora, settings, duraciones])
  // "Salgo de la oficina a las": solo cuenta para la noche, y mientras no haya llegado
  const siSalgo = settings.horaSalida && (tiempo.franja === 'noche' || vaNoche) ? estadoSiSalgo(settings.horaSalida, settings, duraciones, ahora) : null
  const conSalida = siSalgo && siSalgo.llegadaMin > minHoy ? siSalgo : null
  const versionAuto = conSalida ? conSalida.version : vaNoche ? tiempoNoche.version : tiempo.version
  const version: Version = versionAuto === 'completa' ? 'completa' : 'corta'
  const lista = version === 'corta' ? listaCorta : listaCompleta
  const minutos = useMemo(() => duracionEstimada(lista, version), [lista, version])
  const [hojaLista, setHojaLista] = useState(false)
  const [hojaCasa, setHojaCasa] = useState(false)
  const [hojaTarde, setHojaTarde] = useState(false)
  const [hojaPrefiero, setHojaPrefiero] = useState(false)
  const [registrar, setRegistrar] = useState(false)
  const [registrarFecha, setRegistrarFecha] = useState<string | undefined>(undefined)
  const [accion, setAccion] = useState<Accion | null>(null)
  const cerrarAccion = useCallback(() => setAccion(null), [])
  const [versionNueva, setVersionNueva] = useState(() => typeof window.fmActualizar === 'function')
  useEffect(() => {
    const f = () => setVersionNueva(true)
    window.addEventListener('fm:version-nueva', f)
    return () => window.removeEventListener('fm:version-nueva', f)
  }, [])
  const casaHechas = casaDeSemana(sesiones, ahora, sets)
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

  // días hábiles sin registro (MANANAS-30.md, 4): una pregunta por día, antes de armar la sesión de hoy
  const pendientes = useMemo(() => diasSinRegistro(sesiones, sets, settings, ahora), [sesiones, sets, settings, ahora])
  const pregunta: DiaPendiente | null = !sesionEnCurso && pendientes.length ? pendientes[0] : null
  // máximo una de club por día: ya hecha, Hoy ya no ofrece otra
  const clubDeHoy = sesiones.find((s) => s.fecha === claveHoy && esClub(s.tipo) && cuenta(s, sets))
  const visitaHoy = sesiones.some((s) => s.fecha === claveHoy && s.tipo === 'VISITA')
  // después de la última pesa de la noche (21:15; el domingo 18:45) ya no hay club hoy; el lunes en la tarde no abre
  const pasoLaNoche = tiempo.franja === 'noche' && tiempo.minutosParaTope <= 0
  const hayNoche = habil && dow !== 1 && !pasoLaNoche
  const elegidaHoy = settings.sesionElegida?.fecha === claveHoy
  const descansoHoy = !!settings.descansos?.includes(claveHoy)
  let modo: Modo = 'club'
  if (sesionEnCurso) modo = 'club'
  else if (clubDeHoy) modo = 'hecha'
  else if (!habil) modo = elegidaHoy && !pasoLaNoche ? 'club' : 'libre'
  else if (descansoHoy) modo = 'descanso'
  else if (irNoche && hayNoche) modo = 'club'
  else if (visitaHoy) modo = 'visita'
  else if (tiempo.franja === 'manana' && minHoy < minutosDe(settings.salidaManana)) modo = tiempo.version === 'regadera' ? 'regadera' : 'club'
  else modo = elegidaHoy && hayNoche ? 'club' : 'sinclub'
  const ofrecerCasa = !sesionEnCurso && !clubDeHoy && tiempo.franja === 'noche' && casaDisponible(sesiones, ahora, sets) && (modo === 'libre' || (modo === 'club' && versionAuto === 'casa'))

  /** Contesta por un día hábil sin registro: pesas (la que tocaba), solo regadera o no fui */
  async function contestar(d: DiaPendiente, r: Respuesta) {
    const antes = settings
    if (r === 'no') {
      datos.setSettings({ ...settings, noFui: [...(settings.noFui ?? []).filter((x) => x !== d.fecha), d.fecha] })
      setAccion({ texto: `${textoDia(d.fecha)}: no fuiste.`, deshacer: () => datos.setSettings(antes) })
      return
    }
    const arm = armarRegistro(sesiones, d.fecha, r === 'VISITA' ? 'VISITA' : d.sugerida, claveHoy, undefined, { momento: 'manana' })
    if ('error' in arm) return
    await datos.guardarSesion(arm.sesion)
    setAccion({ texto: `${textoDia(d.fecha)}: ${r === 'VISITA' ? 'solo regadera' : d.sugerida} registrada.`, deshacer: async () => { if (arm.reemplaza) await datos.guardarSesion(arm.reemplaza); else await datos.borrarSesion(arm.sesion.id) } })
  }
  /** "Hoy prefiero B": cambia la sesión de hoy con un toque; la rotación sigue desde la que se haga */
  function preferir(tipo: Rota) {
    const antes = settings
    datos.setSettings({ ...settings, sesionElegida: { fecha: claveHoy, tipo } })
    setHojaPrefiero(false)
    setAccion({ texto: `Hoy ${tipo}.`, deshacer: () => datos.setSettings(antes) })
  }
  /** "Voy en la noche" se queda como plan del día */
  function voyEnLaNoche() {
    const antes = settings
    datos.setSettings({ ...settings, vaEnLaNoche: claveHoy })
    setAccion({ texto: 'Vas en la noche.', deshacer: () => datos.setSettings(antes) })
  }
  /** "Hoy descanso": hoy no va (enfermo, por ejemplo) y mañana no sale el aviso de ayer. La rotación y los contadores no cambian. */
  function hoyDescanso() {
    const antes = settings
    datos.setSettings({ ...settings, descansos: [...(settings.descansos ?? []).filter((x) => x !== claveHoy), claveHoy] })
    setAccion({ texto: 'Hoy descansas.', deshacer: () => datos.setSettings(antes) })
  }
  /** "Ya llegué" y "Solo regadera hoy": la visita, una por día, con la hora real (MANANAS-30.md, 4) */
  async function yaLlegue() {
    setHojaTarde(false)
    const v = visita(claveHoy, Date.now())
    await datos.guardarSesion(v)
    setAccion({ texto: 'Llegaste. Solo regadera: cuenta.', deshacer: () => datos.borrarSesion(v.id) })
  }
  function abrirRegistrar(fecha?: string) {
    setRegistrarFecha(fecha)
    setRegistrar(true)
  }
  /**
   * Empezar: la versión se decide con la hora real al tocar. En la mañana, si ya no alcanza ni la corta, solo regadera
   * (o la corta de todas formas); en la noche, CASA.
   */
  function empezar() {
    const v = versionParaHora(new Date(), duraciones, settings)
    if (v === 'regadera') { setHojaTarde(true); return }
    if (v === 'casa' || v === 'cerrado') { setHojaCasa(true); return }
    onEmpezar(toca, v)
  }

  let linea: string
  if (conSalida) linea = `Sales a las ${formatoHora(minutosDe(settings.horaSalida!))}: ${conSalida.version === 'casa' ? 'ya no alcanza ni la corta' : `alcanza la ${conSalida.version === 'corta' ? 'corta' : 'completa'}`}.`
  else if (vaNoche) linea = `En la noche: ${tiempoNoche.detalle.charAt(0).toLowerCase()}${tiempoNoche.detalle.slice(1)}`
  else if (tiempo.version !== 'completa' && tiempo.version !== 'corta') linea = `${tiempo.titulo} ${tiempo.detalle}`
  else if (!tiempo.recortada && tiempo.minutosParaTope > 180) linea = ''
  else linea = tiempo.detalle
  const nombreVersion = versionAuto === 'completa' || versionAuto === 'corta' ? versionAuto : 'corta de todas formas'
  // lo que sigue: "Mañana: B", o "El lunes: B" si mañana no es día hábil. La rotación solo se mueve con lo hecho.
  const sigue = habilSiguiente(ahora)
  const tocaSigue = tocaSesion(sesiones, sigue, sets, { desde: settings.v8Desde })
  const textoSigue = `${claveFecha(sigue) === claveFecha(sumarDias(ahora, 1)) ? 'Mañana' : `El ${DIAS_NOMBRE[sigue.getDay()]}`}: ${tocaSigue}.`
  const tituloSesion = sesionEnCurso
    ? (sesionEnCurso.tipo === 'CASA' ? 'Casa' : sesionEnCurso.tipo === 'FRIDA' || sesionEnCurso.tipo === 'VISITA' ? 'Sesión' : `${sesionEnCurso.tipo}: ${nombreSesion(sesionEnCurso.tipo)}`)
    : `${toca}: ${nombreSesion(toca)}`
  const tituloModo: Record<Exclude<Modo, 'club'>, { titulo: string; nota: string }> = {
    regadera: { titulo: 'Hoy solo regadera', nota: `Para pesas ya no alcanza. Llegar cuenta. ${textoSigue}` },
    sinclub: { titulo: 'Hoy no hubo club', nota: textoSigue },
    hecha: { titulo: `${clubDeHoy?.tipo ?? ''} hecha`, nota: textoSigue },
    visita: { titulo: 'Llegaste', nota: `Solo regadera: cuenta como ida al club. ${textoSigue}` },
    descanso: { titulo: 'Descanso', nota: textoSigue },
    libre: { titulo: 'Libre', nota: pasoLaNoche ? textoSigue : `Si vas al club, va la ${toca} y cuenta. ${textoSigue}` },
  }
  // la pregunta por un día sin registro va primero; luego lo del día
  const pantallaClub = !pregunta
  const ofrecerRegadera = pantallaClub && !sesionEnCurso && modo === 'club' && tiempo.franja === 'manana' && habil && !visitaHoy
  const ofrecerDescanso = pantallaClub && !sesionEnCurso && habil && (modo === 'club' || modo === 'regadera' || modo === 'sinclub')
  // el círculo rojo nunca queda debajo del texto: si el texto le queda cerca (pantallas bajas, línea larga), se hace más
  // chico y, si no basta, sube; sigue arriba a la derecha, cortado. El texto no depende del círculo, así que no brinca.
  const textoRef = useRef<HTMLDivElement>(null)
  const [textoArriba, setTextoArriba] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = textoRef.current
    if (el && el.offsetTop !== textoArriba) setTextoArriba(el.offsetTop)
  })
  const circulo = useMemo(() => {
    let r = 0.31 * W, cy = 0.11 * H
    const tope = textoArriba === null ? Infinity : textoArriba - 12
    if (cy + r > tope) { r = Math.max(0.2 * W, tope - cy); if (cy + r > tope) cy = tope - r }
    return { r, cy }
  }, [W, H, textoArriba])
  // el pez nunca sobre el círculo: si ya no cabe entre el círculo y el texto, no sale. El renglón le deja su lugar aunque
  // no salga, para que esconderlo no mueva el texto (y no vuelva a caber y a salir)
  const lugarPez = pantallaClub && modo === 'club' && versionAuto !== 'completa' && !sesionEnCurso
  const conPez = lugarPez && textoArriba !== null && textoArriba - 30 >= circulo.cy + circulo.r + 4
  // "Ajustes" en tinta cuando cae sobre el círculo rojo; en piedra si el círculo se movió y ya no queda debajo
  const arribaRef = useRef<HTMLDivElement>(null)
  const [ajustesSobreRojo, setAjustesSobreRojo] = useState(true)
  useLayoutEffect(() => {
    const b = arribaRef.current?.querySelector('button')?.getBoundingClientRect()
    const c = arribaRef.current?.parentElement?.querySelector(':scope > .circulo')?.getBoundingClientRect()
    if (!b || !c) return
    const dentro = Math.hypot((b.left + b.right) / 2 - (c.left + c.right) / 2, (b.top + b.bottom) / 2 - (c.top + c.bottom) / 2) < c.width / 2 - 4
    if (dentro !== ajustesSobreRojo) setAjustesSobreRojo(dentro)
  })


  return (
    <div className="pantalla inicio">
      <Circulo d={2 * circulo.r} style={{ position: 'absolute', left: 0.83 * W, top: circulo.cy, transform: 'translate(-50%, -50%)' }} />
      <div className="inicio-arriba" ref={arribaRef}>
        <span />
        <BotonTexto onClick={onAjustes} className={ajustesSobreRojo ? 'sobre-rojo' : ''}>Ajustes</BotonTexto>
      </div>

      <div className="inicio-texto" ref={textoRef}>
        {pregunta ? (
          <>
            <p className="t-sub">Antes de armar la sesión</p>
            <h1 className="t-inicio">¿Fuiste al club el {textoDia(pregunta.fecha)}?</h1>
            <p className="t-unidad tenue inicio-nota">Tocaba {pregunta.sugerida}. Un toque y listo; se puede cambiar en Historial.</p>
          </>
        ) : (
          <>
            {/* el único aviso (MANANAS-30.md, 5): solo mientras hoy todavía se puede ir */}
            {aviso && !sesionEnCurso && (modo === 'club' || modo === 'regadera') && <p className="t-nota inicio-aviso">{aviso}</p>}
            <LineaPiezas className={`t-nota tenue inicio-linea${lugarPez ? ' con-pez' : ''}`} piezas={sesionEnCurso ? ['Sesión a medias', ...piezasContadores] : piezasContadores} />
            {conPez && <Pez expresion="picaro" tamano={72} style={{ right: 0, top: -30 }} />}
            <TuSemana dias={dias} onDia={abrirRegistrar} />
            <h1 className="t-inicio">{modo === 'club' ? tituloSesion : tituloModo[modo].titulo}</h1>
            <div style={{ position: 'relative' }}>
              {modo === 'club' ? (
                <button className="t-unidad tenue inicio-nota" onClick={() => setHojaLista(true)}>
                  {/* con la línea de la hora, la versión ya va en ella: "4 ejercicios, unos 30 min. Completa si empiezas a las 7:40 am o antes." */}
                  {sesionEnCurso ? `Empezaste hace ${Math.max(1, Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000))} min.` : `${lista.length} ejercicios, unos ${minutos} min${linea ? `. ${linea}` : ` · ${nombreVersion}`}`}
                </button>
              ) : (
                <p className="t-unidad tenue inicio-nota">{tituloModo[modo].nota}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="inicio-pie">
        {/* el aviso de Deshacer, arriba de los botones: los empuja hacia arriba, nunca los tapa */}
        <div className="aviso-lugar de-pantalla" data-al-fondo />
        {versionNueva && <button className="inicio-linea-roja" onClick={() => window.fmActualizar?.()}>Hay versión nueva. Toca para actualizar.</button>}
        {pregunta && <BotonesDia letra={pregunta.sugerida} onElegir={(r) => contestar(pregunta, r)} />}
        {recordarRespaldo && <BotonTexto onClick={onAjustes}>{settings.ultimoRespaldo ? 'Ya pasaron 2 semanas del último respaldo. Descárgalo en Ajustes.' : 'Descarga tu primer respaldo en Ajustes.'}</BotonTexto>}
        {pantallaClub && !sesionEnCurso && (
          <div className="botones-fila" style={{ justifyContent: 'center' }}>
            {modo === 'club' && <BotonTexto onClick={() => setHojaPrefiero(true)}>Hoy prefiero…</BotonTexto>}
            {modo === 'sinclub' && <BotonTexto onClick={() => abrirRegistrar(claveHoy)}>Sí fui</BotonTexto>}
            {(modo === 'sinclub' || modo === 'visita' || modo === 'regadera') && hayNoche && !irNoche && <BotonTexto onClick={voyEnLaNoche}>Voy en la noche</BotonTexto>}
            {modo !== 'sinclub' && <BotonTexto onClick={() => abrirRegistrar()}>Registrar sesión</BotonTexto>}
          </div>
        )}
        {/* en las mañanas, siempre a la mano (MANANAS-30.md, 4); "Hoy descanso" en un día hábil sin club. En su propio renglón para que nada se parta en dos líneas */}
        {(ofrecerRegadera || ofrecerDescanso) && (
          <div className="botones-fila" style={{ justifyContent: 'center' }}>
            {ofrecerRegadera && <BotonTexto onClick={yaLlegue}>Solo regadera hoy</BotonTexto>}
            {ofrecerDescanso && <BotonTexto onClick={hoyDescanso}>Hoy descanso</BotonTexto>}
          </div>
        )}
        {ofrecerCasa && <BotonTexto onClick={() => onEmpezar('CASA', 'completa')}>Casa, 12 minutos. Llevas {casaHechas} de {CASA_MAX}.</BotonTexto>}
        {sesionEnCurso ? (
          <>
            <BotonPrincipal onClick={onSeguir}>Seguir sesión</BotonPrincipal>
            <BotonTexto onClick={() => confirm('¿Descartar la sesión a medias?') && onDescartar()}>Descartar</BotonTexto>
          </>
        ) : pantallaClub && modo === 'club' ? (
          <BotonPrincipal onClick={empezar}>{versionAuto !== 'completa' && versionAuto !== 'corta' && !conSalida && !vaNoche ? 'Empezar de todas formas' : 'Empezar'}</BotonPrincipal>
        ) : pantallaClub && modo === 'regadera' ? (
          <>
            <BotonPrincipal onClick={yaLlegue}>Ya llegué</BotonPrincipal>
            <BotonTexto onClick={() => onEmpezar(toca, 'corta')}>Hacer la corta de {toca} igual</BotonTexto>
          </>
        ) : pantallaClub && modo === 'libre' && !pasoLaNoche ? (
          <BotonTexto onClick={empezar}>Empezar {toca} igual</BotonTexto>
        ) : null}
      </div>

      {accion && <Deshacer clave={accion} texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={cerrarAccion} />}

      <Hoja abierta={hojaLista} titulo={tituloSesion} onCerrar={() => setHojaLista(false)}>
        <p className="t-nota tenue">{rutaDe(lista).map((z) => ZONA_NOMBRE[z]).join(' → ')}</p>
        <Grupo>{filas.map((f, i) => <Fila key={f.id} num={i + 1} texto={f.nombre} detalle={f.zona} dato={f.dato} />)}</Grupo>
      </Hoja>
      <Hoja abierta={hojaPrefiero} titulo="Hoy prefiero" onCerrar={() => setHojaPrefiero(false)}>
        <p className="t-cuerpo tenue">Cambia la sesión de hoy con un toque. La rotación sigue desde la que hagas.</p>
        <Grupo>
          {ROTA.map((t) => <Fila key={t} texto={`${t}: ${nombreSesion(t)}`} detalle={listaDe(t).map((e) => e.nombre.toLowerCase()).join(', ')} dato={t === toca ? 'Hoy' : ''} onClick={() => preferir(t)} />)}
        </Grupo>
      </Hoja>
      <Hoja abierta={hojaTarde} titulo="Ya no alcanza en la mañana" onCerrar={() => setHojaTarde(false)}>
        <p className="t-cuerpo tenue">Las pesas terminarían después de las {formatoHora(topeDe(new Date(), settings, 'manana') ?? 0)}. Hoy solo regadera: llegar cuenta.</p>
        <Grupo>
          <Fila texto="Ya llegué: solo regadera" detalle="Cuenta como ida al club" onClick={yaLlegue} />
          <Fila texto={`Corta de todas formas: ${toca}`} detalle={listaCorta.map((e) => e.nombre.toLowerCase()).join(', ')} onClick={() => { setHojaTarde(false); onEmpezar(toca, 'corta') }} />
        </Grupo>
      </Hoja>
      <Hoja abierta={hojaCasa} titulo={tiempo.franja === 'cerrado' ? 'El club ya cerró' : 'Ya no alcanza ni la corta'} onCerrar={() => setHojaCasa(false)}>
        <p className="t-cuerpo tenue">{tiempo.franja === 'cerrado' ? 'Los lunes abre de 7 a 11. Queda casa, 12 minutos.' : `Las pesas terminarían después de las ${formatoHora(topeDe(new Date(), settings) ?? minutosDe(settings.ultimaPesaNoche))}. Queda casa, 12 minutos, o la corta de todas formas.`}</p>
        <Grupo>
          {casaDisponible(sesiones, ahora, sets) && <Fila texto="Casa, 12 minutos" detalle={`Llevas ${casaHechas} de ${CASA_MAX} esta semana`} onClick={() => { setHojaCasa(false); onEmpezar('CASA', 'completa') }} />}
          {tiempo.franja !== 'cerrado' && <Fila texto={`Corta de todas formas: ${toca}`} detalle={listaCorta.map((e) => e.nombre.toLowerCase()).join(', ')} onClick={() => { setHojaCasa(false); onEmpezar(toca, 'corta') }} />}
        </Grupo>
      </Hoja>
      <RegistrarHoja datos={datos} ahora={ahora} abierta={registrar} fecha={registrarFecha} onCerrar={() => setRegistrar(false)} onGuardado={(s, reemplazada) => setAccion({ texto: `${textoDia(s.fecha)}: ${s.tipo === 'FRIDA' ? `Frida ${s.fridaTipo ?? 'torso'}` : s.tipo === 'CASA' ? 'casa' : s.tipo === 'VISITA' ? 'solo regadera' : s.tipo} registrada.`, deshacer: async () => { if (reemplazada) await datos.guardarSesion(reemplazada); else await datos.borrarSesion(s.id) } })} />
    </div>
  )
}
