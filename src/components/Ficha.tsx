import { useMemo, useRef } from 'react'
import type { Ejercicio, Alternativa } from '../data/tipos'
import type { Datos } from '../hooks/useDatos'
import { FICHAS } from '../data/fichas'
import { maximosPorSesion } from '../logic/progresion'
import { fechaCorta } from '../logic/fechas'
import { comprimirFoto } from '../lib/fotos'
import { Foto } from './Foto'
import { Linea } from './Linea'
import { Grupo, Fila, Hoja, BotonSecundario } from './fm'

function rango(e: Ejercicio | Alternativa): string {
  if (e.modo === 'tiempo') return `${e.repsMax} s`
  if (e.repsMax === 0) return 'al tope con 2 guardadas'
  return e.repsMin === e.repsMax ? `${e.repsMax} reps` : `${e.repsMin} a ${e.repsMax} reps`
}

/**
 * 8.2 Ficha de técnica en hoja completa: foto arriba, secciones como lista agrupada.
 * Desde la sesión permite cambiar a una alternativa.
 */
export function FichaHoja({ abierta, onCerrar, base, item, datos, series, onElegirAlternativa }: {
  abierta: boolean
  onCerrar: () => void
  base: Ejercicio
  item: Ejercicio | Alternativa
  datos: Datos
  series?: number
  onElegirAlternativa?: (a: Alternativa | null) => void
}) {
  const ficha = FICHAS[item.id] ?? FICHAS[base.id]
  const archivo = useRef<HTMLInputElement>(null)
  const historial = useMemo(() => maximosPorSesion(datos.sets, item.id, 12).filter((m) => m.peso > 0), [datos.sets, item.id])
  const esAlternativa = item.id !== base.id
  const propia = datos.fotosEjercicio.find((f) => f.ejercicioId === item.id)

  async function tomarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const blob = await comprimirFoto(f)
    await datos.guardarFotoEjercicio({ ejercicioId: item.id, blob, fecha: new Date().toISOString().slice(0, 10) })
  }

  return (
    <Hoja abierta={abierta} altura="completa" onCerrar={onCerrar}>
      <div className="fm-hoja-ficha fm-columna" style={{ gap: 16 }}>
        <div className="fm-sesion-titulo">
          <h2 className="titulo-grande">{item.nombre}</h2>
          <p className="subtexto">{series ?? item.series} series, {rango(item)}{item.porLado ? ' por lado' : ''}, descanso {item.descansoSeg} s{esAlternativa && 'caso' in item ? `. Alternativa de ${base.nombre.toLowerCase()}` : ''}</p>
        </div>
        <Foto clave={item.ilustracion} ejercicioId={item.id} propias={datos.fotosEjercicio} nombre={item.nombre} />
        <div className="fm-secundarios" style={{ justifyContent: 'flex-start', gap: 16 }}>
          <BotonSecundario onClick={() => archivo.current?.click()}>{propia ? 'Cambiar foto' : 'Tomar foto'}</BotonSecundario>
          {propia && <BotonSecundario onClick={() => confirm('¿Quitar tu foto y volver a la de base?') && datos.borrarFotoEjercicio(item.id)}>Quitar foto</BotonSecundario>}
          <input ref={archivo} type="file" accept="image/*" capture="environment" onChange={tomarFoto} className="oculto-visual" />
        </div>

        {ficha ? (
          <>
            <Seccion titulo="Qué trabaja"><p className="cuerpo">{ficha.trabaja}</p></Seccion>
            <Seccion titulo="Qué debes sentir"><p className="cuerpo">{ficha.sentir}</p></Seccion>
            <Seccion titulo="Preparación"><ul>{ficha.preparacion.map((t, i) => <li key={i} className="cuerpo">{t}</li>)}</ul></Seccion>
            <Seccion titulo="Ejecución"><ol>{ficha.ejecucion.map((t, i) => <li key={i} className="cuerpo">{t}</li>)}</ol></Seccion>
            <Seccion titulo="Errores comunes">
              <Grupo>
                {ficha.errores.map((e, i) => <Fila key={i} texto={e.error} detalle={e.correccion} />)}
              </Grupo>
            </Seccion>
            <Seccion titulo="Cómo escoger el peso"><p className="cuerpo">{ficha.peso}</p></Seccion>
            <Seccion titulo="Alternativa"><p className="cuerpo">{ficha.alternativa}</p></Seccion>
          </>
        ) : (
          <>
            {item.ubicar && <Seccion titulo="Ubicar"><p className="cuerpo">{item.ubicar}</p></Seccion>}
            {item.colocacion && <Seccion titulo="Preparación"><p className="cuerpo">{item.colocacion}</p></Seccion>}
            {item.tecnica.length > 0 && <Seccion titulo="Ejecución"><ol>{item.tecnica.map((t, i) => <li key={i} className="cuerpo">{t}</li>)}</ol></Seccion>}
            {item.errores.length > 0 && <Seccion titulo="Errores comunes"><ul>{item.errores.map((t, i) => <li key={i} className="cuerpo">{t}</li>)}</ul></Seccion>}
          </>
        )}

        <Seccion titulo={onElegirAlternativa ? 'Cambiar por' : 'Alternativas'}>
          <Grupo>
            {esAlternativa && onElegirAlternativa && <Fila texto={base.nombre} detalle="Volver al original" onClick={() => onElegirAlternativa(null)} />}
            {base.alternativas.filter((a) => a.id !== item.id).map((a) => (
              <Fila key={a.id} texto={a.nombre} detalle={`${a.caso}. ${a.series} series, ${rango(a)}${a.porLado ? ' por lado' : ''}`} onClick={onElegirAlternativa ? () => onElegirAlternativa(a) : undefined} />
            ))}
          </Grupo>
        </Seccion>

        {historial.length > 0 && (
          <Seccion titulo="Peso en el tiempo">
            <Linea puntos={historial.map((m) => ({ etiqueta: fechaCorta(m.fecha), valor: m.peso }))} />
          </Seccion>
        )}
      </div>
    </Hoja>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="fm-ficha-seccion">
      <h3 className="titulo">{titulo}</h3>
      {children}
    </div>
  )
}
