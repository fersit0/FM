import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion as SesionTipo, Ejercicio, Alternativa, SetLog, Version } from '../data/tipos'
import type { SesionActiva } from '../hooks/useSesionActiva'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, buscarCualquiera } from '../data/ejercicios'
import { seriesPara, entraEnVersion } from '../logic/semana'
import { sugerirPeso, subioDePeso } from '../logic/progresion'
import { claveFecha, formatoDuracion } from '../logic/fechas'
import { useWakeLock } from '../hooks/useWakeLock'
import { useTemperatura, type Temperatura } from '../hooks/useTemperatura'
import { vibrar, beep, prepararAudio } from '../logic/senales'
import { Hoja } from '../components/Hoja'
import { CuentaRegresiva, Transcurrido } from '../components/Cronometro'
import { Ilustracion } from '../components/Ilustracion'

interface Props {
  datos: Datos
  sesion: SesionTipo
  activa: SesionActiva
  setActiva: (a: SesionActiva | null) => void
  onSalir: () => void
  onTerminar: () => void
}

type Paso =
  | { tipo: 'calentamiento' }
  | { tipo: 'ejercicio'; base: Ejercicio; item: Ejercicio | Alternativa; indice: number; total: number }
  | { tipo: 'cierre' }
  | { tipo: 'resumen' }

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
      return { tipo: 'ejercicio', base, item, indice: i + 1, total: lista.length }
    })
    return [{ tipo: 'calentamiento' }, ...ejercicios, { tipo: 'cierre' }, { tipo: 'resumen' }]
  }, [sesion.tipo, sesion.cambios, version])

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

  const descansando = activa.descansoFin !== undefined && activa.descansoFin > Date.now()

  // Temperatura de toda la interfaz según el paso
  let temp: Temperatura = 'reposo'
  if (paso.tipo === 'calentamiento') temp = 'prep'
  else if (paso.tipo === 'cierre') temp = 'moderado'
  else if (paso.tipo === 'ejercicio') temp = 'fuerte'
  if (descansando) temp = 'reposo'
  useTemperatura(temp)

  return (
    <div className="pantalla-llena sesion">
      <header className="fila-entre sesion-cabecera">
        <button className="boton-texto" onClick={onSalir}>‹ Hoy</button>
        <span className="etiqueta">
          Sesión {sesion.tipo} · {ligera ? 'ligera' : version} · <Transcurrido desde={sesion.inicio} />
        </span>
        <button className="boton-texto" onClick={() => setMenu(true)} aria-label="Opciones de la sesión">···</button>
      </header>

      {paso.tipo === 'calentamiento' && (
        <PasoTiempo
          etiqueta="Calentamiento"
          titulo="Elíptica"
          minutos={minutosCalentamiento(version)}
          texto={`${CALENTAMIENTO.texto} ${CALENTAMIENTO.siOcupada}`}
          activa={activa}
          setActiva={setActiva}
          onListo={() => ir(indice + 1)}
        />
      )}

      {paso.tipo === 'ejercicio' && (
        <PasoEjercicio
          key={paso.item.id}
          datos={datos}
          sesion={sesion}
          paso={paso}
          sets={sets}
          series={seriesPara(paso.base.id, paso.item.series, version, settings.seriesExtra, ligera)}
          activa={activa}
          setActiva={setActiva}
          onAnterior={() => ir(indice - 1)}
          onSiguiente={() => ir(indice + 1)}
        />
      )}

      {paso.tipo === 'cierre' && (
        <PasoTiempo
          etiqueta="Cierre"
          titulo="Elíptica o saco"
          minutos={minutosCierre(version)}
          texto={CIERRE.texto}
          activa={activa}
          setActiva={setActiva}
          onListo={() => ir(indice + 1)}
          onAtras={() => ir(indice - 1)}
        />
      )}

      {paso.tipo === 'resumen' && (
        <Resumen datos={datos} sesion={sesion} sets={sets} onTerminar={onTerminar} onAtras={() => ir(indice - 1)} />
      )}

      {descansando && activa.descansoFin !== undefined && (
        <Descanso fin={activa.descansoFin} seg={activa.descansoSeg ?? 60} onFin={() => setActiva({ ...activa, descansoFin: undefined })} />
      )}

      <Hoja abierta={menu} titulo="Esta sesión" onCerrar={() => setMenu(false)}>
        <div className="columna">
          <span className="etiqueta">Versión</span>
          <div className="fila sesion-versiones">
            <button className={`boton boton-capsula ${version === 'completa' && !ligera ? 'boton-temp' : 'boton-marco'}`} onClick={() => cambiarVersion('completa', false)}>Completa</button>
            <button className={`boton boton-capsula ${version === 'corta' ? 'boton-temp' : 'boton-marco'}`} onClick={() => cambiarVersion('corta', false)}>Corta</button>
            <button className={`boton boton-capsula ${version === 'bonus' ? 'boton-temp' : 'boton-marco'}`} onClick={() => cambiarVersion('bonus', false)}>Bonus</button>
          </div>
          <button className={`boton boton-capsula ${ligera ? 'boton-temp' : 'boton-marco'}`} onClick={() => cambiarVersion(version === 'corta' ? 'completa' : version, !ligera)}>
            {ligera ? 'Ligera: 2 series, mismo peso ✓' : 'Ligera: 2 series, mismo peso'}
          </button>
          <p className="texto-3">Corta: ejercicios 1 a 4 con 2 series, calentamiento 4 min, cierre 5. Ligera: para cuando dos semanas seguidas llegaste muerto.</p>
          <span className="etiqueta" style={{ marginTop: 12 }}>Terminar</span>
          <button className="boton boton-chico boton-secundario" onClick={() => { setMenu(false); ir(pasos.length - 1) }}>Ir al resumen</button>
        </div>
      </Hoja>
    </div>
  )
}

