import type { EstadoSemana } from '../logic/semana'
import { claveFecha } from '../logic/fechas'

const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** X/3 con los días marcados. Superficie que se llena, no anillos. */
export function Semana({ estado, hoy }: { estado: EstadoSemana; hoy: Date }) {
  const claveHoy = claveFecha(hoy)
  return (
    <div className="semana">
      <div className="fila-entre">
        <span className="etiqueta">Esta semana</span>
        <span className="numero semana-cuenta">
          {estado.hechas}/{estado.meta}
        </span>
      </div>
      <div className="semana-dias">
        {estado.dias.map((d, i) => {
          const hecho = d.tipos.length > 0
          const frida = d.tipos.includes('FRIDA')
          return (
            <div key={d.fecha} className={`semana-dia ${hecho ? (frida ? 'frida' : 'hecho') : ''} ${d.fecha === claveHoy ? 'hoy' : ''}`}>
              <span className="semana-letra">{LETRAS[i]}</span>
              <span className="semana-luz" aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
