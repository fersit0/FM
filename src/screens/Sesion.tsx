import { useCallback, useMemo, useRef, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo, Ejercicio, Alternativa, SetLog, Version } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, buscarCualquiera, itemDeRutina } from '../data/ejercicios'
import { seriesPara, entraEnVersion, estadoSemana } from '../logic/semana'
import { sugerirPeso, subioDePeso, porSesion } from '../logic/progresion'
import { claveFecha } from '../logic/fechas'
import { unidadDe, incrementoDe, pesoDeSet, pesoInicial, aKg, convertir, formatoPeso, type Unidad } from '../logic/unidades'
import { useWakeLock } from '../hooks/useWakeLock'
import { useAlto } from '../hooks/useAlto'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { haptico } from '../lib/haptics'
import { prepararAudio, sonarClic, sonarFinDescanso } from '../lib/sonido'
import { abrirAtajo } from '../lib/atajos'
import { useCuentaRegresiva, mmss } from '../hooks/useCuentaRegresiva'
import { Circulo, Dial, Stepper, BotonPrincipal, BotonContorno, BotonTexto, Hoja, Grupo, Fila, Pez, TituloAjustable, Deshacer } from '../components/fm'
import { FichaHoja } from '../components/Ficha'
import { Foto } from '../components/Foto'

interface Props { datos: Datos; sesion: SesionTipo; activa: SesionActiva; setActiva: (a: SesionActiva | null) => void; onSalir: () => void; onTerminar: () => void }
type PasoEj = { tipo: 'ejercicio'; base: Ejercicio; item: Ejercicio | Alternativa; indice: number; series: number }
type Paso = { tipo: 'calentamiento' } | PasoEj | { tipo: 'cierre' } | { tipo: 'resumen' }
type Accion = { texto: string; deshacer: () => void | Promise<void> }
type Previo = { itemId: string; peso: number; reps: number; unidad: Unidad }

const minCal = (v: Version) => (v === 'corta' ? CALENTAMIENTO.minCorta : CALENTAMIENTO.minCompleta)
const minCierre = (v: Version) => (v === 'corta' ? CIERRE.minCorta : v === 'bonus' ? CIERRE.minBonus : CIERRE.minCompleta)
export function rangoDe(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}
/** diámetro del spec acotado al espacio disponible */
const acotar = (d: number, alto: number, ancho: number) => Math.max(120, Math.min(d, alto - 8, ancho - 8))

