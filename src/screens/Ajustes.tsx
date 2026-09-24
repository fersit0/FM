import { useRef } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Settings } from '../data/tipos'
import { useTemperatura } from '../hooks/useTemperatura'
import { armarRespaldo, leerRespaldo, blobABase64, base64ABlob } from '../logic/respaldo'
import { borrarTodo, guardarSesion, guardarSet, guardarPeso, guardarFoto } from '../data/db'
import { DIAS_NOMBRE, claveFecha } from '../logic/fechas'
import { CON_SERIE_EXTRA } from '../data/ejercicios'

export function Ajustes({ datos, onAviso }: { datos: Datos; onAviso: (t: string) => void }) {
  useTemperatura('reposo')
  const { settings } = datos
  const archivo = useRef<HTMLInputElement>(null)

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    datos.setSettings({ ...settings, [k]: v })
  }

  async function exportar() {
    const fotos = await Promise.all(datos.fotos.map(async (f) => ({ fecha: f.fecha, tipo: f.blob.type, base64: await blobABase64(f.blob) })))
    const r = armarRespaldo({ settings, sesiones: datos.sesiones, sets: datos.sets, peso: datos.peso, fotos })
    const texto = JSON.stringify(r)
    const nombre = `gym-respaldo-${claveFecha(new Date())}.json`
    const file = new File([texto], nombre, { type: 'application/json' })
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Respaldo gym' })
        return
      }
    } catch {
      /* canceló o no se pudo: cae a descarga */
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo importar.')
    }
  }

  return (
    <div className="pantalla">
      <h1 className="titulo">Ajustes</h1>

      <section className="modulo">
        <span className="etiqueta">Horario</span>
        <Campo etiqueta="Última pesa (tope duro)">
          <input type="time" value={settings.horaTope} onChange={(e) => set('horaTope', e.target.value)} />
        </Campo>
        <Campo etiqueta="Alcanza la completa hasta">
          <input type="time" value={settings.horaCompleta} onChange={(e) => set('horaCompleta', e.target.value)} />
        </Campo>
        <Campo etiqueta="Alcanza la corta hasta">
          <input type="time" value={settings.horaCorta} onChange={(e) => set('horaCorta', e.target.value)} />
        </Campo>
      </section>

      <section className="modulo">
        <span className="etiqueta">Salgo de la oficina a las</span>
        <Campo etiqueta="Minutos de carretera">
          <input inputMode="numeric" value={settings.minCarretera} onChange={(e) => set('minCarretera', Math.max(0, parseInt(e.target.value || '0', 10)))} className="numero" />
        </Campo>
        <Campo etiqueta="Minutos de casa al club">
          <input inputMode="numeric" value={settings.minCasaClub} onChange={(e) => set('minCasaClub', Math.max(0, parseInt(e.target.value || '0', 10)))} className="numero" />
        </Campo>
      </section>

      <section className="modulo">
        <span className="etiqueta">Peso corporal</span>
        <Campo etiqueta="Día de pesaje (en ayunas)">
          <select value={settings.diaPesaje} onChange={(e) => set('diaPesaje', parseInt(e.target.value, 10))}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{DIAS_NOMBRE[d]}</option>)}
          </select>
        </Campo>
      </section>

      <section className="modulo">
        <span className="etiqueta">Series</span>
        <Interruptor
          etiqueta={`4 series en ${CON_SERIE_EXTRA.join(', ')}`}
          detalle={settings.seriesExtra ? 'Activo. Regla de las 4 semanas aceptada.' : 'Se propone solo al acumular 4 semanas cumplidas.'}
          valor={settings.seriesExtra}
          onCambiar={(v) => set('seriesExtra', v)}
        />
      </section>

      <section className="modulo">
        <span className="etiqueta">Tema</span>
        <div className="fila">
          <button className={`boton boton-capsula ${settings.tema === 'oscuro' ? 'boton-secundario' : 'boton-marco'}`} onClick={() => set('tema', 'oscuro')}>Oscuro</button>
          <button className={`boton boton-capsula ${settings.tema === 'claro' ? 'boton-secundario' : 'boton-marco'}`} onClick={() => set('tema', 'claro')}>Claro en crema</button>
        </div>
      </section>

      <section className="modulo">
        <span className="etiqueta">Respaldo</span>
        <p className="texto-2">Todo vive en este teléfono. Exporta un JSON de vez en cuando; se puede importar en otro.</p>
        <div className="fila">
          <button className="boton boton-chico boton-secundario" onClick={exportar}>Exportar</button>
          <button className="boton boton-chico boton-marco" onClick={() => archivo.current?.click()}>Importar</button>
          <input ref={archivo} type="file" accept="application/json,.json" onChange={importar} className="oculto-visual" />
        </div>
      </section>
    </div>
  )
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="campo">
      <span className="texto-2">{etiqueta}</span>
      {children}
    </label>
  )
}

function Interruptor({ etiqueta, detalle, valor, onCambiar }: { etiqueta: string; detalle?: string; valor: boolean; onCambiar: (v: boolean) => void }) {
  return (
    <button className="interruptor" role="switch" aria-checked={valor} onClick={() => onCambiar(!valor)}>
      <span className="columna" style={{ gap: 2, textAlign: 'left' }}>
        <span>{etiqueta}</span>
        {detalle && <span className="texto-3" style={{ fontSize: 13 }}>{detalle}</span>}
      </span>
      <span className={`interruptor-pista ${valor ? 'on' : ''}`} aria-hidden="true"><span className="interruptor-bola" /></span>
    </button>
  )
}
