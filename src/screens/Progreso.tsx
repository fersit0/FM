import { useEffect, useMemo, useState } from 'react'
import type { Datos } from '../hooks/useDatos'
import { useTemperatura } from '../hooks/useTemperatura'
import { estadoSemana } from '../logic/semana'
import { semanasHistorial, tocaPesarse, tocaFoto, pesoPorSemana } from '../logic/progreso'
import { maximosPorSesion } from '../logic/progresion'
import { claveFecha, fechaCorta, DIAS_NOMBRE } from '../logic/fechas'
import { EJERCICIOS } from '../data/ejercicios'
import { Semana } from '../components/Semana'
import { Trafico } from '../components/Trafico'
import { GraficaLineas, type Serie } from '../components/Grafica'
import { vibrar } from '../logic/senales'

type Vista = 'semanas' | 'ejercicios' | 'peso' | 'fotos'

export function Progreso({ datos, ahora }: { datos: Datos; ahora: Date }) {
  useTemperatura('reposo')
  const [vista, setVista] = useState<Vista>('semanas')
  const semana = useMemo(() => estadoSemana(datos.sesiones, ahora), [datos.sesiones, ahora])
  const historial = useMemo(() => semanasHistorial(datos.sesiones, ahora, 12), [datos.sesiones, ahora])
  const cumplidas = historial.filter((w) => w.cumplida && !w.actual).length

  return (
    <div className="pantalla">
      <h1 className="titulo">Progreso</h1>
      <div className="segmentos">
        {(['semanas', 'ejercicios', 'peso', 'fotos'] as Vista[]).map((v) => (
          <button key={v} className={`segmento ${vista === v ? 'activo' : ''}`} onClick={() => setVista(v)}>
            {v === 'semanas' ? 'Semanas' : v === 'ejercicios' ? 'Ejercicios' : v === 'peso' ? 'Peso' : 'Fotos'}
          </button>
        ))}
      </div>

      {vista === 'semanas' && (
        <>
          <section className="modulo">
            <Semana estado={semana} hoy={ahora} />
          </section>
          <section className="modulo-marco columna">
            <div className="fila-entre">
              <span className="etiqueta">Últimas 12 semanas</span>
              <span className="etiqueta">{cumplidas} cumplidas</span>
            </div>
            <Trafico semanas={historial} />
            <div className="leyenda">
              <span><i className="luz luz-naranja" /> completa</span>
              <span><i className="luz luz-ambar" /> corta</span>
              <span><i className="luz luz-pico" /> bonus</span>
              <span><i className="luz luz-olivo" /> Frida</span>
            </div>
          </section>
        </>
      )}

      {vista === 'ejercicios' && <Ejercicios datos={datos} />}
      {vista === 'peso' && <PesoCorporal datos={datos} ahora={ahora} />}
      {vista === 'fotos' && <Fotos datos={datos} ahora={ahora} />}
    </div>
  )
}

