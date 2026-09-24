import { useRef, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Settings } from '../data/tipos'
import { armarRespaldo, leerRespaldo, blobABase64, base64ABlob } from '../logic/respaldo'
import { borrarTodo, guardarSesion, guardarSet, guardarPeso, guardarFoto } from '../data/db'
import { DIAS_NOMBRE, claveFecha } from '../logic/fechas'
import { hapticosActivos, setHapticosActivos, haptico } from '../lib/haptics'
import { sonidoActivo, setSonidoActivo, prepararAudio, sonarFinDescanso } from '../lib/sonido'
import { PASOS_ATAJO, NOMBRE_ATAJO } from '../lib/atajos'
import { Hoja, Grupo, Fila } from '../components/fm'

/** 7.8 Ajustes en hoja: lista agrupada. */
export function Ajustes({ datos, abierta, onCerrar, onAviso }: { datos: Datos; abierta: boolean; onCerrar: () => void; onAviso: (t: string) => void }) {
  const { settings } = datos
  const archivo = useRef<HTMLInputElement>(null)
  const [hapticos, setHapticos] = useState(hapticosActivos)
  const [sonido, setSonido] = useState(sonidoActivo)
  const [atajo, setAtajo] = useState(false)

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    datos.setSettings({ ...settings, [k]: v })
  }

  async function exportar() {
    const fotos = await Promise.all(datos.fotos.map(async (f) => ({ fecha: f.fecha, tipo: f.blob.type, base64: await blobABase64(f.blob) })))
    const r = armarRespaldo({ settings, sesiones: datos.sesiones, sets: datos.sets, peso: datos.peso, fotos })
    const nombre = `gym-respaldo-${claveFecha(new Date())}.json`
    const file = new File([JSON.stringify(r)], nombre, { type: 'application/json' })
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Respaldo' })
        return
      }
    } catch {
      /* canceló */
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  async function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const r = leerRespaldo(await f.text())
      const resumen = `${r.sesiones.length} sesiones, ${r.sets.length} series, ${r.peso.length} pesajes, ${r.fotos.length} fotos`
      if (!confirm(`Importar reemplaza todo lo que hay en el teléfono.\n\nEl archivo trae: ${resumen}.\n\n¿Seguimos?`)) return
      await borrarTodo()
      for (const s of r.sesiones) await guardarSesion(s)
      for (const s of r.sets) await guardarSet(s)
      for (const p of r.peso) await guardarPeso(p)
      for (const foto of r.fotos) await guardarFoto({ fecha: foto.fecha, blob: base64ABlob(foto.base64, foto.tipo) })
      datos.setSettings(r.settings)
      await datos.recargar()
      onAviso('Respaldo importado')
      onCerrar()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo importar.')
    }
  }

  return (
    <Hoja abierta={abierta} altura="completa" titulo="Ajustes" onCerrar={onCerrar}>
      <Grupo titulo="Horario">
        <Fila texto="Salgo de la oficina a las" detalle={settings.horaSalida ? `Suma ${settings.minCarretera} de carretera y ${settings.minCasaClub} de casa al club` : 'Vacío: se usa la hora actual'}>
          <input type="time" value={settings.horaSalida ?? ''} onChange={(e) => set('horaSalida', e.target.value || undefined)} aria-label="Hora de salida" />
        </Fila>
        <Fila texto="Última pesa"><input type="time" value={settings.horaTope} onChange={(e) => set('horaTope', e.target.value)} aria-label="Última pesa" /></Fila>
        <Fila texto="Completa hasta"><input type="time" value={settings.horaCompleta} onChange={(e) => set('horaCompleta', e.target.value)} aria-label="Completa hasta" /></Fila>
        <Fila texto="Corta hasta"><input type="time" value={settings.horaCorta} onChange={(e) => set('horaCorta', e.target.value)} aria-label="Corta hasta" /></Fila>
        <Fila texto="Minutos de carretera"><input inputMode="numeric" value={settings.minCarretera} onChange={(e) => set('minCarretera', Math.max(0, parseInt(e.target.value || '0', 10)))} aria-label="Minutos de carretera" style={{ width: 60 }} /></Fila>
        <Fila texto="Minutos de casa al club"><input inputMode="numeric" value={settings.minCasaClub} onChange={(e) => set('minCasaClub', Math.max(0, parseInt(e.target.value || '0', 10)))} aria-label="Minutos de casa al club" style={{ width: 60 }} /></Fila>
      </Grupo>

      <Grupo titulo="Sesión">
        <Fila texto="4 series en A1, A2, B1 y B2" detalle={settings.seriesExtra ? 'Regla de las 4 semanas aceptada' : 'Se propone al acumular 4 semanas cumplidas'}>
          <Interruptor valor={settings.seriesExtra} onCambiar={(v) => set('seriesExtra', v)} etiqueta="4 series" />
        </Fila>
        <Fila texto="Día de pesaje">
          <select value={settings.diaPesaje} onChange={(e) => set('diaPesaje', parseInt(e.target.value, 10))} aria-label="Día de pesaje">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{DIAS_NOMBRE[d]}</option>)}
          </select>
        </Fila>
      </Grupo>

      <Grupo titulo="Avisos">
        <Fila texto="Sonido" detalle="Dos notas al terminar el descanso, si la app está abierta">
          <Interruptor valor={sonido} onCambiar={(v) => { setSonidoActivo(v); setSonido(v); if (v) { prepararAudio(); sonarFinDescanso() } }} etiqueta="Sonido" />
        </Fila>
        <Fila texto="Hápticos" detalle="Tick del dial, serie hecha, fin de descanso y de sesión">
          <Interruptor valor={hapticos} onCambiar={(v) => { setHapticosActivos(v); setHapticos(v); if (v) haptico.serieHecha() }} etiqueta="Hápticos" />
        </Fila>
        <Fila texto="Aviso de descanso con Atajos" detalle="Para que suene aunque estés en otra app" dato={atajo ? 'Ocultar' : 'Cómo'} onClick={() => setAtajo((v) => !v)} />
        {atajo && PASOS_ATAJO.map((p, i) => <Fila key={i} num={i + 1} texto={<span style={{ whiteSpace: 'normal' }}>{p}</span>} />)}
        {atajo && <Fila texto={`El atajo se llama "${NOMBRE_ATAJO}". Si no abre, revisa que el nombre sea exacto.`} />}
      </Grupo>

      <Grupo titulo="Respaldo">
        <Fila texto="Exportar respaldo" detalle="Un JSON con todo; se comparte o descarga" onClick={exportar} />
        <Fila texto="Importar respaldo" detalle="Reemplaza lo que hay en este teléfono" onClick={() => archivo.current?.click()} />
        <input ref={archivo} type="file" accept="application/json,.json" onChange={importar} className="oculto-visual" />
      </Grupo>

      <Grupo>
        <Fila texto="Versión" dato={__VERSION__} />
      </Grupo>
    </Hoja>
  )
}

function Interruptor({ valor, onCambiar, etiqueta }: { valor: boolean; onCambiar: (v: boolean) => void; etiqueta: string }) {
  return (
    <button className="fm-switch" role="switch" aria-checked={valor} aria-label={etiqueta} onClick={() => onCambiar(!valor)}>
      <span className={`fm-switch-pista ${valor ? 'on' : ''}`}><span className="fm-switch-bola" /></span>
    </button>
  )
}
