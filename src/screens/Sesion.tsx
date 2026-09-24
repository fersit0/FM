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
import { Modulo, Escala, Dial, CifraPeso, Stepper, BotonPrincipal, BotonSecundario, Temporizador, Hoja } from '../components/fm'
import { Ilustracion } from '../components/Ilustracion'

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
  const grupos = ejercicios.map((e) => e.series)
  const hechasPorGrupo = ejercicios.map((e) => Math.min(e.series, sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === e.item.id).length))

  const indice = Math.min(activa.paso, pasos.length - 1)
  const paso = pasos[indice]

  const ir = useCallback(
    (n: number) => {
      setActiva({ ...activa, paso: Math.max(0, Math.min(pasos.length - 1, n)), timerInicio: undefined, descansoFin: undefined })
      window.scrollTo({ top: 0 })
    },
    [activa, pasos.length, setActiva],
  )

  const [menu, setMenu] = useState(false)
  async function cambiarVersion(v: Version, lig: boolean) {
    await datos.guardarSesion({ ...sesion, version: v, ligera: lig })
    setMenu(false)
  }

  const descansando = activa.descansoFin !== undefined
  const encabezado = paso.tipo === 'ejercicio' ? `${paso.indice + 1} de ${ejercicios.length}` : ''

  return (
    <div className="fm-pantalla fm-sesion">
      {paso.tipo !== 'resumen' && (
        <header className="fm-sesion-cabecera">
          <button className="fm-icono-boton" onClick={() => setMenu(true)} aria-label="Salir o cambiar la sesión">
            <svg className="fm-icono" viewBox="0 0 22 22"><path d="M6 6l10 10M16 6L6 16" /></svg>
          </button>
          <span className="secundario">{encabezado}</span>
        </header>
      )}

      {paso.tipo !== 'resumen' && (
        <Escala grupos={grupos} hechas={hechasPorGrupo} actual={paso.tipo === 'ejercicio' ? paso.indice : paso.tipo === 'cierre' ? ejercicios.length - 1 : 0} />
      )}

      {paso.tipo === 'calentamiento' && (
        <PasoTiempo
          titulo="Calentamiento"
          detalle={`Elíptica ${minutosCalentamiento(version)} min, ritmo en el que puedes platicar.`}
          nota={CALENTAMIENTO.siOcupada}
          minutos={minutosCalentamiento(version)}
          activa={activa}
          setActiva={setActiva}
          onListo={() => ir(indice + 1)}
        />
      )}

      {paso.tipo === 'ejercicio' && !descansando && (
        <PasoEjercicio
          key={paso.item.id}
          datos={datos}
          sesion={sesion}
          paso={paso}
          sets={sets}
          activa={activa}
          setActiva={setActiva}
          onSiguiente={() => ir(indice + 1)}
          onAnterior={() => ir(indice - 1)}
        />
      )}

      {paso.tipo === 'ejercicio' && descansando && activa.descansoFin !== undefined && (
        <PasoDescanso
          paso={paso}
          sets={sets}
          sesion={sesion}
          fin={activa.descansoFin}
          total={activa.descansoSeg ?? paso.item.descansoSeg}
          onMas={() => setActiva({ ...activa, descansoFin: (activa.descansoFin ?? Date.now()) + 15_000, descansoSeg: (activa.descansoSeg ?? paso.item.descansoSeg) + 15 })}
          onSaltar={() => setActiva({ ...activa, descansoFin: undefined, descansoSeg: undefined })}
          onSiguienteEjercicio={() => ir(indice + 1)}
        />
      )}

      {paso.tipo === 'cierre' && (
        <PasoTiempo
          titulo="Cierre"
          detalle={`Elíptica o saco, ${minutosCierre(version)} min.`}
          nota="Saco: 4 rounds de 2 min con 1 de descanso."
          minutos={minutosCierre(version)}
          activa={activa}
          setActiva={setActiva}
          onListo={() => ir(indice + 1)}
        />
      )}

      {paso.tipo === 'resumen' && <Resumen datos={datos} sesion={sesion} sets={sets} ejercicios={ejercicios} onTerminar={onTerminar} />}

      <Hoja abierta={menu} titulo="Esta sesión" onCerrar={() => setMenu(false)}>
        <div className="fm-columna">
          <BotonSecundario capsula onClick={() => { setMenu(false); onSalir() }}>Seguir después</BotonSecundario>
          <BotonSecundario capsula onClick={() => { setMenu(false); ir(pasos.length - 1) }}>Terminar sesión</BotonSecundario>
        </div>
        <p className="etiqueta-fm">Versión</p>
        <div className="fm-fila">
          {(['completa', 'corta', 'bonus'] as Version[]).map((v) => (
            <button key={v} className={`fm-chip ${version === v && !ligera ? 'activo' : ''}`} onClick={() => cambiarVersion(v, false)}>
              {v === 'completa' ? 'Completa' : v === 'corta' ? 'Corta' : 'Bonus'}
            </button>
          ))}
          <button className={`fm-chip ${ligera ? 'activo' : ''}`} onClick={() => cambiarVersion(version === 'corta' ? 'completa' : version, !ligera)}>Ligera</button>
        </div>
        <p className="secundario">Corta: ejercicios 1 a 4 con 2 series. Ligera: 2 series por ejercicio con el mismo peso, para cuando dos semanas seguidas llegaste muerto.</p>
      </Hoja>
    </div>
  )
}

