import { useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Ejercicio } from '../data/tipos'
import { ejerciciosDe, CALENTAMIENTO, CIERRE, REGLAS_GLOBALES, VERSION_CORTA_TEXTO, REGLA_ALTERNATIVA } from '../data/ejercicios'
import { porSesion } from '../logic/progresion'
import { useTemp } from '../design/temperatura'
import { Grupo, Fila, Hoja } from '../components/fm'
import { FichaHoja } from '../components/Ficha'

/** 7.7 Ejercicios: lista agrupada por rutina con último peso; tocar abre la ficha. */
export function Ejercicios({ datos }: { datos: Datos }) {
  useTemp('reposo')
  const [abierto, setAbierto] = useState<Ejercicio | null>(null)
  const [reglas, setReglas] = useState(false)

  const ultimoPeso = (e: Ejercicio) => {
    const grupos = porSesion(datos.sets, e.id)
    const u = grupos[grupos.length - 1]
    if (!u) return ''
    const peso = Math.max(...u.map((s) => s.pesoKg ?? 0))
    const reps = Math.max(...u.map((s) => s.reps))
    return e.modo === 'peso' ? `${peso} kg` : e.modo === 'tiempo' ? `${reps} s` : `${reps} reps`
  }

  return (
    <div className="fm-pantalla fm-con-barra">
      <header className="fm-cabecera"><h1 className="titulo-grande">Ejercicios</h1></header>
      {(['A', 'B'] as const).map((letra) => (
        <Grupo key={letra} titulo={`Sesión ${letra}`}>
          {ejerciciosDe(letra).map((e) => <Fila key={e.id} num={e.id} texto={e.nombre} dato={ultimoPeso(e)} onClick={() => setAbierto(e)} />)}
        </Grupo>
      ))}
      <Grupo titulo="Reglas">
        <Fila texto="Calentamiento, cierre y reglas de cada serie" onClick={() => setReglas(true)} />
      </Grupo>

      {abierto && <FichaHoja abierta onCerrar={() => setAbierto(null)} base={abierto} item={abierto} datos={datos} series={abierto.series} />}

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
