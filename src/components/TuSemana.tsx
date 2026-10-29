import type { DiaTuSemana } from '../logic/tusemana'
import { DIAS_NOMBRE, desdeClave } from '../logic/fechas'

/**
 * Tu semana (RUTINA-FINAL.md v7, 2): siete días, L a D. Lo hecho relleno (la letra, o F con P o T para Frida, y un
 * punto chico si fue en la noche), lo planeado en contorno, nada en los días sin plan, y hoy marcado. Tocar un día que
 * ya pasó abre registrar o editar ese día; los de hoy en adelante no hacen nada.
 */
export function TuSemana({ dias, onDia }: { dias: DiaTuSemana[]; onDia: (fecha: string) => void }) {
  return (
    <div className="tira" role="list" aria-label="Tu semana">
      {dias.map((d) => {
        // si el mismo día hay club y Frida, se ve la de club
        const h = d.hecho.find((x) => x.tipo !== 'FRIDA') ?? d.hecho[0]
        const nombre = `${DIAS_NOMBRE[desdeClave(d.fecha).getDay()]} ${desdeClave(d.fecha).getDate()}`
        const texto = h ? `${h.tipo === 'FRIDA' ? `Frida ${h.fridaTipo}` : h.tipo}${h.noche ? ', en la noche' : ''}` : d.plan ? `toca ${d.plan === 'F' ? 'Frida' : d.plan}` : 'nada'
        const marca = (
          <>
            <span className="tira-letra" aria-hidden="true">{d.letra}</span>
            <span className={`tira-marca ${h ? 'hecho' : d.plan ? 'plan' : 'vacio'}`} aria-hidden="true">
              {h ? (h.tipo === 'FRIDA' ? <>F<small>{h.fridaTipo === 'pierna' ? 'P' : 'T'}</small></> : h.tipo) : d.plan}
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
