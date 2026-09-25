import { useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion } from '../data/tipos'
import { usePantalla } from '../design/pantallaActiva'
import { semanasHistorial, tocaPesarse, tocaFoto, type SemanaHistorial } from '../logic/progreso'
import { claveFecha, fechaCorta, DIAS_NOMBRE, desdeClave, sumarDias, inicioSemana } from '../logic/fechas'
import { ejerciciosDe } from '../data/ejercicios'
import { Grupo, Fila, Hoja, BotonTexto, Pez } from '../components/fm'
import { SerieEditable } from './Sesion'
import { Linea } from '../components/Linea'
import { haptico } from '../lib/haptics'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** 7.3 Historial: cifra grande del mes, semanas con puntos, sesiones y series. */
export function Historial({ datos, ahora }: { datos: Datos; ahora: Date }) {
  usePantalla('tinta')
  const semanas = useMemo(() => semanasHistorial(datos.sesiones, ahora, 12).reverse(), [datos.sesiones, ahora])
  const delMes = datos.sesiones.filter((s) => s.terminada && new Date(s.inicio).getMonth() === ahora.getMonth() && new Date(s.inicio).getFullYear() === ahora.getFullYear()).length
  const [semana, setSemana] = useState<SemanaHistorial | null>(null)
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [peso, setPeso] = useState(false)
  const [fotos, setFotos] = useState(false)
  const [agregar, setAgregar] = useState(false)
  const [fechaNueva, setFechaNueva] = useState(() => claveFecha(ahora))
  const [tipoNuevo, setTipoNuevo] = useState<'A' | 'B' | 'FRIDA'>('A')
  const hayAlgo = datos.sesiones.some((s) => s.terminada)
  return (
    <div className="pantalla con-barra">
      <h1 className="t-titulo">Historial</h1>
      {!hayAlgo ? (
        <div className="vacio">
          <Pez expresion="dormido" tamano={120} style={{ position: 'static' }} />
          <p className="t-sub tenue">Todavía no hay señal. La primera sesión la enciende.</p>
        </div>
      ) : (
        <>
          <div className="historial-cifra">
            <span className="t-listo num">{delMes}</span>
            <span className="t-sub tenue">{delMes === 1 ? 'sesión' : 'sesiones'} en {MESES[ahora.getMonth()]}</span>
          </div>
          <Grupo>
            {semanas.map((w) => {
              const ini = desdeClave(w.inicio)
              const dias = Array.from({ length: 7 }, (_, i) => claveFecha(sumarDias(ini, i)))
              return (
                <Fila key={w.inicio} texto={`${ini.getDate()} al ${fechaCorta(claveFecha(sumarDias(ini, 6)))}`} onClick={() => setSemana(w)}>
                  <span className="puntos" aria-label={`${w.sesiones.length} de 3`}>{dias.map((d) => <i key={d} className={`punto ${w.sesiones.some((s) => s.fecha === d) ? 'hecho' : ''}`} />)}</span>
                </Fila>
              )
            })}
          </Grupo>
        </>
      )}
      <Grupo titulo="Se me olvidó registrar">
        <Fila texto="Fui este día" detalle="Agrega una sesión con fecha y qué hiciste" onClick={() => setAgregar(true)} />
      </Grupo>
      <Grupo titulo="Cuerpo">
        <Fila texto="Peso corporal" dato={datos.peso.length ? `${datos.peso[datos.peso.length - 1].kg} kg` : 'Sin registro'} onClick={() => setPeso(true)} />
        <Fila texto="Fotos" dato={datos.fotos.length ? `${datos.fotos.length}` : 'Ninguna'} onClick={() => setFotos(true)} />
      </Grupo>

      <Hoja abierta={semana !== null} titulo={semana ? `Semana del ${fechaCorta(semana.inicio)}` : ''} onCerrar={() => setSemana(null)}>
        {semana && (semana.sesiones.length === 0 ? <p className="t-cuerpo tenue">Sin sesiones esa semana.</p> : (
          <Grupo>
            {semana.sesiones.map((s) => (
              <Fila key={s.id} texto={`${DIAS_NOMBRE[desdeClave(s.fecha).getDay()]} ${desdeClave(s.fecha).getDate()}, ${s.tipo === 'FRIDA' ? 'lunes con Frida' : `${s.tipo} ${s.ligera ? 'ligera' : s.version}`}`} dato={s.fin ? `${Math.max(1, Math.round((s.fin - s.inicio) / 60000))} min` : ''} onClick={s.tipo === 'FRIDA' ? undefined : () => setSesion(s)} />
            ))}
          </Grupo>
        ))}
      </Hoja>
      <Hoja abierta={sesion !== null} altura="completa" titulo={sesion ? `${sesion.tipo}, ${fechaCorta(sesion.fecha)}` : ''} onCerrar={() => setSesion(null)}>
        {sesion && <DetalleSesion datos={datos} sesion={sesion} onBorrada={() => { setSesion(null); setSemana(null) }} />}
      </Hoja>
      <Hoja abierta={agregar} titulo="Fui este día" onCerrar={() => setAgregar(false)}>
        <Grupo>
          <Fila texto="Fecha"><input type="date" value={fechaNueva} max={claveFecha(ahora)} onChange={(e) => setFechaNueva(e.target.value)} aria-label="Fecha" /></Fila>
          <Fila texto="Qué hice">
            <select value={tipoNuevo} onChange={(e) => setTipoNuevo(e.target.value as 'A' | 'B' | 'FRIDA')} aria-label="Qué hice">
              <option value="A">Cuerpo completo A</option>
              <option value="B">Cuerpo completo B</option>
              <option value="FRIDA">Lunes con Frida</option>
            </select>
          </Fila>
        </Grupo>
        <BotonTexto onClick={async () => {
          if (!fechaNueva) return
          const inicio = new Date(fechaNueva + 'T19:30:00').getTime()
          await datos.guardarSesion({ id: `manual-${fechaNueva}-${tipoNuevo}-${inicio}`, fecha: fechaNueva, tipo: tipoNuevo, version: 'completa', inicio, fin: inicio + 60 * 60000, terminada: true, cambios: [] })
          setAgregar(false)
        }}>Guardar</BotonTexto>
      </Hoja>
      <PesoHoja datos={datos} ahora={ahora} abierta={peso} onCerrar={() => setPeso(false)} />
      <FotosHoja datos={datos} ahora={ahora} abierta={fotos} onCerrar={() => setFotos(false)} />
    </div>
  )
}

