import { useCallback, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo, Ejercicio, Alternativa, SetLog, Version } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, buscarCualquiera } from '../data/ejercicios'
import { seriesPara, entraEnVersion, estadoSemana } from '../logic/semana'
import { sugerirPeso, subioDePeso, porSesion } from '../logic/progresion'
import { claveFecha } from '../logic/fechas'
import { useWakeLock } from '../hooks/useWakeLock'
import { usePantalla, useMedidas } from '../design/pantallaActiva'
import { haptico } from '../lib/haptics'
import { prepararAudio, sonarClic, sonarFinDescanso } from '../lib/sonido'
import { abrirAtajo } from '../lib/atajos'
import { useCuentaRegresiva, mmss } from '../hooks/useCuentaRegresiva'
import { Circulo, Dial, CifraPeso, Stepper, BotonPrincipal, BotonContorno, BotonTexto, Hoja, Grupo, Fila, Pez } from '../components/fm'
import { FichaHoja } from '../components/Ficha'

interface Props {
  datos: Datos
  sesion: SesionTipo
  activa: SesionActiva
  setActiva: (a: SesionActiva | null) => void
  onSalir: () => void
  onTerminar: () => void
}
type PasoEj = { tipo: 'ejercicio'; base: Ejercicio; item: Ejercicio | Alternativa; indice: number; series: number }
type Paso = { tipo: 'calentamiento' } | PasoEj | { tipo: 'cierre' } | { tipo: 'resumen' }
const PASO_KG = 2.5
const minCal = (v: Version) => (v === 'corta' ? CALENTAMIENTO.minCorta : CALENTAMIENTO.minCompleta)
const minCierre = (v: Version) => (v === 'corta' ? CIERRE.minCorta : v === 'bonus' ? CIERRE.minBonus : CIERRE.minCompleta)
export function rangoDe(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}

