import { useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import { useTemp } from '../design/temperatura'
import { semanasHistorial, tocaPesarse, tocaFoto, pesoPorSemana } from '../logic/progreso'
import { maximosPorSesion } from '../logic/progresion'
import { claveFecha, fechaCorta, DIAS_NOMBRE, inicioSemana } from '../logic/fechas'
import { EJERCICIOS } from '../data/ejercicios'
import { Senal as SenalGrafica } from '../components/Senal'
import { Linea, type Serie } from '../components/Linea'
import { BotonSecundario } from '../components/fm'
import { haptico } from '../lib/haptics'

/** Señal (8.5): historial como tráfico nocturno, y debajo datos simples. */
export function Senal({ datos, ahora }: { datos: Datos; ahora: Date }) {
  useTemp('reposo')
  const historial = useMemo(() => semanasHistorial(datos.sesiones, ahora, 12), [datos.sesiones, ahora])
  const hayAlgo = datos.sesiones.some((s) => s.terminada)
  const mes = ahora.getMonth()
  const delMes = datos.sesiones.filter((s) => s.terminada && new Date(s.inicio).getMonth() === mes && new Date(s.inicio).getFullYear() === ahora.getFullYear()).length
  const semanaActual = historial[historial.length - 1]
  const [ejercicioId, setEjercicioId] = useState('A1')
  const e = EJERCICIOS.find((x) => x.id === ejercicioId)!
  const series = useMemo<Serie[]>(() => {
    const principal = maximosPorSesion(datos.sets, e.id, 12)
    const out: Serie[] = [{ nombre: e.nombre, puntos: principal.map((m) => ({ etiqueta: fechaCorta(m.fecha), valor: e.modo === 'peso' ? m.peso : m.reps })) }]
    for (const a of e.alternativas) {
      if (a.modo !== 'peso') continue
      const m = maximosPorSesion(datos.sets, a.id, 12)
      if (m.length) out.push({ nombre: a.nombre, puntos: m.map((x) => ({ etiqueta: fechaCorta(x.fecha), valor: x.peso })), alterna: true })
    }
    return out
  }, [datos.sets, e])
  const ultimos = maximosPorSesion(datos.sets, e.id, 12)
  const hayEjercicio = ultimos.length > 0

  return (
    <div className="fm-pantalla fm-con-barra">
      <header className="fm-cabecera">
        <h1 className="titulo-fm">Señal</h1>
      </header>

      {!hayAlgo ? (
        <p className="cuerpo" style={{ color: 'var(--crema-2)' }}>Todavía no hay señal. La primera sesión la enciende.</p>
      ) : (
        <>
          <SenalGrafica semanas={historial} />
          <div className="fm-leyenda">
            <span><i style={{ background: 'var(--ambar)' }} />corta</span>
            <span><i style={{ background: 'var(--naranja)' }} />completa</span>
            <span><i style={{ background: 'var(--rojo)' }} />bonus</span>
            <span><i style={{ background: 'var(--olivo)' }} />Frida</span>
          </div>
          <div className="fm-filas">
            <div className="fm-fila-plana"><span className="cuerpo">Sesiones este mes</span><span className="secundario">{delMes}</span></div>
            <div className="fm-fila-plana"><span className="cuerpo">Esta semana</span><span className="secundario">{semanaActual.sesiones.length} de 3</span></div>
            <div className="fm-fila-plana"><span className="cuerpo">Semanas cumplidas de las últimas 12</span><span className="secundario">{historial.filter((w) => w.cumplida).length}</span></div>
          </div>
        </>
      )}

      <div className="fm-filas" style={{ marginTop: 8 }}>
        <span className="etiqueta-fm">Peso por ejercicio</span>
        <div className="fm-chips-scroll">
          {EJERCICIOS.map((x) => (
            <button key={x.id} className={`fm-chip ${x.id === ejercicioId ? 'activo' : ''}`} onClick={() => setEjercicioId(x.id)}>{x.id}</button>
          ))}
        </div>
        <p className="cuerpo">{e.nombre}</p>
        {hayEjercicio ? (
          <>
            <Linea series={series} />
            {series.length > 1 && (
              <div className="fm-leyenda">
                <span><i style={{ background: 'var(--crema)' }} />{e.id}</span>
                {series.slice(1).map((s) => <span key={s.nombre}><i style={{ background: 'var(--crema-3)' }} />{s.nombre}</span>)}
              </div>
            )}
            <div className="fm-filas">
              {[...ultimos].reverse().slice(0, 4).map((m) => (
                <div key={m.fecha} className="fm-fila-plana">
                  <span className="secundario" style={{ color: 'var(--crema-2)' }}>{fechaCorta(m.fecha)}</span>
                  <span className="secundario">{e.modo === 'peso' ? `${m.peso} kg, ` : ''}{m.reps} {e.modo === 'tiempo' ? 's' : 'reps'}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="secundario">Todavía sin registro.</p>
        )}
      </div>

      <PesoCorporal datos={datos} ahora={ahora} />
      <Fotos datos={datos} ahora={ahora} />
    </div>
  )
}

function PesoCorporal({ datos, ahora }: { datos: Datos; ahora: Date }) {
  const [kg, setKg] = useState('')
  const toca = tocaPesarse(datos.peso, ahora, datos.settings.diaPesaje)
  const porSemana = pesoPorSemana(datos.peso, ahora, 12)
  const serie: Serie[] = [{ nombre: 'Peso', puntos: porSemana.map((p) => ({ etiqueta: fechaCorta(p.inicio), valor: p.kg })) }]
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
    <div className="fm-filas" style={{ marginTop: 8 }}>
      <div className="fm-fila-plana">
        <span className="etiqueta-fm">Peso corporal</span>
        <span className="secundario">{ultimo ? `${ultimo.kg} kg, ${fechaCorta(ultimo.fecha)}` : ''}</span>
      </div>
      <p className="cuerpo">{toca ? 'Hoy toca pesarte, en ayunas.' : estaSemana ? 'Ya te pesaste esta semana.' : `Cada ${DIAS_NOMBRE[datos.settings.diaPesaje]}, en ayunas.`}</p>
      <div className="fm-fila">
        <input inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} aria-label="Peso corporal en kilos" style={{ maxWidth: 120 }} />
        <BotonSecundario capsula onClick={guardar}>Guardar</BotonSecundario>
        {ultimo && <BotonSecundario onClick={() => confirm(`¿Borrar el peso del ${fechaCorta(ultimo.fecha)}?`) && datos.borrarPeso(ultimo.fecha)}>Borrar último</BotonSecundario>}
      </div>
      {datos.peso.length > 0 && <Linea series={serie} alto={120} />}
    </div>
  )
}

function Fotos({ datos, ahora }: { datos: Datos; ahora: Date }) {
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
    <div className="fm-filas" style={{ marginTop: 8 }}>
      <span className="etiqueta-fm">Foto</span>
      <p className="cuerpo">{toca ? 'Toca foto. Misma ropa, de frente.' : `Siguiente en ${14 - (dias ?? 0)} días. Misma ropa, de frente.`}</p>
      <label className="fm-secundario capsula fm-boton-archivo">
        Tomar o elegir foto
        <input type="file" accept="image/*" onChange={subir} className="oculto-visual" />
      </label>
      {datos.fotos.length > 0 && (
        <div className="fm-fotos">
          {[...datos.fotos].reverse().map((f) => (
            <figure key={f.fecha} className="fm-foto-corporal">
              {urls[f.fecha] && <img src={urls[f.fecha]} alt={`Foto del ${f.fecha}`} />}
              <figcaption>
                <span className="secundario">{fechaCorta(f.fecha)}</span>
                <BotonSecundario onClick={() => confirm('¿Borrar esta foto?') && datos.borrarFoto(f.fecha)}>Borrar</BotonSecundario>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