// ---------- Calentamiento / Cierre ----------

function PasoTiempo({ etiqueta, titulo, minutos, texto, activa, setActiva, onListo, onAtras }: {
  etiqueta: string
  titulo: string
  minutos: number
  texto: string
  activa: SesionActiva
  setActiva: (a: SesionActiva) => void
  onListo: () => void
  onAtras?: () => void
}) {
  const inicio = activa.timerInicio
  const fin = inicio !== undefined ? inicio + minutos * 60000 : undefined
  const [termino, setTermino] = useState(false)
  const alTerminar = useCallback(() => {
    setTermino(true)
    vibrar([60, 40, 60])
    beep()
  }, [])

  return (
    <div className="paso-tiempo">
      <span className="etiqueta">{etiqueta}</span>
      <h1 className="titulo">{titulo}</h1>
      <p className="texto-2">{texto}</p>
      <div className="modulo-temp paso-reloj">
        {fin !== undefined ? (
          <CuentaRegresiva fin={fin} onTerminar={alTerminar} />
        ) : (
          <span className="numero-grande">{minutos}:00</span>
        )}
        <span className="etiqueta hoy-etiqueta">{termino ? 'Listo' : fin !== undefined ? 'corriendo' : `${minutos} minutos`}</span>
      </div>
      <div className="columna">
        {fin === undefined ? (
          <button className="boton" onClick={() => { prepararAudio(); setActiva({ ...activa, timerInicio: Date.now() }) }}>Arrancar</button>
        ) : (
          <button className="boton" onClick={onListo}>{termino ? 'Seguir' : 'Ya, seguir'}</button>
        )}
        <div className="fila-entre">
          {onAtras ? <button className="boton-texto" onClick={onAtras}>‹ Anterior</button> : <span />}
          <button className="boton-texto" onClick={onListo}>Saltar ›</button>
        </div>
      </div>
    </div>
  )
}

// ---------- Ejercicio ----------