export function Sesion({ datos, sesion, activa, setActiva, onSalir, onTerminar }: Props) {
  const { settings, sets } = datos
  const version = sesion.version
  const ligera = !!sesion.ligera
  useWakeLock(true)
  const pasos = useMemo<Paso[]>(() => {
    const lista = ejerciciosDe(sesion.tipo as 'A' | 'B').filter((e) => entraEnVersion(e.orden, version))
    const ejercicios: Paso[] = lista.map((base, i) => {
      const cambio = sesion.cambios?.find((c) => c.ejercicioId === base.id)
      const item = cambio ? base.alternativas.find((a) => a.id === cambio.alternativaId) ?? base : base
      return { tipo: 'ejercicio', base, item, indice: i, series: seriesPara(base.id, item.series, version, settings.seriesExtra, ligera) }
    })
    return [{ tipo: 'calentamiento' }, ...ejercicios, { tipo: 'cierre' }, { tipo: 'resumen' }]
  }, [sesion.tipo, sesion.cambios, version, settings.seriesExtra, ligera])
  const ejercicios = pasos.filter((p): p is PasoEj => p.tipo === 'ejercicio')
  const indice = Math.min(activa.paso, pasos.length - 1)
  const paso = pasos[indice]
  const ir = useCallback((n: number) => {
    setActiva({ ...activa, paso: Math.max(0, Math.min(pasos.length - 1, n)), timerFin: undefined, timerSeg: undefined, descansoFin: undefined, descansoSeg: undefined, avisado: undefined })
  }, [activa, pasos.length, setActiva])
  const [menu, setMenu] = useState(false)
  const [tecnica, setTecnica] = useState(false)
  async function cambiarVersion(v: Version, lig: boolean) {
    await datos.guardarSesion({ ...sesion, version: v, ligera: lig })
    setMenu(false)
  }
  async function descartar() {
    if (!confirm('¿Borrar esta sesión? Se pierden las series de hoy.')) return
    await datos.borrarSesion(sesion.id)
    setMenu(false)
    onTerminar()
  }
  async function elegirAlternativa(alt: Alternativa | null) {
    if (paso.tipo !== 'ejercicio') return
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== paso.base.id)
    if (alt) cambios.push({ ejercicioId: paso.base.id, alternativaId: alt.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setTecnica(false)
  }
  const descansando = activa.descansoFin !== undefined

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
      {paso.tipo === 'ejercicio' && !descansando && <PasoSerie key={paso.item.id} datos={datos} sesion={sesion} paso={paso} sets={sets} activa={activa} setActiva={setActiva} onTecnica={() => setTecnica(true)} onSiguiente={() => ir(indice + 1)} />}
      {paso.tipo === 'ejercicio' && descansando && activa.descansoFin !== undefined && (
        <PasoDescanso key={`d${activa.descansoFin}`} paso={paso} sets={sets} sesion={sesion} fin={activa.descansoFin} total={activa.descansoSeg ?? paso.item.descansoSeg} avisado={!!activa.avisado}
          onMas={() => setActiva({ ...activa, descansoFin: (activa.descansoFin ?? Date.now()) + 15_000, descansoSeg: (activa.descansoSeg ?? paso.item.descansoSeg) + 15 })}
          onAvisar={() => { abrirAtajo(((activa.descansoFin ?? Date.now()) - Date.now()) / 1000); setActiva({ ...activa, avisado: true }) }}
          onSaltar={() => setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined })}
          onSiguienteEjercicio={() => ir(indice + 1)} />
      )}
      {paso.tipo === 'cierre' && <PasoTiempo key="cierre" titulo="Cierre" detalle={`Elíptica o saco, ${minCierre(version)} min.`} nota="Saco: 4 rounds de 2 min con 1 de descanso." minutos={minCierre(version)} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />}
      {paso.tipo === 'resumen' && <Resumen datos={datos} sesion={sesion} sets={sets} ejercicios={ejercicios} onTerminar={onTerminar} />}

      <Hoja abierta={menu} onCerrar={() => setMenu(false)}>
        <Grupo>
          {paso.tipo === 'ejercicio' && <Fila texto="Ver técnica" onClick={() => { setMenu(false); setTecnica(true) }} />}
          {indice > 0 && <Fila texto={paso.tipo === 'ejercicio' && paso.indice > 0 ? 'Ejercicio anterior' : 'Paso anterior'} onClick={() => { setMenu(false); ir(indice - 1) }} />}
          {paso.tipo !== 'resumen' && <Fila texto={paso.tipo === 'ejercicio' ? 'Saltar ejercicio' : 'Saltar'} onClick={() => { setMenu(false); ir(indice + 1) }} />}
          <Fila texto="Seguir después" detalle="Se queda guardada donde vas" onClick={() => { setMenu(false); onSalir() }} />
          <Fila texto="Terminar sesión" detalle="Ir al resumen" onClick={() => { setMenu(false); ir(pasos.length - 1) }} />
          <Fila texto="Descartar sesión" detalle="Se borran las series de hoy" onClick={descartar} />
        </Grupo>
        <Grupo titulo="Versión">
          {(['completa', 'corta', 'bonus'] as Version[]).map((v) => (
            <Fila key={v} texto={v === 'completa' ? 'Completa' : v === 'corta' ? 'Corta, ejercicios 1 a 4 con 2 series' : 'Bonus, cierre de 20 min'} dato={version === v && !ligera ? 'Activa' : ''} onClick={() => cambiarVersion(v, false)} />
          ))}
          <Fila texto="Ligera, 2 series con el mismo peso" dato={ligera ? 'Activa' : ''} onClick={() => cambiarVersion(version === 'corta' ? 'completa' : version, !ligera)} />
        </Grupo>
      </Hoja>
      {paso.tipo === 'ejercicio' && <FichaHoja abierta={tecnica} onCerrar={() => setTecnica(false)} base={paso.base} item={paso.item} datos={datos} series={paso.series} onElegirAlternativa={elegirAlternativa} />}
    </div>
  )
}

