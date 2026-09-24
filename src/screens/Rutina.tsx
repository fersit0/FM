import { useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Ejercicio, Alternativa } from '../data/tipos'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, REGLAS_GLOBALES, VERSION_CORTA_TEXTO, REGLA_ALTERNATIVA } from '../data/ejercicios'
import { seriesPara } from '../logic/semana'
import { useTemperatura } from '../hooks/useTemperatura'
import { Ilustracion } from '../components/Ilustracion'
import { Detalle } from './Sesion'

function rangoDe(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope'
  return e.repsMin === e.repsMax ? `${e.repsMax}` : `${e.repsMin}-${e.repsMax}`
}

export function Rutina({ datos }: { datos: Datos }) {
  useTemperatura('reposo')
  const [letra, setLetra] = useState<'A' | 'B'>('A')
  const [abierto, setAbierto] = useState<string | null>(null)
  const [seccion, setSeccion] = useState<'sesiones' | 'reglas'>('sesiones')
  const lista = ejerciciosDe(letra)

  return (
    <div className="pantalla">
      <header className="fila-entre">
        <h1 className="titulo">Rutina</h1>
        <div className="fila">
          <button className={`boton boton-capsula ${seccion === 'sesiones' ? 'boton-secundario' : 'boton-marco'}`} onClick={() => setSeccion('sesiones')}>Sesiones</button>
          <button className={`boton boton-capsula ${seccion === 'reglas' ? 'boton-secundario' : 'boton-marco'}`} onClick={() => setSeccion('reglas')}>Reglas</button>
        </div>
      </header>

      {seccion === 'reglas' ? (
        <>
          <section className="modulo">
            <span className="etiqueta">Calentamiento</span>
            <p>{CALENTAMIENTO.texto}</p>
            <p className="texto-2">{CALENTAMIENTO.siOcupada}</p>
          </section>
          <section className="modulo">
            <span className="etiqueta">Cierre</span>
            <p>{CIERRE.texto}</p>
          </section>
          <section className="modulo">
            <span className="etiqueta">Versión corta (45 min)</span>
            <p>{VERSION_CORTA_TEXTO}</p>
          </section>
          <section className="modulo">
            <span className="etiqueta">Cómo elegir alternativa</span>
            <p>{REGLA_ALTERNATIVA}</p>
          </section>
          {REGLAS_GLOBALES.map((r) => (
            <section key={r.titulo} className="modulo">
              <span className="etiqueta">{r.titulo}</span>
              <p>{r.texto}</p>
            </section>
          ))}
        </>
      ) : (
        <>
          <div className="rutina-letras">
            <button className={`rutina-letra ${letra === 'A' ? 'activa' : ''}`} onClick={() => setLetra('A')}>A</button>
            <button className={`rutina-letra ${letra === 'B' ? 'activa' : ''}`} onClick={() => setLetra('B')}>B</button>
          </div>
          <p className="texto-3">Abrir: elíptica {CALENTAMIENTO.minCompleta} min. Cerrar: elíptica o saco {CIERRE.minCompleta} a {CIERRE.minCompletaMax} min.</p>
          <div className="columna rutina-lista">
            {lista.map((e) => {
              const series = seriesPara(e.id, e.series, 'completa', datos.settings.seriesExtra)
              const abiertoEste = abierto === e.id
              return (
                <section key={e.id} className={`modulo rutina-item ${abiertoEste ? 'abierto' : ''}`}>
                  <button className="rutina-cabecera" onClick={() => setAbierto(abiertoEste ? null : e.id)} aria-expanded={abiertoEste}>
                    <span className="etiqueta numero">{e.id}</span>
                    <span className="rutina-nombre">{e.nombre}</span>
                    <span className="numero texto-2">{series} × {rangoDe(e)} · {e.descansoSeg} s</span>
                  </button>
                  {abiertoEste && (
                    <div className="columna rutina-detalle">
                      <Ilustracion id={e.ilustracion} nombre={e.nombre} chica />
                      <Detalle item={e} />
                      <span className="etiqueta">Alternativas</span>
                      {e.alternativas.map((a) => (
                        <div key={a.id} className="modulo-marco rutina-alt">
                          <span className="etiqueta">{a.caso}</span>
                          <p className="alternativa-nombre">{a.nombre}</p>
                          <p className="texto-2 numero">{a.series} × {rangoDe(a)}{a.porLado ? ' por lado' : ''} · {a.descansoSeg} s</p>
                          <Detalle item={a} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
