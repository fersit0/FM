import { useCallback, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo, Ejercicio, Alternativa, SetLog, Version } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, buscarCualquiera } from '../data/ejercicios'
import { seriesPara, entraEnVersion, estadoSemana } from '../logic/semana'
import { sugerirPeso, subioDePeso, porSesion } from '../logic/progresion'
import { claveFecha } from '../logic/fechas'
import { useWakeLock } from '../hooks/useWakeLock'
import { useTemp, tempDeSerie } from '../design/temperatura'
import { haptico } from '../lib/haptics'
import { prepararAudio, sonarClic, sonarFinDescanso } from '../lib/sonido'
import { abrirAtajo } from '../lib/atajos'
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva'
import { Progreso, Peso, Stepper, BotonPrincipal, BotonSecundario, Temporizador, Hoja, Grupo, Fila } from '../components/fm'
import { Foto } from '../components/Foto'
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

function minutosCalentamiento(v: Version) {
  return v === 'corta' ? CALENTAMIENTO.minCorta : CALENTAMIENTO.minCompleta
}
function minutosCierre(v: Version) {
  return v === 'corta' ? CIERRE.minCorta : v === 'bonus' ? CIERRE.minBonus : CIERRE.minCompleta
}
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
  const hechasDe = (e: PasoEj) => sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === e.item.id).length

  const indice = Math.min(activa.paso, pasos.length - 1)
  const paso = pasos[indice]

  const ir = useCallback(
    (n: number) => {
      setActiva({ ...activa, paso: Math.max(0, Math.min(pasos.length - 1, n)), timerFin: undefined, timerSeg: undefined, descansoFin: undefined, descansoSeg: undefined, avisado: undefined })
      window.scrollTo({ top: 0 })
    },
    [activa, pasos.length, setActiva],
  )

  const [menu, setMenu] = useState(false)
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

  const descansando = activa.descansoFin !== undefined
  const actualIdx = paso.tipo === 'ejercicio' ? paso.indice : paso.tipo === 'calentamiento' ? 0 : ejercicios.length
  const llenado = paso.tipo === 'ejercicio' ? hechasDe(paso) / paso.series : 0

  return (
    <div className="fm-pantalla fm-sesion">
      {paso.tipo !== 'resumen' && (
        <>
          <header className="fm-sesion-cabecera">
            <button className="fm-icono-boton" onClick={() => setMenu(true)} aria-label="Salir o cambiar la sesión">
              <svg className="fm-icono" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <span className="subtexto">{paso.tipo === 'ejercicio' ? `${paso.indice + 1} de ${ejercicios.length}` : ''}</span>
          </header>
          <Progreso total={ejercicios.length} actual={actualIdx} llenado={llenado} />
        </>
      )}

      {paso.tipo === 'calentamiento' && (
        <PasoTiempo key="cal" titulo="Calentamiento" detalle={`Elíptica ${minutosCalentamiento(version)} min, ritmo en el que puedes platicar.`} nota={CALENTAMIENTO.siOcupada} minutos={minutosCalentamiento(version)} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />
      )}
      {paso.tipo === 'ejercicio' && !descansando && (
        <PasoEjercicio key={paso.item.id} datos={datos} sesion={sesion} paso={paso} sets={sets} activa={activa} setActiva={setActiva} onSiguiente={() => ir(indice + 1)} onAnterior={() => ir(indice - 1)} />
      )}
      {paso.tipo === 'ejercicio' && descansando && activa.descansoFin !== undefined && (
        <PasoDescanso
          key={`d${activa.descansoFin}`}
          paso={paso}
          sets={sets}
          sesion={sesion}
          fin={activa.descansoFin}
          total={activa.descansoSeg ?? paso.item.descansoSeg}
          avisado={!!activa.avisado}
          onMas={() => setActiva({ ...activa, descansoFin: (activa.descansoFin ?? Date.now()) + 15_000, descansoSeg: (activa.descansoSeg ?? paso.item.descansoSeg) + 15 })}
          onMenos={() => setActiva({ ...activa, descansoFin: Math.max(Date.now(), (activa.descansoFin ?? Date.now()) - 15_000) })}
          onAvisar={() => { abrirAtajo(((activa.descansoFin ?? Date.now()) - Date.now()) / 1000); setActiva({ ...activa, avisado: true }) }}
          onSaltar={() => setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined, avisado: undefined })}
          onSiguienteEjercicio={() => ir(indice + 1)}
        />
      )}
      {paso.tipo === 'cierre' && (
        <PasoTiempo key="cierre" titulo="Cierre" detalle={`Elíptica o saco, ${minutosCierre(version)} min.`} nota="Saco: 4 rounds de 2 min con 1 de descanso." minutos={minutosCierre(version)} activa={activa} setActiva={setActiva} onListo={() => ir(indice + 1)} />
      )}
      {paso.tipo === 'resumen' && <Resumen datos={datos} sesion={sesion} sets={sets} ejercicios={ejercicios} onTerminar={onTerminar} />}

      <Hoja abierta={menu} titulo="Esta sesión" onCerrar={() => setMenu(false)}>
        <Grupo>
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
    </div>
  )
}