// ---------- 7.1 Calentamiento y cierre: piedra, círculo rojo con el timer en tinta ----------
function PasoTiempo({ titulo, detalle, nota, minutos, activa, setActiva, onListo }: { titulo: string; detalle: string; nota: string; minutos: number; activa: SesionActiva; setActiva: (a: SesionActiva) => void; onListo: () => void }) {
  usePantalla('calentamiento')
  const { W, H } = useMedidas()
  const fin = activa.timerFin
  const restante = useCuentaRegresiva(fin)
  const [termino, setTermino] = useState(false)
  const d = 0.8 * W
  if (fin !== undefined && restante <= 0 && !termino) {
    setTermino(true)
    if (document.visibilityState === 'visible') { haptico.finDescanso(); sonarFinDescanso() }
  }
  return (
    <div className="panel">
      <div className="sesion-titulo">
        <h1 className="t-titulo">{titulo}</h1>
        <p className="t-sub tenue">{detalle}</p>
      </div>
      <Circulo d={d} cx={W / 2} cy={0.46 * H}>
        <span className="circulo-timer" style={{ fontSize: d * 0.26 }}>{fin === undefined ? `${minutos}:00` : restante <= 0 ? 'Va' : mmss(restante)}</span>
      </Circulo>
      <p className="t-nota tenue cal-nota">{nota}</p>
      <div className="sesion-pie">
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

// ---------- 6.2 Serie: rojo, círculo tinta que crece serie por serie ----------
function PasoSerie({ datos, sesion, paso, sets, activa, setActiva, onTecnica, onSiguiente }: { datos: Datos; sesion: SesionTipo; paso: PasoEj; sets: SetLog[]; activa: SesionActiva; setActiva: (a: SesionActiva) => void; onTecnica: () => void; onSiguiente: () => void }) {
  usePantalla('serie')
  const { W, H } = useMedidas()
  const { base, item, series } = paso
  const incremento = base.incrementoKg ?? PASO_KG
  const hechos = useMemo(() => sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie), [sets, sesion.id, item.id])
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo), [historial, item.id, item.repsMax, item.modo])
  const ultimaVez = useMemo(() => porSesion(historial, item.id).slice(-1)[0], [historial, item.id])
  const siguienteNum = hechos.length + 1
  const completo = hechos.length >= series
  const ultimo = hechos[hechos.length - 1]
  const pesoSugerido = sugerencia.peso === null ? null : sugerencia.tipo === 'subir' ? sugerencia.peso + incremento : sugerencia.tipo === 'bajar' ? Math.max(0, sugerencia.peso - incremento) : sugerencia.peso
  const [peso, setPeso] = useState<number>(() => ultimo?.pesoKg ?? pesoSugerido ?? 0)
  const [reps, setReps] = useState<number>(() => ultimo?.reps ?? (item.modo === 'tiempo' ? item.repsMax : item.repsMax || 10))
  const [error, setError] = useState(false)

  const serieActual = Math.min(siguienteNum, series)
  const d = series <= 1 ? 0.66 * W : 0.48 * W + (0.36 * W * (serieActual - 1)) / (series - 1)
  // la cifra mide el 42% del diámetro; con más dígitos se reduce para que el kg siempre quede dentro
  const largo = String(peso).length
  const cifra = Math.round(d * 0.42 * (largo <= 2 ? 1 : largo === 3 ? 0.9 : largo === 4 ? 0.8 : 0.68))

  async function serieHecha() {
    prepararAudio()
    if (reps <= 0) return
    const ahora = Date.now()
    try {
      await datos.guardarSet({ sessionId: sesion.id, exerciseId: item.id, ejercicioBaseId: base.id, numSerie: siguienteNum, pesoKg: item.modo === 'peso' ? peso : null, reps, fecha: claveFecha(new Date(ahora)), hora: ahora })
    } catch { setError(true); return }
    setError(false)
    sonarClic()
    if (siguienteNum >= series) haptico.finEjercicio(); else haptico.serieHecha()
    setActiva({ ...activa, descansoFin: ahora + item.descansoSeg * 1000, descansoSeg: item.descansoSeg, avisado: undefined })
  }

  let aviso: string | null = null
  if (error) aviso = 'No se guardó la serie. Toca para reintentar.'
  else if (hechos.length === 0) {
    if (sugerencia.tipo === 'subir' && ultimaVez && pesoSugerido !== null) aviso = `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Sube a ${pesoSugerido}.`
    else if (sugerencia.tipo === 'bajar' && pesoSugerido !== null) aviso = `Dos veces seguidas bajaron las reps. Baja a ${pesoSugerido}.`
    else if (base.orden === 1 && item.modo === 'peso' && peso > 0) aviso = `Antes, una de aproximación con ${Math.round(peso / 2 / 0.5) * 0.5} kg, 10 reps. No se registra.`
  }

  return (
    <div className="panel">
      <div className="sesion-titulo">
        <h1 className="t-ejercicio">{item.nombre}</h1>
        <div className="sesion-titulo-fila">
          <p className="t-sub">{completo ? `${series} series hechas` : `Serie ${serieActual} de ${series}`}</p>
          <BotonTexto subrayado onClick={onTecnica}>Técnica</BotonTexto>
        </div>
      </div>
      {aviso && <p className="t-cuerpo sesion-aviso" onClick={error ? serieHecha : undefined}>{aviso}</p>}
      <Circulo d={d} cx={W / 2} cy={0.40 * H}>
        {item.modo === 'peso' ? (
          <CifraPeso valor={peso} onChange={setPeso} tamano={cifra} />
        ) : (
          <span className="circulo-cifra" style={{ fontSize: cifra }}>{reps}<span className="kg" style={{ fontSize: Math.max(20, Math.round(cifra * 0.3)) }}>{item.modo === 'tiempo' ? 's' : ''}</span></span>
        )}
      </Circulo>
      {item.modo === 'peso' && <div className="sesion-dial"><Dial valor={peso} onChange={setPeso} paso={incremento} /></div>}
      <div className="sesion-stepper">
        <Stepper valor={reps} onChange={setReps} unidad={item.modo === 'tiempo' ? 'segundos' : 'reps'} min={item.modo === 'tiempo' ? 5 : 1} max={item.modo === 'tiempo' ? 300 : 99} />
      </div>
      <div className="sesion-pie">
        {completo ? <BotonPrincipal onClick={onSiguiente}>Siguiente ejercicio</BotonPrincipal> : <BotonPrincipal onClick={serieHecha}>Serie hecha</BotonPrincipal>}
      </div>
    </div>
  )
}

