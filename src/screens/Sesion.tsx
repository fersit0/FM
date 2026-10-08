import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo, Ejercicio, Alternativa, SetLog, Version, Modo, Zona } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
import { CALENTAMIENTO, CIERRE, buscarCualquiera, itemDeRutina, alternativasDisponibles, rutaDe, ZONA_NOMBRE, nombreDe } from '../data/ejercicios'
import { seriesPara, estadoSemana } from '../logic/semana'
import { minutosCalentamiento, minutosCierre } from '../logic/duracion'
import { listaDeSesion, posponer, recortar, segundosRestantes, hechosDe } from '../logic/sesion'
import { comoQuedo } from '../logic/registro'
import { sugerirPeso, subioDePeso, porSesion } from '../logic/progresion'
import { claveFecha, formatoHora, minutosDe } from '../logic/fechas'
import { unidadDe, incrementoDe, pesoDeSet, pesoInicial, aKg, convertir, formatoPeso, redondearAPaso, type Unidad } from '../logic/unidades'
import { useWakeLock } from '../hooks/useWakeLock'
import { useAlto } from '../hooks/useAlto'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { haptico } from '../lib/haptics'
import { prepararAudio, sonarClic, sonarFinDescanso } from '../lib/sonido'
import { abrirAtajo } from '../lib/atajos'
import { useCuentaRegresiva, mmss } from '../hooks/useCuentaRegresiva'
import { Circulo, Stepper, BotonPrincipal, BotonContorno, BotonTexto, Hoja, Grupo, Fila, Pez, TituloAjustable, Deshacer } from '../components/fm'
import { FichaHoja } from '../components/Ficha'
import { Foto } from '../components/Foto'

interface Props { datos: Datos; sesion: SesionTipo; activa: SesionActiva; setActiva: (a: SesionActiva | null) => void; onSalir: () => void; onTerminar: () => void }
/** Un ejercicio de la sesión: el de la rutina (base), el que se hace (item: base o alternativa) y sus series */
export type PasoEjercicio = { tipo: 'ejercicio'; base: Ejercicio; item: Ejercicio | Alternativa; series: number; indice: number }
type Paso = { tipo: 'calentamiento' } | PasoEjercicio | { tipo: 'cierre' } | { tipo: 'resumen' }
type Accion = { texto: string; deshacer: () => void | Promise<void> }

export function rangoDe(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}
/** diámetro del spec acotado al espacio disponible */
const acotar = (d: number, alto: number, ancho: number) => Math.max(88, Math.min(d, alto - 4, ancho - 8))
/** "8:22": sin am/pm, la sesión siempre es de tarde */
const horaDe = (ms: number) => formatoHora(new Date(ms).getHours() * 60 + new Date(ms).getMinutes()).replace(/ [ap]m$/, '')