// ---------- 7.2 Calentamiento y cierre ----------

function PasoTiempo({ titulo, detalle, nota, minutos, activa, setActiva, onListo }: {
  titulo: string
  detalle: string
  nota: string
  minutos: number
  activa: SesionActiva
  setActiva: (a: SesionActiva) => void
  onListo: () => void
}) {
  useTemp('calentamiento')
  const fin = activa.timerFin
  const [termino, setTermino] = useState(false)
  const alTerminar = useCallback(() => {
    setTermino(true)
    if (document.visibilityState !== 'visible') return
    haptico.finDescanso()
    sonarFinDescanso()
  }, [])
  const total = activa.timerSeg ?? minutos * 60

  return (
    <div className="fm-panel fm-columna" style={{ flex: 1 }}>
      <div className="fm-sesion-titulo">
        <h1 className="titulo">{titulo}</h1>
        <p className="subtexto">{detalle}</p>
      </div>
      <div className="fm-sesion-tiempo">
        {fin !== undefined ? (
          <Temporizador fin={fin} total={total} onFin={alTerminar} onMas={() => setActiva({ ...activa, timerFin: (activa.timerFin ?? Date.now()) + 15_000, timerSeg: total + 15 })} onMenos={() => setActiva({ ...activa, timerFin: Math.max(Date.now(), (activa.timerFin ?? Date.now()) - 15_000) })} />
        ) : (
          <span className="cifra-heroe">{minutos}:00</span>
        )}
        <p className="subtexto" style={{ maxWidth: 300 }}>{nota}</p>
      </div>
      <div className="fm-pie fm-columna">
        <div className="fm-secundarios" style={{ justifyContent: 'center' }}>
          <BotonSecundario onClick={onListo}>Saltar</BotonSecundario>
        </div>
        {fin === undefined ? (
          <BotonPrincipal onClick={() => { prepararAudio(); setActiva({ ...activa, timerFin: Date.now() + minutos * 60000, timerSeg: minutos * 60 }) }}>Empezar {titulo.toLowerCase()}</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={onListo}>{termino ? 'Seguir' : 'Ya, seguir'}</BotonPrincipal>
        )}
      </div>
    </div>
  )
}

// ---------- 7.3 Ejercicio ----------