// ---------- Calentamiento / Cierre: módulo con temporizador en olivo ----------

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
  const inicio = activa.timerInicio
  const fin = inicio !== undefined ? inicio + minutos * 60000 : undefined
  const [termino, setTermino] = useState(false)
  const alTerminar = useCallback(() => {
    setTermino(true)
    haptico.finDescanso()
    sonarFinDescanso()
  }, [])

  return (
    <>
      <div className="fm-sesion-titulo">
        <h1 className="titulo-fm">{titulo}</h1>
        <p className="secundario">{detalle}</p>
      </div>
      <p className="cuerpo" style={{ color: 'var(--crema-2)' }}>{nota}</p>
      <Modulo>
        {fin !== undefined ? (
          <Temporizador fin={fin} total={minutos * 60} onFin={alTerminar} onMas={() => setActiva({ ...activa, timerInicio: (activa.timerInicio ?? Date.now()) + 15_000 })} onSaltar={onListo} />
        ) : (
          <div className="fm-temporizador">
            <span className="tiempo">{minutos}:00</span>
            <div className="fm-temporizador-linea" aria-hidden="true"><div className="fm-temporizador-restante" /></div>
          </div>
        )}
      </Modulo>
      <div className="fm-pie fm-columna">
        {fin === undefined ? (
          <BotonPrincipal onClick={() => { prepararAudio(); setActiva({ ...activa, timerInicio: Date.now() }) }}>Arrancar</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={onListo}>{termino ? 'Seguir' : 'Ya, seguir'}</BotonPrincipal>
        )}
      </div>
    </>
  )
}