function Ejercicios({ datos }: { datos: Datos }) {
  const [id, setId] = useState('A1')
  const e = EJERCICIOS.find((x) => x.id === id)!
  const series = useMemo<Serie[]>(() => {
    const principal = maximosPorSesion(datos.sets, e.id, 12)
    const out: Serie[] = [{ nombre: e.nombre, puntos: principal.map((m) => ({ etiqueta: fechaCorta(m.fecha), valor: m.peso })) }]
    for (const a of e.alternativas) {
      if (a.modo !== 'peso') continue
      const m = maximosPorSesion(datos.sets, a.id, 12)
      if (m.length) out.push({ nombre: a.nombre, puntos: m.map((x) => ({ etiqueta: fechaCorta(x.fecha), valor: x.peso })), clase: 'alterna' })
    }
    return out
  }, [datos.sets, e])
  const ultimos = maximosPorSesion(datos.sets, e.id, 12)

  return (
    <>
      <div className="chips">
        {EJERCICIOS.map((x) => (
          <button key={x.id} className={`chip ${x.id === id ? 'activo' : ''}`} onClick={() => setId(x.id)}>{x.id}</button>
        ))}
      </div>
      <section className="modulo-marco columna">
        <span className="etiqueta">{e.nombre}</span>
        {e.modo === 'peso' ? (
          <>
            <GraficaLineas series={series} />
            {series.length > 1 && (
              <div className="leyenda">
                <span><i className="luz luz-naranja" /> {e.id}</span>
                {series.slice(1).map((s) => <span key={s.nombre}><i className="luz luz-teal" /> {s.nombre}</span>)}
              </div>
            )}
          </>
        ) : (
          <p className="texto-3">Sin peso: se registra {e.modo === 'tiempo' ? 'tiempo' : 'reps'}.</p>
        )}
        {ultimos.length > 0 && (
          <div className="columna progreso-lista">
            {[...ultimos].reverse().slice(0, 6).map((m) => (
              <div key={m.fecha} className="fila-entre texto-2">
                <span>{fechaCorta(m.fecha)}</span>
                <span className="numero">{e.modo === 'peso' ? `${m.peso} kg · ` : ''}{m.reps} {e.modo === 'tiempo' ? 's' : 'reps'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function PesoCorporal({ datos, ahora }: { datos: Datos; ahora: Date }) {
  const [kg, setKg] = useState('')
  const [fecha, setFecha] = useState(() => claveFecha(ahora))
  const toca = tocaPesarse(datos.peso, ahora, datos.settings.diaPesaje)
  const porSemana = pesoPorSemana(datos.peso, ahora, 12)
  const serie: Serie[] = [{ nombre: 'Peso', puntos: porSemana.map((p) => ({ etiqueta: fechaCorta(p.inicio), valor: p.kg })) }]

  async function guardar() {
    const v = parseFloat(kg.replace(',', '.'))
    if (Number.isNaN(v) || v <= 0) return
    await datos.guardarPeso({ fecha, kg: Math.round(v * 10) / 10 })
    vibrar(40)
    setKg('')
  }

  return (
    <>
      <section className={`modulo ${toca ? 'modulo-temp' : ''}`}>
        <span className="etiqueta hoy-etiqueta">{toca ? 'Hoy toca pesarte' : `Cada ${DIAS_NOMBRE[datos.settings.diaPesaje]}, en ayunas`}</span>
        <div className="fila">
          <input inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} aria-label="Peso corporal en kilos" className="numero" />
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} aria-label="Fecha" />
        </div>
        <button className="boton boton-chico boton-secundario" onClick={guardar} disabled={!kg}>Guardar</button>
      </section>
      <section className="modulo-marco columna">
        <span className="etiqueta">12 semanas</span>
        <GraficaLineas series={serie} />
        <div className="columna progreso-lista">
          {[...datos.peso].reverse().slice(0, 8).map((p) => (
            <div key={p.fecha} className="fila-entre texto-2">
              <span>{fechaCorta(p.fecha)}</span>
              <span className="fila">
                <span className="numero">{p.kg} kg</span>
                <button className="boton-texto" onClick={() => datos.borrarPeso(p.fecha)} aria-label={`Borrar peso del ${p.fecha}`}>×</button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
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
    vibrar(40)
    e.target.value = ''
  }

  return (
    <>
      <section className={`modulo ${toca ? 'modulo-temp' : ''}`}>
        <span className="etiqueta hoy-etiqueta">
          {toca ? 'Toca foto' : `Siguiente en ${14 - (dias ?? 0)} días`}
        </span>
        <p>{toca ? 'Misma ropa, de frente.' : 'Cada 2 semanas, misma ropa, de frente.'}</p>
        <label className="boton boton-chico boton-secundario fotos-boton">
          Tomar o elegir foto
          <input type="file" accept="image/*" onChange={subir} className="oculto-visual" />
        </label>
      </section>
      {datos.fotos.length === 0 ? (
        <p className="texto-3">Todavía no hay fotos.</p>
      ) : (
        <div className="fotos-grid">
          {[...datos.fotos].reverse().map((f) => (
            <figure key={f.fecha} className="foto">
              {urls[f.fecha] && <img src={urls[f.fecha]} alt={`Foto del ${f.fecha}`} />}
              <figcaption className="fila-entre">
                <span className="etiqueta">{fechaCorta(f.fecha)}</span>
                <button className="boton-texto" onClick={() => confirm('¿Borrar esta foto?') && datos.borrarFoto(f.fecha)} aria-label="Borrar foto">×</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  )
}
