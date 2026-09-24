import { useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Ejercicio, Alternativa } from '../data/tipos'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, REGLAS_GLOBALES, VERSION_CORTA_TEXTO, REGLA_ALTERNATIVA } from '../data/ejercicios'
import { seriesPara } from '../logic/semana'
import { useTemp } from '../design/temperatura'
import { Ilustracion } from '../components/Ilustracion'
import { Hoja } from '../components/fm'
import { Detalle } from './Sesion'

function rangoDe(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}

/** Ejercicios (8.6): ficha de catálogo de las sesiones A y B, con la técnica en hoja. */
export function Ejercicios({ datos }: { datos: Datos }) {
  useTemp('reposo')
  const [letra, setLetra] = useState<'A' | 'B'>('A')
  const [abierto, setAbierto] = useState<Ejercicio | null>(null)
  const [reglas, setReglas] = useState(false)
  const lista = ejerciciosDe(letra)

  return (
    <div className="fm-pantalla fm-con-barra">
      <header className="fm-cabecera">
        <h1 className="titulo-fm">Ejercicios</h1>
        <button className="fm-secundario" onClick={() => setReglas(true)}>Reglas</button>
      </header>
      <div className="fm-segmento" role="group" aria-label="Sesión">
        <button aria-pressed={letra === 'A'} onClick={() => setLetra('A')}>Sesión A</button>
        <button aria-pressed={letra === 'B'} onClick={() => setLetra('B')}>Sesión B</button>
      </div>
      <p className="secundario">Abrir con elíptica {CALENTAMIENTO.minCompleta} min. Cerrar con elíptica o saco {CIERRE.minCompleta} a {CIERRE.minCompletaMax} min.</p>
      <div>
        {lista.map((e) => (
          <button key={e.id} className="fm-ejercicio-fila" onClick={() => setAbierto(e)}>
            <span className="cuerpo">{e.nombre}</span>
            <span className="secundario">{seriesPara(e.id, e.series, 'completa', datos.settings.seriesExtra)} series, {rangoDe(e)}, descanso {e.descansoSeg} s</span>
          </button>
        ))}
      </div>

      <Hoja abierta={abierto !== null} titulo={abierto?.nombre ?? ''} onCerrar={() => setAbierto(null)}>
        {abierto && (
          <>
            <Ilustracion id={abierto.ilustracion} nombre={abierto.nombre} />
            <p className="secundario">{seriesPara(abierto.id, abierto.series, 'completa', datos.settings.seriesExtra)} series, {rangoDe(abierto)}, descanso {abierto.descansoSeg} s</p>
            <Detalle item={abierto} />
            <p className="etiqueta-fm">Alternativas</p>
            {abierto.alternativas.map((a) => (
              <div key={a.id} className="fm-columna" style={{ gap: 4 }}>
                <p className="secundario">{a.caso}</p>
                <p className="cuerpo">{a.nombre}, {a.series} series, {rangoDe(a)}{a.porLado ? ' por lado' : ''}</p>
                {(a.ubicar || a.colocacion || a.tecnica.length > 0) && (
                  <p className="secundario">{[a.ubicar, a.colocacion, ...a.tecnica].filter(Boolean).join(' ')}</p>
                )}
              </div>
            ))}
          </>
        )}
      </Hoja>

      <Hoja abierta={reglas} titulo="Reglas" onCerrar={() => setReglas(false)}>
        <div><p className="etiqueta-fm">Calentamiento</p><p className="cuerpo">{CALENTAMIENTO.texto} {CALENTAMIENTO.siOcupada}</p></div>
        <div><p className="etiqueta-fm">Cierre</p><p className="cuerpo">{CIERRE.texto}</p></div>
        <div><p className="etiqueta-fm">Versión corta</p><p className="cuerpo">{VERSION_CORTA_TEXTO}</p></div>
        <div><p className="etiqueta-fm">Cómo elegir alternativa</p><p className="cuerpo">{REGLA_ALTERNATIVA}</p></div>
        {REGLAS_GLOBALES.map((r) => (
          <div key={r.titulo}><p className="etiqueta-fm">{r.titulo}</p><p className="cuerpo">{r.texto}</p></div>
        ))}
      </Hoja>
    </div>
  )
}
