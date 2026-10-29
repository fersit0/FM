import { useEffect, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, SesionTipo, FridaTipo, Momento } from '../data/tipos'
import { armarRegistro, momentoPorDefecto } from '../logic/registro'
import { NOMBRE_SESION } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, desdeClave } from '../logic/fechas'
import { Hoja, Grupo, Fila, BotonPrincipal } from './fm'

export type Respuesta = 'A' | 'B' | 'C' | 'FRIDA' | 'no'
const ETIQUETA: Record<Respuesta, string> = { A: 'A', B: 'B', C: 'C', FRIDA: 'Frida', no: 'No fui' }

/** Los botones de un día: A, B, C, Frida y No fui, con el marcado relleno. Un toque y listo. */
export function BotonesDia({ marcado, onElegir, sinNo = false }: { marcado: Respuesta | null; onElegir: (r: Respuesta) => void; sinNo?: boolean }) {
  return (
    <div className="dia-botones" role="group">
      {(['A', 'B', 'C', 'FRIDA', 'no'] as Respuesta[]).filter((r) => !(sinNo && r === 'no')).map((r) => (
        <button key={r} className={`dia-boton ${marcado === r ? 'marcado' : ''}`} aria-pressed={marcado === r} onClick={() => onElegir(r)}>{ETIQUETA[r]}</button>
      ))}
    </div>
  )
}

export function textoDia(fecha: string): string {
  const d = desdeClave(fecha)
  return `${DIAS_NOMBRE[d.getDay()]} ${d.getDate()}`
}

/** Lo que se elige en "Qué hice": la sesión, y para Frida, pierna o torso (RUTINA-FINAL.md v7, 2.5) */
type Eleccion = Exclude<SesionTipo, 'FRIDA'> | 'FRIDA:pierna' | 'FRIDA:torso'
const tipoDe = (e: Eleccion): SesionTipo => (e.startsWith('FRIDA') ? 'FRIDA' : (e as SesionTipo))
const fridaDe = (e: Eleccion): FridaTipo | undefined => (e === 'FRIDA:pierna' ? 'pierna' : e === 'FRIDA:torso' ? 'torso' : undefined)
const NOMBRE_ELECCION = (e: Eleccion) => (e === 'FRIDA:pierna' ? 'Frida pierna' : e === 'FRIDA:torso' ? 'Frida torso' : e === 'CASA' ? 'casa' : e)

/**
 * "Registrar sesión": fecha (hoy por defecto, nunca en el futuro), mañana o noche, y qué fue. Si ese día ya tiene una de
 * club, ofrece cambiarla. `fecha` abre la hoja en ese día (al tocar un día de Tu semana).
 */
export function RegistrarHoja({ datos, ahora, abierta, onCerrar, onGuardado, fecha: fechaInicial }: { datos: Datos; ahora: Date; abierta: boolean; onCerrar: () => void; onGuardado: (sesion: Sesion, reemplazada: Sesion | null) => void; fecha?: string }) {
  const hoy = claveFecha(ahora)
  const [fecha, setFecha] = useState(fechaInicial ?? hoy)
  const [eleccion, setEleccion] = useState<Eleccion>('A')
  const tipo = tipoDe(eleccion)
  // por defecto Frida en la noche y las de club en la mañana; se puede cambiar con un toque
  const [momentoElegido, setMomento] = useState<Momento | null>(null)
  const momento = momentoElegido ?? momentoPorDefecto(fecha, datos.settings.fridaPlan, tipo)
  useEffect(() => { if (abierta) { setFecha(fechaInicial ?? hoy); setMomento(null) } }, [abierta, fechaInicial, hoy])
  const [nota, setNota] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState<{ sesion: Sesion; reemplaza: Sesion } | null>(null)
  function cerrar() { setAviso(null); setPendiente(null); onCerrar() }
  async function guardar(forzar = false) {
    if (!fecha) return
    const r = armarRegistro(datos.sesiones, fecha, tipo, hoy, tipo === 'FRIDA' ? nota : undefined, { fridaTipo: fridaDe(eleccion), momento })
    if ('error' in r) { setAviso(r.error); return }
    if (r.reemplaza && !forzar) {
      if (r.reemplaza.tipo === tipo && (tipo !== 'FRIDA' || r.reemplaza.fridaTipo === r.sesion.fridaTipo)) { setAviso(`Ese día ya tiene ${NOMBRE_ELECCION(eleccion)}.`); return }
      setPendiente({ sesion: r.sesion, reemplaza: r.reemplaza })
      setAviso(`El ${textoDia(fecha)} ya tiene ${r.reemplaza.tipo === 'FRIDA' ? 'Frida' : r.reemplaza.tipo}. ¿La cambio a ${NOMBRE_ELECCION(eleccion)}?`)
      return
    }
    await datos.guardarSesion(r.sesion)
    onGuardado(r.sesion, r.reemplaza)
    setNota('')
    cerrar()
  }
  async function cambiar() {
    if (!pendiente) return
    await datos.guardarSesion(pendiente.sesion)
    onGuardado(pendiente.sesion, pendiente.reemplaza)
    cerrar()
  }
  return (
    <Hoja abierta={abierta} titulo="Registrar sesión" onCerrar={cerrar}>
      <p className="t-cuerpo tenue">Una sesión hecha sin la app. Se puede editar o borrar en Historial.</p>
      <Grupo>
        <Fila texto="Fecha"><input type="date" value={fecha} max={hoy} onChange={(e) => { setFecha(e.target.value); setAviso(null); setPendiente(null) }} aria-label="Fecha" /></Fila>
        <Fila texto="Cuándo">
          <div className="dia-botones" role="group" aria-label="Cuándo">
            {(['manana', 'noche'] as Momento[]).map((m) => <button key={m} className={`dia-boton ${momento === m ? 'marcado' : ''}`} aria-pressed={momento === m} onClick={() => setMomento(m)}>{m === 'manana' ? 'Mañana' : 'Noche'}</button>)}
          </div>
        </Fila>
        <Fila texto="Qué hice">
          <select value={eleccion} onChange={(e) => { setEleccion(e.target.value as Eleccion); setAviso(null); setPendiente(null) }} aria-label="Qué hice">
            <option value="A">A: {NOMBRE_SESION.A.toLowerCase()}</option>
            <option value="B">B: {NOMBRE_SESION.B.toLowerCase()}</option>
            <option value="C">C: {NOMBRE_SESION.C.toLowerCase()}</option>
            <option value="FRIDA:pierna">Frida pierna</option>
            <option value="FRIDA:torso">Frida torso</option>
            <option value="CASA">Casa</option>
          </select>
        </Fila>
        {tipo === 'FRIDA' && <Fila texto="Nota"><input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Opcional" aria-label="Nota" maxLength={80} style={{ width: 140, textAlign: 'right', borderBottom: '1px solid var(--separador)' }} /></Fila>}
      </Grupo>
      {aviso && <p className="t-cuerpo">{aviso}</p>}
      {pendiente ? <BotonPrincipal onClick={cambiar}>Cambiar a {NOMBRE_ELECCION(eleccion)}</BotonPrincipal> : <BotonPrincipal onClick={() => guardar()}>Guardar</BotonPrincipal>}
    </Hoja>
  )
}
