import type { DiaTuSemana } from '../logic/tusemana'
import { DIAS_NOMBRE, desdeClave } from '../logic/fechas'

/**
 * Tu semana (MANANAS-30.md, 5): siete días, L a D. Las pesas, rellenas con su letra (o F con P o T para Frida, y un
 * punto chico si fue en la noche); la visita de solo regadera, un punto lleno; lo planeado, la letra en contorno; nada
 * en los días sin plan, y hoy marcado. El cardio se ve como la visita: es ida al club. Tocar un día que ya pasó abre registrar o editar ese día; los de hoy en adelante
 * no hacen nada.
 */
export function TuSemana({ dias, onDia }: { dias: DiaTuSemana[]; onDia: (fecha: string) => void }) {
  return (
    <div className="tira" role="list" aria-label="Tu semana">
      {dias.map((d) => {
        // si el mismo día hay club y Frida, se ve la de club con una F chica; la visita solo si no hubo pesas
        const pesas = d.hecho.filter((x) => x.tipo !== 'VISITA')
        const h = pesas.find((x) => x.tipo !== 'FRIDA') ?? pesas[0] ?? d.hecho[0]
        const visita = h?.tipo === 'VISITA'
        const fridaHecha = h && !visita && h.tipo !== 'FRIDA' ? d.hecho.find((x) => x.tipo === 'FRIDA') : undefined
        const nombre = `${DIAS_NOMBRE[desdeClave(d.fecha).getDay()]} ${desdeClave(d.fecha).getDate()}`
        const texto = h
          ? visita ? (h.cardio ? 'cardio' : 'solo regadera') : `${h.tipo === 'FRIDA' ? `Frida ${h.fridaTipo}` : h.tipo}${h.noche ? ', en la noche' : ''}${fridaHecha ? ` y Frida ${fridaHecha.fridaTipo}` : ''}`
          : d.plan ? `toca ${d.plan}` : 'nada'
        const marca = (
          <>
            <span className="tira-letra" aria-hidden="true">{d.letra}</span>
            <span className={`tira-marca ${visita ? 'visita' : h ? 'hecho' : d.plan ? 'plan' : 'vacia'}`} aria-hidden="true">
              {visita ? null : h ? (h.tipo === 'FRIDA' ? <>F<small>{h.fridaTipo === 'pierna' ? 'P' : 'T'}</small></> : <>{h.tipo}{fridaHecha && <small>F</small>}</>) : d.plan}
            </span>
            <span className={`tira-noche ${h?.noche ? 'si' : ''}`} aria-hidden="true" />
          </>
        )
        const clase = `tira-dia${d.hoy ? ' hoy' : ''}`
        const etiqueta = `${d.hoy ? 'Hoy, ' : ''}${nombre}: ${texto}`
        return d.pasado
          ? <button key={d.fecha} role="listitem" className={clase} aria-label={`${etiqueta}. Registrar o cambiar`} onClick={() => onDia(d.fecha)}>{marca}</button>
          : <div key={d.fecha} role="listitem" className={clase} aria-label={etiqueta}>{marca}</div>
      })}
    </div>
  )
}