function PasoEjercicio({ datos, sesion, paso, sets, activa, setActiva, onSiguiente, onAnterior }: {
  datos: Datos
  sesion: SesionTipo
  paso: PasoEj
  sets: SetLog[]
  activa: SesionActiva
  setActiva: (a: SesionActiva) => void
  onSiguiente: () => void
  onAnterior: () => void
}) {
  const { base, item, series } = paso
  const incremento = base.incrementoKg ?? PASO_KG
  const hechos = useMemo(() => sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie), [sets, sesion.id, item.id])
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo), [historial, item.id, item.repsMax, item.modo])
  const ultimaVez = useMemo(() => porSesion(historial, item.id).slice(-1)[0], [historial, item.id])

  const siguienteNum = hechos.length + 1
  const completo = hechos.length >= series
  const ultimo = hechos[hechos.length - 1]

  const pesoSugerido = (() => {
    if (sugerencia.peso === null) return null
    if (sugerencia.tipo === 'subir') return sugerencia.peso + incremento
    if (sugerencia.tipo === 'bajar') return Math.max(0, sugerencia.peso - incremento)
    return sugerencia.peso
  })()
  const [peso, setPeso] = useState<number>(() => ultimo?.pesoKg ?? pesoSugerido ?? 0)
  const [reps, setReps] = useState<number>(() => ultimo?.reps ?? (item.modo === 'tiempo' ? item.repsMax : item.repsMax || 10))
  const [tecnica, setTecnica] = useState(false)
  const [error, setError] = useState(false)

  useTemp(completo ? 'ultima' : tempDeSerie(siguienteNum, series))

  async function serieHecha() {
    prepararAudio()
    if (reps <= 0) return
    const ahora = Date.now()
    try {
      await datos.guardarSet({ sessionId: sesion.id, exerciseId: item.id, ejercicioBaseId: base.id, numSerie: siguienteNum, pesoKg: item.modo === 'peso' ? peso : null, reps, fecha: claveFecha(new Date(ahora)), hora: ahora })
    } catch {
      setError(true)
      return
    }
    setError(false)
    sonarClic()
    if (siguienteNum >= series) haptico.finEjercicio()
    else haptico.serieHecha()
    setActiva({ ...activa, descansoFin: ahora + item.descansoSeg * 1000, descansoSeg: item.descansoSeg, avisado: undefined })
  }

  async function elegirAlternativa(alt: Alternativa | null) {
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== base.id)
    if (alt) cambios.push({ ejercicioId: base.id, alternativaId: alt.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setTecnica(false)
  }

  let aviso: string | null = null
  if (error) aviso = 'No se guardó la serie. Toca para reintentar.'
  else if (hechos.length === 0) {
    if (sugerencia.tipo === 'subir' && ultimaVez && pesoSugerido !== null) aviso = `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Sube a ${pesoSugerido}.`
    else if (sugerencia.tipo === 'bajar' && pesoSugerido !== null) aviso = `Dos veces seguidas bajaron las reps. Baja a ${pesoSugerido}.`
    else if (base.orden === 1 && item.modo === 'peso' && peso > 0) aviso = `Antes, una de aproximación con ${Math.round(peso / 2 / 0.5) * 0.5} kg, 10 reps. No se registra.`
    else if (sugerencia.tipo === 'inicial' && item.modo === 'peso') aviso = 'Primera vez. Empieza ligero: el tope del rango con 2 de sobra.'
  }

  return (
    <div className="fm-panel fm-columna" style={{ flex: 1, gap: 12 }}>
      <div className="fm-sesion-titulo">
        <h1 className="titulo">{item.nombre}</h1>
        <p className="subtexto">{completo ? `${series} series hechas` : `Serie ${siguienteNum} de ${series}`}, {rangoDe(item)}{item.porLado ? ' por lado' : ''}</p>
      </div>
      <Foto clave={item.ilustracion} ejercicioId={item.id} propias={datos.fotosEjercicio} nombre={item.nombre} onClick={() => setTecnica(true)} />
      <div className="fm-sesion-centro" style={{ gap: 16 }}>
        {aviso && <p className="subtexto" style={{ textAlign: 'center' }} onClick={error ? serieHecha : undefined}>{aviso}</p>}
        {item.modo === 'peso' ? (
          <Peso valor={peso} onChange={setPeso} paso={incremento} />
        ) : (
          <div className="fm-peso"><span className="cifra-heroe">{reps}</span><span className="unidad" style={{ marginTop: -8 }}>{item.modo === 'tiempo' ? 'segundos' : 'reps'}</span></div>
        )}
        {item.modo === 'peso' ? <Stepper valor={reps} onChange={setReps} /> : <Stepper valor={reps} onChange={setReps} unidad={item.modo === 'tiempo' ? 's' : 'reps'} min={item.modo === 'tiempo' ? 5 : 1} max={item.modo === 'tiempo' ? 300 : 99} />}
      </div>
      <div className="fm-pie fm-columna">
        <div className="fm-secundarios">
          <BotonSecundario onClick={onAnterior}>Anterior</BotonSecundario>
          <BotonSecundario onClick={() => setTecnica(true)}>Técnica</BotonSecundario>
          <BotonSecundario onClick={onSiguiente}>{completo ? 'Siguiente' : 'Saltar'}</BotonSecundario>
        </div>
        {completo ? <BotonPrincipal onClick={onSiguiente}>Siguiente ejercicio</BotonPrincipal> : <BotonPrincipal onClick={serieHecha}>Serie hecha</BotonPrincipal>}
      </div>
      <FichaHoja abierta={tecnica} onCerrar={() => setTecnica(false)} base={base} item={item} datos={datos} series={series} onElegirAlternativa={elegirAlternativa} />
    </div>
  )
}

// ---------- 7.4 Descanso ----------

