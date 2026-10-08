import { useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion, SesionTipo } from '../data/tipos'
import { usePantalla } from '../design/pantallaActiva'
import { semanasHistorial, tocaPesarse, tocaFoto, promedioSemanal, type SemanaHistorial } from '../logic/progreso'
import { claveFecha, fechaCorta, DIAS_NOMBRE, desdeClave, sumarDias, inicioSemana } from '../logic/fechas'
import { Grupo, Fila, Hoja, BotonTexto, Pez, Deshacer } from '../components/fm'
import { RegistrarHoja, textoDia } from '../components/Registrar'
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
  const [cinturaAbierta, setCinturaAbierta] = useState(false)
  const [agregar, setAgregar] = useState(false)
  const [accion, setAccion] = useState<{ texto: string; deshacer: () => void | Promise<void> } | null>(null)
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
        <Fila texto="Registrar sesión" detalle="Una sesión hecha sin la app, con fecha y qué hiciste" onClick={() => setAgregar(true)} />
      </Grupo>
      <Grupo titulo="Cuerpo">
        <Fila texto="Peso corporal" dato={datos.peso.length ? `${datos.peso[datos.peso.length - 1].kg} kg` : 'Sin registro'} onClick={() => setPeso(true)} />
        <Fila texto="Cintura" detalle="Cada lunes, en cm" dato={datos.cintura.length ? `${datos.cintura[datos.cintura.length - 1].cm} cm` : 'Sin registro'} onClick={() => setCinturaAbierta(true)} />
        <Fila texto="Fotos" dato={datos.fotos.length ? `${datos.fotos.length}` : 'Ninguna'} onClick={() => setFotos(true)} />
      </Grupo>

      <Hoja abierta={semana !== null} titulo={semana ? `Semana del ${fechaCorta(semana.inicio)}` : ''} onCerrar={() => setSemana(null)}>
        {semana && (semana.sesiones.length === 0 ? <p className="t-cuerpo tenue">Sin sesiones esa semana.</p> : (
          <Grupo>
            {semana.sesiones.map((s) => (
              <Fila key={s.id} texto={`${textoDia(s.fecha)}, ${etiquetaDe(s)}`} dato={s.origen === 'registro' || s.como === 'registrada' ? 'registrada' : s.fin ? `${Math.max(1, Math.round((s.fin - s.inicio) / 60000))} min` : ''} onClick={() => setSesion(s)} />
            ))}
          </Grupo>
        ))}
      </Hoja>
      <Hoja abierta={sesion !== null} altura="completa" titulo={sesion ? `${sesion.tipo === 'FRIDA' ? 'Frida' : sesion.tipo}, ${fechaCorta(sesion.fecha)}` : ''} onCerrar={() => setSesion(null)}>
        {sesion && <DetalleSesion datos={datos} sesion={datos.sesiones.find((s) => s.id === sesion.id) ?? sesion} onBorrada={() => { setSesion(null); setSemana(null) }} />}
      </Hoja>
      <RegistrarHoja datos={datos} ahora={ahora} abierta={agregar} onCerrar={() => setAgregar(false)} onGuardado={(s, reemplazada) => setAccion({ texto: `${textoDia(s.fecha)}: ${etiquetaDe(s)} registrada.`, deshacer: async () => { if (reemplazada) await datos.guardarSesion(reemplazada); else await datos.borrarSesion(s.id) } })} />
      {accion && <Deshacer texto={accion.texto} onDeshacer={async () => { const a = accion; setAccion(null); await a.deshacer() }} onCerrar={() => setAccion(null)} />}
      <PesoHoja datos={datos} ahora={ahora} abierta={peso} onCerrar={() => setPeso(false)} />
      <FotosHoja datos={datos} ahora={ahora} abierta={fotos} onCerrar={() => setFotos(false)} />
      <CinturaHoja datos={datos} ahora={ahora} abierta={cinturaAbierta} onCerrar={() => setCinturaAbierta(false)} />
    </div>
  )
}

/** "A completa", "B corta", "A parcial", "A registrada", "Frida", "casa" */
function etiquetaDe(s: Sesion): string {
  if (s.tipo === 'FRIDA') return 'Frida'
  if (s.tipo === 'CASA') return 'casa'
  return `${s.tipo} ${s.ligera ? 'ligera' : s.como ?? (s.origen === 'registro' ? 'registrada' : s.version)}`
}