export function Sesion({ datos, sesion, activa, setActiva, onSalir, onTerminar }: Props) {
  const { settings, sets } = datos
  const version = sesion.version
  const ligera = !!sesion.ligera
  const casa = sesion.tipo === 'CASA'
  useWakeLock(true)
  const lista = useMemo(() => listaDeSesion(sesion), [sesion])
  const ruta = useMemo(() => rutaDe(lista), [lista])
  const pasos = useMemo<Paso[]>(() => {
    const ejercicios: Paso[] = lista.map((base, indice) => {
      const cambio = sesion.cambios?.find((c) => c.ejercicioId === base.id)
      const item = cambio ? (cambio.alternativaId === base.id ? base : base.alternativas.find((a) => a.id === cambio.alternativaId) ?? base) : itemDeRutina(base, settings.reemplazos)
      return { tipo: 'ejercicio', base, item, series: casa ? item.series : seriesPara(item.series, ligera), indice }
    })
    return casa ? [...ejercicios, { tipo: 'resumen' }] : [{ tipo: 'calentamiento' }, ...ejercicios, { tipo: 'cierre' }, { tipo: 'resumen' }]
  }, [lista, sesion.cambios, settings.reemplazos, ligera, casa])
  const indice = Math.min(activa.paso, pasos.length - 1)
  const paso = pasos[indice]
  const ej = paso.tipo === 'ejercicio' ? paso : null
  const hechos = useMemo(() => (ej ? hechosDe(sets, sesion.id, ej.base.id) : []), [sets, sesion.id, ej])
  const [accion, setAccion] = useState<Accion | null>(null)
  const ir = useCallback((n: number) => {
    setActiva({ ...activa, paso: Math.max(0, Math.min(pasos.length - 1, n)), timerFin: undefined, timerSeg: undefined, descansoFin: undefined, descansoSeg: undefined, avisado: undefined, borrador: undefined })
  }, [activa, pasos.length, setActiva])
  const [menu, setMenu] = useState(false)
  const [tecnica, setTecnica] = useState(false)
  const [alternativas, setAlternativas] = useState(false)
  const [seriesHoy, setSeriesHoy] = useState(false)
  const cerrarAccion = useCallback(() => setAccion(null), [])
  const descansando = activa.descansoFin !== undefined
  const topeMs = useMemo(() => { const m = minutosDe(settings.horaTope); return new Date(sesion.fecha + 'T00:00:00').getTime() + m * 60000 }, [sesion.fecha, settings.horaTope])

  // Recorte en el camino (RUTINA-FINAL.md, 3): si lo que falta ya no cabe antes de la última pesa, quita abdomen, brazos, press militar o aperturas
  useEffect(() => {
    if (casa || !ej) return
    const disponibles = (topeMs - Date.now()) / 1000
    const quitar = recortar(lista, ej.indice, hechos.length, disponibles, ligera)
    if (quitar.length === 0) return
    const antes = sesion.recortados
    datos.guardarSesion({ ...sesion, recortados: [...(antes ?? []), ...quitar] })
    setAccion({ texto: `Para terminar a tiempo se quitó ${quitar.map((id) => nombreDe(id).toLowerCase()).join(' y ')}.`, deshacer: () => datos.guardarSesion({ ...sesion, recortados: antes }) })
    // solo al cambiar de paso o de serie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, hechos.length, lista.length])

  const ultimoPesoDe = (it: Ejercicio | Alternativa) => {
    const g = porSesion(sets, it.id)
    const u = g[g.length - 1]
    if (!u) return 'Sin registro'
    const un = unidadDe(it, settings.unidades)
    const pesos = u.map((x) => pesoDeSet(x, un, incrementoDe(it, un))).filter((x): x is number => x !== null)
    return pesos.length ? formatoPeso(Math.max(...pesos), un) : `${Math.max(...u.map((x) => x.reps))} reps`
  }
  function usarSiempre(base: Ejercicio, altId: string | null) {
    const reemplazos = { ...(settings.reemplazos ?? {}) }
    if (altId) reemplazos[base.id] = altId
    else delete reemplazos[base.id]
    datos.setSettings({ ...settings, reemplazos })
  }
  async function cambiarVersion(v: Version, lig: boolean) {
    await datos.guardarSesion({ ...sesion, version: v, ligera: lig, pierna: v === 'corta' ? false : sesion.pierna, orden: undefined, recortados: undefined })
    setMenu(false)
  }
  async function descartar() {
    if (!confirm('¿Descartar la sesión? Se borran las series de hoy.')) return
    await datos.borrarSesion(sesion.id)
    setMenu(false)
    onTerminar()
  }
  function terminar() {
    if (!confirm('¿Terminar la sesión? Se guarda lo que llevas.')) return
    setMenu(false)
    ir(pasos.length - 1)
  }
  function saltar() {
    const desde = indice
    setMenu(false)
    ir(indice + 1)
    setAccion({ texto: 'Ejercicio saltado.', deshacer: () => ir(desde) })
  }
  /** "Ocupado: después": al final de su zona o de la sesión; la segunda vez, directo a las alternativas */
  async function ocupado() {
    if (!ej) return
    setMenu(false)
    if (sesion.pospuestos?.includes(ej.base.id)) { setAlternativas(true); return }
    const antes = { orden: sesion.orden, pospuestos: sesion.pospuestos }
    const orden = posponer(lista, ej.indice)
    const quedaEnZona = orden.indexOf(ej.base.id) < lista.length - 1 && lista.slice(ej.indice + 1).some((e) => e.zona === ej.base.zona)
    await datos.guardarSesion({ ...sesion, orden, pospuestos: [...(sesion.pospuestos ?? []), ej.base.id] })
    setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined, borrador: undefined })
    setAccion({ texto: quedaEnZona && ej.base.zona ? `Después, al final de ${ZONA_NOMBRE[ej.base.zona].toLowerCase()}.` : 'Después, al final de la sesión.', deshacer: () => datos.guardarSesion({ ...sesion, ...antes }) })
  }
  async function elegirAlternativa(alt: Alternativa | null) {
    if (!ej) return
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== ej.base.id)
    cambios.push({ ejercicioId: ej.base.id, alternativaId: alt ? alt.id : ej.base.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setTecnica(false)
    setAlternativas(false)
  }
  const setsHoy = sets.filter((s) => s.sessionId === sesion.id).sort((a, b) => a.hora - b.hora)
  const minCal = minutosCalentamiento(version)
  const minCierre = minutosCierre(version, !!sesion.pierna)
  const disponibles = ej ? alternativasDisponibles(ej.base, lista, sesion.cambios, settings.reemplazos) : []
  const pospuesto = !!ej && !!sesion.pospuestos?.includes(ej.base.id)
  // "Empezaste 8:22 · va la corta · terminas pesas 8:50": la proyección se recalcula en cada paso
  const linea = useMemo(() => {
    if (casa || paso.tipo === 'resumen') return null
    const i = ej ? ej.indice : paso.tipo === 'calentamiento' ? 0 : lista.length
    const restante = paso.tipo === 'calentamiento' ? minCal * 60 + segundosRestantes(lista, 0, 0, ligera) : paso.tipo === 'cierre' ? 0 : segundosRestantes(lista, i, hechos.length, ligera, descansando ? Math.max(0, ((activa.descansoFin ?? 0) - Date.now()) / 1000) : 0)
    const nombre = version === 'corta' ? 'la corta' : version === 'bonus' ? 'el bonus' : 'la completa'
    const quitados = sesion.recortados?.length ? ` · se quitó ${sesion.recortados.map((id) => nombreDe(id).toLowerCase()).join(' y ')}` : ''
    return `Empezaste ${horaDe(sesion.inicio)} · va ${nombre} · terminas pesas ${horaDe(Date.now() + restante * 1000)}${quitados}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casa, paso, ej, lista, hechos.length, ligera, descansando, version, sesion.inicio, minCal, sesion.recortados])
  const otraVersion: Version = version === 'corta' ? 'completa' : 'corta'
  const zonaActual: Zona | undefined = ej?.base.zona
  const sig = ej && indice + 1 < pasos.length ? pasos[indice + 1] : null
  const siguienteEj = sig && sig.tipo === 'ejercicio' ? sig : null

  return (
    <div className="pantalla sesion">
      {paso.tipo !== 'resumen' && (
        <header className="sesion-cabecera">
          <button className="icono-boton" onClick={() => setMenu(true)} aria-label="Opciones de la sesión">
            <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
          {casa ? <span className="t-nota tenue">{ej ? `${ej.indice + 1} de ${lista.length}` : ''}</span> : (
            <span className="t-nota tenue sesion-ruta" aria-label="Recorrido por zonas">{ruta.map((z, i) => <span key={z}>{i > 0 && ' → '}<span className={z === zonaActual ? 'actual' : ''}>{ZONA_NOMBRE[z]}</span></span>)}</span>
          )}
        </header>
      )}
      {paso.tipo === 'calentamiento' && <PasoTiempo key="cal" titulo="Calentamiento" detalle={`Elíptica ${minCal} min, ritmo en el que puedes platicar.`} nota={CALENTAMIENTO.siOcupada} minutos={minCal} linea={linea} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {ej && !descansando && (
        <PasoSerie key={`${ej.base.id}-${ej.item.id}`} datos={datos} sesion={sesion} ej={ej} lista={lista} hechos={hechos} sets={sets} activa={activa} setActiva={setActiva} linea={linea} onCambiarVersion={casa ? undefined : () => cambiarVersion(otraVersion, ligera)} otraVersion={otraVersion} onTecnica={() => setTecnica(true)} onSiguiente={() => ir(indice + 1)} onSeries={() => setSeriesHoy(true)} onVolverOriginal={() => elegirAlternativa(null)}
          onGuardado={(id) => setAccion((a) => (a && a.texto.startsWith('Para terminar') ? a : { texto: 'Serie guardada.', deshacer: async () => { await datos.borrarSet(id); setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined }) } }))} />
      )}
      {ej && descansando && activa.descansoFin !== undefined && (
        <PasoDescanso key={`d${activa.descansoFin}`} ej={ej} hechos={hechos} siguiente={siguienteEj} fin={activa.descansoFin} total={activa.descansoSeg ?? ej.item.descansoSeg} avisado={!!activa.avisado} unidades={settings.unidades} linea={linea}
          onMas={() => setActiva({ ...activa, descansoFin: (activa.descansoFin ?? Date.now()) + 15_000, descansoSeg: (activa.descansoSeg ?? ej.item.descansoSeg) + 15 })}
          onAvisar={() => { abrirAtajo(((activa.descansoFin ?? Date.now()) - Date.now()) / 1000); setActiva({ ...activa, avisado: true }) }}
          onSaltar={() => { const antes = { ...activa }; setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined }); setAccion({ texto: 'Descanso saltado.', deshacer: () => setActiva(antes) }) }}
          onSiguienteEjercicio={() => { const antes = { ...activa }; ir(indice + 1); setAccion({ texto: 'Descanso saltado.', deshacer: () => setActiva(antes) }) }} />
      )}
      {paso.tipo === 'cierre' && <PasoTiempo key="cierre" titulo="Cierre" detalle={`Saco en la terraza o elíptica, ${minCierre} min.${sesion.pierna ? ' Hubo pierna: cierre corto.' : ''}`} nota={CIERRE.saco} minutos={minCierre} linea={null} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {paso.tipo === 'resumen' && <Resumen datos={datos} sesion={sesion} sets={sets} lista={lista} onTerminar={onTerminar} />}

      {accion && <Deshacer texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={cerrarAccion} />}

      <Hoja abierta={menu} onCerrar={() => setMenu(false)}>
        <Grupo>
          {ej && <Fila texto="Ver técnica" onClick={() => { setMenu(false); setTecnica(true) }} />}
          {ej && !casa && <Fila texto="Ocupado: después" detalle={pospuesto ? 'Ya se pospuso una vez: ahora la alternativa' : 'Lo manda al final de su zona'} onClick={ocupado} />}
          {ej && <Fila texto="Cambiar por alternativa" detalle="Si sigue ocupado o no te late" onClick={() => { setMenu(false); setAlternativas(true) }} />}
          <Fila texto="Series de hoy" detalle={`${setsHoy.length} registradas, editar o borrar`} onClick={() => { setMenu(false); setSeriesHoy(true) }} />
          {indice > 0 && <Fila texto={ej && ej.indice > 0 ? 'Ejercicio anterior' : 'Paso anterior'} onClick={() => { setMenu(false); ir(indice - 1) }} />}
          {paso.tipo !== 'resumen' && <Fila texto={ej ? 'Saltar ejercicio' : 'Saltar'} onClick={saltar} />}
          <Fila texto="Seguir después" detalle="Se queda guardada donde vas" onClick={() => { setMenu(false); onSalir() }} />
          <Fila texto="Terminar sesión" detalle="Guarda lo hecho y va al resumen" onClick={terminar} />
          <Fila texto="Descartar sesión" detalle="Se borran las series de hoy" onClick={descartar} />
        </Grupo>
        {!casa && (
          <Grupo titulo="Versión">
            {(['completa', 'corta', 'bonus'] as Version[]).map((v) => (
              <Fila key={v} texto={v === 'completa' ? 'Completa' : v === 'corta' ? 'Corta: jalón, press y laterales' : 'Bonus, cierre de 20 min'} dato={version === v && !ligera ? 'Activa' : ''} onClick={() => cambiarVersion(v, false)} />
            ))}
            <Fila texto="Ligera, 2 series con el mismo peso" dato={ligera ? 'Activa' : ''} onClick={() => cambiarVersion(version === 'corta' ? 'completa' : version, !ligera)} />
          </Grupo>
        )}
      </Hoja>
      <Hoja abierta={seriesHoy} titulo="Series de hoy" altura="completa" onCerrar={() => setSeriesHoy(false)}>
        {setsHoy.length === 0 ? <p className="t-cuerpo tenue">Todavía no hay series.</p> : (
          <Grupo>{setsHoy.map((s) => <SerieEditable key={s.id} set={s} datos={datos} />)}</Grupo>
        )}
      </Hoja>
      {ej && <FichaHoja abierta={tecnica} onCerrar={() => setTecnica(false)} base={ej.base} item={ej.item} datos={datos} series={ej.series} alternativas={disponibles} onElegirAlternativa={elegirAlternativa} />}
      {ej && (
        <Hoja abierta={alternativas} titulo="Cambiar por" onCerrar={() => setAlternativas(false)}>
          {!casa && !pospuesto && <p className="t-nota tenue">Si está ocupado, primero "Ocupado: después" en el menú: lo manda al final de su zona.</p>}
          {pospuesto && <p className="t-nota tenue">Ya se pospuso una vez. Si sigue ocupado, cambia por la alternativa.</p>}
          <Grupo>
            {[ej.base, ...disponibles].filter((a) => a.id !== ej.item.id).map((a) => {
              const siempre = a.id === ej.base.id ? !settings.reemplazos?.[ej.base.id] : settings.reemplazos?.[ej.base.id] === a.id
              return (
                <div key={a.id} className="fila" style={{ alignItems: 'flex-start' }}>
                  <Foto clave={a.ilustracion} ejercicioId={a.id} propias={datos.fotosEjercicio} nombre={a.nombre} modo="chica" />
                  <span className="fila-texto" style={{ gap: 6 }}>
                    <button className="t-cuerpo" style={{ textAlign: 'left', whiteSpace: 'normal' }} onClick={() => elegirAlternativa(a.id === ej.base.id ? null : (a as Alternativa))}>{a.nombre}</button>
                    <span className="t-nota tenue">{'caso' in a ? `${a.caso}. ` : 'Original. '}{ultimoPesoDe(a)}</span>
                    <button className="t-nota" style={{ textAlign: 'left', color: siempre ? 'var(--rojo)' : 'var(--texto-2)' }} onClick={() => usarSiempre(ej.base, a.id === ej.base.id ? null : a.id)}>{siempre ? 'Es la de siempre' : 'Usar siempre esta'}</button>
                  </span>
                </div>
              )
            })}
          </Grupo>
          {hechos.length > 0 && <p className="t-nota tenue">Las series que ya hiciste cuentan igual: con la alternativa sigues en la serie {hechos.length + 1}.</p>}
        </Hoja>
      )}
    </div>
  )
}

/** Fila editable de una serie: peso en la unidad del ejercicio y reps, con Borrar */
export function SerieEditable({ set, datos }: { set: SetLog; datos: Datos }) {
  const info = buscarCualquiera(set.exerciseId)
  const unidad: Unidad = info ? unidadDe(info.item, datos.settings.unidades) : 'kg'
  const paso = info ? incrementoDe(info.item, unidad) : undefined
  const [peso, setPeso] = useState(() => { const p = pesoDeSet(set, unidad, paso); return p === null ? '' : String(p) })
  const [reps, setReps] = useState(String(set.reps))
  async function guardar() {
    const p = peso === '' ? null : parseFloat(peso.replace(',', '.'))
    const r = parseInt(reps, 10)
    if (Number.isNaN(r) || r <= 0 || (p !== null && Number.isNaN(p))) return
    await datos.guardarSet({ ...set, pesoKg: p === null ? null : aKg(p, unidad), peso: p ?? undefined, unidad: p === null ? undefined : unidad, reps: r })
  }
  return (
    <div className="fila" style={{ flexWrap: 'wrap', gap: 8 }}>
      <span className="fila-texto"><span className="t-cuerpo">{nombreDe(set.exerciseId)}</span><span className="t-nota tenue">Serie {set.numSerie}</span></span>
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {set.pesoKg !== null && <input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} onBlur={guardar} aria-label="Peso" style={{ width: 64, textAlign: 'right', borderBottom: '1px solid var(--separador)' }} />}
        {set.pesoKg !== null && <span className="t-nota tenue">{unidad}</span>}
        <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} onBlur={guardar} aria-label="Reps" style={{ width: 44, textAlign: 'right', borderBottom: '1px solid var(--separador)' }} />
        <span className="t-nota tenue">{set.exerciseId.startsWith('plancha') ? 's' : 'reps'}</span>
        <BotonTexto onClick={() => confirm('¿Borrar esta serie?') && set.id !== undefined && datos.borrarSet(set.id)}>Borrar</BotonTexto>
      </span>
    </div>
  )
}

/** Línea de arriba: "Empezaste 8:22 · va la corta · terminas pesas 8:50" con el botón para cambiar de versión */
function Linea({ texto, otraVersion, onCambiar }: { texto: string | null; otraVersion?: Version; onCambiar?: () => void }) {
  if (!texto) return null
  return <p className="t-nota tenue sesion-linea">{texto}{onCambiar && otraVersion && <>{' · '}<button onClick={onCambiar}>Cambiar a {otraVersion}</button></>}</p>
}

// ---------- 7.1 Calentamiento y cierre ----------
function PasoTiempo({ titulo, detalle, nota, minutos, linea, activa, setActiva, onListo }: { titulo: string; detalle: string; nota: string; minutos: number; linea: string | null; activa: SesionActiva; setActiva: (a: SesionActiva) => void; onListo: () => void }) {
  usePantalla('calentamiento')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const fin = activa.timerFin
  const restante = useCuentaRegresiva(fin)
  const termino = fin !== undefined && restante <= 0
  const d = acotar(0.8 * W, alto, ancho)
  useEffect(() => {
    if (termino && document.visibilityState === 'visible') { haptico.finDescanso(); sonarFinDescanso() }
  }, [termino])
  return (
    <div className="panel">
      <div className="sesion-arriba">
        <Linea texto={linea} />
        <h1 className="t-titulo">{titulo}</h1>
        <p className="t-sub tenue">{detalle}</p>
      </div>
      <div className="sesion-medio" ref={medio}>
        <Circulo d={d}><span className="circulo-timer" style={{ fontSize: d * 0.26 }}>{fin === undefined ? `${minutos}:00` : restante <= 0 ? 'Va' : mmss(restante)}</span></Circulo>
      </div>
      <div className="sesion-abajo">
        <p className="t-nota tenue" style={{ textAlign: 'center' }}>{nota}</p>
        {fin === undefined ? (
          <BotonPrincipal onClick={() => { prepararAudio(); setActiva({ ...activa, timerFin: Date.now() + minutos * 60000, timerSeg: minutos * 60 }) }}>Empezar {titulo.toLowerCase()}</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={onListo}>Ya terminé</BotonPrincipal>
        )}
        <div style={{ display: 'flex', justifyContent: 'center' }}><BotonTexto onClick={onListo}>Saltar</BotonTexto></div>
      </div>
    </div>
  )
}

// ---------- 6.2 Serie ----------
/** Formato de una serie hecha: "30 × 10", "12" o "45 s" */
function textoSerie(h: SetLog, modo: Modo, unidad: Unidad, paso: number): string {
  if (modo === 'tiempo') return `${h.reps} s`
  if (modo === 'corporal') return `${h.reps}`
  const p = pesoDeSet(h, unidad, paso)
  return `${p ?? '—'} × ${h.reps}`
}

function PasoSerie({ datos, sesion, ej, lista, hechos, sets, activa, setActiva, linea, otraVersion, onCambiarVersion, onTecnica, onSiguiente, onGuardado, onSeries, onVolverOriginal }: { datos: Datos; sesion: SesionTipo; ej: PasoEjercicio; lista: Ejercicio[]; hechos: SetLog[]; sets: SetLog[]; activa: SesionActiva; setActiva: (a: SesionActiva) => void; linea: string | null; otraVersion: Version; onCambiarVersion?: () => void; onTecnica: () => void; onSiguiente: () => void; onGuardado: (id: number) => void; onSeries: () => void; onVolverOriginal: () => void }) {
  usePantalla('serie')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const { base, item, series } = ej
  const { settings } = datos
  const unidad = unidadDe(item, settings.unidades)
  const otra: Unidad = unidad === 'kg' ? 'lb' : 'kg'
  const incremento = incrementoDe(item, unidad)
  const conPeso = item.modo === 'peso'
  const esAlternativa = item.id !== base.id
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo, item.repsMin), [historial, item.id, item.repsMax, item.modo, item.repsMin])
  const ultimaVez = useMemo(() => porSesion(historial, item.id).slice(-1)[0], [historial, item.id])
  const siguienteNum = hechos.length + 1
  const completo = hechos.length >= series
  // último set de este mismo ejercicio (no de la alternativa), para arrancar con su peso y reps
  const ultimo = [...hechos].reverse().find((s) => s.exerciseId === item.id)
  const primeraVez = sugerencia.tipo === 'inicial' && !ultimo
  const pesoBase = (() => {
    if (!ultimaVez) return null
    const pesos = ultimaVez.map((s) => pesoDeSet(s, unidad, incremento)).filter((x): x is number => x !== null)
    return pesos.length ? Math.max(...pesos) : null
  })()
  const invertida = 'invertida' in item && !!item.invertida
  const signo = invertida ? -1 : 1
  const pesoSugerido = pesoBase === null ? null : sugerencia.tipo === 'subir' ? Math.max(0, pesoBase + signo * incremento) : sugerencia.tipo === 'bajar' ? Math.max(0, pesoBase - signo * incremento) : pesoBase
  // la serie nueva arranca con el peso y reps de la anterior; si iOS cerró la app, con lo que se estaba ajustando
  const borrador = activa.borrador && activa.borrador.itemId === item.id ? activa.borrador : null
  const [peso, setPesoState] = useState<number>(() => {
    if (borrador) return convertir(borrador.peso, borrador.unidad, unidad, incremento)
    const ult = ultimo ? pesoDeSet(ultimo, unidad, incremento) : null
    if (ult !== null) return ult
    if (pesoSugerido !== null) return pesoSugerido
    return conPeso ? pesoInicial(item, unidad) : 0
  })
  const [reps, setRepsState] = useState<number>(() => borrador?.reps ?? ultimo?.reps ?? (item.modo === 'tiempo' ? item.repsMax : item.repsMax || 10))
  const [error, setError] = useState(false)
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState('')
  const guardarBorrador = (p: number, r: number, u: Unidad) => setActiva({ ...activa, borrador: { itemId: item.id, peso: p, reps: r, unidad: u } })
  const setPeso = (v: number) => { setPesoState(v); guardarBorrador(v, reps, unidad) }
  const setReps = (v: number) => { setRepsState(v); guardarBorrador(peso, v, unidad) }

  const serieActual = Math.min(siguienteNum, series)
  const dSpec = series <= 1 ? 0.66 * W : 0.48 * W + (0.36 * W * (serieActual - 1)) / (series - 1)
  const anchoLibre = conPeso ? ancho - 2 * (64 + 12) : ancho
  const d = acotar(dSpec, alto, anchoLibre)
  const largo = String(peso).length
  const cifra = Math.round(d * 0.42 * (largo <= 2 ? 1 : largo === 3 ? 0.88 : largo === 4 ? 0.76 : 0.64))

  function cambiarUnidad() {
    const nuevo = convertir(peso, unidad, otra, incrementoDe(item, otra))
    datos.setSettings({ ...settings, unidades: { ...(settings.unidades ?? {}), [item.id]: otra } })
    setPesoState(nuevo)
    guardarBorrador(nuevo, reps, otra)
  }
  function mover(dir: 1 | -1) {
    const v = Math.max(0, Math.round((peso + dir * incremento) * 100) / 100)
    haptico.marcaDial()
    setPeso(v)
  }
  async function serieHecha() {
    prepararAudio()
    if (reps <= 0) return
    const ahora = Date.now()
    let id: number
    try {
      id = await datos.guardarSet({ sessionId: sesion.id, exerciseId: item.id, ejercicioBaseId: base.id, numSerie: siguienteNum, pesoKg: conPeso ? aKg(peso, unidad) : null, peso: conPeso ? peso : undefined, unidad: conPeso ? unidad : undefined, reps, fecha: claveFecha(new Date(ahora)), hora: ahora })
    } catch { setError(true); return }
    setError(false)
    sonarClic()
    if (siguienteNum >= series) haptico.finEjercicio(); else haptico.serieHecha()
    setActiva({ ...activa, descansoFin: ahora + item.descansoSeg * 1000, descansoSeg: item.descansoSeg, avisado: undefined, borrador: { itemId: item.id, peso, reps, unidad } })
    onGuardado(id)
  }
  function confirmarTexto() {
    const v = parseFloat(texto.replace(',', '.'))
    if (!Number.isNaN(v) && v >= 0) setPeso(Math.round(v * 100) / 100)
    setEditando(false)
  }
  // serie de aproximación: en el primer ejercicio de la sesión y en el primer press (RUTINA-FINAL.md, 3)
  const primerPress = lista.findIndex((e) => e.id.startsWith('press')) === ej.indice
  const aproximacion = conPeso && peso > 0 && (ej.indice === 0 || primerPress)

  let aviso: ReactNode = null
  if (error) aviso = <span onClick={serieHecha}>No se guardó la serie. Toca para reintentar.</span>
  else if (hechos.length > 0) {
    aviso = <>{conPeso ? `Hechas en ${unidad}: ` : 'Hechas: '}{hechos.map((h) => textoSerie(h, item.modo, unidad, incremento) + (h.exerciseId !== item.id ? ` (${nombreDe(h.exerciseId).toLowerCase()})` : '')).join(', ')}. <button onClick={onSeries}>Editar</button></>
  } else {
    if (sugerencia.tipo === 'subir' && ultimaVez && pesoSugerido !== null) aviso = invertida ? `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Menos ayuda: ${formatoPeso(pesoSugerido, unidad)}.` : `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Sube a ${formatoPeso(pesoSugerido, unidad)}.`
    else if (sugerencia.tipo === 'bajar' && pesoSugerido !== null) aviso = `Dos veces seguidas bajaron las reps. Baja a ${formatoPeso(pesoSugerido, unidad)}.`
    else if (sugerencia.tipo === 'quedarse' && pesoBase !== null) aviso = `La vez pasada no llegaste al mínimo. Quédate en ${formatoPeso(pesoBase, unidad)} o baja.`
    else if (primeraVez && conPeso) aviso = 'Primera vez: empieza con este y ajusta.'
    else if (aproximacion) aviso = `Antes, una de aproximación con ${formatoPeso(redondearAPaso(peso / 2, incremento) || incremento, unidad)}, 10 reps. No se registra.`
  }
  const zona = base.zona ? `${ZONA_NOMBRE[base.zona]} · ` : ''

  return (
    <div className="panel">
      <div className="sesion-arriba">
        <Linea texto={linea} otraVersion={otraVersion} onCambiar={onCambiarVersion} />
        <div className="sesion-titulo-fila"><TituloAjustable texto={item.nombre} /></div>
        <div className="sesion-titulo-fila">
          <p className="t-sub">{completo ? `${series} series hechas` : `Serie ${serieActual} de ${series}`}</p>
          <BotonTexto subrayado onClick={onTecnica}>Técnica</BotonTexto>
        </div>
        <p className="t-nota tenue sesion-zona">{zona}{ej.indice + 1} de {lista.length}</p>
        {esAlternativa && <p className="t-nota tenue sesion-alternativa">{'caso' in item ? `${item.caso}. ` : ''}<button onClick={onVolverOriginal}>Volver al original</button></p>}
        {aviso && <p className="t-cuerpo tenue sesion-aviso">{aviso}</p>}
        <div className="sesion-foto"><Foto clave={item.ilustracion} ejercicioId={item.id} propias={datos.fotosEjercicio} nombre={item.nombre} modo="toque" /></div>
      </div>
      <div className="sesion-medio" ref={medio}>
        {conPeso && <button className="mas-menos" aria-label={`Menos ${incremento} ${unidad}`} onClick={() => mover(-1)}><svg viewBox="0 0 28 28"><path d="M6 14h16" /></svg></button>}
        <Circulo d={d}>
          {conPeso ? (
            <div className="circulo-contenido">
              {editando ? (
                <input className="cifra-input" style={{ fontSize: cifra, fontWeight: 700, letterSpacing: '-0.05em', width: d * 0.9 }} inputMode="decimal" value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={confirmarTexto} onKeyDown={(e) => e.key === 'Enter' && confirmarTexto()} autoFocus aria-label="Peso" />
              ) : (
                <span className="circulo-cifra" style={{ fontSize: cifra }}>
                  <button className="circulo-cifra" style={{ fontSize: cifra }} onClick={() => { setTexto(String(peso)); setEditando(true) }} aria-label={`Peso ${peso} ${unidad}, tocar para escribir`}>{peso}</button>
                  <button className="kg" style={{ fontSize: Math.max(20, Math.round(cifra * 0.3)) }} onClick={cambiarUnidad} aria-label={`Cambiar a ${otra}`}>{unidad}</button>
                </span>
              )}
              <span className="circulo-equivalencia" style={{ fontSize: Math.max(15, Math.round(cifra * 0.22)) }}>{formatoPeso(convertir(peso, unidad, otra, incrementoDe(item, otra)), otra)}</span>
            </div>
          ) : (
            <span className="circulo-cifra" style={{ fontSize: cifra }}>{reps}<span className="kg" style={{ fontSize: Math.max(20, Math.round(cifra * 0.3)) }}>{item.modo === 'tiempo' ? 's' : ''}</span></span>
          )}
        </Circulo>
        {conPeso && <button className="mas-menos" aria-label={`Más ${incremento} ${unidad}`} onClick={() => mover(1)}><svg viewBox="0 0 28 28"><path d="M6 14h16M14 6v16" /></svg></button>}
      </div>
      <div className="sesion-abajo">
        <Stepper valor={reps} onChange={setReps} unidad={item.modo === 'tiempo' ? 'segundos' : 'reps'} min={item.modo === 'tiempo' ? 5 : 1} max={item.modo === 'tiempo' ? 300 : 99} />
        {completo ? <BotonPrincipal onClick={onSiguiente}>Siguiente ejercicio</BotonPrincipal> : <BotonPrincipal onClick={serieHecha}>Serie hecha</BotonPrincipal>}
      </div>
    </div>
  )
}

// ---------- 6.3 Descanso ----------
function PasoDescanso({ ej, hechos, siguiente, fin, total, avisado, unidades, linea, onMas, onAvisar, onSaltar, onSiguienteEjercicio }: { ej: PasoEjercicio; hechos: SetLog[]; siguiente: PasoEjercicio | null; fin: number; total: number; avisado: boolean; unidades?: Record<string, Unidad>; linea: string | null; onMas: () => void; onAvisar: () => void; onSaltar: () => void; onSiguienteEjercicio: () => void }) {
  usePantalla('descanso')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const item = ej.item
  const ejercicioCompleto = hechos.length >= ej.series
  const unidad = unidadDe(item, unidades)
  const ultimo = [...hechos].reverse().find((s) => s.exerciseId === item.id)
  const restante = useCuentaRegresiva(fin)
  const termino = restante <= 0
  const tarde = restante < -3000
  useEffect(() => {
    if (termino && document.visibilityState === 'visible') { haptico.finDescanso(); if (!avisado) sonarFinDescanso() }
    // solo al cruzar el cero, no por cada cambio de avisado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termino])
  const progreso = Math.max(0, Math.min(1, restante / (total * 1000)))
  const dMax = acotar(0.96 * W, alto, ancho), dMin = Math.min(0.56 * W, dMax)
  const d = dMin + (dMax - dMin) * progreso
  const pesoUlt = ultimo ? pesoDeSet(ultimo, unidad, incrementoDe(item, unidad)) : null
  // al terminar la última serie de una zona, la app dice a cuál sigue
  const cambiaZona = ejercicioCompleto && siguiente && siguiente.base.zona && siguiente.base.zona !== ej.base.zona
  const sigue = ejercicioCompleto
    ? siguiente ? `${cambiaZona ? `Ahora a ${ZONA_NOMBRE[siguiente.base.zona!].toLowerCase()}: ` : 'Sigue: '}${siguiente.item.nombre.toLowerCase()}` : 'Sigue: el cierre'
    : `Sigue: serie ${hechos.length + 1}${pesoUlt !== null ? `, ${formatoPeso(pesoUlt, unidad)}` : ''}`
  return (
    <div className="panel">
      <div className="sesion-arriba"><Linea texto={linea} /><h1 className="t-descanso">Descanso</h1></div>
      <div className="sesion-medio" ref={medio}>
        <div className="circulo-sitio" style={{ width: dMax, height: dMax }}>
          <Circulo d={d} continuo style={{ position: 'absolute', left: (dMax - d) / 2, top: (dMax - d) / 2 }}>
            {tarde ? <span className="t-cuerpo" style={{ padding: '0 24px', textAlign: 'center' }}>Terminó hace {mmss(-restante)}.</span> : <span className="circulo-timer" style={{ fontSize: dMax * 0.26 }}>{termino ? 'Va' : mmss(restante)}</span>}
          </Circulo>
          <Pez expresion="tirado-descansando" tamano={Math.min(88, dMax * 0.26)} style={{ left: (dMax - d) / 2 + d * 0.08, top: (dMax - d) / 2 + d - Math.min(88, dMax * 0.26) * 0.75 }} />
        </div>
      </div>
      <div className="sesion-abajo">
        <p className="t-sub">{sigue}</p>
        {!termino && <div><BotonTexto onClick={onAvisar}>Avísame aunque me salga</BotonTexto></div>}
        {termino ? (
          <BotonPrincipal piedra onClick={ejercicioCompleto ? onSiguienteEjercicio : onSaltar}>{ejercicioCompleto ? 'Siguiente ejercicio' : 'Siguiente serie'}</BotonPrincipal>
        ) : (
          <div className="botones-fila">
            <BotonContorno onClick={onMas}>+15 s</BotonContorno>
            <BotonContorno onClick={ejercicioCompleto ? onSiguienteEjercicio : onSaltar}>Saltar</BotonContorno>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- 6.4 Resumen ----------
function Resumen({ datos, sesion, sets, lista, onTerminar }: { datos: Datos; sesion: SesionTipo; sets: SetLog[]; lista: Ejercicio[]; onTerminar: () => void }) {
  usePantalla('resumen')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const [fin] = useState(() => Date.now())
  const propios = sets.filter((s) => s.sessionId === sesion.id)
  const ids = [...new Set(propios.map((s) => s.exerciseId))]
  const subieron = ids.filter((id) => subioDePeso(sets, id, sesion.id)).map((id) => {
    const info = buscarCualquiera(id)
    const unidad: Unidad = info ? unidadDe(info.item, datos.settings.unidades) : 'kg'
    const grupos = porSesion(sets, id)
    const i = grupos.findIndex((g) => g[0].sessionId === sesion.id)
    const paso = info ? incrementoDe(info.item, unidad) : undefined
    const max = (g: SetLog[]) => Math.max(...g.map((s) => pesoDeSet(s, unidad, paso) ?? 0))
    return { nombre: nombreDe(id).toLowerCase(), delta: Math.round((i > 0 ? max(grupos[i]) - max(grupos[i - 1]) : 0) * 10) / 10, unidad }
  })
  const minutos = Math.max(1, Math.round((fin - sesion.inicio) / 60000))
  const hechosEj = lista.filter((e) => propios.some((s) => s.ejercicioBaseId === e.id)).length
  const cumpleSemana = sesion.tipo !== 'CASA' && estadoSemana([...datos.sesiones.filter((s) => s.id !== sesion.id), { ...sesion, terminada: true }], new Date(fin)).hechas === 3
  const etiqueta = sesion.tipo === 'CASA' ? 'Casa hecha. No cuenta para la meta, pero cuenta.' : cumpleSemana ? `${sesion.tipo} hecha. Con esta, semana cumplida.` : `${sesion.tipo} hecha. Mañana te vas a acordar.`
  const frase = subieron.length ? `Subiste en ${subieron.map((s) => `${s.nombre}, +${s.delta} ${s.unidad}`).join('; ')}.` : etiqueta
  const d = acotar(0.91 * W, alto, ancho)
  async function terminar() {
    await datos.guardarSesion({ ...sesion, fin, terminada: true, como: comoQuedo(sesion, sets), origen: 'app' })
    haptico.finSesion()
    onTerminar()
  }
  return (
    <div className="panel">
      <div className="sesion-arriba" style={{ paddingTop: 24 }}>
        <h1 className="t-listo">Listo.</h1>
        <p className="t-sub">{frase}</p>
      </div>
      <div className="sesion-medio" ref={medio}>
        <div className="circulo-sitio" style={{ width: d, height: d }}>
          <Circulo d={d} />
          <Pez expresion="orgulloso" tamano={Math.min(96, d * 0.28)} style={{ right: -4, top: -Math.min(96, d * 0.28) * 0.6 }} />
        </div>
      </div>
      <div className="sesion-abajo">
        <div className="resumen-cifras">
          <div className="resumen-cifra"><span className="t-cifra">{minutos}</span><span className="t-unidad tenue">min</span></div>
          <div className="resumen-cifra"><span className="t-cifra">{hechosEj}</span><span className="t-unidad tenue">{hechosEj === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
          <div className="resumen-cifra"><span className="t-cifra">{propios.length}</span><span className="t-unidad tenue">series</span></div>
        </div>
        <BotonPrincipal onClick={terminar}>Cerrar</BotonPrincipal>
      </div>
    </div>
  )
}
