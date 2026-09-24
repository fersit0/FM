import { useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import type { Sesion } from '../data/tipos'
import { useTemp } from '../design/temperatura'
import { semanasHistorial, tocaPesarse, tocaFoto, type SemanaHistorial } from '../logic/progreso'
import { claveFecha, fechaCorta, DIAS_NOMBRE, desdeClave, sumarDias, inicioSemana } from '../logic/fechas'
import { buscarCualquiera, ejerciciosDe } from '../data/ejercicios'
import { Grupo, Fila, Hoja, BotonSecundario } from '../components/fm'
import { Linea } from '../components/Linea'
import { haptico } from '../lib/haptics'

/** 7.6 Historial: semanas con puntos, sesiones y series. Sin texto de culpa. */
export function Historial({ datos, ahora }: { datos: Datos; ahora: Date }) {
  useTemp('reposo')
  const semanas = useMemo(() => semanasHistorial(datos.sesiones, ahora, 12).reverse(), [datos.sesiones, ahora])
  const delMes = datos.sesiones.filter((s) => s.terminada && new Date(s.inicio).getMonth() === ahora.getMonth() && new Date(s.inicio).getFullYear() === ahora.getFullYear()).length
  const [semana, setSemana] = useState<SemanaHistorial | null>(null)
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [peso, setPeso] = useState(false)
  const [fotos, setFotos] = useState(false)
  const hayAlgo = datos.sesiones.some((s) => s.terminada)
  const mes = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][ahora.getMonth()]

  return (
    <div className="fm-pantalla fm-con-barra">
      <header className="fm-cabecera"><h1 className="titulo-grande">Historial</h1></header>
      <div className="fm-columna" style={{ gap: 4 }}>
        <span className="cifra-media">{delMes}</span>
        <span className="nota">{delMes === 1 ? 'sesión' : 'sesiones'} en {mes}</span>
      </div>

      {!hayAlgo ? (
        <p className="cuerpo tenue">Todavía no hay señal. La primera sesión la enciende.</p>
      ) : (
        <Grupo titulo="Semanas">
          {semanas.map((w) => {
            const ini = desdeClave(w.inicio)
            const fin = sumarDias(ini, 6)
            const dias = Array.from({ length: 7 }, (_, i) => claveFecha(sumarDias(ini, i)))
            return (
              <Fila key={w.inicio} texto={`${ini.getDate()} al ${fechaCorta(claveFecha(fin))}`} onClick={() => setSemana(w)}>
                <span className="fm-puntos-chicos" aria-label={`${w.sesiones.length} de 3`}>
                  {dias.map((d) => <i key={d} className={w.sesiones.some((s) => s.fecha === d) ? 'hecho' : ''} />)}
                </span>
              </Fila>
            )
          })}
        </Grupo>
      )}

      <Grupo titulo="Cuerpo">
        <Fila texto="Peso corporal" dato={datos.peso.length ? `${datos.peso[datos.peso.length - 1].kg} kg` : 'Sin registro'} onClick={() => setPeso(true)} />
        <Fila texto="Fotos" dato={datos.fotos.length ? `${datos.fotos.length}` : 'Ninguna'} onClick={() => setFotos(true)} />
      </Grupo>

      <Hoja abierta={semana !== null} titulo={semana ? `Semana del ${fechaCorta(semana.inicio)}` : ''} onCerrar={() => setSemana(null)}>
        {semana && (
          semana.sesiones.length === 0 ? <p className="cuerpo tenue">Sin sesiones esa semana.</p> : (
            <Grupo>
              {semana.sesiones.map((s) => (
                <Fila
                  key={s.id}
                  texto={`${DIAS_NOMBRE[desdeClave(s.fecha).getDay()]} ${desdeClave(s.fecha).getDate()}, ${s.tipo === 'FRIDA' ? 'lunes con Frida' : `${s.tipo} ${s.ligera ? 'ligera' : s.version}`}`}
                  dato={s.fin ? `${Math.max(1, Math.round((s.fin - s.inicio) / 60000))} min` : ''}
                  onClick={s.tipo === 'FRIDA' ? undefined : () => setSesion(s)}
                />
              ))}
            </Grupo>
          )
        )}
      </Hoja>

      <Hoja abierta={sesion !== null} altura="completa" titulo={sesion ? `${sesion.tipo}, ${fechaCorta(sesion.fecha)}` : ''} onCerrar={() => setSesion(null)}>
        {sesion && <DetalleSesion datos={datos} sesion={sesion} />}
      </Hoja>

      <PesoHoja datos={datos} ahora={ahora} abierta={peso} onCerrar={() => setPeso(false)} />
      <FotosHoja datos={datos} ahora={ahora} abierta={fotos} onCerrar={() => setFotos(false)} />
    </div>
  )
}