// ---------- Ejercicio ----------

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
  const esAlternativa = item.id !== base.id
  const hechos = useMemo(
    () => sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie),
    [sets, sesion.id, item.id],
  )
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo), [historial, item.id, item.repsMax, item.modo])
  const ultimaVez = useMemo(() => porSesion(historial, item.id).slice(-1)[0], [historial, item.id])

  const siguienteNum = hechos.length + 1
  const completo = hechos.length >= series
  const ultimo = hechos[hechos.length - 1]

  const pesoInicial = () => {
    if (ultimo?.pesoKg != null) return ultimo.pesoKg
    if (sugerencia.peso === null) return 0
    if (sugerencia.tipo === 'subir') return sugerencia.peso + PASO_KG
    if (sugerencia.tipo === 'bajar') return Math.max(0, sugerencia.peso - PASO_KG)
    return sugerencia.peso
  }
  const [peso, setPeso] = useState<number>(pesoInicial)
  const [reps, setReps] = useState<number>(() => ultimo?.reps ?? (item.modo === 'tiempo' ? item.repsMax : item.repsMax || 10))
  const [tecnica, setTecnica] = useState(false)
  const [cambiar, setCambiar] = useState(false)

  useTemp(completo ? 'ultima' : tempDeSerie(siguienteNum, series))

  async function serieHecha() {
    prepararAudio()
    if (reps <= 0) return
    const ahora = Date.now()
    await datos.guardarSet({
      sessionId: sesion.id,
      exerciseId: item.id,
      ejercicioBaseId: base.id,
      numSerie: siguienteNum,
      pesoKg: item.modo === 'peso' ? peso : null,
      reps,
      fecha: claveFecha(new Date(ahora)),
      hora: ahora,
    })
    sonarClic()
    if (siguienteNum >= series) haptico.finEjercicio()
    else haptico.serieHecha()
    setActiva({ ...activa, descansoFin: ahora + item.descansoSeg * 1000, descansoSeg: item.descansoSeg })
  }

  async function elegirAlternativa(alt: Alternativa | null) {
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== base.id)
    if (alt) cambios.push({ ejercicioId: base.id, alternativaId: alt.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setCambiar(false)
  }

  // Línea arriba del módulo: solo cuando dice algo
  let aviso: string | null = null
  if (hechos.length === 0) {
    if (sugerencia.tipo === 'subir' && ultimaVez) aviso = `La vez pasada hiciste ${ultimaVez[0].reps} en todas. Toca subir.`
    else if (sugerencia.tipo === 'bajar') aviso = 'Dos veces seguidas bajaron las reps. Baja un escalón.'
    else if (sugerencia.tipo === 'inicial' && item.modo === 'peso') aviso = 'Primera vez. Elige un peso con el que el tope salga con 2 guardadas.'
    else if (base.orden === 1) aviso = 'Antes, una serie de aproximación: mitad del peso, 10 reps. No se registra.'
  }
  const rango = item.modo === 'tiempo' ? `${item.repsMax} s` : item.repsMax === 0 ? 'al tope con 2 guardadas' : item.repsMin === item.repsMax ? `${item.repsMax} reps` : `${item.repsMin} a ${item.repsMax} reps`

  return (
    <>
      <div className="fm-sesion-titulo">
        <h1 className="titulo-fm">{item.nombre}</h1>
        <p className="secundario">
          {completo ? `${series} series hechas` : `Serie ${siguienteNum} de ${series}`}, {rango}{item.porLado ? ' por lado' : ''}{esAlternativa && 'caso' in item ? `. Alternativa: ${item.caso.toLowerCase()}` : ''}
        </p>
      </div>

      <Ilustracion id={item.ilustracion} nombre={item.nombre} onClick={() => setTecnica(true)} />

      {aviso && <p className="cuerpo fm-aviso">{aviso}</p>}

      <Modulo>
        {item.modo === 'peso' ? (
          <>
            <CifraPeso valor={peso} onChange={setPeso} />
            <Dial valor={peso} onChange={setPeso} paso={PASO_KG} />
            <Stepper valor={reps} onChange={setReps} />
          </>
        ) : item.modo === 'tiempo' ? (
          <div className="fm-columna">
            <div><span className="cifra-heroe">{reps}</span><span className="unidad">s</span></div>
            <Stepper valor={reps} onChange={setReps} unidad="s" min={5} max={300} />
          </div>
        ) : (
          <div className="fm-columna">
            <div><span className="cifra-heroe">{reps}</span><span className="unidad">reps</span></div>
            <Stepper valor={reps} onChange={setReps} />
          </div>
        )}
      </Modulo>

      <div className="fm-pie fm-columna">
        <div className="fm-fila fm-sesion-secundarios">
          <BotonSecundario onClick={onAnterior}>Anterior</BotonSecundario>
          <BotonSecundario onClick={() => setCambiar(true)}>Cambiar</BotonSecundario>
          <BotonSecundario onClick={onSiguiente}>{completo ? 'Siguiente' : 'Saltar'}</BotonSecundario>
        </div>
        {completo ? (
          <BotonPrincipal onClick={onSiguiente}>Siguiente ejercicio</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={serieHecha}>Serie hecha</BotonPrincipal>
        )}
      </div>

      <Hoja abierta={tecnica} titulo={item.nombre} onCerrar={() => setTecnica(false)}>
        <Detalle item={item} />
      </Hoja>

      <Hoja abierta={cambiar} titulo="Cambiar" onCerrar={() => setCambiar(false)}>
        <p className="secundario">Primero la que use el mismo equipo, luego mancuernas, luego peso corporal. Cada una guarda su propio peso.</p>
        <div className="fm-columna">
          {esAlternativa && (
            <button className="fm-alternativa" onClick={() => elegirAlternativa(null)}>
              <span className="etiqueta-fm">Original</span>
              <span className="cuerpo">{base.nombre}</span>
            </button>
          )}
          {base.alternativas.filter((a) => a.id !== item.id).map((a) => (
            <button key={a.id} className="fm-alternativa" onClick={() => elegirAlternativa(a)}>
              <span className="etiqueta-fm">{a.caso}</span>
              <span className="cuerpo">{a.nombre}</span>
              <span className="secundario">{a.series} series, {a.modo === 'tiempo' ? `${a.repsMax} s` : a.repsMax === 0 ? 'al tope' : a.repsMin === a.repsMax ? `${a.repsMax} reps` : `${a.repsMin} a ${a.repsMax} reps`}{a.porLado ? ' por lado' : ''}</span>
            </button>
          ))}
        </div>
      </Hoja>
    </>
  )
}

export function Detalle({ item }: { item: Ejercicio | Alternativa }) {
  return (
    <div className="fm-columna" style={{ gap: 16 }}>
      {item.ubicar && (<div><p className="etiqueta-fm">Ubicar</p><p className="cuerpo">{item.ubicar}</p></div>)}
      {item.colocacion && (<div><p className="etiqueta-fm">Colocación</p><p className="cuerpo">{item.colocacion}</p></div>)}
      {item.tecnica.length > 0 && (<div><p className="etiqueta-fm">Técnica</p><ol className="fm-lista">{item.tecnica.map((t, i) => <li key={i} className="cuerpo">{t}</li>)}</ol></div>)}
      {item.errores.length > 0 && (<div><p className="etiqueta-fm">Errores</p><ul className="fm-lista">{item.errores.map((t, i) => <li key={i} className="cuerpo">{t}</li>)}</ul></div>)}
    </div>
  )
}

