import { useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import { usePantalla } from '../design/pantallaActiva'
import { BotonPrincipal, BotonTexto } from '../components/fm'
import { migrarSet, migrarSesion, migrarFoto, migrarSettings } from '../logic/migracion'
import { guardarSet, guardarSesion, guardarFotoEjercicio } from '../data/db'
import { armarRespaldo, blobABase64 } from '../logic/respaldo'
import { claveFecha } from '../logic/fechas'

/** Migración única de ids viejos (RUTINA-FINAL.md, 9): ofrece respaldo y luego migra sin perder historial. */
export function Migracion({ datos }: { datos: Datos }) {
  usePantalla('tinta')
  const [corriendo, setCorriendo] = useState(false)
  async function respaldo() {
    const fotos = await Promise.all(datos.fotos.map(async (f) => ({ fecha: f.fecha, tipo: f.blob.type, base64: await blobABase64(f.blob) })))
    const r = armarRespaldo({ settings: datos.settings, sesiones: datos.sesiones, sets: datos.sets, peso: datos.peso, fotos })
    const file = new File([JSON.stringify(r)], `gym-respaldo-${claveFecha(new Date())}.json`, { type: 'application/json' })
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Respaldo' }); return }
    } catch { /* canceló */ }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  async function migrar() {
    setCorriendo(true)
    const d = new Set<string>()
    for (const s of datos.sets) await guardarSet(migrarSet(s, d))
    for (const s of datos.sesiones) await guardarSesion(migrarSesion(s, d))
    for (const f of datos.fotosEjercicio) {
      const m = migrarFoto(f, d)
      if (m.ejercicioId !== f.ejercicioId) { await guardarFotoEjercicio(m); const { borrarFotoEjercicio } = await import('../data/db'); await borrarFotoEjercicio(f.ejercicioId) }
    }
    datos.setSettings({ ...migrarSettings(datos.settings, d), idsDesconocidos: [...d] })
    await datos.recargar()
  }
  return (
    <div className="pantalla">
      <div className="columna" style={{ marginTop: 'auto', gap: 8 }}>
        <h1 className="t-titulo">Rutina nueva.</h1>
        <p className="t-sub tenue">Tus series se pasan a los ejercicios nuevos sin perder nada. Si quieres, descarga un respaldo antes.</p>
      </div>
      <div className="pie">
        <div style={{ display: 'flex', justifyContent: 'center' }}><BotonTexto onClick={respaldo}>Descargar respaldo</BotonTexto></div>
        <BotonPrincipal onClick={migrar} disabled={corriendo}>{corriendo ? 'Migrando…' : 'Migrar ahora'}</BotonPrincipal>
      </div>
    </div>
  )
}