export function Sesion({ datos, sesion, activa, setActiva, onSalir, onTerminar }: Props) {
  const { settings, sets } = datos
  const version = sesion.version
  const ligera = !!sesion.ligera
  useWakeLock(true)
  const pasos = useMemo<Paso[]>(() => {
    const lista = ejerciciosDe(sesion.tipo as 'A' | 'B').filter((e) => entraEnVersion(e.orden, version))
    const ejercicios: Paso[] = lista.map((base, i) => {
      const cambio = sesion.cambios?.find((c) => c.ejercicioId === base.id)
      const item = cambio ? (cambio.alternativaId === base.id ? base : base.alternativas.find((a) => a.id === cambio.alternativaId) ?? base) : itemDeRutina(base, settings.reemplazos)
      return { tipo: 'ejercicio', base, item, indice: i, series: seriesPara(base.id, item.series, version, settings.seriesExtra, ligera) }
    })
    return [{ tipo: 'calentamiento' }, ...ejercicios, { tipo: 'cierre' }, { tipo: 'resumen' }]
  }, [sesion.tipo, sesion.cambios, version, settings.seriesExtra, settings.reemplazos, ligera])
  const ejercicios = pasos.filter((p): p is PasoEj => p.tipo === 'ejercicio')
  const indice = Math.min(activa.paso, pasos.length - 1)
  const paso = pasos[indice]
  const [accion, setAccion] = useState<Accion | null>(null)
  const previo = useRef<Previo | null>(null)
  const ir = useCallback((n: number) => {
    setActiva({ ...activa, paso: Math.max(0, Math.min(pasos.length - 1, n)), timerFin: undefined, timerSeg: undefined, descansoFin: undefined, descansoSeg: undefined, avisado: undefined })
  }, [activa, pasos.length, setActiva])
  const [menu, setMenu] = useState(false)
  const [tecnica, setTecnica] = useState(false)
  const [alternativas, setAlternativas] = useState(false)
  const [seriesHoy, setSeriesHoy] = useState(false)
  const cerrarAccion = useCallback(() => setAccion(null), [])

  const ultimoPesoDe = (it: Ejercicio | Alternativa) => {
    const g = porSesion(sets, it.id)
    const u = g[g.length - 1]
    if (!u) return 'Sin registro'
    const un = unidadDe(it, settings.unidades)
    const pesos = u.map((x) => pesoDeSet(x, un)).filter((x): x is number => x !== null)
    return pesos.length ? formatoPeso(Math.max(...pesos), un) : `${Math.max(...u.map((x) => x.reps))} reps`
  }
  function usarSiempre(base: Ejercicio, altId: string | null) {
    const reemplazos = { ...(settings.reemplazos ?? {}) }
    if (altId) reemplazos[base.id] = altId
    else delete reemplazos[base.id]
    datos.setSettings({ ...settings, reemplazos })
  }
  async function cambiarVersion(v: Version, lig: boolean) {
    await datos.guardarSesion({ ...sesion, version: v, ligera: lig })
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
  function saltarEjercicio() {
    const desde = indice
    setMenu(false)
    ir(indice + 1)
    setAccion({ texto: 'Ejercicio saltado.', deshacer: () => ir(desde) })
  }
  async function elegirAlternativa(alt: Alternativa | null) {
    if (paso.tipo !== 'ejercicio') return
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== paso.base.id)
    cambios.push({ ejercicioId: paso.base.id, alternativaId: alt ? alt.id : paso.base.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setTecnica(false)
    setAlternativas(false)
  }
  const descansando = activa.descansoFin !== undefined
  const setsHoy = sets.filter((s) => s.sessionId === sesion.id).sort((a, b) => a.hora - b.hora)

  return (
    <div className="pantalla sesion">
      {paso.tipo !== 'resumen' && (
        <header className="sesion-cabecera">
          <button className="icono-boton" onClick={() => setMenu(true)} aria-label="Opciones de la sesión">
            <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
          <span className="t-nota tenue">{paso.tipo === 'ejercicio' ? `${paso.indice + 1} de ${ejercicios.length}` : ''}</span>
        </header>
      )}
      {paso.tipo === 'calentamiento' && <PasoTiempo key="cal" titulo="Calentamiento" detalle={`Elíptica ${minCal(version)} min, ritmo en el que puedes platicar.`} nota={CALENTAMIENTO.siOcupada} minutos={minCal(version)} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {paso.tipo === 'ejercicio' && !descansando && (
        <PasoSerie key={paso.item.id} datos={datos} sesion={sesion} paso={paso} sets={sets} activa={activa} setActiva={setActiva} previo={previo.current} onTecnica={() => setTecnica(true)} onSiguiente={() => ir(indice + 1)}
          onGuardado={(id, p) => { previo.current = p; setAccion({ texto: 'Serie guardada.', deshacer: async () => { await datos.borrarSet(id); setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined }) } }) }} />
      )}
      {paso.tipo === 'ejercicio' && descansando && activa.descansoFin !== undefined && (
        <PasoDescanso key={`d${activa.descansoFin}`} paso={paso} sets={sets} sesion={sesion} fin={activa.descansoFin} total={activa.descansoSeg ?? paso.item.descansoSeg} avisado={!!activa.avisado} unidad={unidadDe(paso.item, settings.unidades)}
          onMas={() => setActiva({ ...activa, descansoFin: (activa.descansoFin ?? Date.now()) + 15_000, descansoSeg: (activa.descansoSeg ?? paso.item.descansoSeg) + 15 })}
          onAvisar={() => { abrirAtajo(((activa.descansoFin ?? Date.now()) - Date.now()) / 1000); setActiva({ ...activa, avisado: true }) }}
          onSaltar={() => { const antes = { ...activa }; setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined }); setAccion({ texto: 'Descanso saltado.', deshacer: () => setActiva(antes) }) }}
          onSiguienteEjercicio={() => { const antes = { ...activa }; ir(indice + 1); setAccion({ texto: 'Descanso saltado.', deshacer: () => setActiva(antes) }) }} />
      )}
      {paso.tipo === 'cierre' && <PasoTiempo key="cierre" titulo="Cierre" detalle={`Elíptica o saco, ${minCierre(version)} min.`} nota="Saco: 4 rounds de 2 min con 1 de descanso." minutos={minCierre(version)} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {paso.tipo === 'resumen' && <Resumen datos={datos} sesion={sesion} sets={sets} ejercicios={ejercicios} onTerminar={onTerminar} />}

      {accion && <Deshacer texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={cerrarAccion} />}

      <Hoja abierta={menu} onCerrar={() => setMenu(false)}>
        <Grupo>
          {paso.tipo === 'ejercicio' && <Fila texto="Ver técnica" onClick={() => { setMenu(false); setTecnica(true) }} />}
          {paso.tipo === 'ejercicio' && <Fila texto="Cambiar por alternativa" detalle="Si la máquina está ocupada o no te late" onClick={() => { setMenu(false); setAlternativas(true) }} />}
          <Fila texto="Series de hoy" detalle={`${setsHoy.length} registradas, editar o borrar`} onClick={() => { setMenu(false); setSeriesHoy(true) }} />
          {indice > 0 && <Fila texto={paso.tipo === 'ejercicio' && paso.indice > 0 ? 'Ejercicio anterior' : 'Paso anterior'} onClick={() => { setMenu(false); ir(indice - 1) }} />}
          {paso.tipo !== 'resumen' && <Fila texto={paso.tipo === 'ejercicio' ? 'Saltar ejercicio' : 'Saltar'} onClick={saltarEjercicio} />}
          <Fila texto="Seguir después" detalle="Se queda guardada donde vas" onClick={() => { setMenu(false); onSalir() }} />
          <Fila texto="Terminar sesión" detalle="Guarda lo hecho y va al resumen" onClick={terminar} />
          <Fila texto="Descartar sesión" detalle="Se borran las series de hoy" onClick={descartar} />
        </Grupo>
        <Grupo titulo="Versión">
          {(['completa', 'corta', 'bonus'] as Version[]).map((v) => (
            <Fila key={v} texto={v === 'completa' ? 'Completa' : v === 'corta' ? 'Corta, ejercicios 1 a 4 con 2 series' : 'Bonus, cierre de 20 min'} dato={version === v && !ligera ? 'Activa' : ''} onClick={() => cambiarVersion(v, false)} />
          ))}
          <Fila texto="Ligera, 2 series con el mismo peso" dato={ligera ? 'Activa' : ''} onClick={() => cambiarVersion(version === 'corta' ? 'completa' : version, !ligera)} />
        </Grupo>
      </Hoja>
      <Hoja abierta={seriesHoy} titulo="Series de hoy" altura="completa" onCerrar={() => setSeriesHoy(false)}>
        {setsHoy.length === 0 ? <p className="t-cuerpo tenue">Todavía no hay series.</p> : (
          <Grupo>{setsHoy.map((s) => <SerieEditable key={s.id} set={s} datos={datos} />)}</Grupo>
        )}
      </Hoja>
      {paso.tipo === 'ejercicio' && <FichaHoja abierta={tecnica} onCerrar={() => setTecnica(false)} base={paso.base} item={paso.item} datos={datos} series={paso.series} onElegirAlternativa={elegirAlternativa} />}
      {paso.tipo === 'ejercicio' && (
        <Hoja abierta={alternativas} titulo="Cambiar por" onCerrar={() => setAlternativas(false)}>
          <Grupo>
            {[paso.base, ...paso.base.alternativas].filter((a) => a.id !== paso.item.id).map((a) => {
              const siempre = a.id === paso.base.id ? !settings.reemplazos?.[paso.base.id] : settings.reemplazos?.[paso.base.id] === a.id
              return (
                <div key={a.id} className="fila" style={{ alignItems: 'flex-start' }}>
                  <Foto clave={a.ilustracion} ejercicioId={a.id} propias={datos.fotosEjercicio} nombre={a.nombre} chica />
                  <span className="fila-texto" style={{ gap: 6 }}>
                    <button className="t-cuerpo" style={{ textAlign: 'left', whiteSpace: 'normal' }} onClick={() => elegirAlternativa(a.id === paso.base.id ? null : (a as Alternativa))}>{a.nombre}</button>
                    <span className="t-nota tenue">{'caso' in a ? `${a.caso}. ` : 'Original. '}{ultimoPesoDe(a)}</span>
                    <button className="t-nota" style={{ textAlign: 'left', color: siempre ? 'var(--rojo)' : 'var(--texto-2)' }} onClick={() => usarSiempre(paso.base, a.id === paso.base.id ? null : a.id)}>{siempre ? 'Es la de siempre' : 'Usar siempre esta'}</button>
                  </span>
                </div>
              )
            })}
          </Grupo>
        </Hoja>
      )}
    </div>
  )
}