function DetalleSesion({ datos, sesion, onBorrada }: { datos: Datos; sesion: Sesion; onBorrada: () => void }) {
  const propios = datos.sets.filter((s) => s.sessionId === sesion.id)
  const orden = ejerciciosDe(sesion.tipo as 'A' | 'B').map((e) => e.id)
  const ordenados = [...propios].sort((a, b) => orden.indexOf(a.exerciseId.split('-')[0]) - orden.indexOf(b.exerciseId.split('-')[0]) || a.numSerie - b.numSerie)
  return (
    <>
      {ordenados.length === 0 ? <p className="t-cuerpo tenue">Sin series registradas. Toca los valores para editar.</p> : (
        <Grupo>{ordenados.map((s) => <SerieEditable key={s.id} set={s} datos={datos} />)}</Grupo>
      )}
      <BotonTexto onClick={async () => { if (!confirm('¿Borrar esta sesión y sus series?')) return; await datos.borrarSesion(sesion.id); onBorrada() }}>Borrar sesión</BotonTexto>
    </>
  )
}

function PesoHoja({ datos, ahora, abierta, onCerrar }: { datos: Datos; ahora: Date; abierta: boolean; onCerrar: () => void }) {
  const [kg, setKg] = useState('')
  const toca = tocaPesarse(datos.peso, ahora, datos.settings.diaPesaje)
  const ultimo = datos.peso[datos.peso.length - 1]
  const estaSemana = ultimo && ultimo.fecha >= claveFecha(inicioSemana(ahora))
  async function guardar() {
    const v = parseFloat(kg.replace(',', '.'))
    if (Number.isNaN(v) || v <= 0) return
    await datos.guardarPeso({ fecha: claveFecha(ahora), kg: Math.round(v * 10) / 10 })
    haptico.serieHecha()
    setKg('')
  }
  return (
    <Hoja abierta={abierta} altura="completa" titulo="Peso corporal" onCerrar={onCerrar}>
      <p className="t-cuerpo tenue">{toca ? 'Hoy toca pesarte, en ayunas.' : estaSemana ? 'Ya te pesaste esta semana.' : `Cada ${DIAS_NOMBRE[datos.settings.diaPesaje]}, en ayunas.`}</p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <input inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} aria-label="Peso corporal en kilos" className="t-cifra" style={{ width: 140, textAlign: 'left', borderBottom: '2px solid var(--separador)' }} />
        <BotonTexto onClick={guardar}>Guardar</BotonTexto>
      </div>
      {datos.peso.length > 0 && <Linea puntos={datos.peso.slice(-12).map((p) => ({ etiqueta: fechaCorta(p.fecha), valor: p.kg }))} />}
      {datos.peso.length > 0 && <Grupo>{[...datos.peso].reverse().slice(0, 8).map((p) => <Fila key={p.fecha} texto={fechaCorta(p.fecha)} dato={`${p.kg} kg`} onClick={() => confirm(`¿Borrar el peso del ${fechaCorta(p.fecha)}?`) && datos.borrarPeso(p.fecha)} />)}</Grupo>}
    </Hoja>
  )
}

function FotosHoja({ datos, ahora, abierta, onCerrar }: { datos: Datos; ahora: Date; abierta: boolean; onCerrar: () => void }) {
  const { toca, dias } = tocaFoto(datos.fotos, ahora)
  const [urls, setUrls] = useState<Record<string, string>>({})
  useEffect(() => {
    const nuevas: Record<string, string> = {}
    for (const f of datos.fotos) nuevas[f.fecha] = URL.createObjectURL(f.blob)
    setUrls(nuevas)
    return () => { for (const u of Object.values(nuevas)) URL.revokeObjectURL(u) }
  }, [datos.fotos])
  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    await datos.guardarFoto({ fecha: claveFecha(ahora), blob: f })
    haptico.serieHecha()
    e.target.value = ''
  }
  return (
    <Hoja abierta={abierta} altura="completa" titulo="Fotos" onCerrar={onCerrar}>
      <p className="t-cuerpo tenue">{toca ? 'Toca foto. Misma ropa, de frente.' : `Siguiente en ${14 - (dias ?? 0)} días. Misma ropa, de frente.`}</p>
      <label className="secundario" style={{ alignSelf: 'flex-start' }}>Tomar o elegir foto<input type="file" accept="image/*" onChange={subir} className="oculto-visual" /></label>
      {datos.fotos.length > 0 && (
        <div className="fotos-grid">
          {[...datos.fotos].reverse().map((f) => (
            <figure key={f.fecha}>
              {urls[f.fecha] && <img src={urls[f.fecha]} alt={`Foto del ${f.fecha}`} />}
              <figcaption><span className="t-nota tenue">{fechaCorta(f.fecha)}</span><BotonTexto onClick={() => confirm('¿Borrar esta foto?') && datos.borrarFoto(f.fecha)}>Borrar</BotonTexto></figcaption>
            </figure>
          ))}
        </div>
      )}
    </Hoja>
  )
}
