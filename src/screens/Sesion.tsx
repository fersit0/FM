import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo, Ejercicio, Alternativa, SetLog, Version, Modo } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
import { CALENTAMIENTO, CIERRE, CAMBIO_PAR_SEG, buscarCualquiera, itemDeRutina, bloquesDe, alternativasDisponibles } from '../data/ejercicios'
import { seriesPara, estadoSemana, secuenciaDePar } from '../logic/semana'
import { minutosCalentamiento, minutosCierre } from '../logic/duracion'
import { sugerirPeso, subioDePeso, porSesion } from '../logic/progresion'
import { claveFecha } from '../logic/fechas'
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
/** Un ejercicio dentro de un bloque: el de la rutina (base) y el que se hace (item: base o alternativa) */
export type ItemBloque = { base: Ejercicio; item: Ejercicio | Alternativa; series: number }
export type PasoBloque = { tipo: 'bloque'; numero: number; items: ItemBloque[]; indice: number }
type Paso = { tipo: 'calentamiento' } | PasoBloque | { tipo: 'cierre' } | { tipo: 'resumen' }
type Accion = { texto: string; deshacer: () => void | Promise<void> }

export function rangoDe(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}
/** diámetro del spec acotado al espacio disponible */
const acotar = (d: number, alto: number, ancho: number) => Math.max(88, Math.min(d, alto - 4, ancho - 8))

/** Series hechas en esta sesión para cada ejercicio del bloque. Cuentan por bloque de la rutina (ejercicioBaseId):
 *  una serie hecha en una alternativa cuenta igual, así se puede regresar al original y seguir con las que faltan. */
export function hechosDeBloque(sets: SetLog[], sesionId: string, bloque: PasoBloque): SetLog[][] {
  return bloque.items.map((it) => sets.filter((s) => s.sessionId === sesionId && s.ejercicioBaseId === it.base.id).sort((a, b) => a.hora - b.hora))
}
/** Qué ejercicio del bloque toca ahora (índice) o null si el bloque está completo */
export function cualToca(bloque: PasoBloque, hechos: SetLog[][]): number | null {
  const seq = secuenciaDePar(bloque.items.map((it) => it.series))
  const n = hechos.reduce((a, h) => a + h.length, 0)
  return n < seq.length ? seq[n] : null
}
/** Tras una serie del ejercicio `cual` con `n` series ya hechas en el bloque: 15 s de cambio si sigue el otro del par, si no el descanso del bloque */
export function descansoTras(bloque: PasoBloque, cual: number, nTotal: number): { seg: number; cambio: boolean } {
  const seq = secuenciaDePar(bloque.items.map((it) => it.series))
  const sigue = seq[nTotal + 1]
  if (sigue !== undefined && sigue !== cual) return { seg: CAMBIO_PAR_SEG, cambio: true }
  return { seg: bloque.items[0].item.descansoSeg, cambio: false }
}