/** Fila editable de una serie: peso en la unidad del ejercicio y reps, con Borrar */
export function SerieEditable({ set, datos }: { set: SetLog; datos: Datos }) {
  const info = buscarCualquiera(set.exerciseId)
  const unidad: Unidad = info ? unidadDe(info.item, datos.settings.unidades) : 'kg'
  const [peso, setPeso] = useState(() => { const p = pesoDeSet(set, unidad); return p === null ? '' : String(p) })
  const [reps, setReps] = useState(String(set.reps))
  async function guardar() {
    const p = peso === '' ? null : parseFloat(peso.replace(',', '.'))
    const r = parseInt(reps, 10)
    if (Number.isNaN(r) || r <= 0 || (p !== null && Number.isNaN(p))) return
    await datos.guardarSet({ ...set, pesoKg: p === null ? null : aKg(p, unidad), peso: p ?? undefined, unidad: p === null ? undefined : unidad, reps: r })
  }
  return (
    <div className="fila" style={{ flexWrap: 'wrap', gap: 8 }}>
      <span className="fila-texto"><span className="t-cuerpo">{info?.item.nombre ?? set.exerciseId}</span><span className="t-nota tenue">Serie {set.numSerie}</span></span>
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {set.pesoKg !== null && <input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} onBlur={guardar} aria-label="Peso" style={{ width: 64, textAlign: 'right', borderBottom: '1px solid var(--separador)' }} />}
        {set.pesoKg !== null && <span className="t-nota tenue">{unidad}</span>}
        <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} onBlur={guardar} aria-label="Reps" style={{ width: 44, textAlign: 'right', borderBottom: '1px solid var(--separador)' }} />
        <span className="t-nota tenue">{set.exerciseId.startsWith('A7') ? 's' : 'reps'}</span>
        <BotonTexto onClick={() => confirm('¿Borrar esta serie?') && set.id !== undefined && datos.borrarSet(set.id)}>Borrar</BotonTexto>
      </span>
    </div>
  )
}