// ---------- Descanso: misma estructura, el módulo se enfría a teal ----------

function PasoDescanso({ paso, sets, sesion, fin, total, onMas, onSaltar, onSiguienteEjercicio }: {
  paso: PasoEj
  sets: SetLog[]
  sesion: SesionTipo
  fin: number
  total: number
  onMas: () => void
  onSaltar: () => void
  onSiguienteEjercicio: () => void
}) {
  useTemp('descanso')
  const { item, series } = paso
  const hechos = sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id)
  const ultimo = hechos.sort((a, b) => a.numSerie - b.numSerie)[hechos.length - 1]
  const siguiente = hechos.length + 1
  const ejercicioCompleto = hechos.length >= series
  const [termino, setTermino] = useState(() => fin <= Date.now())
  const alTerminar = useCallback(() => {
    setTermino(true)
    haptico.finDescanso()
    sonarFinDescanso()
  }, [])

  const sigue = ejercicioCompleto
    ? 'Sigue: el siguiente ejercicio.'
    : `Sigue: serie ${siguiente}${ultimo?.pesoKg != null ? `, ${ultimo.pesoKg} kg` : ''}.`

  return (
    <>
      <div className="fm-sesion-titulo">
        <h1 className="titulo-fm">{item.nombre}</h1>
        <p className="secundario">Descanso, {item.descansoSeg} s</p>
      </div>
      <Ilustracion id={item.ilustracion} nombre={item.nombre} />
      <p className="cuerpo fm-aviso">{sigue}</p>
      <Modulo>
        <Temporizador fin={fin} total={total} onFin={alTerminar} onMas={onMas} onSaltar={onSaltar} />
      </Modulo>
      <div className="fm-pie fm-columna">
        <BotonPrincipal onClick={ejercicioCompleto ? onSiguienteEjercicio : onSaltar} disabled={!termino}>
          {ejercicioCompleto ? 'Siguiente ejercicio' : 'Siguiente serie'}
        </BotonPrincipal>
      </div>
    </>
  )
}

// ---------- Resumen (8.4) ----------

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
      return `${buscarCualquiera(id)?.item.nombre.toLowerCase() ?? id} (+${Math.round(delta * 10) / 10} kg)`
    })
  const alternativas = (sesion.cambios ?? []).map((c) => buscarCualquiera(c.alternativaId)?.item.nombre.toLowerCase() ?? c.alternativaId)
  const minutos = Math.max(1, Math.round((fin - sesion.inicio) / 60000))
  const cumpleSemana = estadoSemana([...datos.sesiones.filter((s) => s.id !== sesion.id), { ...sesion, terminada: true }], new Date(fin)).hechas === 3
  const hechosEj = ejercicios.filter((e) => propios.some((s) => s.exerciseId === e.item.id)).length

  async function terminar() {
    await datos.guardarSesion({ ...sesion, fin, terminada: true })
    haptico.finSesion()
    onTerminar()
  }
  async function descartar() {
    if (!confirm('¿Borrar esta sesión? Se pierden las series de hoy.')) return
    await datos.borrarSesion(sesion.id)
    onTerminar()
  }

  return (
    <>
      <div className="fm-sesion-titulo" style={{ marginTop: 24 }}>
        <h1 className="cifra-grande" style={{ fontSize: 44 }}>Listo.</h1>
        <p className="cuerpo">{sesion.tipo} hecha. {cumpleSemana ? 'Con esta, semana cumplida.' : 'Mañana te vas a acordar.'}</p>
      </div>
      <Modulo>
        <div className="fm-resumen-datos">
          <div><span className="cifra-grande">{minutos}</span><span className="unidad">min</span></div>
          <div><span className="cifra-grande">{hechosEj}</span><span className="unidad">{hechosEj === 1 ? 'ejercicio' : 'ejercicios'}</span></div>
          <div><span className="cifra-grande">{propios.length}</span><span className="unidad">series</span></div>
        </div>
        <p className="cuerpo" style={{ marginTop: 16 }}>
          {subieron.length ? `Subiste en ${subieron.join(', ')}.` : 'Hoy no subiste de peso. Está bien.'}
          {alternativas.length ? ` Cambiaste a ${alternativas.join(', ')}.` : ''}
        </p>
      </Modulo>
      <div className="fm-pie fm-columna">
        <div className="fm-fila fm-sesion-secundarios">
          <BotonSecundario onClick={descartar}>Descartar sesión</BotonSecundario>
        </div>
        <BotonPrincipal onClick={terminar}>Cerrar</BotonPrincipal>
      </div>
    </>
  )
}