function DetalleSesion({ datos, sesion }: { datos: Datos; sesion: Sesion }) {
  const propios = datos.sets.filter((s) => s.sessionId === sesion.id)
  const orden = ejerciciosDe(sesion.tipo as 'A' | 'B').map((e) => e.id)
  const ids = [...new Set(propios.map((s) => s.exerciseId))].sort((a, b) => orden.indexOf(a.split('-')[0]) - orden.indexOf(b.split('-')[0]))
  if (ids.length === 0) return <p className="cuerpo tenue">Sin series registradas.</p>
  return (
    <Grupo>
      {ids.map((id) => {
        const sets = propios.filter((s) => s.exerciseId === id).sort((a, b) => a.numSerie - b.numSerie)
        const item = buscarCualquiera(id)?.item
        const peso = sets[0].pesoKg
        const reps = sets.map((s) => s.reps).join(', ')
        return <Fila key={id} texto={item?.nombre ?? id} dato={peso != null ? `${peso} kg × ${reps}` : `× ${reps}`} />
      })}
    </Grupo>
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
      <p className="subtexto">{toca ? 'Hoy toca pesarte, en ayunas.' : estaSemana ? 'Ya te pesaste esta semana.' : `Cada ${DIAS_NOMBRE[datos.settings.diaPesaje]}, en ayunas.`}</p>
      <div className="fm-secundarios" style={{ justifyContent: 'flex-start', gap: 12, margin: 0 }}>
        <input inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} aria-label="Peso corporal en kilos" style={{ maxWidth: 120 }} />
        <BotonSecundario onClick={guardar}>Guardar</BotonSecundario>
      </div>
      {datos.peso.length > 0 && <Linea puntos={datos.peso.slice(-12).map((p) => ({ etiqueta: fechaCorta(p.fecha), valor: p.kg }))} />}
      {datos.peso.length > 0 && (
        <Grupo>
          {[...datos.peso].reverse().slice(0, 8).map((p) => (
            <Fila key={p.fecha} texto={fechaCorta(p.fecha)} dato={`${p.kg} kg`} onClick={() => confirm(`¿Borrar el peso del ${fechaCorta(p.fecha)}?`) && datos.borrarPeso(p.fecha)} />
          ))}
        </Grupo>
      )}
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
    return () => {
      for (const u of Object.values(nuevas)) URL.revokeObjectURL(u)
    }
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
      <p className="subtexto">{toca ? 'Toca foto. Misma ropa, de frente.' : `Siguiente en ${14 - (dias ?? 0)} días. Misma ropa, de frente.`}</p>
      <label className="fm-secundario" style={{ alignSelf: 'flex-start' }}>
        Tomar o elegir foto
        <input type="file" accept="image/*" onChange={subir} className="oculto-visual" />
      </label>
      {datos.fotos.length > 0 && (
        <div className="fm-fotos-grid">
          {[...datos.fotos].reverse().map((f) => (
            <figure key={f.fecha}>
              {urls[f.fecha] && <img src={urls[f.fecha]} alt={`Foto del ${f.fecha}`} />}
              <figcaption>
                <span className="nota">{fechaCorta(f.fecha)}</span>
                <BotonSecundario onClick={() => confirm('¿Borrar esta foto?') && datos.borrarFoto(f.fecha)}>Borrar</BotonSecundario>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Hoja>
  )
}