// ---------- 7.1 Calentamiento y cierre ----------
function PasoTiempo({ titulo, detalle, nota, minutos, activa, setActiva, onListo }: { titulo: string; detalle: string; nota: string; minutos: number; activa: SesionActiva; setActiva: (a: SesionActiva) => void; onListo: () => void }) {
  usePantalla('calentamiento')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const fin = activa.timerFin
  const restante = useCuentaRegresiva(fin)
  const [termino, setTermino] = useState(false)
  const d = acotar(0.8 * W, alto, ancho)
  if (fin !== undefined && restante <= 0 && !termino) {
    setTermino(true)
    if (document.visibilityState === 'visible') { haptico.finDescanso(); sonarFinDescanso() }
  }
  return (
    <div className="panel">
      <div className="sesion-arriba">
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
function PasoSerie({ datos, sesion, paso, sets, activa, setActiva, previo, onTecnica, onSiguiente, onGuardado }: { datos: Datos; sesion: SesionTipo; paso: PasoEj; sets: SetLog[]; activa: SesionActiva; setActiva: (a: SesionActiva) => void; previo: Previo | null; onTecnica: () => void; onSiguiente: () => void; onGuardado: (id: number, p: Previo) => void }) {
  usePantalla('serie')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const { base, item, series } = paso
  const { settings } = datos
  const unidad = unidadDe(item, settings.unidades)
  const otra: Unidad = unidad === 'kg' ? 'lb' : 'kg'
  const incremento = incrementoDe(item, unidad)
  const hechos = useMemo(() => sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie), [sets, sesion.id, item.id])
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo, item.repsMin), [historial, item.id, item.repsMax, item.modo, item.repsMin])
  const ultimaVez = useMemo(() => porSesion(historial, item.id).slice(-1)[0], [historial, item.id])
  const siguienteNum = hechos.length + 1
  const completo = hechos.length >= series
  const ultimo = hechos[hechos.length - 1]
  const primeraVez = sugerencia.tipo === 'inicial' && !ultimo
  const pesoBase = (() => {
    if (!ultimaVez) return null
    const pesos = ultimaVez.map((s) => pesoDeSet(s, unidad)).filter((x): x is number => x !== null)
    return pesos.length ? Math.max(...pesos) : null
  })()
  const pesoSugerido = pesoBase === null ? null : sugerencia.tipo === 'subir' ? pesoBase + incremento : sugerencia.tipo === 'bajar' ? Math.max(0, pesoBase - incremento) : pesoBase
  const [peso, setPeso] = useState<number>(() => {
    if (previo && previo.itemId === item.id) return convertir(previo.peso, previo.unidad, unidad)
    const ult = ultimo ? pesoDeSet(ultimo, unidad) : null
    if (ult !== null) return ult
    if (pesoSugerido !== null) return pesoSugerido
    return item.modo === 'peso' ? pesoInicial(item, unidad) : 0
  })
  const [reps, setReps] = useState<number>(() => (previo && previo.itemId === item.id ? previo.reps : ultimo?.reps ?? (item.modo === 'tiempo' ? item.repsMax : item.repsMax || 10)))
  const [error, setError] = useState(false)
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState('')

  const serieActual = Math.min(siguienteNum, series)
  const dSpec = series <= 1 ? 0.66 * W : 0.48 * W + (0.36 * W * (serieActual - 1)) / (series - 1)
  const d = acotar(dSpec, alto, ancho)
  const largo = String(peso).length
  const cifra = Math.round(d * 0.42 * (largo <= 2 ? 1 : largo === 3 ? 0.88 : largo === 4 ? 0.76 : 0.64))

  function cambiarUnidad() {
    datos.setSettings({ ...settings, unidades: { ...(settings.unidades ?? {}), [item.id]: otra } })
    setPeso(convertir(peso, unidad, otra))
  }
  async function serieHecha() {
    prepararAudio()
    if (reps <= 0) return
    const ahora = Date.now()
    let id: number
    try {
      id = await datos.guardarSet({ sessionId: sesion.id, exerciseId: item.id, ejercicioBaseId: base.id, numSerie: siguienteNum, pesoKg: item.modo === 'peso' ? aKg(peso, unidad) : null, peso: item.modo === 'peso' ? peso : undefined, unidad: item.modo === 'peso' ? unidad : undefined, reps, fecha: claveFecha(new Date(ahora)), hora: ahora })
    } catch { setError(true); return }
    setError(false)
    sonarClic()
    if (siguienteNum >= series) haptico.finEjercicio(); else haptico.serieHecha()
    setActiva({ ...activa, descansoFin: ahora + item.descansoSeg * 1000, descansoSeg: item.descansoSeg, avisado: undefined })
    onGuardado(id, { itemId: item.id, peso, reps, unidad })
  }
  function confirmarTexto() {
    const v = parseFloat(texto.replace(',', '.'))
    if (!Number.isNaN(v) && v >= 0) setPeso(Math.round(v * 100) / 100)
    setEditando(false)
  }

  let aviso: string | null = null
  if (error) aviso = 'No se guardó la serie. Toca para reintentar.'
  else if (hechos.length === 0) {
    if (sugerencia.tipo === 'subir' && ultimaVez && pesoSugerido !== null) aviso = `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Sube a ${formatoPeso(pesoSugerido, unidad)}.`
    else if (sugerencia.tipo === 'bajar' && pesoSugerido !== null) aviso = `Dos veces seguidas bajaron las reps. Baja a ${formatoPeso(pesoSugerido, unidad)}.`
    else if (sugerencia.tipo === 'quedarse' && pesoBase !== null) aviso = `La vez pasada no llegaste al mínimo. Quédate en ${formatoPeso(pesoBase, unidad)} o baja.`
    else if (primeraVez && item.modo === 'peso') aviso = 'Primera vez: empieza con este y ajusta.'
    else if (base.orden === 1 && item.modo === 'peso' && peso > 0) aviso = `Antes, una de aproximación con ${formatoPeso(Math.round(peso / 2 / incremento) * incremento || incremento, unidad)}, 10 reps. No se registra.`
  }

  return (
    <div className="panel">
      <div className="sesion-arriba">
        <div className="sesion-titulo-fila" style={{ alignItems: 'flex-start' }}>
          <TituloAjustable texto={item.nombre} />
          <Foto clave={item.ilustracion} ejercicioId={item.id} propias={datos.fotosEjercicio} nombre={item.nombre} chica onClick={onTecnica} />
        </div>
        <div className="sesion-titulo-fila">
          <p className="t-sub">{completo ? `${series} series hechas` : `Serie ${serieActual} de ${series}`}</p>
          <BotonTexto subrayado onClick={onTecnica}>Técnica</BotonTexto>
        </div>
        {aviso && <p className="t-cuerpo tenue sesion-aviso" onClick={error ? serieHecha : undefined}>{aviso}</p>}
      </div>
      <div className="sesion-medio" ref={medio}>
        <Circulo d={d}>
          {item.modo === 'peso' ? (
            <div className="circulo-contenido">
              {editando ? (
                <input className="cifra-input" style={{ fontSize: cifra, fontWeight: 700, letterSpacing: '-0.05em', width: d * 0.9 }} inputMode="decimal" value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={confirmarTexto} onKeyDown={(e) => e.key === 'Enter' && confirmarTexto()} autoFocus aria-label="Peso" />
              ) : (
                <span className="circulo-cifra" style={{ fontSize: cifra }}>
                  <button className="circulo-cifra" style={{ fontSize: cifra }} onClick={() => { setTexto(String(peso)); setEditando(true) }} aria-label={`Peso ${peso} ${unidad}, tocar para escribir`}>{peso}</button>
                  <button className="kg" style={{ fontSize: Math.max(20, Math.round(cifra * 0.3)) }} onClick={cambiarUnidad} aria-label={`Cambiar a ${otra}`}>{unidad}</button>
                </span>
              )}
              <span className="circulo-equivalencia" style={{ fontSize: Math.max(15, Math.round(cifra * 0.22)) }}>{formatoPeso(convertir(peso, unidad, otra), otra)}</span>
            </div>
          ) : (
            <span className="circulo-cifra" style={{ fontSize: cifra }}>{reps}<span className="kg" style={{ fontSize: Math.max(20, Math.round(cifra * 0.3)) }}>{item.modo === 'tiempo' ? 's' : ''}</span></span>
          )}
        </Circulo>
      </div>
      <div className="sesion-abajo">
        {item.modo === 'peso' && <Dial valor={peso} onChange={setPeso} paso={incremento} max={unidad === 'lb' ? 500 : 250} />}
        <Stepper valor={reps} onChange={setReps} unidad={item.modo === 'tiempo' ? 'segundos' : 'reps'} min={item.modo === 'tiempo' ? 5 : 1} max={item.modo === 'tiempo' ? 300 : 99} />
        {completo ? <BotonPrincipal onClick={onSiguiente}>Siguiente ejercicio</BotonPrincipal> : <BotonPrincipal onClick={serieHecha}>Serie hecha</BotonPrincipal>}
      </div>
    </div>
  )
}

