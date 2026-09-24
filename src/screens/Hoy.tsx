import { useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import { useTemperatura, type Temperatura } from '../hooks/useTemperatura'
import { estadoSemana, siguienteSesion, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra } from '../logic/semana'
import { estadoTiempo, estadoSiSalgo, versionInicial, textoManana } from '../logic/horario'
import { claveFecha, DIAS_NOMBRE, MESES_CORTOS, formatoHora } from '../logic/fechas'
import { Semana } from '../components/Semana'
import type { Sesion, Version } from '../data/tipos'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: 'A' | 'B', version: Version) => void
  onContinuar: () => void
}

const TEMP_POR_ESTADO: Record<'completa' | 'corta' | 'no', Temperatura> = {
  completa: 'prep',
  corta: 'moderado',
  no: 'reposo',
}

export function Hoy({ datos, ahora, sesionEnCurso, onEmpezar, onContinuar }: Props) {
  const { sesiones, settings } = datos
  const semana = useMemo(() => estadoSemana(sesiones, ahora), [sesiones, ahora])
  const toca = useMemo(() => siguienteSesion(sesiones), [sesiones])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings), [ahora, settings])
  const rescate = useMemo(() => avisoRescate(sesiones, ahora, settings), [sesiones, ahora, settings])
  const cumplidas = useMemo(() => semanasCumplidas(sesiones, ahora), [sesiones, ahora])
  const proponerExtra = tocaProponerSeriesExtra(cumplidas, settings)
  const version = versionInicial(tiempo.estado, semana.bonus)

  useTemperatura(sesionEnCurso ? 'moderado' : TEMP_POR_ESTADO[tiempo.estado])

  const [salida, setSalida] = useState('')
  const siSalgo = salida ? estadoSiSalgo(salida, settings) : null

  const fechaTexto = `${DIAS_NOMBRE[ahora.getDay()]} ${ahora.getDate()} ${MESES_CORTOS[ahora.getMonth()]}`

  async function marcarFrida() {
    const clave = claveFecha(ahora)
    if (semana.fridaHecha) {
      const f = sesiones.find((s) => s.tipo === 'FRIDA' && semana.dias.some((d) => d.fecha === s.fecha))
      if (f) await datos.borrarSesion(f.id)
      return
    }
    await datos.guardarSesion({
      id: `frida-${clave}`,
      fecha: clave,
      tipo: 'FRIDA',
      version: 'completa',
      inicio: ahora.getTime(),
      fin: ahora.getTime(),
      terminada: true,
    })
  }

  function textoEmpezar(): string {
    if (tiempo.estado === 'no') return 'Empezar de todas formas'
    if (version === 'bonus') return `Empezar ${toca} (bonus)`
    if (version === 'corta') return `Empezar ${toca} corta`
    return `Empezar ${toca}`
  }

  return (
    <div className="pantalla">
      <header className="fila-entre">
        <span className="etiqueta">{fechaTexto}</span>
        <span className="etiqueta numero">{formatoHora(ahora.getHours() * 60 + ahora.getMinutes())}</span>
      </header>

      {sesionEnCurso ? (
        <section className="modulo-temp hoy-protagonista hoy-en-curso">
          <span className="etiqueta hoy-etiqueta">Sesión en curso</span>
          <div className="hoy-letra">
            <span className="letra-gigante">{sesionEnCurso.tipo === 'FRIDA' ? 'F' : sesionEnCurso.tipo}</span>
            <div className="hoy-letra-lado">
              <h1 className="titulo-2">Vas a la mitad</h1>
              <p className="hoy-detalle">Empezaste hace {Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000)} min.</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="modulo-temp hoy-protagonista">
          <span className="etiqueta hoy-etiqueta">{semana.bonus ? 'Bonus · ya van 3' : 'Te toca'}</span>
          <div className="hoy-letra">
            <h1 className="letra-gigante" aria-label={`Te toca ${toca}`}>{toca}</h1>
            <div className="hoy-letra-lado">
              <p className="hoy-estado">{tiempo.titulo}</p>
              <p className="hoy-detalle">
                {tiempo.estado === 'no' ? textoManana(ahora, DIAS_NOMBRE) : tiempo.detalle}
              </p>
            </div>
          </div>
        </section>
      )}

      {sesionEnCurso ? (
        <button className="boton" onClick={onContinuar}>Continuar</button>
      ) : (
        <button className="boton" onClick={() => onEmpezar(toca, version)}>{textoEmpezar()}</button>
      )}

      {rescate && (
        <section className="modulo hoy-rescate">
          <span className="etiqueta">Domingo de rescate</span>
          <p className="titulo-2">{rescate}</p>
        </section>
      )}

      {proponerExtra && (
        <section className="modulo">
          <span className="etiqueta">4 semanas cumplidas</span>
          <p className="titulo-2">A1, A2, B1 y B2 pasan de 3 a 4 series.</p>
          <div className="fila">
            <button className="boton boton-chico" onClick={() => datos.setSettings({ ...settings, seriesExtra: true })}>Aceptar</button>
            <button className="boton boton-chico boton-marco" onClick={() => datos.setSettings({ ...settings, reglaPospuestaEn: cumplidas })}>Posponer</button>
          </div>
        </section>
      )}

      <section className="modulo">
        <Semana estado={semana} hoy={ahora} />
        <button className={`boton boton-capsula ${semana.fridaHecha ? 'boton-secundario' : 'boton-marco'} hoy-frida`} onClick={marcarFrida}>
          {semana.fridaHecha ? 'Lunes con Frida: hecho ✓' : 'Lunes con Frida: hecho'}
        </button>
      </section>

      <section className="modulo">
        <label className="etiqueta" htmlFor="salida">Salgo de la oficina a las</label>
        <div className="fila">
          <input id="salida" type="time" value={salida} onChange={(e) => setSalida(e.target.value)} />
          {salida && (
            <button className="boton-texto" onClick={() => setSalida('')}>Quitar</button>
          )}
        </div>
        {siSalgo ? (
          <p className="texto-2">
            Llegas {formatoHora(siSalgo.llegadaMin)}. {siSalgo.estado === 'completa' ? 'Alcanza la completa.' : siSalgo.estado === 'corta' ? 'Alcanza la corta.' : 'Hoy ya no.'}
          </p>
        ) : (
          <p className="texto-3">Suma {settings.minCarretera} min de carretera y {settings.minCasaClub} de casa al club.</p>
        )}
      </section>
    </div>
  )
}
