import { useMemo, useRef } from 'react'
import type { Ejercicio, Alternativa } from '../data/tipos'
import type { Datos } from '../hooks/useDatos'
import { FICHAS } from '../data/fichas'
import { porSesion } from '../logic/progresion'
import { unidadDe, incrementoDe, pesoDeSet } from '../logic/unidades'
import { fechaCorta } from '../logic/fechas'
import { comprimirFoto } from '../lib/fotos'
import { Foto } from './Foto'
import { Linea } from './Linea'
import { Grupo, Fila, Hoja, BotonTexto, Pez } from './fm'

function rango(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}

/** 7.2 Técnica: hoja completa tinta con foto arriba, ficha de FICHAS.md (Para qué, Lo sientes, Prepárate, Movimiento, Imagina, Errores, Cuidado), alternativas y fotos propias. */
export function FichaHoja({ abierta, onCerrar, base, item, datos, series, onElegirAlternativa, conGrafica = false, onVerAlternativa }: {
  abierta: boolean; onCerrar: () => void; base: Ejercicio; item: Ejercicio | Alternativa; datos: Datos; series?: number; onElegirAlternativa?: (a: Alternativa | null) => void; conGrafica?: boolean; onVerAlternativa?: (a: Alternativa) => void
}) {
  // solo la ficha del ejercicio que se está haciendo: nada del original cuando hay alternativa elegida
  const ficha = FICHAS[item.id]
  const archivoA = useRef<HTMLInputElement>(null)
  const archivoB = useRef<HTMLInputElement>(null)
  const unidad = unidadDe(item, datos.settings.unidades)
  const paso = incrementoDe(item, unidad)
  const historial = useMemo(() => porSesion(datos.sets, item.id).slice(-12).map((g) => ({ fecha: g[0].fecha, peso: Math.max(...g.map((s) => pesoDeSet(s, unidad, paso) ?? 0)) })).filter((m) => m.peso > 0), [datos.sets, item.id, unidad, paso])
  const esAlternativa = item.id !== base.id
  const propia = datos.fotosEjercicio.find((f) => f.ejercicioId === item.id)
  async function tomarFoto(cual: 'a' | 'b', e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const blob = await comprimirFoto(f)
    if (cual === 'a') await datos.guardarFotoEjercicio({ ejercicioId: item.id, blob, blob2: propia?.blob2, fecha: new Date().toISOString().slice(0, 10) })
    else if (propia) await datos.guardarFotoEjercicio({ ...propia, blob2: blob })
    else await datos.guardarFotoEjercicio({ ejercicioId: item.id, blob, fecha: new Date().toISOString().slice(0, 10) })
  }
  const videos = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.nombre} técnica`)}`
  return (
    <Hoja abierta={abierta} altura="completa" onCerrar={onCerrar}>
      {conGrafica && historial.length > 0 && <Linea puntos={historial.map((m) => ({ etiqueta: fechaCorta(m.fecha), valor: m.peso }))} unidad={unidad} />}
      {abierta && <Foto clave={item.ilustracion} ejercicioId={item.id} propias={datos.fotosEjercicio} nombre={item.nombre} modo="par" />}
      <div className="columna" style={{ gap: 10 }}>
        <h2 className="t-ejercicio">{item.nombre}</h2>
        <div className="chips">
          <span className="chip">{series ?? item.series} × {rango(item)}{item.porLado ? ' por lado' : ''}</span>
          <span className="chip">Descanso {item.descansoSeg} s</span>
          {esAlternativa && 'caso' in item && <span className="chip">{item.caso}</span>}
        </div>
      </div>
      {ficha ? (
        <>
          <Seccion titulo="Para qué" pez><p className="t-cuerpo" style={{ paddingRight: 80 }}>{ficha.paraQue}</p></Seccion>
          <Seccion titulo="Lo sientes"><p className="t-cuerpo">{ficha.sientes}</p></Seccion>
          <Seccion titulo="Prepárate"><p className="t-cuerpo">{ficha.preparate}</p></Seccion>
          <Seccion titulo="Movimiento"><p className="t-cuerpo">{ficha.movimiento}</p></Seccion>
          <Seccion titulo="Imagina"><p className="t-cuerpo">{ficha.imagina}</p></Seccion>
          <Seccion titulo="Errores">
            {ficha.errores.map((e, i) => <p key={i} className="t-cuerpo">{e.error} <span className="tenue">{e.correccion}</span></p>)}
          </Seccion>
          <Seccion titulo="Cuidado"><p className="t-cuerpo">{ficha.cuidado}</p></Seccion>
        </>
      ) : (
        <>
          <Seccion titulo="Cómo se hace">
            {item.ubicar && <p className="t-cuerpo">{item.ubicar}</p>}
            {item.colocacion && <p className="t-cuerpo">{item.colocacion}</p>}
            {item.tecnica.length > 0 && <ol>{item.tecnica.map((t, i) => <li key={i} className="t-cuerpo">{t}</li>)}</ol>}
          </Seccion>
          {item.errores.length > 0 && <Seccion titulo="Errores"><ul>{item.errores.map((t, i) => <li key={i} className="t-cuerpo">{t}</li>)}</ul></Seccion>}
        </>
      )}
      <Seccion titulo={onElegirAlternativa ? 'Cambiar por' : 'Alternativas'}>
        <Grupo>
          {esAlternativa && onElegirAlternativa && <Fila texto="Volver al original" detalle="Un toque y regresa el de la rutina" onClick={() => onElegirAlternativa(null)} />}
          {base.alternativas.filter((a) => a.id !== item.id).map((a) => (
            <Fila key={a.id} texto={a.nombre} detalle={`${a.caso}. ${a.series} series, ${rango(a)}${a.porLado ? ' por lado' : ''}`} onClick={onElegirAlternativa ? () => onElegirAlternativa(a) : onVerAlternativa ? () => onVerAlternativa(a) : undefined}>
              <Foto clave={a.ilustracion} ejercicioId={a.id} propias={datos.fotosEjercicio} nombre={a.nombre} modo="chica" />
            </Fila>
          ))}
        </Grupo>
      </Seccion>
      <div className="columna" style={{ alignItems: 'flex-start', gap: 0, paddingTop: 8 }}>
        <BotonTexto onClick={() => archivoA.current?.click()}>{propia ? 'Cambiar mi foto de inicio' : 'Tomar foto de mi máquina (inicio)'}</BotonTexto>
        <BotonTexto onClick={() => archivoB.current?.click()}>{propia?.blob2 ? 'Cambiar mi foto de final' : 'Tomar foto de final'}</BotonTexto>
        {propia && <BotonTexto onClick={() => confirm('¿Quitar tus fotos y volver a las de base?') && datos.borrarFotoEjercicio(item.id)}>Quitar mis fotos</BotonTexto>}
        <a className="secundario" href={videos} target="_blank" rel="noreferrer">Ver videos</a>
        <input ref={archivoA} type="file" accept="image/*" capture="environment" onChange={(e) => tomarFoto('a', e)} className="oculto-visual" />
        <input ref={archivoB} type="file" accept="image/*" capture="environment" onChange={(e) => tomarFoto('b', e)} className="oculto-visual" />
      </div>
    </Hoja>
  )
}

function Seccion({ titulo, pez = false, children }: { titulo: string; pez?: boolean; children: React.ReactNode }) {
  return (
    <div className="ficha-seccion">
      <h3 className="t-seccion">{titulo}</h3>
      {children}
      {pez && <Pez expresion="concentrado" tamano={72} style={{ right: 0, top: 0 }} />}
    </div>
  )
}