// ---------- 6.3 Descanso ----------
function PasoDescanso({ paso, sets, sesion, fin, total, avisado, unidad, onMas, onAvisar, onSaltar, onSiguienteEjercicio }: { paso: PasoEj; sets: SetLog[]; sesion: SesionTipo; fin: number; total: number; avisado: boolean; unidad: Unidad; onMas: () => void; onAvisar: () => void; onSaltar: () => void; onSiguienteEjercicio: () => void }) {
  usePantalla('descanso')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const { item, series } = paso
  const hechos = sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie)
  const ultimo = hechos[hechos.length - 1]
  const siguiente = hechos.length + 1
  const ejercicioCompleto = hechos.length >= series
  const restante = useCuentaRegresiva(fin)
  const termino = restante <= 0
  const tarde = restante < -3000
  const [avisadoFin, setAvisadoFin] = useState(false)
  if (termino && !avisadoFin) {
    setAvisadoFin(true)
    if (document.visibilityState === 'visible') { haptico.finDescanso(); if (!avisado) sonarFinDescanso() }
  }
  const progreso = Math.max(0, Math.min(1, restante / (total * 1000)))
  const dMax = acotar(0.96 * W, alto, ancho), dMin = Math.min(0.56 * W, dMax)
  const d = dMin + (dMax - dMin) * progreso
  const pesoUlt = ultimo ? pesoDeSet(ultimo, unidad) : null
  const sigue = ejercicioCompleto ? 'Sigue: el siguiente ejercicio' : `Sigue: serie ${siguiente}${pesoUlt !== null ? `, ${formatoPeso(pesoUlt, unidad)}` : ''}`
  return (
    <div className="panel">
      <div className="sesion-arriba"><h1 className="t-descanso">Descanso</h1></div>
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
function Resumen({ datos, sesion, sets, ejercicios, onTerminar }: { datos: Datos; sesion: SesionTipo; sets: SetLog[]; ejercicios: PasoEj[]; onTerminar: () => void }) {
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
    const max = (g: SetLog[]) => Math.max(...g.map((s) => pesoDeSet(s, unidad) ?? 0))
    return { nombre: (info?.item.nombre ?? id).toLowerCase(), delta: Math.round((i > 0 ? max(grupos[i]) - max(grupos[i - 1]) : 0) * 10) / 10, unidad }
  })
  const minutos = Math.max(1, Math.round((fin - sesion.inicio) / 60000))
  const hechosEj = ejercicios.filter((e) => propios.some((s) => s.exerciseId === e.item.id)).length
  const cumpleSemana = estadoSemana([...datos.sesiones.filter((s) => s.id !== sesion.id), { ...sesion, terminada: true }], new Date(fin)).hechas === 3
  const frase = subieron.length ? `Subiste en ${subieron.map((s) => `${s.nombre}, +${s.delta} ${s.unidad}`).join('; ')}.` : cumpleSemana ? `${sesion.tipo} hecha. Con esta, semana cumplida.` : `${sesion.tipo} hecha. Mañana te vas a acordar.`
  const d = acotar(0.91 * W, alto, ancho)
  async function terminar() {
    await datos.guardarSesion({ ...sesion, fin, terminada: true })
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
