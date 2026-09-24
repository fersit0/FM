import { useRef, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Settings } from '../data/tipos'
import { armarRespaldo, leerRespaldo, blobABase64, base64ABlob } from '../logic/respaldo'
import { borrarTodo, guardarSesion, guardarSet, guardarPeso, guardarFoto } from '../data/db'
import { DIAS_NOMBRE, claveFecha } from '../logic/fechas'
import { CON_SERIE_EXTRA } from '../data/ejercicios'
import { hapticosActivos, setHapticosActivos, haptico } from '../lib/haptics'
import { sonidoActivo, setSonidoActivo, prepararAudio, sonarFinDescanso } from '../lib/sonido'
import { Hoja, BotonSecundario } from '../components/fm'

/** Ajustes: en hoja (7.9). Horas tope, minutos, día de pesaje, series, hápticos, sonido, respaldo. */
export function Ajustes({ datos, abierta, onCerrar, onAviso }: { datos: Datos; abierta: boolean; onCerrar: () => void; onAviso: (t: string) => void }) {
  const { settings } = datos
  const archivo = useRef<HTMLInputElement>(null)
  const [hapticos, setHapticos] = useState(hapticosActivos)
  const [sonido, setSonido] = useState(sonidoActivo)

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
      /* canceló: cae a descarga */
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
    <Hoja abierta={abierta} titulo="Ajustes" onCerrar={onCerrar}>
      <p className="etiqueta-fm">Horario</p>
      <Campo etiqueta="Última pesa"><input type="time" value={settings.horaTope} onChange={(e) => set('horaTope', e.target.value)} /></Campo>
      <Campo etiqueta="Alcanza la completa hasta"><input type="time" value={settings.horaCompleta} onChange={(e) => set('horaCompleta', e.target.value)} /></Campo>
      <Campo etiqueta="Alcanza la corta hasta"><input type="time" value={settings.horaCorta} onChange={(e) => set('horaCorta', e.target.value)} /></Campo>

      <p className="etiqueta-fm" style={{ marginTop: 8 }}>Salgo de la oficina a las</p>
      <Campo etiqueta="Minutos de carretera"><input inputMode="numeric" value={settings.minCarretera} onChange={(e) => set('minCarretera', Math.max(0, parseInt(e.target.value || '0', 10)))} /></Campo>
      <Campo etiqueta="Minutos de casa al club"><input inputMode="numeric" value={settings.minCasaClub} onChange={(e) => set('minCasaClub', Math.max(0, parseInt(e.target.value || '0', 10)))} /></Campo>

      <p className="etiqueta-fm" style={{ marginTop: 8 }}>Peso corporal</p>
      <Campo etiqueta="Día de pesaje, en ayunas">
        <select value={settings.diaPesaje} onChange={(e) => set('diaPesaje', parseInt(e.target.value, 10))}>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{DIAS_NOMBRE[d]}</option>)}
        </select>
      </Campo>

      <p className="etiqueta-fm" style={{ marginTop: 8 }}>Sesión</p>
      <Interruptor etiqueta={`4 series en ${CON_SERIE_EXTRA.join(', ')}`} detalle={settings.seriesExtra ? 'Regla de las 4 semanas aceptada.' : 'Se propone al acumular 4 semanas cumplidas.'} valor={settings.seriesExtra} onCambiar={(v) => set('seriesExtra', v)} />
      <Interruptor etiqueta="Hápticos" detalle="Un tap al guardar una serie y al cruzar marcas del dial." valor={hapticos} onCambiar={(v) => { setHapticosActivos(v); setHapticos(v); if (v) haptico.serieHecha() }} />
      <Interruptor etiqueta="Sonido" detalle="Dos notas al terminar el descanso, un clic al guardar." valor={sonido} onCambiar={(v) => { setSonidoActivo(v); setSonido(v); if (v) { prepararAudio(); sonarFinDescanso() } }} />

      <p className="etiqueta-fm" style={{ marginTop: 8 }}>Respaldo</p>
      <p className="cuerpo">Todo vive en este teléfono. Exporta un JSON de vez en cuando; se puede importar en otro.</p>
      <div className="fm-fila">
        <BotonSecundario capsula onClick={exportar}>Exportar</BotonSecundario>
        <BotonSecundario capsula onClick={() => archivo.current?.click()}>Importar</BotonSecundario>
        <input ref={archivo} type="file" accept="application/json,.json" onChange={importar} className="oculto-visual" />
      </div>
    </Hoja>
  )
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="fm-campo">
      <span className="secundario">{etiqueta}</span>
      {children}
    </label>
  )
}

function Interruptor({ etiqueta, detalle, valor, onCambiar }: { etiqueta: string; detalle?: string; valor: boolean; onCambiar: (v: boolean) => void }) {
  return (
    <button className="fm-interruptor" role="switch" aria-checked={valor} onClick={() => onCambiar(!valor)}>
      <span className="fm-columna" style={{ gap: 2 }}>
        <span className="cuerpo">{etiqueta}</span>
        {detalle && <span className="secundario">{detalle}</span>}
      </span>
      <span className={`fm-interruptor-pista ${valor ? 'on' : ''}`} aria-hidden="true"><span className="fm-interruptor-bola" /></span>
    </button>
  )
}
