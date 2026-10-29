import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, Version, Letra, Club, FridaTipo } from '../data/tipos'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { estadoSemana, elegirSesion, ultimaPropia, avisoSemana, textoEleccion, casaDeSemana, casaDisponible, CASA_MAX, estadoFrida, fridaDeSemana, fridaPiernaEnSemana, diasParaMoverFrida, diasDeLaSemana, claveSemana, diaFridaPlaneado, semanaSinFrida, cuenta } from '../logic/semana'
import { diasSinRegistro, diasDeSemanaHastaHoy, armarRegistro, textoUltima, textoFrida, sugeridaPara, preguntarNoche, momentoPorDefecto, type DiaPendiente } from '../logic/registro'
import { duracionEstimada, minutosHastaUltimaPesa } from '../logic/duracion'
import { estadoTiempo, estadoTiempoEnMinutos, estadoSiSalgo, versionParaHora, topeDe, limites, MEDIODIA, type Duraciones } from '../logic/horario'
import { tuSemana } from '../logic/tusemana'
import { porSesion } from '../logic/progresion'
import { unidadDe, incrementoDe, pesoDeSet, formatoPeso } from '../logic/unidades'
import { listaDe, itemDeRutina, nombreSesion, ZONA_NOMBRE, rutaDe } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, formatoHora, minutosDe, minutosAhora, fechaCorta, desdeClave, sumarDias } from '../logic/fechas'
import { tocaRespaldo } from '../logic/respaldo'
import { Circulo, BotonPrincipal, BotonTexto, Hoja, Grupo, Fila, Pez, Deshacer } from '../components/fm'
import { BotonesDia, RegistrarHoja, textoDia, type Respuesta } from '../components/Registrar'
import { TuSemana } from '../components/TuSemana'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: Letra, version: Version, sinPierna?: boolean) => void
  onSeguir: () => void
  onDescartar: () => void
  onAjustes: () => void
}
type Accion = { texto: string; deshacer: () => void | Promise<void> }
const CLUB: Club[] = ['A', 'B', 'C']
/**
 * Qué muestra Hoy según el día (RUTINA-FINAL.md v7, 2): la sesión, o el lunes en la mañana cardio, el miércoles descanso,
 * el sábado libre, el viernes con la semana completa sauna, el lunes en la tarde el club cerrado; ya hecha la de club del
 * día, 'hecha' (una de club por día); con "Hoy no", 'hoyno'
 */
type Modo = 'club' | 'cardio' | 'descanso' | 'libre' | 'completa' | 'cerrado' | 'hecha' | 'hoyno'

