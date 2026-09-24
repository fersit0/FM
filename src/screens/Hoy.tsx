import { useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, Version } from '../data/tipos'
import { useTemp } from '../design/temperatura'
import { estadoSemana, siguienteSesion, avisoRescate, semanasCumplidas, tocaProponerSeriesExtra } from '../logic/semana'
import { estadoTiempo, estadoSiSalgo, versionInicial, textoManana } from '../logic/horario'
import { porSesion } from '../logic/progresion'
import { ejerciciosDe } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, MESES_CORTOS, formatoHora, minutosDe } from '../logic/fechas'
import { Modulo, BotonPrincipal, BotonSecundario } from '../components/fm'

interface Props {
  datos: Datos
  ahora: Date
  sesionEnCurso: Sesion | null
  onEmpezar: (tipo: 'A' | 'B', version: Version) => void
  onContinuar: () => void
  onAjustes: () => void
}

const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function Hoy({ datos, ahora, sesionEnCurso, onEmpezar, onContinuar, onAjustes }: Props) {
  const { sesiones, sets, settings } = datos
  const semana = useMemo(() => estadoSemana(sesiones, ahora), [sesiones, ahora])
  const toca = useMemo(() => siguienteSesion(sesiones), [sesiones])
  const tiempo = useMemo(() => estadoTiempo(ahora, settings), [ahora, settings])
  const rescate = useMemo(() => avisoRescate(sesiones, ahora, settings), [sesiones, ahora, settings])
  const cumplidas = useMemo(() => semanasCumplidas(sesiones, ahora), [sesiones, ahora])
  const proponerExtra = tocaProponerSeriesExtra(cumplidas, settings)
  const version = versionInicial(tiempo.estado, semana.bonus)
  const [salida, setSalida] = useState('')
  const [salidaAbierta, setSalidaAbierta] = useState(false)
  const siSalgo = salida ? estadoSiSalgo(salida, settings) : null

  useTemp(tiempo.estado === 'completa' && !sesionEnCurso ? 'trabajo' : 'reposo')

  // La vez pasada: última sesión de la letra que toca, peso máximo y reps por ejercicio
  const vezPasada = useMemo(() => {
    const filas: { nombre: string; dato: string }[] = []
    for (const e of ejerciciosDe(toca)) {
      const grupos = porSesion(sets, e.id)
      const ultima = grupos[grupos.length - 1]
      if (!ultima) continue
      const peso = Math.max(...ultima.map((s) => s.pesoKg ?? 0))
      const reps = Math.max(...ultima.map((s) => s.reps))
      filas.push({ nombre: e.nombre, dato: e.modo === 'peso' ? `${peso} kg × ${reps}` : e.modo === 'tiempo' ? `${reps} s` : `× ${reps}` })
    }
    return filas.slice(0, 5)
  }, [sets, toca])

  const fechaTexto = `${DIAS_NOMBRE[ahora.getDay()].slice(0, 3)} ${ahora.getDate()} ${MESES_CORTOS[ahora.getMonth()]}`
  const claveHoy = claveFecha(ahora)
  const tope = formatoHora(minutosDe(settings.horaTope))
  const sinPrisa = tiempo.estado === 'completa' && tiempo.minutosParaTope > 180

  async function marcarFrida() {
    if (semana.fridaHecha) {
      const f = sesiones.find((s) => s.tipo === 'FRIDA' && semana.dias.some((d) => d.fecha === s.fecha))
      if (f) await datos.borrarSesion(f.id)
      return
    }
    await datos.guardarSesion({ id: `frida-${claveHoy}`, fecha: claveHoy, tipo: 'FRIDA', version: 'completa', inicio: ahora.getTime(), fin: ahora.getTime(), terminada: true })
  }

  const textoEmpezar = sesionEnCurso ? 'Continuar' : tiempo.estado === 'no' ? 'Empezar de todas formas' : version === 'corta' ? 'Empezar la corta' : 'Empezar'

  return (
    <div className="fm-pantalla fm-con-barra">
      <header className="fm-cabecera">
        <span className="secundario">{fechaTexto}</span>
        <button className="fm-icono-boton" onClick={onAjustes} aria-label="Ajustes">
          <svg className="fm-icono" viewBox="0 0 22 22"><circle cx="11" cy="11" r="2.5" /><path d="M11 3v2.5M11 16.5V19M3 11h2.5M16.5 11H19M5.3 5.3l1.8 1.8M14.9 14.9l1.8 1.8M5.3 16.7l1.8-1.8M14.9 7.1l1.8-1.8" /></svg>
        </button>
      </header>

      <div className="fm-hoy-toca">
        <p className="secundario">{sesionEnCurso ? 'Sesión en curso' : semana.bonus ? 'Bonus, ya van 3' : 'Hoy toca'}</p>
        <span className="cifra-heroe" aria-label={`Sesión ${sesionEnCurso?.tipo ?? toca}`}>{sesionEnCurso ? (sesionEnCurso.tipo === 'FRIDA' ? 'F' : sesionEnCurso.tipo) : toca}</span>
        <p className="secundario">{sesionEnCurso ? `Empezaste hace ${Math.max(1, Math.round((ahora.getTime() - sesionEnCurso.inicio) / 60000))} min.` : 'Cuerpo completo'}</p>
      </div>

      <Modulo className="fm-modulo-tiempo">
        {tiempo.estado === 'no' ? (
          <>
            <p className="titulo-fm">Hoy ya no. Descanso.</p>
            <p className="cuerpo">{textoManana(ahora, DIAS_NOMBRE)} Si entras de todas formas, va en corta.</p>
          </>
        ) : sinPrisa ? (
          <>
            <div><span className="cifra-grande">{tope.replace(/ (am|pm)$/, '')}</span><span className="unidad">{tope.endsWith('pm') ? 'pm' : 'am'}</span></div>
            <p className="cuerpo">Última pesa a las {tope}. Sin prisa.</p>
          </>
        ) : (
          <>
            <div><span className="cifra-grande">{tiempo.minutosParaTope}</span><span className="unidad">min</span></div>
            <p className="cuerpo">
              Tienes hasta las {tope}. {tiempo.estado === 'completa' ? 'Alcanza completa.' : 'No alcanza completa, te dejo lo esencial.'}
            </p>
          </>
        )}
      </Modulo>

      {rescate && <p className="cuerpo" style={{ color: 'var(--crema-2)' }}>{rescate}</p>}

      {proponerExtra && (
        <div className="fm-aviso-sup">
          <p className="cuerpo">Cuatro semanas cumplidas. A1, A2, B1 y B2 pasan de 3 a 4 series.</p>
          <div className="fm-fila">
            <BotonSecundario capsula onClick={() => datos.setSettings({ ...settings, seriesExtra: true })}>Aceptar</BotonSecundario>
            <BotonSecundario onClick={() => datos.setSettings({ ...settings, reglaPospuestaEn: cumplidas })}>Posponer</BotonSecundario>
          </div>
        </div>
      )}

      <div className="fm-filas">
        <div className="fm-fila-plana">
          <span className="etiqueta-fm">Esta semana</span>
          <span className="secundario">{semana.hechas} de {semana.meta}</span>
        </div>
        <div className="fm-dias" aria-label={`${semana.hechas} de ${semana.meta} sesiones`}>
          {semana.dias.map((d, i) => (
            <div key={d.fecha} className={`fm-dia ${d.tipos.length ? (d.tipos.includes('FRIDA') && d.tipos.length === 1 ? 'frida' : 'hecho') : ''} ${d.fecha === claveHoy ? 'hoy' : ''}`}>
              <span className="fm-dia-marca" />
              <span className="fm-dia-letra">{LETRAS[i]}</span>
            </div>
          ))}
        </div>
        <div className="fm-fila" style={{ marginTop: 8 }}>
          <BotonSecundario capsula onClick={marcarFrida}>{semana.fridaHecha ? 'Frida: hecha, quitar' : 'Lunes con Frida: hecho'}</BotonSecundario>
          <BotonSecundario onClick={() => setSalidaAbierta((v) => !v)}>Salgo de la oficina a las…</BotonSecundario>
        </div>
        {salidaAbierta && (
          <div className="fm-fila">
            <input type="time" value={salida} onChange={(e) => setSalida(e.target.value)} aria-label="Hora de salida" style={{ maxWidth: 160 }} />
            <span className="secundario">
              {siSalgo
                ? `Llegas ${formatoHora(siSalgo.llegadaMin)}. ${siSalgo.estado === 'completa' ? 'Alcanza completa.' : siSalgo.estado === 'corta' ? 'Alcanza la corta.' : 'Hoy ya no.'}`
                : `Suma ${settings.minCarretera} de carretera y ${settings.minCasaClub} de casa al club.`}
            </span>
          </div>
        )}
      </div>

      {vezPasada.length > 0 && !sesionEnCurso && (
        <div className="fm-filas">
          <span className="etiqueta-fm">La vez pasada</span>
          {vezPasada.map((f) => (
            <div key={f.nombre} className="fm-fila-plana">
              <span className="cuerpo">{f.nombre}</span>
              <span className="secundario">{f.dato}</span>
            </div>
          ))}
        </div>
      )}

      <div className="fm-pie fm-con-barra-pie">
        <BotonPrincipal onClick={sesionEnCurso ? onContinuar : () => onEmpezar(toca, version)}>{textoEmpezar}</BotonPrincipal>
      </div>
    </div>
  )
}
