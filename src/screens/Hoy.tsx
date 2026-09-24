import { useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Version } from '../data/tipos'
import { useTemp } from '../design/temperatura'
import { estadoSemana, siguienteSesion, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra, seriesPara, entraEnVersion } from '../logic/semana'
import { estadoTiempo, estadoSiSalgo, versionInicial, textoManana } from '../logic/horario'
import { porSesion } from '../logic/progresion'
import { ejerciciosDe } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, MESES_CORTOS, formatoHora, minutosDe } from '../logic/fechas'
import { BotonPrincipal, BotonSecundario, Hoja, Grupo, Fila } from '../components/fm'

interface Props {
  datos: Datos
  ahora: Date
  onEmpezar: (tipo: 'A' | 'B', version: Version) => void
  onAjustes: () => void
}

const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** 7.1 Hoy: una sola decisión, empezar. */
export function Hoy({ datos, ahora, onEmpezar, onAjustes }: Props) {
  const { sesiones, sets, settings } = datos
  const semana = useMemo(() => estadoSemana(sesiones, ahora), [sesiones, ahora])
  const toca = useMemo(() => siguienteSesion(sesiones), [sesiones])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings), [ahora, settings])
  const rescate = useMemo(() => avisoRescate(sesiones, ahora, settings), [sesiones, ahora, settings])
  const cumplidas = useMemo(() => semanasCumplidas(sesiones, ahora), [sesiones, ahora])
  const proponerExtra = tocaProponerSeriesExtra(cumplidas, settings)
  const siSalgo = settings.horaSalida ? estadoSiSalgo(settings.horaSalida, settings) : null
  const estado = siSalgo ? siSalgo.estado : tiempo.estado
  const version = versionInicial(estado, semana.bonus)
  const [hojaExtra, setHojaExtra] = useState(false)
  useTemp('reposo')

  const lista = useMemo(() => ejerciciosDe(toca).filter((e) => entraEnVersion(e.orden, version)), [toca, version])
  const filas = useMemo(
    () =>
      lista.map((e) => {
        const grupos = porSesion(sets, e.id)
        const ultima = grupos[grupos.length - 1]
        let dato = ''
        if (ultima) {
          const peso = Math.max(...ultima.map((s) => s.pesoKg ?? 0))
          const reps = Math.max(...ultima.map((s) => s.reps))
          dato = e.modo === 'peso' ? `${peso} kg` : e.modo === 'tiempo' ? `${reps} s` : `${reps} reps`
        }
        return { id: e.id, nombre: e.nombre, dato, series: seriesPara(e.id, e.series, version, settings.seriesExtra) }
      }),
    [lista, sets, version, settings.seriesExtra],
  )
  const minutos = version === 'corta' ? 45 : version === 'bonus' ? 75 : 65

  const fechaTexto = `${DIAS_NOMBRE[ahora.getDay()].slice(0, 3)} ${ahora.getDate()} ${MESES_CORTOS[ahora.getMonth()]}`
  const claveHoy = claveFecha(ahora)
  const tope = formatoHora(minutosDe(settings.horaTope))

  let linea2: string
  if (siSalgo) linea2 = `Sales a las ${formatoHora(minutosDe(settings.horaSalida!))}. ${siSalgo.estado === 'completa' ? 'Alcanza completa.' : siSalgo.estado === 'corta' ? 'Alcanza la corta.' : 'Hoy ya no, salvo en corta.'}`
  else if (tiempo.estado === 'no') linea2 = `Hoy ya no. ${textoManana(ahora, DIAS_NOMBRE)} Si entras, va en corta.`
  else if (tiempo.estado === 'corta') linea2 = `Tienes ${tiempo.minutosParaTope} min. No alcanza completa, te dejo lo esencial.`
  else if (tiempo.minutosParaTope > 180) linea2 = `Última pesa a las ${tope}. Sin prisa.`
  else linea2 = `Tienes hasta las ${tope}. Alcanza completa.`

  async function alternarFrida() {
    if (semana.fridaHecha) {
      const f = sesiones.find((s) => s.tipo === 'FRIDA' && semana.dias.some((d) => d.fecha === s.fecha))
      if (f) await datos.borrarSesion(f.id)
      return
    }
    const lunes = semana.dias[0].fecha
    await datos.guardarSesion({ id: `frida-${lunes}`, fecha: lunes, tipo: 'FRIDA', version: 'completa', inicio: new Date(lunes + 'T20:00:00').getTime(), fin: new Date(lunes + 'T21:00:00').getTime(), terminada: true })
  }

  return (
    <div className="fm-pantalla fm-con-barra">
      <header className="fm-cabecera">
        <span className="subtexto">{fechaTexto}</span>
        <button className="fm-icono-boton" onClick={onAjustes} aria-label="Ajustes">
          <svg className="fm-icono" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></svg>
        </button>
      </header>

      <div className="fm-columna" style={{ gap: 6, marginTop: 8 }}>
        <p className="subtexto">{semana.bonus ? 'Bonus, ya van 3' : 'Hoy toca'}</p>
        <h1 className="titulo-grande">Cuerpo completo {toca}</h1>
        <p className="subtexto">{filas.length} ejercicios, unos {minutos} min. {linea2}</p>
        {rescate && <p className="subtexto">{rescate}</p>}
      </div>

      <div className="fm-lista-simple">
        {filas.map((f, i) => <Fila key={f.id} num={i + 1} texto={f.nombre} dato={f.dato} />)}
      </div>

      <div className="fm-semana" aria-label={`Esta semana ${semana.hechas} de ${semana.meta}`}>
        {semana.dias.map((d, i) => {
          const hecho = d.tipos.length > 0
          const clase = `fm-punto ${hecho ? 'hecho' : ''} ${d.fecha === claveHoy ? 'hoy' : ''}`
          return i === 0 ? (
            <button key={d.fecha} className={clase} onClick={alternarFrida} aria-label={semana.fridaHecha ? 'Lunes con Frida hecho, tocar para quitar' : 'Marcar lunes con Frida'} aria-pressed={semana.fridaHecha}>
              <i /><span>{LETRAS[i]}</span>
            </button>
          ) : (
            <div key={d.fecha} className={clase}><i /><span>{LETRAS[i]}</span></div>
          )
        })}
      </div>

      <div className="fm-pie con-barra fm-columna">
        {proponerExtra && (
          <div className="fm-secundarios" style={{ justifyContent: 'center' }}>
            <BotonSecundario onClick={() => setHojaExtra(true)}>Ya toca pasar a 4 series.</BotonSecundario>
          </div>
        )}
        <BotonPrincipal onClick={() => onEmpezar(toca, version)}>{tiempo.estado === 'no' && !siSalgo ? 'Empezar de todas formas' : version === 'corta' ? 'Empezar la corta' : 'Empezar'}</BotonPrincipal>
      </div>

      <Hoja abierta={hojaExtra} titulo="Cuatro semanas cumplidas" onCerrar={() => setHojaExtra(false)}>
        <p className="cuerpo">Press de banca, jalón, press inclinado y remo pasan de 3 a 4 series. Se puede apagar en ajustes.</p>
        <Grupo>
          <Fila texto="Aceptar" onClick={() => { datos.setSettings({ ...settings, seriesExtra: true }); setHojaExtra(false) }} />
          <Fila texto="Después" onClick={() => { datos.setSettings({ ...settings, reglaPospuestaEn: cumplidas }); setHojaExtra(false) }} />
        </Grupo>
      </Hoja>
    </div>
  )
}