function PasoDescanso({ paso, sets, sesion, fin, total, avisado, onMas, onMenos, onAvisar, onSaltar, onSiguienteEjercicio }: {
  paso: PasoEj
  sets: SetLog[]
  sesion: SesionTipo
  fin: number
  total: number
  avisado: boolean
  onMas: () => void
  onMenos: () => void
  onAvisar: () => void
  onSaltar: () => void
  onSiguienteEjercicio: () => void
}) {
  const { item, series } = paso
  const hechos = sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie)
  const ultimo = hechos[hechos.length - 1]
  const siguiente = hechos.length + 1
  const ejercicioCompleto = hechos.length >= series
  const restante = useCuentaRegresiva(fin)
  const termino = restante <= 0
  useTemp(termino ? (ejercicioCompleto ? 'trabajo' : tempDeSerie(siguiente, series)) : 'descanso')
  const alTerminar = useCallback(() => {
    if (document.visibilityState !== 'visible') return
    haptico.finDescanso()
    if (!avisado) sonarFinDescanso()
  }, [avisado])

  const sigue = ejercicioCompleto
    ? 'Sigue: el siguiente ejercicio.'
    : `Sigue: serie ${siguiente}${ultimo?.pesoKg != null ? `, ${ultimo.pesoKg} kg` : ''}, ${rangoDe(item)}`

  return (
    <div className="fm-panel fm-columna" style={{ flex: 1 }}>
      <div className="fm-sesion-titulo">
        <h1 className="titulo">Descanso</h1>
        <p className="subtexto">{sigue}</p>
      </div>
      <div className="fm-sesion-tiempo">
        <Temporizador fin={fin} total={total} onFin={alTerminar} onMas={onMas} onMenos={onMenos} onAvisar={onAvisar} />
      </div>
      <div className="fm-pie fm-columna">
        {termino ? (
          <BotonPrincipal onClick={ejercicioCompleto ? onSiguienteEjercicio : onSaltar}>{ejercicioCompleto ? 'Siguiente ejercicio' : 'Siguiente serie'}</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={ejercicioCompleto ? onSiguienteEjercicio : onSaltar}>Saltar descanso</BotonPrincipal>
        )}
      </div>
    </div>
  )
}

// ---------- 7.5 Resumen ----------

function Resumen({ datos, sesion, sets, ejercicios, onTerminar }: { datos: Datos; sesion: SesionTipo; sets: SetLog[]; ejercicios: PasoEj[]; onTerminar: () => void }) {
  useTemp('listo')
  const [fin] = useState(() => Date.now())
  const propios = sets.filter((s) => s.sessionId === sesion.id)
  const ids = [...new Set(propios.map((s) => s.exerciseId))]
  const subieron = ids
    .filter((id) => subioDePeso(sets, id, sesion.id))
    .map((id) => {
      const grupos = porSesion(sets, id)
      const i = grupos.findIndex((g) => g[0].sessionId === sesion.id)
      const max = (g: SetLog[]) => Math.max(...g.map((s) => s.pesoKg ?? 0))
      const delta = i > 0 ? max(grupos[i]) - max(grupos[i - 1]) : 0
      return { nombre: buscarCualquiera(id)?.item.nombre ?? id, delta: Math.round(delta * 10) / 10 }
    })
  const minutos = Math.max(1, Math.round((fin - sesion.inicio) / 60000))
  const hechosEj = ejercicios.filter((e) => propios.some((s) => s.exerciseId === e.item.id)).length
  const cumpleSemana = estadoSemana([...datos.sesiones.filter((s) => s.id !== sesion.id), { ...sesion, terminada: true }], new Date(fin)).hechas === 3

  async function terminar() {
    await datos.guardarSesion({ ...sesion, fin, terminada: true })
    haptico.finSesion()
    onTerminar()
  }

  return (
    <div className="fm-panel fm-columna fm-resumen" style={{ flex: 1 }}>
      <div className="fm-resumen-titulo">
        <h1 className="titulo-grande">Listo.</h1>
        <p className="cuerpo tenue">{sesion.tipo} hecha. {cumpleSemana ? 'Con esta, semana cumplida.' : 'Mañana te vas a acordar.'}</p>
      </div>
      <div className="fm-stats">
        <div className="fm-stat"><span className="cifra-media">{minutos}</span><span className="nota">min</span></div>
        <div className="fm-stat"><span className="cifra-media">{hechosEj}</span><span className="nota">{hechosEj === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
        <div className="fm-stat"><span className="cifra-media">{propios.length}</span><span className="nota">series</span></div>
      </div>
      {subieron.length ? (
        <Grupo titulo="Subiste en">
          {subieron.map((s) => <Fila key={s.nombre} texto={s.nombre} dato={`+${s.delta} kg`} />)}
        </Grupo>
      ) : (
        <p className="cuerpo tenue">Hoy sostuviste los pesos.</p>
      )}
      <div className="fm-pie">
        <BotonPrincipal onClick={terminar}>Cerrar</BotonPrincipal>
      </div>
    </div>
  )
}