function DetalleSesion({ datos, sesion, onBorrada }: { datos: Datos; sesion: Sesion; onBorrada: () => void }) {
  const propios = datos.sets.filter((s) => s.sessionId === sesion.id)
  const ordenados = [...propios].sort((a, b) => a.hora - b.hora)
  const como = sesion.como === 'registrada' || sesion.origen === 'registro' ? 'Registrada sin la app' : sesion.como === 'parcial' ? 'Parcial: se cerró con pocas series' : sesion.como === 'corta' ? 'Corta' : sesion.como === 'completa' ? 'Completa' : sesion.terminada ? 'Hecha con la app' : 'Abierta'
  return (
    <>
      <Grupo>
        <Fila texto="Qué hice" detalle={como}>
          <select value={sesion.tipo} onChange={(e) => datos.guardarSesion({ ...sesion, tipo: e.target.value as SesionTipo })} aria-label="Qué hice">
            <option value="A">A</option><option value="B">B</option><option value="FRIDA">Frida</option><option value="CASA">Casa</option>
          </select>
        </Fila>
      </Grupo>
      {ordenados.length === 0 ? <p className="t-cuerpo tenue">Sin series registradas.</p> : (
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
      {(() => { const r = promedioSemanal(datos.peso, ahora); return r.promedio !== null ? (
        <div className="columna" style={{ gap: 4 }}>
          <div><span className="t-cifra">{r.promedio}</span><span className="t-unidad tenue"> kg, promedio de 7 días</span></div>
          <p className="t-nota tenue">{r.cambio !== null ? `${r.cambio > 0 ? '+' : ''}${r.cambio} kg contra la semana anterior` : 'Todavía sin semana anterior para comparar'}{r.hoy !== null ? `. Hoy: ${r.hoy} kg` : ''}</p>
        </div>
      ) : null })()}
      <p className="t-cuerpo tenue">{toca ? 'Hoy toca pesarte, en ayunas.' : estaSemana ? 'Ya te pesaste esta semana. Puedes pesarte diario; se promedia.' : `Cada ${DIAS_NOMBRE[datos.settings.diaPesaje]}, en ayunas. Diario también sirve; se promedia.`}</p>
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

function CinturaHoja({ datos, ahora, abierta, onCerrar }: { datos: Datos; ahora: Date; abierta: boolean; onCerrar: () => void }) {
  const [cm, setCm] = useState('')
  const lunes = ahora.getDay() === 1
  const ultimo = datos.cintura[datos.cintura.length - 1]
  async function guardar() {
    const v = parseFloat(cm.replace(',', '.'))
    if (Number.isNaN(v) || v <= 0) return
    await datos.guardarCintura({ fecha: claveFecha(ahora), cm: Math.round(v * 10) / 10 })
    haptico.serieHecha()
    setCm('')
  }
  return (
    <Hoja abierta={abierta} altura="completa" titulo="Cintura" onCerrar={onCerrar}>
      <p className="t-cuerpo tenue">{lunes ? 'Hoy es lunes: mide la cintura a la altura del ombligo, sin apretar.' : 'Cada lunes, a la altura del ombligo, sin apretar.'}</p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <input inputMode="decimal" placeholder="cm" value={cm} onChange={(e) => setCm(e.target.value)} aria-label="Cintura en centímetros" className="t-cifra" style={{ width: 140, textAlign: 'left', borderBottom: '2px solid var(--separador)' }} />
        <BotonTexto onClick={guardar}>Guardar</BotonTexto>
      </div>
      {datos.cintura.length > 0 && <Linea puntos={datos.cintura.slice(-12).map((c) => ({ etiqueta: fechaCorta(c.fecha), valor: c.cm }))} unidad="cm" />}
      {ultimo && <Grupo>{[...datos.cintura].reverse().slice(0, 8).map((c) => <Fila key={c.fecha} texto={fechaCorta(c.fecha)} dato={`${c.cm} cm`} onClick={() => confirm(`¿Borrar la cintura del ${fechaCorta(c.fecha)}?`) && datos.borrarCintura(c.fecha)} />)}</Grupo>}
    </Hoja>
  )
}