/** 6.1 Inicio: círculo rojo cortado arriba a la derecha, texto abajo a la izquierda, Empezar. */
export function Hoy({ datos, ahora, sesionEnCurso, onEmpezar, onSeguir, onDescartar, onAjustes }: Props) {
  usePantalla('inicio')
  const { W, H } = useMedidas()
  const { sesiones, sets, settings } = datos
  const claveHoy = claveFecha(ahora)
  const dow = ahora.getDay()
  const domingo = dow === 0
  const minHoy = minutosAhora(ahora)
  const semana = useMemo(() => estadoSemana(sesiones, ahora, sets), [sesiones, ahora, sets])
  // Frida y elección de la sesión de club (RUTINA-FINAL.md v7, 2)
  const frida = useMemo(() => estadoFrida(sesiones, settings.fridaPlan, ahora, sets), [sesiones, settings.fridaPlan, ahora, sets])
  const sinFrida = useMemo(() => semanaSinFrida(sesiones, settings.fridaPlan, ahora, sets), [sesiones, settings.fridaPlan, ahora, sets])
  const fridaSemana = useMemo(() => fridaDeSemana(sesiones, ahora, sets), [sesiones, ahora, sets])
  const eleccion = useMemo(() => elegirSesion(sesiones, settings.fridaPlan, ahora, sets, settings.sesionElegida), [sesiones, settings.fridaPlan, ahora, sets, settings.sesionElegida])
  const { tipo: toca, sinPierna } = eleccion
  const ultima = useMemo(() => ultimaPropia(sesiones, sets), [sesiones, sets])
  const aviso = useMemo(() => avisoSemana(sesiones, settings.fridaPlan, ahora, sets, settings.noFui), [sesiones, settings.fridaPlan, ahora, sets, settings.noFui])
  const dias = useMemo(() => tuSemana(sesiones, sets, settings, ahora), [sesiones, sets, settings, ahora])
  // versión automática por hora, mañana o noche (RUTINA-FINAL.md v7, 3)
  const listaCompleta = useMemo(() => listaDe(toca, 'completa', sinPierna), [toca, sinPierna])
  const listaCorta = useMemo(() => listaDe(toca, 'corta', sinPierna), [toca, sinPierna])
  const duraciones = useMemo<Duraciones>(() => ({ completa: minutosHastaUltimaPesa(listaCompleta, 'completa'), corta: minutosHastaUltimaPesa(listaCorta, 'corta') }), [listaCompleta, listaCorta])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings, duraciones), [ahora, settings, duraciones])
  // "Voy en la noche" ya dicho: lo de hoy se calcula para la noche
  const vaNoche = settings.vaEnLaNoche === claveHoy && tiempo.franja === 'manana'
  const tiempoNoche = useMemo(() => estadoTiempoEnMinutos(MEDIODIA, ahora, settings, duraciones), [ahora, settings, duraciones])
  // en la mañana, ya sin tiempo: Hoy dice "Ya no alcanza en la mañana" y la sesión se arma para la noche
  const noAlcanzaManana = tiempo.version === 'noche' && !vaNoche
  // "Salgo de la oficina a las": solo cuenta para la noche, y mientras no haya llegado
  const siSalgo = settings.horaSalida && (tiempo.franja === 'noche' || vaNoche) ? estadoSiSalgo(settings.horaSalida, settings, duraciones, ahora) : null
  const conSalida = siSalgo && siSalgo.llegadaMin > minHoy ? siSalgo : null
  const versionAuto = conSalida ? conSalida.version : vaNoche || noAlcanzaManana ? tiempoNoche.version : tiempo.version
  const version: Version = versionAuto === 'completa' ? 'completa' : 'corta'
  const lista = version === 'corta' ? listaCorta : listaCompleta
  const minutos = useMemo(() => duracionEstimada(lista, version), [lista, version])
  const [hojaLista, setHojaLista] = useState(false)
  const [hojaCasa, setHojaCasa] = useState(false)
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
  const sinGym = dow === 5 || dow === 6
  const [hojaMover, setHojaMover] = useState(false)
  const [verSesionHoy, setVerSesionHoy] = useState(false)
  const [nota, setNota] = useState('')
  // "Fui con Frida": no se guarda nada hasta elegir Pierna o Torso (RUTINA-FINAL.md v7, 2.2)
  const [fridaPara, setFridaPara] = useState<{ fecha: string; nota?: string } | null>(null)
  // al tocar Empezar en la mañana cuando ya no alcanza: "¿Vas en la noche?"
  const [forzarNoche, setForzarNoche] = useState(false)
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

  // Registro de sesiones (RUTINA-FINAL.md, 2): pon al día la semana una vez; luego, si el día de Frida pasó sin respuesta,
  // "¿Fuiste con Frida el…?"; luego una pregunta por cada día de gym sin registro
  const alDia = !settings.semanaAlDiaV6
  const preguntaFrida = !alDia && !sesionEnCurso ? frida.pendiente : null
  const pendientes = useMemo(() => diasSinRegistro(sesiones, sets, settings, ahora).filter((d) => d.fecha !== frida.pendiente), [sesiones, sets, settings, ahora, frida.pendiente])
  const pregunta: DiaPendiente | null = !alDia && !preguntaFrida && pendientes.length ? pendientes[0] : null
  // "¿Vas en la noche?" (RUTINA-FINAL.md v7, 2.4)
  const vasNoche = !sesionEnCurso && !alDia && !preguntaFrida && !pregunta && (forzarNoche || preguntarNoche(ahora, sesiones, sets, settings))
  // Frida: el día planeado, salvo el lunes en la mañana (cardio) o martes y jueves en la mañana (pesas; Frida es en la noche)
  const lunesManana = dow === 1 && minHoy < MEDIODIA
  const pesasManana = (dow === 2 || dow === 4) && minHoy < MEDIODIA
  const pantallaFrida = !sesionEnCurso && !alDia && !preguntaFrida && !pregunta && !vasNoche && frida.hoyEsFrida && !verSesionHoy && !lunesManana && !pesasManana
  // máximo una de club por día (RUTINA-FINAL.md v7, 2): ya hecha, Hoy ya no ofrece otra
  const clubDeHoy = sesiones.find((s) => s.fecha === claveHoy && (s.tipo === 'A' || s.tipo === 'B' || s.tipo === 'C') && cuenta(s, sets))
  let modo: Modo = 'club'
  if (!sesionEnCurso && clubDeHoy) modo = 'hecha'
  else if (!sesionEnCurso && settings.sesionElegida?.fecha !== claveHoy && !verSesionHoy) {
    if (settings.noFui?.includes(claveHoy)) modo = 'hoyno'
    else if (lunesManana) modo = 'cardio'
    else if (dow === 1) modo = 'cerrado'
    else if (dow === 3) modo = 'descanso'
    else if (dow === 6) modo = 'libre'
    else if (dow === 5 && semana.hechas >= semana.meta) modo = 'completa'
  }
  // en la mañana no se ofrece CASA (RUTINA-FINAL.md v7, 3)
  const ofrecerCasa = !sesionEnCurso && modo === 'club' && tiempo.franja === 'noche' && casaDisponible(sesiones, ahora, sets) && (versionAuto === 'casa' || sinGym)

  /** Contesta por un día: registra A, B, C o Frida (con su tipo), o lo marca "No fui". En el día planeado de Frida, lo que no sea Frida deja la semana sin Frida. */
  async function contestar(fecha: string, r: Respuesta, notaFrida?: string, fridaTipo?: FridaTipo) {
    if (r === 'FRIDA' && !fridaTipo) { setFridaPara({ fecha, nota: notaFrida }); return }
    const semanaDe = claveSemana(desdeClave(fecha))
    const eraFrida = diaFridaPlaneado(settings.fridaPlan, desdeClave(fecha)) === fecha
    const antes = settings
    const plan = eraFrida && r !== 'FRIDA' ? { ...(settings.fridaPlan ?? {}), [semanaDe]: null } : settings.fridaPlan
    if (r === 'no') {
      datos.setSettings({ ...settings, fridaPlan: plan, noFui: [...(settings.noFui ?? []).filter((d) => d !== fecha), fecha] })
      setAccion({ texto: eraFrida ? `${textoDia(fecha)}: sin Frida. Esta semana entra C.` : `${textoDia(fecha)}: no fuiste.`, deshacer: () => datos.setSettings(antes) })
      return
    }
    const arm = armarRegistro(sesiones, fecha, r, claveHoy, notaFrida?.trim() || undefined, { fridaTipo, momento: momentoPorDefecto(fecha, settings.fridaPlan, r) })
    if ('error' in arm) return
    await datos.guardarSesion(arm.sesion)
    datos.setSettings({ ...settings, fridaPlan: plan, noFui: (settings.noFui ?? []).filter((d) => d !== fecha) })
    setNota('')
    setFridaPara(null)
    setAccion({ texto: `${textoDia(fecha)}: ${r === 'FRIDA' ? `Frida ${fridaTipo}` : r} registrada.`, deshacer: async () => { if (arm.reemplaza) await datos.guardarSesion(arm.reemplaza); else await datos.borrarSesion(arm.sesion.id); datos.setSettings(antes) } })
  }
  function moverFrida(fecha: string | null) {
    const antes = settings
    datos.setSettings({ ...settings, fridaPlan: { ...(settings.fridaPlan ?? {}), [claveSemana(ahora)]: fecha } })
    setHojaMover(false)
    setAccion({ texto: fecha ? `Frida: ${textoDia(fecha)}.` : 'Esta semana sin Frida: entra C.', deshacer: () => datos.setSettings(antes) })
  }
  /** "Hoy prefiero A": cambia la sesión de hoy con un toque; la elección se recalcula después */
  function preferir(tipo: Club) {
    const antes = settings
    datos.setSettings({ ...settings, sesionElegida: { fecha: claveHoy, tipo } })
    setHojaPrefiero(false)
    setAccion({ texto: `Hoy ${tipo}.`, deshacer: () => datos.setSettings(antes) })
  }
  /** "Voy en la noche" se queda como plan del día; "Hoy no" va a noFui y la semana se recalcula */
  function vasEnLaNoche(va: boolean) {
    const antes = settings
    setForzarNoche(false)
    if (va) datos.setSettings({ ...settings, vaEnLaNoche: claveHoy })
    else datos.setSettings({ ...settings, noFui: [...(settings.noFui ?? []).filter((d) => d !== claveHoy), claveHoy] })
    setAccion({ texto: va ? 'Vas en la noche.' : 'Hoy no. Tu semana se acomoda.', deshacer: () => datos.setSettings(antes) })
  }
  function abrirRegistrar(fecha?: string) {
    setRegistrarFecha(fecha)
    setRegistrar(true)
  }
  /**
   * Empezar: la versión se decide con la hora real al tocar. En la mañana, si ya no alcanza, "¿Vas en la noche?" (el
   * lunes no: en la noche el club no abre); en la noche, CASA. Con "Hoy no" dicho, empezar igual lo quita.
   */
  function empezar() {
    const real = new Date()
    const v = versionParaHora(real, duraciones, settings)
    if (v === 'noche' && real.getDay() !== 1) { setForzarNoche(true); return }
    if (v === 'noche' || v === 'casa' || v === 'cerrado') { setHojaCasa(true); return }
    if (settings.noFui?.includes(claveHoy)) datos.setSettings({ ...settings, noFui: settings.noFui.filter((d) => d !== claveHoy) })
    onEmpezar(toca, v, sinPierna)
  }

  // "Semana: 2 de 3" nunca se parte entre renglones
  const textoSemana = <span className="sin-partir">Semana: {semana.hechas} de {semana.meta}</span>
  const queToca = textoEleccion(eleccion)
  let linea: string
  if (conSalida) linea = `Sales a las ${formatoHora(minutosDe(settings.horaSalida!))}: ${conSalida.version === 'casa' ? 'ya no alcanza ni la corta' : `alcanza la ${conSalida.version === 'corta' ? 'corta' : 'completa'}`}.`
  else if (vaNoche) linea = `En la noche: ${tiempoNoche.detalle.charAt(0).toLowerCase()}${tiempoNoche.detalle.slice(1)}`
  else if (noAlcanzaManana) linea = dow === 1 ? `${tiempo.titulo} El lunes en la noche el club no abre.` : `${tiempo.titulo} ${tiempo.detalle}`
  else if (tiempo.version !== 'completa' && tiempo.version !== 'corta') linea = `${tiempo.titulo} ${tiempo.detalle}`
  else if (tiempo.minutosParaTope > 180) linea = ''
  else linea = tiempo.detalle
  const nombreVersion = versionAuto === 'completa' || versionAuto === 'corta' ? versionAuto : 'corta de todas formas'
  // lo que sigue en Tu semana: "Sigue B el jueves."
  const sigue = dias.find((d) => d.fecha > claveHoy && d.plan)
  const textoSigue = sigue ? `Sigue ${sigue.plan === 'F' ? 'Frida' : sigue.plan} el ${DIAS_NOMBRE[desdeClave(sigue.fecha).getDay()]}.` : semana.hechas >= semana.meta ? 'Semana completa.' : ''
  const letraHoy = clubDeHoy ? textoEleccion({ tipo: clubDeHoy.tipo as Club, sinPierna: !!clubDeHoy.sinPierna }) : ''
  const lineaArriba: ReactNode = modo === 'cardio'
    ? <>Hoy: cardio tranqui 25 min y sauna{frida.hoyEsFrida ? ' · en la noche, Frida' : ''}</>
    : modo === 'completa' ? <>Semana completa · hoy sauna</>
      : modo === 'club' ? <>Hoy toca {queToca}{eleccion.extra ? `, extra${domingo ? ' y opcional' : ''}` : ''} · {fridaSemana ? textoFrida(fridaSemana, DIAS_NOMBRE) : textoUltima(ultima, DIAS_NOMBRE)} · {textoSemana}</>
        : modo === 'hecha' ? <>Hoy: {letraHoy} hecha · {textoSemana}</>
          : <>{modo === 'descanso' ? 'Hoy descanso' : modo === 'libre' ? 'Sábado libre' : modo === 'hoyno' ? 'Hoy no vas' : 'El club abre los lunes de 7 a 11'} · {textoSemana}</>
  const tituloSesion = sesionEnCurso
    ? (sesionEnCurso.tipo === 'CASA' ? 'Casa' : sesionEnCurso.tipo === 'FRIDA' ? 'Frida' : `${sesionEnCurso.tipo}: ${nombreSesion(sesionEnCurso.tipo, sesionEnCurso.sinPierna)}`)
    : `${toca}: ${nombreSesion(toca, sinPierna)}`
  const manana = textoDia(claveFecha(sumarDias(ahora, 1)))
  const tituloModo: Record<Exclude<Modo, 'club'>, { titulo: string; nota: string }> = {
    cardio: { titulo: 'Cardio tranqui', nota: `25 min en la elíptica o caminadora, a ritmo de platicar, y sauna. Las pesas, mañana ${DIAS_NOMBRE[(dow + 1) % 7]}.` },
    descanso: { titulo: 'Descanso', nota: `Si vas igual, va la ${queToca} y cuenta.` },
    libre: { titulo: 'Libre', nota: 'Si entrenas, regístralo y cuenta.' },
    completa: { titulo: 'Semana completa', nota: `Hoy sauna. Si quieres pesas extra, va la ${queToca}.` },
    cerrado: { titulo: 'Club cerrado', nota: `Los lunes abre de 7 a 11. Mañana ${manana.split(' ')[0]} toca ${textoEleccion(elegirSesion(sesiones, settings.fridaPlan, sumarDias(ahora, 1), sets))}.` },
    hecha: { titulo: `${letraHoy} hecha`, nota: textoSigue },
    hoyno: { titulo: 'Hoy no', nota: `Tu semana se acomoda.${textoSigue ? ` ${textoSigue}` : ''}` },
  }
  // las preguntas y la pantalla de Frida van primero; luego "¿Vas en la noche?"; luego lo del día
  const pantallaClub = !preguntaFrida && !pregunta && !pantallaFrida && !vasNoche
  // el pez nunca sobre el círculo rojo: con la tira el texto sube y, si ya no cabe debajo del círculo, no sale
  const textoRef = useRef<HTMLDivElement>(null)
  const [pezCabe, setPezCabe] = useState(true)
  useLayoutEffect(() => {
    const el = textoRef.current
    if (el) setPezCabe(el.getBoundingClientRect().top - 30 >= 0.11 * H + 0.31 * W + 4)
  })
  // el renglón le deja su lugar aunque no salga, para que esconderlo no mueva el texto (y no vuelva a caber y a salir)
  const lugarPez = pantallaClub && modo === 'club' && versionAuto !== 'completa' && !sesionEnCurso
  const conPez = lugarPez && pezCabe
  const limNoche = limites(duraciones, topeDe(sumarDias(ahora, 0), settings, 'noche') ?? minutosDe(settings.ultimaPesaNoche))
  // con la hora de salida, mientras no haya llegado; ya en la tarde, lo que alcanza si empieza ya
  const siSaleHoy = settings.horaSalida ? estadoSiSalgo(settings.horaSalida, settings, duraciones, ahora) : null
  const queAlcanza = (v: string) => v === 'completa' ? 'alcanza la completa' : v === 'corta' ? 'alcanza la corta' : 'ya no alcanza ni la corta'
  const textoNoche = siSaleHoy && siSaleHoy.llegadaMin > minHoy
    ? `Si sales a las ${formatoHora(minutosDe(settings.horaSalida!))}, llegas ${formatoHora(siSaleHoy.llegadaMin)}: ${queAlcanza(siSaleHoy.version)}.`
    : minHoy >= MEDIODIA
      ? `Si empiezas ya, ${queAlcanza(tiempo.version)}: la completa hasta las ${formatoHora(limNoche.completa)} y la corta hasta las ${formatoHora(limNoche.corta)}.`
      : `En la noche alcanza la completa si empiezas a las ${formatoHora(limNoche.completa)} o antes, y la corta hasta las ${formatoHora(limNoche.corta)}.`

  if (alDia && !sesionEnCurso) return <PonAlDia datos={datos} ahora={ahora} />

  return (
    <div className="pantalla inicio">
      <Circulo d={0.62 * W} style={{ position: 'absolute', left: 0.83 * W, top: 0.11 * H, transform: 'translate(-50%, -50%)' }} />
      <div className="inicio-arriba">
        <span />
        <BotonTexto onClick={onAjustes}>Ajustes</BotonTexto>
      </div>

      <div className="inicio-texto" ref={textoRef}>
        {preguntaFrida ? (
          <>
            <p className="t-sub">Antes de armar la sesión</p>
            <h1 className="t-inicio">¿Fuiste con Frida el {textoDia(preguntaFrida)}?</h1>
            <p className="t-unidad tenue inicio-nota">Si no hubo, esta semana entra C (espalda y hombro).</p>
          </>
        ) : pregunta ? (
          <>
            <p className="t-sub">Antes de armar la sesión</p>
            <h1 className="t-inicio">¿Entrenaste el {textoDia(pregunta.fecha)}?</h1>
            <p className="t-unidad tenue inicio-nota">Tocaba {pregunta.sugerida === 'FRIDA' ? 'Frida' : pregunta.sugerida}. Un toque y listo; se puede cambiar en Historial.</p>
          </>
        ) : pantallaFrida ? (
          <>
            <p className="t-sub">Hoy vas con Frida</p>
            <TuSemana dias={dias} onDia={abrirRegistrar} />
            <h1 className="t-inicio">Pierna o torso</h1>
            <p className="t-unidad tenue inicio-nota">A su ritmo y con su app. Aquí solo se registra qué hicieron y cuenta para la semana.{aviso ? ` ${aviso}` : ''}</p>
            <input className="inicio-nota-frida" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota, opcional" aria-label="Nota" maxLength={80} />
          </>
        ) : vasNoche ? (
          <>
            <p className="t-sub">No fuiste en la mañana</p>
            <TuSemana dias={dias} onDia={abrirRegistrar} />
            <h1 className="t-inicio">{toca}: {nombreSesion(toca, sinPierna)}</h1>
            <p className="t-unidad tenue inicio-nota">{textoNoche}</p>
          </>
        ) : (
          <>
            <p className={`t-nota tenue inicio-linea${lugarPez ? ' con-pez' : ''}`}>{sesionEnCurso ? <>Sesión a medias · {textoSemana}</> : lineaArriba}</p>
            {conPez && <Pez expresion="picaro" tamano={72} style={{ right: 0, top: -30 }} />}
            <TuSemana dias={dias} onDia={abrirRegistrar} />
            <h1 className="t-inicio">{sesionEnCurso || modo === 'club' ? tituloSesion : tituloModo[modo].titulo}</h1>
            {modo === 'club' && !sesionEnCurso && sinPierna && <p className="t-nota tenue">Sin pierna: esta semana la hiciste con Frida.</p>}
            <div style={{ position: 'relative' }}>
              {sesionEnCurso || modo === 'club' ? (
                <button className="t-unidad tenue inicio-nota" onClick={() => setHojaLista(true)}>
                  {sesionEnCurso ? `Empezaste hace ${Math.max(1, Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000))} min.` : `${lista.length} ejercicios, unos ${minutos} min · ${nombreVersion}${linea ? `. ${linea}` : ''}${aviso ? ` ${aviso}` : ''}`}
                </button>
              ) : (
                <p className="t-unidad tenue inicio-nota">{tituloModo[modo].nota}{aviso ? ` ${aviso}` : ''}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="inicio-pie">
        {versionNueva && <button className="inicio-linea-roja" onClick={() => window.fmActualizar?.()}>Hay versión nueva. Toca para actualizar.</button>}
        {preguntaFrida && (
          <>
            <div className="botones-fila">
              <BotonPrincipal onClick={() => contestar(preguntaFrida, 'FRIDA', undefined, 'pierna')}>Pierna</BotonPrincipal>
              <BotonPrincipal onClick={() => contestar(preguntaFrida, 'FRIDA', undefined, 'torso')}>Torso</BotonPrincipal>
            </div>
            <div className="botones-fila" style={{ justifyContent: 'center' }}>
              <BotonTexto onClick={() => setHojaMover(true)}>Se movió a…</BotonTexto>
              <BotonTexto onClick={() => contestar(preguntaFrida, 'no')}>No hubo</BotonTexto>
            </div>
          </>
        )}
        {pregunta && <BotonesDia marcado={pregunta.sugerida} onElegir={(r) => contestar(pregunta.fecha, r)} />}
        {pantallaFrida && frida.planeada && (
          <>
            <BotonPrincipal onClick={() => setFridaPara({ fecha: frida.planeada!, nota })}>Fui con Frida</BotonPrincipal>
            <div className="botones-fila" style={{ justifyContent: 'center' }}>
              <BotonTexto onClick={() => setHojaMover(true)}>Se movió a…</BotonTexto>
              <BotonTexto onClick={() => contestar(frida.planeada!, 'no')}>No hubo</BotonTexto>
            </div>
            {tiempo.franja !== 'cerrado' && <BotonTexto onClick={() => setVerSesionHoy(true)}>Mejor hago {queToca} hoy</BotonTexto>}
          </>
        )}
        {vasNoche && (
          <>
            <BotonPrincipal onClick={() => vasEnLaNoche(true)}>Voy en la noche</BotonPrincipal>
            <div className="botones-fila" style={{ justifyContent: 'center' }}>
              <BotonTexto onClick={() => { setForzarNoche(false); abrirRegistrar(claveHoy) }}>Ya fui</BotonTexto>
              <BotonTexto onClick={() => vasEnLaNoche(false)}>Hoy no</BotonTexto>
            </div>
          </>
        )}
        {pantallaClub && !sesionEnCurso && !frida.hecha && <BotonTexto onClick={() => setHojaMover(true)}>{frida.planeada ? `Frida: ${textoDia(frida.planeada)}. Mover` : 'Esta semana sin Frida. Cambiar'}</BotonTexto>}
        {recordarRespaldo && <BotonTexto onClick={onAjustes}>{settings.ultimoRespaldo ? 'Ya pasaron 2 semanas del último respaldo. Descárgalo en Ajustes.' : 'Descarga tu primer respaldo en Ajustes.'}</BotonTexto>}
        {pantallaClub && !sesionEnCurso && (
          <div className="botones-fila" style={{ justifyContent: 'center' }}>
            {modo !== 'hecha' && <BotonTexto onClick={() => setHojaPrefiero(true)}>Hoy prefiero…</BotonTexto>}
            <BotonTexto onClick={() => abrirRegistrar()}>Registrar sesión</BotonTexto>
          </div>
        )}
        {ofrecerCasa && <BotonTexto onClick={() => onEmpezar('CASA', 'completa')}>Casa, 12 minutos. Llevas {casaHechas} de {CASA_MAX}.</BotonTexto>}
        {sesionEnCurso ? (
          <>
            <BotonPrincipal onClick={onSeguir}>Seguir sesión</BotonPrincipal>
            <BotonTexto onClick={() => confirm('¿Descartar la sesión a medias?') && onDescartar()}>Descartar</BotonTexto>
          </>
        ) : pantallaClub && modo === 'club' ? (
          <BotonPrincipal onClick={empezar}>{versionAuto !== 'completa' && versionAuto !== 'corta' && !conSalida && !vaNoche && !noAlcanzaManana ? 'Empezar de todas formas' : 'Empezar'}</BotonPrincipal>
        ) : pantallaClub && modo !== 'cerrado' && modo !== 'hecha' ? (
          <BotonTexto onClick={empezar}>{modo === 'completa' ? `Pesas extra: ${queToca}` : `Empezar ${queToca} igual`}</BotonTexto>
        ) : null}
      </div>

      {accion && <Deshacer clave={accion} texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={cerrarAccion} />}

      <Hoja abierta={fridaPara !== null} titulo="¿Qué hicieron?" onCerrar={() => setFridaPara(null)}>
        <p className="t-cuerpo tenue">Con Frida{fridaPara ? `, el ${textoDia(fridaPara.fecha)}` : ''}. Cambia lo que toca en la semana: con pierna, tu A sale sin pierna.</p>
        <div className="botones-fila">
          <BotonPrincipal onClick={() => fridaPara && contestar(fridaPara.fecha, 'FRIDA', fridaPara.nota, 'pierna')}>Pierna</BotonPrincipal>
          <BotonPrincipal onClick={() => fridaPara && contestar(fridaPara.fecha, 'FRIDA', fridaPara.nota, 'torso')}>Torso</BotonPrincipal>
        </div>
      </Hoja>
      <Hoja abierta={hojaLista} titulo={`${toca}: ${nombreSesion(toca, sinPierna)}`} onCerrar={() => setHojaLista(false)}>
        <p className="t-nota tenue">{rutaDe(lista).map((z) => ZONA_NOMBRE[z]).join(' → ')}</p>
        <Grupo>{filas.map((f, i) => <Fila key={f.id} num={i + 1} texto={f.nombre} detalle={f.zona} dato={f.dato} />)}</Grupo>
      </Hoja>
      <Hoja abierta={hojaPrefiero} titulo="Hoy prefiero" onCerrar={() => setHojaPrefiero(false)}>
        <p className="t-cuerpo tenue">Cambia la sesión de hoy con un toque. Mañana la app vuelve a elegir sola.</p>
        <Grupo>
          {CLUB.map((t) => <Fila key={t} texto={`${t}: ${nombreSesion(t, t === 'A' && fridaPiernaEnSemana(sesiones, ahora, sets))}`} detalle={semana.dias.some((d) => d.tipos.includes(t)) ? 'Ya la hiciste esta semana: sería extra' : t === 'C' && !sinFrida && !fridaPiernaEnSemana(sesiones, ahora, sets) ? 'Esta semana no toca, pero puedes' : undefined} dato={t === toca ? 'Hoy' : ''} onClick={() => preferir(t)} />)}
        </Grupo>
      </Hoja>
      <Hoja abierta={hojaCasa} titulo={tiempo.franja === 'cerrado' ? 'El club ya cerró' : tiempo.franja === 'manana' ? 'Ya no alcanza en la mañana' : 'Ya no alcanza ni la corta'} onCerrar={() => setHojaCasa(false)}>
        <p className="t-cuerpo tenue">{tiempo.franja === 'cerrado' ? 'Los lunes abre de 7 a 11. Queda casa, 12 minutos.' : tiempo.franja === 'manana' ? `Las pesas terminarían después de las ${formatoHora(topeDe(new Date(), settings) ?? 0)} y el lunes en la noche el club no abre. Queda la corta de todas formas.` : `Las pesas terminarían después de las ${formatoHora(topeDe(new Date(), settings) ?? minutosDe(settings.ultimaPesaNoche))}. Queda casa, 12 minutos, o la corta de todas formas.`}</p>
        <Grupo>
          {tiempo.franja !== 'manana' && casaDisponible(sesiones, ahora, sets) && <Fila texto="Casa, 12 minutos" detalle={`Llevas ${casaHechas} de ${CASA_MAX} esta semana`} onClick={() => { setHojaCasa(false); onEmpezar('CASA', 'completa') }} />}
          {tiempo.franja !== 'cerrado' && <Fila texto={`Corta de todas formas: ${queToca}`} detalle={listaCorta.map((e) => e.nombre.toLowerCase()).join(', ')} onClick={() => { setHojaCasa(false); onEmpezar(toca, 'corta', sinPierna) }} />}
        </Grupo>
      </Hoja>
      <Hoja abierta={hojaMover} titulo="Frida" onCerrar={() => setHojaMover(false)}>
        <p className="t-cuerpo tenue">¿Qué día de esta semana? Si no hay, entra C (espalda y hombro) a las sesiones de la semana.</p>
        <Grupo>
          {(preguntaFrida ? diasDeLaSemana(ahora) : diasParaMoverFrida(ahora)).map((f) => <Fila key={f} texto={`${DIAS_NOMBRE[desdeClave(f).getDay()]} ${fechaCorta(f)}`} dato={f === frida.planeada ? 'Planeado' : ''} onClick={() => moverFrida(f)} />)}
          <Fila texto="Esta semana no hay" detalle="Entra la sesión C: espalda y hombro" dato={frida.planeada === null ? 'Elegido' : ''} onClick={() => moverFrida(null)} />
        </Grupo>
      </Hoja>
      <RegistrarHoja datos={datos} ahora={ahora} abierta={registrar} fecha={registrarFecha} onCerrar={() => setRegistrar(false)} onGuardado={(s, reemplazada) => setAccion({ texto: `${textoDia(s.fecha)}: ${s.tipo === 'FRIDA' ? `Frida ${s.fridaTipo ?? 'torso'}` : s.tipo === 'CASA' ? 'casa' : s.tipo} registrada.`, deshacer: async () => { if (reemplazada) await datos.guardarSesion(reemplazada); else await datos.borrarSesion(s.id) } })} />
    </div>
  )
}

/** "Pon al día tu semana" (RUTINA-FINAL.md, 2.4): la primera vez, los días de esta semana hasta hoy con los mismos botones por día */
/** "lun 5": con A, B, C, Frida y No fui al lado ya no cabe el nombre completo */
const diaCorto = (fecha: string) => { const d = desdeClave(fecha); return `${DIAS_NOMBRE[d.getDay()].slice(0, 3)} ${d.getDate()}` }

function PonAlDia({ datos, ahora }: { datos: Datos; ahora: Date }) {
  const { sesiones, sets, settings } = datos
  const claveHoy = claveFecha(ahora)
  const dias = useMemo(() => diasDeSemanaHastaHoy(sesiones, sets, ahora), [sesiones, sets, ahora])
  // lo registrado va marcado; el día de Frida planeado sale con Frida; los demás días pasados, "No fui"; hoy, nada
  const [sel, setSel] = useState<Record<string, Respuesta | null>>(() => Object.fromEntries(dias.map((d) => {
    if (d.registrado && d.registrado !== 'CASA') return [d.fecha, d.registrado]
    if (d.fecha === claveHoy) return [d.fecha, null]
    return [d.fecha, sugeridaPara(d.fecha, sesiones, sets, settings.fridaPlan) === 'FRIDA' ? 'FRIDA' : 'no']
  })))
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
      const arm = armarRegistro(sesiones, d.fecha, r, claveHoy, undefined, { momento: momentoPorDefecto(d.fecha, plan, r) })
      if ('sesion' in arm) await datos.guardarSesion(arm.sesion)
    }
    datos.setSettings({ ...settings, noFui: [...noFui], fridaPlan: plan, semanaAlDiaV5: true, semanaAlDiaV6: true })
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
              <span className="fila-texto"><span className="t-cuerpo">{d.fecha === claveHoy ? 'hoy' : diaCorto(d.fecha)}</span></span>
              <BotonesDia marcado={sel[d.fecha] ?? null} sinNo={d.fecha === claveHoy} onElegir={(r) => setSel((s) => ({ ...s, [d.fecha]: s[d.fecha] === r ? null : r }))} />
            </div>
          ))}
        </Grupo>
      </div>
      <div className="inicio-pie"><BotonPrincipal onClick={listo}>Listo</BotonPrincipal></div>
    </div>
  )
}