function PasoEjercicio({ datos, sesion, paso, sets, series, activa, setActiva, onAnterior, onSiguiente }: {
  datos: Datos
  sesion: SesionTipo
  paso: Extract<Paso, { tipo: 'ejercicio' }>
  sets: SetLog[]
  series: number
  activa: SesionActiva
  setActiva: (a: SesionActiva) => void
  onAnterior: () => void
  onSiguiente: () => void
}) {
  const { base, item, indice, total } = paso
  const esAlternativa = item.id !== base.id
  const hechos = useMemo(
    () => sets.filter((s) => s.sessionId === sesion.id && s.exerciseId === item.id).sort((a, b) => a.numSerie - b.numSerie),
    [sets, sesion.id, item.id],
  )
  const historial = useMemo(() => sets.filter((s) => s.sessionId !== sesion.id), [sets, sesion.id])
  const sugerencia = useMemo(() => sugerirPeso(historial, item.id, item.repsMax, item.modo), [historial, item.id, item.repsMax, item.modo])

  const siguienteNum = hechos.length + 1
  const ultimo = hechos[hechos.length - 1]
  const [peso, setPeso] = useState<string>(() => {
    const p = ultimo?.pesoKg ?? sugerencia.peso
    return p === null || p === undefined ? '' : String(p)
  })
  const [reps, setReps] = useState<string>(() => {
    if (ultimo) return String(ultimo.reps)
    if (item.modo === 'tiempo') return String(item.repsMax)
    if (item.repsMax === 0) return ''
    return String(item.repsMax)
  })
  const [tecnica, setTecnica] = useState(false)
  const [cambiar, setCambiar] = useState(false)

  const completo = hechos.length >= series
  const esUltima = siguienteNum === series

  useTemperatura(esUltima && !completo ? 'pico' : 'fuerte')

  async function guardar() {
    prepararAudio()
    const pesoNum = item.modo === 'peso' ? parseFloat(peso.replace(',', '.')) : null
    const repsNum = parseInt(reps, 10)
    if (item.modo === 'peso' && (pesoNum === null || Number.isNaN(pesoNum))) return
    if (Number.isNaN(repsNum) || repsNum <= 0) return
    const ahora = Date.now()
    await datos.guardarSet({
      sessionId: sesion.id,
      exerciseId: item.id,
      ejercicioBaseId: base.id,
      numSerie: siguienteNum,
      pesoKg: pesoNum,
      reps: repsNum,
      fecha: claveFecha(new Date(ahora)),
      hora: ahora,
    })
    vibrar(40)
    const fueUltima = siguienteNum >= series
    setActiva({ ...activa, descansoFin: ahora + item.descansoSeg * 1000, descansoSeg: item.descansoSeg })
    if (fueUltima) {
      /* el descanso corre; el usuario avanza cuando quiera */
    }
  }

  async function elegirAlternativa(alt: Alternativa | null) {
    const cambios = (sesion.cambios ?? []).filter((c) => c.ejercicioId !== base.id)
    if (alt) cambios.push({ ejercicioId: base.id, alternativaId: alt.id })
    await datos.guardarSesion({ ...sesion, cambios })
    setCambiar(false)
  }

  const rango = item.modo === 'tiempo'
    ? `${item.repsMax} s`
    : item.repsMax === 0
      ? 'al tope, 2 guardadas'
      : item.repsMin === item.repsMax ? `${item.repsMax}` : `${item.repsMin}-${item.repsMax}`

  return (
    <div className="paso-ejercicio">
      <div className="fila-entre">
        <span className="etiqueta">{indice} de {total}{esAlternativa && 'caso' in item ? ` · ${item.caso.toLowerCase()}` : ''}</span>
        <span className="etiqueta numero">{series} × {rango}{item.porLado ? ' por lado' : ''}</span>
      </div>

      <Ilustracion id={item.ilustracion} nombre={item.nombre} />

      <h1 className="titulo sesion-nombre">{item.nombre}</h1>

      {base.orden === 1 && hechos.length === 0 && (
        <p className="texto-3">Antes, una serie de aproximación: mitad del peso, 10 reps. No se registra.</p>
      )}

      <p className={`sugerencia sugerencia-${sugerencia.tipo}`}>{sugerencia.texto}</p>

      <div className="series">
        {Array.from({ length: Math.max(series, hechos.length) }, (_, i) => {
          const h = hechos[i]
          const activaFila = !h && i === hechos.length
          return (
            <div key={i} className={`serie ${h ? 'hecha' : ''} ${activaFila ? 'activa' : ''}`}>
              <span className="serie-num numero">{i + 1}</span>
              {h ? (
                <>
                  <span className="serie-dato numero">{h.pesoKg !== null ? `${h.pesoKg} kg` : '—'}</span>
                  <span className="serie-dato numero">{h.reps}{item.modo === 'tiempo' ? ' s' : ''}</span>
                  <button className="boton-texto serie-borrar" onClick={() => h.id !== undefined && datos.borrarSet(h.id)} aria-label={`Borrar serie ${i + 1}`}>×</button>
                </>
              ) : activaFila ? (
                <>
                  {item.modo === 'peso' ? (
                    <label className="serie-campo">
                      <span className="etiqueta">kg</span>
                      <input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="—" aria-label="Peso en kilos" />
                    </label>
                  ) : (
                    <span className="serie-dato texto-3">{item.modo === 'tiempo' ? 'segundos' : 'peso corporal'}</span>
                  )}
                  <label className="serie-campo">
                    <span className="etiqueta">{item.modo === 'tiempo' ? 's' : 'reps'}</span>
                    <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="—" aria-label="Repeticiones" />
                  </label>
                </>
              ) : (
                <span className="serie-dato texto-3">·</span>
              )}
            </div>
          )
        })}
      </div>

      {!completo ? (
        <button className="boton boton-temp" onClick={guardar}>
          {esUltima ? 'Guardar última' : `Guardar serie ${siguienteNum}`}
        </button>
      ) : (
        <button className="boton" onClick={onSiguiente}>{indice === total ? 'Ir al cierre' : 'Siguiente ejercicio'}</button>
      )}

      <div className="fila sesion-acciones">
        <button className="boton boton-chico boton-marco" onClick={() => setCambiar(true)}>Cambiar</button>
        <button className="boton boton-chico boton-marco" onClick={() => setTecnica(true)}>Técnica</button>
      </div>

      <div className="fila-entre sesion-nav">
        <button className="boton-texto" onClick={onAnterior}>‹ Anterior</button>
        <button className="boton-texto" onClick={onSiguiente}>{completo ? '' : 'Saltar ›'}</button>
      </div>

      <Hoja abierta={tecnica} titulo={item.nombre} onCerrar={() => setTecnica(false)}>
        <Detalle item={item} />
      </Hoja>

      <Hoja abierta={cambiar} titulo="Cambiar" onCerrar={() => setCambiar(false)}>
        <div className="columna">
          <p className="texto-3">Primero la que use el mismo equipo, luego mancuernas, luego peso corporal. Cada una guarda su propio peso.</p>
          {esAlternativa && (
            <button className="alternativa" onClick={() => elegirAlternativa(null)}>
              <span className="etiqueta">Original</span>
              <span className="alternativa-nombre">{base.nombre}</span>
            </button>
          )}
          {base.alternativas.filter((a) => a.id !== item.id).map((a) => (
            <button key={a.id} className="alternativa" onClick={() => elegirAlternativa(a)}>
              <span className="etiqueta">{a.caso}</span>
              <span className="alternativa-nombre">{a.nombre}</span>
              <span className="texto-3 numero">{a.series} × {a.modo === 'tiempo' ? `${a.repsMax} s` : a.repsMax === 0 ? 'al tope' : a.repsMin === a.repsMax ? a.repsMax : `${a.repsMin}-${a.repsMax}`}{a.porLado ? ' por lado' : ''}</span>
            </button>
          ))}
        </div>
      </Hoja>
    </div>
  )
}

