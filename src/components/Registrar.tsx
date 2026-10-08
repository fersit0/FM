import { useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, SesionTipo } from '../data/tipos'
import { armarRegistro } from '../logic/registro'
import { NOMBRE_SESION } from '../data/ejercicios'
import { claveFecha, DIAS_NOMBRE, desdeClave } from '../logic/fechas'
import { Hoja, Grupo, Fila, BotonTexto, BotonPrincipal } from './fm'

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

/** "Registrar sesión": fecha (hoy por defecto, nunca en el futuro) y tipo. Si ese día ya tiene una de club, ofrece cambiarla. */
export function RegistrarHoja({ datos, ahora, abierta, onCerrar, onGuardado }: { datos: Datos; ahora: Date; abierta: boolean; onCerrar: () => void; onGuardado: (sesion: Sesion, reemplazada: Sesion | null) => void }) {
  const hoy = claveFecha(ahora)
  const [fecha, setFecha] = useState(hoy)
  const [tipo, setTipo] = useState<SesionTipo>('A')
  const [nota, setNota] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState<{ sesion: Sesion; reemplaza: Sesion } | null>(null)
  function cerrar() { setAviso(null); setPendiente(null); onCerrar() }
  async function guardar(forzar = false) {
    if (!fecha) return
    const r = armarRegistro(datos.sesiones, fecha, tipo, hoy, tipo === 'FRIDA' ? nota : undefined)
    if ('error' in r) { setAviso(r.error); return }
    if (r.reemplaza && !forzar) {
      if (r.reemplaza.tipo === tipo) { setAviso(`Ese día ya tiene ${tipo === 'FRIDA' ? 'Frida' : tipo}.`); return }
      setPendiente({ sesion: r.sesion, reemplaza: r.reemplaza })
      setAviso(`El ${textoDia(fecha)} ya tiene ${r.reemplaza.tipo}. ¿La cambio a ${tipo}?`)
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
        <Fila texto="Qué hice">
          <select value={tipo} onChange={(e) => { setTipo(e.target.value as SesionTipo); setAviso(null); setPendiente(null) }} aria-label="Qué hice">
            <option value="A">A: {NOMBRE_SESION.A.toLowerCase()}</option>
            <option value="B">B: {NOMBRE_SESION.B.toLowerCase()}</option>
            <option value="C">C: {NOMBRE_SESION.C.toLowerCase()}</option>
            <option value="FRIDA">Fui con Frida</option>
            <option value="CASA">Casa</option>
          </select>
        </Fila>
        {tipo === 'FRIDA' && <Fila texto="Nota"><input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Opcional" aria-label="Nota" maxLength={80} style={{ width: 140, textAlign: 'right', borderBottom: '1px solid var(--separador)' }} /></Fila>}
      </Grupo>
      {aviso && <p className="t-cuerpo">{aviso}</p>}
      {pendiente ? <BotonPrincipal onClick={cambiar}>Cambiar a {tipo}</BotonPrincipal> : <BotonTexto onClick={() => guardar()}>Guardar</BotonTexto>}
    </Hoja>
  )
}