// ---------- 6.3 Descanso: cobalto, círculo piedra que se encoge como sol que se mete ----------
function PasoDescanso({ paso, sets, sesion, fin, total, avisado, onMas, onAvisar, onSaltar, onSiguienteEjercicio }: { paso: PasoEj; sets: SetLog[]; sesion: SesionTipo; fin: number; total: number; avisado: boolean; onMas: () => void; onAvisar: () => void; onSaltar: () => void; onSiguienteEjercicio: () => void }) {
  usePantalla('descanso')
  const { W, H } = useMedidas()
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
  const dMax = 0.96 * W, dMin = 0.56 * W
  const d = dMin + (dMax - dMin) * progreso
  const cy = 0.45 * H
  const sigue = ejercicioCompleto ? 'Sigue: el siguiente ejercicio' : `Sigue: serie ${siguiente}${ultimo?.pesoKg != null ? `, ${ultimo.pesoKg} kg` : ''}`
  return (
    <div className="panel">
      <div className="sesion-titulo"><h1 className="t-descanso">Descanso</h1></div>
      <Circulo d={d} cx={W / 2} cy={cy} continuo>
        {tarde ? (
          <span className="t-cuerpo" style={{ padding: '0 24px', textAlign: 'center' }}>Terminó hace {mmss(-restante)}.</span>
        ) : (
          <span className="circulo-timer" style={{ fontSize: dMax * 0.26 }}>{termino ? 'Va' : mmss(restante)}</span>
        )}
      </Circulo>
      <Pez expresion="tirado-descansando" tamano={88} style={{ left: W / 2 - d / 2 + d * 0.08, top: cy + d / 2 - 66 }} />
      <div className="sesion-centro-texto descanso-sigue">
        <p className="t-sub">{sigue}</p>
        {!termino && <BotonTexto onClick={onAvisar}>Avísame aunque me salga</BotonTexto>}
      </div>
      <div className="sesion-pie">
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
  const { W, H } = useMedidas()
  const [fin] = useState(() => Date.now())
  const propios = sets.filter((s) => s.sessionId === sesion.id)
  const ids = [...new Set(propios.map((s) => s.exerciseId))]
  const subieron = ids.filter((id) => subioDePeso(sets, id, sesion.id)).map((id) => {
    const grupos = porSesion(sets, id)
    const i = grupos.findIndex((g) => g[0].sessionId === sesion.id)
    const max = (g: SetLog[]) => Math.max(...g.map((s) => s.pesoKg ?? 0))
    return { nombre: (buscarCualquiera(id)?.item.nombre ?? id).toLowerCase(), delta: Math.round((i > 0 ? max(grupos[i]) - max(grupos[i - 1]) : 0) * 10) / 10 }
  })
  const minutos = Math.max(1, Math.round((fin - sesion.inicio) / 60000))
  const hechosEj = ejercicios.filter((e) => propios.some((s) => s.exerciseId === e.item.id)).length
  const cumpleSemana = estadoSemana([...datos.sesiones.filter((s) => s.id !== sesion.id), { ...sesion, terminada: true }], new Date(fin)).hechas === 3
  const frase = subieron.length ? `Subiste en ${subieron.map((s) => `${s.nombre}, +${s.delta} kg`).join('; ')}.` : cumpleSemana ? `${sesion.tipo} hecha. Con esta, semana cumplida.` : `${sesion.tipo} hecha. Mañana te vas a acordar.`
  const d = 0.91 * W, cy = 0.48 * H
  async function terminar() {
    await datos.guardarSesion({ ...sesion, fin, terminada: true })
    haptico.finSesion()
    onTerminar()
  }
  return (
    <div className="panel">
      <div className="resumen-titulo">
        <h1 className="t-listo">Listo.</h1>
        <p className="t-sub">{frase}</p>
      </div>
      <Circulo d={d} cx={W / 2} cy={cy} />
      <Pez expresion="orgulloso" tamano={96} style={{ left: W / 2 + d * 0.28, top: cy - d / 2 - 58 }} />
      <div className="resumen-cifras">
        <div className="resumen-cifra"><span className="t-cifra">{minutos}</span><span className="t-unidad tenue">min</span></div>
        <div className="resumen-cifra"><span className="t-cifra">{hechosEj}</span><span className="t-unidad tenue">{hechosEj === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
        <div className="resumen-cifra"><span className="t-cifra">{propios.length}</span><span className="t-unidad tenue">series</span></div>
      </div>
      <div className="sesion-pie"><BotonPrincipal onClick={terminar}>Cerrar</BotonPrincipal></div>
    </div>
  )
}