export function Detalle({ item }: { item: Ejercicio | Alternativa }) {
  return (
    <div className="detalle">
      {item.ubicar && (
        <div className="columna">
          <span className="etiqueta">Ubicar</span>
          <p>{item.ubicar}</p>
        </div>
      )}
      {item.colocacion && (
        <div className="columna">
          <span className="etiqueta">Colocación</span>
          <p>{item.colocacion}</p>
        </div>
      )}
      {item.tecnica.length > 0 && (
        <div className="columna">
          <span className="etiqueta">Técnica</span>
          <ol className="lista">{item.tecnica.map((t, i) => <li key={i}>{t}</li>)}</ol>
        </div>
      )}
      {item.errores.length > 0 && (
        <div className="columna">
          <span className="etiqueta">Errores</span>
          <ul className="lista">{item.errores.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}
    </div>
  )
}

// ---------- Descanso ----------

function Descanso({ fin, seg, onFin }: { fin: number; seg: number; onFin: () => void }) {
  const [termino, setTermino] = useState(false)
  const alTerminar = useCallback(() => {
    setTermino(true)
    vibrar([80, 50, 80])
    beep()
  }, [])
  useEffect(() => {
    if (!termino) return
    const id = setTimeout(onFin, 1500)
    return () => clearTimeout(id)
  }, [termino, onFin])

  const progreso = Math.min(1, Math.max(0, 1 - (fin - Date.now()) / (seg * 1000)))

  return (
    <div className="descanso" role="dialog" aria-label="Descanso">
      <span className="etiqueta hoy-etiqueta">Descanso · {seg} s</span>
      <CuentaRegresiva fin={fin} onTerminar={alTerminar} />
      <div className="descanso-barra" aria-hidden="true">
        <div className="descanso-lleno" style={{ transform: `scaleX(${progreso})` }} />
      </div>
      <button className="boton boton-secundario" onClick={onFin}>{termino ? 'Listo' : 'Saltar'}</button>
    </div>
  )
}

// ---------- Resumen ----------

function Resumen({ datos, sesion, sets, onTerminar, onAtras }: { datos: Datos; sesion: SesionTipo; sets: SetLog[]; onTerminar: () => void; onAtras: () => void }) {
  useTemperatura('reposo')
  const [fin] = useState(() => Date.now())
  const propios = sets.filter((s) => s.sessionId === sesion.id)
  const ids = [...new Set(propios.map((s) => s.exerciseId))]
  const subieron = ids.filter((id) => subioDePeso(sets, id, sesion.id)).map((id) => buscarCualquiera(id)?.item.nombre ?? id)
  const alternativas = (sesion.cambios ?? []).map((c) => buscarCualquiera(c.alternativaId)?.item.nombre ?? c.alternativaId)

  async function terminar() {
    await datos.guardarSesion({ ...sesion, fin, terminada: true })
    vibrar([60, 40, 60, 40, 120])
    onTerminar()
  }
  async function descartar() {
    if (!confirm('¿Borrar esta sesión? Se pierden las series de hoy.')) return
    await datos.borrarSesion(sesion.id)
    onTerminar()
  }

  return (
    <div className="resumen">
      <span className="etiqueta">Sesión {sesion.tipo} · {sesion.ligera ? 'ligera' : sesion.version}</span>
      <h1 className="titulo">Listo por hoy.</h1>
      <div className="resumen-datos">
        <div className="modulo">
          <span className="etiqueta">Tiempo</span>
          <span className="numero-grande">{formatoDuracion(fin - sesion.inicio)}</span>
        </div>
        <div className="modulo">
          <span className="etiqueta">Series</span>
          <span className="numero-grande">{propios.length}</span>
        </div>
      </div>
      <div className="modulo">
        <span className="etiqueta">Subiste de peso</span>
        {subieron.length ? <ul className="lista">{subieron.map((n) => <li key={n}>{n}</li>)}</ul> : <p className="texto-3">Hoy no. Está bien.</p>}
      </div>
      <div className="modulo">
        <span className="etiqueta">Alternativas usadas</span>
        {alternativas.length ? <ul className="lista">{alternativas.map((n) => <li key={n}>{n}</li>)}</ul> : <p className="texto-3">Ninguna.</p>}
      </div>
      <button className="boton" onClick={terminar}>Terminar</button>
      <div className="fila-entre">
        <button className="boton-texto" onClick={onAtras}>‹ Anterior</button>
        <button className="boton-texto" onClick={descartar}>Descartar</button>
      </div>
    </div>
  )
}