export function Sesion({ datos, sesion, activa, setActiva, onSalir, onTerminar }: Props) {
  const { settings, sets } = datos
  const version = sesion.version
  const ligera = !!sesion.ligera
  const casa = sesion.tipo === 'CASA'
  useWakeLock(true)
  const bloques = useMemo(() => bloquesDe(sesion.tipo as 'A' | 'B' | 'CASA', version, !!sesion.pierna), [sesion.tipo, version, sesion.pierna])
  const pasos = useMemo<Paso[]>(() => {
    const lista: Paso[] = bloques.map((b, i) => ({
      tipo: 'bloque', numero: b.numero, indice: i,
      items: b.ejercicios.map((base) => {
        const cambio = sesion.cambios?.find((c) => c.ejercicioId === base.id)
        const item = cambio ? (cambio.alternativaId === base.id ? base : base.alternativas.find((a) => a.id === cambio.alternativaId) ?? base) : itemDeRutina(base, settings.reemplazos)
        const series = casa ? item.series : seriesPara(base.id, item.series, version, settings.seriesExtra, ligera)
        return { base, item, series }
      }),
    }))
    return casa ? [...lista, { tipo: 'resumen' }] : [{ tipo: 'calentamiento' }, ...lista, { tipo: 'cierre' }, { tipo: 'resumen' }]
  }, [bloques, sesion.cambios, version, settings.seriesExtra, settings.reemplazos, ligera, casa])
  const nBloques = bloques.length
  const indice = Math.min(activa.paso, pasos.length - 1)
  const paso = pasos[indice]
  const bloque = paso.tipo === 'bloque' ? paso : null
  const hechos = useMemo(() => (bloque ? hechosDeBloque(sets, sesion.id, bloque) : []), [sets, sesion.id, bloque])
  const toca = bloque ? cualToca(bloque, hechos) : null
  // el ejercicio que se muestra: el que toca, o el último del bloque si ya está completo
  const cual = toca ?? (bloque ? bloque.items.length - 1 : 0)
  const actual = bloque ? bloque.items[cual] : null
  const [accion, setAccion] = useState<Accion | null>(null)
  const ir = useCallback((n: number) => {
    setActiva({ ...activa, paso: Math.max(0, Math.min(pasos.length - 1, n)), timerFin: undefined, timerSeg: undefined, descansoFin: undefined, descansoSeg: undefined, avisado: undefined, cambio: undefined, borrador: undefined })
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
    await datos.guardarSesion({ ...sesion, version: v, ligera: lig, pierna: v === 'corta' ? false : sesion.pierna })
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
  function saltarBloque() {
    const desde = indice
    setMenu(false)
    ir(indice + 1)
    setAccion({ texto: bloque && bloque.items.length > 1 ? 'Par saltado.' : 'Ejercicio saltado.', deshacer: () => ir(desde) })
  }
  async function elegirAlternativa(alt: Alternativa | null) {
    if (!actual) return
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== actual.base.id)
    cambios.push({ ejercicioId: actual.base.id, alternativaId: alt ? alt.id : actual.base.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setTecnica(false)
    setAlternativas(false)
  }
  const descansando = activa.descansoFin !== undefined
  const setsHoy = sets.filter((s) => s.sessionId === sesion.id).sort((a, b) => a.hora - b.hora)
  const minCal = minutosCalentamiento(version)
  const minCierre = minutosCierre(version, !!sesion.pierna)
  const disponibles = actual ? alternativasDisponibles(actual.base, bloques, sesion.cambios, settings.reemplazos) : []

  return (
    <div className="pantalla sesion">
      {paso.tipo !== 'resumen' && (
        <header className="sesion-cabecera">
          <button className="icono-boton" onClick={() => setMenu(true)} aria-label="Opciones de la sesión">
            <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
          <span className="t-nota tenue">{bloque ? `${bloque.indice + 1} de ${nBloques}` : ''}</span>
        </header>
      )}
      {paso.tipo === 'calentamiento' && <PasoTiempo key="cal" titulo="Calentamiento" detalle={`Elíptica ${minCal} min, ritmo en el que puedes platicar.`} nota={CALENTAMIENTO.siOcupada} minutos={minCal} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {bloque && actual && !descansando && (
        <PasoSerie key={`${bloque.numero}-${actual.item.id}`} datos={datos} sesion={sesion} bloque={bloque} cual={cual} hechos={hechos} sets={sets} activa={activa} setActiva={setActiva} onTecnica={() => setTecnica(true)} onSiguiente={() => ir(indice + 1)} onSeries={() => setSeriesHoy(true)} onVolverOriginal={() => elegirAlternativa(null)}
          onGuardado={(id) => setAccion({ texto: 'Serie guardada.', deshacer: async () => { await datos.borrarSet(id); setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined, cambio: undefined }) } })} />
      )}
      {bloque && descansando && activa.descansoFin !== undefined && (
        <PasoDescanso key={`d${activa.descansoFin}`} bloque={bloque} hechos={hechos} sesion={sesion} fin={activa.descansoFin} total={activa.descansoSeg ?? bloque.items[0].item.descansoSeg} cambio={!!activa.cambio} avisado={!!activa.avisado} unidades={settings.unidades}
          onMas={() => setActiva({ ...activa, descansoFin: (activa.descansoFin ?? Date.now()) + 15_000, descansoSeg: (activa.descansoSeg ?? bloque.items[0].item.descansoSeg) + 15 })}
          onAvisar={() => { abrirAtajo(((activa.descansoFin ?? Date.now()) - Date.now()) / 1000); setActiva({ ...activa, avisado: true }) }}
          onSaltar={() => { const antes = { ...activa }; setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined, cambio: undefined }); setAccion({ texto: activa.cambio ? 'Cambio saltado.' : 'Descanso saltado.', deshacer: () => setActiva(antes) }) }}
          onSiguienteBloque={() => { const antes = { ...activa }; ir(indice + 1); setAccion({ texto: 'Descanso saltado.', deshacer: () => setActiva(antes) }) }} />
      )}
      {paso.tipo === 'cierre' && <PasoTiempo key="cierre" titulo="Cierre" detalle={`Elíptica o saco, ${minCierre} min.${sesion.pierna ? ' Hubo pierna: cierre corto.' : ''}`} nota={CIERRE.saco} minutos={minCierre} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {paso.tipo === 'resumen' && <Resumen datos={datos} sesion={sesion} sets={sets} items={pasos.flatMap((p) => (p.tipo === 'bloque' ? p.items : []))} onTerminar={onTerminar} />}

      {accion && <Deshacer texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={cerrarAccion} />}

      <Hoja abierta={menu} onCerrar={() => setMenu(false)}>
        <Grupo>
          {actual && <Fila texto="Ver técnica" onClick={() => { setMenu(false); setTecnica(true) }} />}
          {actual && <Fila texto="Cambiar por alternativa" detalle="Si la máquina está ocupada o no te late" onClick={() => { setMenu(false); setAlternativas(true) }} />}
          <Fila texto="Series de hoy" detalle={`${setsHoy.length} registradas, editar o borrar`} onClick={() => { setMenu(false); setSeriesHoy(true) }} />
          {indice > 0 && <Fila texto={bloque && bloque.indice > 0 ? 'Ejercicio anterior' : 'Paso anterior'} onClick={() => { setMenu(false); ir(indice - 1) }} />}
          {paso.tipo !== 'resumen' && <Fila texto={bloque ? (bloque.items.length > 1 ? 'Saltar el par' : 'Saltar ejercicio') : 'Saltar'} onClick={saltarBloque} />}
          <Fila texto="Seguir después" detalle="Se queda guardada donde vas" onClick={() => { setMenu(false); onSalir() }} />
          <Fila texto="Terminar sesión" detalle="Guarda lo hecho y va al resumen" onClick={terminar} />
          <Fila texto="Descartar sesión" detalle="Se borran las series de hoy" onClick={descartar} />
        </Grupo>
        {!casa && (
          <Grupo titulo="Versión">
            {(['completa', 'corta', 'bonus'] as Version[]).map((v) => (
              <Fila key={v} texto={v === 'completa' ? 'Completa' : v === 'corta' ? 'Corta, bloques 1, 2 y laterales con 2 series' : 'Bonus, cierre de 20 min'} dato={version === v && !ligera ? 'Activa' : ''} onClick={() => cambiarVersion(v, false)} />
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
      {actual && <FichaHoja abierta={tecnica} onCerrar={() => setTecnica(false)} base={actual.base} item={actual.item} datos={datos} series={actual.series} alternativas={disponibles} onElegirAlternativa={elegirAlternativa} />}
      {actual && (
        <Hoja abierta={alternativas} titulo="Cambiar por" onCerrar={() => setAlternativas(false)}>
          <Grupo>
            {[actual.base, ...disponibles].filter((a) => a.id !== actual.item.id).map((a) => {
              const siempre = a.id === actual.base.id ? !settings.reemplazos?.[actual.base.id] : settings.reemplazos?.[actual.base.id] === a.id
              return (
                <div key={a.id} className="fila" style={{ alignItems: 'flex-start' }}>
                  <Foto clave={a.ilustracion} ejercicioId={a.id} propias={datos.fotosEjercicio} nombre={a.nombre} modo="chica" />
                  <span className="fila-texto" style={{ gap: 6 }}>
                    <button className="t-cuerpo" style={{ textAlign: 'left', whiteSpace: 'normal' }} onClick={() => elegirAlternativa(a.id === actual.base.id ? null : (a as Alternativa))}>{a.nombre}</button>
                    <span className="t-nota tenue">{'caso' in a ? `${a.caso}. ` : 'Original. '}{ultimoPesoDe(a)}</span>
                    <button className="t-nota" style={{ textAlign: 'left', color: siempre ? 'var(--rojo)' : 'var(--texto-2)' }} onClick={() => usarSiempre(actual.base, a.id === actual.base.id ? null : a.id)}>{siempre ? 'Es la de siempre' : 'Usar siempre esta'}</button>
                  </span>
                </div>
              )
            })}
          </Grupo>
          {hechos[cual]?.length > 0 && <p className="t-nota tenue">Las series que ya hiciste en este bloque cuentan igual: con la alternativa sigues en la serie {hechos[cual].length + 1}.</p>}
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
      <span className="fila-texto"><span className="t-cuerpo">{info?.item.nombre ?? set.exerciseId}</span><span className="t-nota tenue">Serie {set.numSerie}</span></span>
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

// ---------- 7.1 Calentamiento y cierre ----------
function PasoTiempo({ titulo, detalle, nota, minutos, activa, setActiva, onListo }: { titulo: string; detalle: string; nota: string; minutos: number; activa: SesionActiva; setActiva: (a: SesionActiva) => void; onListo: () => void }) {
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

function PasoSerie({ datos, sesion, bloque, cual, hechos: hechosTodos, sets, activa, setActiva, onTecnica, onSiguiente, onGuardado, onSeries, onVolverOriginal }: { datos: Datos; sesion: SesionTipo; bloque: PasoBloque; cual: number; hechos: SetLog[][]; sets: SetLog[]; activa: SesionActiva; setActiva: (a: SesionActiva) => void; onTecnica: () => void; onSiguiente: () => void; onGuardado: (id: number) => void; onSeries: () => void; onVolverOriginal: () => void }) {
  usePantalla('serie')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const { base, item, series } = bloque.items[cual]
  const par = bloque.items.length > 1
  const { settings } = datos
  const unidad = unidadDe(item, settings.unidades)
  const otra: Unidad = unidad === 'kg' ? 'lb' : 'kg'
  const incremento = incrementoDe(item, unidad)
  const conPeso = item.modo === 'peso'
  const esAlternativa = item.id !== base.id
  // series del bloque en esta sesión (cuentan aunque se hayan hecho en una alternativa)
  const hechos = hechosTodos[cual]
  const nTotal = hechosTodos.reduce((a, h) => a + h.length, 0)
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo, item.repsMin), [historial, item.id, item.repsMax, item.modo, item.repsMin])
  const ultimaVez = useMemo(() => porSesion(historial, item.id).slice(-1)[0], [historial, item.id])
  const siguienteNum = hechos.length + 1
  const completo = cualToca(bloque, hechosTodos) === null
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
    if (nTotal + 1 >= secuenciaDePar(bloque.items.map((it) => it.series)).length) haptico.finEjercicio(); else haptico.serieHecha()
    const d = descansoTras(bloque, cual, nTotal)
    setActiva({ ...activa, descansoFin: ahora + d.seg * 1000, descansoSeg: d.seg, cambio: d.cambio, avisado: undefined, borrador: { itemId: item.id, peso, reps, unidad } })
    onGuardado(id)
  }
  function confirmarTexto() {
    const v = parseFloat(texto.replace(',', '.'))
    if (!Number.isNaN(v) && v >= 0) setPeso(Math.round(v * 100) / 100)
    setEditando(false)
  }

  let aviso: ReactNode = null
  if (error) aviso = <span onClick={serieHecha}>No se guardó la serie. Toca para reintentar.</span>
  else if (hechos.length > 0) {
    aviso = <>{conPeso ? `Hechas en ${unidad}: ` : 'Hechas: '}{hechos.map((h) => textoSerie(h, item.modo, unidad, incremento) + (h.exerciseId !== item.id ? ` (${buscarCualquiera(h.exerciseId)?.item.nombre.toLowerCase() ?? 'otra'})` : '')).join(', ')}. <button onClick={onSeries}>Editar</button></>
  } else {
    if (sugerencia.tipo === 'subir' && ultimaVez && pesoSugerido !== null) aviso = invertida ? `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Menos ayuda: ${formatoPeso(pesoSugerido, unidad)}.` : `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Sube a ${formatoPeso(pesoSugerido, unidad)}.`
    else if (sugerencia.tipo === 'bajar' && pesoSugerido !== null) aviso = `Dos veces seguidas bajaron las reps. Baja a ${formatoPeso(pesoSugerido, unidad)}.`
    else if (sugerencia.tipo === 'quedarse' && pesoBase !== null) aviso = `La vez pasada no llegaste al mínimo. Quédate en ${formatoPeso(pesoBase, unidad)} o baja.`
    else if (primeraVez && conPeso) aviso = item.id.startsWith('prensa') ? 'Primera vez: tantea. Un disco de 45 por lado y 10 reps; si fue fácil, dos por lado; de ahí sube 25 por lado hasta que 12 cuesten.' : 'Primera vez: empieza con este y ajusta.'
    else if (bloque.numero === 1 && conPeso && peso > 0) aviso = `Antes, una de aproximación con ${formatoPeso(redondearAPaso(peso / 2, incremento) || incremento, unidad)}, 10 reps. No se registra.`
  }

  return (
    <div className="panel">
      <div className="sesion-arriba">
        <div className="sesion-titulo-fila"><TituloAjustable texto={item.nombre} /></div>
        <div className="sesion-titulo-fila">
          <p className="t-sub">{completo ? `${series} series hechas` : `Serie ${serieActual} de ${series}`}</p>
          <BotonTexto subrayado onClick={onTecnica}>Técnica</BotonTexto>
        </div>
        {par && <p className="t-nota tenue sesion-par">Par con <span className="actual">{bloque.items[cual === 0 ? 1 : 0].item.nombre}</span>: una serie de cada uno y luego el descanso.</p>}
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
function PasoDescanso({ bloque, hechos, fin, total, cambio, avisado, unidades, onMas, onAvisar, onSaltar, onSiguienteBloque }: { bloque: PasoBloque; hechos: SetLog[][]; sesion: SesionTipo; fin: number; total: number; cambio: boolean; avisado: boolean; unidades?: Record<string, Unidad>; onMas: () => void; onAvisar: () => void; onSaltar: () => void; onSiguienteBloque: () => void }) {
  usePantalla('descanso')
  const { W } = useMedidas()
  const [medio, alto, ancho] = useAlto<HTMLDivElement>()
  const toca = cualToca(bloque, hechos)
  const ejercicioCompleto = toca === null
  const sig = bloque.items[toca ?? 0]
  const item = sig.item
  const unidad = unidadDe(item, unidades)
  const ultimo = [...hechos[toca ?? 0]].reverse().find((s) => s.exerciseId === item.id)
  const siguiente = hechos[toca ?? 0].length + 1
  const par = bloque.items.length > 1
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
  const sigue = ejercicioCompleto ? 'Sigue: el siguiente ejercicio' : `${cambio ? 'Cámbiate: ' : 'Sigue: '}${par ? `${item.nombre}, ` : ''}serie ${siguiente}${pesoUlt !== null ? `, ${formatoPeso(pesoUlt, unidad)}` : ''}`
  return (
    <div className="panel">
      <div className="sesion-arriba"><h1 className="t-descanso">{cambio ? 'Cambio' : 'Descanso'}</h1></div>
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
        {!termino && !cambio && <div><BotonTexto onClick={onAvisar}>Avísame aunque me salga</BotonTexto></div>}
        {termino ? (
          <BotonPrincipal piedra onClick={ejercicioCompleto ? onSiguienteBloque : onSaltar}>{ejercicioCompleto ? 'Siguiente ejercicio' : 'Siguiente serie'}</BotonPrincipal>
        ) : (
          <div className="botones-fila">
            <BotonContorno onClick={onMas}>+15 s</BotonContorno>
            <BotonContorno onClick={ejercicioCompleto ? onSiguienteBloque : onSaltar}>Saltar</BotonContorno>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- 6.4 Resumen ----------
function Resumen({ datos, sesion, sets, items, onTerminar }: { datos: Datos; sesion: SesionTipo; sets: SetLog[]; items: ItemBloque[]; onTerminar: () => void }) {
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
    return { nombre: (info?.item.nombre ?? id).toLowerCase(), delta: Math.round((i > 0 ? max(grupos[i]) - max(grupos[i - 1]) : 0) * 10) / 10, unidad }
  })
  const minutos = Math.max(1, Math.round((fin - sesion.inicio) / 60000))
  const hechosEj = items.filter((e) => propios.some((s) => s.ejercicioBaseId === e.base.id)).length
  const cumpleSemana = sesion.tipo !== 'CASA' && estadoSemana([...datos.sesiones.filter((s) => s.id !== sesion.id), { ...sesion, terminada: true }], new Date(fin)).hechas === 3
  const etiqueta = sesion.tipo === 'CASA' ? 'Casa hecha. No cuenta para la meta, pero cuenta.' : cumpleSemana ? `${sesion.tipo} hecha. Con esta, semana cumplida.` : `${sesion.tipo} hecha. Mañana te vas a acordar.`
  const frase = subieron.length ? `Subiste en ${subieron.map((s) => `${s.nombre}, +${s.delta} ${s.unidad}`).join('; ')}.` : etiqueta
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
