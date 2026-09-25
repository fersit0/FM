import { useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Ejercicio, Alternativa } from '../data/tipos'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, REGLAS_GLOBALES, VERSION_CORTA_TEXTO, REGLA_ALTERNATIVA } from '../data/ejercicios'
import { porSesion } from '../logic/progresion'
import { unidadDe, pesoDeSet, formatoPeso } from '../logic/unidades'
import { usePantalla } from '../design/pantallaActiva'
import { Grupo, Fila, Hoja } from '../components/fm'
import { FichaHoja } from '../components/Ficha'

/** 7.4 Ejercicios: lista por rutina con último peso; tocar abre Técnica con gráfica. */
export function Ejercicios({ datos }: { datos: Datos }) {
  usePantalla('tinta')
  const [abierto, setAbierto] = useState<Ejercicio | null>(null)
  const [alternativa, setAlternativa] = useState<Alternativa | null>(null)
  const [reglas, setReglas] = useState(false)
  const ultimoPeso = (e: Ejercicio) => {
    const grupos = porSesion(datos.sets, e.id)
    const u = grupos[grupos.length - 1]
    if (!u) return ''
    const un = unidadDe(e, datos.settings.unidades)
    const peso = Math.max(...u.map((s) => pesoDeSet(s, un) ?? 0))
    const reps = Math.max(...u.map((s) => s.reps))
    return e.modo === 'peso' ? formatoPeso(peso, un) : e.modo === 'tiempo' ? `${reps} s` : `${reps} reps`
  }
  return (
    <div className="pantalla con-barra">
      <h1 className="t-titulo">Ejercicios</h1>
      {(['A', 'B'] as const).map((letra) => (
        <Grupo key={letra} titulo={`Cuerpo completo ${letra}`}>
          {ejerciciosDe(letra).map((e) => <Fila key={e.id} num={e.id} texto={e.nombre} dato={ultimoPeso(e)} onClick={() => setAbierto(e)} />)}
        </Grupo>
      ))}
      <Grupo titulo="Reglas"><Fila texto="Calentamiento, cierre y reglas de cada serie" onClick={() => setReglas(true)} /></Grupo>
      {abierto && <FichaHoja abierta onCerrar={() => setAbierto(null)} base={abierto} item={abierto} datos={datos} series={abierto.series} conGrafica onVerAlternativa={setAlternativa} />}
      {abierto && alternativa && <FichaHoja abierta onCerrar={() => setAlternativa(null)} base={abierto} item={alternativa} datos={datos} conGrafica />}
      <Hoja abierta={reglas} altura="completa" titulo="Reglas" onCerrar={() => setReglas(false)}>
        <Grupo>
          <Fila texto="Calentamiento" detalle={`${CALENTAMIENTO.texto} ${CALENTAMIENTO.siOcupada}`} />
          <Fila texto="Cierre" detalle={CIERRE.texto} />
          <Fila texto="Versión corta" detalle={VERSION_CORTA_TEXTO} />
          <Fila texto="Cómo elegir alternativa" detalle={REGLA_ALTERNATIVA} />
          {REGLAS_GLOBALES.map((r) => <Fila key={r.titulo} texto={r.titulo} detalle={r.texto} />)}
        </Grupo>
      </Hoja>
    </div>
  )
}
